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
import cfmmAddress from '../deployments/cfmmAddress.json';
// import vaultAddress from '../deployments/vaultAddress.json';

describe("USDM Token Controller tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let usdmTokenControllerInstance;
    let usdmTokenInstance;
    let cfmmInstance;
    // let vaultInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let usdmTokenControllerStorage;
    let usdmTokenStorage;
    let cfmmStorage;
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
        usdmTokenInstance              = await utils.tezos.contract.at(usdmTokenAddress.address);
        cfmmInstance                   = await utils.tezos.contract.at(cfmmAddress.address);
        // vaultInstance    = await utils.tezos.contract.at(vaultAddress.address);
            
        doormanStorage              = await doormanInstance.storage();
        delegationStorage           = await delegationInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        governanceStorage           = await governanceInstance.storage();
        usdmTokenControllerStorage  = await usdmTokenControllerInstance.storage();
        usdmTokenStorage            = await usdmTokenInstance.storage();
        cfmmStorage                 = await cfmmInstance.storage();

        console.log('-- -- -- -- -- USDM Token Controller Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        
        console.log('USDM Token deployed at:', usdmTokenInstance.address);
        console.log('USDM Token Controller deployed at:', usdmTokenControllerInstance.address);
        console.log('CFMM (USDM/XTZ) deployed at:', cfmmInstance.address);

        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });

    it('user (eve) can create a new vault (depositors: any) in USDM Token Controller', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: User (eve) can create a new vault (depositors: any) in USDM Token Controller") 
            console.log("---") // break
            
            // init variables
            await signerFactory(eve.sk);
            const vaultId     = 1;
            const depositors  = "any"

            // user (alice) creates a new vault
            const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
                vaultId, 
                eve.pkh,  
                depositors
                ).send();
            await userCreatesANewVaultOperation.confirmation();

            const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
            const vaultHandle = {
                "id" : vaultId,
                "owner": eve.pkh
            };
            const vault = await updatedTokenControllerStorage.vaults.get(vaultHandle);

            assert.equal(vault.usdmOutstanding, 0);
            // assert.equal(vault.collateralBalanceLedger, {});
            // assert.equal(vault.collateralTokenAddresses, {});

            // console.log(vault);

        } catch(e){
            console.log(e);
        } 

    });    

    it('user (mallory) can create a new vault (depositors: whitelist set) in USDM Token Controller', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: User (mallory) can create a new vault (depositors: whitelist set) in USDM Token Controller") 
            console.log("---") // break
            
            // init variables
            await signerFactory(mallory.sk);
            const vaultId     = 2;
            const depositors  = "whitelist";

            // const usdmTokenControllerParameterSchema = usdmTokenControllerInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(usdmTokenControllerParameterSchema,null,2));

            // user (alice) creates a new vault
            const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
                vaultId, 
                mallory.pkh,  
                depositors,
                [mallory.pkh]
                ).send();
            await userCreatesANewVaultOperation.confirmation();

            const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
            const vaultHandle = {
                "id" : vaultId,
                "owner": mallory.pkh
            }
            const vault = await updatedTokenControllerStorage.vaults.get(vaultHandle);

            assert.equal(vault.usdmOutstanding, 0);
            // assert.equal(vault.collateralBalanceLedger, {});
            // assert.equal(vault.collateralTokenAddresses, {});

            
            // console.log(vault);

        } catch(e){
            console.log(e);
        } 

    });    



});