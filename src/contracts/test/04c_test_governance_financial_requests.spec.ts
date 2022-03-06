const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

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
        await utils.init(alice.sk);
        
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
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: '   + bob.pkh);
        console.log('Eve address: '   + eve.pkh);

        // Setup governance satellites for financial request snapshot later
        // ------------------------------------------------------------------

        // Alice stakes 100 MVK tokens and registers as a satellite            
        const aliceStakeAmount                  = 100000000;
        const aliceStakeAmountOperation         = await doormanInstance.methods.stake(aliceStakeAmount).send();
        await aliceStakeAmountOperation.confirmation();                        
        const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "700").send();
        await aliceRegisterAsSatelliteOperation.confirmation();

        // Bob stakes 100 MVK tokens and registers as a satellite 
        await signerFactory(bob.sk);
        const bobStakeAmount                  = 100000000;
        const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
        await bobStakeAmountOperation.confirmation();                        
        const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "700").send();
        await bobRegisterAsSatelliteOperation.confirmation();

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
                        amount: 200000000
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
        
    });

    it('council sends request to treasury to mint MVK', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council sends request to treasury to mint MVK") 
            console.log("---") // break

            // some init constants
            const councilActionId          = 1;
            const councilContractAddress   = councilAddress.address;
            const aliceStakeAmount         = 100000000;
            const bobStakeAmount           = 100000000;

            // request mint params
            const treasury              = treasuryAddress.address;
            const tokenContractAddress  = mvkTokenAddress.address; 
            const tokenName             = "MVK";
            const tokenAmount           = 1000000000; // 1000 MVK
            const tokenType             = "FA2";
            const tokenId               = 0;
            const purpose               = "Test Council Request Mint 1000 MVK";            

            // Council member (alice) requests for MVK to be minted and transferred from the Treasury
            await signerFactory(alice.sk);
            const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                    treasury, 
                    tokenAmount, 
                    tokenType, 
                    tokenId, 
                    purpose
                ).send();
            await councilRequestsMintOperation.confirmation();

            // get new council storage and assert tests            
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const councilStorage            = await councilInstance.storage();
            const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
            
            // check details of council action
            assert.equal(councilActionsRequestMint.actionType,       "requestMint");
            assert.equal(councilActionsRequestMint.address_param_1,  treasury);
            assert.equal(councilActionsRequestMint.address_param_2,  zeroAddress);
            assert.equal(councilActionsRequestMint.address_param_3,  zeroAddress);
            assert.equal(councilActionsRequestMint.nat_param_1,      tokenAmount);
            assert.equal(councilActionsRequestMint.nat_param_2,      0);
            assert.equal(councilActionsRequestMint.nat_param_3,      0);
            assert.equal(councilActionsRequestMint.string_param_1,   purpose);
            assert.equal(councilActionsRequestMint.string_param_2,   tokenType);
            assert.equal(councilActionsRequestMint.string_param_3,   "EMPTY");
            assert.equal(councilActionsRequestMint.executed,         false);
            assert.equal(councilActionsRequestMint.status,           "PENDING");
            assert.equal(councilActionsRequestMint.signersCount,     1);
            assert.equal(councilActionsRequestMint.signers[0],       alice.pkh);

            // council members sign action, and action is executed once threshold of 3 signers is reached
            await signerFactory(bob.sk);
            const bobSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await bobSignsRequestMintActionOperation.confirmation();

            await signerFactory(eve.sk);
            const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await eveSignsRequestMintActionOperation.confirmation();

            // get updated storage
            const governanceStorage               = await governanceInstance.storage();
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
            const totalStakedMvkSupply                     = aliceStakeAmount + bobStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

            // check details of financial request
            assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
            assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
            assert.equal(governanceFinancialRequestLedger.status,                         true);
            assert.equal(governanceFinancialRequestLedger.ready,                          true);
            assert.equal(governanceFinancialRequestLedger.executed,                       false);
            assert.equal(governanceFinancialRequestLedger.expired,                        false);
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
            const aliceFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
            assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,  0);
            assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,       aliceStakeAmount);
            assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,      aliceStakeAmount);

            const bobFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
            assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,    0);
            assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,         bobStakeAmount);
            assert.equal(bobFinancialRequestSnapshot.totalVotingPower,        bobStakeAmount);

            // satellites vote and approve financial request
            await signerFactory(alice.sk);
            const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await aliceVotesForFinancialRequestOperation.confirmation();

            await signerFactory(bob.sk);
            const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await bobVotesForFinancialRequestOperation.confirmation();

            // get updated storage (governance financial request ledger and council account in mvk token contract)
            const updatedGovernanceStorage                         = await governanceInstance.storage();        
            const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            
            const mvkTokenStorage                                  = await mvkTokenInstance.storage();
            const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);

            // check that financial request has been executed
            assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        200000000);
            assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
            assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
            assert.equal(updatedGovernanceFinancialRequestLedger.ready,                   true);
            assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            assert.equal(updatedGovernanceFinancialRequestLedger.expired,                 false);
        
            // check that council now has 1000 MVK in its account
            assert.equal(councilMvkLedger, tokenAmount);

        } catch(e){
            console.log(e);
        } 
    });

    it('council sends request to treasury to transfer MVK', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council sends request to treasury to transfer MVK") 
            console.log("---") // break

            // some init constants
            const councilActionId          = 2;
            const councilContractAddress   = councilAddress.address;
            const aliceStakeAmount         = 100000000;
            const bobStakeAmount           = 100000000;

            // request tokens params
            const tokenAmount              = 100000000; // 100 MVK
            const treasury                 = treasuryAddress.address;
            const tokenContractAddress     = mvkTokenAddress.address; 
            const tokenName                = "MVK";
            const tokenType                = "FA2";
            const tokenId                  = 0;
            const purpose                  = "Test Council Request Transfer of 100 MVK Tokens";            

            // Council member (alice) requests for MVK to be transferred from the Treasury
            await signerFactory(alice.sk);
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
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";        
            const councilStorage            = await councilInstance.storage();
            const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);
            
            // check details of council action
            assert.equal(councilActionsRequestMint.actionType,       "requestTokens");
            assert.equal(councilActionsRequestMint.address_param_1,  treasury);
            assert.equal(councilActionsRequestMint.address_param_2,  tokenContractAddress);
            assert.equal(councilActionsRequestMint.address_param_3,  zeroAddress);
            assert.equal(councilActionsRequestMint.nat_param_1,      tokenAmount);
            assert.equal(councilActionsRequestMint.nat_param_2,      0);
            assert.equal(councilActionsRequestMint.nat_param_3,      0);
            assert.equal(councilActionsRequestMint.string_param_1,   tokenName);
            assert.equal(councilActionsRequestMint.string_param_2,   purpose);
            assert.equal(councilActionsRequestMint.string_param_3,   tokenType);
            assert.equal(councilActionsRequestMint.executed,         false);
            assert.equal(councilActionsRequestMint.status,           "PENDING");
            assert.equal(councilActionsRequestMint.signersCount,     1);
            assert.equal(councilActionsRequestMint.signers[0],       alice.pkh);

            // council members sign action, and action is executed once threshold of 3 signers is reached
            await signerFactory(bob.sk);
            const bobSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await bobSignsRequestMintActionOperation.confirmation();

            await signerFactory(eve.sk);
            const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await eveSignsRequestMintActionOperation.confirmation();

            // get updated storage
            const governanceStorage               = await governanceInstance.storage();
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
            const totalStakedMvkSupply                     = aliceStakeAmount + bobStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

            // check details of financial request
            assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
            assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
            assert.equal(governanceFinancialRequestLedger.status,                         true);
            assert.equal(governanceFinancialRequestLedger.ready,                          true);
            assert.equal(governanceFinancialRequestLedger.executed,                       false);
            assert.equal(governanceFinancialRequestLedger.expired,                        false);
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
            const aliceFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
            assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,  0);
            assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,       aliceStakeAmount);
            assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,      aliceStakeAmount);

            const bobFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
            assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,    0);
            assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,         bobStakeAmount);
            assert.equal(bobFinancialRequestSnapshot.totalVotingPower,        bobStakeAmount);

            // satellites vote and approve financial request
            await signerFactory(alice.sk);
            const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await aliceVotesForFinancialRequestOperation.confirmation();

            await signerFactory(bob.sk);
            const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await bobVotesForFinancialRequestOperation.confirmation();

            // get updated storage
            const updatedGovernanceStorage                         = await governanceInstance.storage();        
            const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            

            const mvkTokenStorage                                  = await mvkTokenInstance.storage();
            const councilMvkLedger                                 = await mvkTokenStorage.ledger.get(councilContractAddress);

            // check that financial request has been executed
            assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        200000000);
            assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
            assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
            assert.equal(updatedGovernanceFinancialRequestLedger.ready,                   true);
            assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            assert.equal(updatedGovernanceFinancialRequestLedger.expired,                 false);
        
            // check that council now has 1100 MVK in its account (1000 from first test (mint) + 100 from second test (transfer))
            const newTokenAmount = tokenAmount + 1000000000;
            assert.equal(councilMvkLedger, newTokenAmount);

        } catch(e){
            console.log(e);
        } 
    });

    it('council sends request to treasury to transfer mock FA12 token', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council sends request to treasury to transfer mock FA12 token") 
            console.log("---") // break

            // some init constants
            const councilActionId               = 3;
            const councilContractAddress        = councilAddress.address;
            const aliceStakeAmount              = 100000000;
            const bobStakeAmount                = 100000000;

            // request tokens params
            const tokenAmount                   = 100000000; // 100 Mock FA12 Tokens
            const treasury                      = treasuryAddress.address;
            const mockFa12TokenContractAddress  = mockFa12TokenInstance.address; 
            const tokenName                     = "MOCKFA12";
            const tokenType                     = "FA12";
            const tokenId                       = 0;
            const purpose                       = "Test Council Request Transfer of 100 Mock FA12 Tokens";            

            // Council member (alice) requests for mock FA12 token to be transferred from the Treasury
            await signerFactory(alice.sk);
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
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const councilStorage            = await councilInstance.storage();
            const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);

            // check details of council action
            assert.equal(councilActionsRequestMint.actionType,       "requestTokens");
            assert.equal(councilActionsRequestMint.address_param_1,  treasury);
            assert.equal(councilActionsRequestMint.address_param_2,  mockFa12TokenContractAddress);
            assert.equal(councilActionsRequestMint.address_param_3,  zeroAddress);
            assert.equal(councilActionsRequestMint.nat_param_1,      tokenAmount);
            assert.equal(councilActionsRequestMint.nat_param_2,      0);
            assert.equal(councilActionsRequestMint.nat_param_3,      0);
            assert.equal(councilActionsRequestMint.string_param_1,   tokenName);
            assert.equal(councilActionsRequestMint.string_param_2,   purpose);
            assert.equal(councilActionsRequestMint.string_param_3,   tokenType);
            assert.equal(councilActionsRequestMint.executed,         false);
            assert.equal(councilActionsRequestMint.status,           "PENDING");
            assert.equal(councilActionsRequestMint.signersCount,     1);
            assert.equal(councilActionsRequestMint.signers[0],       alice.pkh);

            // council members sign action, and action is executed once threshold of 3 signers is reached
            await signerFactory(bob.sk);
            const bobSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await bobSignsRequestMintActionOperation.confirmation();

            await signerFactory(eve.sk);
            const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await eveSignsRequestMintActionOperation.confirmation();

            // get updated storage
            const governanceStorage               = await governanceInstance.storage();
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
            const totalStakedMvkSupply                     = aliceStakeAmount + bobStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

            // check details of financial request
            assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
            assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
            assert.equal(governanceFinancialRequestLedger.status,                         true);
            assert.equal(governanceFinancialRequestLedger.ready,                          true);
            assert.equal(governanceFinancialRequestLedger.executed,                       false);
            assert.equal(governanceFinancialRequestLedger.expired,                        false);
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
            const aliceFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
            assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,  0);
            assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,       aliceStakeAmount);
            assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,      aliceStakeAmount);

            const bobFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
            assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,    0);
            assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,         bobStakeAmount);
            assert.equal(bobFinancialRequestSnapshot.totalVotingPower,        bobStakeAmount);

            // satellites vote and approve financial request
            await signerFactory(alice.sk);
            const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await aliceVotesForFinancialRequestOperation.confirmation();

            await signerFactory(bob.sk);
            const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await bobVotesForFinancialRequestOperation.confirmation();

            // get updated storage
            const updatedGovernanceStorage                         = await governanceInstance.storage();        
            const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            

            const mockFa12TokenStorage                             = await mockFa12TokenInstance.storage();
            const councilMockFa12Ledger                            = await mockFa12TokenStorage.ledger.get(councilContractAddress);

            // check that financial request has been executed
            assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        200000000);
            assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
            assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
            assert.equal(updatedGovernanceFinancialRequestLedger.ready,                   true);
            assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            assert.equal(updatedGovernanceFinancialRequestLedger.expired,                 false);
        
            // check that council now has 100 Mock FA12 Tokens in its account
            assert.equal(councilMockFa12Ledger.balance, tokenAmount);

        } catch(e){
            console.log(e);
        } 
    });

    it('council sends request to treasury to transfer mock FA2 token', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council sends request to treasury to transfer mock FA2 token") 
            console.log("---") // break

            // some init constants
            const councilActionId               = 4;
            const councilContractAddress        = councilAddress.address;
            const aliceStakeAmount              = 100000000;
            const bobStakeAmount                = 100000000;

            // request tokens params
            const tokenAmount                   = 100000000; // 100 Mock FA2 Tokens
            const treasury                      = treasuryAddress.address;
            const mockFa2TokenContractAddress   = mockFa2TokenInstance.address; 
            const tokenName                     = "MOCKFA2";
            const tokenType                     = "FA2";
            const tokenId                       = 0;
            const purpose                       = "Test Council Request Transfer of 100 Mock FA2 Tokens";            

            // Council member (alice) requests for mock FA2 token to be transferred from the Treasury
            await signerFactory(alice.sk);
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
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const councilStorage            = await councilInstance.storage();
            const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);

            // check details of council action
            assert.equal(councilActionsRequestMint.actionType,       "requestTokens");
            assert.equal(councilActionsRequestMint.address_param_1,  treasury);
            assert.equal(councilActionsRequestMint.address_param_2,  mockFa2TokenContractAddress);
            assert.equal(councilActionsRequestMint.address_param_3,  zeroAddress);
            assert.equal(councilActionsRequestMint.nat_param_1,      tokenAmount);
            assert.equal(councilActionsRequestMint.nat_param_2,      0);
            assert.equal(councilActionsRequestMint.nat_param_3,      0);
            assert.equal(councilActionsRequestMint.string_param_1,   tokenName);
            assert.equal(councilActionsRequestMint.string_param_2,   purpose);
            assert.equal(councilActionsRequestMint.string_param_3,   tokenType);
            assert.equal(councilActionsRequestMint.executed,         false);
            assert.equal(councilActionsRequestMint.status,           "PENDING");
            assert.equal(councilActionsRequestMint.signersCount,     1);
            assert.equal(councilActionsRequestMint.signers[0],       alice.pkh);

            // council members sign action, and action is executed once threshold of 3 signers is reached
            await signerFactory(bob.sk);
            const bobSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await bobSignsRequestMintActionOperation.confirmation();

            await signerFactory(eve.sk);
            const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await eveSignsRequestMintActionOperation.confirmation();

            // get updated storage
            const governanceStorage               = await governanceInstance.storage();
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
            const totalStakedMvkSupply                     = aliceStakeAmount + bobStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

            // check details of financial request
            assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
            assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
            assert.equal(governanceFinancialRequestLedger.status,                         true);
            assert.equal(governanceFinancialRequestLedger.ready,                          true);
            assert.equal(governanceFinancialRequestLedger.executed,                       false);
            assert.equal(governanceFinancialRequestLedger.expired,                        false);
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
            const aliceFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
            assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,  0);
            assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,       aliceStakeAmount);
            assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,      aliceStakeAmount);

            const bobFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
            assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,    0);
            assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,         bobStakeAmount);
            assert.equal(bobFinancialRequestSnapshot.totalVotingPower,        bobStakeAmount);

            // satellites vote and approve financial request
            await signerFactory(alice.sk);
            const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await aliceVotesForFinancialRequestOperation.confirmation();

            await signerFactory(bob.sk);
            const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await bobVotesForFinancialRequestOperation.confirmation();

            // get updated storage
            const updatedGovernanceStorage                         = await governanceInstance.storage();        
            const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);            

            const mockFa2TokenStorage                              = await mockFa2TokenInstance.storage();
            const councilMockFa2Ledger                             = await mockFa2TokenStorage.ledger.get(councilContractAddress);

            // check that financial request has been executed
            assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        200000000);
            assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
            assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
            assert.equal(updatedGovernanceFinancialRequestLedger.ready,                   true);
            assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            assert.equal(updatedGovernanceFinancialRequestLedger.expired,                 false);
        
            // check that council now has 100 Mock FA2 Tokens in its account
            assert.equal(councilMockFa2Ledger, tokenAmount);

        } catch(e){
            console.log(e);
        } 
    });
    
    it('council sends request to treasury to transfer XTZ', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council sends request to treasury to transfer XTZ") 
            console.log("---") // break

            // some init constants
            const councilActionId               = 5;
            const councilContractAddress        = councilAddress.address;
            const zeroAddress                   = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const aliceStakeAmount              = 100000000;
            const bobStakeAmount                = 100000000;

            // request tokens params
            const tokenAmount                   = 100000000; // 100 XTZ
            const treasury                      = treasuryAddress.address;
            const tokenContractAddress          = zeroAddress;
            const tokenName                     = "XTZ";
            const tokenType                     = "TEZ";
            const tokenId                       = 0;
            const purpose                       = "Test Council Request Transfer of 100 XTZ";            

            // Council member (alice) requests for MVK to be minted
            await signerFactory(alice.sk);
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
            const councilStorage            = await councilInstance.storage();
            const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);

            // check details of council action
            assert.equal(councilActionsRequestMint.actionType,       "requestTokens");
            assert.equal(councilActionsRequestMint.address_param_1,  treasury);
            assert.equal(councilActionsRequestMint.address_param_2,  tokenContractAddress);
            assert.equal(councilActionsRequestMint.address_param_3,  zeroAddress);
            assert.equal(councilActionsRequestMint.nat_param_1,      tokenAmount);
            assert.equal(councilActionsRequestMint.nat_param_2,      0);
            assert.equal(councilActionsRequestMint.nat_param_3,      0);
            assert.equal(councilActionsRequestMint.string_param_1,   tokenName);
            assert.equal(councilActionsRequestMint.string_param_2,   purpose);
            assert.equal(councilActionsRequestMint.string_param_3,   tokenType);
            assert.equal(councilActionsRequestMint.executed,         false);
            assert.equal(councilActionsRequestMint.status,           "PENDING");
            assert.equal(councilActionsRequestMint.signersCount,     1);
            assert.equal(councilActionsRequestMint.signers[0],       alice.pkh);

            // council members sign action, and action is executed once threshold of 3 signers is reached
            await signerFactory(bob.sk);
            const bobSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await bobSignsRequestMintActionOperation.confirmation();

            // await signerFactory(eve.sk);
            const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
            await eveSignsRequestMintActionOperation.confirmation();

            // get updated storage
            const governanceStorage               = await governanceInstance.storage();
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
            const totalStakedMvkSupply                     = aliceStakeAmount + bobStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ** financialRequestPercentageDecimals);

            // check details of financial request
            assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilContractAddress);
            assert.equal(governanceFinancialRequestLedger.requestType,                    "TRANSFER");
            assert.equal(governanceFinancialRequestLedger.status,                         true);
            assert.equal(governanceFinancialRequestLedger.ready,                          true);
            assert.equal(governanceFinancialRequestLedger.executed,                       false);
            assert.equal(governanceFinancialRequestLedger.expired,                        false);
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
            const aliceFinancialRequestSnapshot = await governanceFinancialRequestSnapshotLedger.get(alice.pkh);
            assert.equal(aliceFinancialRequestSnapshot.totalDelegatedAmount,  0);
            assert.equal(aliceFinancialRequestSnapshot.totalMvkBalance,       aliceStakeAmount);
            assert.equal(aliceFinancialRequestSnapshot.totalVotingPower,      aliceStakeAmount);

            const bobFinancialRequestSnapshot   = await governanceFinancialRequestSnapshotLedger.get(bob.pkh);
            assert.equal(bobFinancialRequestSnapshot.totalDelegatedAmount,    0);
            assert.equal(bobFinancialRequestSnapshot.totalMvkBalance,         bobStakeAmount);
            assert.equal(bobFinancialRequestSnapshot.totalVotingPower,        bobStakeAmount);

            // satellites vote and approve financial request
            await signerFactory(alice.sk);
            const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await aliceVotesForFinancialRequestOperation.confirmation();

            await signerFactory(bob.sk);
            const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "approve").send();
            await bobVotesForFinancialRequestOperation.confirmation();

            // get updated storage
            const updatedGovernanceStorage                         = await governanceInstance.storage();        
            const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);             
            const councilTezBalance                                = await utils.tezos.tz.getBalance(councilContractAddress);

            // check that financial request has been executed
            assert.equal(updatedGovernanceFinancialRequestLedger.approveVoteTotal,        200000000);
            assert.equal(updatedGovernanceFinancialRequestLedger.disapproveVoteTotal,     0);
            assert.equal(updatedGovernanceFinancialRequestLedger.status,                  true);
            assert.equal(updatedGovernanceFinancialRequestLedger.ready,                   true);
            assert.equal(updatedGovernanceFinancialRequestLedger.executed,                true);
            assert.equal(updatedGovernanceFinancialRequestLedger.expired,                 false);
        
            // check that council now has 100 XTZ in its balance
            assert.equal(councilTezBalance, tokenAmount);

        } catch(e){
            console.log(e);
        } 
    });
    



});