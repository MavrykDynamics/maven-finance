#!/bin/bash

# Get parameters
CONTRACT_FOLDER=$PWD/contracts
CONTRACT_MAIN_FOLDER=$CONTRACT_FOLDER/main
CONTRACT_PARTIALS_FOLDER=$CONTRACT_FOLDER/partials
LIGO_CONTRACTS=$(ls $CONTRACT_MAIN_FOLDER | grep ".ligo")
CONTRACT_COMPILED_FOLDER=$CONTRACT_FOLDER/compiled
CONTRACT_BUILD_FOLDER=$PWD/build
LAMBDA_BUILD_FOLDER=$CONTRACT_BUILD_FOLDER/lambdas
LAMBDA_INDEX_FILE=$CONTRACT_PARTIALS_FOLDER/contractsLambdaIndex.json
LAMBDA_INDEXES=$(cat $LAMBDA_INDEX_FILE)
LIGO_VERSION=latest-mav

# Init arguments
THREADS=5
PROTOCOL=nairobi
COMPILE_CONTRACTS=1
COMPILE_LAMBDAS=1
APPLE_SILICON=
WIPE_ALL=0

# Get all contracts
CONTRACTS_ARRAY=($CONTRACT_MAIN_FOLDER/*.ligo)
CONTRACTS_ARRAY=("${CONTRACTS_ARRAY[@]##*/}")
CONTRACTS_ARRAY=("${CONTRACTS_ARRAY[@]%.ligo}")

# Help message
help () {
    echo "==ARGUMENTS=="
    echo "-c | --contracts      : one or multiple contracts separated by a comma ','"
    echo "-t | --threads        : (optional) number of lambdas compiled in parallel at the same time (default: 5)"
    echo "-p | --protocol       : (optional) tezos protocol used in the compilation (default: kathmandu)"
    echo "-w | --wipe           : (optional) wipe old compiled contracts files"
    echo "-a | --apple-silicon  : (optional) use apple silicon docker images instead"
    echo "--contracts-only      : (optional) when set, only the contracts are compiled, not their lambdas"
    echo "--lambdas-only        : (optional) when set, only the lambdas are compiled, not their contracts"
    exit 1
}

# Parse arguments
# if [ $# -eq 0 ]
# then
#     help
# fi
while [ $# -gt 0 ] ; do
  case $1 in
    -h | --help)
        help
    ;;
    -c | --contracts)
        CONTRACTS=$2
        IFS=',' read -r -a CONTRACTS_ARRAY <<< "$CONTRACTS"
    ;;
    --contracts-only) 
        COMPILE_LAMBDAS=0
        if [ $COMPILE_CONTRACTS -eq 0 ]; then 
            echo "--lambdas-only and --contracts-only cannot be set at the same time"
            exit 1
        fi
    ;;
    --lambdas-only)
        COMPILE_CONTRACTS=0
        if [ $COMPILE_LAMBDAS -eq 0 ]; then 
            echo "--lambdas-only and --contracts-only cannot be set at the same time"
            exit 1
        fi
    ;;
    -t | --threads)
        THREADS=$2
        if [[ -n $THREADS && ! $THREADS =~ ^[0-9]+$ ]]; then 
            echo "THREADS parameter passed to -t must be an integer."
            exit 1
        fi
    ;;
    -p | --protocol) PROTOCOL=$2;;
    -w | --wipe) WIPE_ALL=1;;
    -a | --apple-silicon) APPLE_SILICON=--platform=linux/amd64;;
  esac
  shift
done

# Compile lambda function
compile_single_lambda () {

    BYTES=$(docker run $APPLE_SILICON --rm -v "$PWD":"$PWD" -w "$PWD" mavrykdynamics/ligo:$LIGO_VERSION compile expression pascaligo "Bytes.pack($2)" --michelson-format json --init-file $PWD/contracts/main/$1.ligo --protocol $PROTOCOL --deprecated | jq '.bytes')
    if [ -z $BYTES ]
    then
        compile_single_lambda $1 $2
    else
        echo -e "{ $2: $BYTES }\n" >> $TMP_FILE
    fi
}

# Get lambda names
compile_all_lambdas () {

    # Init params
    CONTRACT=$1

    # Init vars
    PIDS=()
    TIMESTAMP=$(date +"%Y-%m-%d-%H-%M-%S")
    TMP_FILE=./test/tmp/.tmp_${CONTRACT}_lambdas_compiled_${TIMESTAMP}
    COMPILED_FILE=$LAMBDA_BUILD_FOLDER/${CONTRACT}Lambdas.json
    CONTRACT_LAMBDAS=$(echo $LAMBDA_INDEXES | jq ".${CONTRACT}")

    # Check if contract has lambdas to compile
    if [ "$CONTRACT_LAMBDAS" != "null" ]
    then
        # Get last lambda
        LAST_ENTRY=$(echo $CONTRACT_LAMBDAS | jq -r '.[-1]')

        # Create empty temp file
        touch $TMP_FILE

        # Compile all lambdas
        for LAMBDA_NAME in $(echo $CONTRACT_LAMBDAS | jq -r '.[]')
        do
            compile_single_lambda $CONTRACT $LAMBDA_NAME & PID=$!
            PIDS=( "${PIDS[@]}" "$PID")
            CURR_LENGTH=${#PIDS[@]}
            echo -e "\t▣ $LAMBDA_NAME"

            # Process not all processes at once
            if [[ $CURR_LENGTH -ge $THREADS ]]
            then
                wait "${PIDS[@]}"
                PIDS=()
            fi

            # Final wait for remaining processes
            if [[ $LAMBDA_NAME = $LAST_ENTRY ]]; then
                wait "${PIDS[@]}"
                PIDS=()
            fi
        done

        # Create json file
        echo "{}" | jq '.' > $COMPILED_FILE
        while read l; do
            if [[ ! -z $l ]]; then
                TMP_COMP=$(cat $COMPILED_FILE)
                ENTRY=$(echo $l)
                echo $TMP_COMP | jq ". += $ENTRY" > $COMPILED_FILE
            fi
        done < $TMP_FILE
        rm $TMP_FILE
    else
        echo -e "\t▣ This contract has no lambda"
    fi
}

compile_single_contract () {
    docker run $APPLE_SILICON --rm -v "$PWD":"$PWD" -w "$PWD" mavrykdynamics/ligo:$LIGO_VERSION compile contract $CONTRACT_MAIN_FOLDER/$1.ligo --protocol $PROTOCOL --deprecated > $CONTRACT_COMPILED_FOLDER/$1.tz
    docker run $APPLE_SILICON --rm -v "$PWD":"$PWD" -w "$PWD" mavrykdynamics/ligo:$LIGO_VERSION compile contract $CONTRACT_MAIN_FOLDER/$1.ligo --michelson-format json --protocol $PROTOCOL --deprecated > $PWD/test/tmp/.$1_tmp.json
    jq -n --arg name $1 --slurpfile code $PWD/test/tmp/.$1_tmp.json --arg version $LIGO_VERSION '{ "contractName": $name, "michelson": $code[0], "networks": {}, "compiler": { "name": "ligo", "version": $version }, "networkType": "Tezos" }' > $CONTRACT_BUILD_FOLDER/$1.json
    rm $PWD/test/tmp/.$1_tmp.json
}

compile_all_contracts () {
    # Init vars
    PIDS=()
    LAST_ENTRY=${CONTRACTS_ARRAY[${#CONTRACTS_ARRAY[@]}-1]}

    # Compile contracts
    for CONTRACT_NAME in ${CONTRACTS_ARRAY[@]}
    do
        compile_single_contract $CONTRACT_NAME & PID=$!
        PIDS=( "${PIDS[@]}" "$PID")
        CURR_LENGTH=${#PIDS[@]}
        echo -e "▣ $CONTRACT_NAME"

        # Process not all processes at once
        if [[ $CURR_LENGTH -ge $THREADS ]]
        then
            wait "${PIDS[@]}"
            PIDS=()
        fi

        # Final wait for remaining processes
        if [[ $CONTRACT_NAME = $LAST_ENTRY ]]; then
            wait "${PIDS[@]}"
            PIDS=()
        fi
    done

}

# Exit with ctrl_c
trap ctrl_c INT
ctrl_c() {
    echo "STOP: ${PIDS[@]}"
    kill "${PIDS[@]}"
    rm -rf $TMP_FILE
    exit 1
}

# Print main message & get docker ligo
LIGO_DOCKER_VERSION=$(docker run --rm -v "$PWD":"$PWD" -w "$PWD" mavrykdynamics/ligo:$LIGO_VERSION --version)
echo -e "#############################"
echo -e "# CONTRACT COMPILER SCRIPT"
echo -e "# ligo version: $LIGO_DOCKER_VERSION"
echo -e "# threads: $THREADS"
echo -e "# protocol: $PROTOCOL"
if [ ! -z $APPLE_SILICON ]
then 
    echo -e "# running Apple Silicon docker images"
fi
if [ $COMPILE_LAMBDAS -eq 0 ]
then 
    echo -e "# compiling contracts only"
fi
if [ $COMPILE_CONTRACTS -eq 0 ]
then 
    echo -e "# compiling lambdas only"
fi
if [ $WIPE_ALL -eq 1 ]
then 
    echo -e "# wiping old compiled files"
    rm -rf $CONTRACT_COMPILED_FOLDER/*.tz
    rm -rf $CONTRACT_BUILD_FOLDER/*.json
    rm -rf $LAMBDA_BUILD_FOLDER/*.json
fi
echo -e "#############################\n"

# Compile contracts
if [ $COMPILE_CONTRACTS -eq 1 ]
then
    echo "Compiling contracts"
    compile_all_contracts ${CONTRACTS_ARRAY[@]}
    echo ""
fi

# Compile lambdas
if [ $COMPILE_LAMBDAS -eq 1 ]
then 
    echo -e "Compiling contracts lambdas"
    for CONTRACT in ${CONTRACTS_ARRAY[@]}
    do
        echo "▣ $CONTRACT"
        compile_all_lambdas $CONTRACT
    done
    echo ""
fi
