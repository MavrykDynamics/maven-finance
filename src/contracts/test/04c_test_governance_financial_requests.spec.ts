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

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import treasuryAddress from '../deployments/treasuryAddress.json';
import mockFa12TokenAddress from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress from '../deployments/mockFa2TokenAddress.json';

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

    });

    it('council sends request to mint MVK', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council sends request to mint MVK") 
            console.log("---") // break

            // request mint params
            const tokenAmount = 1000000000; // 1000 MVK
            const treasury    = treasuryAddress.address;
            const tokenType   = "FA2";
            const tokenId     = 0;
            const purpose     = "Test Council Request Mint 1000 MVK";

            // Setup governance satellites for financial request snapshot later
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

            // Council member (alice) requests for MVK to be minted
            await signerFactory(alice.sk);
            const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(treasury, tokenAmount, tokenType, tokenId, purpose).send();
            await councilRequestsMintOperation.confirmation();

            // get new council storage and assert tests
            console.log("--- --- ---")
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const councilActionId           = 1;
            const updatedCouncilStorageOne  = await councilInstance.storage();
            const councilActionsRequestMint = await updatedCouncilStorageOne.councilActionsLedger.get(councilActionId);
            
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
            const updatedCouncilStorageTwo        = await councilInstance.storage();
            const councilActionsRequestMintSigned = await updatedCouncilStorageTwo.councilActionsLedger.get(councilActionId);

            // check that council action is approved and has been executed
            assert.equal(councilActionsRequestMintSigned.signersCount,  3);
            assert.equal(councilActionsRequestMintSigned.executed,      true);
            assert.equal(councilActionsRequestMintSigned.status,        "EXECUTED");
            
            const financialRequestCounter                  = councilActionId;
            const governanceFinancialRequestLedger         = await governanceStorage.financialRequestLedger.get(financialRequestCounter);
            const governanceFinancialRequestSnapshotLedger = await governanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
            
            // const financialRequestApprovalPercentage       = governanceStorage.config.financialRequestApprovalPercentage;
            // const financialRequestPercentageDecimals       = 4;
            // const totalStakedMvkSupply                     = aliceStakeAmount + bobStakeAmount;
            // const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * financialRequestApprovalPercentage) / (10 ^ financialRequestPercentageDecimals);

            // check details of financial request
            assert.equal(governanceFinancialRequestLedger.requesterAddress,               councilAddress.address);
            assert.equal(governanceFinancialRequestLedger.requestType,                    "MINT");
            assert.equal(governanceFinancialRequestLedger.status,                         true);
            assert.equal(governanceFinancialRequestLedger.ready,                          true);
            assert.equal(governanceFinancialRequestLedger.executed,                       false);
            assert.equal(governanceFinancialRequestLedger.expired,                        false);
            assert.equal(governanceFinancialRequestLedger.treasuryAddress,                treasury);
            assert.equal(governanceFinancialRequestLedger.tokenAmount,                    tokenAmount);
            assert.equal(governanceFinancialRequestLedger.tokenName,                      "MVK");
            assert.equal(governanceFinancialRequestLedger.tokenType,                      tokenType);
            assert.equal(governanceFinancialRequestLedger.tokenId,                        tokenId);
            assert.equal(governanceFinancialRequestLedger.requestPurpose,                 purpose);
            assert.equal(governanceFinancialRequestLedger.approveVoteTotal,               0);
            assert.equal(governanceFinancialRequestLedger.disapproveVoteTotal,            0);
            assert.equal(governanceFinancialRequestLedger.stakedMvkPercentageForApproval, 6700);
            assert.equal(governanceFinancialRequestLedger.stakedMvkRequiredForApproval,   134000000);
            
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
            const aliceVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "Approve").send();
            await aliceVotesForFinancialRequestOperation.confirmation();

            await signerFactory(bob.sk);
            const bobVotesForFinancialRequestOperation = await governanceInstance.methods.voteForRequest(councilActionId, "Approve").send();
            await bobVotesForFinancialRequestOperation.confirmation();

            // get updated storage
            const updatedGovernanceStorage                         = await governanceInstance.storage();
            const updatedGovernanceFinancialRequestLedger          = await updatedGovernanceStorage.financialRequestLedger.get(financialRequestCounter);
            const updatedGovernanceFinancialRequestSnapshotLedger  = await updatedGovernanceStorage.financialRequestSnapshotLedger.get(financialRequestCounter);
            
            console.log(updatedGovernanceStorage);
            console.log(updatedGovernanceFinancialRequestLedger);

            // const governanceParameterSchema = governanceInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(governanceParameterSchema,null,2));

            // const councilParameterSchema = councilInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(councilParameterSchema,null,2));
            
        } catch(e){
            console.log(e);
        } 
    });

    


});