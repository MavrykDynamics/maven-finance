// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual, fail } from "assert";
// import { MVK, Utils, zeroAddress } from "./helpers/Utils";
// import { createHash } from "crypto";
// import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";
// import { MichelsonMap } from "@taquito/taquito";
// import {BigNumber} from "bignumber.js";

// const chai              = require("chai");
// const salt              = 'azerty';
// const chaiAsPromised    = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, trudy, oracleMaintainer } from "../scripts/sandbox/accounts";

// import mvkTokenAddress                  from '../deployments/mvkTokenAddress.json';
// import treasuryAddress                  from '../deployments/treasuryAddress.json';
// import tokenSaleAddress                 from '../deployments/tokenSaleAddress.json';

// import { config } from "yargs";
// import { aggregatorStorageType } from "./types/aggregatorStorageType";

// function wait(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// describe("Token sale tests", async () => {
//     var utils: Utils;

//     let mvkTokenInstance;
//     let treasuryInstance;
//     let tokenSaleInstance;
    
//     let mvkTokenStorage;
//     let treasuryStorage;
//     let tokenSaleStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {
//         try{
//             utils = new Utils();
//             await utils.init(bob.sk);
            
//             mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
//             treasuryInstance                = await utils.tezos.contract.at(treasuryAddress.address);
//             tokenSaleInstance               = await utils.tezos.contract.at(tokenSaleAddress.address);

//             mvkTokenStorage                 = await mvkTokenInstance.storage();
//             treasuryStorage                 = await treasuryInstance.storage();
//             tokenSaleStorage                = await tokenSaleInstance.storage();
            
//             console.log('-- -- -- -- -- Token Sale Tests -- -- -- --')
//             console.log('MVK Token Contract deployed at:'           , mvkTokenInstance.address);
//             console.log('Treasury Contract deployed at:'            , treasuryInstance.address);
//             console.log('Token Sale Contract deployed at:'          , tokenSaleInstance.address);
            
//             console.log('Bob address: '     + bob.pkh);
//             console.log('Alice address: '   + alice.pkh);
//             console.log('Eve address: '     + eve.pkh);
//             console.log('Mallory address: ' + mallory.pkh);
//         } catch(e) {
//             console.dir(e, {depth: 5})
//         }
//     });

//     describe("%setAdmin", async () => {
        
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
        
//         it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage = await tokenSaleInstance.storage();
//                 const currentAdmin = tokenSaleStorage.admin;

//                 // Operation
//                 const setAdminOperation = await tokenSaleInstance.methods.setAdmin(alice.pkh).send();
//                 await setAdminOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage = await tokenSaleInstance.storage();
//                 const newAdmin = tokenSaleStorage.admin;

//                 // reset admin
//                 await signerFactory(alice.sk);
//                 const resetAdminOperation = await tokenSaleInstance.methods.setAdmin(bob.pkh).send();
//                 await resetAdminOperation.confirmation();

//                 // Assertions
//                 assert.notStrictEqual(newAdmin, currentAdmin);
//                 assert.strictEqual(newAdmin, alice.pkh);
//                 assert.strictEqual(currentAdmin, bob.pkh);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 tokenSaleStorage = await tokenSaleInstance.storage();
//                 const currentAdmin = tokenSaleStorage.admin;

//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

//                 // Final values
//                 tokenSaleStorage = await tokenSaleInstance.storage();
//                 const newAdmin = tokenSaleStorage.admin;

//                 // Assertions
//                 assert.strictEqual(newAdmin, currentAdmin);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     })

//     describe("%updateConfig", async () => {
        
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should not be able to update the configuration of a non-existing buy option', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const buyOptionIndex    = "4";
//                 const buyOption         = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);

//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.updateConfig(MVK(300), "configMaxAmountPerWalletTotal", buyOptionIndex).send()).to.be.rejected;

//                 // Assertions
//                 assert.strictEqual(buyOption, undefined);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to update the max amount per wallet total of an existing buy option', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const buyOptionIndex    = "3";
//                 var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueStart  = buyOption.maxAmountPerWalletTotal.toNumber();
//                 const updatedValue      = MVK(2000);

//                 // Operation
//                 const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configMaxAmountPerWalletTotal", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueEnd    = buyOption.maxAmountPerWalletTotal.toNumber();

//                 // Assertions
//                 assert.notStrictEqual(buyOption, undefined);
//                 assert.equal(configValueEnd, updatedValue);
//                 assert.notEqual(configValueEnd, configValueStart);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to update the whitelist max amount total of an existing buy option', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const buyOptionIndex    = "2";
//                 var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueStart  = buyOption.whitelistMaxAmountTotal.toNumber();
//                 const updatedValue      = 234;

//                 // Operation
//                 const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configWhitelistMaxAmountTotal", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueEnd    = buyOption.whitelistMaxAmountTotal.toNumber();

//                 // Assertions
//                 assert.notStrictEqual(buyOption, undefined);
//                 assert.equal(configValueEnd, updatedValue);
//                 assert.notEqual(configValueEnd, configValueStart);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to update the max amount cap of an existing buy option', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const buyOptionIndex    = "1";
//                 var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueStart  = buyOption.maxAmountCap.toNumber();
//                 const updatedValue      = MVK(11000000);

//                 // Operation
//                 const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configMaxAmountCap", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueEnd    = buyOption.maxAmountCap.toNumber();

//                 // Assertions
//                 assert.notStrictEqual(buyOption, undefined);
//                 assert.equal(configValueEnd, updatedValue);
//                 assert.notEqual(configValueEnd, configValueStart);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to update the vesting in months of an existing buy option', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const buyOptionIndex    = "3";
//                 var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueStart  = buyOption.vestingPeriods.toNumber();
//                 const updatedValue      = 13;

//                 // Operation
//                 const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configVestingPeriods", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueEnd    = buyOption.vestingPeriods.toNumber();

//                 // Assertions
//                 assert.notStrictEqual(buyOption, undefined);
//                 assert.equal(configValueEnd, updatedValue);
//                 assert.notEqual(configValueEnd, configValueStart);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to update the token price of an existing buy option', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const buyOptionIndex    = "2";
//                 var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueStart  = buyOption.tokenXtzPrice.toNumber();
//                 const updatedValue      = 1; // Set a very small price for future tests

//                 // Operation
//                 const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configTokenXtzPrice", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueEnd    = buyOption.tokenXtzPrice.toNumber();

//                 // Assertions
//                 assert.notStrictEqual(buyOption, undefined);
//                 assert.equal(configValueEnd, updatedValue);
//                 assert.notEqual(configValueEnd, configValueStart);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to update the min mvk amount of an existing buy option', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const buyOptionIndex    = "1";
//                 var buyOption           = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueStart  = buyOption.minMvkAmount.toNumber();
//                 const updatedValue      = 1; // Small number for future tests

//                 // Operation
//                 const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configMinMvkAmount", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 buyOption               = tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const configValueEnd    = buyOption.minMvkAmount.toNumber();

//                 // Assertions
//                 assert.notStrictEqual(buyOption, undefined);
//                 assert.equal(configValueEnd, updatedValue);
//                 assert.notEqual(configValueEnd, configValueStart);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to update the global vesting period duration', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const configValueStart  = tokenSaleStorage.config.vestingPeriodDurationSec.toNumber();
//                 const updatedValue      = 15 // 15sec per vesting periods

//                 // Operation
//                 const updateOperation   = await tokenSaleInstance.methods.updateConfig(updatedValue, "configVestingPeriodDurationSec").send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const configValueEnd    = tokenSaleStorage.config.vestingPeriodDurationSec.toNumber();

//                 // Assertions
//                 assert.equal(configValueEnd, updatedValue);
//                 assert.notEqual(configValueEnd, configValueStart);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk)
//                 tokenSaleStorage        = await tokenSaleInstance.storage();
//                 const buyOptionIndex    = "1";
//                 const updatedValue      = 1000;

//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.updateConfig(updatedValue, "configMinMvkAmount", buyOptionIndex).send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     });

//     describe("%setWhitelistTimestamp", async () => {
        
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to set the whitelist buy duration of the token sale', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage            = await tokenSaleInstance.storage();
//                 const initWhitelistStart    = tokenSaleStorage.whitelistStartTimestamp;
//                 const initWhitelistEnd      = tokenSaleStorage.whitelistEndTimestamp;
//                 const currentTimestamp      = new Date();
//                 const desiredStart          = Math.round(currentTimestamp.getTime() / 1000);
//                 currentTimestamp.setDate(currentTimestamp.getDate() + 1);
//                 const desiredEnd            = Math.round(currentTimestamp.getTime() / 1000);

//                 // Operation
//                 const setOperation      = await tokenSaleInstance.methods.setWhitelistTimestamp(desiredStart.toString(), desiredEnd.toString()).send();
//                 await setOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage            = await tokenSaleInstance.storage();
//                 const finalWhitelistStart   = tokenSaleStorage.whitelistStartTimestamp;
//                 const finalWhitelistEnd     = tokenSaleStorage.whitelistEndTimestamp;

//                 // Assertions
//                 assert.equal(finalWhitelistEnd, (new Date(desiredEnd * 1000)).toISOString());
//                 assert.equal(finalWhitelistStart, (new Date(desiredStart * 1000)).toISOString());
//                 assert.notEqual(finalWhitelistEnd, initWhitelistEnd);
//                 assert.notEqual(finalWhitelistStart, initWhitelistStart);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial values
//                 await signerFactory(alice.sk)
//                 tokenSaleStorage            = await tokenSaleInstance.storage();
//                 const currentTimestamp      = new Date();
//                 const desiredStart          = Math.round(currentTimestamp.getTime() / 1000);
//                 currentTimestamp.setDate(currentTimestamp.getDate() + 1);
//                 const desiredEnd            = Math.round(currentTimestamp.getTime() / 1000);

//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.setWhitelistTimestamp(desiredStart.toString(), desiredEnd.toString()).send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     });

//     describe("%addToWhitelist", async () => {
        
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to add users to the whitelist addresses', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const startFirstUserWhitelist   = await tokenSaleStorage.whitelistedAddresses.get(alice.pkh);
//                 const startSecondUserWhitelist  = await tokenSaleStorage.whitelistedAddresses.get(bob.pkh);
//                 const startThirdUserWhitelist   = await tokenSaleStorage.whitelistedAddresses.get(eve.pkh);
//                 const desiredWhitelisted        = [alice.pkh, bob.pkh, eve.pkh];
                
//                 // Operation
//                 const addOperation              = await tokenSaleInstance.methods.addToWhitelist(desiredWhitelisted).send();
//                 await addOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const endFirstUserWhitelist     = await tokenSaleStorage.whitelistedAddresses.get(alice.pkh);
//                 const endSecondUserWhitelist    = await tokenSaleStorage.whitelistedAddresses.get(bob.pkh);
//                 const endThirdUserWhitelist     = await tokenSaleStorage.whitelistedAddresses.get(eve.pkh);

//                 // Assertions
//                 assert.strictEqual(startFirstUserWhitelist, undefined);
//                 assert.strictEqual(startSecondUserWhitelist, undefined);
//                 assert.strictEqual(startThirdUserWhitelist, undefined);
//                 assert.notStrictEqual(endFirstUserWhitelist, undefined);
//                 assert.notStrictEqual(endSecondUserWhitelist, undefined);
//                 assert.notStrictEqual(endThirdUserWhitelist, undefined);
//                 assert.notStrictEqual(endFirstUserWhitelist, undefined);
//                 assert.notStrictEqual(endSecondUserWhitelist, undefined);
//                 assert.notStrictEqual(endThirdUserWhitelist, undefined);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const desiredWhitelisted        = [alice.pkh, bob.pkh, eve.pkh];
                
//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.addToWhitelist(desiredWhitelisted).send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     });

//     describe("%removeFromWhitelist", async () => {
        
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to remove users to the whitelist addresses', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const startFirstUserWhitelist   = await tokenSaleStorage.whitelistedAddresses.get(alice.pkh);
//                 const startSecondUserWhitelist  = await tokenSaleStorage.whitelistedAddresses.get(bob.pkh);
//                 const startThirdUserWhitelist   = await tokenSaleStorage.whitelistedAddresses.get(eve.pkh);
//                 const desiredWhitelisted        = [alice.pkh];
                
//                 // Operation
//                 const removeOperation           = await tokenSaleInstance.methods.removeFromWhitelist(desiredWhitelisted).send();
//                 await removeOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const endFirstUserWhitelist     = await tokenSaleStorage.whitelistedAddresses.get(alice.pkh);
//                 const endSecondUserWhitelist    = await tokenSaleStorage.whitelistedAddresses.get(bob.pkh);
//                 const endThirdUserWhitelist     = await tokenSaleStorage.whitelistedAddresses.get(eve.pkh);

//                 // Assertions
//                 assert.notStrictEqual(startFirstUserWhitelist, undefined);
//                 assert.notStrictEqual(startSecondUserWhitelist, undefined);
//                 assert.notStrictEqual(startThirdUserWhitelist, undefined);
//                 assert.strictEqual(endFirstUserWhitelist, undefined);
//                 assert.notStrictEqual(endSecondUserWhitelist, undefined);
//                 assert.notStrictEqual(endThirdUserWhitelist, undefined);
//                 assert.notStrictEqual(endSecondUserWhitelist, undefined);
//                 assert.notStrictEqual(endThirdUserWhitelist, undefined);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const desiredWhitelisted        = [bob.pkh];
                
//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.removeFromWhitelist(desiredWhitelisted).send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     });

//     describe("%startSale", async () => {
        
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('User should not be able to buy tokens if the the token sale did not start', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = MVK(3000);
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
//                 const initSaleStarted           = tokenSaleStorage.tokenSaleHasStarted;
//                 const initSaleEnded             = tokenSaleStorage.tokenSaleHasEnded;

//                 // Set the whitelisted period
//                 await signerFactory(trudy.sk);
//                 await chai.expect(tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay})).to.be.rejected;

//                 // Assertions
//                 assert.equal(initSaleStarted, false);
//                 assert.equal(initSaleEnded, false);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to start the token sale', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const initSaleStarted           = tokenSaleStorage.tokenSaleHasStarted;
//                 const initSaleEnded             = tokenSaleStorage.tokenSaleHasEnded;
                
//                 // Operation
//                 const operation                 = await tokenSaleInstance.methods.startSale().send();
//                 await operation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const endSaleStarted            = tokenSaleStorage.tokenSaleHasStarted;
//                 const endSaleEnded              = tokenSaleStorage.tokenSaleHasEnded;

//                 // Assertions
//                 assert.notEqual(endSaleStarted, initSaleStarted);
//                 assert.equal(endSaleEnded, initSaleEnded);
//                 assert.equal(endSaleStarted, true);
//                 assert.equal(endSaleEnded, false);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
                
//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.startSale().send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     });

//     describe("%buyTokens", async () => {
        
//         beforeEach("Set signer to user", async () => {
//             await signerFactory(eve.sk)
//         });
    
//         it('Whitelisted user should be able to buy tokens during the whitelist period', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const userAddress               = eve.pkh;
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = MVK(3000);
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
//                 console.log("TOTAL XTZ PAID: ", amountToPay)
//                 const userWhitelisted           = await tokenSaleStorage.whitelistedAddresses.get(userAddress);
//                 const initUserTokenRecord       = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const currentTimestamp          = new Date();
//                 const desiredStart              = Math.round(currentTimestamp.getTime() / 1000);
//                 currentTimestamp.setMinutes(currentTimestamp.getMinutes() + 1);
//                 const desiredEnd                = Math.round(currentTimestamp.getTime() / 1000);

//                 // Set the whitelisted period
//                 await signerFactory(bob.sk);
//                 const setOperation              = await tokenSaleInstance.methods.setWhitelistTimestamp(desiredStart.toString(), desiredEnd.toString()).send();
//                 await setOperation.confirmation();
//                 await signerFactory(eve.sk);
//                 const buyOperation              = await tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay});
//                 await buyOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const endUserTokenRecord        = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const endUserBuyOption          = await endUserTokenRecord.get(buyOptionIndex);

//                 console.log("End user option:", endUserBuyOption);

//                 // Assertions
//                 assert.equal(endUserBuyOption.tokenBought.toNumber(), amountToBuy);
//                 assert.equal(endUserBuyOption.tokenClaimed.toNumber(), 0);
//                 assert.equal(endUserBuyOption.claimCounter.toNumber(), 0);
//                 assert.notStrictEqual(userWhitelisted, undefined);
//                 assert.strictEqual(initUserTokenRecord, undefined);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
    
//         it('Whitelisted user should not be able to exceed the maximum of tokens it can personaly buy during the whitelist period', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const whitelistMaximum          = buyOption.whitelistMaxAmountTotal.toNumber();
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = whitelistMaximum + MVK();
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6

//                 // Set the whitelisted period
//                 await chai.expect(tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay})).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
    
//         it('Non-whitelisted user should be not able to buy tokens during the whitelist period', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const userAddress               = trudy.pkh;
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = MVK(3000);
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
//                 const userWhitelisted           = await tokenSaleStorage.whitelistedAddresses.get(userAddress);

//                 // Set the whitelisted period
//                 await signerFactory(trudy.sk);
//                 await chai.expect(tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay})).to.be.rejected;
                
//                 // Assertions
//                 assert.strictEqual(userWhitelisted, undefined);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
    
//         it('Non-whitelisted user should be able to buy tokens after the whitelist period end', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const userAddress               = trudy.pkh;
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = MVK(3000);
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
//                 const userWhitelisted           = await tokenSaleStorage.whitelistedAddresses.get(userAddress);
//                 const initUserTokenRecord       = await tokenSaleStorage.tokenSaleLedger.get(userAddress);            

//                 // Wait until whitelist period ends
//                 await wait(60000); // 1min

//                 // Set the whitelisted period
//                 await signerFactory(trudy.sk);
//                 const buyOperation = await tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay});
//                 await buyOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const endUserTokenRecord        = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const endUserBuyOption          = await endUserTokenRecord.get(buyOptionIndex);

//                 // Assertions
//                 assert.equal(endUserBuyOption.tokenBought.toNumber(), amountToBuy);
//                 assert.equal(endUserBuyOption.tokenClaimed.toNumber(), 0);
//                 assert.equal(endUserBuyOption.claimCounter.toNumber(), 0);
//                 assert.strictEqual(initUserTokenRecord, undefined);
//                 assert.strictEqual(userWhitelisted, undefined);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
    
//         it('User should not be able to exceed the maximum of tokens available', async () => {
//             try{
//                 // Update the maxAmountCap
//                 await signerFactory(bob.sk);
//                 const buyOptionIndex            = "1";
//                 var updateOperation             = await tokenSaleInstance.methods.updateConfig(1000, "configMaxAmountCap", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const maxAmount                 = buyOption.maxAmountCap.toNumber();
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = maxAmount + MVK();
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
                
//                 // Set the whitelisted period
//                 await signerFactory(eve.sk)
//                 await chai.expect(tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay})).to.be.rejected;

//                 // Reset the max amount cap
//                 await signerFactory(bob.sk);
//                 updateOperation                 = await tokenSaleInstance.methods.updateConfig(MVK(11000000), "configMaxAmountCap", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
    
//         it('User should not be able to buy tokens if it did not exceed the minimum amount it can buy', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = MVK();
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
                
//                 // Update the minMvkAmount
//                 await signerFactory(bob.sk);
//                 var updateOperation             = await tokenSaleInstance.methods.updateConfig(10000000000000000, "configMinMvkAmount", buyOptionIndex).send();
//                 await updateOperation.confirmation();

//                 // Set the whitelisted period
//                 await signerFactory(eve.sk)
//                 await chai.expect(tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay})).to.be.rejected;

//                 // Reset the max cap
//                 await signerFactory(bob.sk);
//                 updateOperation                 = await tokenSaleInstance.methods.updateConfig(1, "configMinMvkAmount", buyOptionIndex).send();
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
    
//         it('User should be able to buy tokens from multiple options', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const userAddress               = mallory.pkh;
//                 const firstBuyOptionIndex       = "1";
//                 const secondBuyOptionIndex      = "2";
//                 const thirdBuyOptionIndex       = "3";
//                 const firstBuyOption            = await tokenSaleStorage.config.buyOptions.get(firstBuyOptionIndex);
//                 const secondBuyOption           = await tokenSaleStorage.config.buyOptions.get(secondBuyOptionIndex);
//                 const thirdBuyOption            = await tokenSaleStorage.config.buyOptions.get(thirdBuyOptionIndex);
//                 const firstTokenXTZPrice        = firstBuyOption.tokenXtzPrice.toNumber();
//                 const secondTokenXTZPrice       = secondBuyOption.tokenXtzPrice.toNumber();
//                 const thirdTokenXTZPrice        = thirdBuyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = MVK(30);
//                 const firstAmountToPay          = (amountToBuy / MVK() * firstTokenXTZPrice) / 10**6
//                 const secondAmountToPay         = (amountToBuy / MVK() * secondTokenXTZPrice) / 10**6
//                 const thirdAmountToPay          = (amountToBuy / MVK() * thirdTokenXTZPrice) / 10**6
//                 const userWhitelisted           = await tokenSaleStorage.whitelistedAddresses.get(userAddress);
//                 const initUserTokenRecord       = await tokenSaleStorage.tokenSaleLedger.get(userAddress);

//                 // Set the whitelisted period
//                 await signerFactory(mallory.sk);
//                 var buyOperation                = await tokenSaleInstance.methods.buyTokens(amountToBuy, firstBuyOptionIndex).send({amount: firstAmountToPay});
//                 await buyOperation.confirmation();
//                 buyOperation                    = await tokenSaleInstance.methods.buyTokens(amountToBuy, secondBuyOptionIndex).send({amount: secondAmountToPay});
//                 await buyOperation.confirmation();
//                 buyOperation                    = await tokenSaleInstance.methods.buyTokens(amountToBuy, thirdBuyOptionIndex).send({amount: thirdAmountToPay});
//                 await buyOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const endUserTokenRecord        = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const endFirstUserBuyOption     = await endUserTokenRecord.get(firstBuyOptionIndex);
//                 const endSecondUserBuyOption    = await endUserTokenRecord.get(secondBuyOptionIndex);
//                 const endThirdUserBuyOption     = await endUserTokenRecord.get(thirdBuyOptionIndex);

//                 // Assertions
//                 assert.equal(endFirstUserBuyOption.tokenBought.toNumber(), amountToBuy);
//                 assert.equal(endFirstUserBuyOption.tokenClaimed.toNumber(), 0);
//                 assert.equal(endFirstUserBuyOption.claimCounter.toNumber(), 0);
//                 assert.equal(endSecondUserBuyOption.tokenBought.toNumber(), amountToBuy);
//                 assert.equal(endSecondUserBuyOption.tokenClaimed.toNumber(), 0);
//                 assert.equal(endSecondUserBuyOption.claimCounter.toNumber(), 0);
//                 assert.equal(endThirdUserBuyOption.tokenBought.toNumber(), amountToBuy);
//                 assert.equal(endThirdUserBuyOption.tokenClaimed.toNumber(), 0);
//                 assert.equal(endThirdUserBuyOption.claimCounter.toNumber(), 0);
//                 assert.strictEqual(initUserTokenRecord, undefined);
//                 assert.strictEqual(userWhitelisted, undefined);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//     })

//     describe("%pauseSale", async () => {
        
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to pause the token sale', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const initSalePaused            = tokenSaleStorage.tokenSalePaused;
                
//                 // Operation
//                 const operation                 = await tokenSaleInstance.methods.pauseSale().send();
//                 await operation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const endSalePaused             = tokenSaleStorage.tokenSalePaused;

//                 // Assertions
//                 assert.notEqual(endSalePaused, initSalePaused);
//                 assert.equal(endSalePaused, true);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('User should not be able to buy tokens if the the token sale is paused', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = MVK(3000);
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6
//                 const initSalePaused            = tokenSaleStorage.tokenSalePaused;

//                 // Set the whitelisted period
//                 await signerFactory(trudy.sk);
//                 await chai.expect(tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay})).to.be.rejected;

//                 // Assertions
//                 assert.equal(initSalePaused, true);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
                
//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.pauseSale().send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     });

//     describe("%closeSale", async () => {

//         before("Unpause the token sale", async () => {
//             await signerFactory(bob.sk)
//             const operation = await tokenSaleInstance.methods.pauseSale().send();
//             await operation.confirmation();
//         });
        
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('User should not be able to claim tokens if the the token sale did not close', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const initSaleEnded             = tokenSaleStorage.tokenSaleHasEnded;
//                 const initSalePaused            = tokenSaleStorage.tokenSalePaused;

//                 // Set the whitelisted period
//                 await signerFactory(eve.sk);
//                 await chai.expect(tokenSaleInstance.methods.claimTokens(eve.pkh).send()).to.be.rejected;

//                 // Assertions
//                 assert.equal(initSaleEnded, false);
//                 assert.equal(initSalePaused, false);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Admin should be able to close the token sale', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const initSaleEndTimestamp      = tokenSaleStorage.tokenSaleEndTimestamp;
//                 const initSaleEndLevel          = tokenSaleStorage.tokenSaleEndBlockLevel;
//                 const initSaleEnded             = tokenSaleStorage.tokenSaleHasEnded;
                
//                 // Operation
//                 const operation                 = await tokenSaleInstance.methods.closeSale().send();
//                 await operation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const endSaleEndTimestamp       = tokenSaleStorage.tokenSaleEndTimestamp;
//                 const endSaleEndLevel           = tokenSaleStorage.tokenSaleEndBlockLevel;
//                 const endSaleEnded              = tokenSaleStorage.tokenSaleHasEnded;

//                 // Assertions
//                 assert.notEqual(initSaleEndTimestamp, endSaleEndTimestamp);
//                 assert.notEqual(endSaleEndLevel, initSaleEndLevel);
//                 assert.notEqual(endSaleEnded, initSaleEnded);
//                 assert.equal(endSaleEnded, true);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('User should not be able to buy tokens if the the token sale is closed', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const tokenXTZPrice             = buyOption.tokenXtzPrice.toNumber();
//                 const amountToBuy               = MVK(3000);
//                 const amountToPay               = (amountToBuy / MVK() * tokenXTZPrice) / 10**6;
//                 const initSaleEnded             = tokenSaleStorage.tokenSaleHasEnded;
//                 const initSalePaused            = tokenSaleStorage.tokenSalePaused;

//                 // Set the whitelisted period
//                 await signerFactory(trudy.sk);
//                 await chai.expect(tokenSaleInstance.methods.buyTokens(amountToBuy, buyOptionIndex).send({amount: amountToPay})).to.be.rejected;

//                 // Assertions
//                 assert.equal(initSaleEnded, true);
//                 assert.equal(initSalePaused, false);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
                
//                 // Operation
//                 await chai.expect(tokenSaleInstance.methods.closeSale().send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     });

//     describe("%claimTokens", async () => {
        
//         beforeEach("Set signer to user", async () => {
//             await signerFactory(eve.sk)
//         });
    
//         it('User should be able to claim its tokens', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 mvkTokenStorage                 = await mvkTokenInstance.storage();
//                 const userAddress               = eve.pkh;
//                 const treasuryAddress           = tokenSaleStorage.treasuryAddress;
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const initUserTokenRecord       = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const initMvkBalance            = await mvkTokenStorage.ledger.get(eve.pkh) !== undefined ? (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber() : 0;
//                 const initTreasuryMvkBalance    = await mvkTokenStorage.ledger.get(treasuryAddress) !== undefined ? (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber() : 0;

//                 // Claim tokens
//                 const claimOperation            = await tokenSaleInstance.methods.claimTokens(eve.pkh).send();
//                 await claimOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 mvkTokenStorage                 = await mvkTokenInstance.storage();
//                 const endUserTokenRecord        = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const endUserBuyOption          = await endUserTokenRecord.get(buyOptionIndex);
//                 const endMvkBalance             = await mvkTokenStorage.ledger.get(eve.pkh);
//                 const endTreasuryMvkBalance     = await mvkTokenStorage.ledger.get(treasuryAddress);

//                 console.log("End buy option:", buyOption);
//                 console.log("End user option:", endUserBuyOption);
//                 console.log("Init MVK:", initMvkBalance);
//                 console.log("End MVK:", endMvkBalance);
//                 console.log("Init Treasury:", initTreasuryMvkBalance);
//                 console.log("End Treasury:", endTreasuryMvkBalance);

//                 // Assertions
//                 assert.notStrictEqual(initUserTokenRecord, undefined);
//                 assert.equal(endMvkBalance.toNumber(), initMvkBalance + endUserBuyOption.tokenClaimed.toNumber());
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
    
//         it('User should be able to claim tokens for someone else', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 mvkTokenStorage                 = await mvkTokenInstance.storage();
//                 const vestingPeriodDurationSec  = tokenSaleStorage.config.vestingPeriodDurationSec.toNumber();
//                 const userAddress               = eve.pkh;
//                 const treasuryAddress           = tokenSaleStorage.treasuryAddress;
//                 const buyOptionIndex            = "1";
//                 const buyOption                 = await tokenSaleStorage.config.buyOptions.get(buyOptionIndex);
//                 const initUserTokenRecord       = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const initUserBuyOption         = await initUserTokenRecord.get(buyOptionIndex);
//                 const initMvkBalance            = await mvkTokenStorage.ledger.get(eve.pkh) !== undefined ? (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber() : 0;
//                 const initTreasuryMvkBalance    = await mvkTokenStorage.ledger.get(treasuryAddress) !== undefined ? (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber() : 0;

//                 // Wait for another vesting period to pass
//                 const timeToWait                = vestingPeriodDurationSec * 1000
//                 await wait(timeToWait);

//                 // Claim tokens
//                 await signerFactory(mallory.sk)
//                 const claimOperation            = await tokenSaleInstance.methods.claimTokens(eve.pkh).send();
//                 await claimOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 mvkTokenStorage                 = await mvkTokenInstance.storage();
//                 const endUserTokenRecord        = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const endUserBuyOption          = await endUserTokenRecord.get(buyOptionIndex);
//                 const endMvkBalance             = await mvkTokenStorage.ledger.get(eve.pkh);
//                 const endTreasuryMvkBalance     = await mvkTokenStorage.ledger.get(treasuryAddress);
//                 const userClaimAmount           = endUserBuyOption.tokenClaimed.toNumber() - initUserBuyOption.tokenClaimed.toNumber();

//                 console.log("End buy option:", buyOption);
//                 console.log("End user option:", endUserBuyOption);
//                 console.log("Init MVK:", initMvkBalance);
//                 console.log("End MVK:", endMvkBalance);
//                 console.log("Init Treasury:", initTreasuryMvkBalance);
//                 console.log("End Treasury:", endTreasuryMvkBalance);

//                 // Assertions
//                 assert.notStrictEqual(initUserTokenRecord, undefined);
//                 assert.equal(endMvkBalance.toNumber(), initMvkBalance + userClaimAmount);
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
    
//         it('User should be able to claim all its tokens at the end of the vesting period', async () => {
//             try{
//                 // Initial Values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 mvkTokenStorage                 = await mvkTokenInstance.storage();
//                 const vestingPeriodDurationSec  = tokenSaleStorage.config.vestingPeriodDurationSec.toNumber();
//                 const userAddress               = mallory.pkh;
//                 const treasuryAddress           = tokenSaleStorage.treasuryAddress;
//                 const firstBuyOptionIndex       = "1";
//                 const secondBuyOptionIndex      = "2";
//                 const thirdBuyOptionIndex       = "3";
//                 const firstBuyOption            = await tokenSaleStorage.config.buyOptions.get(firstBuyOptionIndex);
//                 const secondBuyOption           = await tokenSaleStorage.config.buyOptions.get(secondBuyOptionIndex);
//                 const thirdBuyOption            = await tokenSaleStorage.config.buyOptions.get(thirdBuyOptionIndex);
//                 const initUserTokenRecord       = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const initFirstUserBuyOption    = await initUserTokenRecord.get(firstBuyOptionIndex);
//                 const initSecondUserBuyOption   = await initUserTokenRecord.get(secondBuyOptionIndex);
//                 const initThirdUserBuyOption    = await initUserTokenRecord.get(thirdBuyOptionIndex);
//                 const initMvkBalance            = await mvkTokenStorage.ledger.get(mallory.pkh) !== undefined ? (await mvkTokenStorage.ledger.get(mallory.pkh)).toNumber() : 0;
//                 const initTreasuryMvkBalance    = await mvkTokenStorage.ledger.get(treasuryAddress) !== undefined ? (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber() : 0;
//                 const maxVestingPeriod          = firstBuyOption.vestingPeriods.toNumber() > secondBuyOption.vestingPeriods.toNumber() ?
//                     (firstBuyOption.vestingPeriods.toNumber() > thirdBuyOption.vestingPeriods.toNumber() ? firstBuyOption.vestingPeriods.toNumber() : thirdBuyOption.vestingPeriods.toNumber()) :
//                     (secondBuyOption.vestingPeriods.toNumber() > thirdBuyOption.vestingPeriods.toNumber() ? secondBuyOption.vestingPeriods.toNumber() : thirdBuyOption.vestingPeriods.toNumber())

//                 // wait more than the entire vesting time
//                 const timeToWait                = vestingPeriodDurationSec * 1000 * (maxVestingPeriod + 1)
//                 console.log("TIME:", timeToWait)
//                 console.log("MAX:", maxVestingPeriod)
//                 await wait(timeToWait);

//                 // Claim tokens
//                 await signerFactory(mallory.sk)
//                 const claimOperation            = await tokenSaleInstance.methods.claimTokens(mallory.pkh).send();
//                 await claimOperation.confirmation();

//                 // Final values
//                 tokenSaleStorage                = await tokenSaleInstance.storage();
//                 mvkTokenStorage                 = await mvkTokenInstance.storage();
//                 const endUserTokenRecord        = await tokenSaleStorage.tokenSaleLedger.get(userAddress);
//                 const endFirstUserBuyOption     = await endUserTokenRecord.get(firstBuyOptionIndex);
//                 const endSecondUserBuyOption    = await endUserTokenRecord.get(secondBuyOptionIndex);
//                 const endThirdUserBuyOption     = await endUserTokenRecord.get(thirdBuyOptionIndex);
//                 const endMvkBalance             = await mvkTokenStorage.ledger.get(mallory.pkh);
//                 const endTreasuryMvkBalance     = await mvkTokenStorage.ledger.get(treasuryAddress);
//                 const userFirstClaimAmount      = endFirstUserBuyOption.tokenClaimed.toNumber() - initFirstUserBuyOption.tokenClaimed.toNumber();
//                 const userSecondClaimAmount     = endSecondUserBuyOption.tokenClaimed.toNumber() - initSecondUserBuyOption.tokenClaimed.toNumber();
//                 const userThirdClaimAmount      = endThirdUserBuyOption.tokenClaimed.toNumber() - initThirdUserBuyOption.tokenClaimed.toNumber();

//                 // Log
//                 console.log("First end buy option:", firstBuyOption);
//                 console.log("First end user option:", endFirstUserBuyOption);
//                 console.log("Second end buy option:", secondBuyOption);
//                 console.log("Second end user option:", endSecondUserBuyOption);
//                 console.log("Third end buy option:", thirdBuyOption);
//                 console.log("Third end user option:", endThirdUserBuyOption);

//                 // Assertions
//                 assert.notStrictEqual(initUserTokenRecord, undefined);
//                 assert.equal(endFirstUserBuyOption.tokenClaimed.toNumber(), endFirstUserBuyOption.tokenBought.toNumber());
//                 assert.equal(endSecondUserBuyOption.tokenClaimed.toNumber(), endSecondUserBuyOption.tokenBought.toNumber());
//                 assert.equal(endThirdUserBuyOption.tokenClaimed.toNumber(), endThirdUserBuyOption.tokenBought.toNumber());
//                 assert.equal(endMvkBalance.toNumber(), initMvkBalance + userFirstClaimAmount + userSecondClaimAmount + userThirdClaimAmount);
//                 assert.equal(endTreasuryMvkBalance.toNumber(), initTreasuryMvkBalance - (userFirstClaimAmount + userSecondClaimAmount + userThirdClaimAmount));
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('User should not be able to claim tokens if it never bought some', async () => {
//             try{
//                 // Claim token
//                 await signerFactory(alice.sk)
//                 await chai.expect(tokenSaleInstance.methods.claimTokens(alice.pkh).send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//     })
// });
