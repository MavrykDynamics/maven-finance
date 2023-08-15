import { MichelsonMap } from "@taquito/taquito";
import assert from "assert";
import { BigNumber } from "bignumber.js";

import { MVK, Utils } from "./helpers/Utils";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory, trudy, ivan, isaac, susie, david, oscar } from "../scripts/sandbox/accounts";
import { aggregatorStorageType } from "../storage/storageTypes/aggregatorStorageType";
import { mockSatelliteData, mockPackedLambdaData } from "./helpers/mockSampleData"
import { createLambdaBytes } from "@mavrykdynamics/create-lambda-bytes"
import { 
    signerFactory, 
    getStorageMapValue,
    fa12Transfer,
    fa2Transfer,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts,
    calcStakedMvkRequiredForActionApproval, 
    calcTotalVotingPower 
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Governance Satellite tests", async () => {
    
    var utils: Utils;
    let tezos

    let user 
    let userSk 

    let admin 
    let adminSk 

    let councilMember
    let councilMemberSk

    let councilMemberOne
    let councilMemberOneSk

    let councilMemberTwo
    let councilMemberTwoSk

    let councilMemberThree
    let councilMemberThreeSk

    let councilMemberFour
    let councilMemberFourSk

    let satellite
    let satelliteOne 
    let satelliteOneSk 

    let satelliteTwo
    let satelliteTwoSk

    let satelliteThree
    let satelliteThreeSk

    let satelliteFour 
    let satelliteFourSk

    let satelliteFive
    let satelliteFiveSk

    let suspendedSatellite
    let suspendedSatelliteSk
    
    let bannedSatellite
    let bannedSatelliteSk

    let delegateOne 
    let delegateOneSk

    let delegateTwo
    let delegateTwoSk

    let delegateThree
    let delegateThreeSk

    let delegateFour
    let delegateFourSk

    let currentCycleInfoRound
    let currentCycleInfoRoundString

    let doormanAddress 
    let governanceSatelliteAddress
    let aggregatorFactoryAddress
    let tokenId = 0
    
    let currentCycle
    let delegationRatio
    let approvalPercentage
    let proposalSubmissionFeeMutez
    let governanceSatellitePercentageDecimals

    let doormanInstance
    let delegationInstance
    let mvkTokenInstance
    let mavrykFa2TokenInstance
    let councilInstance
    let governanceInstance
    let governanceSatelliteInstance
    let governanceFinancialInstance
    let governanceProxyInstance
    let aggregatorInstance
    let aggregatorFactoryInstance
    
    let doormanStorage
    let delegationStorage
    let mvkTokenStorage
    let mavrykFa2TokenStorage
    let councilStorage
    let governanceStorage
    let governanceSatelliteStorage
    let governanceFinancialStorage
    let governanceProxyStorage
    let aggregatorStorage
    let aggregatorFactoryStorage

    let updateOperatorsOperation 
    let transferOperation
    let createGovernanceSatelliteActionOperation
    let dropActionOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let updateConfigOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue

    before("setup", async () => {
        try{
            
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos

            admin   = bob.pkh;
            adminSk = bob.sk;

            doormanAddress                  = contractDeployments.doorman.address;
            governanceSatelliteAddress      = contractDeployments.governanceSatellite.address;
            aggregatorFactoryAddress        = contractDeployments.aggregatorFactory.address;
            
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
            delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
            governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(governanceSatelliteAddress);
            governanceFinancialInstance     = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
            aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress);
            mavrykFa2TokenInstance          = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            councilStorage                  = await councilInstance.storage();
            governanceStorage               = await governanceInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            governanceProxyStorage          = await governanceProxyInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();

            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

            // -----------------------------------------------
            //
            // Council Members
            //
            // -----------------------------------------------

            councilMemberOne        = eve.pkh;
            councilMemberOneSk      = eve.sk;

            councilMemberTwo        = trudy.pkh;
            councilMemberTwoSk      = trudy.sk;

            councilMemberThree      = alice.pkh;
            councilMemberThreeSk    = alice.sk;

            councilMemberFour       = susie.pkh;
            councilMemberFourSk     = susie.sk;

            // Initialise variables for financial request calculation
            approvalPercentage                      = governanceSatelliteStorage.config.approvalPercentage;
            governanceSatellitePercentageDecimals   = 4;

            // initialise variables for calculating satellite's total voting power
            delegationRatio = delegationStorage.config.delegationRatio;
            
            // set governance proposal submission fee mutez
            proposalSubmissionFeeMutez = governanceStorage.config.proposalSubmissionFeeMutez;

            // -----------------------------------------------
            //
            // Setup corresponds to 06_setup_satellites:
            //
            //   - satellites: alice, eve, susie, oscar, trudy
            //   - delegates:
            //          eve satellite: david, ivan, isaac
            //          alice satellite: mallory
            //          susie satellite: none
            //          oscar satellite: none
            //          trudy satellite: none
            //    
            // -----------------------------------------------

            // Satellites
            satelliteOne       = eve.pkh;
            satelliteOneSk     = eve.sk;

            satelliteTwo       = alice.pkh;
            satelliteTwoSk     = alice.sk;

            satelliteThree     = trudy.pkh;
            satelliteThreeSk   = trudy.sk;

            satelliteFour      = oscar.pkh;
            satelliteFourSk    = oscar.sk;

            satelliteFive      = susie.pkh;

            // Delegates
            delegateOne        = david.pkh;
            delegateOneSk      = david.sk;

            delegateTwo        = ivan.pkh;
            delegateTwoSk      = ivan.sk;

            delegateThree      = isaac.pkh;
            delegateThreeSk    = isaac.sk;

            delegateFour       = mallory.pkh;
            delegateFourSk     = mallory.sk;

            // ------------------------------------------------------------------
            // Set suspended and banned satellites
            // ------------------------------------------------------------------

            // Satellite Status
            suspendedSatellite      = satelliteFour
            suspendedSatelliteSk    = oscar.sk

            bannedSatellite         = satelliteFive
            bannedSatelliteSk       = susie.sk

            // ----------------------------------------------
            // Governance round configurations
            // ----------------------------------------------

            // set signer to admin
            await signerFactory(tezos, adminSk)

            // -------------------
            // set blocks per round to 0 for first cycle testing
            // -------------------

            const blocksPerRound = 0;

            let updateConfigOperation = await governanceInstance.methods.updateConfig(blocksPerRound, "configBlocksPerProposalRound").send();
            await updateConfigOperation.confirmation();

            updateConfigOperation = await governanceInstance.methods.updateConfig(blocksPerRound, "configBlocksPerVotingRound").send();
            await updateConfigOperation.confirmation();

            updateConfigOperation = await governanceInstance.methods.updateConfig(blocksPerRound, "configBlocksPerTimelockRound").send();
            await updateConfigOperation.confirmation();

            governanceStorage               = await governanceInstance.storage()
            var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
            await startNextRoundOperation.confirmation();
            
            // // ----------------------------------------------
            // // Aggregator Setup
            // // ----------------------------------------------

            // // Setup Oracles
            // await signerFactory(tezos, adminSk);

            // const aggregatorLedger = await governanceSatelliteStorage.aggregatorLedger.get('USD/BTC');
            // if(aggregatorLedger == undefined){

            //     const oracleMap = MichelsonMap.fromLiteral({});

            //     const aggregatorMetadataBase = Buffer.from(
            //         JSON.stringify({
            //             name: 'MAVRYK Aggregator Contract',
            //             icon: 'https://logo.chainbit.xyz/xtz',
            //             version: 'v1.0.0',
            //             authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
            //         }),
            //         'ascii',
            //         ).toString('hex')

            //     // Setup Aggregators
            //     const createAggregatorsBatch = await utils.tezos.wallet
            //     .batch()
            //     .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
            //         'USD/BTC',
            //         true,

            //         oracleMap,

            //         new BigNumber(8),             // decimals
            //         new BigNumber(2),             // alphaPercentPerThousand

            //         new BigNumber(60),            // percentOracleThreshold
            //         new BigNumber(30),            // heartbeatSeconds

            //         new BigNumber(10000000),      // rewardAmountStakedMvk
            //         new BigNumber(1300),          // rewardAmountXtz
                    
            //         aggregatorMetadataBase        // metadata bytes
            //     ))
            //     .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
            //         'USD/XTZ',
            //         true,

            //         oracleMap,

            //         new BigNumber(6),             // decimals
            //         new BigNumber(2),             // alphaPercentPerThousand

            //         new BigNumber(60),            // percentOracleThreshold
            //         new BigNumber(30),            // heartbeatSeconds

            //         new BigNumber(10000000),      // rewardAmountStakedMvk
            //         new BigNumber(1300),          // rewardAmountXtz
                    
            //         aggregatorMetadataBase        // metadata bytes
            //     ))
            //     .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
            //         'USD/DOGE',
            //         true,

            //         oracleMap,

            //         new BigNumber(8),             // decimals
            //         new BigNumber(2),             // alphaPercentPerThousand

            //         new BigNumber(60),            // percentOracleThreshold
            //         new BigNumber(30),            // heartbeatSeconds

            //         new BigNumber(10000000),      // rewardAmountStakedMvk
            //         new BigNumber(1300),          // rewardAmountXtz
                    
            //         aggregatorMetadataBase        // metadata bytes
            //     ))

            //     const createAggregatorsBatchOperation = await createAggregatorsBatch.send()
            //     await createAggregatorsBatchOperation.confirmation()

            // }

            // -------------------
            // generate sample mock proposal data
            // -------------------

            const councilConfigChange     = 1234;
            
            const councilLambdaFunction = await createLambdaBytes(
                tezos.rpc.url,
                contractDeployments.governanceProxy.address,
                
                'updateConfig',
                [
                    contractDeployments.council.address,
                    "council",
                    "ConfigActionExpiryDays",
                    councilConfigChange
                ]
            );

            const setCouncilAdminLambdaFunction = await createLambdaBytes(
                tezos.rpc.url,             
                contractDeployments.governanceProxy.address,  
                
                'setAdmin',                
                [
                    contractDeployments.council.address,    
                    admin                
                ]
            );

            mockPackedLambdaData.updateCouncilConfig  = councilLambdaFunction;
            mockPackedLambdaData.setCouncilAdmin      = setCouncilAdminLambdaFunction;

        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("Satellite Governance Entrypoints", async () => {

        beforeEach("Set signer to satellite one (eve)", async () => {

            // init storage
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
            delegationStorage              = await delegationInstance.storage();
            governanceStorage              = await governanceInstance.storage();
            mvkTokenStorage                = await mvkTokenInstance.storage()

            satellite = satelliteOne
            await signerFactory(tezos, satelliteOneSk)
        });

        it('%suspendSatellite                   - satellites should be able to vote and approve a governance action to suspend a satellite', async () => {
            try{        

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const currentCycle             = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);
                
                // governance satellite action params
                const satelliteToBeSuspended   = satelliteFour;
                const purpose                  = "Test Suspend Satellite";            
    
                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.suspendSatellite(
                    satelliteToBeSuspended,
                    purpose
                ).send();
                await createGovernanceSatelliteActionOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);
    
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "SUSPEND");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                var satelliteActionCheck = false
                for(const i in satelliteActions){
                    
                    if(satelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck = true;
                    }
                }
                assert.equal(satelliteActionCheck, true)

                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                = await governanceSatelliteInstance.storage();    
                delegationStorage                         = await delegationInstance.storage();     

                const updatedGovernanceAction             = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions             = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});          
                const suspendedSatelliteRecord            = await delegationStorage.satelliteLedger.get(satelliteToBeSuspended);
                
                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);

                satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, false)

                // check that satellite is now suspended
                assert.equal(suspendedSatelliteRecord.status, "SUSPENDED");
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        
        it('%restoreSatellite                   - satellites should be able to vote and approve a governance action to restore a suspended satellite', async () => {
            try{        

                // get initial action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                currentCycle                   = governanceStorage.cycleId;

                const suspendedSatellite           = satelliteFour;
                const suspendedSatelliteRecord     = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                assert.equal(suspendedSatelliteRecord.status, "SUSPENDED");

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);
                
                // governance satellite action params
                const purpose = "Test restore Satellite";            
    
                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.restoreSatellite(
                        suspendedSatellite,
                        purpose
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();
    
                governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
                const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                         = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});
            
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);

                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "RESTORE");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                var satelliteActionCheck = false
                    for(const i in satelliteActions){
                        
                        if(satelliteActions[i].toNumber() == actionId.toNumber()){
                            satelliteActionCheck   = true;
                        }
                    }
                    assert.equal(satelliteActionCheck, true)
    
                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage               = await governanceSatelliteInstance.storage();        
                const updatedGovernanceAction            = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions            = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});

                delegationStorage                        = await delegationInstance.storage();        
                const restoredSatelliteRecord            = await delegationStorage.satelliteLedger.get(suspendedSatellite);

                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);

                var satelliteActionCheck = false
                    for(const i in updatedSatelliteActions){
                        if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                            satelliteActionCheck   = true;
                        }
                    }
                    assert.equal(satelliteActionCheck, false)

                // check that satellite has been restored and is now active
                assert.equal(restoredSatelliteRecord.status, "ACTIVE");
        
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
        
        it('%banSatellite                       - satellites should be able to vote and approve a governance action to ban a satellite', async () => {
            try{        

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                currentCycle                   = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);
                
                // governance satellite action params
                const satelliteToBeBanned      = satelliteFive;
                const purpose                  = "Test Ban Satellite";            
    
                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.banSatellite(
                    satelliteToBeBanned,
                    purpose
                ).send();
                await createGovernanceSatelliteActionOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);

                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "BAN");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                var satelliteActionCheck = false
                    for(const i in satelliteActions){
                        
                        if(satelliteActions[i].toNumber() == actionId.toNumber()){
                            satelliteActionCheck   = true;
                        }
                    }
                    assert.equal(satelliteActionCheck, true)
    
                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                = await governanceSatelliteInstance.storage();    
                delegationStorage                         = await delegationInstance.storage();     

                const updatedGovernanceAction             = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions             = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});          
                const bannedSatelliteRecord               = await delegationStorage.satelliteLedger.get(satelliteToBeBanned);
                
                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);
                
                var satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, false)

                // check that satellite is now banned
                assert.equal(bannedSatelliteRecord.status, "BANNED");
        
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

    
        it('%restoreSatellite                   - satellites should be able to vote and approve a governance action to restore a banned satellite', async () => {
            try{        

                // get initial action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                currentCycle                   = governanceStorage.cycleId;

                const bannedSatellite          = satelliteFive;
                const bannedSatelliteRecord    = await delegationStorage.satelliteLedger.get(bannedSatellite);
                assert.equal(bannedSatelliteRecord.status, "BANNED");

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);

                // governance satellite action params
                const purpose                  = "Test Restore Satellite";            

                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.restoreSatellite(
                    bannedSatellite,
                        purpose
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
                const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                         = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});
            
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);

                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "RESTORE");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                var satelliteActionCheck = false
                    for(const i in satelliteActions){
                        
                        if(satelliteActions[i].toNumber() == actionId.toNumber()){
                            satelliteActionCheck   = true;
                        }
                    }
                    assert.equal(satelliteActionCheck, true)

                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage               = await governanceSatelliteInstance.storage();        
                const updatedGovernanceAction            = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions            = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});

                delegationStorage                        = await delegationInstance.storage();        
                const restoredSatelliteRecord            = await delegationStorage.satelliteLedger.get(bannedSatellite);

                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);
                
                var satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, false)

                // check that satellite is now restored - status set to ACTIVE
                assert.equal(restoredSatelliteRecord.status, "ACTIVE");
                
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%addOracleToAggregator              - satellites should be able to vote and approve a governance action to add an oracle to an aggregator', async () => {
            try{        

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const currentCycle             = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);
                
                // init target satellite
                const targetSatellite          = satelliteFour; // oscar
                const targetSatellitePeerId    = oscar.peerId;
                const targetSatellitePk        = oscar.pk;

                // get aggregator address from pair key
                const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];
                
                // get aggregator contract
                const aggregatorInstance = await utils.tezos.contract.at(usdBtcAggregatorAddress);
                const aggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();

                // check that user is not in aggregator oracleLedger set
                const aggregatorOracles        = await aggregatorStorage.oracleLedger.get(targetSatellite);
                assert.equal(aggregatorOracles,      undefined);

                // get target satellite oracle record
                const targetSatelliteOracleRecord       = await governanceSatelliteStorage.satelliteAggregatorLedger.get(targetSatellite);
                const numberOraclesSubscribedAtStart    = targetSatelliteOracleRecord == undefined ? 0 : targetSatelliteOracleRecord.size;
                
                // governance satellite action params
                const aggregatorAddress        = usdBtcAggregatorAddress;
                const purpose                  = "Test Add Oracle To Aggregator";            

                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                        targetSatellite,
                        aggregatorAddress,
                        purpose
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);

                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                var satelliteActionCheck = false
                for(const i in satelliteActions){
                    
                    if(satelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, true)

                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                = await governanceSatelliteInstance.storage();    

                const updatedGovernanceAction             = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions             = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});          
                
                const updatedTargetSatelliteOracleRecord                = await governanceSatelliteStorage.satelliteAggregatorLedger.get(targetSatellite);
                const usdBtcOracleAggregatorRecord                      = await updatedTargetSatelliteOracleRecord.get(usdBtcAggregatorAddress);

                const updatedAggregatorStorage : aggregatorStorageType  = await aggregatorInstance.storage();
                const updatedAggregatorOracles : any                    = await updatedAggregatorStorage.oracleLedger.get(targetSatellite);

                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);
                
                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);
                
                var satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, false)

                // check that satellite oracle aggregator record is updated
                assert.notEqual(usdBtcOracleAggregatorRecord, undefined);

                // check that target satellite is now added to aggregator oracleLedger Set
                assert.equal(updatedAggregatorOracles.oraclePeerId,     targetSatellitePeerId);
                assert.equal(updatedAggregatorOracles.oraclePublicKey,  targetSatellitePk);
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        
        it('%removeOracleInAggregator           - satellites should be able to vote and approve a governance action to remove an oracle from an aggregator', async () => {
        try{        

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const currentCycle             = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);
                
                // init target satellite
                const targetSatellite          = satelliteFour; // oscar
                const targetSatellitePeerId    = oscar.peerId;
                const targetSatellitePk        = oscar.pk;

                // get aggregator address from pair key
                const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];

                // get aggregator contract
                const aggregatorInstance = await utils.tezos.contract.at(usdBtcAggregatorAddress);
                const aggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();

                // check that target satellite is in aggregator oracleLedger set (from previous test)
                const aggregatorOracles : any                   = await aggregatorStorage.oracleLedger.get(targetSatellite);
                assert.equal(aggregatorOracles.oraclePeerId,    targetSatellitePeerId);
                assert.equal(aggregatorOracles.oraclePublicKey, targetSatellitePk);

                // get target satellite oracle record
                const targetSatelliteOracleRecord           = await governanceSatelliteStorage.satelliteAggregatorLedger.get(targetSatellite);
                const numberOraclesSubscribedAtStart        = targetSatelliteOracleRecord.size;
                
                // governance satellite action params
                const aggregatorAddress        = usdBtcAggregatorAddress;
                const purpose                  = "Test Remove Oracle In Aggregator";            

                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.removeOracleInAggregator(
                    targetSatellite,
                    aggregatorAddress,
                    purpose
                ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);
                
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "REMOVE_ORACLE_IN_AGGREGATOR");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                var satelliteActionCheck = false
                for(const i in satelliteActions){
                    
                    if(satelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, true)

                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                = await governanceSatelliteInstance.storage();    

                const updatedGovernanceAction             = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions             = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});          

                const updatedTargetSatelliteOracleMap             = await governanceSatelliteStorage.satelliteAggregatorLedger.get(targetSatellite);
                const usdBtcOracleAggregatorRecord                = await updatedTargetSatelliteOracleMap.get(aggregatorAddress);

                const updatedAggregatorStorage : aggregatorStorageType  = await aggregatorInstance.storage();
                const updatedAggregatorOracles                          = await updatedAggregatorStorage.oracleLedger.get(targetSatellite);

                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);
                
                var satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, false)

                // check that target satellite oracle aggregator record is updated
                assert.equal(usdBtcOracleAggregatorRecord, undefined);

                // check that target satellite is now removed from aggregator oracleLedger Set
                assert.equal(updatedAggregatorOracles, undefined);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%removeAllSatelliteOracles          - satellites should be able to vote and approve a governance action to remove all oracles/aggregators that satellite is subscribed to', async () => {
            try{        

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const currentCycle             = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);
                
                // init target satellite
                const targetSatellite          = satelliteFour; // oscar
                const targetSatellitePeerId    = oscar.peerId;
                const targetSatellitePk        = oscar.pk;

                // Test flow: add three aggregators to selected satellite, then initiate governance action to remove all satellite oracles 

                // get aggregator address from pair key
                const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];

                // get aggregator address from pair key
                const usdXtzAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[1];

                // get aggregator address from pair key
                const usdDogeAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[2];
                
                // get aggregator contracts
                const usdBtcAggregatorInstance       = await utils.tezos.contract.at(usdBtcAggregatorAddress);
                const usdXtzAggregatorInstance       = await utils.tezos.contract.at(usdXtzAggregatorAddress);
                const usdDogeAggregatorInstance      = await utils.tezos.contract.at(usdDogeAggregatorAddress);
                
                const usdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
                const usdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
                const usdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

                // check that user is not in aggregator oracleLedger set
                const usdBtcAggregatorOracles        = await usdBtcAggregatorStorage.oracleLedger.get(targetSatellite);
                const usdXtzAggregatorOracles        = await usdXtzAggregatorStorage.oracleLedger.get(targetSatellite);
                const usdDogeAggregatorOracles       = await usdDogeAggregatorStorage.oracleLedger.get(targetSatellite);
                
                assert.equal(usdBtcAggregatorOracles,      undefined);
                assert.equal(usdXtzAggregatorOracles,      undefined);
                assert.equal(usdDogeAggregatorOracles,     undefined);

                // --------------------------------------------------------
                // governance satellite action params - add satellite to first aggregator
                // --------------------------------------------------------

                const aggregatorAddress        = usdBtcAggregatorAddress;
                const purpose                  = "Test Add Oracle To Aggregator";            

                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                        targetSatellite,
                        aggregatorAddress,
                        purpose
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);
                
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                var satelliteActionCheck = false
                for(const i in satelliteActions){
                    
                    if(satelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, true)
            
                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                // --------------------------------------------------------
                // governance satellite action params - add satellite to second aggregator
                // --------------------------------------------------------

                // Satellite creates a second governance action to add target oracle to aggregator
                await signerFactory(tezos, satelliteOneSk);
                const secondGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
                const secondActionId                           = secondGovernanceSatelliteStorage.governanceSatelliteCounter;

                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                        targetSatellite,
                        usdXtzAggregatorAddress,
                        purpose
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                const secondGovernanceAction                   = await secondGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(secondActionId);
                
                // check details of governance satellite action
                assert.equal(secondGovernanceAction.initiator,                                 satellite);
                assert.equal(secondGovernanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
                assert.equal(secondGovernanceAction.status,                                    true);
                assert.equal(secondGovernanceAction.executed,                                  false);
                assert.equal(secondGovernanceAction.governancePurpose,                         purpose);
                assert.equal(secondGovernanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(secondGovernanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(secondGovernanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(secondGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(secondGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
            
                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                // --------------------------------------------------------
                // governance satellite action params - add bob to third aggregator
                // --------------------------------------------------------

                // Satellite creates a governance action to add oracle to aggregator
                await signerFactory(tezos, satelliteOneSk);
                const thirdGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
                const thirdActionId                           = thirdGovernanceSatelliteStorage.governanceSatelliteCounter;

                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                        targetSatellite,
                        usdDogeAggregatorAddress,
                        purpose
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                const thirdGovernanceAction                   = await thirdGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(thirdActionId);
                
                // check details of governance satellite action
                assert.equal(thirdGovernanceAction.initiator,                                 satellite);
                assert.equal(thirdGovernanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
                assert.equal(thirdGovernanceAction.status,                                    true);
                assert.equal(thirdGovernanceAction.executed,                                  false);
                assert.equal(thirdGovernanceAction.governancePurpose,                         purpose);
                assert.equal(thirdGovernanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(thirdGovernanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(thirdGovernanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(thirdGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(thirdGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
            
                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                // --------------------------------------------------------
                // governance satellite check storage that bob is now linked to three aggregators
                // --------------------------------------------------------

                // get updated storage
                governanceSatelliteStorage                 = await governanceSatelliteInstance.storage();        
                
                const updatedGovernanceAction             = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions             = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});          

                const updatedTargetSatelliteOracleRecord   = await governanceSatelliteStorage.satelliteAggregatorLedger.get(targetSatellite);

                const usdBtcOracleAggregatorRecord         = await updatedTargetSatelliteOracleRecord.get(usdBtcAggregatorAddress);
                const usdXtzOracleAggregatorRecord         = await updatedTargetSatelliteOracleRecord.get(usdXtzAggregatorAddress);
                const usdDogeOracleAggregatorRecord        = await updatedTargetSatelliteOracleRecord.get(usdDogeAggregatorAddress);

                const updatedUsdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
                const updatedUsdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
                const updatedUsdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

                // check that user is not in aggregator oracleLedger set
                const updatedUsdBtcAggregatorOracles : any        = await updatedUsdBtcAggregatorStorage.oracleLedger.get(targetSatellite);
                const updatedUsdXtzAggregatorOracles : any        = await updatedUsdXtzAggregatorStorage.oracleLedger.get(targetSatellite);
                const updatedUsdDogeAggregatorOracles : any       = await updatedUsdDogeAggregatorStorage.oracleLedger.get(targetSatellite);
                
                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);

                var satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, false)

                // check that target oracle aggregator record is updated
                assert.notEqual(usdBtcOracleAggregatorRecord,  undefined);
                assert.notEqual(usdXtzOracleAggregatorRecord,  undefined);
                assert.notEqual(usdDogeOracleAggregatorRecord, undefined);

                // check that bob is now added to aggregator oracleLedger Set
                assert.equal(updatedUsdBtcAggregatorOracles.oraclePeerId,       targetSatellitePeerId);
                assert.equal(updatedUsdBtcAggregatorOracles.oraclePublicKey,    targetSatellitePk);

                assert.equal(updatedUsdXtzAggregatorOracles.oraclePeerId,       targetSatellitePeerId);
                assert.equal(updatedUsdXtzAggregatorOracles.oraclePublicKey,    targetSatellitePk);

                assert.equal(updatedUsdDogeAggregatorOracles.oraclePeerId,      targetSatellitePeerId);
                assert.equal(updatedUsdDogeAggregatorOracles.oraclePublicKey,   targetSatellitePk);

                // --------------------------------------------------------
                // governance satellite action params - remove all satellite oracles for selected satellite
                // --------------------------------------------------------

                // governance satellite action params
                const purposeRemove = "Test Remove All Satellite Oracles";            

                // Satellite creates a governance action to remove all satellite oracles
                await signerFactory(tezos, satelliteOneSk);
                const fourthGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
                const fourthActionId                           = fourthGovernanceSatelliteStorage.governanceSatelliteCounter;

                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.removeAllSatelliteOracles(
                        targetSatellite,
                        purposeRemove
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                const fourthGovernanceAction                   = await fourthGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(fourthActionId);
                
                // check details of governance satellite action
                assert.equal(fourthGovernanceAction.initiator,                                 satellite);
                assert.equal(fourthGovernanceAction.governanceType,                            "REMOVE_ALL_SATELLITE_ORACLES");
                assert.equal(fourthGovernanceAction.status,                                    true);
                assert.equal(fourthGovernanceAction.executed,                                  false);
                assert.equal(fourthGovernanceAction.governancePurpose,                         purposeRemove);
                assert.equal(fourthGovernanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(fourthGovernanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(fourthGovernanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(fourthGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(fourthGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                // --------------------------------------------------------
                // governance satellite action params - remove all satellite oracles
                // --------------------------------------------------------

                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();        
                const finalUpdatedGovernanceAction              = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

                const finalUpdatedTargetSatelliteOracleRecord   = await governanceSatelliteStorage.satelliteAggregatorLedger.get(targetSatellite);
                const finalUsdBtcOracleAggregatorRecord         = await finalUpdatedTargetSatelliteOracleRecord.get(usdBtcAggregatorAddress);
                const finalUsdXtzOracleAggregatorRecord         = await finalUpdatedTargetSatelliteOracleRecord.get(usdXtzAggregatorAddress);
                const finalUsdDogeOracleAggregatorRecord        = await finalUpdatedTargetSatelliteOracleRecord.get(usdDogeAggregatorAddress);

                const finalUpdatedUsdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
                const finalUpdatedUsdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
                const finalUpdatedUsdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

                // check that user is not in aggregator oracleLedger set
                const finalUpdatedUsdBtcAggregatorOracles        = await finalUpdatedUsdBtcAggregatorStorage.oracleLedger.get(targetSatellite);
                const finalUpdatedUsdXtzAggregatorOracles        = await finalUpdatedUsdXtzAggregatorStorage.oracleLedger.get(targetSatellite);
                const finalUpdatedUsdDogeAggregatorOracles       = await finalUpdatedUsdDogeAggregatorStorage.oracleLedger.get(targetSatellite);
                
                // check that governance action has been executed
                assert.equal(finalUpdatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(finalUpdatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(finalUpdatedGovernanceAction.status,                  true);
                assert.equal(finalUpdatedGovernanceAction.executed,                true);

                // check that target oracle aggregator record is updated
                assert.equal(finalUsdBtcOracleAggregatorRecord,      undefined);
                assert.equal(finalUsdXtzOracleAggregatorRecord,      undefined);
                assert.equal(finalUsdDogeOracleAggregatorRecord,     undefined);

                // check that target satellite is now removed from aggregator oracleLedger Set
                assert.equal(finalUpdatedUsdBtcAggregatorOracles,    undefined);
                assert.equal(finalUpdatedUsdXtzAggregatorOracles,    undefined);
                assert.equal(finalUpdatedUsdDogeAggregatorOracles,   undefined);
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%togglePauseAggregator              - satellites should be able to vote and approve a governance action to update an aggregator status', async () => {
            try{        

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const currentCycle             = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);

                // get aggregator address from pair key
                const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];

                // get aggregator contract
                const aggregatorInstance       = await utils.tezos.contract.at(usdBtcAggregatorAddress);
                aggregatorStorage              = await aggregatorInstance.storage();
                
                assert.equal(aggregatorStorage.breakGlassConfig.updateDataIsPaused, false);
                assert.equal(aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused, false);
                assert.equal(aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused, false);

                // governance satellite action params
                const aggregatorAddress        = usdBtcAggregatorAddress;
                const newStatus                = "pauseAll"
                const purpose                  = "Test Update Aggregator Status";            
    
                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.togglePauseAggregator(
                        aggregatorAddress,
                        purpose,
                        newStatus
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);
    
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "TOGGLE_PAUSE_AGGREGATOR");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                var satelliteActionCheck = false
                for(const i in satelliteActions){
                    if(satelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, true)
    
                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                = await governanceSatelliteInstance.storage();    

                const updatedGovernanceAction             = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions             = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});          

                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);
                
                var satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, false)

                // check that aggregator is now inactive
                aggregatorStorage              = await aggregatorInstance.storage();
                assert.equal(aggregatorStorage.breakGlassConfig.updateDataIsPaused,                 true);
                assert.equal(aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused,          true);
                assert.equal(aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused,    true);
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%fixMistakenTransfer                - satellites should be able to vote and approve a governance action to resolve a mistaken transfer', async () => {
            try{        
    
                // set user to mallory
                user    = mallory.pkh
                userSk  = mallory.sk

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const currentCycle             = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);
                

                // get initial MVK balances
                var contractAccount             = await mvkTokenStorage.ledger.get(aggregatorFactoryAddress)
                var userAccount                 = await mvkTokenStorage.ledger.get(user)
                const initAccountTokenBalance   = contractAccount ? contractAccount.toNumber() : 0;
                const initUserTokenBalance      = userAccount ? userAccount.toNumber() : 0;
                
                // init params
                const tokenAmount               = MVK(20);
                const purpose                   = "Transfer made by mistake to the aggregator factory"
    
                // Mistaken Transfer Operation
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mvkTokenInstance, user, aggregatorFactoryAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // Update storage - check mid values
                mvkTokenStorage                 = await mvkTokenInstance.storage()
                contractAccount                 = await mvkTokenStorage.ledger.get(aggregatorFactoryAddress)
                userAccount                     = await mvkTokenStorage.ledger.get(user)
                
                const midAccountTokenBalance    = contractAccount ? contractAccount.toNumber() : 0;          
                const midUserTokenBalance       = userAccount ? userAccount.toNumber() : 0;
    
                // Mid assertions - check token balances are correct
                assert.equal(midAccountTokenBalance, initAccountTokenBalance + tokenAmount)
                assert.equal(midUserTokenBalance, initUserTokenBalance - tokenAmount)
    
                // create governance satellite action
                await signerFactory(tezos, satelliteOneSk);
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.fixMistakenTransfer(
                        aggregatorFactoryAddress,
                        purpose,
                        [
                            {
                                "to_"    :user,
                                "token"  : {
                                    "fa2" : {
                                        "tokenContractAddress": contractDeployments.mvkToken.address,
                                        "tokenId" : 0
                                    }
                                },
                                "amount" : tokenAmount
                            }
                        ]
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);
    
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "MISTAKEN_TRANSFER_FIX");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                var satelliteActionCheck = false
                for(const i in satelliteActions){
                    if(satelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, true)
    
                // satellites vote and yay governance action
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForGovernanceActiontOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await satelliteVotesForGovernanceActiontOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage                  = await governanceSatelliteInstance.storage();    
                delegationStorage                           = await delegationInstance.storage();     
                mvkTokenStorage                             = await mvkTokenInstance.storage()      

                const updatedGovernanceAction               = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions               = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});          

                // get updated MVK balance
                contractAccount                             = await mvkTokenStorage.ledger.get(aggregatorFactoryAddress)
                userAccount                                 = await mvkTokenStorage.ledger.get(user)
                const endAccountTokenBalance                = contractAccount ? contractAccount.toNumber() : 0;
                const endUserTokenBalance                   = userAccount ? userAccount.toNumber() : 0;
                
                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,   initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,   0);
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);

                var satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, false)
    
                // Final assertions
                assert.equal(endAccountTokenBalance, initAccountTokenBalance)
                assert.equal(endUserTokenBalance, initUserTokenBalance)
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
        
        it('%dropAction                         - satellite (eve) should be able to drop an action she created', async () => {
            try{

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const currentCycle             = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);
                
                // governance satellite action params
                const satelliteToBeSuspended   = satelliteFour;
                const purpose                  = "Test Suspended Satellite";            

                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.suspendSatellite(
                        satelliteToBeSuspended,
                        purpose
                    ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);

                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "SUSPEND");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                var satelliteActionCheck = false
                for(const i in satelliteActions){
                    if(satelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, true)

                // drop previous action
                const dropsActionOperation  = await governanceSatelliteInstance.methods.dropAction(actionId).send();
                await dropsActionOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage                = await governanceSatelliteInstance.storage();    
                delegationStorage                         = await delegationInstance.storage();     

                const updatedGovernanceAction             = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedSatelliteActions             = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});          
                const suspendedSatelliteRecord            = await delegationStorage.satelliteLedger.get(satelliteToBeSuspended);
                
                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that governance action has been dropped and removed from the satellite's actions
                assert.equal(updatedGovernanceAction.status,                  false);
                assert.equal(updatedGovernanceAction.executed,                false);

                var satelliteActionCheck = false
                for(const i in updatedSatelliteActions){
                    if(updatedSatelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }

                assert.equal(satelliteActionCheck, false)
                
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%dropAction                         - satellite (eve) should not be able to drop an action she did not create', async () => {
            try{

                // init action ids and counters
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const currentCycle             = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance          = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord                 = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount   = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                const initialSatelliteTwoStakeRecord            = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo);
                const initialSatelliteTwoStakedBalance          = initialSatelliteTwoStakeRecord === undefined ? 0 : initialSatelliteTwoStakeRecord.balance.toNumber();
                const initialSatelliteTwoRecord                 = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const initialSatelliteTwoTotalDelegatedAmount   = initialSatelliteTwoRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteTwoTotalVotingPower       = calcTotalVotingPower(delegationRatio, initialSatelliteTwoStakedBalance, initialSatelliteTwoTotalDelegatedAmount);

                const initialSatelliteThreeStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteThree);
                const initialSatelliteThreeStakedBalance        = initialSatelliteThreeStakeRecord === undefined ? 0 : initialSatelliteThreeStakeRecord.balance.toNumber();
                const initialSatelliteThreeRecord               = await delegationStorage.satelliteLedger.get(satelliteThree);
                const initialSatelliteThreeTotalDelegatedAmount = initialSatelliteThreeRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteThreeTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteThreeStakedBalance, initialSatelliteThreeTotalDelegatedAmount);

                // governance satellite action params
                const satelliteToBeSuspended   = satelliteFour;
                const purpose                  = "Test Suspended Satellite";            

                // create governance satellite action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.suspendSatellite(
                    satelliteToBeSuspended,
                    purpose
                ).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                // get updated storage
                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const satelliteActions                          = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite});

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, governanceSatellitePercentageDecimals);
    
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 satellite);
                assert.equal(governanceAction.governanceType,                            "SUSPEND");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),          0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),         0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                var satelliteActionCheck = false
                for(const i in satelliteActions){
                    if(satelliteActions[i].toNumber() == actionId.toNumber()){
                        satelliteActionCheck   = true;
                    }
                }
                assert.equal(satelliteActionCheck, true)
                
                // check details of financial request snapshot ledger
                const satelliteOneGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneGovernanceActionSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoGovernanceActionSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeGovernanceActionSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeGovernanceActionSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // other satellite should not be able to drop an action it did not create
                await signerFactory(tezos, satelliteTwoSk);
                await chai.expect(governanceSatelliteInstance.methods.dropAction(actionId).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        
        });  // end %dropAction tests

        it('maxActionsPerSatellite check        - satellite (trudy) should not be able to create too many governance actions', async () => {
            try{

                // Update config maxActionsPerSatellite to 1
                await signerFactory(tezos, adminSk);
                const initialMaxActionsPerSatellite = governanceSatelliteStorage.config.maxActionsPerSatellite.toNumber();
                var updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(1, "configMaxActionsPerSatellite").send()
                await updateConfigOperation.confirmation()

                // init storage
                governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                governanceStorage              = await governanceInstance.storage();
                
                // check that maxActionsPerSatellite has been updated
                assert.equal(governanceSatelliteStorage.config.maxActionsPerSatellite, 1);

                // init action ids and counters
                const currentCycle             = governanceStorage.cycleId;
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const satelliteActionsBegin    = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite})

                // governance satellite action params
                const purpose                  = "Test Purpose";

                // create governance satellite action
                await signerFactory(tezos, satelliteThreeSk);
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.suspendSatellite(satelliteFour, purpose).send();
                await  createGovernanceSatelliteActionOperation.confirmation();

                // satellite exceeds the number of actions it can create this round
                createGovernanceSatelliteActionOperation  = await governanceSatelliteInstance.methods.suspendSatellite(satelliteFive, purpose);
                await chai.expect(createGovernanceSatelliteActionOperation.send()).to.be.eventually.rejected;

                // Drop the action and test creating another one
                dropActionOperation = await governanceSatelliteInstance.methods.dropAction(actionId).send();
                await dropActionOperation.confirmation();

                // Create another action
                createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.suspendSatellite(satelliteFour, purpose).send();
                await createGovernanceSatelliteActionOperation.confirmation();

                // Final values
                governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                const satelliteActionsEnd      = await governanceSatelliteStorage.satelliteActions.get({ 0: currentCycle, 1: satellite})

                // Assertions
                assert.notEqual(satelliteActionsBegin, satelliteActionsEnd);
                assert.equal(satelliteActionsBegin.length <= 1, true);
                assert.equal(satelliteActionsEnd.length == 1, true);

                // reset config maxActionsPerSatellite to initial value
                await signerFactory(tezos, adminSk);
                var updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(initialMaxActionsPerSatellite, "configMaxActionsPerSatellite").send()
                await updateConfigOperation.confirmation()
                
                governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                assert.equal(governanceSatelliteStorage.config.maxActionsPerSatellite.toNumber(), initialMaxActionsPerSatellite);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
    })


    describe("Satellite Status Checks: SUSPENDED", async () => {

        before("Set satellite status", async() => {
        
            await signerFactory(tezos, adminSk)
            var updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(suspendedSatellite, "SUSPENDED").send()
            await updateStatusOperation.confirmation()

            // updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "BANNED").send()
            // await updateStatusOperation.confirmation()

        })

        after("Rest satellite status", async() => {
        
            await signerFactory(tezos, adminSk)
            const updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(suspendedSatellite, "ACTIVE").send()
            await updateStatusOperation.confirmation()

        })

        beforeEach("update storage", async() => {
        
            // init storage
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            governanceFinancialStorage     = await governanceFinancialInstance.storage();
            aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
            delegationStorage              = await delegationInstance.storage();
            governanceStorage              = await governanceInstance.storage();
            mvkTokenStorage                = await mvkTokenInstance.storage()

            await signerFactory(tezos, suspendedSatelliteSk)
        })

        describe("Delegation Contract:", async () => {

            it('%unregisterAsSatellite            - suspended satellite (oscar) should not be able to unregister as a satellite', async () => {
                try{

                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    const unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(suspendedSatellite);
                    await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateSatelliteRecord            - suspended satellite (oscar) should be able to update its satellite record', async () => {
                try{

                    // initial Values
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(initialSatelliteRecord.status, "SUSPENDED");

                    // init values
                    const updatedName           = "Test update name";
                    const updatedDescription    = "Test update description";
                    const updatedImage          = "https://imageTest.url";
                    const updatedWebsite        = "https://websiteTest.url";
                    const updatedFee            = 123;
                    
                    // Operation
                    const updateSatelliteRecordOperation = await delegationInstance.methods.updateSatelliteRecord(
                        updatedName,
                        updatedDescription,
                        updatedImage,
                        updatedWebsite,
                        updatedFee,
                        mockSatelliteData.oscar.oraclePublicKey,
                        mockSatelliteData.oscar.oraclePeerId
                    ).send();
                    await updateSatelliteRecordOperation.confirmation()

                    // Final values
                    delegationStorage                = await delegationInstance.storage()
                    const updatedSatelliteRecord     = await delegationStorage.satelliteLedger.get(suspendedSatellite)

                    // Assertions
                    assert.strictEqual(updatedSatelliteRecord.status,       "SUSPENDED");
                    assert.strictEqual(updatedSatelliteRecord.name,         updatedName);
                    assert.strictEqual(updatedSatelliteRecord.description,  updatedDescription);
                    assert.strictEqual(updatedSatelliteRecord.image,        updatedImage);
                    assert.strictEqual(updatedSatelliteRecord.website,      updatedWebsite);
                    assert.strictEqual(updatedSatelliteRecord.satelliteFee.toNumber(), updatedFee);

                    // Reset satellite record
                    const resetOperation         = await delegationInstance.methods.updateSatelliteRecord(
                        initialSatelliteRecord.name,
                        initialSatelliteRecord.description,
                        initialSatelliteRecord.image,
                        initialSatelliteRecord.website,
                        initialSatelliteRecord.satelliteFee
                    ).send();
                    await resetOperation.confirmation()

                    // Final values
                    delegationStorage                = await delegationInstance.storage()
                    const resetSatelliteRecord       = await delegationStorage.satelliteLedger.get(suspendedSatellite)

                    // Assertions
                    assert.strictEqual(resetSatelliteRecord.status,       "SUSPENDED");
                    assert.strictEqual(resetSatelliteRecord.name,         initialSatelliteRecord.name);
                    assert.strictEqual(resetSatelliteRecord.description,  initialSatelliteRecord.description);
                    assert.strictEqual(resetSatelliteRecord.image,        initialSatelliteRecord.image);
                    assert.strictEqual(resetSatelliteRecord.website,      initialSatelliteRecord.website);
                    assert.strictEqual(resetSatelliteRecord.satelliteFee.toNumber(), initialSatelliteRecord.satelliteFee.toNumber());

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        }) // End Delegation Contract Tests for Suspended Satellite

        describe("Aggregator Contract:", async () => {

            before("Admin initialize the aggregator contract", async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, adminSk)
                    aggregatorStorage   = await aggregatorInstance.storage()
    
                    // Add the latest aggregator if the aggregator contract doesn't have it
                    const existingOracle    = await aggregatorStorage.oracleLedger.get(suspendedSatellite);
                    if(existingOracle===undefined){
                        var addOracleOperation          = await aggregatorInstance.methods.addOracle(
                            suspendedSatellite, 
                            mockSatelliteData.trudy.oraclePublicKey, 
                            mockSatelliteData.trudy.oraclePeerId
                        ).send();
                        await addOracleOperation.confirmation();
                    }
    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('%withdrawRewardXtz                - suspended satellite (oscar) should not be able to withdraw XTZ rewards', async () => {
                try{
                    
                    aggregatorStorage               = await aggregatorInstance.storage()
                    
                    // check satellite is suspended
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const withdrawRewardXtzOperation = aggregatorInstance.methods.withdrawRewardXtz(suspendedSatellite);
                    await chai.expect(withdrawRewardXtzOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('%withdrawRewardStakedMvk          - suspended satellite (oscar) should not be able to withdraw SMVK rewards', async () => {
                try{
                    
                    // Initial Values
                    aggregatorStorage               = await aggregatorInstance.storage()

                    // check satellite is suspended                    
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const withdrawRewardStakedMvkOperation = aggregatorInstance.methods.withdrawRewardStakedMvk(suspendedSatellite);
                    await chai.expect(withdrawRewardStakedMvkOperation.send()).to.be.rejected;
    
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        }) // End Aggregator Contract Tests for Suspended Satellite

        describe("Governance Financial Contract:", async () => {

            before("Create a governance financial request", async () => {
                try{
    
                    // set council member and signer
                    const councilMember = councilMemberOne;
                    await signerFactory(tezos, councilMemberOneSk);
    
                    councilStorage              = await councilInstance.storage();
                    const fromTreasury          = contractDeployments.treasury.address;
                    const purpose               = "For testing purposes";
                    const tokenAmount           = MVK(3);
                    const actionId              = councilStorage.actionCounter;
                    
                    governanceFinancialStorage  = await governanceFinancialInstance.storage();
                    const financialRequestId    = governanceFinancialStorage.financialRequestCounter; 
    
                    // Operation
                    const councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                        fromTreasury,
                        contractDeployments.council.address,
                        tokenAmount,
                        purpose
                    ).send();
                    await councilActionOperation.confirmation();
    
                    // Final values
                    councilStorage              = await councilInstance.storage();
                    var action                  = await councilStorage.councilActionsLedger.get(actionId);
                    var actionSigner            = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                    var dataMap                 = await action.dataMap;
                    const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                    const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                    const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
    
                    // Assertions
                    assert.strictEqual(action.initiator,            councilMember);
                    assert.strictEqual(action.status,               "PENDING");
                    assert.strictEqual(action.actionType,           "requestMint");
                    assert.equal(action.executed,                   false);
                    assert.notStrictEqual(actionSigner,             undefined);
                    assert.equal(action.signersCount,               1);
                    assert.equal(dataMap.get("treasuryAddress"),    packedTreasuryAddress);
                    assert.equal(dataMap.get("purpose"),            packedPurpose);
                    assert.equal(dataMap.get("tokenAmount"),        packedTokenAmount);
    
                    // set signer as council member two
                    await signerFactory(tezos, councilMemberTwoSk)
                    let signActionOperation = await councilInstance.methods.signAction(actionId).send();
                    await signActionOperation.confirmation();
    
                    // set signer as council member three
                    await signerFactory(tezos, councilMemberThreeSk)
                    signActionOperation = await councilInstance.methods.signAction(actionId).send();
                    await signActionOperation.confirmation();
    
                    // Final values
                    councilStorage      = await councilInstance.storage();
                    action              = await councilStorage.councilActionsLedger.get(actionId);
                    actionSigner        = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                    dataMap             = await action.dataMap;
    
                    assert.strictEqual(action.initiator,            councilMember);
                    assert.strictEqual(action.status,               "EXECUTED");
                    assert.strictEqual(action.actionType,           "requestMint");

                    assert.equal(action.executed,                   true);
                    assert.notStrictEqual(actionSigner,             undefined);
                    assert.equal(action.signersCount,               3);

                    assert.equal(dataMap.get("treasuryAddress"),    packedTreasuryAddress);
                    assert.equal(dataMap.get("purpose"),            packedPurpose);
                    assert.equal(dataMap.get("tokenAmount"),        packedTokenAmount);
                    
                    // check that financial governance request now exists
                    governanceFinancialStorage      = await governanceFinancialInstance.storage();
                    const financialRequest          = await governanceFinancialStorage.financialRequestLedger.get(financialRequestId)
                    assert.notStrictEqual(financialRequest, undefined);
    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('%voteForRequest                   - suspended satellite (oscar) should not be able to vote for a financial governance request', async () => {
                try{
    
                    // initial values
                    governanceFinancialStorage  = await governanceFinancialInstance.storage();
                    const requestId             = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;

                    // check that satellite is suspended
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const voteForRequestOperation =  governanceFinancialInstance.methods.voteForRequest(requestId, "nay");
                    await chai.expect(voteForRequestOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        }) // End Governance Financial Contract Tests for Suspended Satellite

        describe("Governance Satellite Contract:", async () => {
        
            it('%suspendSatellite                 - suspended satellite (oscar) should not be able to create an action to suspend a satellite', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    const suspendSatelliteOperation = governanceSatelliteInstance.methods.suspendSatellite(satelliteOne, "Test purpose");
                    await chai.expect(suspendSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%restoreSatellite                 - suspended satellite (oscar) should not be able to create an action to restore a satellite', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    const restoreSatelliteOperation = governanceSatelliteInstance.methods.restoreSatellite(
                        suspendedSatellite,
                        "Test purpose"
                    );
                    await chai.expect(restoreSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%banSatellite                     - suspended satellite (oscar) should not be able to create an action to ban a satellite', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
    
                    // Operation
                    const banSatelliteOperation = governanceSatelliteInstance.methods.banSatellite(satelliteOne, "Test purpose");
                    await chai.expect(banSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%removeAllSatelliteOracles        - suspended satellite (oscar) should not be able to create an action to remove all oracles from a satellite', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    const removeAllSatelliteOraclesOperation = governanceSatelliteInstance.methods.removeAllSatelliteOracles(satelliteOne, "Test purpose");
                    await chai.expect(removeAllSatelliteOraclesOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%addOracleToAggregator            - suspended satellite (oscar) should not be able to create an action to add an oracle to an aggregator', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    const addOracleToAggregatorOperation = governanceSatelliteInstance.methods.addOracleToAggregator(
                        bannedSatellite,
                        contractDeployments.aggregator.address,
                        "Test purpose"
                    );
                    await chai.expect(addOracleToAggregatorOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    

            it('%removeOracleInAggregator         - suspended satellite (oscar) should not be able to create an action to remove an oracle from an aggregator', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    const removeOracleInAggregatorOperation = governanceSatelliteInstance.methods.removeOracleInAggregator(
                        satelliteOne, 
                        contractDeployments.aggregator.address, 
                        "Test purpose"
                    );
                    await chai.expect(removeOracleInAggregatorOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('%togglePauseAggregator            - suspended satellite (oscar) should not be able to create an action to update an aggregator status', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    const togglePauseAggregatorOperation = governanceSatelliteInstance.methods.togglePauseAggregator(
                        contractDeployments.aggregator.address, 
                        "Test purpose", 
                        "pauseAll"
                    );
                    await chai.expect(togglePauseAggregatorOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%fixMistakenTransfer              - suspended satellite (oscar) should not be able to create an action to resolve a mistaken transfer', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // init params
                    const tokenAmount               = MVK(20);
                    const purpose                   = "Transfer made by mistake to the aggregator factory"
                    
                    // Operation
                    createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.fixMistakenTransfer(
                        aggregatorFactoryAddress,
                        purpose,
                        [
                            {
                                "to_"    : suspendedSatellite,
                                "token"  : {
                                    "fa2" : {
                                        "tokenContractAddress": contractDeployments.mvkToken.address,
                                        "tokenId" : 0
                                    }
                                },
                                "amount" : tokenAmount
                            }
                        ]
                    );
                    await chai.expect(createGovernanceSatelliteActionOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%dropAction                       - suspended satellite (oscar) should not be able to drop an action', async () => {
                try{
                    
                    // ------------------------------
                    // Create Sample Action
                    // ------------------------------

                    // remove satellite suspension temporarily to create a new governance satellite action
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(suspendedSatellite, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    // initial values
                    const actionId                  = governanceSatelliteStorage.governanceSatelliteCounter.toNumber();
    
                    // Create sample governance satellite action
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const togglePauseAggregatorOperation = await governanceSatelliteInstance.methods.togglePauseAggregator(
                        contractDeployments.aggregator.address, 
                        "Test purpose", 
                        "pauseAll"
                    ).send()
                    await togglePauseAggregatorOperation.confirmation()
    
                    // Final values
                    governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                    governanceStorage               = await governanceInstance.storage();
                    delegationStorage               = await delegationInstance.storage();
                    
                    const action                    = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
        
                    // Assertions
                    assert.notStrictEqual(action, undefined);

                    // ------------------------------
                    // Test Drop Action
                    // ------------------------------

                    // Admin - set satellite status back to SUSPENDED
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(suspendedSatellite, "SUSPENDED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now suspended
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // update storage
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();

                    // should fail: drop governance action 
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const dropActionOperation = governanceSatelliteInstance.methods.dropAction(actionId);
                    await chai.expect(dropActionOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%voteForAction                    - suspended satellite (oscar) should not be able to vote for an action', async () => {
                try{

                    // initial values
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    
                    // check that satellite is suspended
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(suspendedSatellite)
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const voteForActionOperation = governanceSatelliteInstance.methods.voteForAction(actionId, "nay");
                    await chai.expect(voteForActionOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        }) // End Governance Satellite Contract - Suspended tests

        describe("Governance Contract:", async () => {

            beforeEach("", async() => {
                
                // Initial Values
                delegationStorage               = await delegationInstance.storage();
                governanceStorage               = await governanceInstance.storage()

                // check round operation
                while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    governanceStorage               = await governanceInstance.storage();
                    currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                    currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                }

                await signerFactory(tezos, suspendedSatelliteSk);
            })

            it('%propose                          - suspended satellite (oscar) should not be able to propose', async () => {
                try{
                    
                    // Check satellite statues
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // init sample proposal params
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // Propose Operation
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData
                    );
                    await chai.expect(proposeOperation.send({amount: proposalSubmissionFeeMutez, mutez: true})).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateProposalData               - suspended satellite (oscar) should not be update proposal data or payment data', async () => {
                try{
                    
                    // remove satellite suspension temporarily to create a new proposal
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(suspendedSatellite, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Metadata#2",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]

                    // propose operation by satellite
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // Admin - set satellite status back to SUSPENDED
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(suspendedSatellite, "SUSPENDED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now suspended
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // should fail: update proposal data by satellite
                    await signerFactory(tezos, suspendedSatelliteSk)
                    const updateProposalDataOperation = governanceInstance.methods.updateProposalData(proposalId, proposalData);
                    await chai.expect(updateProposalDataOperation.send()).to.be.rejected;

                    // sample payment data
                    const paymentData               = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#1",
                                transaction: {
                                    "to_"    : suspendedSatellite,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]

                    // should fail: update payment data by satellite
                    await signerFactory(tezos, suspendedSatelliteSk)
                    const updatePaymentDataOperation = governanceInstance.methods.updateProposalData(proposalId, null, paymentData);
                    await chai.expect(updatePaymentDataOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%lockProposal                     - suspended satellite (oscar) should not be able to lock his proposal', async () => {
                try{

                    // get proposal just created in previous test
                    const proposalId                = governanceStorage.nextProposalId.toNumber() - 1;

                    // check satellite is suspended
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // should fail: lock proposal by satellite
                    await signerFactory(tezos, suspendedSatelliteSk)
                    const lockProposalOperation = governanceInstance.methods.lockProposal(proposalId);
                    await chai.expect(lockProposalOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%dropProposal                     - suspended satellite (oscar) should not be able to drop his proposal', async () => {
                try{

                    // get proposal just created in previous test
                    const proposalId                = governanceStorage.nextProposalId.toNumber() - 1;

                    // check satellite is suspended
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // should fail: drop proposal by satellite
                    await signerFactory(tezos, suspendedSatelliteSk)
                    const dropProposalOperation = governanceInstance.methods.dropProposal(proposalId);
                    await chai.expect(dropProposalOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });


            it('%proposalRoundVote                - suspended satellite (oscar) should not be able to vote for a proposal during the proposal round', async () => {
                try{

                    // get proposal just created in previous test
                    const proposalId                = governanceStorage.nextProposalId.toNumber() - 1;
                    
                    // check satellite is suspended
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "SUSPENDED");

                    // should fail: SATELLITE ONE should not be able to vote
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const proposalRoundVoteOperation = governanceInstance.methods.proposalRoundVote(proposalId);
                    await chai.expect(proposalRoundVoteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%votingRoundVote                  - suspended satellite (oscar) should not be able to vote for a proposal during the voting round', async () => {
                try{

                    // check satellite status - should be suspended
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "SUSPENDED");

                    // set signer to satellite one and create proposal
                    await signerFactory(tezos, satelliteOneSk);
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // create proposal
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode,
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();
                
                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
    
                    await signerFactory(tezos, satelliteTwoSk);
                    voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // ---------------------------------------
                    // Start Next Round to Voting Round
                    // ---------------------------------------

                    var nextRoundOperation    = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    // Set signer back to suspended satellite 
                    await signerFactory(tezos, suspendedSatelliteSk)
                    const votingRoundVoteOperation = governanceInstance.methods.votingRoundVote("nay");
                    await chai.expect(votingRoundVoteOperation.send()).to.be.rejected;

                    // ---------------------------------------
                    // Restart Cycle - Start Next Round to Proposal Round
                    // ---------------------------------------

                    await signerFactory(tezos, satelliteTwoSk);
                    nextRoundOperation    = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%processProposalPayment           - suspended satellite (oscar) should not be able to process proposal payments', async () => {
                try{
                    
                    // remove satellite suspension temporarily to create a new governance satellite action
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(suspendedSatellite, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                    // set Council contract admin temporarily to Governance Proxy Contract for governance process to be able to be executed successfully
                    const setAdminOperation     = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send()
                    await setAdminOperation.confirmation()

                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    // Initial Values
                    const proposalName              = "Quorum test process proposal payment";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    
                    const proposalPaymentData       = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : suspendedSatellite,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(5)
                                }
                            }
                        },
                        {
                            addOrSetPaymentData: {
                                title: "Payment#1",
                                transaction: {
                                    "to_"    : bannedSatellite,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(5)
                                }
                            }
                        }
                    ]

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]

                    // propose operation by satellite
                    await signerFactory(tezos, suspendedSatelliteSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData,
                        proposalPaymentData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // lock proposal 
                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    await signerFactory(tezos, satelliteTwoSk);
                    voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // ---------------------------------------
                    // Start Next Round to Voting Round
                    // ---------------------------------------

                    var nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();
                    
                    await signerFactory(tezos, satelliteOneSk);
                    votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    // ---------------------------------------
                    // Start Next Round to Timelock Round
                    // ---------------------------------------

                    nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                    await nextRoundOperation.confirmation();

                    // ---------------------------------------
                    // Restart Cycle - Start Next Round to new Proposal Round
                    // ---------------------------------------

                    nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                    await nextRoundOperation.confirmation();

                    // Admin - set satellite status back to SUSPENDED
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(suspendedSatellite, "SUSPENDED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now suspended
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(suspendedSatellite);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // should fail: process proposal payment by satellite
                    await signerFactory(tezos, suspendedSatelliteSk)
                    const processProposalPaymentOperation = governanceInstance.methods.processProposalPayment(proposalId);
                    await chai.expect(processProposalPaymentOperation.send()).to.be.rejected;

                    // reset Council contract admin back to original admin
                    await signerFactory(tezos, adminSk)
                    const resetAdminOperation     = await governanceProxyInstance.methods.executeGovernanceAction(mockPackedLambdaData.setCouncilAdmin).send();
                    await resetAdminOperation.confirmation();

                    // check that council contract admin is reset to admin
                    councilStorage = await councilInstance.storage();
                    assert.equal(councilStorage.admin, admin);


                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        }) // End Governance Contract Tests for Suspended Satellite

    }) // End Satellite Status Check : SUSPENDED

    describe("Satellite Status Checks: BANNED", async () => {

        before("Set satellite status", async() => {
        
            await signerFactory(tezos, adminSk)
            const updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "BANNED").send()
            await updateStatusOperation.confirmation()

        })

        after("Rest satellite status", async() => {
        
            await signerFactory(tezos, adminSk)
            const updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "ACTIVE").send()
            await updateStatusOperation.confirmation()

        })

        beforeEach("update storage", async() => {
        
            // init storage
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            governanceFinancialStorage     = await governanceFinancialInstance.storage();
            aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
            delegationStorage              = await delegationInstance.storage();
            governanceStorage              = await governanceInstance.storage();
            mvkTokenStorage                = await mvkTokenInstance.storage()

            await signerFactory(tezos, bannedSatelliteSk)
        })

        describe("Delegation Contract:", async () => {

            it('%unregisterAsSatellite            - banned satellite (susie) should not be able to unregister as a satellite', async () => {
                try{

                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    const unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(bannedSatellite);
                    await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateSatelliteRecord            - banned satellite (susie) should not be able to update its satellite record', async () => {
                try{

                    // initial Values
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(initialSatelliteRecord.status, "BANNED");

                    // init values
                    const updatedName           = "Test update name";
                    const updatedDescription    = "Test update description";
                    const updatedImage          = "https://imageTest.url";
                    const updatedWebsite        = "https://websiteTest.url";
                    const updatedFee            = 123;
                    
                    // Operation
                    const updateSatelliteRecordOperation = delegationInstance.methods.updateSatelliteRecord(
                        updatedName,
                        updatedDescription,
                        updatedImage,
                        updatedWebsite,
                        updatedFee,
                        mockSatelliteData.oscar.oraclePublicKey,
                        mockSatelliteData.oscar.oraclePeerId
                    );
                    await chai.expect(updateSatelliteRecordOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        }) // End Delegation Contract Tests for Banned Satellite


        describe("Aggregator Contract:", async () => {

            before("Admin initialize the aggregator contract", async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, adminSk)
                    aggregatorStorage   = await aggregatorInstance.storage()
    
                    // Operation
                    var addOracleOperation          = await aggregatorInstance.methods.addOracle(
                        bannedSatellite, 
                        mockSatelliteData.trudy.oraclePublicKey, 
                        mockSatelliteData.trudy.oraclePeerId
                    ).send();
                    await addOracleOperation.confirmation();
    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('%withdrawRewardXtz                - banned satellite (susie) should not be able to withdraw XTZ rewards', async () => {
                try{
                    
                    aggregatorStorage               = await aggregatorInstance.storage()
                    
                    // check satellite is banned
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, bannedSatelliteSk);
                    const withdrawRewardXtzOperation = aggregatorInstance.methods.withdrawRewardXtz(bannedSatellite);
                    await chai.expect(withdrawRewardXtzOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('%withdrawRewardStakedMvk          - banned satellite (susie) should not be able to withdraw SMVK rewards', async () => {
                try{
                    
                    // Initial Values
                    aggregatorStorage               = await aggregatorInstance.storage()

                    // check satellite is banned                    
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, bannedSatelliteSk);
                    const withdrawRewardStakedMvkOperation = aggregatorInstance.methods.withdrawRewardStakedMvk(bannedSatellite);
                    await chai.expect(withdrawRewardStakedMvkOperation.send()).to.be.rejected;
    
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })  // End Aggregator Contract Tests for Banned Satellite

        describe("Governance Financial Contract:", async () => {

            before("Create a governance financial request", async () => {
                try{
    
                    // set council member and signer
                    const councilMember = councilMemberOne;
                    await signerFactory(tezos, councilMemberOneSk);
    
                    councilStorage              = await councilInstance.storage();
                    const fromTreasury          = contractDeployments.treasury.address;
                    const purpose               = "For testing purposes";
                    const tokenAmount           = MVK(3);
                    const actionId              = councilStorage.actionCounter;
                    
                    governanceFinancialStorage  = await governanceFinancialInstance.storage();
                    const financialRequestId    = governanceFinancialStorage.financialRequestCounter; 
    
                    // Operation
                    const councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                        fromTreasury,
                        contractDeployments.council.address,
                        tokenAmount,
                        purpose
                    ).send();
                    await councilActionOperation.confirmation();
    
                    // Final values
                    councilStorage              = await councilInstance.storage();
                    var action                  = await councilStorage.councilActionsLedger.get(actionId);
                    var actionSigner            = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                    var dataMap                 = await action.dataMap;
                    const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                    const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                    const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
    
                    // Assertions
                    assert.strictEqual(action.initiator,            councilMember);
                    assert.strictEqual(action.status,               "PENDING");
                    assert.strictEqual(action.actionType,           "requestMint");
                    assert.equal(action.executed,                   false);
                    assert.notStrictEqual(actionSigner,             undefined);
                    assert.equal(action.signersCount,               1);
                    assert.equal(dataMap.get("treasuryAddress"),    packedTreasuryAddress);
                    assert.equal(dataMap.get("purpose"),            packedPurpose);
                    assert.equal(dataMap.get("tokenAmount"),        packedTokenAmount);
    
                    // set signer as council member two
                    await signerFactory(tezos, councilMemberTwoSk)
                    let signActionOperation = await councilInstance.methods.signAction(actionId).send();
                    await signActionOperation.confirmation();
    
                    // set signer as council member three
                    await signerFactory(tezos, councilMemberThreeSk)
                    signActionOperation = await councilInstance.methods.signAction(actionId).send();
                    await signActionOperation.confirmation();
    
                    // Final values
                    councilStorage      = await councilInstance.storage();
                    action              = await councilStorage.councilActionsLedger.get(actionId);
                    actionSigner        = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                    dataMap             = await action.dataMap;
    
                    assert.strictEqual(action.initiator,            councilMember);
                    assert.strictEqual(action.status,               "EXECUTED");
                    assert.strictEqual(action.actionType,           "requestMint");
                    assert.equal(action.executed,                   true);
                    assert.notStrictEqual(actionSigner,             undefined);
                    assert.equal(action.signersCount,               3);
                    assert.equal(dataMap.get("treasuryAddress"),    packedTreasuryAddress);
                    assert.equal(dataMap.get("purpose"),            packedPurpose);
                    assert.equal(dataMap.get("tokenAmount"),        packedTokenAmount);
                    
                    // check that financial governance request now exists
                    governanceFinancialStorage      = await governanceFinancialInstance.storage();
                    const financialRequest          = await governanceFinancialStorage.financialRequestLedger.get(financialRequestId)
                    assert.notStrictEqual(financialRequest, undefined);
    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('%voteForRequest                   - banned satellite (susie) should not be able to vote for a financial governance request', async () => {
                try{
    
                    // initial values
                    governanceFinancialStorage  = await governanceFinancialInstance.storage();
                    const requestId             = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;

                    // check that satellite is banned
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, bannedSatelliteSk);
                    const voteForRequestOperation =  governanceFinancialInstance.methods.voteForRequest(requestId, "nay");
                    await chai.expect(voteForRequestOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })  // End Governance Financial Contract Tests for Banned Satellite

        describe("Governance Satellite Contract:", async () => {
        
            it('%suspendSatellite                 - banned satellite (susie) should not be able to create an action to suspend a satellite', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    const suspendSatelliteOperation = governanceSatelliteInstance.methods.suspendSatellite(satelliteOne, "Test purpose");
                    await chai.expect(suspendSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%restoreSatellite                 - banned satellite (susie) should not be able to create an action to restore a satellite', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    const restoreSatelliteOperation = governanceSatelliteInstance.methods.restoreSatellite(
                        bannedSatellite,
                        "Test purpose"
                    );
                    await chai.expect(restoreSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%banSatellite                     - banned satellite (susie) should not be able to create an action to ban a satellite', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");
    
                    // Operation
                    const banSatelliteOperation = governanceSatelliteInstance.methods.banSatellite(satelliteOne, "Test purpose");
                    await chai.expect(banSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%removeAllSatelliteOracles        - banned satellite (susie) should not be able to create an action to remove all oracles from a satellite', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    const removeAllSatelliteOraclesOperation = governanceSatelliteInstance.methods.removeAllSatelliteOracles(satelliteOne, "Test purpose");
                    await chai.expect(removeAllSatelliteOraclesOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%addOracleToAggregator            - banned satellite (susie) should not be able to create an action to add an oracle to an aggregator', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    const addOracleToAggregatorOperation = governanceSatelliteInstance.methods.addOracleToAggregator(
                        bannedSatellite,
                        contractDeployments.aggregator.address,
                        "Test purpose"
                    );
                    await chai.expect(addOracleToAggregatorOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    

            it('%removeOracleInAggregator         - banned satellite (susie) should not be able to create an action to remove an oracle from an aggregator', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    const removeOracleInAggregatorOperation = governanceSatelliteInstance.methods.removeOracleInAggregator(
                        satelliteOne, 
                        contractDeployments.aggregator.address, 
                        "Test purpose"
                    );
                    await chai.expect(removeOracleInAggregatorOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('%togglePauseAggregator            - banned satellite (susie) should not be able to create an action to update an aggregator status', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    const togglePauseAggregatorOperation = governanceSatelliteInstance.methods.togglePauseAggregator(
                        contractDeployments.aggregator.address, 
                        "Test purpose", 
                        "pauseAll"
                    );
                    await chai.expect(togglePauseAggregatorOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%fixMistakenTransfer              - banned satellite (susie) should not be able to create an action to resolve a mistaken transfer', async () => {
                try{
    
                    // initial Values
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // init params
                    const tokenAmount               = MVK(20);
                    const purpose                   = "Transfer made by mistake to the aggregator factory"
                    
                    // Operation
                    createGovernanceSatelliteActionOperation = await governanceSatelliteInstance.methods.fixMistakenTransfer(
                        aggregatorFactoryAddress,
                        purpose,
                        [
                            {
                                "to_"    : bannedSatellite,
                                "token"  : {
                                    "fa2" : {
                                        "tokenContractAddress": contractDeployments.mvkToken.address,
                                        "tokenId" : 0
                                    }
                                },
                                "amount" : tokenAmount
                            }
                        ]
                    );
                    await chai.expect(createGovernanceSatelliteActionOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%dropAction                       - banned satellite (susie) should not be able to drop an action', async () => {
                try{
                    
                    // ------------------------------
                    // Create Sample Action
                    // ------------------------------

                    // remove satellite suspension temporarily to create a new governance satellite action
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    // initial values
                    const actionId                  = governanceSatelliteStorage.governanceSatelliteCounter.toNumber();
    
                    // Create sample governance satellite action
                    await signerFactory(tezos, bannedSatelliteSk);
                    const togglePauseAggregatorOperation = await governanceSatelliteInstance.methods.togglePauseAggregator(
                        contractDeployments.aggregator.address, 
                        "Test purpose", 
                        "pauseAll"
                    ).send()
                    await togglePauseAggregatorOperation.confirmation()
    
                    // Final values
                    governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                    governanceStorage               = await governanceInstance.storage();
                    delegationStorage               = await delegationInstance.storage();
                    
                    const action                    = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
        
                    // Assertions
                    assert.notStrictEqual(action, undefined);

                    // ------------------------------
                    // Test Drop Action
                    // ------------------------------

                    // Admin - set satellite status back to BANNED
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "BANNED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now banned
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // update storage
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();

                    // should fail: drop governance action 
                    await signerFactory(tezos, bannedSatelliteSk);
                    const dropActionOperation = governanceSatelliteInstance.methods.dropAction(actionId);
                    await chai.expect(dropActionOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%voteForAction                    - banned satellite (susie) should not be able to vote for an action', async () => {
                try{

                    // initial values
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    
                    // check that satellite is banned
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(bannedSatellite)
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, bannedSatelliteSk);
                    const voteForActionOperation = governanceSatelliteInstance.methods.voteForAction(actionId, "nay");
                    await chai.expect(voteForActionOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        }) // End Governance Satellite Contract Tests for Banned Satellite

        describe("Governance Contract:", async () => {

            beforeEach("", async() => {
                
                // Initial Values
                delegationStorage               = await delegationInstance.storage();
                governanceStorage               = await governanceInstance.storage()

                // check round operation
                while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    governanceStorage               = await governanceInstance.storage();
                    currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                    currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                }

                await signerFactory(tezos, bannedSatelliteSk);
            })

            it('%propose                          - banned satellite (susie) should not be able to propose', async () => {
                try{
                    
                    // Check satellite statues
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // init sample proposal params
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // Propose Operation
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData
                    );
                    await chai.expect(proposeOperation.send({amount: proposalSubmissionFeeMutez, mutez: true})).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateProposalData               - banned satellite (susie) should not be update proposal data or payment data', async () => {
                try{
                    
                    // remove satellite suspension temporarily to create a new proposal
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Metadata#2",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]

                    // propose operation by satellite
                    await signerFactory(tezos, bannedSatelliteSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // Admin - set satellite status back to BANNED
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "BANNED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now banned
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // should fail: update proposal data by satellite
                    await signerFactory(tezos, bannedSatelliteSk)
                    const updateProposalDataOperation = governanceInstance.methods.updateProposalData(proposalId, proposalData);
                    await chai.expect(updateProposalDataOperation.send()).to.be.rejected;

                    // sample payment data
                    const paymentData               = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#1",
                                transaction: {
                                    "to_"    : bannedSatellite,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]

                    // should fail: update payment data by satellite
                    await signerFactory(tezos, bannedSatelliteSk)
                    const updatePaymentDataOperation = governanceInstance.methods.updateProposalData(proposalId, null, paymentData);
                    await chai.expect(updatePaymentDataOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%lockProposal                     - banned satellite (susie) should not be able to lock her proposal', async () => {
                try{

                    // get proposal just created in previous test
                    const proposalId                = governanceStorage.nextProposalId.toNumber() - 1;

                    // check satellite is banned
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // should fail: lock proposal by satellite
                    await signerFactory(tezos, bannedSatelliteSk)
                    const lockProposalOperation = governanceInstance.methods.lockProposal(proposalId);
                    await chai.expect(lockProposalOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%dropProposal                     - banned satellite (susie) should not be able to drop her proposal', async () => {
                try{

                    // get proposal just created in previous test
                    const proposalId                = governanceStorage.nextProposalId.toNumber() - 1;

                    // check satellite is banned
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // should fail: drop proposal by satellite
                    await signerFactory(tezos, bannedSatelliteSk)
                    const dropProposalOperation = governanceInstance.methods.dropProposal(proposalId);
                    await chai.expect(dropProposalOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });


            it('%proposalRoundVote                - banned satellite (susie) should not be able to vote for a proposal during the proposal round', async () => {
                try{

                    // get proposal just created in previous test
                    const proposalId                = governanceStorage.nextProposalId.toNumber() - 1;
                    
                    // check satellite is banned
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "BANNED");

                    // should fail: SATELLITE ONE should not be able to vote
                    await signerFactory(tezos, bannedSatelliteSk);
                    const proposalRoundVoteOperation = governanceInstance.methods.proposalRoundVote(proposalId);
                    await chai.expect(proposalRoundVoteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%votingRoundVote                  - banned satellite (susie) should not be able to vote for a proposal during the voting round', async () => {
                try{

                    // check satellite status - should be banned
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "BANNED");

                    // set signer to satellite one and create proposal
                    await signerFactory(tezos, satelliteOneSk);
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // create proposal
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode,
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();
                
                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
    
                    await signerFactory(tezos, satelliteTwoSk);
                    voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // ---------------------------------------
                    // Start Next Round to Voting Round
                    // ---------------------------------------

                    var nextRoundOperation    = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    // Set signer back to Banned Satellite 
                    await signerFactory(tezos, bannedSatelliteSk)
                    const votingRoundVoteOperation = governanceInstance.methods.votingRoundVote("nay");
                    await chai.expect(votingRoundVoteOperation.send()).to.be.rejected;

                    // ---------------------------------------
                    // Restart Cycle - Start Next Round to Proposal Round
                    // ---------------------------------------

                    await signerFactory(tezos, satelliteTwoSk);
                    nextRoundOperation    = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%processProposalPayment           - banned satellite (susie) should not be able to process proposal payments', async () => {
                try{
                    
                    // remove satellite suspension temporarily to create a new governance satellite action
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                    // set Council contract admin temporarily to Governance Proxy Contract for governance process to be able to be executed successfully
                    const setAdminOperation     = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send()
                    await setAdminOperation.confirmation()

                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    // Initial Values
                    const proposalName              = "Quorum test process proposal payment";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    
                    const proposalPaymentData       = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : bannedSatellite,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        },
                        {
                            addOrSetPaymentData: {
                                title: "Payment#1",
                                transaction: {
                                    "to_"    : bannedSatellite,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]

                    // propose operation by satellite
                    await signerFactory(tezos, bannedSatelliteSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData,
                        proposalPaymentData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // lock proposal 
                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    await signerFactory(tezos, satelliteTwoSk);
                    voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // ---------------------------------------
                    // Start Next Round to Voting Round
                    // ---------------------------------------

                    var nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();
                    
                    await signerFactory(tezos, satelliteOneSk);
                    votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    // ---------------------------------------
                    // Start Next Round to Timelock Round
                    // ---------------------------------------

                    nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                    await nextRoundOperation.confirmation();

                    // ---------------------------------------
                    // Restart Cycle - Start Next Round to new Proposal Round
                    // ---------------------------------------

                    nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                    await nextRoundOperation.confirmation();

                    // Admin - set satellite status back to BANNED
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(bannedSatellite, "BANNED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now banned
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(bannedSatellite);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // should fail: process proposal payment by satellite
                    await signerFactory(tezos, bannedSatelliteSk)
                    const processProposalPaymentOperation = governanceInstance.methods.processProposalPayment(proposalId);
                    await chai.expect(processProposalPaymentOperation.send()).to.be.rejected;

                    // reset Council contract admin back to original admin
                    await signerFactory(tezos, adminSk)
                    const resetAdminOperation     = await governanceProxyInstance.methods.executeGovernanceAction(mockPackedLambdaData.setCouncilAdmin).send();
                    await resetAdminOperation.confirmation();

                    // check that council contract admin is reset to admin
                    councilStorage = await councilInstance.storage();
                    assert.equal(councilStorage.admin, admin);


                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        }) // End Governance Contract Tests for Banned Satellite

    }) // End Satellite Status Check - BANNED


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            governanceSatelliteStorage        = await governanceSatelliteInstance.storage();
            await signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                           - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage   = await governanceSatelliteInstance.storage();
                const currentAdmin  = governanceSatelliteStorage.admin;

                // Operation
                setAdminOperation   = await governanceSatelliteInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                governanceSatelliteStorage   = await governanceSatelliteInstance.storage();
                const newAdmin      = governanceSatelliteStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await signerFactory(tezos, alice.sk);
                resetAdminOperation = await governanceSatelliteInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance                      - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();
                const currentGovernance = governanceSatelliteStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();
                const updatedGovernance = governanceSatelliteStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata                     - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await governanceSatelliteInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();            

                const updatedData       = await governanceSatelliteStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig                       - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const testValue            = 10;

                const initialApprovalPct            = governanceSatelliteStorage.config.approvalPercentage.toNumber();
                const initialDurationDays           = governanceSatelliteStorage.config.satelliteActionDurationInDays.toNumber();
                const initialPurposeMaxLength       = governanceSatelliteStorage.config.governancePurposeMaxLength.toNumber();
                const initialMaxActionsPerSatellite = governanceSatelliteStorage.config.maxActionsPerSatellite.toNumber();

                // Operation
                var updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configApprovalPercentage").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configActionDurationInDays").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configPurposeMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configMaxActionsPerSatellite").send();
                await updateConfigOperation.confirmation();

                // Final values
                governanceSatelliteStorage              = await governanceSatelliteInstance.storage();
                
                const updatedApprovalPct            = governanceSatelliteStorage.config.approvalPercentage.toNumber();
                const updatedDurationDays           = governanceSatelliteStorage.config.satelliteActionDurationInDays.toNumber();
                const updatedPurposeMaxLength       = governanceSatelliteStorage.config.governancePurposeMaxLength.toNumber();
                const updatedMaxActionsPerSatellite = governanceSatelliteStorage.config.maxActionsPerSatellite.toNumber();

                // Assertions
                assert.equal(updatedApprovalPct,            testValue);
                assert.equal(updatedDurationDays,           testValue);
                assert.equal(updatedPurposeMaxLength,       testValue);
                assert.equal(updatedMaxActionsPerSatellite, testValue);

                // reset config operation
                var resetConfigOperation = await governanceSatelliteInstance.methods.updateConfig(initialApprovalPct, "configApprovalPercentage").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceSatelliteInstance.methods.updateConfig(initialDurationDays, "configActionDurationInDays").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceSatelliteInstance.methods.updateConfig(initialPurposeMaxLength, "configPurposeMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceSatelliteInstance.methods.updateConfig(initialMaxActionsPerSatellite, "configMaxActionsPerSatellite").send();
                await resetConfigOperation.confirmation();

                // Final values
                governanceSatelliteStorage          = await governanceSatelliteInstance.storage();

                const resetApprovalPct              = governanceSatelliteStorage.config.approvalPercentage.toNumber();
                const resetDurationDays             = governanceSatelliteStorage.config.satelliteActionDurationInDays.toNumber();
                const resetPurposeMaxLength         = governanceSatelliteStorage.config.governancePurposeMaxLength.toNumber();
                const resetMaxActionsPerSatellite   = governanceSatelliteStorage.config.maxActionsPerSatellite.toNumber();

                assert.equal(resetApprovalPct,              initialApprovalPct);
                assert.equal(resetDurationDays,             initialDurationDays);
                assert.equal(resetPurposeMaxLength,         initialPurposeMaxLength);
                assert.equal(resetMaxActionsPerSatellite,   initialMaxActionsPerSatellite);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%updateConfig                       - admin (bob) should not be able to update approval percentage beyond 100%', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                const testValue             = 10001;
                
                const initialApprovalPct  = governanceSatelliteStorage.config.approvalPercentage;

                // Operation
                var updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configApprovalPercentage");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                const updatedApprovalPct    = governanceSatelliteStorage.config.approvalPercentage;

                // check that there is no change in config values
                assert.equal(updatedApprovalPct.toNumber(), initialApprovalPct.toNumber());
                assert.notEqual(updatedApprovalPct.toNumber(), testValue);

                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts           - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(governanceSatelliteInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                governanceSatelliteStorage = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistContracts           - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(governanceSatelliteInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                governanceSatelliteStorage = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts             - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(governanceSatelliteInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                governanceSatelliteStorage = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts             - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(governanceSatelliteInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                governanceSatelliteStorage = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer                   - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, user, governanceSatelliteAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await mistakenTransferFa2Token(governanceSatelliteInstance, user, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            governanceSatelliteStorage = await governanceSatelliteInstance.storage();
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                           - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceSatelliteStorage        = await governanceSatelliteInstance.storage();
                const currentAdmin  = doormanStorage.admin;

                // Operation
                setAdminOperation = await governanceSatelliteInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage    = await governanceSatelliteInstance.storage();
                const newAdmin  = governanceSatelliteStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance                      - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceSatelliteStorage        = await governanceSatelliteInstance.storage();
                const currentGovernance  = governanceSatelliteStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage        = await governanceSatelliteInstance.storage();
                const updatedGovernance  = governanceSatelliteStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata                     - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();   
                const initialMetadata   = await governanceSatelliteStorage.metadata.get(key);

                // Operation
                const updateOperation = await governanceSatelliteInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();            
                const updatedData       = await governanceSatelliteStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig                       - non-admin (mallory) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
                const testValue = 11;
                
                const initialApprovalPct            = governanceSatelliteStorage.config.approvalPercentage;
                const initialDurationDays           = governanceSatelliteStorage.config.satelliteActionDurationInDays;
                const initialPurposeMaxLength       = governanceSatelliteStorage.config.governancePurposeMaxLength;
                const initialMaxActionsPerSatellite = governanceSatelliteStorage.config.maxActionsPerSatellite;

                // Operation
                var updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configApprovalPercentage");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configActionDurationDays");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configPurposeMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configMaxActionsPerSatellite");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage              = await governanceSatelliteInstance.storage();
                
                const updatedApprovalPct            = governanceSatelliteStorage.config.approvalPercentage;
                const updatedDurationDays           = governanceSatelliteStorage.config.satelliteActionDurationInDays;
                const updatedPurposeMaxLength       = governanceSatelliteStorage.config.governancePurposeMaxLength;
                const updatedMaxActionsPerSatellite = governanceSatelliteStorage.config.maxActionsPerSatellite;

                // check that there is no change in config values
                assert.equal(updatedApprovalPct.toNumber(), initialApprovalPct.toNumber());
                assert.notEqual(updatedApprovalPct.toNumber(), testValue);

                assert.equal(updatedDurationDays.toNumber(), initialDurationDays.toNumber());
                assert.notEqual(updatedDurationDays.toNumber(), testValue);

                assert.equal(updatedPurposeMaxLength.toNumber(), initialPurposeMaxLength.toNumber());
                assert.notEqual(updatedPurposeMaxLength.toNumber(), testValue);

                assert.equal(updatedMaxActionsPerSatellite.toNumber(), initialMaxActionsPerSatellite.toNumber());
                assert.notEqual(updatedMaxActionsPerSatellite.toNumber(), testValue);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts           - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = mallory.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await governanceSatelliteInstance.methods.updateWhitelistContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                governanceSatelliteStorage       = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts             - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await governanceSatelliteInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                governanceSatelliteStorage       = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer                   - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to Delegation Contract
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, governanceSatelliteAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(governanceSatelliteInstance, mallory.pkh, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('satelliteGovernanceEntrypoints      - non-admin and non-satellite user (mallory) should not be able to create any governance action', async () => {
            try{        

                // some init constants
                governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                
                // get aggregator address from pair key
                const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];
                
                // dummy governance satellite action params
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const targetSatellite          = satelliteFour; // oscar
                const aggregatorAddress        = usdBtcAggregatorAddress;
                const newStatus                = "pauseAll"
                const purpose                  = "Test Purpose";            

                // fail to create governance action to suspend Satellite
                const failSuspendSatelliteOperation = governanceSatelliteInstance.methods.suspendSatellite(
                    targetSatellite,
                    purpose
                ).send();
                await chai.expect(failSuspendSatelliteOperation).to.be.eventually.rejected;


                // fail to create governance action to restore Satellite
                const failRestoreSatelliteOperation = governanceSatelliteInstance.methods.restoreSatellite(
                    targetSatellite,
                    purpose
                ).send();
                await chai.expect(failRestoreSatelliteOperation).to.be.eventually.rejected;


                // fail to create governance action to ban Satellite
                const failBanSatelliteOperation = governanceSatelliteInstance.methods.banSatellite(
                    targetSatellite,
                    purpose
                ).send();
                await chai.expect(failBanSatelliteOperation).to.be.eventually.rejected;


                // fail to create governance action to add oracle to aggregator
                const failAddOracleToAggregatorOperation = governanceSatelliteInstance.methods.addOracleToAggregator(
                    targetSatellite,
                    aggregatorAddress,
                    purpose
                ).send();
                await chai.expect(failAddOracleToAggregatorOperation).to.be.eventually.rejected;


                // fail to create governance action to remove oracle in aggregator
                const failRemoveOracleInAggregatorOperation = governanceSatelliteInstance.methods.removeOracleInAggregator(
                    targetSatellite,
                    aggregatorAddress,
                    purpose
                ).send();
                await chai.expect(failRemoveOracleInAggregatorOperation).to.be.eventually.rejected;


                // fail to create governance action to remove all satellite oracles
                const failRemoveAllSatelliteOraclesOperation = governanceSatelliteInstance.methods.removeAllSatelliteOracles(
                    targetSatellite,
                    purpose
                ).send();
                await chai.expect(failRemoveAllSatelliteOraclesOperation).to.be.eventually.rejected;

                
                // fail to create governance action to update aggregator status
                const failTogglePauseAggregatorOperation = governanceSatelliteInstance.methods.togglePauseAggregator(
                    aggregatorAddress,
                    purpose,
                    newStatus
                ).send();
                await chai.expect(failTogglePauseAggregatorOperation).to.be.eventually.rejected;


                // satellite (eve) creates a governance action to add oracle to aggregator (with a real satellite)
                await signerFactory(tezos, satelliteOneSk);
                const governanceSatelliteOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                    targetSatellite,
                    aggregatorAddress,
                    purpose
                ).send();
                await governanceSatelliteOperation.confirmation();


                // set signer back to user (mallory)
                await signerFactory(tezos, mallory.sk);

                // fail to create governance action to drop governance action
                const failDropActionOperation = governanceSatelliteInstance.methods.dropAction(
                    actionId
                ).send();
                await chai.expect(failDropActionOperation).to.be.eventually.rejected;


                // fail to create governance action to vote for governance action
                const failVoteYayForActionOperation = governanceSatelliteInstance.methods.voteForAction(
                    actionId,
                    "yay"
                ).send();
                await chai.expect(failVoteYayForActionOperation).to.be.eventually.rejected;


                // fail to create governance action to vote for governance action
                const failVoteNayForActionOperation = governanceSatelliteInstance.methods.voteForAction(
                    actionId,
                    "nay"
                ).send();
                await chai.expect(failVoteNayForActionOperation).to.be.eventually.rejected;


                // fail to create governance action to vote for governance action
                const failVotePassForActionOperation = governanceSatelliteInstance.methods.voteForAction(
                    actionId,
                    "pass"
                ).send();
                await chai.expect(failVotePassForActionOperation).to.be.eventually.rejected;
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it("%setLambda                          - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = governanceSatelliteInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })
    
});