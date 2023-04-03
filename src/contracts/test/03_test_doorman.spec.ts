import assert from "assert";
import { BigNumber } from 'bignumber.js'

import { MVK, Utils } from "./helpers/Utils";

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

import { bob, alice, eve, mallory, oscar } from '../scripts/sandbox/accounts'
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Doorman Contract", async () => {
    
    // default
    var utils : Utils
    var tezos

    // basic inputs for updating operators
    let doormanAddress
    let tokenId = 0
    let user 
    let userSk
    
    // contract instances
    let doormanInstance
    let delegationInstance
    let mvkTokenInstance
    let mavrykFa2TokenInstance

    // contract storages
    let doormanStorage
    let delegationStorage
    let mvkTokenStorage
    let mavrykFa2TokenStorage

    // stake variables
    let stakeAmount 
    let unstakeAmount
    let finalUnstakeAmount
    let accumulatedFeesPerShare
    let updatedAccumulatedFeesPerShare
    let initialParticipationFeesPerShare
    let updatedParticipationFeesPerShare
    
    // first user
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
    let firstUserParticipationFeesPerShare
    let firstUserUpdatedParticipationFeesPerShare

    // second user
    let secondUser 
    let secondUserSk
    let secondUserStakeAmount 
    let secondUserUnstakeAmount 
    let secondUserTokenBalance
    let secondUserStakedRecord
    let secondUserStakedBalance
    let secondUserUpdatedStakedRecord
    let secondUserUpdatedTokenBalance
    let secondUserUpdatedStakedBalance
    let secondUserReward
    let secondUserParticipationFeesPerShare
    let secondUserUpdatedParticipationFeesPerShare

    // third user
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

    // initial state
    let initialUserTokenBalance
    let initialUserStakedRecord
    let initialUserStakedBalance
    let initialStakedMvkTotal
    let initialMvkTotalSupply

    // updated state
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
    let pauseOperation
    let pauseAllOperation
    let unpauseOperation
    let unpauseAllOperation
    let migrateOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue
    

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos;

        doormanAddress     = contractDeployments.doorman.address;
        
        doormanInstance    = await utils.tezos.contract.at(doormanAddress);
        mvkTokenInstance   = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        mavrykFa2TokenInstance = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);
            
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

        it("user (eve) should be able to stake less than his maximum amount of MVK but at least 1MVK", async() => {
            try{

                // Initial values
                user                      = eve.pkh;
                stakeAmount               = MVK(10);
                initialUserTokenBalance   = (await mvkTokenStorage.ledger.get(user)).toNumber();

                // Compound first so values are updated below (for retesting if required)
                compoundOperation   = await doormanInstance.methods.compound(user).send();
                await compoundOperation.confirmation();
                
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

                // Assertion
                assert.equal(updatedStakedMvkTotal      , initialStakedMvkTotal    + stakeAmount);
                assert.equal(updatedUserTokenBalance    , initialUserTokenBalance  - stakeAmount);
                assert.equal(updatedUserStakedBalance   , initialUserStakedBalance + stakeAmount);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

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

        it("user (eve) should not be able to stake a negative amount of MVK", async() => {
            try{

                // Initial values
                user                        = eve.pkh;
                stakeAmount                 = MVK(1);
                const negativeStakeAmount   = -1000000000;

                doormanStorage              = await doormanInstance.storage();
                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance   = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // update operators operation
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // Operation
                stakeOperation = await doormanInstance.methods.stake(negativeStakeAmount);
                await chai.expect(stakeOperation.send()).to.be.rejected;

            } catch(e) {
                
                doormanStorage              = await doormanInstance.storage();
                updatedUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                updatedUserStakedBalance    = updatedUserStakedRecord === undefined ? 0 : updatedUserStakedRecord.balance.toNumber()

                // check no change in staked balances
                assert.equal(updatedUserStakedBalance, initialUserStakedBalance);

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

    })

    describe("%unstake", async () => {

        beforeEach("Set signer to user (eve)", async () => {
            // Update storage
            doormanStorage  = await doormanInstance.storage();
            mvkTokenStorage = await mvkTokenInstance.storage();
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it("user (eve) should be able to unstake some MVK and see an increase in rewards from her exit fee distribution to staked MVK holders (including herself)", async() => {
            try{
                
                user = eve.pkh;
                await helperFunctions.signerFactory(tezos, eve.sk);

                // Compound first so values are updated below (for retesting if required)
                compoundOperation   = await doormanInstance.methods.compound(user).send();
                await compoundOperation.confirmation();

                // Update storage
                doormanStorage           = await doormanInstance.storage();
                mvkTokenStorage          = await mvkTokenInstance.storage();
                accumulatedFeesPerShare  = doormanStorage.accumulatedFeesPerShare;

                initialMvkTotalSupply    = (mvkTokenStorage.totalSupply).toNumber();
                initialStakedMvkTotal    = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

                // Initial values
                initialUserTokenBalance             = (await mvkTokenStorage.ledger.get(user)).toNumber();
                initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                initialParticipationFeesPerShare    = initialUserStakedRecord.participationFeesPerShare;
                initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // input param
                unstakeAmount                       = initialUserStakedBalance - MVK(1);

                // Operation
                unstakeOperation = await doormanInstance.methods.unstake(unstakeAmount).send();
                await unstakeOperation.confirmation();

                // Calculate exit fees and final unstake amount
                const mli                   = helperFunctions.calculateMavrykLoyaltyIndex(initialStakedMvkTotal, initialMvkTotalSupply);
                const exitFeePercent        = helperFunctions.calculateExitFeePercent(mli);
                const paidFeeWithFpa        = Math.trunc( unstakeAmount * (exitFeePercent / 100)); // with fixed point accuracy
                const paidFee               = Math.trunc( paidFeeWithFpa / helperFunctions.fixedPointAccuracy);
                finalUnstakeAmount          = unstakeAmount - paidFee;
                
                // calculate increment in accumulated fees per share from exit fee, and the corresponding updated accumulated fees per share
                const calcIncrementAccumulatedFeesPerShareFromExitFee = helperFunctions.calcIncrementAccumulatedFeesPerShare(paidFeeWithFpa, unstakeAmount, initialStakedMvkTotal);
                const calcUpdatedAccumulatedFeesPerShareFromExitFee   = helperFunctions.calcUpdatedAccumulatedFeesPerShare(paidFeeWithFpa, unstakeAmount, initialStakedMvkTotal, accumulatedFeesPerShare);

                // Update storage
                doormanStorage                      = await doormanInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                updatedAccumulatedFeesPerShare      = doormanStorage.accumulatedFeesPerShare;
                updatedStakedMvkTotal               = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

                // Final Values for user
                updatedUserTokenBalance             = (await mvkTokenStorage.ledger.get(user)).toNumber();
                updatedUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                updatedParticipationFeesPerShare    = updatedUserStakedRecord.participationFeesPerShare;
                updatedUserStakedBalance            = updatedUserStakedRecord.balance.toNumber()
                
                // reward from user's exit fee distributed over user's remaining staked MVK
                const balanceAfterUnstake           = initialUserStakedBalance - unstakeAmount;
                const calcUserReward                = helperFunctions.calculateExitFeeRewards(balanceAfterUnstake, initialParticipationFeesPerShare, updatedParticipationFeesPerShare)

                // --------------------------------
                // Test Assertions
                // --------------------------------

                // staked MVK should decrease by final unstake amount
                assert.equal(helperFunctions.almostEqual(updatedStakedMvkTotal, Math.floor(initialStakedMvkTotal - finalUnstakeAmount), 0.01), true)

                // MVK Total supply should increase by final unstake amount (sMVK converted to MVK)
                assert.equal(helperFunctions.almostEqual(updatedUserTokenBalance, Math.round(initialUserTokenBalance + finalUnstakeAmount), 0.01), true)

                // User staked balance should reflect decrease in final unstake amount and paid fee, and increase from user rewards
                assert.equal(updatedUserStakedBalance, Math.floor(initialUserStakedBalance - finalUnstakeAmount - paidFee + calcUserReward))

                // check increase in accumulated fees per share from exit fee - may have very very slight differences from large number operations
                assert.equal(helperFunctions.almostEqual(updatedAccumulatedFeesPerShare.toNumber(), accumulatedFeesPerShare.toNumber() + calcIncrementAccumulatedFeesPerShareFromExitFee, 0.001), true)
                assert.equal(helperFunctions.almostEqual(updatedAccumulatedFeesPerShare.toNumber(), calcUpdatedAccumulatedFeesPerShareFromExitFee, 0.001), true)

                // check user's participation fees per share to be equal to accumulated fees per share
                assert.equal(updatedUserStakedRecord.participationFeesPerShare.toNumber(), updatedAccumulatedFeesPerShare.toNumber())

                // Compound for next tests
                compoundOperation   = await doormanInstance.methods.compound(user).send();
                await compoundOperation.confirmation();
                
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (eve) should be able to unstake some MVK and other users (mallory) should see a corresponding increase in rewards from the exit fee distribution to all staked MVK holders", async() => {
            try{

                // Initial values
                firstUser               = eve.pkh
                firstUserSk             = eve.sk
                firstUserStakeAmount    = MVK(2)
                firstUserUnstakeAmount  = MVK(1)

                secondUser              = mallory.pkh
                secondUserSk            = mallory.sk
                secondUserStakeAmount   = MVK(2)

                // get most updated storage
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
                accumulatedFeesPerShare     = doormanStorage.accumulatedFeesPerShare;

                // first user
                firstUserStakedRecord                = await doormanStorage.userStakeBalanceLedger.get(firstUser)
                firstUserStakedBalance               = firstUserStakedRecord === undefined ? 0 : firstUserStakedRecord.balance.toNumber()
                firstUserParticipationFeesPerShare   = firstUserStakedRecord.participationFeesPerShare;
                firstUserTokenBalance                = await mvkTokenStorage.ledger.get(firstUser)
                
                // second user
                secondUserStakedRecord               = await doormanStorage.userStakeBalanceLedger.get(secondUser)
                secondUserStakedBalance              = secondUserStakedRecord === undefined ? 0 : secondUserStakedRecord.balance.toNumber()
                secondUserParticipationFeesPerShare  = secondUserStakedRecord.participationFeesPerShare;
                secondUserTokenBalance               = await mvkTokenStorage.ledger.get(secondUser)

                // total supply
                initialMvkTotalSupply                = mvkTokenStorage.totalSupply.toNumber()
                initialStakedMvkTotal                = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

                // --------------------------------
                // Unstake and Compound Operation
                // --------------------------------

                // First user unstake
                await helperFunctions.signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation()

                // Compound operations for first and second user
                compoundOperation    = await doormanInstance.methods.compound(firstUser).send();
                await compoundOperation.confirmation()

                compoundOperation    = await doormanInstance.methods.compound(secondUser).send();
                await compoundOperation.confirmation()

                // update storage
                doormanStorage                      = await doormanInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                updatedAccumulatedFeesPerShare      = doormanStorage.accumulatedFeesPerShare;
                updatedStakedMvkTotal               = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();
                
                // updated values for first user
                firstUserUpdatedStakedRecord                = await doormanStorage.userStakeBalanceLedger.get(firstUser)
                firstUserUpdatedStakedBalance               = firstUserUpdatedStakedRecord === undefined ? 0 : firstUserUpdatedStakedRecord.balance.toNumber()
                firstUserUpdatedParticipationFeesPerShare   = firstUserUpdatedStakedRecord.participationFeesPerShare;
                firstUserUpdatedTokenBalance                = await mvkTokenStorage.ledger.get(firstUser)

                // updated values for second user
                secondUserUpdatedStakedRecord               = await doormanStorage.userStakeBalanceLedger.get(secondUser)
                secondUserUpdatedStakedBalance              = secondUserUpdatedStakedRecord === undefined ? 0 : secondUserUpdatedStakedRecord.balance.toNumber()
                secondUserUpdatedParticipationFeesPerShare  = secondUserUpdatedStakedRecord.participationFeesPerShare;

                // Calculate exit fees and final unstake amount
                const mli                   = helperFunctions.calculateMavrykLoyaltyIndex(initialStakedMvkTotal, initialMvkTotalSupply);
                const exitFeePercent        = helperFunctions.calculateExitFeePercent(mli);
                const paidFeeWithFpa        = Math.trunc( firstUserUnstakeAmount * (exitFeePercent / 100)); // with fixed point accuracy
                const paidFee               = Math.trunc( paidFeeWithFpa / helperFunctions.fixedPointAccuracy);
                finalUnstakeAmount          = firstUserUnstakeAmount - paidFee;
                
                // calculate increment in accumulated fees per share from exit fee, and the corresponding updated accumulated fees per share
                const calcIncrementAccumulatedFeesPerShareFromExitFee = helperFunctions.calcIncrementAccumulatedFeesPerShare(paidFeeWithFpa, firstUserUnstakeAmount, initialStakedMvkTotal);
                const calcUpdatedAccumulatedFeesPerShareFromExitFee   = helperFunctions.calcUpdatedAccumulatedFeesPerShare(paidFeeWithFpa, firstUserUnstakeAmount, initialStakedMvkTotal, accumulatedFeesPerShare);

                // reward from user's exit fee distributed over user's remaining staked MVK
                const firstUserBalanceAfterUnstake  = firstUserStakedBalance - firstUserUnstakeAmount;
                const calcFirstUserReward           = helperFunctions.calculateExitFeeRewards(firstUserBalanceAfterUnstake, firstUserParticipationFeesPerShare, firstUserUpdatedParticipationFeesPerShare)
                
                // calc rewards for second user 
                const calcSecondUserReward          = helperFunctions.calculateExitFeeRewards(secondUserStakedBalance, secondUserParticipationFeesPerShare, secondUserUpdatedParticipationFeesPerShare)

                // --------------------------------
                // Test Assertions
                // --------------------------------

                // staked MVK should decrease by final unstake amount
                assert.equal(helperFunctions.almostEqual(updatedStakedMvkTotal, Math.floor(initialStakedMvkTotal - finalUnstakeAmount), 0.01), true)

                // MVK Total supply should increase by final unstake amount (sMVK converted to MVK)
                assert.equal(helperFunctions.almostEqual(updatedUserTokenBalance, Math.round(initialUserTokenBalance + finalUnstakeAmount), 0.01), true)

                // First User staked balance should reflect decrease in final unstake amount and paid fee, and increase from user rewards
                assert.equal(firstUserUpdatedStakedBalance, Math.floor(firstUserStakedBalance - finalUnstakeAmount - paidFee + calcFirstUserReward))

                // Second User staked balance should reflect decrease in final unstake amount and paid fee, and increase from user rewards
                assert.equal(secondUserUpdatedStakedBalance, Math.floor(secondUserStakedBalance + calcSecondUserReward))

                // check increase in accumulated fees per share from exit fee - may have very very slight differences from large number operations
                assert.equal(helperFunctions.almostEqual(updatedAccumulatedFeesPerShare.toNumber(), accumulatedFeesPerShare.toNumber() + calcIncrementAccumulatedFeesPerShareFromExitFee, 0.001), true)
                assert.equal(helperFunctions.almostEqual(updatedAccumulatedFeesPerShare.toNumber(), calcUpdatedAccumulatedFeesPerShareFromExitFee, 0.001), true)

                // check both users' participation fees per share to be equal to accumulated fees per share
                assert.equal(firstUserUpdatedParticipationFeesPerShare.toNumber(), updatedAccumulatedFeesPerShare.toNumber())
                assert.equal(secondUserUpdatedParticipationFeesPerShare.toNumber(), updatedAccumulatedFeesPerShare.toNumber())

                // Compound operation for first and second user for subsequent tests
                compoundOperation   = await doormanInstance.methods.compound(firstUser).send();
                await compoundOperation.confirmation();

                compoundOperation   = await doormanInstance.methods.compound(secondUser).send();
                await compoundOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

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

        it("user (eve) should not be able to unstake more MVK than she has", async() => {
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

        it("user (alice) should not be able to unstake if she has not staked before", async() => {
            try{

                // set signer to user (alice)
                user = alice.pkh;
                await helperFunctions.signerFactory(tezos, alice.sk);

                // Initial values
                initialUserStakedRecord = await doormanStorage.userStakeBalanceLedger.get(user);
                unstakeAmount           = MVK(1);

                // Assertion
                assert.strictEqual(initialUserStakedRecord,undefined);

                // Operation
                unstakeOperation = await doormanInstance.methods.unstake(unstakeAmount);
                await chai.expect(unstakeOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

    describe("%compound", async () => {

        it("user (eve) should be able to compound rewards after unstaking some staked mvk", async() => {
            try{
                
                // Initial values
                user            = eve.pkh;
                userSk          = eve.sk;
                stakeAmount     = MVK(100)
                unstakeAmount   = MVK(2) 

                // set user as signer
                await helperFunctions.signerFactory(tezos, userSk);

                // Initial storage
                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakedRecord.balance.toNumber()
                
                // update operators operation 
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // stake operation
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // unstake operation
                unstakeOperation = await doormanInstance.methods.unstake(unstakeAmount).send();
                await unstakeOperation.confirmation();

                // Final values
                doormanStorage = await doormanInstance.storage();
                
                updatedUserStakedRecord   = await doormanStorage.userStakeBalanceLedger.get(user);
                updatedUserStakedBalance  = updatedUserStakedRecord.balance.toNumber()
                
                const expectedFinalBalance = initialUserStakedBalance - unstakeAmount;

                // Assertions
                assert.notEqual(expectedFinalBalance, updatedUserStakedBalance);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (mallory) should be able to compound unclaimed rewards", async() => {
            try{

                // Initial values
                firstUser               = eve.pkh
                firstUserSk             = eve.sk
                firstUserStakeAmount    = MVK(2)
                firstUserUnstakeAmount  = MVK(1)

                secondUser              = mallory.pkh
                secondUserSk            = mallory.sk
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
                
                // first user unstakes some amount - this will add exit fee rewards to second user
                await helperFunctions.signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                // update storage
                doormanStorage          = await doormanInstance.storage();

                // get pre-compound staked balance
                secondUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(secondUser);
                secondUserStakedBalance = secondUserStakedRecord === undefined ? 0 : secondUserStakedRecord.balance.toNumber()

                // compound operation to increment rewards for second user
                compoundOperation = await doormanInstance.methods.compound(secondUser).send();
                await compoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // get post-compound staked balance
                secondUserUpdatedStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                secondUserUpdatedStakedBalance = secondUserUpdatedStakedRecord.balance.toNumber()

                assert.notEqual(secondUserStakedBalance, secondUserUpdatedStakedBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        it("user (oscar) should not be able to earn rewards without having staked MVK before", async() => {
            try{
                
                // Initial values
                firstUser               = mallory.pkh
                firstUserSk             = mallory.sk
                firstUserStakeAmount    = MVK(2)
                firstUserUnstakeAmount  = MVK(1)

                secondUser              = eve.pkh
                secondUserSk            = eve.sk
                secondUserStakeAmount   = MVK(1)

                thirdUser               = oscar.pkh
                thirdUserSk             = oscar.sk

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
                thirdUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(thirdUser);
                thirdUserStakedBalance = thirdUserStakedRecord.balance.toNumber()

                assert.equal(0,thirdUserStakedBalance)

                // Compound for next test
                compoundOperation   = await doormanInstance.methods.compound(firstUser).send();
                await compoundOperation.confirmation();
                
                compoundOperation   = await doormanInstance.methods.compound(secondUser).send();
                await compoundOperation.confirmation();
                
                compoundOperation   = await doormanInstance.methods.compound(thirdUser).send();
                await compoundOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (mallory) should not see any further increase in staked MVK if she unstakes everything and compounds", async() => {
            try{

                // Initial values
                firstUser               = mallory.pkh
                firstUserSk             = mallory.sk
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

                // unstake and compound operations
                await helperFunctions.signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                compoundOperation = await doormanInstance.methods.compound(firstUser).send();
                await compoundOperation.confirmation();

                // Final value
                doormanStorage                 = await doormanInstance.storage()
                firstUserUpdatedStakedRecord   = await doormanStorage.userStakeBalanceLedger.get(firstUser)
                firstUserUpdatedStakedBalance = firstUserUpdatedStakedRecord === undefined ? 0 : firstUserUpdatedStakedRecord.balance.toNumber()
                
                // Assertion
                assert.equal(firstUserUpdatedStakedBalance, 0)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("user (eve) should not see any increase in rewards when compounding twice in quick succession", async() => {
            try{

                // Initial values
                firstUser               = mallory.pkh
                firstUserSk             = mallory.sk
                firstUserStakeAmount    = MVK(2)
                firstUserUnstakeAmount  = MVK(1)

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

                // update storage
                doormanStorage          = await doormanInstance.storage();

                // get pre-compound staked balance
                secondUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(secondUser);
                secondUserStakedBalance = secondUserStakedRecord === undefined ? 0 : secondUserStakedRecord.balance.toNumber()

                // compound operation
                compoundOperation = await doormanInstance.methods.compound(secondUser).send();
                await compoundOperation.confirmation();

                // post-compound update storage
                doormanStorage                  = await doormanInstance.storage();

                // get pre-compound staked balance
                secondUserUpdatedStakedRecord   = await doormanStorage.userStakeBalanceLedger.get(secondUser);
                secondUserUpdatedStakedBalance  = secondUserUpdatedStakedRecord.balance.toNumber()

                assert.equal(secondUserStakedBalance, secondUserUpdatedStakedBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                doormanStorage     = await doormanInstance.storage();
                const currentAdmin = doormanStorage.admin;

                // Operation
                setAdminOperation = await doormanInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                doormanStorage   = await doormanInstance.storage();
                const newAdmin = doormanStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await doormanInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                doormanStorage       = await doormanInstance.storage();
                const currentGovernance = doormanStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await doormanInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                doormanStorage   = await doormanInstance.storage();
                const updatedGovernance = doormanStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await doormanInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await doormanInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                doormanStorage          = await doormanInstance.storage();            

                const updatedData       = await doormanStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update doorman contract config', async () => {
            try{
                
                // Initial Values
                doormanStorage            = await doormanInstance.storage();
                const initialMinMvkAmount = doormanStorage.config.minMvkAmount.toNumber();
                const newMinMvkAmount     = MVK(3);

                // Operation
                const updateConfigOperation = await doormanInstance.methods.updateConfig(newMinMvkAmount, "configMinMvkAmount").send();
                await updateConfigOperation.confirmation();

                // Final values
                doormanStorage           = await doormanInstance.storage();
                const updatedConfigValue = doormanStorage.config.minMvkAmount;

                // Assertions
                assert.equal(updatedConfigValue, newMinMvkAmount);

                // reset config operation
                const resetConfigOperation = await doormanInstance.methods.updateConfig(initialMinMvkAmount, "configMinMvkAmount").send();
                await resetConfigOperation.confirmation();

                // Final values
                doormanStorage           = await doormanInstance.storage();
                const resetConfigValue   = doormanStorage.config.minMvkAmount;

                assert.equal(resetConfigValue, initialMinMvkAmount);


            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(doormanInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.strictEqual(updatedContractMapValue, eve.pkh,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(doormanInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh);
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh);
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it("%migrateFunds             - admin (bob) should be able to migrate the Doorman contract MVK funds when all entrypoints are paused", async() => {
            try{

                // Initial values
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                const newDoormanAddress     = alice.pkh
                const initNewDoormanBalance = await mvkTokenStorage.ledger.get(newDoormanAddress);
                const initDoormanBalance    = await mvkTokenStorage.ledger.get(doormanAddress);

                // pause all operation
                pauseAllOperation = await doormanInstance.methods.pauseAll().send();
                await pauseAllOperation.confirmation();

                // migrate operation
                migrateOperation = await doormanInstance.methods.migrateFunds(newDoormanAddress).send();
                await migrateOperation.confirmation();

                // Final values
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                // get updated values
                const endNewDoormanBalance  = await mvkTokenStorage.ledger.get(newDoormanAddress);
                const endDoormanBalance     = await mvkTokenStorage.ledger.get(doormanAddress);

                // Assertions
                assert.equal(endNewDoormanBalance.toNumber(), initNewDoormanBalance.toNumber() + initDoormanBalance.toNumber())
                assert.equal(endDoormanBalance.toNumber(), 0)
                
                assert.equal(doormanStorage.breakGlassConfig.stakeIsPaused, true)
                assert.equal(doormanStorage.breakGlassConfig.unstakeIsPaused, true)
                assert.equal(doormanStorage.breakGlassConfig.compoundIsPaused, true)

                // reset break glass by unpausing all entrypoints
                unpauseOperation = await doormanInstance.methods.unpauseAll().send();
                await unpauseOperation.confirmation();

                // reset migration - transfer funds back to old doorman contract  
                await helperFunctions.signerFactory(tezos, alice.sk)
                transferOperation = await helperFunctions.fa2Transfer(mvkTokenInstance, alice.pkh, doormanAddress, tokenId, initDoormanBalance.toNumber());
                await transferOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%migrateFunds             - admin (bob) should not be able to migrate the Doorman contract (and move MVK funds) if any contract entrypoint is not paused", async() => {
            try{
                
                // Initial values
                doormanStorage              = await doormanInstance.storage();
                const initDoormanBalance    = await mvkTokenStorage.ledger.get(doormanAddress);
                
                // pause all operation
                pauseAllOperation = await doormanInstance.methods.pauseAll().send();
                await pauseAllOperation.confirmation();

                // unpause one entrypoint
                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("compound", false).send();
                await unpauseOperation.confirmation();

                // migrate operation
                migrateOperation = await doormanInstance.methods.migrateFunds(alice.pkh);
                await chai.expect(migrateOperation.send()).to.be.rejected;

                // Final values
                doormanStorage              = await doormanInstance.storage()
                const endDoormanBalance     = await mvkTokenStorage.ledger.get(doormanAddress);

                // check that there is no change to doorman MVK balance
                assert.equal(endDoormanBalance.toNumber(), initDoormanBalance.toNumber())

                // check that %compound entrypoint is not paused
                assert.equal(doormanStorage.breakGlassConfig.compoundIsPaused   , false)

                // check that the other two entrypoints are paused
                assert.equal(doormanStorage.breakGlassConfig.stakeIsPaused      , true)
                assert.equal(doormanStorage.breakGlassConfig.unstakeIsPaused    , true)
                
                // reset test by unpausing all entrypoints
                unpauseOperation = await doormanInstance.methods.unpauseAll().send();
                await unpauseOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })        

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                doormanStorage        = await doormanInstance.storage();
                const currentAdmin  = doormanStorage.admin;

                // Operation
                setAdminOperation = await doormanInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                doormanStorage    = await doormanInstance.storage();
                const newAdmin  = doormanStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                doormanStorage        = await doormanInstance.storage();
                const currentGovernance  = doormanStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await doormanInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                doormanStorage    = await doormanInstance.storage();
                const updatedGovernance  = doormanStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata           - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                doormanStorage          = await doormanInstance.storage();   
                const initialMetadata   = await doormanStorage.metadata.get(key);

                // Operation
                const updateOperation = await doormanInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                doormanStorage          = await doormanInstance.storage();            
                const updatedData       = await doormanStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - non-admin (mallory) should not be able to update doorman contract config', async () => {
            try{
                
                // Initial Values
                doormanStorage           = await doormanInstance.storage();
                const initialConfigValue = doormanStorage.config.minMvkAmount;
                const newMinMvkAmount = MVK(10);

                // Operation
                const updateConfigOperation = await doormanInstance.methods.updateConfig(newMinMvkAmount, "configMinMvkAmount");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                doormanStorage           = await doormanInstance.storage();
                const updatedConfigValue = doormanStorage.config.minMvkAmount;

                // check that there is no change in config values
                assert.equal(updatedConfigValue.toNumber(), initialConfigValue.toNumber());
                assert.notEqual(updatedConfigValue.toNumber(), newMinMvkAmount);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await doormanInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh)
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await doormanInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh)
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                doormanStorage          = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to MVK Token Contract
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                const mistakenTransferOperation = await doormanInstance.methods.mistakenTransfer(
                [
                    {
                        "to_"    : mallory.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress": contractDeployments.mavrykFa2Token.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : tokenAmount
                    }
                ]);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it("%migrateFunds             - non-admin (alice) should not be able to migrate the Doorman contract MVK funds", async() => {
            try{
                
                // Operations
                await helperFunctions.signerFactory(tezos, alice.sk);

                migrateOperation = doormanInstance.methods.migrateFunds(alice.pkh); 
                await chai.expect(migrateOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
