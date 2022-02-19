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
import { alice, bob, eve, mallory, oscar, trudy } from "../scripts/sandbox/accounts";

import vestingAddress from '../deployments/vestingAddress.json';
import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import mockFa12TokenAddress  from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress   from '../deployments/mockFa2TokenAddress.json';


describe("Council tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let vestingInstance;
    let councilInstance;
    let mockFa12TokenInstance;
    let mockFa2TokenInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let vestingStorage;
    let councilStorage;
    let mockFa12TokenStorage;
    let mockFa2TokenStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(alice.sk);
        
        vestingInstance    = await utils.tezos.contract.at(vestingAddress.address);
        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
        councilInstance    = await utils.tezos.contract.at(councilAddress.address);
        mockFa12TokenInstance  = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance   = await utils.tezos.contract.at(mockFa2TokenAddress.address);
            
        vestingStorage    = await vestingInstance.storage();
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();
        councilStorage         = await councilInstance.storage();
        mockFa12TokenStorage   = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage    = await mockFa2TokenInstance.storage();

        console.log('-- -- -- -- -- Council Tests -- -- -- --')
        console.log('Vesting Contract deployed at:', vestingInstance.address);
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Council Contract deployed at:', councilInstance.address);
        console.log('Mock Fa12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock Fa2 Token Contract deployed at:' , mockFa2TokenInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);


        // Setup funds in Council for transfer later
        // ------------------------------------------------------------------
        const councilContractAddress = councilAddress.address;

        // Alice transfers 250 XTZ to Council
        await signerFactory(alice.sk)
        const aliceTransferTezToCouncilOperation = await utils.tezos.contract.transfer({ to: councilContractAddress, amount: 250});
        await aliceTransferTezToCouncilOperation.confirmation();

        // Mallory transfers 250 MVK tokens to Treasury
        await signerFactory(mallory.sk);
        const malloryTransferMvkToTreasuryOperation = await mvkTokenInstance.methods.transfer([
            {
                from_: mallory.pkh,
                txs: [
                    {
                        to_: councilContractAddress,
                        token_id: 0,
                        amount: 250000000
                    }
                ]
            }
        ]).send();
        await malloryTransferMvkToTreasuryOperation.confirmation();

        // Mallory transfers 250 Mock FA12 Tokens to Treasury
        const malloryTransferMockFa12ToTreasuryOperation = await mockFa12TokenInstance.methods.transfer(mallory.pkh, councilContractAddress, 250000000).send();
        await malloryTransferMockFa12ToTreasuryOperation.confirmation();

        // Mallory transfers 250 Mock FA2 Tokens to Treasury
        const malloryTransferMockFa2ToTreasuryOperation = await mockFa2TokenInstance.methods.transfer([
            {
                from_: mallory.pkh,
                txs: [
                    {
                        to_: councilContractAddress,
                        token_id: 0,
                        amount: 250000000
                    }
                ]
            }
        ]).send();
        await malloryTransferMockFa2ToTreasuryOperation.confirmation();


    });

    it('council can add a new council member', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can add a new council member") 
            console.log("---") // break

             // init constants
            const actionId                  = 1;
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            // Council Members: Alice, Bob, Eve

            // params: new council member address
            const newCouncilMemberAddress   = mallory.pkh;

            const councilStorage            = await councilInstance.storage();
            const initialCouncilMemberCount = councilStorage.councilMembers.length;
            
            // check that there are 3 initial council members
            assert.equal(initialCouncilMemberCount, 3);
            
            // Council add new council member
            await signerFactory(alice.sk)
            const councilAddNewCouncilMemberOperation = await councilInstance.methods.councilActionAddMember(
                newCouncilMemberAddress
                ).send();
            await councilAddNewCouncilMemberOperation.confirmation();

            // assert that new addMember action has been created with PENDING status
            const updatedCouncilStorage    = await councilInstance.storage();
            const councilActionAddMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
            // check details of council action
            assert.equal(councilActionAddMember.actionType,       "addCouncilMember");
            assert.equal(councilActionAddMember.address_param_1,  newCouncilMemberAddress);
            assert.equal(councilActionAddMember.address_param_2,  zeroAddress);
            assert.equal(councilActionAddMember.address_param_3,  zeroAddress);
            assert.equal(councilActionAddMember.nat_param_1,      0);
            assert.equal(councilActionAddMember.nat_param_2,      0);
            assert.equal(councilActionAddMember.nat_param_3,      0);
            assert.equal(councilActionAddMember.string_param_1,   "EMPTY");
            assert.equal(councilActionAddMember.string_param_2,   "EMPTY");
            assert.equal(councilActionAddMember.string_param_3,   "EMPTY");
            assert.equal(councilActionAddMember.executed,         false);
            assert.equal(councilActionAddMember.status,           "PENDING");
            assert.equal(councilActionAddMember.signersCount,     1);
            assert.equal(councilActionAddMember.signers[0],       alice.pkh);

            // Council member 2 (bob) signs addMember action
            await signerFactory(bob.sk);
            const bobSignsAddMemberOperation = await councilInstance.methods.signAction(actionId).send();
            await bobSignsAddMemberOperation.confirmation();

            // Council member 3 (eve) signs addMember action
            await signerFactory(eve.sk);
            const eveSignsAddMemberOperation = await councilInstance.methods.signAction(actionId).send();
            await eveSignsAddMemberOperation.confirmation();

            // get updated storage
            const completedCouncilStorage          = await councilInstance.storage();
            const councilActionsAddMemberSigned    = await completedCouncilStorage.councilActionsLedger.get(actionId);
            const newCouncilMemberCount            = completedCouncilStorage.councilMembers.length;

            // check that council action is approved and has been executed
            assert.equal(councilActionsAddMemberSigned.signersCount,  3);
            assert.equal(councilActionsAddMemberSigned.executed,      true);
            assert.equal(councilActionsAddMemberSigned.status,        "EXECUTED");

            // check that there are now 4 council members
            assert.equal(newCouncilMemberCount, 4);

        } catch(e){
            console.log(e);
        } 

    });    

    it('council can remove a council member, and new council member can sign actions', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can remove a council member, and new council member can sign actions") 
            console.log("---") // break

            // init constants
            const actionId                  = 2;
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            // Council Members: Alice, Bob, Eve, Mallory

            // params: remove council member address
            const removedCouncilMemberAddress      = bob.pkh;

            const councilStorage            = await councilInstance.storage();
            const initialCouncilMemberCount = councilStorage.councilMembers.length;

            // check that there are 4 council members
            assert.equal(initialCouncilMemberCount, 4);

            // Council remove council member
            await signerFactory(alice.sk)
            const councilRemoveCouncilMemberOperation = await councilInstance.methods.councilActionRemoveMember(
                removedCouncilMemberAddress
                ).send();
            await councilRemoveCouncilMemberOperation.confirmation();

            // assert that new removeMember action has been created with PENDING status
            const updatedCouncilStorage    = await councilInstance.storage();
            const councilActionRemoveMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
            // check details of council action
            assert.equal(councilActionRemoveMember.actionType,       "removeCouncilMember");
            assert.equal(councilActionRemoveMember.address_param_1,  removedCouncilMemberAddress);
            assert.equal(councilActionRemoveMember.address_param_2,  zeroAddress);
            assert.equal(councilActionRemoveMember.address_param_3,  zeroAddress);
            assert.equal(councilActionRemoveMember.nat_param_1,      0);
            assert.equal(councilActionRemoveMember.nat_param_2,      0);
            assert.equal(councilActionRemoveMember.nat_param_3,      0);
            assert.equal(councilActionRemoveMember.string_param_1,   "EMPTY");
            assert.equal(councilActionRemoveMember.string_param_2,   "EMPTY");
            assert.equal(councilActionRemoveMember.string_param_3,   "EMPTY");
            assert.equal(councilActionRemoveMember.executed,         false);
            assert.equal(councilActionRemoveMember.status,           "PENDING");
            assert.equal(councilActionRemoveMember.signersCount,     1);
            assert.equal(councilActionRemoveMember.signers[0],       alice.pkh);

            // Council member 2 (mallory) signs removeMember action
            await signerFactory(mallory.sk);
            const mallorySignsRemoveMemberOperation = await councilInstance.methods.signAction(actionId).send();
            await mallorySignsRemoveMemberOperation.confirmation();

            // Council member 3 (eve) signs removeMember action
            await signerFactory(eve.sk);
            const eveSignsRemoveMemberOperation = await councilInstance.methods.signAction(actionId).send();
            await eveSignsRemoveMemberOperation.confirmation();

            // get updated storage
            const completedCouncilStorage           = await councilInstance.storage();
            const councilActionsRemoveMemberSigned  = await completedCouncilStorage.councilActionsLedger.get(actionId);
            const newCouncilMemberCount             = completedCouncilStorage.councilMembers.length;

            // check that council action is approved and has been executed
            assert.equal(councilActionsRemoveMemberSigned.signersCount,  3);
            assert.equal(councilActionsRemoveMemberSigned.executed,      true);
            assert.equal(councilActionsRemoveMemberSigned.status,        "EXECUTED");

            // check that there are now 3 council members
            assert.equal(newCouncilMemberCount, 3);

        } catch(e){
            console.log(e);
        } 

    });    

    it('council can change a council member', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can change a council member") 
            console.log("---") // break

            // init constants
            const actionId                  = 3;
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            // Council Members: Alice, Eve, Mallory

            // params: change council member address (mallory to bob)
            const oldCouncilMemberAddress      = mallory.pkh;
            const newCouncilMemberAddress      = bob.pkh;

            const councilStorage            = await councilInstance.storage();
            const initialCouncilMemberCount = councilStorage.councilMembers.length;

            // check that there are 3 council members
            assert.equal(initialCouncilMemberCount, 3);

            // Council remove council member
            await signerFactory(alice.sk)
            const councilChangeCouncilMemberOperation = await councilInstance.methods.councilActionChangeMember(
                oldCouncilMemberAddress, newCouncilMemberAddress
                ).send();
            await councilChangeCouncilMemberOperation.confirmation();

            // assert that new changeMember action has been created with PENDING status
            const updatedCouncilStorage    = await councilInstance.storage();
            const councilActionChangeMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
            // check details of council action
            assert.equal(councilActionChangeMember.actionType,       "changeCouncilMember");
            assert.equal(councilActionChangeMember.address_param_1,  oldCouncilMemberAddress);
            assert.equal(councilActionChangeMember.address_param_2,  newCouncilMemberAddress);
            assert.equal(councilActionChangeMember.address_param_3,  zeroAddress);
            assert.equal(councilActionChangeMember.nat_param_1,      0);
            assert.equal(councilActionChangeMember.nat_param_2,      0);
            assert.equal(councilActionChangeMember.nat_param_3,      0);
            assert.equal(councilActionChangeMember.string_param_1,   "EMPTY");
            assert.equal(councilActionChangeMember.string_param_2,   "EMPTY");
            assert.equal(councilActionChangeMember.string_param_3,   "EMPTY");
            assert.equal(councilActionChangeMember.executed,         false);
            assert.equal(councilActionChangeMember.status,           "PENDING");
            assert.equal(councilActionChangeMember.signersCount,     1);
            assert.equal(councilActionChangeMember.signers[0],       alice.pkh);

            // Council member 2 (mallory) signs changeMember action
            await signerFactory(mallory.sk);
            const mallorySignsChangeMemberOperation = await councilInstance.methods.signAction(actionId).send();
            await mallorySignsChangeMemberOperation.confirmation();

            // Council member 3 (eve) signs changeMember action
            await signerFactory(eve.sk);
            const eveSignsChangeMemberOperation = await councilInstance.methods.signAction(actionId).send();
            await eveSignsChangeMemberOperation.confirmation();

            // get updated storage
            const completedCouncilStorage           = await councilInstance.storage();
            const councilActionsChangeMemberSigned  = await completedCouncilStorage.councilActionsLedger.get(actionId);
            const newCouncilMemberCount             = completedCouncilStorage.councilMembers.length;

            // check that council action is approved and has been executed
            assert.equal(councilActionsChangeMemberSigned.signersCount,  3);
            assert.equal(councilActionsChangeMemberSigned.executed,      true);
            assert.equal(councilActionsChangeMemberSigned.status,        "EXECUTED");

            // check that there are now 3 council members
            assert.equal(newCouncilMemberCount, 3);
            assert.equal(completedCouncilStorage.councilMembers[2], bob.pkh);

        } catch(e){
            console.log(e);
        } 

    });    


    it('council can flush a council action', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can flush a council action") 
            console.log("---") // break

            // init constants
            const actionId                  = 4;
            const flushActionId             = 5;
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            // Council Members: Alice, Eve, Bob

            // params: new council member address (mallory)
            const councilMemberAddress      = mallory.pkh;
        
            const councilStorage            = await councilInstance.storage();
            const initialCouncilMemberCount = councilStorage.councilMembers.length;

            // check that there are 3 council members
            assert.equal(initialCouncilMemberCount, 3);

            // Council remove council member
            await signerFactory(alice.sk)
            const councilAddCouncilMemberOperation = await councilInstance.methods.councilActionAddMember(
                councilMemberAddress
                ).send();
            await councilAddCouncilMemberOperation.confirmation();

            // assert that new addMember action has been created with PENDING status
            const updatedCouncilStorage       = await councilInstance.storage();
            const councilActionAddMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
            // check details of council action
            assert.equal(councilActionAddMember.actionType,       "addCouncilMember");
            assert.equal(councilActionAddMember.address_param_1,  councilMemberAddress);
            assert.equal(councilActionAddMember.address_param_2,  zeroAddress);
            assert.equal(councilActionAddMember.address_param_3,  zeroAddress);
            assert.equal(councilActionAddMember.nat_param_1,      0);
            assert.equal(councilActionAddMember.nat_param_2,      0);
            assert.equal(councilActionAddMember.nat_param_3,      0);
            assert.equal(councilActionAddMember.string_param_1,   "EMPTY");
            assert.equal(councilActionAddMember.string_param_2,   "EMPTY");
            assert.equal(councilActionAddMember.string_param_3,   "EMPTY");
            assert.equal(councilActionAddMember.executed,         false);
            assert.equal(councilActionAddMember.status,           "PENDING");
            assert.equal(councilActionAddMember.signersCount,     1);
            assert.equal(councilActionAddMember.signers[0],       alice.pkh);

            // Council member 2 (bob) signs addMember action
            await signerFactory(bob.sk);
            const bobSignsAddMemberOperation = await councilInstance.methods.signAction(actionId).send();
            await bobSignsAddMemberOperation.confirmation();

            // Council member 3 (eve) decides to flush addMemberAction
            await signerFactory(eve.sk);
            const eveFlushesAddMemberOperation = await councilInstance.methods.flushAction(actionId).send();
            await eveFlushesAddMemberOperation.confirmation();

            // assert that new flushAction has been created with PENDING status
            const updatedCouncilStorageWithFlush       = await councilInstance.storage();
            const councilActionFlush                   = await updatedCouncilStorageWithFlush.councilActionsLedger.get(flushActionId);
        
            // check details of council action
            assert.equal(councilActionFlush.actionType,       "flushAction");
            assert.equal(councilActionFlush.address_param_1,  zeroAddress);
            assert.equal(councilActionFlush.address_param_2,  zeroAddress);
            assert.equal(councilActionFlush.address_param_3,  zeroAddress);
            assert.equal(councilActionFlush.nat_param_1,      actionId);
            assert.equal(councilActionFlush.nat_param_2,      0);
            assert.equal(councilActionFlush.nat_param_3,      0);
            assert.equal(councilActionFlush.string_param_1,   "EMPTY");
            assert.equal(councilActionFlush.string_param_2,   "EMPTY");
            assert.equal(councilActionFlush.string_param_3,   "EMPTY");
            assert.equal(councilActionFlush.executed,         false);
            assert.equal(councilActionFlush.status,           "PENDING");
            assert.equal(councilActionFlush.signersCount,     1);
            assert.equal(councilActionFlush.signers[0],       eve.pkh);

            // Council member 1 (alice) decides to flush addMemberAction
            await signerFactory(alice.sk);
            const aliceSignsFlushActionOperation = await councilInstance.methods.signAction(flushActionId).send();
            await aliceSignsFlushActionOperation.confirmation();

            // Council member 2 (bob) decides to flush addMemberAction
            await signerFactory(alice.sk);
            const bobSignsFlushActionOperation = await councilInstance.methods.signAction(flushActionId).send();
            await bobSignsFlushActionOperation.confirmation();

            // get updated storage
            const completedCouncilStorage           = await councilInstance.storage();
            const councilActionsAddMemberFlushed    = await completedCouncilStorage.councilActionsLedger.get(actionId);
            const councilActionsFlushAction         = await completedCouncilStorage.councilActionsLedger.get(flushActionId);
            const newCouncilMemberCount             = completedCouncilStorage.councilMembers.length;

            // check that flush action is approved and has been executed
            assert.equal(councilActionsFlushAction.signersCount,  3);
            assert.equal(councilActionsFlushAction.executed,      true);
            assert.equal(councilActionsFlushAction.status,        "EXECUTED");

            // check that add council member action has been flushed
            assert.equal(councilActionsAddMemberFlushed.signersCount,  2);
            assert.equal(councilActionsAddMemberFlushed.executed,      false);
            assert.equal(councilActionsAddMemberFlushed.status,        "FLUSHED");

            // check that there are still 3 council members
            assert.equal(newCouncilMemberCount, 3);

        } catch(e){
            console.log(e);
        } 

    });    

    it('council can transfer mock FA12 tokens to a wallet address', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can transfer mock FA12 tokens to a wallet address") 
            console.log("---") // break

            // init constants
            const actionId                  = 6;
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const councilContractAddress    = councilAddress.address;
            // Council Members: Alice, Bob, Eve

            const councilStorage            = await councilInstance.storage();
            const initialCouncilMemberCount = councilStorage.councilMembers.length;

            const mockFa12TokenStorage      = await mockFa12TokenInstance.storage();
            const councilMockFa12Ledger     = await mockFa12TokenStorage.ledger.get(councilContractAddress);
            const oscarMockFa12Ledger       = await mockFa12TokenStorage.ledger.get(oscar.pkh);            

            // check that there are 3 council members
            assert.equal(initialCouncilMemberCount, 3);
            // check that council has 250 mock FA12 tokens (transferred from mallory in test setup)
            assert.equal(councilMockFa12Ledger.balance, 250000000);

            // Council member create transfer mock FA12 token operation
            await signerFactory(alice.sk)
            const receiverAddress        = oscar.pkh;
            const tokenContractAddress   = mockFa12TokenAddress.address;
            const tokenAmount            = 150000000;
            const tokenType              = "FA12";
            const tokenId                = 0;

            const councilTransferTezOperation = await councilInstance.methods.councilActionTransfer(
                receiverAddress, 
                tokenContractAddress,
                tokenAmount,
                tokenType,
                tokenId
                ).send();
            await councilTransferTezOperation.confirmation();

            // assert that new transfer action has been created with PENDING status
            const updatedCouncilStorage       = await councilInstance.storage();
            const councilActionTransfer       = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
            // check details of council action
            assert.equal(councilActionTransfer.actionType,       "transfer");
            assert.equal(councilActionTransfer.address_param_1,  receiverAddress);
            assert.equal(councilActionTransfer.address_param_2,  tokenContractAddress);
            assert.equal(councilActionTransfer.address_param_3,  zeroAddress);
            assert.equal(councilActionTransfer.nat_param_1,      tokenAmount);
            assert.equal(councilActionTransfer.nat_param_2,      tokenId);
            assert.equal(councilActionTransfer.nat_param_3,      0);
            assert.equal(councilActionTransfer.string_param_1,   tokenType);
            assert.equal(councilActionTransfer.string_param_2,   "EMPTY");
            assert.equal(councilActionTransfer.string_param_3,   "EMPTY");
            assert.equal(councilActionTransfer.executed,         false);
            assert.equal(councilActionTransfer.status,           "PENDING");
            assert.equal(councilActionTransfer.signersCount,     1);
            assert.equal(councilActionTransfer.signers[0],       alice.pkh);

            // Council member 2 (bob) signs transfer action
            await signerFactory(bob.sk);
            const bobSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
            await bobSignsTransferOperation.confirmation();

            // Council member 3 (eve) signs transfer action
            await signerFactory(eve.sk);
            const eveSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
            await eveSignsTransferOperation.confirmation();

            // get updated storage
            const completedCouncilStorage           = await councilInstance.storage();
            const councilActionsTransferSigned      = await completedCouncilStorage.councilActionsLedger.get(actionId);

            const updatedMockFa12TokenStorage       = await mockFa12TokenInstance.storage();
            const updatedCouncilMockFa12Ledger      = await updatedMockFa12TokenStorage.ledger.get(councilContractAddress);
            const updatedOscarMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(oscar.pkh);            

            // check that council action is approved and has been executed
            assert.equal(councilActionsTransferSigned.signersCount,  3);
            assert.equal(councilActionsTransferSigned.executed,      true);
            assert.equal(councilActionsTransferSigned.status,        "EXECUTED");

            // check that ocase has received 150 mock FA12 Tokens from the council contract
            assert.equal(updatedCouncilMockFa12Ledger.balance, 100000000);
            assert.equal(updatedOscarMockFa12Ledger.balance, 150000000);

        } catch(e){
            console.log(e);
        } 

    });    


    it('council can transfer mock FA2 tokens to a wallet address', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can transfer mock FA2 tokens to a wallet address") 
            console.log("---") // break

            // init constants
            const actionId                  = 7;
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const councilContractAddress    = councilAddress.address;
            // Council Members: Alice, Bob, Eve

            const councilStorage            = await councilInstance.storage();
            const initialCouncilMemberCount = councilStorage.councilMembers.length;

            const mockFa2TokenStorage      = await mockFa2TokenInstance.storage();
            const councilMockFa2Ledger     = await mockFa2TokenStorage.ledger.get(councilContractAddress);
            const oscarMockFa2Ledger       = await mockFa2TokenStorage.ledger.get(oscar.pkh);            

            // check that there are 3 council members
            assert.equal(initialCouncilMemberCount, 3);
            // check that council has 250 mock FA2 tokens (transferred from mallory in test setup)
            assert.equal(councilMockFa2Ledger, 250000000);

            // Council member create transfer mock FA2 token operation
            await signerFactory(alice.sk)
            const receiverAddress        = oscar.pkh;
            const tokenContractAddress   = mockFa2TokenAddress.address;
            const tokenAmount            = 150000000;
            const tokenType              = "FA2";
            const tokenId                = 0;

            const councilTransferTezOperation = await councilInstance.methods.councilActionTransfer(
                receiverAddress, 
                tokenContractAddress,
                tokenAmount,
                tokenType,
                tokenId
                ).send();
            await councilTransferTezOperation.confirmation();

            // assert that new transfer action has been created with PENDING status
            const updatedCouncilStorage       = await councilInstance.storage();
            const councilActionTransfer       = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
            // check details of council action
            assert.equal(councilActionTransfer.actionType,       "transfer");
            assert.equal(councilActionTransfer.address_param_1,  receiverAddress);
            assert.equal(councilActionTransfer.address_param_2,  tokenContractAddress);
            assert.equal(councilActionTransfer.address_param_3,  zeroAddress);
            assert.equal(councilActionTransfer.nat_param_1,      tokenAmount);
            assert.equal(councilActionTransfer.nat_param_2,      tokenId);
            assert.equal(councilActionTransfer.nat_param_3,      0);
            assert.equal(councilActionTransfer.string_param_1,   tokenType);
            assert.equal(councilActionTransfer.string_param_2,   "EMPTY");
            assert.equal(councilActionTransfer.string_param_3,   "EMPTY");
            assert.equal(councilActionTransfer.executed,         false);
            assert.equal(councilActionTransfer.status,           "PENDING");
            assert.equal(councilActionTransfer.signersCount,     1);
            assert.equal(councilActionTransfer.signers[0],       alice.pkh);

            // Council member 2 (bob) signs transfer action
            await signerFactory(bob.sk);
            const bobSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
            await bobSignsTransferOperation.confirmation();

            // Council member 3 (eve) signs transfer action
            await signerFactory(eve.sk);
            const eveSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
            await eveSignsTransferOperation.confirmation();

            // get updated storage
            const completedCouncilStorage           = await councilInstance.storage();
            const councilActionsTransferSigned      = await completedCouncilStorage.councilActionsLedger.get(actionId);

            const updatedMockFa2TokenStorage        = await mockFa2TokenInstance.storage();
            const updatedCouncilMockFa2Ledger       = await updatedMockFa2TokenStorage.ledger.get(councilContractAddress);
            const updatedOscarMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(oscar.pkh);            

            // check that council action is approved and has been executed
            assert.equal(councilActionsTransferSigned.signersCount,  3);
            assert.equal(councilActionsTransferSigned.executed,      true);
            assert.equal(councilActionsTransferSigned.status,        "EXECUTED");

            // check that ocase has received 150 mock FA12 Tokens from the council contract
            assert.equal(updatedCouncilMockFa2Ledger, 100000000);
            assert.equal(updatedOscarMockFa2Ledger, 150000000);

        } catch(e){
            console.log(e);
        } 

    });    


    it('council can transfer MVK tokens to a wallet address', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can transfer MVK tokens to a wallet address") 
            console.log("---") // break

            // init constants
            const actionId                  = 8;
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const councilContractAddress    = councilAddress.address;
            // Council Members: Alice, Bob, Eve

            const councilStorage            = await councilInstance.storage();
            const initialCouncilMemberCount = councilStorage.councilMembers.length;

            const mvkTokenStorage           = await mvkTokenInstance.storage();
            const councilMvkLedger          = await mvkTokenStorage.ledger.get(councilContractAddress);
            const oscarMvkLedger            = await mvkTokenStorage.ledger.get(oscar.pkh);            

            // check that there are 3 council members
            assert.equal(initialCouncilMemberCount, 3);
            // check that council has 250 mvk tokens (transferred from mallory in test setup)
            assert.equal(councilMvkLedger, 250000000);

            // Council member create transfer mvk token operation
            await signerFactory(alice.sk)
            const receiverAddress        = oscar.pkh;
            const tokenContractAddress   = mvkTokenAddress.address;
            const tokenAmount            = 150000000;
            const tokenType              = "FA2";
            const tokenId                = 0;

            const councilTransferTezOperation = await councilInstance.methods.councilActionTransfer(
                receiverAddress, 
                tokenContractAddress,
                tokenAmount,
                tokenType,
                tokenId
                ).send();
            await councilTransferTezOperation.confirmation();

            // assert that new transfer action has been created with PENDING status
            const updatedCouncilStorage       = await councilInstance.storage();
            const councilActionTransfer       = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
            // check details of council action
            assert.equal(councilActionTransfer.actionType,       "transfer");
            assert.equal(councilActionTransfer.address_param_1,  receiverAddress);
            assert.equal(councilActionTransfer.address_param_2,  tokenContractAddress);
            assert.equal(councilActionTransfer.address_param_3,  zeroAddress);
            assert.equal(councilActionTransfer.nat_param_1,      tokenAmount);
            assert.equal(councilActionTransfer.nat_param_2,      tokenId);
            assert.equal(councilActionTransfer.nat_param_3,      0);
            assert.equal(councilActionTransfer.string_param_1,   tokenType);
            assert.equal(councilActionTransfer.string_param_2,   "EMPTY");
            assert.equal(councilActionTransfer.string_param_3,   "EMPTY");
            assert.equal(councilActionTransfer.executed,         false);
            assert.equal(councilActionTransfer.status,           "PENDING");
            assert.equal(councilActionTransfer.signersCount,     1);
            assert.equal(councilActionTransfer.signers[0],       alice.pkh);

            // Council member 2 (bob) signs transfer action
            await signerFactory(bob.sk);
            const bobSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
            await bobSignsTransferOperation.confirmation();

            // Council member 3 (eve) signs transfer action
            await signerFactory(eve.sk);
            const eveSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
            await eveSignsTransferOperation.confirmation();

            // get updated storage
            const completedCouncilStorage           = await councilInstance.storage();
            const councilActionsTransferSigned      = await completedCouncilStorage.councilActionsLedger.get(actionId);

            const updatedMvkTokenStorage            = await mvkTokenInstance.storage();
            const updatedCouncilMvkLedger           = await updatedMvkTokenStorage.ledger.get(councilContractAddress);
            const updatedOscarMvkLedger             = await updatedMvkTokenStorage.ledger.get(oscar.pkh);            

            // check that council action is approved and has been executed
            assert.equal(councilActionsTransferSigned.signersCount,  3);
            assert.equal(councilActionsTransferSigned.executed,      true);
            assert.equal(councilActionsTransferSigned.status,        "EXECUTED");

            // check that ocase has received 150 mvk Tokens from the council contract
            assert.equal(updatedCouncilMvkLedger, 100000000);
            assert.equal(updatedOscarMvkLedger, 150000000);

        } catch(e){
            console.log(e);
        } 

    });    

    it('council can transfer tez to a wallet address', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can transfer tez to a wallet address") 
            console.log("---") // break

            // init constants
            const actionId                  = 9;
            const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
            const councilContractAddress    = councilAddress.address;
            // Council Members: Alice, Bob, Eve

            const councilStorage            = await councilInstance.storage();
            const initialCouncilMemberCount = councilStorage.councilMembers.length;
            const councilTezBalance         = await utils.tezos.tz.getBalance(councilContractAddress);
            const oscarTezBalance           = await utils.tezos.tz.getBalance(oscar.pkh);

            // check that there are 3 council members
            assert.equal(initialCouncilMemberCount, 3);
            // check that council has 250 tez (transferred from mallory in test setup)
            assert.equal(councilTezBalance, 250000000);
            // check that oscar has initial 2000 tez balance
            // assert.equal(oscarTezBalance, 2000000000);
            // console.log("oscar tez balance: "+ oscarTezBalance);

            // Council member create transfer tez operation
            await signerFactory(alice.sk)
            const receiverAddress        = oscar.pkh;
            const tokenContractAddress   = zeroAddress;
            const tokenAmount            = 150000000;
            const tokenType              = "XTZ";
            const tokenId                = 0;

            const councilTransferTezOperation = await councilInstance.methods.councilActionTransfer(
                receiverAddress, 
                tokenContractAddress,
                tokenAmount,
                tokenType,
                tokenId
                ).send();
            await councilTransferTezOperation.confirmation();

            // assert that new transfer action has been created with PENDING status
            const updatedCouncilStorage       = await councilInstance.storage();
            const councilActionTransfer       = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
            // check details of council action
            assert.equal(councilActionTransfer.actionType,       "transfer");
            assert.equal(councilActionTransfer.address_param_1,  receiverAddress);
            assert.equal(councilActionTransfer.address_param_2,  tokenContractAddress);
            assert.equal(councilActionTransfer.address_param_3,  zeroAddress);
            assert.equal(councilActionTransfer.nat_param_1,      tokenAmount);
            assert.equal(councilActionTransfer.nat_param_2,      tokenId);
            assert.equal(councilActionTransfer.nat_param_3,      0);
            assert.equal(councilActionTransfer.string_param_1,   tokenType);
            assert.equal(councilActionTransfer.string_param_2,   "EMPTY");
            assert.equal(councilActionTransfer.string_param_3,   "EMPTY");
            assert.equal(councilActionTransfer.executed,         false);
            assert.equal(councilActionTransfer.status,           "PENDING");
            assert.equal(councilActionTransfer.signersCount,     1);
            assert.equal(councilActionTransfer.signers[0],       alice.pkh);

            // Council member 2 (bob) signs transfer action
            await signerFactory(bob.sk);
            const bobSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
            await bobSignsTransferOperation.confirmation();

            // Council member 3 (eve) signs transfer action
            await signerFactory(eve.sk);
            const eveSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
            await eveSignsTransferOperation.confirmation();

            // get updated storage
            const completedCouncilStorage           = await councilInstance.storage();
            const councilActionsTransferSigned      = await completedCouncilStorage.councilActionsLedger.get(actionId);
            const updatedOscarTezBalance            = await utils.tezos.tz.getBalance(oscar.pkh);
            const updatedCouncilTezBalance          = await utils.tezos.tz.getBalance(councilContractAddress);

            // check that council action is approved and has been executed
            assert.equal(councilActionsTransferSigned.signersCount,  3);
            assert.equal(councilActionsTransferSigned.executed,      true);
            assert.equal(councilActionsTransferSigned.status,        "EXECUTED");

            // check that ocase has received 150 tez from the council contract
            assert.equal(updatedCouncilTezBalance, 100000000);
            // assert.equal(updatedOscarTezBalance, 2150000000);
            console.log("new oscar tez balance: "+ updatedOscarTezBalance);

            // Oscar transfers 150 XTZ back to the Council
            // await signerFactory(oscar.sk)
            // const oscarTransferTezToCouncilOperation = await utils.tezos.contract.transfer({ to: councilAddress.address, amount: 150});
            // await oscarTransferTezToCouncilOperation.confirmation();

        } catch(e){
            console.log(e);
        } 

    });    

});