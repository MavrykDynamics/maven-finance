#!/bin/bash

CONTRACTS_DEPLOY_ARRAY=()
COMMANDS=()
DEPLOYMENT_FILE=./test/contractDeployments.json

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
        IFS=',' read -r -a CONTRACTS_DEPLOY_ARRAY <<< "$CONTRACTS"
    ;;
  esac
  shift
done

if [ ${#CONTRACTS_DEPLOY_ARRAY[@]} -eq 0 ]
then
    echo "Error: You must specify at least one contract to deploy."
    echo "Use -h or --help to display usage."
    exit 1
fi

if [ ! -f $DEPLOYMENT_FILE ]
then
    echo '{}' > $DEPLOYMENT_FILE
fi

for contract_test in "${CONTRACTS_DEPLOY_ARRAY[@]}"; do
    case "$contract_test" in
        mvkToken)
            echo "Deploying mvkToken"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/00_deploy_mvk.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        mvkFaucet)
            echo "Deploying mvkFaucet"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/24_deploy_faucet.spec.ts --bail --timeout 9000000")
            ;;
        delegationTest)
            echo "Deploying delegationTest"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/00_deploy_mvk.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/02_deploy_doorman.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/03_deploy_delegation.spec.ts --bail --timeout 9000000")
            # COMMANDS+=("yarn ts-mocha --paths test/deploy/17_deploy_governance_satellite.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        councilTest)
        echo "Deploying council"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/05_deploy_vesting.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/09_deploy_council.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        governance)
            echo "Deploying governance"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/01_deploy_governance.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        doorman)
            echo "Deploying doorman"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/02_deploy_doorman.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        delegation)
            echo "Deploying delegation"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/03_deploy_delegation.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        emergencyGovernance)
            echo "Deploying emergencyGovernance"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/01_deploy_governance.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/04_deploy_emergency_governance.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/10_deploy_break_glass.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/12_deploy_treasury.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        vesting)
            echo "Deploying vesting"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/05_deploy_vesting.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        mavrykTokens)
            echo "Deploying mavrykTokens"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/06_deploy_mavryk_tokens.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        farm)
            echo "Deploying farm"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/07_deploy_farm.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        farmMToken)
            echo "Deploying farmMToken"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/22_deploy_farm_mToken.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        farmFactory)
            echo "Deploying farmFactory"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/08_deploy_farm_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        council)
            echo "Deploying council"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/09_deploy_council.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        breakGlass)
            echo "Deploying breakGlass"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/10_deploy_break_glass.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        governanceFinancial)
            echo "Deploying stakingController"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/01_deploy_governance.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/09_deploy_council.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/11_deploy_governance_financial.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        treasury)
            echo "Deploying treasury"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/12_deploy_treasury.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        treasuryFactory)
            echo "Deploying treasuryFactory"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/13_deploy_treasury_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        governanceProxy)
            echo "Deploying governanceProxy"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/14_deploy_governance_proxy.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        aggregator)
            echo "Deploying aggregator"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/15_deploy_aggregator.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        aggregatorFactory)
            echo "Deploying aggregatorFactory"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/16_deploy_aggregator_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        governanceSatellite)
            echo "Deploying governanceSatellite"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/17_deploy_governance_satellite.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        lendingController)
            echo "Deploying lendingController"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/19_deploy_lending_controller.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000")
            COMMANDS+=("MOCK_TIME=false yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        lendingControllerMockTime)
            echo "Deploying lendingControllerMockTime"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/20_deploy_lending_controller_mock_time.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000")
            COMMANDS+=("MOCK_TIME=true yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        vaultFactory)
            echo "Deploying vaultFactory"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/23_deploy_vault_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        oracleSetup)
            echo "Deploying oracleSetup"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x2_oracle_setup.spec.ts --bail --timeout 9000000")
            ;;
        linkContracts)
            echo "Linking contracts"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            ;;
        all)
            echo "Deploy all contracts"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/00_deploy_mvk.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/01_deploy_governance.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/02_deploy_doorman.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/03_deploy_delegation.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/04_deploy_emergency_governance.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/05_deploy_vesting.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/06_deploy_mavryk_tokens.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/07_deploy_farm.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/08_deploy_farm_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/09_deploy_council.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/10_deploy_break_glass.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/11_deploy_governance_financial.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/12_deploy_treasury.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/13_deploy_treasury_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/14_deploy_governance_proxy.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/15_deploy_aggregator.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/16_deploy_aggregator_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/17_deploy_governance_satellite.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/19_deploy_lending_controller.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/22_deploy_farm_mToken.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/23_deploy_vault_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/24_deploy_faucet.spec.ts --bail --timeout 9000000")
            COMMANDS+=("MOCK_TIME=false && yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x2_oracle_setup.spec.ts --bail --timeout 9000000")
            ;;
        allMockTime)
            echo "Deploy all contracts"
            COMMANDS+=("yarn ts-mocha --paths test/deploy/00_deploy_mvk.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/01_deploy_governance.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/02_deploy_doorman.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/03_deploy_delegation.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/04_deploy_emergency_governance.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/05_deploy_vesting.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/06_deploy_mavryk_tokens.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/07_deploy_farm.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/08_deploy_farm_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/09_deploy_council.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/10_deploy_break_glass.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/11_deploy_governance_financial.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/12_deploy_treasury.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/13_deploy_treasury_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/14_deploy_governance_proxy.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/15_deploy_aggregator.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/16_deploy_aggregator_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/17_deploy_governance_satellite.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/20_deploy_lending_controller_mock_time.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/22_deploy_farm_mToken.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/23_deploy_vault_factory.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/24_deploy_faucet.spec.ts --bail --timeout 9000000")
            COMMANDS+=("MOCK_TIME=true && yarn ts-mocha --paths test/deploy/x1_update_linked_contracts.spec.ts --bail --timeout 9000000")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/x2_oracle_setup.spec.ts --bail --timeout 9000000")
            ;;
        *)
            echo "Unknown contract test: $contract_test"
            ;;
    esac
done

for cmd in "${COMMANDS[@]}"; do
    echo "Executing command: $cmd"
    eval $cmd
done