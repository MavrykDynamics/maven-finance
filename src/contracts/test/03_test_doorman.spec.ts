import { BigNumber } from 'bignumber.js'
import assert from "assert";
import { Utils, MVK } from "./helpers/Utils";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory } from '../scripts/sandbox/accounts'
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Doorman Contract", async () => {
    
    // default
    var utils: Utils
    var tezos

    // basic inputs for updating operators
    let doormanAddress
    let tokenId = 0
    let user 
    
    // contract instances
    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;

    // contract storages
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;

    // test variables
    let stakeAmount 
    let unstakeAmount
    
    let firstUser
    let firstUserSk
    let firstUserStakeAmount 
    let firstUserUnstakeAmount 
    let firstUserTokenBalance
    let firstUserStakedRecord
    let firstUserStakedBalance
    let firstUserUpdatedStakedRecord
    let firstUserUpdatedTokenBalance
    let firstUserUpdatedStakedBalance
    let firstUserReward

    let secondUser 
    let secondUserSk
    let secondUserStakeAmount 
    let secondUserUnstakeAmount 
    let secondUserTokenBalance
    let secondUserStakedRecord
    let secondUserStakedBalance
    let secondUserUpdatdStakedRecord
    let secondUserUpdatedTokenBalance
    let secondUserUpdatedStakedBalance
    let secondUserReward

    let thirdUser 
    let thirdUserSk
    let thirdUserStakeAmount 
    let thirdUserUnstakeAmount 
    let thirdUserTokenBalance
    let thirdUserStakedRecord
    let thirdUserStakedBalance
    let thirdUserUpdatedTokenBalance
    let thirdUserUpdatedStakedBalance
    let thirdUserReward

    let initialUserTokenBalance
    let initialUserStakedRecord
    let initialUserStakedBalance
    let initialStakedMvkTotal
    let initialMvkTotalSupply

    let updatedUserTokenBalance
    let updatedUserStakedRecord
    let updatedUserStakedBalance
    let updatedStakedMvkTotal
    let updatedMvkTotalSupply

    // operations
    let stakeOperation
    let unstakeOperation
    let compoundOperation
    let transferOperation
    let updateOperatorsOperation
    let removeOperatorsOperation
    let setAdminOperation
    let resetAdminOperation
    let pauseOperation
    let unpauseOperation
    let migrateOperation

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos;

        doormanAddress     = contractDeployments.doorman.address;
        
        doormanInstance    = await utils.tezos.contract.at(doormanAddress);
        mvkTokenInstance   = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            
        doormanStorage     = await doormanInstance.storage();
        mvkTokenStorage    = await mvkTokenInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    });

    beforeEach('storage', async () => {
        doormanStorage     = await doormanInstance.storage();
        mvkTokenStorage    = await mvkTokenInstance.storage();
        await helperFunctions.signerFactory(tezos, bob.sk);
    })

    describe("%stake", async () => {

        beforeEach("Set signer to user (eve)", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it("user (eve) should not be able to stake less than 1MVK", async() => {
            try{

                // Initial values
                user        = eve.pkh;
                stakeAmount = MVK(0.1);

                // update operators operation
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // Operation
                stakeOperation = await doormanInstance.methods.stake(stakeAmount);
                await chai.expect(stakeOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (eve) should not be able to stake more MVK than she has", async() => {
            try{

                // Initial values
                user                    = eve.pkh;
                initialUserTokenBalance = (await mvkTokenStorage.ledger.get(user)).toNumber();
                stakeAmount             = initialUserTokenBalance + MVK(1);

                // update operators operation
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // Operation
                stakeOperation = await doormanInstance.methods.stake(stakeAmount);
                await chai.expect(stakeOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (eve) should be able to stake less than his maximum amount of MVK but at least 1MVK", async() => {
            try{

                // Initial values
                user                      = eve.pkh;
                stakeAmount               = MVK(10);
                initialUserTokenBalance   = (await mvkTokenStorage.ledger.get(user)).toNumber();
                
                initialUserStakedRecord   = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance  = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
                initialStakedMvkTotal     = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

                // update operators operation
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // Operation
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Update storage
                doormanStorage  = await doormanInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();

                // Final Values
                updatedUserTokenBalance  = (await mvkTokenStorage.ledger.get(user)).toNumber();
                updatedUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(user);
                updatedUserStakedBalance = updatedUserStakedRecord.balance.toNumber()
                updatedStakedMvkTotal    = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

                console.log(`initialStakedMvkTotal: ${initialStakedMvkTotal}`);
                console.log(`updatedStakedMvkTotal: ${updatedStakedMvkTotal}`);

                // Assertion
                assert.equal(updatedStakedMvkTotal      , initialStakedMvkTotal    + stakeAmount);
                assert.equal(updatedUserTokenBalance    , initialUserTokenBalance  - stakeAmount);
                assert.equal(updatedUserStakedBalance   , initialUserStakedBalance + stakeAmount);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("%unstake", async () => {

        beforeEach("Set signer to user (eve)", async () => {
            // Update storage
            doormanStorage  = await doormanInstance.storage();
            mvkTokenStorage = await mvkTokenInstance.storage();
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it("user (eve) should not be able to unstake less than 1MVK", async() => {
            try{
                
                // Initial values
                unstakeAmount = MVK(0.1);

                // Operation
                unstakeOperation = await doormanInstance.methods.unstake(unstakeAmount);
                await chai.expect(unstakeOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user should not be able to unstake more MVK than he has staked before", async() => {
            try{

                // Initial values
                user = eve.pkh;

                initialUserStakedRecord   = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance  = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
                unstakeAmount             = initialUserStakedBalance +  MVK(1);

                // Operation
                unstakeOperation = await doormanInstance.methods.unstake(unstakeAmount);
                await chai.expect(unstakeOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (alice) should not be able to unstake if she has not staked", async() => {
            try{

                // set signer to user (alice)
                user = alice.pkh;
                await helperFunctions.signerFactory(tezos, alice.sk);

                // Initial values
                initialUserStakedRecord = await doormanStorage.userStakeBalanceLedger.get(user);
                unstakeAmount           = MVK();

                // Assertion
                assert.strictEqual(initialUserStakedRecord,undefined);

                // Operation
                unstakeOperation = await doormanInstance.methods.unstake(unstakeAmount);
                await chai.expect(unstakeOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (eve) should be able to unstake some MVK and earn the corresponding exit fees", async() => {
            try{
                
                user = eve.pkh;
                await helperFunctions.signerFactory(tezos, eve.sk);

                // Update storage
                doormanStorage  = await doormanInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();

                // Initial values
                initialUserTokenBalance  = (await mvkTokenStorage.ledger.get(user)).toNumber();
                initialUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                initialMvkTotalSupply    = (mvkTokenStorage.totalSupply).toNumber();
                initialStakedMvkTotal    = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();
                unstakeAmount            = initialUserStakedBalance - MVK();

                console.log(initialUserStakedRecord);
                console.log(`unstakeAmount: ${unstakeAmount}`);
                console.log(`initialStakedMvkTotal: ${initialStakedMvkTotal}`);


                // Operation
                unstakeOperation = await doormanInstance.methods.unstake(unstakeAmount).send();
                await unstakeOperation.confirmation();

                // Update storage
                doormanStorage  = await doormanInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();

                // Test values
                const mli                   = Math.trunc((initialStakedMvkTotal * 100 * 10**36) / initialMvkTotalSupply);
                const exitFee               = (((300_000 * 10**36) - (5_250 * mli)) * 10**36 + 25 * mli * mli) / (10_000 * 10**36)
                const paidFee               = Math.trunc(unstakeAmount * (exitFee/100));
                const expectedFinalAmount   = unstakeAmount - (paidFee/10**36);

                // Final Values
                updatedUserTokenBalance     = (await mvkTokenStorage.ledger.get(user)).toNumber();
                updatedUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                updatedUserStakedBalance    = updatedUserStakedRecord.balance.toNumber()
                updatedStakedMvkTotal       = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

                // Assertion
                assert.equal(helperFunctions.almostEqual(Math.floor(initialStakedMvkTotal    - expectedFinalAmount), updatedStakedMvkTotal, 0.01), true)
                assert.equal(helperFunctions.almostEqual(Math.round(initialUserTokenBalance  + expectedFinalAmount), updatedUserTokenBalance, 0.01), true)
                assert.equal(helperFunctions.almostEqual(Math.floor(initialUserStakedBalance - expectedFinalAmount), updatedUserStakedBalance, 0.01), true)

                // Compound for next tests
                compoundOperation   = await doormanInstance.methods.compound(user).send();
                await compoundOperation.confirmation();
                
                compoundOperation   = await doormanInstance.methods.compound(user).send();
                await compoundOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("multiple users (eve, bob) should be able to unstake some MVK and share the exit fee", async() => {
            try{

                // Initial values
                firstUser               = bob.pkh
                firstUserSk             = bob.sk
                firstUserStakeAmount    = MVK(2)
                firstUserUnstakeAmount  = MVK(1)

                secondUser              = eve.pkh
                secondUserSk            = eve.sk
                secondUserStakeAmount   = MVK(2);

                doormanStorage          = await doormanInstance.storage();
                mvkTokenStorage         = await mvkTokenInstance.storage();
                
                // --------------------------------
                // Update Operators Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                await helperFunctions.signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await helperFunctions.signerFactory(tezos, secondUserSk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStakeAmount).send();
                await stakeOperation.confirmation();

                // Balances before unstaking
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                
                // first user
                firstUserStakedBalance      = await doormanStorage.userStakeBalanceLedger.get(firstUser)
                firstUserTokenBalance       = await mvkTokenStorage.ledger.get(firstUser)
                
                // second user
                secondUserStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(secondUser)

                // total supply
                initialMvkTotalSupply       = mvkTokenStorage.totalSupply.toNumber()
                initialStakedMvkTotal       = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

                console.log("MVK TOTAL SUPPLY: "    , initialMvkTotalSupply)
                console.log("SMVK TOTAL SUPPLY: "   , initialStakedMvkTotal)
                console.log("BOB SMVK: "            , firstUserStakedBalance.balance.toNumber())
                console.log("BOB MVK: "             , firstUserTokenBalance.toNumber())
                console.log("EVE SMVK: "            , secondUserStakedBalance.balance.toNumber())
                
                // --------------------------------
                // Unstake and Compound Operation
                // --------------------------------

                // First user (bob) unstake
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation()

                // compound operations
                compoundOperation    = await doormanInstance.methods.compound(firstUser).send();
                await compoundOperation.confirmation()

                compoundOperation    = await doormanInstance.methods.compound(secondUser).send();
                await compoundOperation.confirmation()

                // Refresh variables
                doormanStorage                      = await doormanInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                
                firstUserUpdatedStakedBalance       = await doormanStorage.userStakeBalanceLedger.get(firstUser)
                firstUserUpdatedTokenBalance        = await mvkTokenStorage.ledger.get(firstUser)

                secondUserUpdatedStakedBalance      = await doormanStorage.userStakeBalanceLedger.get(secondUser)
                
                const exitFee                       = firstUserTokenBalance.toNumber() + firstUserUnstakeAmount - firstUserUpdatedTokenBalance.toNumber()

                console.log("EXIT FEE: "    , exitFee)
                console.log("BOB SMVK: "    , firstUserUpdatedStakedBalance.balance.toNumber())
                console.log("EVE SMVK: "    , secondUserUpdatedStakedBalance.balance.toNumber())
                console.log("BOB MVK: "     , firstUserUpdatedTokenBalance.toNumber())

                firstUserReward        = Math.abs(firstUserUpdatedStakedBalance.balance.toNumber() - (firstUserStakedBalance.balance.toNumber() - firstUserUnstakeAmount))
                secondUserReward       = secondUserUpdatedStakedBalance.balance.toNumber() - secondUserStakedBalance.balance.toNumber()
                const combinedRewards  = secondUserReward + firstUserReward

                console.log("FIRST USER REWARD: "  , firstUserReward)
                console.log("SECOND USER REWARD: " , secondUserReward)
                console.log("COMBINED REWARDS: "   , combinedRewards)

                // Assertions
                assert.equal(helperFunctions.almostEqual(combinedRewards, exitFee, 0.001), true)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("%compound", async () => {

        it("user (mallory) should not be able to earn rewards without having staked MVK before", async() => {
            try{
                
                // Initial values
                firstUser               = bob.pkh
                firstUserSk             = bob.sk
                firstUserStakeAmount    = MVK(2)
                firstUserUnstakeAmount  = MVK()

                secondUser              = eve.pkh
                secondUserSk            = eve.sk
                secondUserStakeAmount   = MVK()

                thirdUser               = mallory.pkh
                thirdUserSk             = mallory.sk

                // --------------------------------
                // Update Operators Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                await helperFunctions.signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await helperFunctions.signerFactory(tezos, secondUserSk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStakeAmount).send();
                await stakeOperation.confirmation();
                
                // --------------------------------
                // Unstake and Compound Operation
                // --------------------------------

                // unstake operation
                await helperFunctions.signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                // compound operation for third user - should have no rewards
                await helperFunctions.signerFactory(tezos, thirdUserSk);
                compoundOperation = await doormanInstance.methods.compound(thirdUser).send();
                await compoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // Final values
                thirdUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);
                thirdUserStakedBalance = thirdUserStakedRecord.balance.toNumber()

                assert.equal(0,thirdUserStakedBalance)

                // Compound for next test
                compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send();
                await compoundOperation.confirmation();
                
                compoundOperation   = await doormanInstance.methods.compound(eve.pkh).send();
                await compoundOperation.confirmation();
                
                compoundOperation   = await doormanInstance.methods.compound(mallory.pkh).send();
                await compoundOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (bob) should not see any further increase in staked MVK if he unstakes everything and compounds", async() => {
            try{

                // Initial values
                firstUser               = bob.pkh
                firstUserSk             = bob.sk
                firstUserStakeAmount    = MVK(2)

                secondUser              = eve.pkh
                secondUserSk            = eve.sk
                secondUserStakeAmount   = MVK(3)

                // --------------------------------
                // Update Operators Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                
                await helperFunctions.signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await helperFunctions.signerFactory(tezos, secondUserSk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStakeAmount).send();
                await stakeOperation.confirmation();
                
                // Refresh values
                doormanStorage              = await doormanInstance.storage()
                firstUserStakedBalance      = await doormanStorage.userStakeBalanceLedger.get(firstUser)
                firstUserUnstakeAmount      = firstUserStakedBalance.balance.toNumber()
                console.log("UNSTAKE AMOUNT: ", firstUserUnstakeAmount)

                // unstake and compound operations
                await helperFunctions.signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                compoundOperation = await doormanInstance.methods.compound(firstUser).send();
                await compoundOperation.confirmation();

                // Final value
                doormanStorage                 = await doormanInstance.storage()
                firstUserUpdatedStakedBalance  = await doormanStorage.userStakeBalanceLedger.get(firstUser)
                
                // Assertion
                assert.equal(firstUserUpdatedStakedBalance.balance.toNumber(), 0)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (eve) should not see any increase in rewards when compounding twice in quick succession", async() => {
            try{

                // Initial values
                firstUser               = bob.pkh
                firstUserSk             = bob.sk
                firstUserStakeAmount    = MVK(2)
                firstUserUnstakeAmount  = MVK()

                secondUser              = eve.pkh
                secondUserSk            = eve.sk
                secondUserStakeAmount   = MVK(3)

                // --------------------------------
                // Update Operators Operation
                // --------------------------------
                
                await helperFunctions.signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                await helperFunctions.signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await helperFunctions.signerFactory(tezos, secondUserSk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStakeAmount).send();
                await stakeOperation.confirmation();
                
                // --------------------------------
                // Unstake and Compound Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                await helperFunctions.signerFactory(tezos, secondUserSk);
                compoundOperation = await doormanInstance.methods.compound(secondUser).send();
                await compoundOperation.confirmation();

                // get pre-compound storage and values
                doormanStorage          = await doormanInstance.storage();
                secondUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(secondUser);
                secondUserStakedBalance = secondUserStakedRecord === undefined ? 0 : secondUserStakedRecord.balance.toNumber()

                // compound operation
                compoundOperation = await doormanInstance.methods.compound(secondUser).send();
                await compoundOperation.confirmation();

                // update storage and get values
                doormanStorage                  = await doormanInstance.storage();
                secondUserStakedRecord          = await doormanStorage.userStakeBalanceLedger.get(secondUser);
                secondUserUpdatedStakedBalance  = secondUserStakedRecord.balance.toNumber()

                assert.equal(secondUserStakedBalance, secondUserUpdatedStakedBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (bob) should be able to compound rewards after unstaking some staked mvk", async() => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                const initFirstUserLedger   = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const initFirstUserBalance  = initFirstUserLedger.balance.toNumber()
                const firstUserStake        = MVK(100)
                const firstUserUnstake      = MVK(2) // Unstake all but 1MVK

                // update operators operation 
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // stake operation
                stakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
                await stakeOperation.confirmation();

                // unstake operation
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
                await unstakeOperation.confirmation();

                // Final values
                doormanStorage = await doormanInstance.storage();
                const finalFirstUserLedger   = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const finalFirstUserBalance  = finalFirstUserLedger.balance.toNumber()
                const unexpectedFinalBalance = initFirstUserBalance - firstUserUnstake;

                // Assertions
                assert.notEqual(unexpectedFinalBalance,finalFirstUserBalance);
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (bob) should be able to compound unclaimed rewards", async() => {
            try{
                // Initial values
                const firstUserStake = MVK(2)
                const secondUserStake = MVK(3)
                const firstUserUnstake = MVK()

                // --------------------------------
                // Update Operators Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                

                await helperFunctions.signerFactory(tezos, eve.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await helperFunctions.signerFactory(tezos, bob.sk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
                await stakeOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
                await stakeOperation.confirmation();

                // --------------------------------
                // Unstake and Compound Operation
                // --------------------------------
                
                await helperFunctions.signerFactory(tezos, bob.sk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
                await unstakeOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const secondUserPreCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                const secondUserPreCompoundBalance = secondUserPreCompoundLedger === undefined ? 0 : secondUserPreCompoundLedger.balance.toNumber()

                await helperFunctions.signerFactory(tezos, eve.sk);
                compoundOperation = await doormanInstance.methods.compound(eve.pkh).send();
                await compoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // Final values
                const secondUserPostCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                const secondUserPostCompoundBalance = secondUserPostCompoundLedger.balance.toNumber()

                assert.notEqual(secondUserPreCompoundBalance,secondUserPostCompoundBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("%migrateFunds", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        })
        
        it("admin (bob) should not be able to migrate the Doorman contract (and move MVK funds) if any contract entrypoint is not paused", async() => {
            try{
                // Initial values
                doormanStorage              = await doormanInstance.storage();
                const initCompoundPaused    = doormanStorage.breakGlassConfig.compoundIsPaused
                
                // Storage preparation operation
                pauseOperation = await doormanInstance.methods.pauseAll().send();
                await pauseOperation.confirmation();

                doormanStorage  = await doormanInstance.storage();
                // console.log("AFTER PAUSE ALL: ", doormanStorage.breakGlassConfig)

                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("compound", false).send();
                await pauseOperation.confirmation();

                // Operations
                migrateOperation = await doormanInstance.methods.migrateFunds(alice.pkh);
                await chai.expect(migrateOperation.send()).to.be.rejected;

                // Final values
                doormanStorage              = await doormanInstance.storage()
                // console.log("AFTER TOGGLE: ", doormanStorage.breakGlassConfig)

                const endCompoundPaused     = doormanStorage.breakGlassConfig.compoundIsPaused
                const stakePaused           = doormanStorage.breakGlassConfig.stakeIsPaused
                const unstakePaused         = doormanStorage.breakGlassConfig.unstakeIsPaused

                assert.equal(initCompoundPaused, endCompoundPaused)
                assert.equal(endCompoundPaused, false)
                assert.equal(stakePaused, true)
                assert.equal(unstakePaused, true)

                // Reset compound
                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("compound", true).send();
                await pauseOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("non-admin (alice) should not be able to migrate the Doorman contract MVK funds", async() => {
            try{
                
                // Operations
                await helperFunctions.signerFactory(tezos, alice.sk);

                migrateOperation = doormanInstance.methods.migrateFunds(alice.pkh); 
                await chai.expect(migrateOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("admin (bob) should be able to migrate the Doorman contract MVK funds", async() => {
            try{

                // Initial values
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                const newDoormanAddress     = alice.pkh
                const initNewDoormanBalance = await mvkTokenStorage.ledger.get(newDoormanAddress);
                const initDoormanBalance    = await mvkTokenStorage.ledger.get(doormanAddress);
                const stakePaused           = doormanStorage.breakGlassConfig.stakeIsPaused
                const unstakePaused         = doormanStorage.breakGlassConfig.unstakeIsPaused
                const compoundPaused        = doormanStorage.breakGlassConfig.unstakeIsPaused

                // Operation
                migrateOperation = await doormanInstance.methods.migrateFunds(newDoormanAddress).send();
                await migrateOperation.confirmation();

                // Final values
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const endNewDoormanBalance  = await mvkTokenStorage.ledger.get(newDoormanAddress);
                const endDoormanBalance     = await mvkTokenStorage.ledger.get(doormanAddress);

                // Assertions
                assert.equal(endNewDoormanBalance.toNumber(), initNewDoormanBalance.toNumber() + initDoormanBalance.toNumber())
                assert.equal(endDoormanBalance.toNumber(), 0)
                assert.equal(compoundPaused, true)
                assert.equal(stakePaused, true)
                assert.equal(unstakePaused, true)

                // reset break glass back to unpaused
                unpauseOperation = await doormanInstance.methods.unpauseAll().send();
                await unpauseOperation.confirmation();

                // reset migration - transfer back to doorman contract 
                await helperFunctions.signerFactory(tezos, alice.sk)
                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(mvkTokenInstance, alice.pkh, doormanAddress, tokenId, initDoormanBalance.toNumber());
                await transferOperation.confirmation();



            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

});
