#!/bin/bash

CONTRACTS_TEST_ARRAY=()
COMMANDS=()

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
        IFS=',' read -r -a CONTRACTS_TEST_ARRAY <<< "$CONTRACTS"
    ;;
  esac
  shift
done

if [ ${#CONTRACTS_TEST_ARRAY[@]} -eq 0 ]
then
    echo "Error: You must specify at least one contract to test."
    echo "Use -h or --help to display usage."
    exit 1
fi

for contract_test in "${CONTRACTS_TEST_ARRAY[@]}"; do
    case "$contract_test" in
        dev)
            echo "Running tests for dev"
            COMMANDS+=("yarn ts-mocha --paths test/01_test_mvk_token.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/02_test_mavryk_fa12_tokens.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/03_test_mavryk_fa2_tokens.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/04_test_doorman.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/05_test_delegation.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/07_test_governance.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/08_test_council.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/09_test_emergency_governance.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/10_test_break_glass.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/11_test_farm.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/12_test_farm_factory.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/13_test_treasury.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/14_test_treasury_factory.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/15_test_aggregator.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/16_test_aggregator_factory.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/17_setup_aggregators.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/18_test_governance_financial.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/19_test_governance_satellite.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/17_setup_aggregators.spec.ts --bail --timeout 9000000 --exit")
            # -----
            # Lending Controller Tests
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/21_test_lending_controller.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/22_test_lending_controller_pause.spec.ts --bail --timeout 9000000 --exit")
            # Deploy Lending Controller Mock Time 
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000 --exit")
            # Lending Controller Mock Time Tests
            COMMANDS+=("yarn ts-mocha --paths test/23_test_lending_controller_mock_time_month.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/24_test_lending_controller_mock_time_year.spec.ts --bail --timeout 9000000 --exit")
            # Redeploy Lending Controller Mock Time to reset loans and interests
            COMMANDS+=("yarn ts-mocha --paths test/deploy/20_deploy_lending_controller_mock_time.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000 --exit")
            # Lending Controller Mock Time Liquidation Tests
            COMMANDS+=("yarn ts-mocha --paths test/25_test_lending_controller_mock_time_liquidation.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/26_test_mToken.spec.ts --bail --timeout 9000000 --exit")
            # -----
            COMMANDS+=("yarn ts-mocha --paths test/27_test_vault.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/28_test_farm_mToken.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/29_test_mFarm_factory.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/30_test_mistaken_transfers.spec.ts --bail --timeout 9000000 --exit")
            ;;
        delegationTest)
            echo "Running tests for delegation"
            COMMANDS+=("yarn ts-mocha --paths test/04_test_doorman.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/05_test_delegation.spec.ts --bail --timeout 9000000 --exit")
            ;;
        delegationDistributeRewards)
            echo "Running tests for delegation"
            # COMMANDS+=("yarn ts-mocha --paths test/04_test_doorman.spec.ts --bail --timeout 9000000 --exit")
            # COMMANDS+=("yarn ts-mocha --paths test/05_test_delegation.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/36_test_delegation_distribute_rewards.spec.ts --bail --timeout 9000000 --exit")
            ;;
        governanceTests)
            echo "Running tests for governance"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/07_test_governance.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/18_test_governance_financial.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/19_test_governance_satellite.spec.ts --bail --timeout 9000000 --exit")
            ;;
        dev2)
            echo "Running tests for governanceFinancial"
            COMMANDS+=("yarn ts-mocha --paths test/13_test_treasury.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/17_setup_aggregators.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/18_test_governance_financial.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/19_test_governance_satellite.spec.ts --bail --timeout 9000000 --exit")
            ;;
        governanceFinancial)
            echo "Running tests for governanceFinancial"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/18_test_governance_financial.spec.ts --bail --timeout 9000000 --exit")
            ;;
        governanceSatellite)
            echo "Running tests for governanceSatellite"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/17_setup_aggregators.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/19_test_governance_satellite.spec.ts --bail --timeout 9000000 --exit")
            ;;
        governanceQuorum)
            echo "Running tests for governanceQuorum"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/07_test_governance.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/20_test_governance_quorum.spec.ts --bail --timeout 9000000 --exit")
            ;;
        satelliteSetup)
            echo "Setup satellite"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            ;;
        mvkToken)
            echo "Running tests for mvkToken"
            COMMANDS+=("yarn ts-mocha --paths test/01_test_mvk_token.spec.ts --bail --timeout 9000000 --exit")
            ;;
        mavrykTokens)
            echo "Running tests for mavrykTokens"
            COMMANDS+=("yarn ts-mocha --paths test/03_test_mavryk_fa2_tokens.spec.ts --bail --timeout 9000000 --exit")
            ;;
        doorman)
            echo "Running tests for doorman"
            COMMANDS+=("yarn ts-mocha --paths test/04_test_doorman.spec.ts --bail --timeout 9000000 --exit")
            ;;
        delegation)
            echo "Running tests for delegation"
            COMMANDS+=("yarn ts-mocha --paths test/05_test_delegation.spec.ts --bail --timeout 9000000 --exit")
            ;;
        governance)
            echo "Running tests for governance"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/07_test_governance.spec.ts --bail --timeout 9000000 --exit")
            ;;
        council)
            echo "Running tests for council"
            COMMANDS+=("yarn ts-mocha --paths test/08_test_council.spec.ts --bail --timeout 9000000 --exit")
            ;;
        farm)
            echo "Running tests for farm"
            COMMANDS+=("yarn ts-mocha --paths test/11_test_farm.spec.ts --bail --timeout 9000000 --exit")
            ;;
        farmMToken)
            echo "Running tests for farm mToken"
            COMMANDS+=("yarn ts-mocha --paths test/33_test_farm_mToken.spec.ts --bail --timeout 9000000 --exit")
            ;;
        farmFactory)
            echo "Running tests for farmFactory"
            COMMANDS+=("yarn ts-mocha --paths test/12_test_farm_factory.spec.ts --bail --timeout 9000000 --exit")
            ;;
        farmFactoryMToken)
            echo "Running tests for farmFactoryMToken"
            COMMANDS+=("yarn ts-mocha --paths test/29_test_mFarm_factory.spec.ts --bail --timeout 9000000 --exit")
            ;;
        treasury)
            echo "Running tests for treasury"
            COMMANDS+=("yarn ts-mocha --paths test/13_test_treasury.spec.ts --bail --timeout 9000000 --exit")
            ;;
        treasuryFactory)
            echo "Running tests for treasuryFactory"
            COMMANDS+=("yarn ts-mocha --paths test/14_test_treasury_factory.spec.ts --bail --timeout 9000000 --exit")
            ;;
        emergencyGovernance)
            echo "Running tests for emergencyGovernance"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/09_test_emergency_governance.spec.ts --bail --timeout 9000000 --exit")
            ;;
        breakGlass)
            echo "Running tests for breakGlass"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/10_test_break_glass.spec.ts --bail --timeout 9000000 --exit")
            ;;
        governanceProxy)
            echo "Running tests for governanceProxy"
            COMMANDS+=("yarn ts-mocha --paths test/x7_test_governance_proxy.spec.ts --bail --timeout 9000000 --exit")
            ;;
        superAdmin)
            echo "Running tests for superAdmin"
            COMMANDS+=("yarn ts-mocha --paths test/14_test_super_admin.spec.ts --bail --timeout 9000000 --exit")
            ;;
        mistakenTransfers)
            echo "Running tests for mistakenTransfers"
            COMMANDS+=("yarn ts-mocha --paths test/30_test_mistaken_transfers.spec.ts --bail --timeout 9000000 --exit")
            ;;
        governanceQuorum)
            echo "Running tests for governanceQuorum"
            COMMANDS+=("yarn ts-mocha --paths test/20_test_governance_quorum.spec.ts --bail --timeout 9000000 --exit")
            ;;
        aggregator)
            echo "Running tests for aggregator"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/15_test_aggregator.spec.ts --bail --timeout 9000000 --exit")
            ;;
        aggregatorFactory)
            echo "Running tests for aggregatorFactory"
            COMMANDS+=("yarn ts-mocha --paths test/16_test_aggregator_factory.spec.ts --bail --timeout 9000000 --exit")
            ;;
        satelliteStatus)
            echo "Running tests for satelliteStatus"
            COMMANDS+=("yarn ts-mocha --paths test/22_test_satellite_status.spec.ts --bail --timeout 9000000 --exit")
            ;;
        stressTest)
            echo "Running tests for stressTest"
            COMMANDS+=("yarn ts-mocha --paths test/23_test_stress_test.spec.ts --bail --timeout 9000000 --exit")
            ;;
        lendingControllerTest)
            echo "Running tests for lendingController"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/17_setup_aggregators.spec.ts --bail --timeout 9000000 --exit")
            # Lending Controller Tests
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/21_test_lending_controller.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/22_test_lending_controller_pause.spec.ts --bail --timeout 9000000 --exit")
            # Deploy Lending Controller Mock Time 
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000 --exit")
            # Lending Controller Mock Time Tests
            COMMANDS+=("yarn ts-mocha --paths test/23_test_lending_controller_mock_time_month.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/24_test_lending_controller_mock_time_year.spec.ts --bail --timeout 9000000 --exit")
            # Redeploy Lending Controller Mock Time to reset loans and interests
            COMMANDS+=("yarn ts-mocha --paths test/deploy/20_deploy_lending_controller_mock_time.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000 --exit")
            # Lending Controller Mock Time Liquidation Tests
            COMMANDS+=("yarn ts-mocha --paths test/25_test_lending_controller_mock_time_liquidation.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/26_test_mToken.spec.ts --bail --timeout 9000000 --exit")
            ;;
        lendingController)
            echo "Running tests for lendingController"
            COMMANDS+=("yarn ts-mocha --paths test/21_test_lending_controller.spec.ts --bail --timeout 9000000 --exit")
            ;;
        lendingControllerPause)
            echo "Running tests for lendingControllerPause"
            COMMANDS+=("yarn ts-mocha --paths test/22_test_lending_controller_pause.spec.ts --bail --timeout 9000000 --exit")
            ;;
        lendingControllerMockTimeMonth)
            echo "Running tests for lendingControllerMockTime - Month"
            COMMANDS+=("yarn ts-mocha --paths test/23_test_lending_controller_mock_time_month.spec.ts --bail --timeout 9000000 --exit")
            ;;
        lendingControllerMockTimeYear)
            echo "Running tests for lendingControllerMockTime - Year"
            COMMANDS+=("yarn ts-mocha --paths test/24_test_lending_controller_mock_time_year.spec.ts --bail --timeout 9000000 --exit")
            ;;
        lendingControllerMockTimeLiquidation)
            echo "Running tests for lendingControllerMockTime - Liquidation"
            COMMANDS+=("yarn ts-mocha --paths test/06_setup_satellites.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/deploy/21_deploy_lending_controller_supporting_contracts.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/25_test_lending_controller_mock_time_liquidation.spec.ts --bail --timeout 9000000 --exit")
            ;;
        mToken)
            echo "Running tests for mToken"
            COMMANDS+=("yarn ts-mocha --paths test/26_test_mToken.spec.ts --bail --timeout 9000000 --exit")
            ;;
        vault)
            echo "Running tests for vault"
            COMMANDS+=("yarn ts-mocha --paths test/27_test_vault.spec.ts --bail --timeout 9000000 --exit")
            ;;
        mvkFaucet)
            echo "Running tests for mvkFaucet"
            COMMANDS+=("yarn ts-mocha --paths test/35_test_mvk_faucet.spec.ts --bail --timeout 9000000 --exit")
            ;;
        all)
            echo "Running all tests"
            COMMANDS+=("yarn ts-mocha --paths test/01_test_mvk_token.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/02_test_mavryk_fa12_okens.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/03_test_mavryk_fa2_tokens.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/04_test_doorman.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/05_test_delegation.spec.ts --bail --timeout 9000000 --exit")
            
            COMMANDS+=("yarn ts-mocha --paths test/05_test_council.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/06_test_farm.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/06a_test_farm_mToken.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/07_test_farm_factory.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/07a_test_mFarm_factory.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/13_test_treasury.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/09_test_treasury_factory.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/10_test_emergency_governance.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/11_test_break_glass.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/12_test_governance_financial.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/21_test_governance_financial.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/13_test_governance_proxy.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/14_test_super_admin.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/30_test_mistaken_transfers.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/20_test_governance_quorum.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/18_test_aggregator.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/19_test_aggregator_factory.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/22_test_satellite_status.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/23_test_stress_test.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/21_test_lending_controller.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/22_test_lending_controller_pause.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/23_test_lending_controller_mock_time_month.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/24_test_lending_controller_mock_time_year.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/25_test_lending_controller_mock_time_liquidation.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/26_test_mToken.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/27_test_vault.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/34_test_delegation.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/33_test_governance.spec.ts --bail --timeout 9000000 --exit")
            COMMANDS+=("yarn ts-mocha --paths test/35_test_mvk_faucet.spec.ts --bail --timeout 9000000 --exit")
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