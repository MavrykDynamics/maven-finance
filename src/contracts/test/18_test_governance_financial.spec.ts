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

import { bob, alice, eve, mallory, trudy, ivan, isaac, susie, david, oscar } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Governance Financial Contract", async () => {
    
    var utils: Utils;
    let tezos

    let doormanAddress
    let treasuryAddress 
    let governanceFinancialAddress
    let tokenId = 0

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
    let satelliteTwo
    let satelliteThree
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

            admin   = bob.pkh;
            adminSk = bob.sk;

            councilMemberOne        = eve.pkh;
            councilMemberOneSk      = eve.sk;

            councilMemberTwo        = trudy.pkh;
            councilMemberTwoSk      = trudy.sk;

            councilMemberThree      = alice.pkh;
            councilMemberThreeSk    = alice.sk;

            councilMemberFour       = susie.pkh;
            councilMemberFourSk     = susie.sk;

            doormanAddress                  = contractDeployments.doorman.address
            treasuryAddress                 = contractDeployments.treasury.address
            governanceFinancialAddress      = contractDeployments.governanceFinancial.address;
            
            doormanInstance                 = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
            treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
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

            satelliteOne    = eve.pkh;
            satelliteTwo    = alice.pkh;
            satelliteThree  = trudy.pkh;
            satelliteFour   = oscar.pkh;
            satelliteFive   = susie.pkh;

            delegateOne     = david.pkh;
            delegateOneSk   = david.sk;

            delegateTwo     = ivan.pkh;
            delegateTwoSk   = ivan.sk;

            delegateThree   = isaac.pkh;
            delegateThreeSk = isaac.sk;

            delegateFour    = mallory.pkh;
            delegateFourSk  = mallory.sk;
    
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });


    describe("%requestMint", async () => {


        beforeEach("Set signer to council member (eve)", async () => {
            
            councilMember   = councilMemberOne;
            councilStorage  = await councilInstance.storage();
            
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('satellites should be able to vote for a council financial request for minting of MVK tokens', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "Test Council Request Mint of MVK Tokens";
                const tokenAmount           = MVK(25);
                const councilActionId       = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose
                ).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(councilActionId);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator,            councilMember);
                assert.strictEqual(action.status,               "PENDING");
                assert.strictEqual(action.actionType,           "requestMint");
                assert.equal(action.executed,                   false);
                assert.equal(actionSigner,                      true);
                assert.equal(action.signersCount,               1);
                assert.equal(dataMap.get("treasuryAddress"),    packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"),            packedPurpose);
                assert.equal(dataMap.get("tokenAmount"),        packedTokenAmount);

                // Sign action for subsequent testing of dropping a financial request
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await signActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const updatedCouncilAction            = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(updatedCouncilAction.signersCount,  3);
                assert.equal(updatedCouncilAction.executed,      true);
                assert.equal(updatedCouncilAction.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceFinancialStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                
                // const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                // const financialRequestPercentageDecimals       = 4;
                // const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                // const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // // check details of financial request
                // assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                // assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
                // assert.equal(governanceFinancialRequestLedger.status,                         true);
                // assert.equal(governanceFinancialRequestLedger.executed,                       false);
                // assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                // assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                // assert.equal(governanceFinancialRequestLedger.tokenName,                      "MVK");
                // assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);            
                // assert.equal(governanceFinancialRequestLedger.tokenType,                      "FA2");
                // assert.equal(governanceFinancialRequestLedger.tokenId,                        0);
                // assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                // assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,          0);
                // assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,          0);
                // assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                // assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                // // satellites vote and yay financial request
                // await helperFunctions.signerFactory(tezos, bob.sk);
                // const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestID, "yay").send();
                // await bobVotesForFinancialRequestOperation.confirmation();

                // await helperFunctions.signerFactory(tezos, alice.sk);
                // const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestID, "yay").send();
                // await aliceVotesForFinancialRequestOperation.confirmation();

                // // get updated storage (governance financial request ledger and council account in mvk token contract)
                // const updatedgovernanceFinancialStorage                 = await governanceFinancialInstance.storage();        
                // const updatedGovernanceFinancialRequestLedger           = await updatedgovernanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                // mvkTokenStorage                                         = await mvkTokenInstance.storage();
                // const councilMvkLedger                                  = await mvkTokenStorage.ledger.get(councilContractAddress);
                // governanceStorage                                       = await governanceInstance.storage();
                // var currentCycle                                        = governanceStorage.cycleId;

                // // check details of financial request snapshot ledger
                // const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                // assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                // assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance,       bobStakeAmount);
                // assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                // const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                // assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                // assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance,         aliceStakeAmount);
                // assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // // check that financial request has been executed
                // assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal.toNumber(),        MVK(20));
                // assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal.toNumber(),     0);
                // assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                // assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // // check that council now has 1000 MVK in its account
                // assert.equal(councilMvkLedger.toNumber(), initCouncilMVKBalance.toNumber() + tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

    })

    describe("%requestTokens", async () => {

        it('Council contract should be able to call this entrypoint and request tokens (MVK in this example)', async () => {
            try{        
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = contractDeployments.council.address;
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const financialRequestID       = governanceFinancialStorage.financialRequestCounter;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(contractDeployments.council.address);
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = contractDeployments.treasury.address;
                const tokenContractAddress     = contractDeployments.mvkToken.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
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
                const councilActionsRequestTokens   = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                       = councilActionsRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenContractAddress"),  packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),      packedTokenId);
                assert.equal(dataMap.get("tokenName"),      packedTokenName);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(dataMap.get("tokenType"),      packedTokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);
    
                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();
    
                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();
    
                // get updated storage
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
    
                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(financialRequestID);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);
    
                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequestLedger.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequestLedger.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal.toNumber(),               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal.toNumber(),            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
    
                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestID, "yay").send();
                await bobVotesForFinancialRequestOperation.confirmation();
    
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestID, "yay").send();
                await aliceVotesForFinancialRequestOperation.confirmation();
    
                // get updated storage
                const updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(financialRequestID);            
    
                mvkTokenStorage                                         = await mvkTokenInstance.storage();
                const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);
                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal,        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal,     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1100 MVK in its account (1000 from first test (mint) + 100 from second test (transfer))
                const newTokenAmount = initialCouncilBalance.toNumber() + MVK(100);
                assert.equal(councilMvkLedger.toNumber(), newTokenAmount);
    
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Council contract should not be able to call this entrypoint with a wrong token type', async () => {
            try{        
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = contractDeployments.council.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(contractDeployments.council.address);
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = contractDeployments.treasury.address;
                const tokenContractAddress     = contractDeployments.mvkToken.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA3";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                await chai.expect(councilInstance.methods.councilActionRequestTokens(
                    treasury, 
                    tokenContractAddress,
                    tokenName, 
                    tokenAmount, 
                    tokenType, 
                    tokenId, 
                    purpose
                ).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

    });

    describe("%dropFinancialRequest", async () => {

        it('Council contract should be able to call this entrypoint and drop a pending financial request', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(contractDeployments.council.address);

                // Get financial request ID on governance
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const financialRequestID  = governanceFinancialStorage.financialRequestCounter;
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = contractDeployments.treasury.address;
                const tokenContractAddress     = contractDeployments.mvkToken.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
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
                const councilActionsRequestTokens   = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                       = councilActionsRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenContractAddress"),  packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),      packedTokenId);
                assert.equal(dataMap.get("tokenName"),      packedTokenName);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(dataMap.get("tokenType"),      packedTokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);
    
                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();
                
                // get updated storage
                var updatedCouncilStorage               = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
    
                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");

                // Drop financial request operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                updatedCouncilStorage      = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestID).send();
                await dropRequestOperation.confirmation();
                
                // sign drop 
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await eveSignsDropActionActionOperation.confirmation();

                updatedCouncilStorage                   = await councilInstance.storage();
                var councilActionsDropRequestSigned   = await updatedCouncilStorage.councilActionsLedger.get(dropCouncilActionId);
                await helperFunctions.signerFactory(tezos, bob.sk);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsDropRequestSigned.signersCount,  3);
                assert.equal(councilActionsDropRequestSigned.executed,      true);
                assert.equal(councilActionsDropRequestSigned.status,        "EXECUTED");

                // Check that request has been dropped on the governance contract
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const financialRequest = await governanceFinancialStorage.financialRequestLedger.get(financialRequestID);
                assert.equal(financialRequest.executed,      false);
                assert.equal(financialRequest.status,        false);

                // Try to sign previous action again with eve
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(financialRequestID, "yay").send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
        

        it('Council contract should not be able to drop a non-existing financial request', async () => {
            try{
                // Get financial request ID on governance
                const financialRequestID  = 9999;

                // Drop financial request operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updatedCouncilStorage  = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(financialRequestID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council contract should not be able to drop a previously executed financial request', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                var governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const governanceRequestID      = governanceFinancialStorage.financialRequestCounter;
                const councilContractAddress   = contractDeployments.council.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                mvkTokenStorage                = await mvkTokenInstance.storage();
                const councilMvkLedgerInit     = await mvkTokenStorage.ledger.get(councilContractAddress);

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                   = councilActionsRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                var updatedCouncilStorage               = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceFinancialStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequestLedger.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequestLedger.tokenId,                        0);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                const updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            

                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal.toNumber(),        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1000 MVK in its account
                mvkTokenStorage                = await mvkTokenInstance.storage();
                const councilMvkLedger     = await mvkTokenStorage.ledger.get(councilContractAddress);
                assert.equal(councilMvkLedger.toNumber(), tokenAmount + councilMvkLedgerInit.toNumber());

                // DROP PREVIOUSLY EXECUTED REQUEST
                await helperFunctions.signerFactory(tezos, bob.sk);
                updatedCouncilStorage  = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(governanceRequestID).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(councilInstance.methods.signAction(dropCouncilActionId).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });


        it('Council contract should not be able to drop an expired financial request', async () => {
            try{
                // Change governance financial request expiry date
                await helperFunctions.signerFactory(tezos, bob.sk);
                const updateFinancialExpiry    = await governanceFinancialInstance.methods.updateConfig(0, "configFinancialReqDurationDays").send()
                await updateFinancialExpiry.confirmation();

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                var governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const governanceRequestID      = governanceFinancialStorage.financialRequestCounter;
                const councilContractAddress   = contractDeployments.council.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                   = councilActionsRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage                  = await governanceFinancialInstance.storage();
                var updatedCouncilStorage                   = await councilInstance.storage();
                const councilActionsRequestMintSigned       = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceFinancialStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequestLedger.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequestLedger.tokenId,                        0);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                // DROP PREVIOUSLY EXECUTED REQUEST
                await helperFunctions.signerFactory(tezos, bob.sk);
                updatedCouncilStorage  = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(governanceRequestID).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(councilInstance.methods.signAction(dropCouncilActionId).send()).to.be.rejected;

                // final values
                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // Reset financial request expiry date
                await helperFunctions.signerFactory(tezos, bob.sk);
                const updateFinancialExpiryReset    = await governanceFinancialInstance.methods.updateConfig(1, "configFinancialReqDurationDays").send()
                await updateFinancialExpiryReset.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
    })

    describe("%voteRequest", async () => {

        it('Non-satellite should not be able to call this entrypoint', async () => {
            try{
                // Try to sign action again with mallory
                await helperFunctions.signerFactory(tezos, mallory.sk);
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(9999, "nay").send()).to.be.rejected;
                await helperFunctions.signerFactory(tezos, bob.sk);
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Satellite should not be able to call this entrypoint if the financial request does not exist', async () => {
            try{
                // Try to sign action again with bob
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(9999, "nay").send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Satellite should not be able to call this entrypoint if the delegation contract is not referenced in the generalContracts map or if the getSatelliteOpt view does not exist', async () => {
            try{
                // Try to sign action again with bob
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", contractDeployments.delegation.address).send();
                await updateGeneralContractOperation.confirmation();
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(9999, "nay").send()).to.be.rejected;
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", contractDeployments.delegation.address).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Satellite should not be able to call this entrypoint if the financial request was dropped', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(contractDeployments.council.address);

                // Get financial request ID on governance
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const financialRequestID  = governanceFinancialStorage.financialRequestCounter;
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = contractDeployments.treasury.address;
                const tokenContractAddress     = contractDeployments.mvkToken.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
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
                const councilActionsRequestTokens   = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                       = councilActionsRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenContractAddress"),  packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),      packedTokenId);
                assert.equal(dataMap.get("tokenName"),      packedTokenName);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(dataMap.get("tokenType"),      packedTokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);
    
                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();
    
                // get updated storage
                var updatedCouncilStorage               = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
    
                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");

                // Drop financial request operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                updatedCouncilStorage      = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestID).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await eveSignsDropActionActionOperation.confirmation();

                updatedCouncilStorage                   = await councilInstance.storage();
                var councilActionsDropRequestSigned   = await updatedCouncilStorage.councilActionsLedger.get(dropCouncilActionId);
                await helperFunctions.signerFactory(tezos, bob.sk);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsDropRequestSigned.signersCount,  3);
                assert.equal(councilActionsDropRequestSigned.executed,      true);
                assert.equal(councilActionsDropRequestSigned.status,        "EXECUTED");

                // Check that request has been dropped on the governance contract
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const financialRequest = await governanceFinancialStorage.financialRequestLedger.get(financialRequestID);
                assert.equal(financialRequest.executed,      false);
                assert.equal(financialRequest.status,        false);

                // Try to sign previous action again with eve
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(financialRequestID, "yay").send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Satellite should not be able to call this entrypoint if the financial request was already executed', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = contractDeployments.council.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const governanceRequestID      = governanceFinancialStorage.financialRequestCounter;            
                mvkTokenStorage                = await mvkTokenInstance.storage();
                const councilMvkLedgerInit     = await mvkTokenStorage.ledger.get(councilContractAddress);

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                   = councilActionsRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage                     = await governanceFinancialInstance.storage();
                const updatedCouncilStorage                    = await councilInstance.storage();
                const councilActionsRequestMintSigned          = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceFinancialStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequestLedger.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequestLedger.tokenId,                        0);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                const updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                mvkTokenStorage                                        = await mvkTokenInstance.storage();
                const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);
                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal.toNumber(),        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1000 MVK in its account
                assert.equal(councilMvkLedger.toNumber(), councilMvkLedgerInit.toNumber() + tokenAmount);

                // Try to vote for the request again
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "nay").send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Satellite should be able to change its vote', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = contractDeployments.council.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const governanceRequestID      = governanceFinancialStorage.financialRequestCounter;

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                   = councilActionsRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedCouncilStorage             = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(governanceRequestID);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequestLedger.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequestLedger.tokenId,                        0);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                

                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobYayFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await bobYayFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                var updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                var updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(governanceRequestID);
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal, bobStakeAmount)
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal, 0)

                // change vote and nay financial request
                const bobDisyayFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "nay").send();
                await bobDisyayFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(governanceRequestID);
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal, 0)
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal, bobStakeAmount)

                // change vote and nay financial request again
                const bobDisyayFinancialRequestOperationAgain = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "nay").send();
                await bobDisyayFinancialRequestOperationAgain.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(governanceRequestID);
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal, 0)
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal, bobStakeAmount)

                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Satellite should not be able to call this entrypoint if the financial request expired', async () => {
            try{
                // Change governance financial request expiry date
                await helperFunctions.signerFactory(tezos, bob.sk);
                const updateFinancialExpiry    = await governanceFinancialInstance.methods.updateConfig(0, "configFinancialReqDurationDays").send()
                await updateFinancialExpiry.confirmation();

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = contractDeployments.council.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const governanceRequestID      = governanceFinancialStorage.financialRequestCounter;

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                   = councilActionsRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedCouncilStorage             = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceFinancialStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequestLedger.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequestLedger.tokenId,                        0);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                await chai.expect(governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send()).to.be.rejected;


                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // Reset financial request expiry date
                const updateFinancialExpiryReset    = await governanceFinancialInstance.methods.updateConfig(1, "configFinancialReqDurationDays").send()
                await updateFinancialExpiryReset.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Satellite should be able to call this entrypoint and request transfer of FA12 token', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress        = contractDeployments.council.address;
                const bobStakeAmount                = MVK(10);
                const aliceStakeAmount              = MVK(10);
                var governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const governanceRequestID      = governanceFinancialStorage.financialRequestCounter;

                // request tokens params
                const tokenAmount                   = 100000000; // 100 Mavryk FA12 Tokens
                const treasury                      = contractDeployments.treasury.address;
                const mavrykFa12TokenContractAddress  = mavrykFa12TokenInstance.address; 
                const tokenName                     = "MAVRYKFA12";
                const tokenType                     = "FA12";
                const tokenId                       = 0;
                const purpose                       = "Test Council Request Transfer of 100 Mavryk FA12 Tokens";            

                // Council member (bob) requests for mavryk FA12 token to be transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
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
                const councilActionsRequestTokens   = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                       = councilActionsRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: mavrykFa12TokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenContractAddress"),  packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),      packedTokenId);
                assert.equal(dataMap.get("tokenName"),      packedTokenName);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(dataMap.get("tokenType"),      packedTokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestTokensActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestTokensActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestTokensActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestTokensActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage                      = await governanceFinancialInstance.storage();
                const updatedCouncilStorage                     = await councilInstance.storage();
                const councilActionsRequestTokensSigned         = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestTokensSigned.signersCount,  3);
                assert.equal(councilActionsRequestTokensSigned.executed,      true);
                assert.equal(councilActionsRequestTokensSigned.status,        "EXECUTED");
                
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(governanceRequestID);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           mavrykFa12TokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequestLedger.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequestLedger.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                const updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(governanceRequestID);            

                const mavrykFa12TokenStorage                             = await mavrykFa12TokenInstance.storage();
                const councilMavrykFa12Ledger                            = await mavrykFa12TokenStorage.ledger.get(councilContractAddress);


                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal,        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal,     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 100 Mavryk FA12 Tokens in its account
                assert.equal(councilMavrykFa12Ledger.balance, tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Satellite should be able to call this entrypoint and request transfer of FA2 token', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;                
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const governanceRequestID      = governanceFinancialStorage.financialRequestCounter;

                // request tokens params
                const tokenAmount                   = 100000000; // 100 Mavryk FA2 Tokens
                const treasury                      = contractDeployments.treasury.address;
                const mavrykFa2TokenContractAddress   = mavrykFa2TokenInstance.address; 
                const tokenName                     = "MAVRYKFA2";
                const tokenType                     = "FA2";
                const tokenId                       = 0;
                const purpose                       = "Test Council Request Transfer of 100 Mavryk FA2 Tokens";            

                // Council member (bob) requests for mavryk FA2 token to be transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
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
                const councilActionsRequestTokens   = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                       = councilActionsRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: mavrykFa2TokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                // assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                // assert.equal(councilActionAddress.get("tokenContractAddress"),  mavrykFa2TokenContractAddress);
                // assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                // assert.equal(councilActionNat.get("tokenId"),      tokenId);
                // assert.equal(councilActionString.get("tokenName"),      tokenName);
                // assert.equal(councilActionString.get("purpose"),      purpose);
                // assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenContractAddress"),  packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),      packedTokenId);
                assert.equal(dataMap.get("tokenName"),      packedTokenName);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(dataMap.get("tokenType"),      packedTokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(governanceRequestID);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               contractDeployments.council.address);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           mavrykFa2TokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequestLedger.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequestLedger.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                const updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(governanceRequestID);            

                const mavrykFa2TokenStorage                              = await mavrykFa2TokenInstance.storage();
                const councilMavrykFa2Ledger                             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.council.address);


                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal,        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal,     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 100 Mavryk FA2 Tokens in its account
                assert.equal(councilMavrykFa2Ledger, tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Satellite should be able to call this entrypoint and request transfer of XTZ', async () => {
            try{        
                // some init constants
                var councilStorage                  = await councilInstance.storage();
                const councilActionId               = councilStorage.actionCounter;    
                const councilContractAddress        = contractDeployments.council.address;
                const bobStakeAmount                = MVK(10);
                const aliceStakeAmount              = MVK(10);
                var governanceFinancialStorage               = await governanceFinancialInstance.storage();
                const governanceRequestID           = governanceFinancialStorage.financialRequestCounter;

                // request tokens params
                const tokenAmount                   = 100000000; // 100 XTZ
                const zeroAddress                   = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
                const treasury                      = contractDeployments.treasury.address;
                const tokenContractAddress          = zeroAddress;
                const tokenName                     = "XTZ";
                const tokenType                     = "TEZ";
                const tokenId                       = 0;
                const purpose                       = "Test Council Request Transfer of 100 XTZ";            

                // Council member (bob) requests for MVK to be minted
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
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
                const councilActionsRequestTokens   = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                       = councilActionsRequestTokens.dataMap
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: zeroAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenContractAddress"),  packedTokenContractAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("tokenId"),      packedTokenId);
                assert.equal(dataMap.get("tokenName"),      packedTokenName);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(dataMap.get("tokenType"),      packedTokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(governanceRequestID);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequestLedger.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequestLedger.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                const updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(governanceRequestID);             
                const councilTezBalance                                = await utils.tezos.tz.getBalance(councilContractAddress);
                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal,        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal,     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 100 XTZ in its balance
                assert.equal(councilTezBalance, tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Satellite should be able to call this entrypoint and mint MVK', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = contractDeployments.council.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const governanceRequestID      = governanceFinancialStorage.financialRequestCounter;            
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const councilMvkLedgerInit     = await mvkTokenStorage.ledger.get(councilContractAddress);

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await helperFunctions.signerFactory(tezos, bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const dataMap                   = councilActionsRequestMint.dataMap
                const packedTreasuryAddress     = (await utils.tezos.rpc.packData({ data: { string: treasury }, type: { prim: 'address' } })).packed
                const packedPurpose             = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount         = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(dataMap.get("treasuryAddress"),  packedTreasuryAddress);
                assert.equal(dataMap.get("tokenAmount"),      packedTokenAmount);
                assert.equal(dataMap.get("purpose"),      packedPurpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedCouncilStorage             = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceFinancialStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           tokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      "MVK");
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);            
                assert.equal(governanceFinancialRequestLedger.tokenType,                      "FA2");
                assert.equal(governanceFinancialRequestLedger.tokenId,                        0);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.yayVoteStakedMvkTotal,               0);
                assert.equal(governanceFinancialRequestLedger.nayVoteStakedMvkTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

                // satellites vote and yay financial request
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(governanceRequestID, "yay").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                const updatedgovernanceFinancialStorage                         = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedgovernanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                mvkTokenStorage                                        = await mvkTokenInstance.storage();
                const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);
                governanceStorage                     = await governanceInstance.storage();
                var currentCycle                      = governanceStorage.cycleId;
    
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal.toNumber(),        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1000 MVK in its account
                assert.equal(councilMvkLedger.toNumber(), councilMvkLedgerInit.toNumber() + tokenAmount);
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
    })


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            governanceFinancialStorage        = await governanceFinancialInstance.storage();
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const currentAdmin  = governanceFinancialStorage.admin;

                // Operation
                setAdminOperation   = await governanceFinancialInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const newAdmin      = governanceFinancialStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await governanceFinancialInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage       = await governanceFinancialInstance.storage();
                const currentGovernance = governanceFinancialStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceFinancialInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                governanceFinancialStorage       = await governanceFinancialInstance.storage();
                const updatedGovernance = governanceFinancialStorage.governanceAddress;

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

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
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

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const testValue = 10;

                const initialFinancialReqApprovalPct  = governanceFinancialStorage.config.financialRequestApprovalPercentage.toNumber();
                const initialFinancialReqDurationDays = governanceFinancialStorage.config.financialRequestDurationInDays.toNumber();

                // Operation
                var updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configFinancialReqApprovalPct").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configFinancialReqDurationDays");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceFinancialStorage.config.financialRequestApprovalPercentage.toNumber();
                const updatedFinancialReqDurationDays   = governanceFinancialStorage.config.financialRequestDurationInDays.toNumber();

                // Assertions
                assert.equal(updatedFinancialReqApprovalPct, testValue);
                assert.equal(updatedFinancialReqDurationDays, testValue);

                // reset config operation
                var resetConfigOperation = await governanceFinancialInstance.methods.updateConfig(initialFinancialReqApprovalPct, "configFinancialReqApprovalPct").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceFinancialInstance.methods.updateConfig(initialFinancialReqDurationDays, "configFinancialReqDurationDays").send();
                await resetConfigOperation.confirmation();

                // Final values
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const resetFinancialReqApprovalPct    = governanceFinancialStorage.config.financialRequestApprovalPercentage.toNumber();
                const resetFinancialReqDurationDays   = governanceFinancialStorage.config.financialRequestDurationInDays.toNumber();

                assert.equal(resetFinancialReqApprovalPct, initialFinancialReqApprovalPct);
                assert.equal(resetFinancialReqDurationDays, initialFinancialReqDurationDays);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%updateConfig             - admin (bob) should not be able to update financial required approval percentage beyond 100%', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const testValue = 10001;
                
                const initialFinancialReqApprovalPct  = governanceFinancialStorage.config.financialRequestApprovalPercentage;

                // Operation
                var updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configFinancialReqApprovalPct");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceFinancialStorage.config.financialRequestApprovalPercentage;

                // check that there is no change in config values
                assert.equal(updatedFinancialReqApprovalPct.toNumber(), initialFinancialReqApprovalPct.toNumber());
                assert.notEqual(updatedFinancialReqApprovalPct.toNumber(), testValue);

                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(governanceFinancialInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.strictEqual(updatedContractMapValue, eve.pkh,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(governanceFinancialInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(governanceFinancialInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(governanceFinancialInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistTokenContracts - admin (bob) should be able to add a contract address (eve) to the Whitelisted Token Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistTokenContracts(governanceFinancialInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Token Contracts map before adding her to it')
                assert.strictEqual(updatedContractMapValue, eve.pkh,  'Eve (key) should be in the Whitelist Token Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistTokenContracts - admin (bob) should be able to remove a contract address (eve) from the Whitelisted Token Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistTokenContracts(governanceFinancialInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                governanceFinancialStorage = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Token Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Token Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await helperFunctions.signerFactory(tezos, userSk);
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, governanceFinancialAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await helperFunctions.signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(governanceFinancialInstance, user, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount).send();
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
            governanceFinancialStorage = await governanceFinancialInstance.storage();
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceFinancialStorage        = await governanceFinancialInstance.storage();
                const currentAdmin  = doormanStorage.admin;

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

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
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

        it('%updateMetadata           - non-admin (mallory) should not be able to update the contract metadata', async () => {
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

        it('%updateConfig             - non-admin (mallory) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const testValue = 10;
                
                const initialFinancialReqApprovalPct  = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const initialFinancialReqDurationDays = governanceFinancialStorage.config.financialRequestDurationInDays;

                // Operation
                var updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configFinancialReqApprovalPct");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(testValue, "configFinancialReqDurationDays");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceFinancialStorage.config.financialRequestApprovalPercentage;
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

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await governanceFinancialInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                governanceFinancialStorage       = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await governanceFinancialInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                governanceFinancialStorage       = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })
        
        it('%updateWhitelistTokenContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await governanceFinancialInstance.methods.updateWhitelistTokenContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                governanceFinancialStorage       = await governanceFinancialInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceFinancialStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Token Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to Delegation Contract
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, governanceFinancialAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(governanceFinancialInstance, mallory.pkh, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
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
