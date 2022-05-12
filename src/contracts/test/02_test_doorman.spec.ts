// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// import { BigNumber } from 'bignumber.js'
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, MVK } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';

// describe("Doorman tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     const almostEqual = (actual, expected, delta) => {
//         let greaterLimit  = expected + expected * delta
//         let lowerLimit    = expected - expected * delta
//         return actual <= greaterLimit && actual >= lowerLimit
//     }

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
            
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();

//         console.log('-- -- -- -- -- Doorman Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);

//     });

//     beforeEach('storage', async () => {
//         await signerFactory(bob.sk)
//     })

//     describe("%stake", async () => {
//         it("user should not be able to stake less than 1MVK", async() => {
//             try{
//                 // Initial values
//                 const userStake = 10**8;

//                 // Operator set
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: bob.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 // Operation
//                 const stakeOperation = await doormanInstance.methods.stake(userStake);
//                 await chai.expect(stakeOperation.send()).to.be.rejected;
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("user should not be able to stake more MVK than he has", async() => {
//             try{
//                 // Initial values
//                 const userMVKBalance = (await mvkTokenStorage.ledger.get(bob.pkh)).toNumber();
//                 const userStake = userMVKBalance + MVK(1);

//                 // Operator set
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: bob.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 // Operation
//                 const stakeOperation = await doormanInstance.methods.stake(userStake);
//                 await chai.expect(stakeOperation.send()).to.be.rejected;
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("user should be able to stake less than his maximum amount of MVK but at least 1MVK", async() => {
//             try{
//                 // Initial values
//                 const userStake = MVK(10);
//                 const userMVKBalance = (await mvkTokenStorage.ledger.get(bob.pkh)).toNumber();
//                 const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const userStakeBalance = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber()
//                 const doormanSMVKTotalSupply = doormanStorage.stakedMvkTotalSupply.toNumber();

//                 // Operator set
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: bob.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 // Operation
//                 const stakeOperation = await doormanInstance.methods.stake(userStake).send();
//                 await stakeOperation.confirmation();

//                 // Update storage
//                 doormanStorage = await doormanInstance.storage();
//                 mvkTokenStorage = await mvkTokenInstance.storage();

//                 // Final Values
//                 const userMVKBalanceEnd = (await mvkTokenStorage.ledger.get(bob.pkh)).toNumber();
//                 const userStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const userStakeBalanceEnd = userStakeLedgerEnd.balance.toNumber()
//                 const doormanSMVKTotalSupplyEnd = (doormanStorage.stakedMvkTotalSupply).toNumber();

//                 // Assertion
//                 assert.equal(doormanSMVKTotalSupply + userStake, doormanSMVKTotalSupplyEnd);
//                 assert.equal(userMVKBalance - userStake, userMVKBalanceEnd);
//                 assert.equal(userStakeBalance + userStake, userStakeBalanceEnd);
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })
//     })

//     describe("%unstake", async () => {
//         it("user should not be able to unstake less than 1MVK", async() => {
//             try{
//                 // Initial values
//                 const userUnstake = 10**8;

//                 // Operation
//                 const unstakeOperation = await doormanInstance.methods.unstake(userUnstake);
//                 await chai.expect(unstakeOperation.send()).to.be.rejected;
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("user should not be able to unstake more MVK than he has staked before", async() => {
//             try{
//                 // Initial values
//                 const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const userStakeBalance = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber()
//                 const userUnstake = userStakeBalance +  MVK();

//                 // Operation
//                 const unstakeOperation = await doormanInstance.methods.unstake(userUnstake);
//                 await chai.expect(unstakeOperation.send()).to.be.rejected;
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("user should not be able to unstake if he never staked", async() => {
//             try{
//                 // Switch signer
//                 await signerFactory(alice.sk);

//                 // Initial values
//                 const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const userUnstake = MVK();

//                 // Assertion
//                 assert.strictEqual(userStakeLedger,undefined);

//                 // Operation
//                 const unstakeOperation = await doormanInstance.methods.unstake(userUnstake);
//                 await chai.expect(unstakeOperation.send()).to.be.rejected;
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("single user should be able to unstake some MVK and earn all the exit fee", async() => {
//             try{
//                 // Initial values
//                 const userMVKBalance = (await mvkTokenStorage.ledger.get(bob.pkh)).toNumber();
//                 const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const userStakeBalance = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber()
//                 const mvkTotalSupply = (mvkTokenStorage.totalSupply).toNumber();
//                 const doormanSMVKTotalSupply = (doormanStorage.stakedMvkTotalSupply).toNumber();
//                 const userUnstake = userStakeBalance - MVK();

//                 // Operation
//                 const unstakeOperation = await doormanInstance.methods.unstake(userUnstake).send();
//                 await unstakeOperation.confirmation();

//                 // Update storage
//                 doormanStorage = await doormanInstance.storage();
//                 mvkTokenStorage = await mvkTokenInstance.storage();

//                 // Test values
//                 const mli = Math.trunc((doormanSMVKTotalSupply * 100 * 10**36) / mvkTotalSupply);
//                 const exitFee = Math.trunc((500 * 10**36 * 10**36) / (mli + 5*10**36));
//                 const paidFee = Math.trunc(userUnstake * (exitFee/100));
//                 const expectedFinalAmount = userUnstake - (paidFee/10**36);

//                 // Final Values
//                 const userMVKBalanceEnd = (await mvkTokenStorage.ledger.get(bob.pkh)).toNumber();
//                 const userStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const userStakeBalanceEnd = userStakeLedgerEnd.balance.toNumber()
//                 const doormanSMVKTotalSupplyEnd = doormanStorage.stakedMvkTotalSupply.toNumber();

//                 // Assertion
//                 assert.equal(almostEqual(Math.floor(doormanSMVKTotalSupply - expectedFinalAmount), doormanSMVKTotalSupplyEnd, 0.01), true)
//                 assert.equal(almostEqual(Math.round(userMVKBalance + expectedFinalAmount), userMVKBalanceEnd, 0.01), true)
//                 assert.equal(almostEqual(Math.floor(userStakeBalance - expectedFinalAmount), userStakeBalanceEnd, 0.01), true)

//                 // Compound for next tests
//                 var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send();
//                 await compoundOperation.confirmation();
//                 var compoundOperation   = await doormanInstance.methods.compound(eve.pkh).send();
//                 await compoundOperation.confirmation();
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("multiple users should be able to unstake some MVK and share the exit fee", async() => {
//             try{
//                 // Initial values
//                 doormanStorage              = await doormanInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const firstUserStake        = MVK(2);
//                 const secondUserstake       = MVK(2);
//                 const firstUserUnstake      = MVK(1);

//                 // Operator set
//                 const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: bob.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await firstUpdateOperatorsOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: eve.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await secondUpdateOperatorsOperation.confirmation();

//                 // Operation part-1
//                 const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserstake).send();
//                 await secondUserStakeOperation.confirmation();

//                 await signerFactory(bob.sk);
//                 const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
//                 await firstUserStakeOperation.confirmation();

//                 // Balances before unstaking
//                 doormanStorage              = await doormanInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const initFirstSMVKBalance  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const initSecondSMVKBalance = await doormanStorage.userStakeBalanceLedger.get(eve.pkh)
//                 const initFirstMVKBalance   = await mvkTokenStorage.ledger.get(bob.pkh)
//                 const mvkTotalSupply        = mvkTokenStorage.totalSupply.toNumber()
//                 const smvkTotalSupply       = doormanStorage.stakedMvkTotalSupply.toNumber()

//                 console.log("MVK TOTAL SUPPLY: ", mvkTotalSupply)
//                 console.log("SMVK TOTAL SUPPLY: ", smvkTotalSupply)
//                 console.log("BOB SMVK: ", initFirstSMVKBalance.balance.toNumber())
//                 console.log("EVE SMVK: ", initSecondSMVKBalance.balance.toNumber())
//                 console.log("BOB MVK: ", initFirstMVKBalance.toNumber())
                
//                 // First user unstake
//                 const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
//                 await firstUserUnstakeOperation.confirmation()

//                 // Compound operations
//                 const firstUserCompoundOperation    = await doormanInstance.methods.compound(bob.pkh).send();
//                 await firstUserCompoundOperation.confirmation()
//                 const secondUserCompoundOperation    = await doormanInstance.methods.compound(eve.pkh).send();
//                 await secondUserCompoundOperation.confirmation()

//                 // Refresh variables
//                 doormanStorage                      = await doormanInstance.storage();
//                 mvkTokenStorage                     = await mvkTokenInstance.storage();
//                 const postCompoundFirstSMVKBalance  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const postCompoundFirstMVKBalance   = await mvkTokenStorage.ledger.get(bob.pkh)
//                 const postCompoundSecondSMVKBalance = await doormanStorage.userStakeBalanceLedger.get(eve.pkh)
//                 const exitFee                       = initFirstMVKBalance.toNumber() + firstUserUnstake - postCompoundFirstMVKBalance.toNumber()

//                 console.log("EXIT FEE: ", exitFee)
//                 console.log("BOB SMVK: ", postCompoundFirstSMVKBalance.balance.toNumber())
//                 console.log("EVE SMVK: ", postCompoundSecondSMVKBalance.balance.toNumber())
//                 console.log("BOB MVK: ", postCompoundFirstMVKBalance.toNumber())

//                 const firstUserReward               = Math.abs(postCompoundFirstSMVKBalance.balance.toNumber() - (initFirstSMVKBalance.balance.toNumber() - firstUserUnstake))
//                 const secondUserReward              = postCompoundSecondSMVKBalance.balance.toNumber() - initSecondSMVKBalance.balance.toNumber()
//                 const combinedRewards               = secondUserReward + firstUserReward

//                 console.log("FIRST USER REWARD: ", firstUserReward)
//                 console.log("SECOND USER REWARD: ", secondUserReward)
//                 console.log("COMBINED REWARDS: ", combinedRewards)

//                 // Assertions
//                 assert.equal(combinedRewards, exitFee)
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })
//     })

//     describe("%compound", async () => {
//         it("user should not be able to earn rewards without having staked MVK before", async() => {
//             try{
//                 // Initial values
//                 const firstUserStake = MVK(2)
//                 const secondUserStake = MVK()
//                 const firstUserUnstake = MVK()

//                 // Operator set
//                 const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: bob.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await firstUpdateOperatorsOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: eve.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await secondUpdateOperatorsOperation.confirmation();

//                 // Operations
//                 await signerFactory(bob.sk);
//                 const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
//                 await firstUserStakeOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
//                 await secondUserStakeOperation.confirmation();
                
//                 await signerFactory(bob.sk);
//                 const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
//                 await firstUserUnstakeOperation.confirmation();

//                 await signerFactory(mallory.sk);
//                 const thirdUserCompoundOperation = await doormanInstance.methods.compound(mallory.pkh).send();
//                 await thirdUserCompoundOperation.confirmation();

//                 // Update storage
//                 doormanStorage = await doormanInstance.storage();
                
//                 // Final values
//                 const thirdUserStakedMVKLedger = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);
//                 const thirdUserStakedMVKBalance = thirdUserStakedMVKLedger.balance.toNumber()

//                 assert.equal(0,thirdUserStakedMVKBalance)

//                 // Compound for next test
//                 var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send();
//                 await compoundOperation.confirmation();
//                 var compoundOperation   = await doormanInstance.methods.compound(eve.pkh).send();
//                 await compoundOperation.confirmation();
//                 var compoundOperation   = await doormanInstance.methods.compound(mallory.pkh).send();
//                 await compoundOperation.confirmation();
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("user should not be able to compound after unstaking everything", async() => {
//             try{
//                 // Initial values
//                 const firstUserStake = MVK(2)
//                 const secondUserStake = MVK(3)

//                 // Operator set
//                 const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: bob.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await firstUpdateOperatorsOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: eve.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await secondUpdateOperatorsOperation.confirmation();

//                 // Operations
//                 await signerFactory(bob.sk);
//                 const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
//                 await firstUserStakeOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
//                 await secondUserStakeOperation.confirmation();
                
//                 // Refresh values
//                 doormanStorage              = await doormanInstance.storage()
//                 const firstUserSMVKBalance  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const firstUserUnstake      = firstUserSMVKBalance.balance.toNumber()
//                 console.log("UNSTAKE AMOUNT: ", firstUserUnstake)

//                 // Unstake and compound operation
//                 await signerFactory(bob.sk);
//                 const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
//                 await firstUserUnstakeOperation.confirmation();
//                 const firstUserCompoundOperation = await doormanInstance.methods.compound(bob.pkh).send();
//                 await firstUserCompoundOperation.confirmation();

//                 // Final value
//                 doormanStorage              = await doormanInstance.storage()
//                 const finalUserSMVKBalance  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
                
//                 // Assertion
//                 assert.equal(finalUserSMVKBalance.balance.toNumber(), 0)
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("user should not be able to compound twice", async() => {
//             try{
//                 // Initial values
//                 const firstUserStake = MVK(2)
//                 const secondUserStake = MVK(3)
//                 const firstUserUnstake = MVK()

//                 // Operator set
//                 const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: bob.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await firstUpdateOperatorsOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: eve.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await secondUpdateOperatorsOperation.confirmation();

//                 // Operations
//                 await signerFactory(bob.sk);
//                 const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
//                 await firstUserStakeOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
//                 await secondUserStakeOperation.confirmation();
                
//                 await signerFactory(bob.sk);
//                 const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
//                 await firstUserUnstakeOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUserCompoundOperation = await doormanInstance.methods.compound(eve.pkh).send();
//                 await secondUserCompoundOperation.confirmation();

//                 doormanStorage = await doormanInstance.storage();
//                 const secondUserPreCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const secondUserPreCompoundBalance = secondUserPreCompoundLedger === undefined ? 0 : secondUserPreCompoundLedger.balance.toNumber()

//                 const secondUserSecondCompoundOperation = await doormanInstance.methods.compound(eve.pkh).send();
//                 await secondUserSecondCompoundOperation.confirmation();

//                 // Update storage
//                 doormanStorage = await doormanInstance.storage();
                
//                 // Final values
//                 const secondUserPostCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const secondUserPostCompoundBalance = secondUserPostCompoundLedger.balance.toNumber()

//                 assert.equal(secondUserPreCompoundBalance,secondUserPostCompoundBalance)
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("user should be able to compound rewards after unstaking a portion of his staked mvk", async() => {
//             try{
//                 // Initial values
//                 await signerFactory(bob.sk)
//                 const initFirstUserLedger   = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const initFirstUserBalance  = initFirstUserLedger.balance.toNumber()
//                 const firstUserStake        = MVK(100)
//                 const firstUserUnstake      = MVK(2) // Unstake all but 1MVK

//                 // Operator set
//                 const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: bob.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await firstUpdateOperatorsOperation.confirmation();

//                 // Operations
//                 const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
//                 await firstUserStakeOperation.confirmation();

//                 await signerFactory(bob.sk);
//                 const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
//                 await firstUserUnstakeOperation.confirmation();

//                 // Final values
//                 doormanStorage = await doormanInstance.storage();
//                 const finalFirstUserLedger   = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const finalFirstUserBalance  = finalFirstUserLedger.balance.toNumber()
//                 const unexpectedFinalBalance = initFirstUserBalance - firstUserUnstake;

//                 // Assertions
//                 assert.notEqual(unexpectedFinalBalance,finalFirstUserBalance);
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("user should be able to compound unclaimed rewards", async() => {
//             try{
//                 // Initial values
//                 const firstUserStake = MVK(2)
//                 const secondUserStake = MVK(3)
//                 const firstUserUnstake = MVK()

//                 // Operator set
//                 const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: bob.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await firstUpdateOperatorsOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: eve.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await secondUpdateOperatorsOperation.confirmation();

//                 // Operations
//                 await signerFactory(bob.sk);
//                 const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
//                 await firstUserStakeOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
//                 await secondUserStakeOperation.confirmation();
                
//                 await signerFactory(bob.sk);
//                 const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
//                 await firstUserUnstakeOperation.confirmation();

//                 doormanStorage = await doormanInstance.storage();
//                 const secondUserPreCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const secondUserPreCompoundBalance = secondUserPreCompoundLedger === undefined ? 0 : secondUserPreCompoundLedger.balance.toNumber()

//                 await signerFactory(eve.sk);
//                 const secondUserCompoundOperation = await doormanInstance.methods.compound(eve.pkh).send();
//                 await secondUserCompoundOperation.confirmation();

//                 // Update storage
//                 doormanStorage = await doormanInstance.storage();
                
//                 // Final values
//                 const secondUserPostCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const secondUserPostCompoundBalance = secondUserPostCompoundLedger.balance.toNumber()

//                 assert.notEqual(secondUserPreCompoundBalance,secondUserPostCompoundBalance)
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })
//     })

//     describe("%migrateFunds", async () => {

//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         })
        
//         it("Admin should not be able to migrate the Doorman contract MVK funds if one of the three main entrypoints of the contract is not paused", async() => {
//             try{
//                 // Initial values
//                 doormanStorage              = await doormanInstance.storage();
//                 const initCompoundPaused    = doormanStorage.breakGlassConfig.compoundIsPaused
                
//                 // Storage preparation operation
//                 var pauseOperation = await doormanInstance.methods.pauseAll().send();
//                 await pauseOperation.confirmation();

//                 doormanStorage  = await doormanInstance.storage();
//                 console.log("AFTER PAUSE ALL: ", doormanStorage.breakGlassConfig)

//                 pauseOperation = await doormanInstance.methods.togglePauseCompound().send();
//                 await pauseOperation.confirmation();

//                 // Operations
//                 await chai.expect(doormanInstance.methods.migrateFunds(alice.pkh).send()).to.be.rejected;

//                 // Final values
//                 doormanStorage              = await doormanInstance.storage()
//                 console.log("AFTER TOGGLE: ", doormanStorage.breakGlassConfig)
//                 const endCompoundPaused     = doormanStorage.breakGlassConfig.compoundIsPaused
//                 const stakePaused           = doormanStorage.breakGlassConfig.stakeIsPaused
//                 const unstakePaused         = doormanStorage.breakGlassConfig.unstakeIsPaused
//                 assert.equal(initCompoundPaused, endCompoundPaused)
//                 assert.equal(endCompoundPaused, false)
//                 assert.equal(stakePaused, true)
//                 assert.equal(unstakePaused, true)

//                 // Reset compound
//                 pauseOperation = await doormanInstance.methods.togglePauseCompound().send();
//                 await pauseOperation.confirmation();
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("Non-admin should not be able to migrate the Doorman contract MVK funds", async() => {
//             try{
//                 // Operations
//                 await signerFactory(alice.sk)
//                 await chai.expect(doormanInstance.methods.migrateFunds(alice.pkh).send()).to.be.rejected;
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it("Admin should be able to migrate the Doorman contract MVK funds", async() => {
//             try{
//                 // Initial values
//                 doormanStorage              = await doormanInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const newDoormanAddress     = alice.pkh
//                 const initNewDoormanBalance = await mvkTokenStorage.ledger.get(newDoormanAddress);
//                 const initDoormanBalance    = await mvkTokenStorage.ledger.get(doormanAddress.address);
//                 const stakePaused           = doormanStorage.breakGlassConfig.stakeIsPaused
//                 const unstakePaused         = doormanStorage.breakGlassConfig.unstakeIsPaused
//                 const compoundPaused        = doormanStorage.breakGlassConfig.unstakeIsPaused

//                 // Operation
//                 const migrateOperation  = await doormanInstance.methods.migrateFunds(newDoormanAddress).send();
//                 await migrateOperation.confirmation();

//                 // Final values
//                 doormanStorage              = await doormanInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const endNewDoormanBalance  = await mvkTokenStorage.ledger.get(newDoormanAddress);
//                 const endDoormanBalance     = await mvkTokenStorage.ledger.get(doormanAddress.address);

//                 // Assertions
//                 assert.equal(endNewDoormanBalance.toNumber(), initNewDoormanBalance.toNumber() + initDoormanBalance.toNumber())
//                 assert.equal(endDoormanBalance.toNumber(), 0)
//                 assert.equal(compoundPaused, true)
//                 assert.equal(stakePaused, true)
//                 assert.equal(unstakePaused, true)
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })
//     })

// });
