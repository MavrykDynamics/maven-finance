const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import { BigNumber } from "bignumber.js";
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";
import { MichelsonMap } from "@taquito/michelson-encoder";

const chai = require("chai");
const assert = require("chai").assert;
const { createHash } = require("crypto")
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve } from "../scripts/sandbox/accounts";

import farmFactoryAddress from '../deployments/farmFactoryAddress.json';
import doormanAddress from '../deployments/doormanAddress.json';
import lpTokenAddress from '../deployments/lpTokenAddress.json';
import { farmStorage } from '../storage/farmStorage';
import { farmStorageType } from "./types/farmStorageType";

let farmAddress: string;

describe("FarmFactory", async () => {
    var utils: Utils;

    let farmFactoryInstance;
    let farmFactoryStorage;

    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        utils = new Utils();
        await utils.init(alice.sk);
        
        farmFactoryInstance   = await utils.tezos.contract.at(farmFactoryAddress.address);
        farmFactoryStorage    = await farmFactoryInstance.storage();
    });

    beforeEach("storage", async () => {
        farmFactoryStorage = await farmFactoryInstance.storage();
        await signerFactory(alice.sk)
    })

    describe('%createFarm', function() {
        it('Create a farm being the admin', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.createFarm(
                    100,
                    12000,
                    lpTokenAddress.address,
                    0,
                    "fa12"
                ).send();
                await operation.confirmation()

                // Created farms
                farmFactoryStorage    = await farmFactoryInstance.storage();

                // Get the new farm
                farmAddress                             = farmFactoryStorage.createdFarms[farmFactoryStorage.createdFarms.length - 1];
                const farmInstance                      = await utils.tezos.contract.at(farmAddress);
                const farmStorage: farmStorageType      = await farmInstance.storage();

                assert.strictEqual(farmStorage.lpToken.tokenAddress, lpTokenAddress.address);
                assert.equal(farmStorage.lpToken.tokenId, 0);
                assert.equal(farmStorage.lpToken.tokenBalance, 0);
                assert.equal(Object.keys(farmStorage.lpToken.tokenStandard)[0], "fa12");
                assert.equal(farmStorage.plannedRewards.rewardPerBlock, 100);
                assert.equal(farmStorage.plannedRewards.totalBlocks, 12000);
                assert.equal(farmStorage.open, true);
            }catch(e){
                console.log(e);
            }
        })

        it('Create a farm without being the admin', async () => {
            try{
                // Change signer
                await signerFactory(bob.sk);

                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.createFarm(
                    100,
                    12000,
                    lpTokenAddress.address,
                    0,
                    "fa12"
                ).send();
                await operation.confirmation()
            }catch(e){
                assert.strictEqual(e.message, "ONLY_ADMINISTRATOR_ALLOWED");
            }
        })
    });

    describe('%checkFarm', function() {
        it('Check with the previously created farm address', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.checkFarm(farmAddress).send();
                await operation.confirmation();
            }catch(e){
                console.log(e);
            }
        })

        it('Check with Bob address', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.checkFarm(bob.pkh).send();
                await operation.confirmation()
            }catch(e){
                assert.strictEqual(e.message, "The provided farm contract does not exist in the createdFarms big_map");
            }
        })
    });

    describe('%untrackFarm', function() {
        it('Untrack the previously created farm', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                await operation.confirmation();

                // Farm storage
                farmFactoryStorage      = await farmFactoryInstance.storage();
                const createdFarm       = await farmFactoryStorage.createdFarms[farmAddress];
                assert.strictEqual(createdFarm,undefined);
            }catch(e){
                console.log(e);
            }
        })

        it('Untrack an unexisting farm', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.untrackFarm(bob.pkh).send();
                await operation.confirmation();
            }catch(e){
                assert.strictEqual(e.message, "The provided farm contract does not exist in the createdFarms big_map");
            }
        })
    });
});