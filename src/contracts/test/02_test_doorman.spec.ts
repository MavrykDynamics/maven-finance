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
//                 console.log(e)
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
//                 console.log(e)
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
//                 console.log(e)
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
//                 console.log(e)
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
//                 console.log(e)
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
//                 console.log(e)
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
//                 console.log(e)
//             }
//         })

//         it("multiple users should be able to unstake some MVK and share the exit fee", async() => {
//             try{
//                 // Initial values
//                 const firstUserStake = MVK(2);
//                 const secondUserstake = MVK(2);
//                 const firstUserUnstake = MVK(1);

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
//                 doormanStorage = await doormanInstance.storage();
//                 mvkTokenStorage = await mvkTokenInstance.storage();
//                 const mvkTotalSupply = mvkTokenStorage.totalSupply.toNumber();
//                 const doormanSMVKTotalSupply = doormanStorage.stakedMvkTotalSupply.toNumber();
//                 const firstUserMVKBalance   = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const firstUserStakeLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const firstUserRatio    = firstUserStakeLedger.balance.toNumber() / doormanSMVKTotalSupply
//                 const secondUserStakeLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const secondUserRatio   = secondUserStakeLedger.balance.toNumber() / doormanSMVKTotalSupply

//                 console.log("First ratio: ", firstUserRatio)
//                 console.log("Second ratio: ", secondUserRatio)
//                 console.log(firstUserStakeLedger.balance.toNumber())
//                 console.log(secondUserStakeLedger.balance.toNumber())

//                 // Operation part-2
//                 const unstakeOperation  = await doormanInstance.methods.unstake(firstUserUnstake).send();
//                 await unstakeOperation.confirmation();
//                 var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send();
//                 await compoundOperation.confirmation();
//                 var compoundOperation   = await doormanInstance.methods.compound(eve.pkh).send();
//                 await compoundOperation.confirmation();

//                 // Update storage
//                 doormanStorage                      = await doormanInstance.storage();
//                 mvkTokenStorage                     = await mvkTokenInstance.storage();
//                 console.log(doormanStorage.unclaimedRewards)
//                 const firstUserMVKPostCompound      = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const firstUserSMVKPostCompound     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const secondUserSMVKPostCompound    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 console.log(firstUserSMVKPostCompound.balance.toNumber())
//                 console.log(secondUserSMVKPostCompound.balance.toNumber())
//                 console.log(firstUserMVKBalance.toNumber())
//                 console.log(firstUserMVKPostCompound.toNumber())
//                 const exitFee                       = Math.abs(firstUserUnstake - firstUserMVKPostCompound.toNumber() - firstUserMVKBalance.toNumber())
//                 const firstUserShare                = exitFee * firstUserRatio
//                 const secondUserShare               = exitFee * secondUserRatio
//                 console.log("FIRST SHARE: ", firstUserShare)
//                 console.log("SECOND SHARE: ", secondUserShare)
//                 const firstUserReward               = Math.abs(firstUserSMVKPostCompound.balance.toNumber() - firstUserStakeLedger.balance.toNumber());
//                 const secondUserReward              = Math.abs(secondUserSMVKPostCompound.balance.toNumber() - secondUserStakeLedger.balance.toNumber());
//                 console.log("FIRST REWARD: ", firstUserReward)
//                 console.log("SECOND REWARD: ", secondUserReward)
//                 const claimedRewards                = firstUserReward + secondUserReward
//                 console.log(claimedRewards)
//                 console.log(exitFee)

//                 // Assertions
//                 assert.equal(claimedRewards, exitFee);

//                 // // Operation part-3
//                 // await signerFactory(eve.sk);
//                 // const compoundOperation = await doormanInstance.methods.compound(eve.pkh).send();
//                 // await compoundOperation.confirmation();

//                 // // Update storage
//                 // doormanStorage = await doormanInstance.storage();
//                 // mvkTokenStorage = await mvkTokenInstance.storage();

//                 // // Test values
//                 // const mli = Math.trunc((doormanSMVKTotalSupply * 100 * 10**36) / mvkTotalSupply);
//                 // const exitFee = Math.trunc((500 * 10**36 * 10**36) / (mli + 5*10**36));
//                 // const paidFee = Math.trunc(firstUserUnstake * (exitFee/100) / 10**36);
//                 // const expectedFinalAmount = Math.trunc(firstUserUnstake - (paidFee));

//                 // // Final Values
//                 // const firstUserStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 // const firstUserStakeBalanceEnd = firstUserStakeLedgerEnd.balance.toNumber()
//                 // const secondUserStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 // const secondUserStakeBalanceEnd = secondUserStakeLedgerEnd.balance.toNumber()

//                 // const rewardPerShare = paidFee / (doormanSMVKTotalSupply - firstUserUnstake);
//                 // const firstUserExpectedReward = rewardPerShare * (firstUserStake - expectedFinalAmount);
//                 // const secondUserExpectedReward = rewardPerShare * secondUserstake;

//                 // const firstUserReward = Math.abs(firstUserStakeBalanceEnd - firstUserUnstake)
//                 // const secondUserReward = Math.abs(secondUserStakeBalanceEnd - secondUserStakeBalancePreCompound)

//                 // // console.log(await mvkTokenStorage.ledger.get(bob.pkh))
//                 // // console.log(await mvkTokenStorage.ledger.get(eve.pkh))
//                 // // console.log(await mvkTokenStorage.ledger.get(doormanAddress.address))

//                 // // Assertion
//                 // // console.log(expectedFinalAmount)
//                 // assert.equal(almostEqual(doormanStorage.logFinalAmount.toNumber(),expectedFinalAmount, 0.01), true)
//                 // console.log(paidFee)
//                 // console.log(firstUserReward+secondUserReward)
//                 // console.log(firstUserReward)
//                 // console.log(secondUserReward)
//                 // assert.equal(almostEqual(paidFee,firstUserReward+secondUserReward, 0.01), true)
//                 // assert.equal(almostEqual(firstUserReward,firstUserExpectedReward, 0.01), true)
//                 // assert.equal(almostEqual(secondUserExpectedReward,secondUserReward, 0.01), true)
//             } catch(e) {
//                 console.log(e)
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
//                 console.log(e)
//             }
//         })

//         it("user should not be able to compound after unstaking everything", async() => {
//             try{
//                 // Initial values
//                 const firstUserStake = MVK(2)
//                 const secondUserStake = MVK(3)
//                 const firstUserUnstake = MVK(2)
//                 const secondUserUnstake = MVK(3)

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
//                 const secondUserUnstakeOperation = await doormanInstance.methods.unstake(secondUserUnstake).send();
//                 await secondUserUnstakeOperation.confirmation();

//                 doormanStorage = await doormanInstance.storage();
//                 const firstUserPreCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const firstUserPreCompoundBalance = firstUserPreCompoundLedger.balance.toNumber();

//                 console.log(firstUserPreCompoundLedger)

//                 const firstUserCompoundOperation = await doormanInstance.methods.compound(bob.pkh).send();
//                 await firstUserCompoundOperation.confirmation();

//                 // Update storage
//                 doormanStorage = await doormanInstance.storage();
                
//                 // Final values
//                 const firstUserPostCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 console.log(firstUserPostCompoundLedger)
//                 console.log(doormanStorage.accumulatedFeesPerShare)
//                 const firstUserPostCompoundBalance = firstUserPostCompoundLedger.balance.toNumber();

//                 assert.equal(firstUserPreCompoundBalance,firstUserPostCompoundBalance)
//             } catch(e) {
//                 console.log(e)
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
//                 console.log(e)
//             }
//         })

//         it("user should be able to compound rewards after unstaking a portion of his staked mvk", async() => {
//             try{
//                 // Initial values
//                 const firstUserLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const firstUserBalance = firstUserLedger === undefined ? 0 : firstUserLedger.balance.toNumber()
//                 const firstUserStake = MVK(2)
//                 const firstUserUnstake = firstUserBalance - MVK() // Unstake all but 1MVK

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

//                 // Update storage
//                 doormanStorage = await doormanInstance.storage();
                
//                 // Final values
//                 const unexpectedFinalBalance = MVK();
//                 const firstUserLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                 const firstUserBalanceEnd = firstUserLedgerEnd === undefined ? 0 : firstUserLedgerEnd.balance.toNumber()

//                 assert.notEqual(unexpectedFinalBalance,firstUserBalanceEnd);
//             } catch(e) {
//                 console.log(e)
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
//                 console.log(e)
//             }
//         })
//     })
// });
