#!/bin/bash

# Get the lambdas folder
COMPILED_LAMBDAS_FOLDER="./build/lambdas/*"
INDEXED_LAMBDAS_FOLDER="./contracts/partials/contractLambdas/*"

# Loop through all the lambda files in the folder
INDEX=0
INDEX_SUFFIX="LambdaIndex.json"
COMPILED_SUFFIX="Lambdas.json"
VARIABLE_FILE="./test/00_lambda_constants.ligo"
rm -rf $VARIABLE_FILE
for INDEX_LAMBDAS_SUBFOLDER in $INDEXED_LAMBDAS_FOLDER; do
    SUBFOLDER="$INDEX_LAMBDAS_SUBFOLDER/*$INDEX_SUFFIX"
    for LAMBDA_INDEX_FILE in $SUBFOLDER; do
        BASENAME=$(basename $LAMBDA_INDEX_FILE)
        CLEANED=$(echo $BASENAME | sed -e "s/$INDEX_SUFFIX$//")
        COMPILED_RELATED_FILED=$(find $COMPILED_LAMBDAS_FOLDER | grep $CLEANED$COMPILED_SUFFIX)

        CONSTANT=$(echo -e "const $(echo $CLEANED)Lambdas: map(string, bytes)  = map[\n")

        for JQ_ROW in $(jq -r .[].index $LAMBDA_INDEX_FILE); do
            
            LAMBDA_NAME=$(jq .[$INDEX].name $LAMBDA_INDEX_FILE)
            LAMBDA_CODE=$(jq .[$INDEX] $COMPILED_RELATED_FILED | tr -d '"')

            CONSTANT=$(echo -e "$CONSTANT\n($LAMBDA_NAME: string) -> (0x$LAMBDA_CODE: bytes);")

            ((INDEX++))
        done

        CONSTANT=$(echo -e  "$CONSTANT\n];\n\n")

        echo $CONSTANT >> $VARIABLE_FILE

        INDEX=0
    done
done