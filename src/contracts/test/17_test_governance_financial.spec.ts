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

import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Governance Financial Contract", async () => {
    
    var utils: Utils;
    let tezos

    let doormanAddress
    let treasuryAddress 
    let tokenId = 0

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

    before("setup", async () => {
        try{

            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos

            doormanAddress                  = contractDeployments.doorman.address
            treasuryAddress                 = contractDeployments.treasury.address
            
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
    
            // console.log('-- -- -- -- -- Governance Financial Tests -- -- -- --')
            // console.log('Doorman Contract deployed at:', doormanInstance.address);
            // console.log('Delegation Contract deployed at:', delegationInstance.address);
            // console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
            // console.log('Governance Contract deployed at:', governanceInstance.address);
            // console.log('Governance Financial Contract deployed at:', governanceFinancialInstance.address);
            // console.log('Council Contract deployed at:', councilInstance.address);
            // console.log('Treasury Contract deployed at:', treasuryInstance.address);
            // console.log('Mavryk Fa12 Token Contract deployed at:', mavrykFa12TokenInstance.address);
            // console.log('Mavryk Fa2 Token Contract deployed at:' , mavrykFa2TokenInstance.address);
            // console.log('Bob address: ' + bob.pkh);
            // console.log('Alice address: '   + alice.pkh);
            // console.log('Eve address: '   + eve.pkh);
    
            // Setup governance satellites for financial request snapshot later
            // ------------------------------------------------------------------
    
            // Bob stakes 100 MVK tokens and registers as a satellite
    
            delegationStorage = await delegationInstance.storage();
            const bobSatellite = await delegationStorage.satelliteLedger.get(bob.pkh);

            if(bobSatellite === undefined){

                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                
                const bobStakeAmount                  = MVK(10);
                const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
                await bobStakeAmountOperation.confirmation();                        
                const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "https://image.url", "700").send();
                await bobRegisterAsSatelliteOperation.confirmation();
    
                // Alice stakes 100 MVK tokens and registers as a satellite 
                await helperFunctions.signerFactory(tezos, alice.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                
                const aliceStakeAmount                  = MVK(10);
                const aliceStakeAmountOperation         = await doormanInstance.methods.stake(aliceStakeAmount).send();
                await aliceStakeAmountOperation.confirmation();                        
                const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "https://image.url", "700").send();
                await aliceRegisterAsSatelliteOperation.confirmation();
    
                // Setup funds in Treasury for request tokens later
                // Mallory transfers 200 MVK tokens to Treasury
                await helperFunctions.signerFactory(tezos, mallory.sk);
                transferOperation = await helperFunctions.fa2Transfer(mvkTokenInstance, mallory.pkh, treasuryAddress, tokenId, MVK(20));
                await transferOperation.confirmation();

                // Mallory transfers 250 Mavryk FA12 Tokens to Treasury
                const malloryTransferMavrykFa12ToTreasuryOperation = await mavrykFa12TokenInstance.methods.transfer(mallory.pkh, contractDeployments.treasury.address, 250000000).send();
                await malloryTransferMavrykFa12ToTreasuryOperation.confirmation();
    
                // Mallory transfers 250 Mavryk FA2 Tokens to Treasury
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, treasuryAddress, tokenId, 250000000);
                await transferOperation.confirmation();
                
                // Mallory transfers 250 XTZ to Treasury
                const malloryTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: contractDeployments.treasury.address, amount: 100});
                await malloryTransferTezToTreasuryOperation.confirmation();

                // Switch to next cycle round to valide new satellites
                const startNextRoundOperation   = await governanceInstance.methods.startNextRound(false).send();
                await startNextRoundOperation.confirmation()
            }
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    

    describe("%setAdmin", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{
                // Initial Values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const currentAdmin = governanceFinancialStorage.admin;

                // Operation
                const setAdminOperation = await governanceFinancialInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const newAdmin = governanceFinancialStorage.admin;

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                const resetAdminOperation = await governanceFinancialInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);
            } catch(e){
                console.log(e);
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const currentAdmin = governanceFinancialStorage.admin;

                // Operation
                await chai.expect(governanceFinancialInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

                // Final values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const newAdmin = governanceFinancialStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);
            } catch(e){
                console.log(e);
            }
        });
        
    });

    

    describe("%setGovernance", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        it('Admin should be able to call this entrypoint and update the governance contract with a new address', async () => {
            try{
                // Initial Values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const currentGovernance = governanceFinancialStorage.governanceAddress;

                // Operation
                const setGovernanceOperation = await governanceFinancialInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const newGovernance = governanceFinancialStorage.governanceAddress;

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                const resetGovernanceOperation = await governanceFinancialInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await resetGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newGovernance, currentGovernance);
                assert.strictEqual(newGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);
            } catch(e){
                console.log(e);
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const currentGovernance = governanceFinancialStorage.governanceAddress;

                // Operation
                await chai.expect(governanceFinancialInstance.methods.setGovernance(alice.pkh).send()).to.be.rejected;

                // Final values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const newGovernance = governanceFinancialStorage.governanceAddress;

                // Assertions
                assert.strictEqual(newGovernance, currentGovernance);
            } catch(e){
                console.log(e);
            }
        });
        
    });

    describe("%updateConfig", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        before("Configure delegation ratio on delegation contract", async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, bob.sk)
                delegationStorage   = await delegationInstance.storage();
                const newConfigValue = 10;

                // Operation
                const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configDelegationRatio").send();
                await updateConfigOperation.confirmation();

                // Final values
                delegationStorage   = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.delegationRatio;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        it('Admin should be able to call the entrypoint and configure the financial required approval percentage', async () => {
            try{
                // Initial Values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const newConfigValue = 6700;

                // Operation
                const updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(newConfigValue,"configFinancialReqApprovalPct").send();
                await updateConfigOperation.confirmation();

                // Final values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const updateConfigValue = governanceFinancialStorage.config.financialRequestApprovalPercentage;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        it('Admin should not be able to call the entrypoint and configure the financial required approval percentage if it exceed 100%', async () => {
            try{
                // Initial Values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const currentConfigValue = governanceFinancialStorage.config.financialRequestApprovalPercentage;
                const newConfigValue = 10001;

                // Operation
                await chai.expect(governanceFinancialInstance.methods.updateConfig(newConfigValue,"configFinancialReqApprovalPct").send()).to.be.rejected;

                // Final values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const updateConfigValue = governanceFinancialStorage.config.financialRequestApprovalPercentage;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        it('Admin should be able to call the entrypoint and configure the financial required duration in days', async () => {
            try{
                // Initial Values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const newConfigValue = 1;

                // Operation
                const updateConfigOperation = await governanceFinancialInstance.methods.updateConfig(newConfigValue,"configFinancialReqDurationDays").send();
                await updateConfigOperation.confirmation();

                // Final values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const updateConfigValue = governanceFinancialStorage.config.financialRequestDurationInDays;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                // Initial Values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const currentConfigValue = governanceFinancialStorage.config.financialRequestDurationInDays;
                const newConfigValue = 1;

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk)
                await chai.expect(governanceFinancialInstance.methods.updateConfig(newConfigValue,"configFinancialReqDurationDays").send()).to.be.rejected;

                // Final values
                governanceFinancialStorage = await governanceFinancialInstance.storage();
                const updateConfigValue = governanceFinancialStorage.config.financialRequestDurationInDays;

                // Assertions
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe("%requestMint", async () => {

        it('Council contract should be able to call this entrypoint and mint MVK', async () => {
            try{

                // some init constants
                councilStorage                  = await councilInstance.storage();
                mvkTokenStorage                 = await mvkTokenInstance.storage();
                const councilActionId           = councilStorage.actionCounter;
                const councilContractAddress    = contractDeployments.council.address;
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialRequestID        = governanceFinancialStorage.financialRequestCounter;
                const bobStakeAmount            = MVK(10);
                const aliceStakeAmount          = MVK(10);
                const initCouncilMVKBalance     = await mvkTokenStorage.ledger.get(contractDeployments.council.address);

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
                governanceFinancialStorage            = await governanceFinancialInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

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
                const bobVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestID, "yay").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceFinancialInstance.methods.voteForRequest(financialRequestID, "yay").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                const updatedgovernanceFinancialStorage                 = await governanceFinancialInstance.storage();        
                const updatedGovernanceFinancialRequestLedger           = await updatedgovernanceFinancialStorage.financialRequestLedger.get(financialRequestCounter);            
                mvkTokenStorage                                         = await mvkTokenInstance.storage();
                const councilMvkLedger                                  = await mvkTokenStorage.ledger.get(councilContractAddress);
                governanceStorage                                       = await governanceInstance.storage();
                var currentCycle                                        = governanceStorage.cycleId;

                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalStakedMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalStakedMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.yayVoteStakedMvkTotal.toNumber(),        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.nayVoteStakedMvkTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1000 MVK in its account
                assert.equal(councilMvkLedger.toNumber(), initCouncilMVKBalance.toNumber() + tokenAmount);
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Other contracts should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                const treasury              = contractDeployments.treasury.address;
                const tokenAmount           = MVK(1000);
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Operation
                await chai.expect(governanceFinancialInstance.methods.requestMint(treasury, tokenAmount, purpose).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Council contract should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map or if the getStakedMvkTotalSupply view does not exist', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                governanceFinancialStorage     = await governanceFinancialInstance.storage();
                const financialRequestID       = governanceFinancialStorage.financialRequestCounter;
                const councilActionId          = councilStorage.actionCounter;

                // request mint params
                const treasury              = contractDeployments.treasury.address;
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send();
                await updateGeneralContractOperation.confirmation();
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;

                // Reset general Contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send();
                await updateGeneralContractOperation.confirmation();
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


        it('Other contracts should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = contractDeployments.treasury.address;
                const tokenContractAddress     = contractDeployments.mvkToken.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";         

                // Operation
                await chai.expect(governanceFinancialInstance.methods.requestTokens(treasury, tokenContractAddress, tokenName, tokenAmount, tokenType, tokenId, purpose).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Council contract should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map or if the getStakedMvkTotalSupply view does not exist', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                governanceFinancialStorage              = await governanceFinancialInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const financialRequestID       = governanceFinancialStorage.financialRequestCounter;

                // request mint params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = contractDeployments.treasury.address;
                const tokenContractAddress     = contractDeployments.mvkToken.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send();
                await updateGeneralContractOperation.confirmation();
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

                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();
    
                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;

                // Reset general Contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send();
                await updateGeneralContractOperation.confirmation();
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

        it('Other contracts should not be able to call this entrypoint', async () => {
            try{
                
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
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
                const eveSignsDropActionActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsDropActionActionOperation.confirmation();
    
                // get updated storage
                var updatedCouncilStorage               = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
    
                // check that council action is yayd and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");

                // Get financial request ID on governance
                governanceFinancialStorage   = await governanceFinancialInstance.storage();
                const financialRequestID  = governanceFinancialStorage.financialRequestCounter - 1;

                await chai.expect(governanceFinancialInstance.methods.dropFinancialRequest(financialRequestID).send()).to.be.rejected;
                
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

        it('Satellite should not be able to yay a request if the council contract is not referenced in the generalContracts map', async () => {
            try{
                // Replace council contract
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("council", contractDeployments.council.address).send();
                await updateGeneralContractOperation.confirmation();

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
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;

                // Reset council contract
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("council", contractDeployments.council.address).send();
                await updateGeneralContractOperation.confirmation();
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
});
