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
import { alice, bob, eve } from "../scripts/sandbox/accounts";

import vestingAddress from '../deployments/vestingAddress.json';
import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';

describe("Vesting tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let vestingInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let vestingStorage;
    
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
            
        vestingStorage    = await vestingInstance.storage();
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();

        console.log('-- -- -- -- -- Vesting Tests -- -- -- --')
        console.log('Vesting Contract deployed at:', vestingInstance.address);
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });

    // it('admin can add a new vestee', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Admin can add a new vestee") 
    //         console.log("---") // break

    //         console.log('Storage test: console log checks  ----');
    //         console.log(vestingStorage);

    //         // Alice registers as a satellite
    //         const adminAddsNewVesteeOperation = await vestingInstance.methods.addVestee(bob.pkh, 500000000, 6, 24).send();
    //         await adminAddsNewVesteeOperation.confirmation();

    //         const newVestingStorage = await vestingInstance.storage();
    //         console.log(newVestingStorage);
    //         console.log('Block Level: ' + newVestingStorage.tempBlockLevel);
    //         const afterVesteeLedger  = await newVestingStorage.vesteeLedger.get(bob.pkh);
    //         console.log(afterVesteeLedger);        

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    

    // it('bob cannot claim vesting before cliff period', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Bob cannot claim vesting before cliff period") 
    //         console.log("---") // break

    //         console.log('Storage test: console log checks  ----');
    //         console.log(vestingStorage);

    //         await signerFactory(bob.sk);

    //         // Bob tries to claim before cliff period
    //         const bobClaimsVestingBeforeCliffOperation = await vestingInstance.methods.claim();
    //         await chai.expect(bobClaimsVestingBeforeCliffOperation.send()).to.be.eventually.rejected;

    //         const newVestingStorage = await vestingInstance.storage();
    //         console.log(newVestingStorage);
    //         console.log('--- --- ---')
    //         console.log('Block Level: ' + newVestingStorage.tempBlockLevel);
    //         console.log('--- --- ---')
    //         const afterVesteeLedger  = await newVestingStorage.vesteeLedger.get(bob.pkh);
    //         console.log(afterVesteeLedger);        

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    

    // it('bob claims first vesting after cliff period', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Bob claims vesting after cliff period") 
    //         console.log("---") // break

    //         console.log('Storage test: console log checks  ----');
    //         console.log(vestingStorage);
    //         console.log('--- --- ---')
    //         console.log('Block Level: ' + vestingStorage.tempBlockLevel);
    //         console.log('--- --- ---')

    //         await signerFactory(bob.sk);

    //         // Bob tries to claim before cliff period
    //         const bobClaimsFirstVestingAfterCliffOperation = await vestingInstance.methods.claim().send();
    //         await bobClaimsFirstVestingAfterCliffOperation.confirmation();

    //         const newVestingStorage = await vestingInstance.storage();
    //         console.log(newVestingStorage);
    //         console.log('--- --- ---')
    //         console.log('Block Level: ' + newVestingStorage.tempBlockLevel);
    //         console.log('--- --- ---')
    //         const afterVesteeLedger  = await newVestingStorage.vesteeLedger.get(bob.pkh);
    //         console.log(afterVesteeLedger);        

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    


});