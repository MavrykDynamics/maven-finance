const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual, fail } from "assert";
import { MVK, Utils, zeroAddress } from "./helpers/Utils";
import { createHash } from "crypto";
import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";
import { MichelsonMap } from "@taquito/taquito";
import {BigNumber} from "bignumber.js";

const chai              = require("chai");
const salt              = 'azerty';
const chaiAsPromised    = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory, trudy, oracleMaintainer } from "../scripts/sandbox/accounts";

import mvkTokenAddress                  from '../deployments/mvkTokenAddress.json';
import treasuryAddress                  from '../deployments/treasuryAddress.json';
import tokenSaleAddress                 from '../deployments/tokenSaleAddress.json';

import { config } from "yargs";
import { aggregatorStorageType } from "./types/aggregatorStorageType";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Token sale tests", async () => {
    var utils: Utils;

    let mvkTokenInstance;
    let treasuryInstance;
    let tokenSaleInstance;
    
    let mvkTokenStorage;
    let treasuryStorage;
    let tokenSaleStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            
            mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
            treasuryInstance                = await utils.tezos.contract.at(treasuryAddress.address);
            tokenSaleInstance               = await utils.tezos.contract.at(tokenSaleAddress.address);

            mvkTokenStorage                 = await mvkTokenInstance.storage();
            treasuryStorage                 = await treasuryInstance.storage();
            tokenSaleStorage                = await tokenSaleInstance.storage();
            
            console.log('-- -- -- -- -- Token Sale Tests -- -- -- --')
            console.log('MVK Token Contract deployed at:'           , mvkTokenInstance.address);
            console.log('Treasury Contract deployed at:'            , treasuryInstance.address);
            console.log('Token Sale Contract deployed at:'          , tokenSaleInstance.address);
            
            console.log('Bob address: '     + bob.pkh);
            console.log('Alice address: '   + alice.pkh);
            console.log('Eve address: '     + eve.pkh);
            console.log('Mallory address: ' + mallory.pkh);
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("%setAdmin", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        
        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{
                // Initial Values
                tokenSaleStorage = await tokenSaleInstance.storage();
                const currentAdmin = tokenSaleStorage.admin;

                // Operation
                const setAdminOperation = await tokenSaleInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                tokenSaleStorage = await tokenSaleInstance.storage();
                const newAdmin = tokenSaleStorage.admin;

                // reset admin
                await signerFactory(alice.sk);
                const resetAdminOperation = await tokenSaleInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                tokenSaleStorage = await tokenSaleInstance.storage();
                const currentAdmin = tokenSaleStorage.admin;

                // Operation
                await chai.expect(tokenSaleInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

                // Final values
                tokenSaleStorage = await tokenSaleInstance.storage();
                const newAdmin = tokenSaleStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%updateConfig", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin should not be able to update the configuration of a non-existing buy option', async () => {
            try{
                // Initial Values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                const buyOptionIndex    = "4";
                const buyOption         = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);

                // Operation
                await chai.expect(tokenSaleInstance.methods.updateConfig(MVK(300), "configMaxAmountPerWalletTotal", buyOptionIndex).send()).to.be.rejected;

                // Assertions
                assert.strictEqual(buyOption, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to update the max amount per wallet total of an existing buy option', async () => {
            try{
                // Initial Values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                const buyOptionIndex    = "3";
                var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueStart  = buyOption.maxAmountPerWalletTotal.toNumber();
                const updatedValue      = MVK(2000);

                // Operation
                const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configMaxAmountPerWalletTotal", buyOptionIndex).send();
                await updateOperation.confirmation();

                // Final values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueEnd    = buyOption.maxAmountPerWalletTotal.toNumber();

                // Assertions
                assert.notStrictEqual(buyOption, undefined);
                assert.equal(configValueEnd, updatedValue);
                assert.notEqual(configValueEnd, configValueStart);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to update the whitelist max amount total of an existing buy option', async () => {
            try{
                // Initial Values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                const buyOptionIndex    = "2";
                var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueStart  = buyOption.whitelistMaxAmountTotal.toNumber();
                const updatedValue      = 234;

                // Operation
                const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configWhitelistMaxAmountTotal", buyOptionIndex).send();
                await updateOperation.confirmation();

                // Final values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueEnd    = buyOption.whitelistMaxAmountTotal.toNumber();

                // Assertions
                assert.notStrictEqual(buyOption, undefined);
                assert.equal(configValueEnd, updatedValue);
                assert.notEqual(configValueEnd, configValueStart);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to update the max amount cap of an existing buy option', async () => {
            try{
                // Initial Values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                const buyOptionIndex    = "1";
                var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueStart  = buyOption.maxAmountCap.toNumber();
                const updatedValue      = MVK(11000000);

                // Operation
                const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configMaxAmountCap", buyOptionIndex).send();
                await updateOperation.confirmation();

                // Final values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueEnd    = buyOption.maxAmountCap.toNumber();

                // Assertions
                assert.notStrictEqual(buyOption, undefined);
                assert.equal(configValueEnd, updatedValue);
                assert.notEqual(configValueEnd, configValueStart);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to update the vesting in months of an existing buy option', async () => {
            try{
                // Initial Values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                const buyOptionIndex    = "3";
                var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueStart  = buyOption.vestingInMonths.toNumber();
                const updatedValue      = 13;

                // Operation
                const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configVestingInMonths", buyOptionIndex).send();
                await updateOperation.confirmation();

                // Final values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueEnd    = buyOption.vestingInMonths.toNumber();

                // Assertions
                assert.notStrictEqual(buyOption, undefined);
                assert.equal(configValueEnd, updatedValue);
                assert.notEqual(configValueEnd, configValueStart);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to update the tez per token of an existing buy option', async () => {
            try{
                // Initial Values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                const buyOptionIndex    = "2";
                var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueStart  = buyOption.tokenXtzPrice.toNumber();
                const updatedValue      = 100000;

                // Operation
                const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configTokenXtzPrice", buyOptionIndex).send();
                await updateOperation.confirmation();

                // Final values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueEnd    = buyOption.tokenXtzPrice.toNumber();

                // Assertions
                assert.notStrictEqual(buyOption, undefined);
                assert.equal(configValueEnd, updatedValue);
                assert.notEqual(configValueEnd, configValueStart);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to update the min tez amount of an existing buy option', async () => {
            try{
                // Initial Values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                const buyOptionIndex    = "1";
                var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueStart  = buyOption.minXtzAmount.toNumber();
                const updatedValue      = 100000;

                // Operation
                const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configMinXtzAmount", buyOptionIndex).send();
                await updateOperation.confirmation();

                // Final values
                tokenSaleStorage        = await tokenSaleInstance.storage();
                buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const configValueEnd    = buyOption.minXtzAmount.toNumber();

                // Assertions
                assert.notStrictEqual(buyOption, undefined);
                assert.equal(configValueEnd, updatedValue);
                assert.notEqual(configValueEnd, configValueStart);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk)
                tokenSaleStorage        = await tokenSaleInstance.storage();
                const buyOptionIndex    = "1";
                const updatedValue      = 1000;

                // Operation
                await chai.expect(tokenSaleInstance.methods.updateConfig(updatedValue, "minXtzAmount", buyOptionIndex).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%setWhitelistTimestamp", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin should be able to set the whitelist buy duration of the token sale', async () => {
            try{
                // Initial Values
                tokenSaleStorage            = await tokenSaleInstance.storage();
                const initWhitelistStart    = tokenSaleStorage.whitelistStartTimestamp;
                const initWhitelistEnd      = tokenSaleStorage.whitelistEndTimestamp;
                const currentTimestamp      = new Date();
                const desiredStart          = Math.round(currentTimestamp.getTime() / 1000);
                currentTimestamp.setDate(currentTimestamp.getDate() + 1);
                const desiredEnd            = Math.round(currentTimestamp.getTime() / 1000);

                // Operation
                const setOperation      = await tokenSaleInstance.methods.setWhitelistTimestamp(desiredStart.toString(), desiredEnd.toString()).send();
                await setOperation.confirmation();

                // Final values
                tokenSaleStorage            = await tokenSaleInstance.storage();
                const finalWhitelistStart   = tokenSaleStorage.whitelistStartTimestamp;
                const finalWhitelistEnd     = tokenSaleStorage.whitelistEndTimestamp;

                // Assertions
                assert.equal(finalWhitelistEnd, (new Date(desiredEnd * 1000)).toISOString());
                assert.equal(finalWhitelistStart, (new Date(desiredStart * 1000)).toISOString());
                assert.notEqual(finalWhitelistEnd, initWhitelistEnd);
                assert.notEqual(finalWhitelistStart, initWhitelistStart);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                await signerFactory(alice.sk)
                tokenSaleStorage            = await tokenSaleInstance.storage();
                const currentTimestamp      = new Date();
                const desiredStart          = Math.round(currentTimestamp.getTime() / 1000);
                currentTimestamp.setDate(currentTimestamp.getDate() + 1);
                const desiredEnd            = Math.round(currentTimestamp.getTime() / 1000);

                // Operation
                await chai.expect(tokenSaleInstance.methods.setWhitelistTimestamp(desiredStart.toString(), desiredEnd.toString()).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%addToWhitelist", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin should be able to add users to the whitelist addresses', async () => {
            try{
                // Initial Values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const startFirstUserWhitelist   = await tokenSaleStorage.whitelistedAddresses.get(alice.pkh);
                const startSecondUserWhitelist  = await tokenSaleStorage.whitelistedAddresses.get(bob.pkh);
                const startThirdUserWhitelist   = await tokenSaleStorage.whitelistedAddresses.get(eve.pkh);
                const desiredWhitelisted        = [alice.pkh, bob.pkh, eve.pkh];
                
                // Operation
                const addOperation              = await tokenSaleInstance.methods.addToWhitelist(desiredWhitelisted).send();
                await addOperation.confirmation();

                // Final values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const endFirstUserWhitelist     = await tokenSaleStorage.whitelistedAddresses.get(alice.pkh);
                const endSecondUserWhitelist    = await tokenSaleStorage.whitelistedAddresses.get(bob.pkh);
                const endThirdUserWhitelist     = await tokenSaleStorage.whitelistedAddresses.get(eve.pkh);

                // Assertions
                assert.strictEqual(startFirstUserWhitelist, undefined);
                assert.strictEqual(startSecondUserWhitelist, undefined);
                assert.strictEqual(startThirdUserWhitelist, undefined);
                assert.notStrictEqual(endFirstUserWhitelist, undefined);
                assert.notStrictEqual(endSecondUserWhitelist, undefined);
                assert.notStrictEqual(endThirdUserWhitelist, undefined);
                assert.equal(endFirstUserWhitelist, true);
                assert.equal(endSecondUserWhitelist, true);
                assert.equal(endThirdUserWhitelist, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const desiredWhitelisted        = [alice.pkh, bob.pkh, eve.pkh];
                
                // Operation
                await chai.expect(tokenSaleInstance.methods.addToWhitelist(desiredWhitelisted).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%removeFromWhitelist", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin should be able to remove users to the whitelist addresses', async () => {
            try{
                // Initial Values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const startFirstUserWhitelist   = await tokenSaleStorage.whitelistedAddresses.get(alice.pkh);
                const startSecondUserWhitelist  = await tokenSaleStorage.whitelistedAddresses.get(bob.pkh);
                const startThirdUserWhitelist   = await tokenSaleStorage.whitelistedAddresses.get(eve.pkh);
                const desiredWhitelisted        = [alice.pkh];
                
                // Operation
                const removeOperation           = await tokenSaleInstance.methods.removeFromWhitelist(desiredWhitelisted).send();
                await removeOperation.confirmation();

                // Final values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const endFirstUserWhitelist     = await tokenSaleStorage.whitelistedAddresses.get(alice.pkh);
                const endSecondUserWhitelist    = await tokenSaleStorage.whitelistedAddresses.get(bob.pkh);
                const endThirdUserWhitelist     = await tokenSaleStorage.whitelistedAddresses.get(eve.pkh);

                // Assertions
                assert.notStrictEqual(startFirstUserWhitelist, undefined);
                assert.notStrictEqual(startSecondUserWhitelist, undefined);
                assert.notStrictEqual(startThirdUserWhitelist, undefined);
                assert.strictEqual(endFirstUserWhitelist, undefined);
                assert.notStrictEqual(endSecondUserWhitelist, undefined);
                assert.notStrictEqual(endThirdUserWhitelist, undefined);
                assert.equal(endSecondUserWhitelist, true);
                assert.equal(endThirdUserWhitelist, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const desiredWhitelisted        = [bob.pkh];
                
                // Operation
                await chai.expect(tokenSaleInstance.methods.removeFromWhitelist(desiredWhitelisted).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%startSale", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin should be able to start the token sale', async () => {
            try{
                // Initial Values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const initSaleStarted           = tokenSaleStorage.tokenSaleHasStarted;
                const initSaleEnded             = tokenSaleStorage.tokenSaleHasEnded;
                
                // Operation
                const operation                 = await tokenSaleInstance.methods.startSale().send();
                await operation.confirmation();

                // Final values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const endSaleStarted            = tokenSaleStorage.tokenSaleHasStarted;
                const endSaleEnded              = tokenSaleStorage.tokenSaleHasEnded;

                // Assertions
                assert.notEqual(endSaleStarted, initSaleStarted);
                assert.equal(endSaleEnded, initSaleEnded);
                assert.equal(endSaleStarted, true);
                assert.equal(endSaleEnded, false);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                tokenSaleStorage                = await tokenSaleInstance.storage();
                
                // Operation
                await chai.expect(tokenSaleInstance.methods.startSale().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%buyTokens", async () => {
        
        beforeEach("Set signer to user", async () => {
            await signerFactory(eve.sk)
        });
    
        it('Whitelisted user should be able to buy tokens during the whitelist period', async () => {
            try{
                // Initial Values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const userAddress               = eve.pkh;
                const buyOptionIndex            = "1";
                const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
                const amountToBuy               = MVK(3000);
                const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
                console.log("TOTAL XTZ PAID: ", amountToPay)
                const userWhitelisted           = await tokenSaleStorage.whitelistedAddresses.get(userAddress);
                const initUserTokenRecord       = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
                const currentTimestamp          = new Date();
                const desiredStart              = Math.round(currentTimestamp.getTime() / 1000);
                currentTimestamp.setMinutes(currentTimestamp.getMinutes() + 1);
                const desiredEnd                = Math.round(currentTimestamp.getTime() / 1000);

                // Set the whitelisted period
                await signerFactory(bob.sk);
                const setOperation              = await tokenSaleInstance.methods.setWhitelistTimestamp(desiredStart.toString(), desiredEnd.toString()).send();
                await setOperation.confirmation();
                await signerFactory(eve.sk);
                const buyOperation              = await tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay});
                await buyOperation.confirmation();

                // Final values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const endUserTokenRecord        = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
                const endUserBuyOption          = await endUserTokenRecord.get(buyOptionIndex);

                console.log("End user option:", endUserBuyOption);

                // Assertions
                assert.equal(endUserBuyOption.tokenBought.toNumber(), amountToBuy);
                assert.equal(endUserBuyOption.tokenClaimed.toNumber(), 0);
                assert.equal(endUserBuyOption.claimCounter.toNumber(), 0);
                assert.notStrictEqual(userWhitelisted, undefined);
                assert.strictEqual(initUserTokenRecord, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    
        it('Non-whitelisted user should be not able to buy tokens during the whitelist period', async () => {
            try{
                // Initial Values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const userAddress               = trudy.pkh;
                const buyOptionIndex            = "1";
                const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
                const amountToBuy               = MVK(3000);
                const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
                const userWhitelisted           = await tokenSaleStorage.whitelistedAddresses.get(userAddress);

                // Set the whitelisted period
                await signerFactory(trudy.sk);
                chai.expect(tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay})).to.be.rejected;
                
                // Assertions
                assert.strictEqual(userWhitelisted, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    
        it('Non-whitelisted user should be able to buy tokens after the whitelist period end', async () => {
            try{
                // Initial Values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const userAddress               = trudy.pkh;
                const buyOptionIndex            = "1";
                const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
                const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
                const amountToBuy               = MVK(3000);
                const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
                const userWhitelisted           = await tokenSaleStorage.whitelistedAddresses.get(userAddress);
                const initUserTokenRecord       = await tokenSaleStorage.tokenSaleLedger.get(userAddress);            

                // Wait until whitelist period ends
                await wait(60000); // 1min

                // Set the whitelisted period
                await signerFactory(trudy.sk);
                const buyOperations = await tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay});
                await buyOperations.confirmation();

                // Final values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const endUserTokenRecord        = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
                const endUserBuyOption          = await endUserTokenRecord.get(buyOptionIndex);

                // Assertions
                assert.equal(endUserBuyOption.tokenBought.toNumber(), amountToBuy);
                assert.equal(endUserBuyOption.tokenClaimed.toNumber(), 0);
                assert.equal(endUserBuyOption.claimCounter.toNumber(), 0);
                assert.strictEqual(initUserTokenRecord, undefined);
                assert.strictEqual(userWhitelisted, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("%pauseSale", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin should be able to pause the token sale', async () => {
            try{
                // Initial Values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const initSalePaused            = tokenSaleStorage.tokenSalePaused;
                
                // Operation
                const operation                 = await tokenSaleInstance.methods.pauseSale().send();
                await operation.confirmation();

                // Final values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const endSalePaused             = tokenSaleStorage.tokenSalePaused;

                // Assertions
                assert.notEqual(endSalePaused, initSalePaused);
                assert.equal(endSalePaused, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                tokenSaleStorage                = await tokenSaleInstance.storage();
                
                // Operation
                await chai.expect(tokenSaleInstance.methods.pauseSale().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%closeSale", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin should be able to close the token sale', async () => {
            try{
                // Initial Values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const initSaleEndTimestamp      = tokenSaleStorage.tokenSaleEndTimestamp;
                const initSaleEndLevel          = tokenSaleStorage.tokenSaleEndBlockLevel;
                const initSaleEnded             = tokenSaleStorage.tokenSaleHasEnded;
                
                // Operation
                const operation                 = await tokenSaleInstance.methods.closeSale().send();
                await operation.confirmation();

                // Final values
                tokenSaleStorage                = await tokenSaleInstance.storage();
                const endSaleEndTimestamp       = tokenSaleStorage.tokenSaleEndTimestamp;
                const endSaleEndLevel           = tokenSaleStorage.tokenSaleEndBlockLevel;
                const endSaleEnded              = tokenSaleStorage.tokenSaleHasEnded;

                // Assertions
                assert.notEqual(initSaleEndTimestamp, endSaleEndTimestamp);
                assert.notEqual(endSaleEndLevel, initSaleEndLevel);
                assert.notEqual(endSaleEnded, initSaleEnded);
                assert.equal(endSaleEnded, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                tokenSaleStorage                = await tokenSaleInstance.storage();
                
                // Operation
                await chai.expect(tokenSaleInstance.methods.closeSale().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });
});
