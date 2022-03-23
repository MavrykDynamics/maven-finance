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
import usdmTokenControllerAddress from '../deployments/usdmTokenControllerAddress.json';
import usdmTokenAddress from '../deployments/usdmTokenAddress.json';
// import vaultAddress from '../deployments/vaultAddress.json';

describe("USDM Token Controller tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let usdmTokenControllerInstance;
    let usdmTokenInstance;
    // let vaultInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let usdmTokenControllerStorage;
    let usdmTokenStorage;
    // let vaultStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(alice.sk);
        

        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);

        usdmTokenControllerInstance    = await utils.tezos.contract.at(usdmTokenControllerAddress.address);
        usdmTokenInstance    = await utils.tezos.contract.at(usdmTokenAddress.address);
        // vaultInstance    = await utils.tezos.contract.at(vaultAddress.address);
            

        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();
        usdmTokenControllerStorage = await usdmTokenControllerInstance.storage();
        usdmTokenStorage   = await usdmTokenInstance.storage();

        console.log('-- -- -- -- -- Vesting Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });

    it('council can add a new vestee', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council can add a new vestee") 
            console.log("---") // break

            // console.log('Storage test: console log checks  ----');
            // console.log(councilStorage);
            
            const actionId                   = 0;

            // dummy vestee details
            const vesteeAddress              = mallory.pkh;
            const vesteeTotalAllocatedAmount = 500000000;
            const vesteeCliffInMonths        = 6;
            const vesteeVestingInMonths      = 24;

            // Council member adds a new vestee
            const councilAddsNewVesteeOperation = await councilInstance.methods.councilActionAddVestee(
                vesteeAddress, 
                vesteeTotalAllocatedAmount, 
                vesteeCliffInMonths, 
                vesteeVestingInMonths
                ).send();
            await councilAddsNewVesteeOperation.confirmation();

            // assert that new addVestee action has been created with PENDING status
            const testCouncilStorage   = await councilInstance.storage();
            const testNewVesteeAction  = await testCouncilStorage.councilActionsLedger.get(actionId);
            assert.equal(testNewVesteeAction.status, "PENDING");

            // Council member 2 signs addVestee action
            await signerFactory(bob.sk);
            const councilMemberSignAddVesteeOperationOne = await councilInstance.methods.signAction(actionId).send();
            await councilMemberSignAddVesteeOperationOne.confirmation();

            // Council member 3 signs addVestee action
            await signerFactory(eve.sk);
            const councilMemberSignAddVesteeOperationTwo = await councilInstance.methods.signAction(actionId).send();
            await councilMemberSignAddVesteeOperationTwo.confirmation();

            // assert that new vestee action has been executed with EXECUTED status
            const testTwoCouncilStorage   = await councilInstance.storage();
            const testTwoNewVesteeAction  = await testTwoCouncilStorage.councilActionsLedger.get(actionId);
            assert.equal(testTwoNewVesteeAction.status, "EXECUTED");
            // console.log(testTwoNewVesteeAction);

            // assert that vesting contract is updated with new vestee recorded in vesteeLedger
            const vestingStorage = await vestingInstance.storage();
            const vesteeRecord   = await vestingStorage.vesteeLedger.get(vesteeAddress);
            assert.equal(vesteeRecord.totalAllocatedAmount, vesteeTotalAllocatedAmount);
            assert.equal(vesteeRecord.cliffMonths, vesteeCliffInMonths);
            assert.equal(vesteeRecord.vestingMonths, vesteeVestingInMonths);
            // console.log(vesteeRecord);

        } catch(e){
            console.log(e);
        } 

    });    



});