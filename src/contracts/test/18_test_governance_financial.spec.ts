import assert from "assert";
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

import { bob, alice, eve, mallory, trudy, ivan, isaac, susie, david, oscar, baker } from "../scripts/sandbox/accounts";
import { 
    signerFactory, 
    getStorageMapValue,
    fa12Transfer,
    fa2Transfer,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts,
    updateWhitelistTokenContracts,
    calcStakedMvkRequiredForActionApproval, 
    calcTotalVotingPower 
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Governance Financial Contract", async () => {
    
    var utils: Utils;
    let tezos

    let doormanAddress
    let treasuryAddress 
    let mvkTokenAddress
    let councilAddress
    let governanceFinancialAddress
    let tokenId = 0
    let delegationRatio 

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

    let user 
    let userSk 

    let admin 
    let adminSk 

    let satelliteOne 
    let satelliteOneSk 

    let satelliteTwo
    let satelliteTwoSk

    let satelliteThree
    let satelliteThreeSk

    let satelliteFour 
    let satelliteFive

    let delegateOne 
    let delegateOneSk

    let delegateTwo
    let delegateTwoSk

    let delegateThree
    let delegateThreeSk

    let delegateFour
    let delegateFourSk

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceFinancialInstance;
    let councilInstance;
    let treasuryInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceFinancialStorage;
    let councilStorage;
    let treasuryStorage;
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;

    let currentCycle
    let approvalPercentage
    let financialRequestPercentageDecimals

    let createFinancialGovernanceRequestOperation

    // operations
    let updateOperatorsOperation
    let transferOperation
    let councilActionOperation
    let signActionOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
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

            admin                           = bob.pkh;
            adminSk                         = bob.sk;

            councilMemberOne                = eve.pkh;
            councilMemberOneSk              = eve.sk;

            councilMemberTwo                = trudy.pkh;
            councilMemberTwoSk              = trudy.sk;

            councilMemberThree              = alice.pkh;
            councilMemberThreeSk            = alice.sk;

            councilMemberFour               = susie.pkh;
            councilMemberFourSk             = susie.sk;

            doormanAddress                  = contractDeployments.doorman.address
            councilAddress                  = contractDeployments.council.address
            treasuryAddress                 = contractDeployments.treasury.address
            mvkTokenAddress                 = contractDeployments.mvkToken.address
            governanceFinancialAddress      = contractDeployments.governanceFinancial.address;
            
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
            delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress);
            governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(governanceFinancialAddress);
            councilInstance                 = await utils.tezos.contract.at(councilAddress);
            treasuryInstance                = await utils.tezos.contract.at(treasuryAddress);
            mavrykFa12TokenInstance         = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
            mavrykFa2TokenInstance          = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            governanceStorage               = await governanceFinancialInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            councilStorage                  = await councilInstance.storage();
            treasuryStorage                 = await treasuryInstance.storage();
            mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
            mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
    
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

            // Initialise variables for financial request calculation
            approvalPercentage = governanceFinancialStorage.config.approvalPercentage;
            financialRequestPercentageDecimals = 4

            // initialise variables for calculating satellite's total voting power
            delegationRatio = delegationStorage.config.delegationRatio;
            
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

            satelliteOne     = eve.pkh;
            satelliteOneSk   = eve.sk;

            satelliteTwo     = alice.pkh;
            satelliteTwoSk   = alice.sk;

            satelliteThree   = trudy.pkh;
            satelliteThreeSk = trudy.sk;

            satelliteFour    = oscar.pkh;
            satelliteFive    = susie.pkh;

            delegateOne     = david.pkh;
            delegateOneSk   = david.sk;

            delegateTwo     = ivan.pkh;
            delegateTwoSk   = ivan.sk;

            delegateThree   = isaac.pkh;
            delegateThreeSk = isaac.sk;

            delegateFour    = mallory.pkh;
            delegateFourSk  = mallory.sk;
    
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

        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });


    describe("Financial Governance Entrypoints", async () => {

        beforeEach("Set signer to council member (eve)", async () => {            
            councilMember   = councilMemberOne;
            councilStorage  = await councilInstance.storage();
            await signerFactory(tezos, councilMemberOneSk)
        });

        it('%requestTokens                      - satellite (eve) should not be able to create a financial request for tokens', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // request tokens params
                const tokenAmount                   = 5000000; // 5 Mavryk FA12 Tokens
                const treasury                      = contractDeployments.treasury.address;
                const receiverAddress               = councilAddress;
                let tokenContractAddress            = mavrykFa12TokenInstance.address; 
                const tokenName                     = "MAVRYKFA12";
                const tokenType                     = "FA12";
                const tokenId                       = 0;
                let purpose                         = "Should Fail: Test Council Request Transfer of 5 Mavryk FA12 Tokens";            

                // satellite tries to create a financial request for tokens
                await signerFactory(tezos, satelliteOneSk)
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.requestTokens(
                    treasury, 
                    receiverAddress,
                    tokenContractAddress,
                    tokenName, 
                    tokenAmount, 
                    tokenType, 
                    tokenId, 
                    purpose
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%requestTokens                      - satellites should be able to approve a financial request to transfer FA12 tokens to the Council', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // get initial council balance of Mavryk FA12 tokens
                const initialCouncilMavrykFa12Balance           = (await mavrykFa12TokenStorage.ledger.get(councilAddress)) == undefined ? 0 : (await mavrykFa12TokenStorage.ledger.get(councilAddress)).balance.toNumber();

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

                // request tokens params
                const tokenAmount                       = 5000000; // 5 Mavryk FA12 Tokens
                const treasury                          = contractDeployments.treasury.address;
                const receiverAddress                   = councilAddress;
                const mavrykFa12TokenContractAddress    = mavrykFa12TokenInstance.address; 
                const tokenName                         = "MAVRYKFA12";
                const tokenType                         = "FA12";
                const tokenId                           = 0;
                const purpose                           = "Test Council Request Transfer of 5 Mavryk FA12 Tokens";            

                // Council member (eve) requests for mavryk FA12 token to be transferred from the Treasury
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
                        receiverAddress,
                        mavrykFa12TokenContractAddress,
                        tokenName, 
                        tokenAmount, 
                        tokenType, 
                        tokenId, 
                        purpose
                    ).send();
                await councilRequestsTokensOperation.confirmation();

                // get new council storage and assert tests
                councilStorage                      = await councilInstance.storage();
                const councilActionRequestTokens    = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                })
                const dataMap                       = councilActionRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: mavrykFa12TokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestTokens.actionType,         "requestTokens");
                assert.equal(councilActionRequestTokens.executed,           false);
                assert.equal(councilActionRequestTokens.status,             "PENDING");
                assert.equal(councilActionRequestTokens.signersCount,       1);
                assert.notStrictEqual(councilActionSigner,                  undefined);
                
                assert.equal(dataMap.get("treasuryAddress"),                packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),                packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),           packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),                    packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                        packedTokenId);
                assert.equal(dataMap.get("tokenName"),                      packedTokenName);
                assert.equal(dataMap.get("purpose"),                        packedPurpose);
                assert.equal(dataMap.get("tokenType"),                      packedTokenType);

                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();
            
                // get updated storage
                councilStorage                     = await councilInstance.storage();
                governanceFinancialStorage         = await governanceFinancialInstance.storage();
                
                // get updated council action and governance financial request
                const updatedCouncilAction         = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest   = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply                     = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval             = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");
                
                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           mavrykFa12TokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequest.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequest.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                governanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                mavrykFa12TokenStorage                             = await mavrykFa12TokenInstance.storage();

                // get updated governance financial request and updated council mavryk FA12 token balance   
                const updatedGovernanceFinancialRequest            = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                const updatedCouncilMavrykFa12Balance              = (await mavrykFa12TokenStorage.ledger.get(councilAddress)) == undefined ? 0 : (await mavrykFa12TokenStorage.ledger.get(councilAddress)).balance.toNumber();

                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             true);

                // check that council now has 100 Mavryk FA12 Tokens in its account
                assert.equal(updatedCouncilMavrykFa12Balance, initialCouncilMavrykFa12Balance + tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%requestTokens                      - satellites should be able to approve a financial request to transfer FA2 tokens to the Council', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // get initial council balance of Mavryk FA2 tokens
                const initialCouncilMavrykFa2Balance            = (await mavrykFa2TokenStorage.ledger.get(councilAddress)) == undefined ? 0 : (await mavrykFa2TokenStorage.ledger.get(councilAddress)).toNumber();

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

                // request tokens params
                const tokenAmount                   = 5000000; // 5 Mavryk FA2 Tokens
                const treasury                      = contractDeployments.treasury.address;
                const receiverAddress               = councilAddress;
                const mavrykFa2TokenContractAddress = mavrykFa2TokenInstance.address; 
                const tokenName                     = "MAVRYKFA2";
                const tokenType                     = "FA2";
                const tokenId                       = 0;
                const purpose                       = "Test Council Request Transfer of 5 Mavryk FA2 Tokens";            

                // Council member (eve) requests for mavryk FA2 token to be transferred from the Treasury
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
                        receiverAddress,
                        mavrykFa2TokenContractAddress,
                        tokenName, 
                        tokenAmount, 
                        tokenType, 
                        tokenId, 
                        purpose
                    ).send();
                await councilRequestsTokensOperation.confirmation();

                // get new council storage and assert tests
                councilStorage                      = await councilInstance.storage();
                const councilActionRequestTokens    = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                })
                const dataMap                       = councilActionRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: mavrykFa2TokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestTokens.actionType,         "requestTokens");
                assert.equal(councilActionRequestTokens.executed,           false);
                assert.equal(councilActionRequestTokens.status,             "PENDING");
                assert.equal(councilActionRequestTokens.signersCount,       1);
                assert.notStrictEqual(councilActionSigner,                  undefined);

                assert.equal(dataMap.get("treasuryAddress"),                packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),                packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),           packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),                    packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                        packedTokenId);
                assert.equal(dataMap.get("tokenName"),                      packedTokenName);
                assert.equal(dataMap.get("purpose"),                        packedPurpose);
                assert.equal(dataMap.get("tokenType"),                      packedTokenType);

                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                councilStorage                        = await councilInstance.storage();
                
                // get updated council action and governance financial request
                const updatedCouncilAction            = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest      = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply            = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval    = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           mavrykFa2TokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequest.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequest.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                governanceFinancialStorage               = await governanceFinancialInstance.storage();        
                mavrykFa2TokenStorage                    = await mavrykFa2TokenInstance.storage();
                
                const updatedGovernanceFinancialRequest  = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                const updatedCouncilMavrykFa2Balance     = (await mavrykFa2TokenStorage.ledger.get(councilAddress)) == undefined ? 0 : (await mavrykFa2TokenStorage.ledger.get(councilAddress)).toNumber();
    
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             true);
            
                // check that council now has the correct updated balance
                assert.equal(updatedCouncilMavrykFa2Balance, initialCouncilMavrykFa2Balance + tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%requestTokens                      - satellites should be able to approve a financial request to transfer XTZ to the Council', async () => {
            try{        
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // get initial tez balance
                const initialCouncilTezBalance  = (await utils.tezos.tz.getBalance(councilAddress)).toNumber();

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

                // request tokens params
                const tokenAmount                   = 5000000; // 5 XTZ
                const zeroAddress                   = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
                const treasury                      = contractDeployments.treasury.address;
                const receiverAddress               = councilAddress;
                const tokenContractAddress          = zeroAddress;
                const tokenName                     = "XTZ";
                const tokenType                     = "TEZ";
                const tokenId                       = 0;
                const purpose                       = "Test Council Request Transfer of 5 XTZ";            

                // Council member (eve) requests for MVK to be minted
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
                        receiverAddress,
                        tokenContractAddress,
                        tokenName, 
                        tokenAmount, 
                        tokenType, 
                        tokenId, 
                        purpose
                    ).send();
                await councilRequestsTokensOperation.confirmation();

                // get new council storage and assert tests
                councilStorage                      = await councilInstance.storage();
                const councilActionRequestTokens    = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                })
                const dataMap                       = councilActionRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: zeroAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestTokens.actionType,         "requestTokens");
                assert.equal(councilActionRequestTokens.executed,           false);
                assert.equal(councilActionRequestTokens.status,             "PENDING");
                assert.equal(councilActionRequestTokens.signersCount,       1);
                assert.notStrictEqual(councilActionSigner,                  undefined);

                assert.equal(dataMap.get("treasuryAddress"),                packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),                packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),           packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),                    packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                        packedTokenId);
                assert.equal(dataMap.get("tokenName"),                      packedTokenName);
                assert.equal(dataMap.get("purpose"),                        packedPurpose);
                assert.equal(dataMap.get("tokenType"),                      packedTokenType);

                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                councilStorage                        = await councilInstance.storage();
                
                // get updated council action and governance financial request
                const updatedCouncilAction            = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest      = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply            = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval    = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);
                
                // check that council action is yayd and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequest.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequest.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                governanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequest            = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            

                // get updated tez balance for council
                const updatedCouncilTezBalance                     = (await utils.tezos.tz.getBalance(councilAddress)).toNumber();
                
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             true);

                // check that council now has 100 XTZ in its balance
                assert.equal(updatedCouncilTezBalance, initialCouncilTezBalance + tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });


        it('%requestMint                        - satellite (eve) should not be able to create a financial request for minting new MVK Tokens', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenAmount           = MVK(100);
                const purpose               = "Should Fail: Test Council Request Mint 100 MVK";            

                // satellite tries to create a financial request for minting MVK
                await signerFactory(tezos, satelliteOneSk)
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.requestMint(
                    treasury, 
                    receiverAddress,
                    tokenAmount,
                    purpose
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });


        it('%requestMint                        - satellites should be able to approve a financial request to mint new MVK Tokens to the Council', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // get council initial mvk balance
                const initialCouncilMvkBalance  = (await mvkTokenStorage.ledger.get(councilAddress)).toNumber();

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

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(100); // 100 MVK
                const purpose               = "Test Council Request Mint 100 MVK";            

                // Council member (eve) requests for MVK to be minted and transferred from the Treasury
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        receiverAddress,
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionRequestMint  = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilActionRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress     = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestMint.actionType,      "requestMint");
                assert.equal(councilActionRequestMint.executed,        false);
                assert.equal(councilActionRequestMint.status,          "PENDING");
                assert.equal(councilActionRequestMint.signersCount,    1);
                assert.notStrictEqual(councilActionSigner,             undefined);

                assert.equal(dataMap.get("treasuryAddress"),            packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),            packedReceiverAddress);
                assert.equal(dataMap.get("tokenAmount"),                packedTokenAmount);
                assert.equal(dataMap.get("purpose"),                    packedPurpose);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                councilStorage                          = await councilInstance.storage();
                
                const councilActionRequestMintSigned    = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest        = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(councilActionRequestMintSigned.signersCount,  3);
                assert.equal(councilActionRequestMintSigned.executed,      true);
                assert.equal(councilActionRequestMintSigned.status,        "EXECUTED");

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "MINT");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequest.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                governanceFinancialStorage                    = await governanceFinancialInstance.storage();        
                mvkTokenStorage                               = await mvkTokenInstance.storage();

                const updatedGovernanceFinancialRequest       = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                const updatedCouncilMvkBalance                = (await mvkTokenStorage.ledger.get(councilAddress)).toNumber();
                
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             true);

                // check that council now has the correct updated balance
                assert.equal(updatedCouncilMvkBalance, initialCouncilMvkBalance + tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%requestMint                        - council should not be able to mint more than the MVK maximum supply', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // get council initial mvk balance
                const initialCouncilMvkBalance  = (await mvkTokenStorage.ledger.get(councilAddress)).toNumber();

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

                // request mint params
                const mvkMaximumSupply      = mvkTokenStorage.maximumSupply.toNumber();
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = mvkMaximumSupply;
                const purpose               = "Test Council Request Mint MVK Max Supply";            

                // Council member (eve) requests for MVK to be minted and transferred from the Treasury
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        receiverAddress,
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionRequestMint  = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilActionRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress     = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestMint.actionType,      "requestMint");
                assert.equal(councilActionRequestMint.executed,        false);
                assert.equal(councilActionRequestMint.status,          "PENDING");
                assert.equal(councilActionRequestMint.signersCount,    1);
                assert.notStrictEqual(councilActionSigner,             undefined);

                assert.equal(dataMap.get("treasuryAddress"),            packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),            packedReceiverAddress);
                assert.equal(dataMap.get("tokenAmount"),                packedTokenAmount);
                assert.equal(dataMap.get("purpose"),                    packedPurpose);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                councilStorage                          = await councilInstance.storage();
                
                const councilActionRequestMintSigned    = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest        = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(councilActionRequestMintSigned.signersCount,  3);
                assert.equal(councilActionRequestMintSigned.executed,      true);
                assert.equal(councilActionRequestMintSigned.status,        "EXECUTED");

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "MINT");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequest.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // financial request should not be able to be executed as treasury should not be able to mint more than max supply of MVK 
                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay");
                chai.expect(satelliteVotesForFinancialRequestOperation.send()).to.be.rejected;

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                governanceFinancialStorage                    = await governanceFinancialInstance.storage();        
                mvkTokenStorage                               = await mvkTokenInstance.storage();

                const updatedGovernanceFinancialRequest       = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                const updatedCouncilMvkBalance                = (await mvkTokenStorage.ledger.get(councilAddress)).toNumber();
                
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has not been executed 
                // only satellite one and two votes are counted, as last satellite vote will not go through as request should not be executable
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             false);

                // check that council now has the correct updated balance
                assert.equal(updatedCouncilMvkBalance, initialCouncilMvkBalance);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%setContractBaker                   - satellite (eve) should not be able to create a financial request to set a contract baker', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // params
                const targetContractAddress    = treasuryAddress;
                const contractBaker            = baker.pkh;

                // satellite tries to create a financial request to set a contract baker
                await signerFactory(tezos, satelliteOneSk)
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.setContractBaker(
                    targetContractAddress,
                    contractBaker
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%setContractBaker                   - satellites should be able to approve a financial request to set a baker for a treasury contract', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

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

                // params
                const targetContractAddress    = treasuryAddress;
                const contractBaker            = baker.pkh;

                // Council member (eve) requests to set contract baker for the treasury address
                councilActionOperation = await councilInstance.methods.councilActionSetContractBaker(
                    targetContractAddress,
                    contractBaker
                ).send();
                await councilActionOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilAction             = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner       = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilAction.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: targetContractAddress }, type: { prim: 'address' } })).packed
                
                // check details of council action
                assert.equal(councilAction.actionType,                  "setContractBaker");
                assert.equal(councilAction.executed,                    false);
                assert.equal(councilAction.status,                      "PENDING");
                assert.equal(councilAction.signersCount,                1);
                assert.notStrictEqual(councilActionSigner,              undefined);

                assert.equal(dataMap.get("targetContractAddress"),      packedTreasuryAddress);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                councilStorage                          = await councilInstance.storage();
                
                const councilActionSetContractBakerSigned   = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest            = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(councilActionSetContractBakerSigned.signersCount,  3);
                assert.equal(councilActionSetContractBakerSigned.executed,      true);
                assert.equal(councilActionSetContractBakerSigned.status,        "EXECUTED");

                const zeroAddress = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "SET_CONTRACT_BAKER");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasuryAddress);
                assert.equal(governanceFinancialRequest.receiverAddress,                zeroAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "NIL");
                assert.equal(governanceFinancialRequest.tokenAmount,                    0);            
                assert.equal(governanceFinancialRequest.tokenType,                      "NIL");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 "Set Contract Baker");
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                governanceFinancialStorage                    = await governanceFinancialInstance.storage();        
                mvkTokenStorage                               = await mvkTokenInstance.storage();

                const updatedGovernanceFinancialRequest       = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             true);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });


        it('%setContractBaker                   - satellites should be able to approve a financial request to remove a baker from a treasury contract', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

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

                // params
                const targetContractAddress = treasuryAddress
                const contractBaker         = null;

                // Council member (eve) requests to set contract baker for the treasury address
                councilActionOperation = await councilInstance.methods.councilActionSetContractBaker(
                    targetContractAddress,
                    contractBaker
                ).send();
                await councilActionOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilAction             = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner       = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilAction.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: targetContractAddress }, type: { prim: 'address' } })).packed
                
                // check details of council action
                assert.equal(councilAction.actionType,                  "setContractBaker");
                assert.equal(councilAction.executed,                    false);
                assert.equal(councilAction.status,                      "PENDING");
                assert.equal(councilAction.signersCount,                1);
                assert.notStrictEqual(councilActionSigner,              undefined);

                assert.equal(dataMap.get("targetContractAddress"),      packedTreasuryAddress);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                councilStorage                          = await councilInstance.storage();
                
                const councilActionSetContractBakerSigned   = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest            = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(councilActionSetContractBakerSigned.signersCount,  3);
                assert.equal(councilActionSetContractBakerSigned.executed,      true);
                assert.equal(councilActionSetContractBakerSigned.status,        "EXECUTED");

                const zeroAddress = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "SET_CONTRACT_BAKER");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasuryAddress);
                assert.equal(governanceFinancialRequest.receiverAddress,                zeroAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "NIL");
                assert.equal(governanceFinancialRequest.tokenAmount,                    0);            
                assert.equal(governanceFinancialRequest.tokenType,                      "NIL");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 "Set Contract Baker");
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                governanceFinancialStorage                    = await governanceFinancialInstance.storage();        
                mvkTokenStorage                               = await mvkTokenInstance.storage();

                const updatedGovernanceFinancialRequest       = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             true);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%voteForRequest                     - non-satellite (david) should not be able to vote for any financial request', async () => {
            try{
                
                // Try to sign action again with mallory
                await signerFactory(tezos, delegateOneSk);
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(9999, "nay").send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%voteForRequest                     - satellite (eve) should not be able to vote for a financial request that does not exist', async () => {
            try{
                
                // Try to sign action again with bob
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(9999, "nay").send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('%voteForRequest                     - satellite (eve) should not be able to vote for a financial request if it was dropped', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;
    
                // request tokens params
                const tokenAmount              = MVK(10); // 10 MVK
                const treasury                 = contractDeployments.treasury.address;
                const receiverAddress          = councilAddress;
                const tokenContractAddress     = contractDeployments.mvkToken.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (eve) requests for MVK to be transferred from the Treasury
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
                        receiverAddress,
                        tokenContractAddress,
                        tokenName, 
                        tokenAmount, 
                        tokenType, 
                        tokenId, 
                        purpose
                    ).send();
                await councilRequestsTokensOperation.confirmation();
    
                // get new council storage and assert tests            
                councilStorage                      = await councilInstance.storage();
                const councilActionRequestTokens    = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                       = councilActionRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                // check details of council action
                assert.equal(councilActionRequestTokens.actionType,         "requestTokens");
                assert.equal(councilActionRequestTokens.executed,           false);
                assert.equal(councilActionRequestTokens.status,             "PENDING");
                assert.equal(councilActionRequestTokens.signersCount,       1);
                assert.notStrictEqual(councilActionSigner,                  undefined);

                assert.equal(dataMap.get("treasuryAddress"),                packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),                packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),           packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),                    packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                        packedTokenId);
                assert.equal(dataMap.get("tokenName"),                      packedTokenName);
                assert.equal(dataMap.get("purpose"),                        packedPurpose);
                assert.equal(dataMap.get("tokenType"),                      packedTokenType);
    
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();
    
                // get updated storage
                var updatedCouncilStorage      = await councilInstance.storage();
                const updatedCouncilAction     = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
                const dropCouncilActionId      = updatedCouncilStorage.actionCounter;
    
                // check that council action is yayd and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // Drop financial request operation
                await signerFactory(tezos, councilMemberOneSk);
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestCounter).send();
                await dropRequestOperation.confirmation();

                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await signActionOperation.confirmation();

                councilStorage                       = await councilInstance.storage();
                var councilActionDropRequestSigned   = await councilStorage.councilActionsLedger.get(dropCouncilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionDropRequestSigned.signersCount,  3);
                assert.equal(councilActionDropRequestSigned.executed,      true);
                assert.equal(councilActionDropRequestSigned.status,        "EXECUTED");

                // Check that request has been dropped on the governance contract
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const financialRequest       = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                assert.equal(financialRequest.executed,      false);
                assert.equal(financialRequest.status,        false);

                // Try to sign previous action again with satellite (eve)
                await signerFactory(tezos, satelliteOneSk)
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('%voteForRequest                     - satellite (eve) should not be able to vote for a financial request if it was already executed', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // get council initial mvk balance
                const initialCouncilMvkBalance  = (await mvkTokenStorage.ledger.get(councilAddress)).toNumber();

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

                // request mint params
                const treasury                  = contractDeployments.treasury.address;
                const receiverAddress           = councilAddress;
                const tokenContractAddress      = contractDeployments.mvkToken.address; 
                const tokenAmount               = MVK(100); // 100 MVK
                const purpose                   = "Test Council Request Mint 100 MVK";            

                // Council member (eve) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(tezos, councilMemberOneSk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                    treasury, 
                    receiverAddress,
                    tokenAmount,
                    purpose
                ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionRequestMint  = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner       = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilActionRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress     = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestMint.actionType,       "requestMint");
                assert.equal(councilActionRequestMint.executed,         false);
                assert.equal(councilActionRequestMint.status,           "PENDING");
                assert.equal(councilActionRequestMint.signersCount,     1);
                assert.notStrictEqual(councilActionSigner,              undefined);

                assert.equal(dataMap.get("treasuryAddress"),             packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),             packedReceiverAddress);
                assert.equal(dataMap.get("tokenAmount"),                 packedTokenAmount);
                assert.equal(dataMap.get("purpose"),                     packedPurpose);

                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                councilStorage                          = await councilInstance.storage();
                
                const councilActionRequestMintSigned   = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest        = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply                     = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval             = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(councilActionRequestMintSigned.signersCount,  3);
                assert.equal(councilActionRequestMintSigned.executed,      true);
                assert.equal(councilActionRequestMintSigned.status,        "EXECUTED");

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "MINT");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequest.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request)
                governanceFinancialStorage                    = await governanceFinancialInstance.storage();        
                mvkTokenStorage                               = await mvkTokenInstance.storage();

                const updatedGovernanceFinancialRequest       = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                const updatedCouncilMvkBalance                = (await mvkTokenStorage.ledger.get(councilAddress)).toNumber();
                
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             true);

                // check that council now has the correct updated balance
                assert.equal(updatedCouncilMvkBalance, initialCouncilMvkBalance + tokenAmount);

                // Try to vote for the request again
                await signerFactory(tezos, satelliteOneSk);
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send()).to.be.rejected;
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "nay").send()).to.be.rejected;
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "pass").send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%voteForRequest                     - satellite (eve) should be able to change its vote', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

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

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(100); // 100 MVK
                const purpose               = "Test Council Request Mint 100 MVK";            

                // Council member (eve) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(tezos, councilMemberOneSk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        receiverAddress,
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionRequestMint  = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner       = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilActionRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress     = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestMint.actionType,      "requestMint");
                assert.equal(councilActionRequestMint.executed,        false);
                assert.equal(councilActionRequestMint.status,          "PENDING");
                assert.equal(councilActionRequestMint.signersCount,    1);
                assert.notStrictEqual(councilActionSigner,             undefined);

                assert.equal(dataMap.get("treasuryAddress"),            packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),            packedReceiverAddress);
                assert.equal(dataMap.get("tokenAmount"),                packedTokenAmount);
                assert.equal(dataMap.get("purpose"),                    packedPurpose);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                councilStorage                          = await councilInstance.storage();
                
                const updatedCouncilAction              = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest        = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply              = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval      = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "MINT");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequest.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // one satellite vote yay for financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request)
                governanceFinancialStorage                    = await governanceFinancialInstance.storage();        
                var updatedGovernanceFinancialRequest         = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal, initialSatelliteOneTotalVotingPower)
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal, 0)

                // change vote and nay financial request
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "nay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request)
                governanceFinancialStorage                       = await governanceFinancialInstance.storage();        
                updatedGovernanceFinancialRequest                = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal, 0)
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal, initialSatelliteOneTotalVotingPower)

                // vote for nay financial request again
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "nay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request)
                governanceFinancialStorage                 = await governanceFinancialInstance.storage();        
                updatedGovernanceFinancialRequest          = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal, 0)
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal, initialSatelliteOneTotalVotingPower)

                // check details of financial request snapshot
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%voteForRequest                     - satellite (eve) should not be able to vote for a financial request if it expired', async () => {
            try{
                
                // Change governance financial request expiry date
                await signerFactory(tezos, adminSk);
                const initialFinancialReqDurationDays = governanceFinancialStorage.config.financialRequestDurationInDays;
                const updateFinancialExpiry           = await governanceFinancialInstance.methods.updateConfig(0, "configFinancialReqDurationDays").send()
                await updateFinancialExpiry.confirmation();

                // initial storage
                councilStorage                  = await councilInstance.storage();
                governanceStorage               = await governanceInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // get initial values of satellites
                const initialSatelliteOneStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                const initialSatelliteOneStakedBalance        = initialSatelliteOneStakeRecord === undefined ? 0 : initialSatelliteOneStakeRecord.balance.toNumber();
                const initialSatelliteOneRecord               = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initialSatelliteOneTotalDelegatedAmount = initialSatelliteOneRecord.totalDelegatedAmount.toNumber();
                const initialSatelliteOneTotalVotingPower     = calcTotalVotingPower(delegationRatio, initialSatelliteOneStakedBalance, initialSatelliteOneTotalDelegatedAmount);

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(100); // 100 MVK
                const purpose               = "Test Council Request Mint 100 MVK";            

                // Council member (eve) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(tezos, councilMemberOneSk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        receiverAddress,
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionRequestMint  = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner       = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilActionRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress     = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestMint.actionType,      "requestMint");
                assert.equal(councilActionRequestMint.executed,        false);
                assert.equal(councilActionRequestMint.status,          "PENDING");
                assert.equal(councilActionRequestMint.signersCount,    1);
                assert.notStrictEqual(councilActionSigner,             undefined);

                assert.equal(dataMap.get("treasuryAddress"),            packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),            packedReceiverAddress);
                assert.equal(dataMap.get("tokenAmount"),                packedTokenAmount);
                assert.equal(dataMap.get("purpose"),                    packedPurpose);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage          = await governanceFinancialInstance.storage();
                councilStorage                      = await councilInstance.storage();
                
                const updatedCouncilAction          = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest    = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply                     = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval             = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "MINT");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequest.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay");
                await chai.expect(satelliteVotesForFinancialRequestOperation.send()).to.be.rejected;
    
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                // reset financial request expiry date back to initial value
                await signerFactory(tezos, adminSk);
                const updateFinancialExpiryReset    = await governanceFinancialInstance.methods.updateConfig(initialFinancialReqDurationDays, "configFinancialReqDurationDays").send()
                await updateFinancialExpiryReset.confirmation();

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%dropFinancialRequest               - satellite (eve) should not be able to drop a pending financial request', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // prepare sample council action to request tokens
                const fromTreasury          = treasuryAddress;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = mvkTokenAddress;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionId          = councilStorage.actionCounter;

                // council operation
                councilActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await councilActionOperation.confirmation();

                // check created council action
                councilStorage                      = await councilInstance.storage();
                const councilAction                 = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: councilActionId, 1: councilMember})
                const dataMap                       = await councilAction.dataMap;

                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasuryAddress }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                assert.equal(councilAction.actionType,              "requestTokens");
                assert.equal(councilAction.executed,                false);
                assert.equal(councilAction.status,                  "PENDING");
                assert.equal(councilAction.signersCount,            1);
                assert.notStrictEqual(councilActionSigner,          undefined);

                assert.equal(dataMap.get("treasuryAddress"),        packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),        packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),   packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),            packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                packedTokenId);
                assert.equal(dataMap.get("tokenName"),              packedTokenName);
                assert.equal(dataMap.get("purpose"),                packedPurpose);
                assert.equal(dataMap.get("tokenType"),              packedTokenType);
                assert.notStrictEqual(actionSigner,                 undefined);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // update storage
                councilStorage                  = await councilInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();

                const updatedCouncilAction      = await councilStorage.councilActionsLedger.get(councilActionId);
                var governanceFinancialRequest  = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // check that council action is approved and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request 
                assert.equal(governanceFinancialRequest.status,        true);
                assert.equal(governanceFinancialRequest.executed,      false);
                
                // satellite tries to drop a pending financial request 
                await signerFactory(tezos, satelliteOneSk)
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.dropFinancialRequest(
                    financialRequestCounter
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

                // check no change to financial request 
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                assert.equal(governanceFinancialRequest.status,        true);
                assert.equal(governanceFinancialRequest.executed,      false);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%dropFinancialRequest               - council should be able to drop a pending financial request', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // prepare sample council action to request tokens
                const fromTreasury          = treasuryAddress;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = mvkTokenAddress;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionId          = councilStorage.actionCounter;

                // council operation
                councilActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await councilActionOperation.confirmation();

                // check created council action
                councilStorage                      = await councilInstance.storage();
                const councilAction                 = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: councilActionId, 1: councilMember})
                const dataMap                       = await councilAction.dataMap;

                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasuryAddress }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                assert.equal(councilAction.actionType,              "requestTokens");
                assert.equal(councilAction.executed,                false);
                assert.equal(councilAction.status,                  "PENDING");
                assert.equal(councilAction.signersCount,            1);
                assert.notStrictEqual(councilActionSigner,          undefined);

                assert.equal(dataMap.get("treasuryAddress"),        packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),        packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),   packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),            packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                packedTokenId);
                assert.equal(dataMap.get("tokenName"),              packedTokenName);
                assert.equal(dataMap.get("purpose"),                packedPurpose);
                assert.equal(dataMap.get("tokenType"),              packedTokenType);
                assert.notStrictEqual(actionSigner,                 undefined);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // update storage
                councilStorage                  = await councilInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();

                const updatedCouncilAction      = await councilStorage.councilActionsLedger.get(councilActionId);
                var governanceFinancialRequest  = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // check that council action is approved and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request 
                assert.equal(governanceFinancialRequest.executed,      false);
                assert.equal(governanceFinancialRequest.status,        true);
                
                // prepare council action to drop financial request
                councilStorage             = await councilInstance.storage();
                const dropCouncilActionId  = councilStorage.actionCounter;

                await signerFactory(tezos, councilMemberOneSk);
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestCounter).send();
                await dropRequestOperation.confirmation();
                
                // sign council action to drop previous council action (and financial request associated with it)
                await signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await signActionOperation.confirmation();

                // get updated council action for drop request
                councilStorage          = await councilInstance.storage();
                var dropCouncilAction   = await councilStorage.councilActionsLedger.get(dropCouncilActionId);

                // check that council action is successful and has been executed
                assert.equal(dropCouncilAction.signersCount,  3);
                assert.equal(dropCouncilAction.executed,      true);
                assert.equal(dropCouncilAction.status,        "EXECUTED");
                
                governanceFinancialStorage           = await governanceFinancialInstance.storage();
                var governanceFinancialRequest       = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // check details of financial request (status should be false)
                assert.equal(governanceFinancialRequest.executed,      false);
                assert.equal(governanceFinancialRequest.status,        false);
                
                // Try to sign previous action again with satellite
                await signerFactory(tezos, satelliteOneSk);
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
        
        it('%dropFinancialRequest               - council should not be able to drop a previously executed financial request', async () => {
            try{

                // initial storage
                councilStorage                  = await councilInstance.storage();
                governanceStorage               = await governanceInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                mvkTokenStorage                 = await mvkTokenInstance.storage();
                
                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;
                
                // get initial MVK balance of council
                const initialCouncilMvkBalance                  = (await mvkTokenStorage.ledger.get(councilAddress)).toNumber();

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

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(100); // 100 MVK
                const purpose               = "Test Council Request Mint 100 MVK";            

                // Council member (eve) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(tezos, councilMemberOneSk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        receiverAddress,
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionRequestMint  = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner       = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilActionRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress     = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestMint.actionType,       "requestMint");
                assert.equal(councilActionRequestMint.executed,         false);
                assert.equal(councilActionRequestMint.status,           "PENDING");
                assert.equal(councilActionRequestMint.signersCount,     1);
                assert.notStrictEqual(councilActionSigner,              undefined);

                assert.equal(dataMap.get("treasuryAddress"),             packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),             packedReceiverAddress);
                assert.equal(dataMap.get("tokenAmount"),                 packedTokenAmount);
                assert.equal(dataMap.get("purpose"),                     packedPurpose);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                var updatedCouncilStorage    = await councilInstance.storage();
                
                const updatedCouncilAction          = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest    = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // check that council action is yayd and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply                     = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval             = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "MINT");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequest.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await signerFactory(tezos, satelliteOneSk);
                var satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                await signerFactory(tezos, satelliteThreeSk);
                satelliteVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestCounter, "yay").send();
                await satelliteVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                governanceFinancialStorage                  = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequest     = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
    
                // check details of financial request snapshot ledger
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequest.yayVoteStakedMvkTotal.toNumber(),     initialSatelliteOneTotalVotingPower + initialSatelliteTwoTotalVotingPower + initialSatelliteThreeTotalVotingPower);
                assert.equal(updatedGovernanceFinancialRequest.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequest.status,                               true);
                assert.equal(updatedGovernanceFinancialRequest.executed,                             true);
            
                // update mvk token storage
                mvkTokenStorage                  = await mvkTokenInstance.storage();
                const updatedCouncilMvkBalance   = await mvkTokenStorage.ledger.get(councilAddress);

                // check that council now has the correct updated balance
                assert.equal(updatedCouncilMvkBalance, initialCouncilMvkBalance + tokenAmount);

                // DROP PREVIOUSLY EXECUTED REQUEST
                await signerFactory(tezos, councilMemberOneSk);
                councilStorage  = await councilInstance.storage();
                
                const dropCouncilActionId  = councilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestCounter).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk);
                await chai.expect(councilInstance.methods.signAction(dropCouncilActionId).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });


        it('%dropFinancialRequest               - council should not be able to drop an expired financial request', async () => {
            try{

                // Change governance financial request expiry date
                await signerFactory(tezos, adminSk);
                const initialFinancialReqDurationDays = governanceFinancialStorage.config.financialRequestDurationInDays;
                const updateFinancialExpiry           = await governanceFinancialInstance.methods.updateConfig(0, "configFinancialReqDurationDays").send()
                await updateFinancialExpiry.confirmation();

                // initial storage
                councilStorage                  = await councilInstance.storage();
                governanceStorage               = await governanceInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

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
                
                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(100); // 100 MVK
                const purpose               = "Test Council Request Mint 100 MVK";            

                // Council member (eve) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(tezos, councilMemberOneSk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        receiverAddress,
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionRequestMint  = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner       = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const dataMap                   = councilActionRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress     = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionRequestMint.actionType,      "requestMint");
                assert.equal(councilActionRequestMint.executed,        false);
                assert.equal(councilActionRequestMint.status,          "PENDING");
                assert.equal(councilActionRequestMint.signersCount,    1);
                assert.notStrictEqual(councilActionSigner,             undefined);

                assert.equal(dataMap.get("treasuryAddress"),            packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),            packedReceiverAddress);
                assert.equal(dataMap.get("tokenAmount"),                packedTokenAmount);
                assert.equal(dataMap.get("purpose"),                    packedPurpose);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(tezos, councilMemberTwoSk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage          = await governanceFinancialInstance.storage();
                councilStorage                      = await councilInstance.storage();
                
                const updatedCouncilAction          = await councilStorage.councilActionsLedger.get(councilActionId);
                const governanceFinancialRequest    = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                // calculate staked MVK required for approval
                const totalStakedMvkSupply          = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                const stakedMvkRequiredForApproval  = calcStakedMvkRequiredForActionApproval(totalStakedMvkSupply, approvalPercentage, financialRequestPercentageDecimals);

                // check that council action is yayd and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request
                assert.equal(governanceFinancialRequest.requesterAddress,               councilAddress);
                assert.equal(governanceFinancialRequest.requestType,                    "MINT");
                assert.equal(governanceFinancialRequest.status,                         true);
                assert.equal(governanceFinancialRequest.executed,                       false);
                assert.equal(governanceFinancialRequest.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequest.receiverAddress,                receiverAddress);
                assert.equal(governanceFinancialRequest.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequest.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequest.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequest.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequest.tokenId,                        0);
                assert.equal(governanceFinancialRequest.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequest.yayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.nayVoteStakedMvkTotal,          0);
                assert.equal(governanceFinancialRequest.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequest.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // DROP PREVIOUSLY EXECUTED REQUEST
                await signerFactory(tezos, councilMemberOneSk);
                councilStorage  = await councilInstance.storage();

                const dropCouncilActionId  = councilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestCounter).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk);
                await chai.expect(councilInstance.methods.signAction(dropCouncilActionId).send()).to.be.rejected;
    
                // check details of financial request snapshot
                const satelliteOneFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                assert.equal(satelliteOneFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteOneTotalDelegatedAmount);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteOneStakedBalance);
                assert.equal(satelliteOneFinancialRequestSnapshot.totalVotingPower,         initialSatelliteOneTotalVotingPower);

                const satelliteTwoFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalDelegatedAmount,     initialSatelliteTwoTotalDelegatedAmount);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalStakedMvkBalance,    initialSatelliteTwoStakedBalance);
                assert.equal(satelliteTwoFinancialRequestSnapshot.totalVotingPower,         initialSatelliteTwoTotalVotingPower);

                const satelliteThreeFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalDelegatedAmount,   initialSatelliteThreeTotalDelegatedAmount);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalStakedMvkBalance,  initialSatelliteThreeStakedBalance);
                assert.equal(satelliteThreeFinancialRequestSnapshot.totalVotingPower,       initialSatelliteThreeTotalVotingPower);

                // reset financial request expiry date back to initial value
                await signerFactory(tezos, adminSk);
                const updateFinancialExpiryReset    = await governanceFinancialInstance.methods.updateConfig(initialFinancialReqDurationDays, "configFinancialReqDurationDays").send()
                await updateFinancialExpiryReset.confirmation();

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

    })

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            councilMember               = councilMemberOne;
            governanceFinancialStorage  = await governanceFinancialInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                           - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const currentAdmin           = governanceFinancialStorage.admin;

                // Operation
                setAdminOperation  = await governanceFinancialInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const newAdmin               = governanceFinancialStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, admin);

                // reset admin
                await signerFactory(tezos, alice.sk);
                resetAdminOperation = await governanceFinancialInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance                      - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const currentGovernance     = governanceFinancialStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceFinancialInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const updatedGovernance     = governanceFinancialStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await governanceFinancialInstance.methods.setGovernance(contractDeployments.governance.address).send();
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
                const updateOperation = await governanceFinancialInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                governanceFinancialStorage       = await governanceFinancialInstance.storage();            

                const updatedData       = await governanceFinancialStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig                       - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const testValue = 10;

                const initialFinancialReqApprovalPct  = governanceFinancialStorage.config.approvalPercentage.toNumber();
                const initialFinancialReqDurationDays = governanceFinancialStorage.config.financialRequestDurationInDays.toNumber();

                // Operation
                var updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configApprovalPercentage").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configFinancialReqDurationDays").send();
                await updateConfigOperation.confirmation();

                // Final values
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceFinancialStorage.config.approvalPercentage.toNumber();
                const updatedFinancialReqDurationDays   = governanceFinancialStorage.config.financialRequestDurationInDays.toNumber();

                // Assertions
                assert.equal(updatedFinancialReqApprovalPct, testValue);
                assert.equal(updatedFinancialReqDurationDays, testValue);

                // reset config operation
                var resetConfigOperation = await governanceFinancialInstance.methods.updateConfig(initialFinancialReqApprovalPct, "configApprovalPercentage").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceFinancialInstance.methods.updateConfig(initialFinancialReqDurationDays, "configFinancialReqDurationDays").send();
                await resetConfigOperation.confirmation();

                // Final values
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const resetFinancialReqApprovalPct    = governanceFinancialStorage.config.approvalPercentage.toNumber();
                const resetFinancialReqDurationDays   = governanceFinancialStorage.config.financialRequestDurationInDays.toNumber();

                assert.equal(resetFinancialReqApprovalPct, initialFinancialReqApprovalPct);
                assert.equal(resetFinancialReqDurationDays, initialFinancialReqDurationDays);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%updateConfig                       - admin (bob) should not be able to update financial required approval percentage beyond 100%', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const testValue             = 10001;
                
                const initialFinancialReqApprovalPct  = governanceFinancialStorage.config.approvalPercentage;

                // Operation
                var updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configApprovalPercentage");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceFinancialStorage.config.approvalPercentage;

                // check that there is no change in config values
                assert.equal(updatedFinancialReqApprovalPct.toNumber(), initialFinancialReqApprovalPct.toNumber());
                assert.notEqual(updatedFinancialReqApprovalPct.toNumber(), testValue);

                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts           - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(governanceFinancialInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(governanceFinancialInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(governanceFinancialInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(governanceFinancialInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistTokenContracts      - admin (bob) should be able to add a contract address (eve) to the Whitelisted Token Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue           = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistTokenContracts(governanceFinancialInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Token Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Token Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistTokenContracts      - admin (bob) should be able to remove a contract address (eve) from the Whitelisted Token Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistTokenContracts(governanceFinancialInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Token Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Token Contracts map after adding her to it');

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
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, user, governanceFinancialAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await mistakenTransferFa2Token(governanceFinancialInstance, user, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%requestTokens                      - admin (bob) should not be able to create a financial request for tokens', async () => {
            try{

                // request tokens params
                const tokenAmount                   = 10000000; // 10 Mavryk FA12 Tokens
                const treasury                      = contractDeployments.treasury.address;
                const receiverAddress               = councilAddress;
                let tokenContractAddress            = mavrykFa12TokenInstance.address; 
                const tokenName                     = "MAVRYKFA12";
                const tokenType                     = "FA12";
                const tokenId                       = 0;
                let purpose                         = "Test Council Request Transfer of 100 Mavryk FA12 Tokens";            

                // admin tries to create a financial request for tokens
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.requestTokens(
                    treasury, 
                    receiverAddress,
                    tokenContractAddress,
                    tokenName, 
                    tokenAmount, 
                    tokenType, 
                    tokenId, 
                    purpose
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%requestMint                        - admin (bob) should not be able to create a financial request for minting new MVK Tokens', async () => {
            try{

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenAmount           = MVK(100);
                const purpose               = "Test Council Request Mint 100 MVK";            

                // admin tries to create a financial request for minting MVK
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.requestMint(
                    treasury, 
                    receiverAddress,
                    tokenAmount,
                    purpose
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%setContractBaker                   - admin (bob) should not be able to create a financial request to set a contract baker', async () => {
            try{

                // params
                const targetContractAddress    = treasuryAddress;
                const contractBaker            = baker.pkh;

                // admin tries to create a financial request to set a contract baker
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.setContractBaker(
                    targetContractAddress,
                    contractBaker
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%voteForRequest                     - admin (bob) should not be able to vote for a pending financial request', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // prepare sample council action to request tokens
                const fromTreasury          = treasuryAddress;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = mvkTokenAddress;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // council operation
                await signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await councilActionOperation.confirmation();

                // check created council action
                councilStorage                      = await councilInstance.storage();
                const councilAction                 = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: councilActionId, 1: councilMember})
                const dataMap                       = await councilAction.dataMap;

                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasuryAddress }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                assert.equal(councilAction.actionType,              "requestTokens");
                assert.equal(councilAction.executed,                false);
                assert.equal(councilAction.status,                  "PENDING");
                assert.equal(councilAction.signersCount,            1);
                assert.notStrictEqual(councilActionSigner,          undefined);

                assert.equal(dataMap.get("treasuryAddress"),        packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),        packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),   packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),            packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                packedTokenId);
                assert.equal(dataMap.get("tokenName"),              packedTokenName);
                assert.equal(dataMap.get("purpose"),                packedPurpose);
                assert.equal(dataMap.get("tokenType"),              packedTokenType);
                assert.notStrictEqual(actionSigner,                 undefined);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // update storage
                councilStorage                  = await councilInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();

                const updatedCouncilAction      = await councilStorage.councilActionsLedger.get(councilActionId);
                var governanceFinancialRequest  = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // check that council action is approved and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request 
                assert.equal(governanceFinancialRequest.status,        true);
                assert.equal(governanceFinancialRequest.executed,      false);
                
                // admin tries to drop a pending financial request 
                await signerFactory(tezos, adminSk)
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.voteForRequest(
                    financialRequestCounter, "yay"
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%dropFinancialRequest               - admin (bob) should not be able to drop a pending financial request', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // prepare sample council action to request tokens
                const fromTreasury          = treasuryAddress;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = mvkTokenAddress;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // council operation
                await signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await councilActionOperation.confirmation();

                // check created council action
                councilStorage                      = await councilInstance.storage();
                const councilAction                 = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: councilActionId, 1: councilMember})
                const dataMap                       = await councilAction.dataMap;

                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasuryAddress }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                assert.equal(councilAction.actionType,              "requestTokens");
                assert.equal(councilAction.executed,                false);
                assert.equal(councilAction.status,                  "PENDING");
                assert.equal(councilAction.signersCount,            1);
                assert.notStrictEqual(councilActionSigner,          undefined);

                assert.equal(dataMap.get("treasuryAddress"),        packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),        packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),   packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),            packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                packedTokenId);
                assert.equal(dataMap.get("tokenName"),              packedTokenName);
                assert.equal(dataMap.get("purpose"),                packedPurpose);
                assert.equal(dataMap.get("tokenType"),              packedTokenType);
                assert.notStrictEqual(actionSigner,                 undefined);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // update storage
                councilStorage                  = await councilInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();

                const updatedCouncilAction      = await councilStorage.councilActionsLedger.get(councilActionId);
                var governanceFinancialRequest  = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // check that council action is approved and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request 
                assert.equal(governanceFinancialRequest.status,        true);
                assert.equal(governanceFinancialRequest.executed,      false);
                
                // admin tries to drop a pending financial request 
                await signerFactory(tezos, adminSk)
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.dropFinancialRequest(
                    financialRequestCounter
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

                // check no change to financial request 
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                assert.equal(governanceFinancialRequest.status,        true);
                assert.equal(governanceFinancialRequest.executed,      false);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
        
        it("%setLambda                          - admin (bob) should be able to set lambda", async() => {
            try{

                // random lambda for testing
                const lambdaName            = "lambdaSetGovernance";
                const initialLambdaBytes    = await governanceFinancialStorage.lambdaLedger.get(lambdaName);
                const randomLambdaBytes     = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                // set lambda operation
                const setLambdaOperation = await governanceFinancialInstance.methods.setLambda(lambdaName, randomLambdaBytes).send();
                await setLambdaOperation.confirmation(); 

                // update storage
                governanceFinancialStorage = await governanceFinancialInstance.storage();

                // check that new random lambda is set
                const lambda = await governanceFinancialStorage.lambdaLedger.get(lambdaName);
                assert.equal(lambda, randomLambdaBytes);

                // reset lambda operation
                const resetLambdaOperation = await governanceFinancialInstance.methods.setLambda(lambdaName, initialLambdaBytes).send();
                await resetLambdaOperation.confirmation(); 

                // update storage
                governanceFinancialStorage = await governanceFinancialInstance.storage();

                // check that lambda is reset
                const updatedLambda = await governanceFinancialStorage.lambdaLedger.get(lambdaName);
                assert.equal(updatedLambda, initialLambdaBytes);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    });



    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin and non-satellite user (mallory)", async () => {
            governanceFinancialStorage = await governanceFinancialInstance.storage();
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                           - non-admin and non-satellite user (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceFinancialStorage        = await governanceFinancialInstance.storage();
                const currentAdmin  = governanceFinancialStorage.admin;

                // Operation
                setAdminOperation = await governanceFinancialInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                governanceFinancialStorage    = await governanceFinancialInstance.storage();
                const newAdmin  = governanceFinancialStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance                      - non-admin and non-satellite user (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceFinancialStorage        = await governanceFinancialInstance.storage();
                const currentGovernance  = governanceFinancialStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceFinancialInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                governanceFinancialStorage        = await governanceFinancialInstance.storage();
                const updatedGovernance  = governanceFinancialStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata                     - non-admin and non-satellite user (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                governanceFinancialStorage       = await governanceFinancialInstance.storage();   
                const initialMetadata   = await governanceFinancialStorage.metadata.get(key);

                // Operation
                const updateOperation = await governanceFinancialInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                governanceFinancialStorage       = await governanceFinancialInstance.storage();            
                const updatedData       = await governanceFinancialStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig                       - non-admin and non-satellite user (mallory) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const testValue = 10;
                
                const initialFinancialReqApprovalPct  = governanceFinancialStorage.config.approvalPercentage;
                const initialFinancialReqDurationDays = governanceFinancialStorage.config.financialRequestDurationInDays;

                // Operation
                var updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configApprovalPercentage");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configFinancialReqDurationDays");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceFinancialStorage.config.approvalPercentage;
                const updatedFinancialReqDurationDays   = governanceFinancialStorage.config.financialRequestDurationInDays;

                // check that there is no change in config values
                assert.equal(updatedFinancialReqApprovalPct.toNumber(), initialFinancialReqApprovalPct.toNumber());
                assert.notEqual(updatedFinancialReqApprovalPct.toNumber(), testValue);

                assert.equal(updatedFinancialReqDurationDays.toNumber(), initialFinancialReqDurationDays.toNumber());
                assert.notEqual(updatedFinancialReqDurationDays.toNumber(), testValue);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts           - non-admin and non-satellite user (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = mallory.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await governanceFinancialInstance.methods.updateWhitelistContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                governanceFinancialStorage       = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts             - non-admin and non-satellite user (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await governanceFinancialInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                governanceFinancialStorage       = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })
        
        it('%updateWhitelistTokenContracts      - non-admin and non-satellite user (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = mallory.pkh;
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await governanceFinancialInstance.methods.updateWhitelistTokenContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                governanceFinancialStorage       = await governanceFinancialInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Token Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer                   - non-admin and non-satellite user (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to Delegation Contract
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, governanceFinancialAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(governanceFinancialInstance, mallory.pkh, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%requestTokens                      - non-admin and non-satellite user (mallory) should not be able to create a financial request for tokens', async () => {
            try{

                // request tokens params
                const tokenAmount                   = 10000000; // 10 Mavryk FA12 Tokens
                const treasury                      = contractDeployments.treasury.address;
                const receiverAddress               = councilAddress;
                let tokenContractAddress            = mavrykFa12TokenInstance.address; 
                const tokenName                     = "MAVRYKFA12";
                const tokenType                     = "FA12";
                const tokenId                       = 0;
                let purpose                         = "Test Council Request Transfer of 100 Mavryk FA12 Tokens";            

                // user (mallory) tries to create a financial request for tokens
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.requestTokens(
                    treasury, 
                    receiverAddress,
                    tokenContractAddress,
                    tokenName, 
                    tokenAmount, 
                    tokenType, 
                    tokenId, 
                    purpose
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%requestMint                        - non-admin and non-satellite user (mallory) should not be able to create a financial request for minting new MVK Tokens', async () => {
            try{

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenAmount           = MVK(100);
                const purpose               = "Test Council Request Mint 100 MVK";            

                // user (mallory) tries to create a financial request for minting MVK
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.requestMint(
                    treasury, 
                    receiverAddress,
                    tokenAmount,
                    purpose
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%setContractBaker                   - non-admin and non-satellite user (mallory) should not be able to create a financial request to set a contract baker', async () => {
            try{

                // params
                const targetContractAddress    = treasuryAddress;
                const contractBaker            = baker.pkh;

                // user (mallory) tries to create a financial request to set a contract baker
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.setContractBaker(
                    targetContractAddress,
                    contractBaker
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%voteForRequest                     - non-admin and non-satellite user (mallory) should not be able to vote for a pending financial request', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // prepare sample council action to request tokens
                const fromTreasury          = treasuryAddress;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = mvkTokenAddress;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // council operation
                await signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await councilActionOperation.confirmation();

                // check created council action
                councilStorage                      = await councilInstance.storage();
                const councilAction                 = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: councilActionId, 1: councilMember})
                const dataMap                       = await councilAction.dataMap;

                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasuryAddress }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                assert.equal(councilAction.actionType,              "requestTokens");
                assert.equal(councilAction.executed,                false);
                assert.equal(councilAction.status,                  "PENDING");
                assert.equal(councilAction.signersCount,            1);
                assert.notStrictEqual(councilActionSigner,          undefined);

                assert.equal(dataMap.get("treasuryAddress"),        packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),        packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),   packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),            packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                packedTokenId);
                assert.equal(dataMap.get("tokenName"),              packedTokenName);
                assert.equal(dataMap.get("purpose"),                packedPurpose);
                assert.equal(dataMap.get("tokenType"),              packedTokenType);
                assert.notStrictEqual(actionSigner,                 undefined);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // update storage
                councilStorage                  = await councilInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();

                const updatedCouncilAction      = await councilStorage.councilActionsLedger.get(councilActionId);
                var governanceFinancialRequest  = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // check that council action is approved and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request 
                assert.equal(governanceFinancialRequest.status,        true);
                assert.equal(governanceFinancialRequest.executed,      false);
                
                // user (mallory) tries to drop a pending financial request 
                await signerFactory(tezos, mallory.sk)
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.voteForRequest(
                    financialRequestCounter, "yay"
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('%dropFinancialRequest               - non-admin and non-satellite user (mallory) should not be able to drop a pending financial request', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // get initial action ids and counters
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestCounter   = governanceFinancialStorage.financialRequestCounter;
                currentCycle                    = governanceStorage.cycleId;

                // prepare sample council action to request tokens
                const fromTreasury          = treasuryAddress;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = mvkTokenAddress;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // council operation
                await signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await councilActionOperation.confirmation();

                // check created council action
                councilStorage                      = await councilInstance.storage();
                const councilAction                 = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionSigner           = await councilStorage.councilActionsSigners.get({
                    0: councilActionId,
                    1: councilMemberOne
                });
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: councilActionId, 1: councilMember})
                const dataMap                       = await councilAction.dataMap;

                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasuryAddress }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                assert.equal(councilAction.actionType,              "requestTokens");
                assert.equal(councilAction.executed,                false);
                assert.equal(councilAction.status,                  "PENDING");
                assert.equal(councilAction.signersCount,            1);
                assert.notStrictEqual(councilActionSigner,          undefined);

                assert.equal(dataMap.get("treasuryAddress"),        packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"),        packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"),   packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),            packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),                packedTokenId);
                assert.equal(dataMap.get("tokenName"),              packedTokenName);
                assert.equal(dataMap.get("purpose"),                packedPurpose);
                assert.equal(dataMap.get("tokenType"),              packedTokenType);
                assert.notStrictEqual(actionSigner,                 undefined);
                
                // Sign council action by council members
                await signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // update storage
                councilStorage                  = await councilInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();

                const updatedCouncilAction      = await councilStorage.councilActionsLedger.get(councilActionId);
                var governanceFinancialRequest  = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);

                // check that council action is approved and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");

                // check details of financial request 
                assert.equal(governanceFinancialRequest.status,        true);
                assert.equal(governanceFinancialRequest.executed,      false);
                
                // user (mallory) tries to drop a pending financial request 
                await signerFactory(tezos, mallory.sk)
                createFinancialGovernanceRequestOperation = await governanceFinancialInstance.methods.dropFinancialRequest(
                    financialRequestCounter
                );
                chai.expect(createFinancialGovernanceRequestOperation.send()).to.be.rejected;

                // check no change to financial request 
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                assert.equal(governanceFinancialRequest.status,        true);
                assert.equal(governanceFinancialRequest.executed,      false);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it("%setLambda                          - non-admin and non-satellite user (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = governanceFinancialInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

});
