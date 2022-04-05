const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";
import { MichelsonMap } from "@taquito/taquito";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress        from '../deployments/doormanAddress.json';
import delegationAddress     from '../deployments/delegationAddress.json';
import governanceAddress     from '../deployments/governanceAddress.json';
import councilAddress        from '../deployments/councilAddress.json';
import treasuryAddress       from '../deployments/treasuryAddress.json';
import mvkTokenAddress       from '../deployments/mvkTokenAddress.json';
import mockFa12TokenAddress  from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress   from '../deployments/mockFa2TokenAddress.json';

import { config } from "yargs";

describe("Governance tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let councilInstance;
    let treasuryInstance;
    let mockFa12TokenInstance;
    let mockFa2TokenInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let councilStorage;
    let treasuryStorage;
    let mockFa12TokenStorage;
    let mockFa2TokenStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    const proposalId = 1;

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        doormanInstance        = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance     = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance       = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance     = await utils.tezos.contract.at(governanceAddress.address);
        councilInstance        = await utils.tezos.contract.at(councilAddress.address);
        treasuryInstance       = await utils.tezos.contract.at(treasuryAddress.address);
        mockFa12TokenInstance  = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance   = await utils.tezos.contract.at(mockFa2TokenAddress.address);
            
        doormanStorage         = await doormanInstance.storage();
        delegationStorage      = await delegationInstance.storage();
        mvkTokenStorage        = await mvkTokenInstance.storage();
        governanceStorage      = await governanceInstance.storage();
        councilStorage         = await councilInstance.storage();
        treasuryStorage        = await treasuryInstance.storage();
        mockFa12TokenStorage   = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage    = await mockFa2TokenInstance.storage();

        console.log('-- -- -- -- -- Governance Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Council Contract deployed at:', councilInstance.address);
        console.log('Treasury Contract deployed at:', treasuryInstance.address);
        console.log('Mock Fa12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock Fa2 Token Contract deployed at:' , mockFa2TokenInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: '   + alice.pkh);
        console.log('Eve address: '   + eve.pkh);

        // Setup governance satellites for financial request snapshot later
        // ------------------------------------------------------------------

        // Bob stakes 100 MVK tokens and registers as a satellite

        delegationStorage = await delegationInstance.storage();
        const satelliteMap = await delegationStorage.satelliteLedger;
        if(satelliteMap.get(bob.pkh) === undefined){
            var updateOperators = await mvkTokenInstance.methods
                .update_operators([
                {
                    add_operator: {
                        owner: bob.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                },
                ])
                .send()
            await updateOperators.confirmation();  
            const bobStakeAmount                  = MVK(10);
            const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
            await bobStakeAmountOperation.confirmation();                        
            const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "700").send();
            await bobRegisterAsSatelliteOperation.confirmation();

            // Alice stakes 100 MVK tokens and registers as a satellite 
            await signerFactory(alice.sk);
            updateOperators = await mvkTokenInstance.methods
                .update_operators([
                {
                    add_operator: {
                        owner: alice.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                },
                ])
                .send()
            await updateOperators.confirmation(); 
            const aliceStakeAmount                  = MVK(10);
            const aliceStakeAmountOperation         = await doormanInstance.methods.stake(aliceStakeAmount).send();
            await aliceStakeAmountOperation.confirmation();                        
            const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "700").send();
            await aliceRegisterAsSatelliteOperation.confirmation();

            // Setup funds in Treasury for request tokens later
            // Mallory transfers 200 MVK tokens to Treasury
            await signerFactory(mallory.sk);
            const malloryTransferMvkToTreasuryOperation = await mvkTokenInstance.methods.transfer([
                {
                    from_: mallory.pkh,
                    txs: [
                        {
                            to_: treasuryAddress.address,
                            token_id: 0,
                            amount: MVK(20)
                        }
                    ]
                }
            ]).send();
            await malloryTransferMvkToTreasuryOperation.confirmation();

            // Mallory transfers 250 Mock FA12 Tokens to Treasury
            const malloryTransferMockFa12ToTreasuryOperation = await mockFa12TokenInstance.methods.transfer(mallory.pkh, treasuryAddress.address, 250000000).send();
            await malloryTransferMockFa12ToTreasuryOperation.confirmation();

            // Mallory transfers 250 Mock FA2 Tokens to Treasury
            const malloryTransferMockFa2ToTreasuryOperation = await mockFa2TokenInstance.methods.transfer([
                {
                    from_: mallory.pkh,
                    txs: [
                        {
                            to_: treasuryAddress.address,
                            token_id: 0,
                            amount: 250000000
                        }
                    ]
                }
            ]).send();
            await malloryTransferMockFa2ToTreasuryOperation.confirmation();
            
            // Mallory transfers 250 XTZ to Treasury
            const malloryTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryAddress.address, amount: 100});
            await malloryTransferTezToTreasuryOperation.confirmation();
            
            // const governanceParameterSchema = governanceInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(governanceParameterSchema,null,2));

            // const councilParameterSchema = councilInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(councilParameterSchema,null,2));
            
        }
    });

    describe("%requestMint", async () => {

        it('Council contract should be able to call this entrypoint and mint MVK', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = councilAddress.address;
                governanceStorage              = await governanceInstance.storage();
                const financialRequestID       = governanceStorage.financialRequestCounter;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestMint.natMap
                const councilActionString       = councilActionsRequestMint.stringMap
                const councilActionAddress      = councilActionsRequestMint.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                     = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(financialRequestID, "approve").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await signerFactory(alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(financialRequestID, "approve").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                const updatedGovernanceStorage                         = await governanceInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            
                const mvkTokenStorage                                  = await mvkTokenInstance.storage();
                const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal.toNumber(),        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1000 MVK in its account
                assert.equal(councilMvkLedger.toNumber(), tokenAmount);
            } catch(e){
                console.log(e);
            } 
        });

        it('Other contracts should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                const treasury              = treasuryAddress.address;
                const tokenAmount           = MVK(1000);
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Operation
                await chai.expect(governanceInstance.methods.requestMint(treasury, tokenAmount, purpose).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            } 
        });

        it('Council contract should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map or if the getTotalStakedSupply view does not exist', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                governanceStorage              = await governanceInstance.storage();
                const financialRequestID       = governanceStorage.financialRequestCounter;
                const councilActionId          = councilStorage.actionCounter;

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";

                // Operation
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", eve.pkh).send();
                await updateGeneralContractOperation.confirmation();
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;

                // Reset general Contracts
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.log(e);
            } 
        });

        it('Council contract should not be able to call this entrypoint if the delegation contract is not referenced in the generalContracts map or if the getActiveSatellites view does not exist', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                governanceStorage              = await governanceInstance.storage();
                const financialRequestID       = governanceStorage.financialRequestCounter;


                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";

                // Operation
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", eve.pkh).send();
                await updateGeneralContractOperation.confirmation();
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;

                // Reset general Contracts
                await signerFactory(bob.sk);
                updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", delegationAddress.address).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.log(e);
            } 
        });
    })

    describe("%requestTokens", async () => {

        it('Council contract should be able to call this entrypoint and request tokens (MVK in this example)', async () => {
            try{        
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = councilAddress.address;
                governanceStorage              = await governanceInstance.storage();
                const financialRequestID       = governanceStorage.financialRequestCounter;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(councilAddress.address);
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = treasuryAddress.address;
                const tokenContractAddress     = mvkTokenAddress.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await signerFactory(bob.sk);
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
                councilStorage            = await councilInstance.storage();
                const councilActionsRequestTokens = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestTokens.natMap
                const councilActionString       = councilActionsRequestTokens.stringMap
                const councilActionAddress      = councilActionsRequestTokens.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionAddress.get("tokenContractAddress"),  tokenContractAddress);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionNat.get("tokenId"),      tokenId);
                assert.equal(councilActionString.get("tokenName"),      tokenName);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);
    
                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();
    
                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();
    
                // get updated storage
                governanceStorage                     = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
    
                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestID);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestID);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal.toNumber(),               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal.toNumber(),            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower.toNumber(),      bobStakeAmount);
    
                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance.toNumber(),         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower.toNumber(),        aliceStakeAmount);
    
                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(financialRequestID, "approve").send();
                await bobVotesForFinancialRequestOperation.confirmation();
    
                await signerFactory(alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(financialRequestID, "approve").send();
                await aliceVotesForFinancialRequestOperation.confirmation();
    
                // get updated storage
                const updatedGovernanceStorage                         = await governanceInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestID);            
    
                mvkTokenStorage                                         = await mvkTokenInstance.storage();
                const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);
    
                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1100 MVK in its account (1000 from first test (mint) + 100 from second test (transfer))
                const newTokenAmount = initialCouncilBalance + MVK(100);
                assert.equal(councilMvkLedger.toNumber(), newTokenAmount);
    
            } catch(e){
                console.log(e);
            } 
        });

        it('Council contract should not be able to call this entrypoint with a wrong token type', async () => {
            try{        
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = councilAddress.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(councilAddress.address);
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = treasuryAddress.address;
                const tokenContractAddress     = mvkTokenAddress.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA3";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await signerFactory(bob.sk);
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
                councilStorage            = await councilInstance.storage();
                const councilActionsRequestTokens = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestTokens.natMap
                const councilActionString       = councilActionsRequestTokens.stringMap
                const councilActionAddress      = councilActionsRequestTokens.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionAddress.get("tokenContractAddress"),  tokenContractAddress);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionNat.get("tokenId"),      tokenId);
                assert.equal(councilActionString.get("tokenName"),      tokenName);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);
    
                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();
    
                await signerFactory(eve.sk);
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            } 
        });


        it('Other contracts should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = treasuryAddress.address;
                const tokenContractAddress     = mvkTokenAddress.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";         

                // Operation
                await chai.expect(governanceInstance.methods.requestTokens(treasury, tokenContractAddress, tokenName, tokenAmount, tokenType, tokenId, purpose).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            } 
        });

        it('Council contract should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map or if the getTotalStakedSupply view does not exist', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                governanceStorage              = await governanceInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const financialRequestID       = governanceStorage.financialRequestCounter;

                // request mint params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = treasuryAddress.address;
                const tokenContractAddress     = mvkTokenAddress.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";

                // Operation
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", eve.pkh).send();
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

                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();
    
                await signerFactory(eve.sk);
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;

                // Reset general Contracts
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.log(e);
            } 
        });

        it('Council contract should not be able to call this entrypoint if the delegation contract is not referenced in the generalContracts map or if the getActiveSatellites view does not exist', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const financialRequestID       = governanceStorage.financialRequestCounter;

                // request mint params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = treasuryAddress.address;
                const tokenContractAddress     = mvkTokenAddress.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";

                // Operation
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", eve.pkh).send();
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

                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();
    
                await signerFactory(eve.sk);                
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;

                // Reset general Contracts
                await signerFactory(bob.sk);
                updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", delegationAddress.address).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.log(e);
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
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(councilAddress.address);

                // Get financial request ID on governance
                governanceStorage   = await governanceInstance.storage();
                const financialRequestID  = governanceStorage.financialRequestCounter;
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = treasuryAddress.address;
                const tokenContractAddress     = mvkTokenAddress.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await signerFactory(bob.sk);
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
                councilStorage            = await councilInstance.storage();
                const councilActionsRequestTokens = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestTokens.natMap
                const councilActionString       = councilActionsRequestTokens.stringMap
                const councilActionAddress      = councilActionsRequestTokens.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionAddress.get("tokenContractAddress"),  tokenContractAddress);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionNat.get("tokenId"),      tokenId);
                assert.equal(councilActionString.get("tokenName"),      tokenName);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);
    
                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();
    
                // get updated storage
                var updatedCouncilStorage               = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
    
                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");

                // Drop financial request operation
                await signerFactory(bob.sk);
                updatedCouncilStorage      = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestID).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await signerFactory(alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await eveSignsDropActionActionOperation.confirmation();

                updatedCouncilStorage                   = await councilInstance.storage();
                var councilActionsDropRequestSigned   = await updatedCouncilStorage.councilActionsLedger.get(dropCouncilActionId);
                await signerFactory(bob.sk);

                // check that council action is approved and has been executed
                assert.equal(councilActionsDropRequestSigned.signersCount,  3);
                assert.equal(councilActionsDropRequestSigned.executed,      true);
                assert.equal(councilActionsDropRequestSigned.status,        "EXECUTED");

                // Check that request has been dropped on the governance contract
                governanceStorage   = await governanceInstance.storage();
                const financialRequest = await governanceStorage.financialRequestLedger.get(financialRequestID);
                assert.equal(financialRequest.executed,      false);
                assert.equal(financialRequest.status,        false);

                // Try to sign previous action again with eve
                await chai.expect(governanceInstance.methods.voteForRequest(financialRequestID, "approve").send()).to.be.rejected;
            } catch(e){
                console.log(e);
            } 
        });

        it('Other contracts should not be able to call this entrypoint', async () => {
            try{
                
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(councilAddress.address);
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = treasuryAddress.address;
                const tokenContractAddress     = mvkTokenAddress.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await signerFactory(bob.sk);
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
                councilStorage            = await councilInstance.storage();
                const councilActionsRequestTokens = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestTokens.natMap
                const councilActionString       = councilActionsRequestTokens.stringMap
                const councilActionAddress      = councilActionsRequestTokens.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionAddress.get("tokenContractAddress"),  tokenContractAddress);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionNat.get("tokenId"),      tokenId);
                assert.equal(councilActionString.get("tokenName"),      tokenName);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);
    
                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsDropActionActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsDropActionActionOperation.confirmation();
    
                // get updated storage
                var updatedCouncilStorage               = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
    
                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");

                // Get financial request ID on governance
                governanceStorage   = await governanceInstance.storage();
                const financialRequestID  = governanceStorage.financialRequestCounter - 1;

                await chai.expect(governanceInstance.methods.dropFinancialRequest(financialRequestID).send()).to.be.rejected;
                
            } catch(e){
                console.log(e);
            }
        });

        it('Council contract should not be able to drop a non-existing financial request', async () => {
            try{
                // Get financial request ID on governance
                const financialRequestID  = 9999;

                // Drop financial request operation
                await signerFactory(bob.sk);
                var updatedCouncilStorage  = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestID).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await signerFactory(alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await signerFactory(eve.sk);
                await chai.expect(councilInstance.methods.signAction(dropCouncilActionId).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Council contract should not be able to drop a previously executed financial request', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;
                const councilContractAddress   = councilAddress.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                mvkTokenStorage                = await mvkTokenInstance.storage();
                const councilMvkLedgerInit     = await mvkTokenStorage.ledger.get(councilContractAddress);

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestMint.natMap
                const councilActionString       = councilActionsRequestMint.stringMap
                const councilActionAddress      = councilActionsRequestMint.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                   = await governanceInstance.storage();
                var updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await signerFactory(alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                const updatedGovernanceStorage                         = await governanceInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal.toNumber(),        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1000 MVK in its account
                mvkTokenStorage                = await mvkTokenInstance.storage();
                const councilMvkLedger     = await mvkTokenStorage.ledger.get(councilContractAddress);
                assert.equal(councilMvkLedger.toNumber(), tokenAmount + councilMvkLedgerInit.toNumber());

                // DROP PREVIOUSLY EXECUTED REQUEST
                await signerFactory(bob.sk);
                updatedCouncilStorage  = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(governanceRequestID).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await signerFactory(alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await signerFactory(eve.sk);
                await chai.expect(councilInstance.methods.signAction(dropCouncilActionId).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            } 
        });


        it('Council contract should not be able to drop an expired financial request', async () => {
            try{
                // Change governance financial request expiry date
                await signerFactory(bob.sk);
                const updateFinancialExpiry    = await governanceInstance.methods.updateConfig(0, "configFinancialReqDurationDays").send()
                await updateFinancialExpiry.confirmation();

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;
                const councilContractAddress   = councilAddress.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestMint.natMap
                const councilActionString       = councilActionsRequestMint.stringMap
                const councilActionAddress      = councilActionsRequestMint.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                   = await governanceInstance.storage();
                var updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // DROP PREVIOUSLY EXECUTED REQUEST
                await signerFactory(bob.sk);
                updatedCouncilStorage  = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(governanceRequestID).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await signerFactory(alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await signerFactory(eve.sk);
                await chai.expect(councilInstance.methods.signAction(dropCouncilActionId).send()).to.be.rejected;

                // Reset financial request expiry date
                await signerFactory(bob.sk);
                const updateFinancialExpiryReset    = await governanceInstance.methods.updateConfig(1, "configFinancialReqDurationDays").send()
                await updateFinancialExpiryReset.confirmation();
            } catch(e){
                console.log(e);
            } 
        });
    })

    describe("%voteRequest", async () => {

        it('Non-satellite should not be able to call this entrypoint', async () => {
            try{
                // Try to sign action again with mallory
                await signerFactory(mallory.sk);
                await chai.expect(governanceInstance.methods.voteForRequest(9999, "disapprove").send()).to.be.rejected;
                await signerFactory(bob.sk);
            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should not be able to call this entrypoint if the financial request does not exist', async () => {
            try{
                // Try to sign action again with bob
                await chai.expect(governanceInstance.methods.voteForRequest(9999, "disapprove").send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Satellite should not be able to call this entrypoint if the delegation contract is not referenced in the generalContracts map or if the getSatelliteOpt view does not exist', async () => {
            try{
                // Try to sign action again with bob
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", eve.pkh).send();
                await updateGeneralContractOperation.confirmation();
                await chai.expect(governanceInstance.methods.voteForRequest(9999, "disapprove").send()).to.be.rejected;
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", delegationAddress.address).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });

        it('Satellite should not be able to call this entrypoint if the financial request was dropped', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                var mvkTokenStorage            = await mvkTokenInstance.storage();
                const initialCouncilBalance    = await mvkTokenStorage.ledger.get(councilAddress.address);

                // Get financial request ID on governance
                governanceStorage   = await governanceInstance.storage();
                const financialRequestID  = governanceStorage.financialRequestCounter;
    
                // request tokens params
                const tokenAmount              = MVK(100); // 100 MVK
                const treasury                 = treasuryAddress.address;
                const tokenContractAddress     = mvkTokenAddress.address; 
                const tokenName                = "MVK";
                const tokenType                = "FA2";
                const tokenId                  = 0;
                const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            
    
                // Council member (bob) requests for MVK to be transferred from the Treasury
                await signerFactory(bob.sk);
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
                councilStorage            = await councilInstance.storage();
                const councilActionsRequestTokens = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestTokens.natMap
                const councilActionString       = councilActionsRequestTokens.stringMap
                const councilActionAddress      = councilActionsRequestTokens.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionAddress.get("tokenContractAddress"),  tokenContractAddress);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionNat.get("tokenId"),      tokenId);
                assert.equal(councilActionString.get("tokenName"),      tokenName);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);
    
                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();
    
                // get updated storage
                var updatedCouncilStorage               = await councilInstance.storage();
                const councilActionsRequestMintSigned   = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);
    
                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");

                // Drop financial request operation
                await signerFactory(bob.sk);
                updatedCouncilStorage      = await councilInstance.storage();
                const dropCouncilActionId  = updatedCouncilStorage.actionCounter;
                const dropRequestOperation = await councilInstance.methods.councilActionDropFinancialReq(financialRequestID).send();
                await dropRequestOperation.confirmation();

                // sign drop 
                await signerFactory(alice.sk);
                const aliceSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await aliceSignsDropActionActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsDropActionActionOperation = await councilInstance.methods.signAction(dropCouncilActionId).send();
                await eveSignsDropActionActionOperation.confirmation();

                updatedCouncilStorage                   = await councilInstance.storage();
                var councilActionsDropRequestSigned   = await updatedCouncilStorage.councilActionsLedger.get(dropCouncilActionId);
                await signerFactory(bob.sk);

                // check that council action is approved and has been executed
                assert.equal(councilActionsDropRequestSigned.signersCount,  3);
                assert.equal(councilActionsDropRequestSigned.executed,      true);
                assert.equal(councilActionsDropRequestSigned.status,        "EXECUTED");

                // Check that request has been dropped on the governance contract
                governanceStorage   = await governanceInstance.storage();
                const financialRequest = await governanceStorage.financialRequestLedger.get(financialRequestID);
                assert.equal(financialRequest.executed,      false);
                assert.equal(financialRequest.status,        false);

                // Try to sign previous action again with eve
                await chai.expect(governanceInstance.methods.voteForRequest(financialRequestID, "approve").send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Satellite should not be able to call this entrypoint if the financial request was already executed', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = councilAddress.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestMint.natMap
                const councilActionString       = councilActionsRequestMint.stringMap
                const councilActionAddress      = councilActionsRequestMint.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                     = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                console.log(governanceStorage.snapshotStakedMvkTotalSupply)
                console.log(governanceStorage.config.financialRequestApprovalPercentage)

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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await signerFactory(alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                const updatedGovernanceStorage                         = await governanceInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            
                const mvkTokenStorage                                  = await mvkTokenInstance.storage();
                const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal.toNumber(),        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1000 MVK in its account
                assert.equal(councilMvkLedger.toNumber(), tokenAmount);

                // Try to vote for the request again
                await signerFactory(alice.sk);
                await chai.expect(governanceInstance.methods.voteForRequest(governanceRequestID, "disapprove").send()).to.be.rejected;
            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should be able to change its vote', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = councilAddress.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestMint.natMap
                const councilActionString       = councilActionsRequestMint.stringMap
                const councilActionAddress      = councilActionsRequestMint.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                     = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(governanceRequestID);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(governanceRequestID);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                console.log(governanceStorage.snapshotStakedMvkTotalSupply)
                console.log(governanceStorage.config.financialRequestApprovalPercentage)

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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobApproveFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await bobApproveFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                var updatedGovernanceStorage                         = await governanceInstance.storage();        
                var updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(governanceRequestID);
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal, bobStakeAmount)
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal, 0)

                // change vote and disapprove financial request
                const bobDisapproveFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "disapprove").send();
                await bobDisapproveFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                updatedGovernanceStorage                         = await governanceInstance.storage();        
                updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(governanceRequestID);
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal, 0)
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal, bobStakeAmount)

                // change vote and disapprove financial request again
                const bobDisapproveFinancialRequestOperationAgain = await governanceInstance.methods.voteForRequest(governanceRequestID, "disapprove").send();
                await bobDisapproveFinancialRequestOperationAgain.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                updatedGovernanceStorage                         = await governanceInstance.storage();        
                updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(governanceRequestID);
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal, 0)
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal, bobStakeAmount)
            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should not be able to call this entrypoint if the financial request expired', async () => {
            try{
                // Change governance financial request expiry date
                await signerFactory(bob.sk);
                const updateFinancialExpiry    = await governanceInstance.methods.updateConfig(0, "configFinancialReqDurationDays").send()
                await updateFinancialExpiry.confirmation();

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = councilAddress.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestMint.natMap
                const councilActionString       = councilActionsRequestMint.stringMap
                const councilActionAddress      = councilActionsRequestMint.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                     = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                console.log(governanceStorage.snapshotStakedMvkTotalSupply)
                console.log(governanceStorage.config.financialRequestApprovalPercentage)

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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                await chai.expect(governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send()).to.be.rejected;

                // Reset financial request expiry date
                const updateFinancialExpiryReset    = await governanceInstance.methods.updateConfig(1, "configFinancialReqDurationDays").send()
                await updateFinancialExpiryReset.confirmation();
            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should not be able to approve a request if the council contract is not referenced in the generalContracts map', async () => {
            try{
                // Replace council contract
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("council", eve.pkh).send();
                await updateGeneralContractOperation.confirmation();

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = councilAddress.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestMint.natMap
                const councilActionString       = councilActionsRequestMint.stringMap
                const councilActionAddress      = councilActionsRequestMint.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                await chai.expect(councilInstance.methods.signAction(councilActionId).send()).to.be.rejected;

                // Reset council contract
                await signerFactory(bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("council", councilAddress.address).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should be able to call this entrypoint and request transfer of FA12 token', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress        = councilAddress.address;
                const bobStakeAmount                = MVK(10);
                const aliceStakeAmount              = MVK(10);
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;

                // request tokens params
                const tokenAmount                   = 100000000; // 100 Mock FA12 Tokens
                const treasury                      = treasuryAddress.address;
                const mockFa12TokenContractAddress  = mockFa12TokenInstance.address; 
                const tokenName                     = "MOCKFA12";
                const tokenType                     = "FA12";
                const tokenId                       = 0;
                const purpose                       = "Test Council Request Transfer of 100 Mock FA12 Tokens";            

                // Council member (bob) requests for mock FA12 token to be transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
                        mockFa12TokenContractAddress,
                        tokenName, 
                        tokenAmount, 
                        tokenType, 
                        tokenId, 
                        purpose
                    ).send();
                await councilRequestsTokensOperation.confirmation();

                // get new council storage and assert tests
                councilStorage                = await councilInstance.storage();
                const councilActionsRequestTokens   = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat              = councilActionsRequestTokens.natMap
                const councilActionString           = councilActionsRequestTokens.stringMap
                const councilActionAddress          = councilActionsRequestTokens.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionAddress.get("tokenContractAddress"),  mockFa12TokenContractAddress);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionNat.get("tokenId"),      tokenId);
                assert.equal(councilActionString.get("tokenName"),      tokenName);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestTokensActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestTokensActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestTokensActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestTokensActionOperation.confirmation();

                // get updated storage
                governanceStorage                       = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestTokensSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestTokensSigned.signersCount,  3);
                assert.equal(councilActionsRequestTokensSigned.executed,      true);
                assert.equal(councilActionsRequestTokensSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = councilActionId;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           mockFa12TokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequestLedger.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequestLedger.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await signerFactory(alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                const updatedGovernanceStorage                         = await governanceInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            

                const mockFa12TokenStorage                             = await mockFa12TokenInstance.storage();
                const councilMockFa12Ledger                            = await mockFa12TokenStorage.ledger.get(councilContractAddress);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 100 Mock FA12 Tokens in its account
                assert.equal(councilMockFa12Ledger.balance, tokenAmount);

            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should be able to call this entrypoint and request transfer of FA2 token', async () => {
            try{
                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;                
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;

                // request tokens params
                const tokenAmount                   = 100000000; // 100 Mock FA2 Tokens
                const treasury                      = treasuryAddress.address;
                const mockFa2TokenContractAddress   = mockFa2TokenInstance.address; 
                const tokenName                     = "MOCKFA2";
                const tokenType                     = "FA2";
                const tokenId                       = 0;
                const purpose                       = "Test Council Request Transfer of 100 Mock FA2 Tokens";            

                // Council member (bob) requests for mock FA2 token to be transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsTokensOperation = await councilInstance.methods.councilActionRequestTokens(
                        treasury, 
                        mockFa2TokenContractAddress,
                        tokenName, 
                        tokenAmount, 
                        tokenType, 
                        tokenId, 
                        purpose
                    ).send();
                await councilRequestsTokensOperation.confirmation();

                // get new council storage and assert tests
                councilStorage            = await councilInstance.storage();
                const councilActionsRequestTokens = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat              = councilActionsRequestTokens.natMap
                const councilActionString           = councilActionsRequestTokens.stringMap
                const councilActionAddress          = councilActionsRequestTokens.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionAddress.get("tokenContractAddress"),  mockFa2TokenContractAddress);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionNat.get("tokenId"),      tokenId);
                assert.equal(councilActionString.get("tokenName"),      tokenName);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                     = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = councilActionId;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                // check details of financial request
                assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilAddress.address);
                assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
                assert.equal(governanceFinancialRequestLedger.status,                         true);
                assert.equal(governanceFinancialRequestLedger.executed,                       false);
                assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
                assert.equal(governanceFinancialRequestLedger.tokenContractAddress,           mockFa2TokenContractAddress);
                assert.equal(governanceFinancialRequestLedger.tokenName,                      tokenName);
                assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);
                assert.equal(governanceFinancialRequestLedger.tokenType,                      tokenType);
                assert.equal(governanceFinancialRequestLedger.tokenId,                        tokenId);
                assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await signerFactory(alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                const updatedGovernanceStorage                         = await governanceInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            

                const mockFa2TokenStorage                              = await mockFa2TokenInstance.storage();
                const councilMockFa2Ledger                             = await mockFa2TokenStorage.ledger.get(councilAddress.address);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 100 Mock FA2 Tokens in its account
                assert.equal(councilMockFa2Ledger, tokenAmount);

            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should be able to call this entrypoint and request transfer of XTZ', async () => {
            try{        
                // some init constants
                var councilStorage                  = await councilInstance.storage();
                const councilActionId               = councilStorage.actionCounter;    
                const councilContractAddress        = councilAddress.address;
                const bobStakeAmount                = MVK(10);
                const aliceStakeAmount              = MVK(10);
                var governanceStorage               = await governanceInstance.storage();
                const governanceRequestID           = governanceStorage.financialRequestCounter;

                // request tokens params
                const tokenAmount                   = 100000000; // 100 XTZ
                const zeroAddress                   = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
                const treasury                      = treasuryAddress.address;
                const tokenContractAddress          = zeroAddress;
                const tokenName                     = "XTZ";
                const tokenType                     = "TEZ";
                const tokenId                       = 0;
                const purpose                       = "Test Council Request Transfer of 100 XTZ";            

                // Council member (bob) requests for MVK to be minted
                await signerFactory(bob.sk);
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
                const councilActionNat              = councilActionsRequestTokens.natMap
                const councilActionString           = councilActionsRequestTokens.stringMap
                const councilActionAddress          = councilActionsRequestTokens.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestTokens.actionType,       "requestTokens");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionAddress.get("tokenContractAddress"),  zeroAddress);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionNat.get("tokenId"),      0);
                assert.equal(councilActionString.get("tokenName"),      tokenName);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionString.get("tokenType"),      tokenType);
                assert.equal(councilActionsRequestTokens.executed,         false);
                assert.equal(councilActionsRequestTokens.status,           "PENDING");
                assert.equal(councilActionsRequestTokens.signersCount,     1);
                assert.equal(councilActionsRequestTokens.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                     = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = councilActionId;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval,   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await signerFactory(alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage
                const updatedGovernanceStorage                         = await governanceInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(governanceRequestID);             
                const councilTezBalance                                = await utils.tezos.tz.getBalance(councilContractAddress);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 100 XTZ in its balance
                assert.equal(councilTezBalance, tokenAmount);

            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should be able to call this entrypoint and mint MVK', async () => {
            try{

                // some init constants
                var councilStorage             = await councilInstance.storage();
                const councilActionId          = councilStorage.actionCounter;
                const councilContractAddress   = councilAddress.address;
                const bobStakeAmount           = MVK(10);
                const aliceStakeAmount         = MVK(10);
                var governanceStorage          = await governanceInstance.storage();
                const governanceRequestID      = governanceStorage.financialRequestCounter;

                // request mint params
                const treasury              = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address; 
                const tokenAmount           = MVK(1000); // 1000 MVK
                const purpose               = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // get new council storage and assert tests            
                councilStorage                  = await councilInstance.storage();
                const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
                const councilActionNat          = councilActionsRequestMint.natMap
                const councilActionString       = councilActionsRequestMint.stringMap
                const councilActionAddress      = councilActionsRequestMint.addressMap
                
                // check details of council action
                assert.equal(councilActionsRequestMint.actionType,       "requestMint");
                assert.equal(councilActionAddress.get("treasuryAddress"),  treasury);
                assert.equal(councilActionNat.get("tokenAmount"),      tokenAmount);
                assert.equal(councilActionString.get("purpose"),      purpose);
                assert.equal(councilActionsRequestMint.executed,         false);
                assert.equal(councilActionsRequestMint.status,           "PENDING");
                assert.equal(councilActionsRequestMint.signersCount,     1);
                assert.equal(councilActionsRequestMint.signers[0],       bob.pkh);

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // get updated storage
                governanceStorage                     = await governanceInstance.storage();
                const updatedCouncilStorage           = await councilInstance.storage();
                const councilActionsRequestMintSigned = await updatedCouncilStorage.councilActionsLedger.get(councilActionId);

                // check that council action is approved and has been executed
                assert.equal(councilActionsRequestMintSigned.signersCount,  3);
                assert.equal(councilActionsRequestMintSigned.executed,      true);
                assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
                
                const financialRequestCounter                  = governanceStorage.financialRequestCounter - 1;
                const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
                const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
                
                const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
                const financialRequestPercentageDecimals       = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

                console.log(governanceStorage.snapshotStakedMvkTotalSupply)
                console.log(governanceStorage.config.financialRequestApprovalPercentage)

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
                assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
                assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
                assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
                assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
                // check details of financial request snapshot ledger
                const bobFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
                assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,  0);
                assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,       bobStakeAmount);
                assert.equal(bobFinancialRequestSnapshot.totalVotingPower,      bobStakeAmount);

                const aliceFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
                assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,    0);
                assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,         aliceStakeAmount);
                assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,        aliceStakeAmount);

                // satellites vote and approve financial request
                await signerFactory(bob.sk);
                const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await bobVotesForFinancialRequestOperation.confirmation();

                await signerFactory(alice.sk);
                const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(governanceRequestID, "approve").send();
                await aliceVotesForFinancialRequestOperation.confirmation();

                // get updated storage (governance financial request ledger and council account in mvk token contract)
                const updatedGovernanceStorage                         = await governanceInstance.storage();        
                const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            
                const mvkTokenStorage                                  = await mvkTokenInstance.storage();
                const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);

                // check that financial request has been executed
                assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal.toNumber(),        MVK(20));
                assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal.toNumber(),     0);
                assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
                assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            
                // check that council now has 1000 MVK in its account
                assert.equal(councilMvkLedger.toNumber(), tokenAmount);
            } catch(e){
                console.log(e);
            } 
        });
    })
});