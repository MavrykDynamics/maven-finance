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
import {
    fa2Transfer,
    getStorageMapValue,
    mistakenTransferFa2Token,
    signerFactory,
    updateOperators,
    updateGeneralContracts,
    updateWhitelistContracts,
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Notes
// ------------------------------------------------------------------------------

// For testing of vault related entrypoints, see lending and vault tests

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Doorman Contract", async () => {
    
    // default
    var utils : Utils
    var tezos

    // basic inputs for updating operators
    let doormanAddress
    let mvkTokenAddress
    let mavrykFa2TokenAddress
    let tokenId = 0
    let user 
    let userSk
    let admin 
    let adminSk
    
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
    let transferOperation
    let stakeOperation
    let unstakeOperation
    let exitOperation
    let compoundOperation
    let updateOperatorsOperation
    let removeOperatorsOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation
    let pauseOperation
    let pauseAllOperation
    let unpauseOperation
    let unpauseAllOperation
    let migrateOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue
    

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos;

        admin   = bob.pkh
        adminSk = bob.sk 

        doormanAddress          = contractDeployments.doorman.address;
        mvkTokenAddress         = contractDeployments.mvkToken.address;
        mavrykFa2TokenAddress   = contractDeployments.mavrykFa2Token.address;

        doormanInstance         = await utils.tezos.contract.at(doormanAddress);
        mvkTokenInstance        = await utils.tezos.contract.at(mvkTokenAddress);
        mavrykFa2TokenInstance  = await utils.tezos.contract.at(mavrykFa2TokenAddress);
            
        doormanStorage          = await doormanInstance.storage();
        mvkTokenStorage         = await mvkTokenInstance.storage();
        mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    });

    beforeEach('storage', async () => {
        doormanStorage     = await doormanInstance.storage();
        mvkTokenStorage    = await mvkTokenInstance.storage();
    })

    describe("%stake", async () => {

        beforeEach("Set signer to user (eve)", async () => {
            await signerFactory(tezos, eve.sk);
        });

        it("user (eve) should be able to stake less than his maximum amount of MVK but at least 1MVK", async() => {
            try{

                // Initial values
                user                      = eve.pkh;
                stakeAmount               = MVK(10);
                initialUserTokenBalance   = (await mvkTokenStorage.ledger.get(user)).toNumber();

                // Compound first so values are updated below (for retesting if required)
                compoundOperation   = await doormanInstance.methods.compound([user]).send();
                await compoundOperation.confirmation();
                
                initialUserStakedRecord   = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance  = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
                initialStakedMvkTotal     = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

                // update operators operation
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
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
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
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
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
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
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
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
            doormanStorage  = await doormanInstance.storage();
            mvkTokenStorage = await mvkTokenInstance.storage();
            await signerFactory(tezos, eve.sk);
        });

        it("user (eve) should be able to unstake some MVK and see an increase in rewards from her exit fee distribution to staked MVK holders (including herself)", async() => {
            try{
                
                user = eve.pkh;
                await signerFactory(tezos, eve.sk);

                // Compound first so values are updated below (for retesting if required)
                compoundOperation   = await doormanInstance.methods.compound([user]).send();
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
                const mli                   = calculateMavrykLoyaltyIndex(initialStakedMvkTotal, initialMvkTotalSupply);
                const exitFeePercent        = calculateExitFeePercent(mli);
                const paidFeeWithFpa        = Math.trunc( unstakeAmount * (exitFeePercent / 100)); // with fixed point accuracy
                const paidFee               = Math.trunc( paidFeeWithFpa / fixedPointAccuracy);
                finalUnstakeAmount          = unstakeAmount - paidFee;
                
                // calculate increment in accumulated fees per share from exit fee, and the corresponding updated accumulated fees per share
                const calcIncrementAccumulatedFeesPerShareFromExitFee = calcIncrementAccumulatedFeesPerShare(paidFeeWithFpa, unstakeAmount, initialStakedMvkTotal);
                const calcUpdatedAccumulatedFeesPerShareFromExitFee   = calcUpdatedAccumulatedFeesPerShare(paidFeeWithFpa, unstakeAmount, initialStakedMvkTotal, accumulatedFeesPerShare);

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
                const calcUserReward                = calculateExitFeeRewards(balanceAfterUnstake, initialParticipationFeesPerShare, updatedParticipationFeesPerShare)

                // --------------------------------
                // Test Assertions
                // --------------------------------

                // staked MVK should decrease by final unstake amount
                assert.equal(almostEqual(updatedStakedMvkTotal, Math.floor(initialStakedMvkTotal - finalUnstakeAmount), 0.01), true)

                // MVK Total supply should increase by final unstake amount (sMVK converted to MVK)
                assert.equal(almostEqual(updatedUserTokenBalance, Math.round(initialUserTokenBalance + finalUnstakeAmount), 0.01), true)

                // User staked balance should reflect decrease in final unstake amount and paid fee, and increase from user rewards
                assert.equal(updatedUserStakedBalance, Math.floor(initialUserStakedBalance - finalUnstakeAmount - paidFee + calcUserReward))

                // check increase in accumulated fees per share from exit fee - may have very very slight differences from large number operations
                assert.equal(almostEqual(updatedAccumulatedFeesPerShare.toNumber(), accumulatedFeesPerShare.toNumber() + calcIncrementAccumulatedFeesPerShareFromExitFee, 0.001), true)
                assert.equal(almostEqual(updatedAccumulatedFeesPerShare.toNumber(), calcUpdatedAccumulatedFeesPerShareFromExitFee, 0.001), true)

                // check user's participation fees per share to be equal to accumulated fees per share
                assert.equal(updatedUserStakedRecord.participationFeesPerShare.toNumber(), updatedAccumulatedFeesPerShare.toNumber())

                // Compound for next tests
                compoundOperation   = await doormanInstance.methods.compound([user]).send();
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

                await signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
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
                await signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation()

                // Compound operations for first and second user
                compoundOperation    = await doormanInstance.methods.compound([firstUser]).send();
                await compoundOperation.confirmation()

                compoundOperation    = await doormanInstance.methods.compound([secondUser]).send();
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
                const mli                   = calculateMavrykLoyaltyIndex(initialStakedMvkTotal, initialMvkTotalSupply);
                const exitFeePercent        = calculateExitFeePercent(mli);
                const paidFeeWithFpa        = Math.trunc( firstUserUnstakeAmount * (exitFeePercent / 100)); // with fixed point accuracy
                const paidFee               = Math.trunc( paidFeeWithFpa / fixedPointAccuracy);
                finalUnstakeAmount          = firstUserUnstakeAmount - paidFee;
                
                // calculate increment in accumulated fees per share from exit fee, and the corresponding updated accumulated fees per share
                const calcIncrementAccumulatedFeesPerShareFromExitFee = calcIncrementAccumulatedFeesPerShare(paidFeeWithFpa, firstUserUnstakeAmount, initialStakedMvkTotal);
                const calcUpdatedAccumulatedFeesPerShareFromExitFee   = calcUpdatedAccumulatedFeesPerShare(paidFeeWithFpa, firstUserUnstakeAmount, initialStakedMvkTotal, accumulatedFeesPerShare);

                // reward from user's exit fee distributed over user's remaining staked MVK
                const firstUserBalanceAfterUnstake  = firstUserStakedBalance - firstUserUnstakeAmount;
                const calcFirstUserReward           = calculateExitFeeRewards(firstUserBalanceAfterUnstake, firstUserParticipationFeesPerShare, firstUserUpdatedParticipationFeesPerShare)
                
                // calc rewards for second user 
                const calcSecondUserReward          = calculateExitFeeRewards(secondUserStakedBalance, secondUserParticipationFeesPerShare, secondUserUpdatedParticipationFeesPerShare)

                // --------------------------------
                // Test Assertions
                // --------------------------------

                // staked MVK should decrease by final unstake amount
                assert.equal(almostEqual(updatedStakedMvkTotal, Math.floor(initialStakedMvkTotal - finalUnstakeAmount), 0.01), true)

                // MVK Total supply should increase by final unstake amount (sMVK converted to MVK)
                assert.equal(almostEqual(updatedUserTokenBalance, Math.round(initialUserTokenBalance + finalUnstakeAmount), 0.01), true)

                // First User staked balance should reflect decrease in final unstake amount and paid fee, and increase from user rewards
                assert.equal(firstUserUpdatedStakedBalance, Math.floor(firstUserStakedBalance - finalUnstakeAmount - paidFee + calcFirstUserReward))

                // Second User staked balance should reflect decrease in final unstake amount and paid fee, and increase from user rewards
                assert.equal(secondUserUpdatedStakedBalance, Math.floor(secondUserStakedBalance + calcSecondUserReward))

                // check increase in accumulated fees per share from exit fee - may have very very slight differences from large number operations
                assert.equal(almostEqual(updatedAccumulatedFeesPerShare.toNumber(), accumulatedFeesPerShare.toNumber() + calcIncrementAccumulatedFeesPerShareFromExitFee, 0.001), true)
                assert.equal(almostEqual(updatedAccumulatedFeesPerShare.toNumber(), calcUpdatedAccumulatedFeesPerShareFromExitFee, 0.001), true)

                // check both users' participation fees per share to be equal to accumulated fees per share
                assert.equal(firstUserUpdatedParticipationFeesPerShare.toNumber(), updatedAccumulatedFeesPerShare.toNumber())
                assert.equal(secondUserUpdatedParticipationFeesPerShare.toNumber(), updatedAccumulatedFeesPerShare.toNumber())

                // Compound operation for first and second user for subsequent tests
                compoundOperation   = await doormanInstance.methods.compound([firstUser]).send();
                await compoundOperation.confirmation();

                compoundOperation   = await doormanInstance.methods.compound([secondUser]).send();
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
                await signerFactory(tezos, alice.sk);

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
                await signerFactory(tezos, userSk);

                // Initial storage
                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakedRecord.balance.toNumber()
                
                // update operators operation 
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
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

                await signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                

                await signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStakeAmount).send();
                await stakeOperation.confirmation();

                // --------------------------------
                // Unstake and Compound Operation
                // --------------------------------
                
                // first user unstakes some amount - this will add exit fee rewards to second user
                await signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                // update storage
                doormanStorage          = await doormanInstance.storage();

                // get pre-compound staked balance
                secondUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(secondUser);
                secondUserStakedBalance = secondUserStakedRecord === undefined ? 0 : secondUserStakedRecord.balance.toNumber()

                // compound operation to increment rewards for second user
                compoundOperation = await doormanInstance.methods.compound([secondUser]).send();
                await compoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // get post-compound staked balance
                secondUserUpdatedStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                secondUserUpdatedStakedBalance = secondUserUpdatedStakedRecord.balance.toNumber()

                assert.notEqual(secondUserStakedBalance, secondUserUpdatedStakedBalance)

                // todo: add more assertions for checking updated values after compound

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

                await signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStakeAmount).send();
                await stakeOperation.confirmation();
                
                // --------------------------------
                // Unstake and Compound Operation
                // --------------------------------

                // unstake operation
                await signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                // compound operation for third user - should have no rewards
                await signerFactory(tezos, thirdUserSk);
                compoundOperation = await doormanInstance.methods.compound([thirdUser]).send();
                await compoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // Final values
                thirdUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(thirdUser);
                thirdUserStakedBalance = thirdUserStakedRecord.balance.toNumber()

                assert.equal(0, thirdUserStakedBalance)
                // todo: add more assertions


                // Compound for next test
                compoundOperation   = await doormanInstance.methods.compound([firstUser]).send();
                await compoundOperation.confirmation();
                
                compoundOperation   = await doormanInstance.methods.compound([secondUser]).send();
                await compoundOperation.confirmation();
                
                compoundOperation   = await doormanInstance.methods.compound([thirdUser]).send();
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

                await signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                
                await signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStakeAmount).send();
                await stakeOperation.confirmation();
                
                // Refresh values
                doormanStorage              = await doormanInstance.storage()
                firstUserStakedBalance      = await doormanStorage.userStakeBalanceLedger.get(firstUser)
                firstUserUnstakeAmount      = firstUserStakedBalance.balance.toNumber()

                // unstake and compound operations
                await signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                compoundOperation = await doormanInstance.methods.compound([firstUser]).send();
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

        it("user (eve) should not see any duplicate increase in rewards when compounding twice in quick succession", async() => {
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
                
                await signerFactory(tezos, firstUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, firstUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
                updateOperatorsOperation = await updateOperators(mvkTokenInstance, secondUser, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // --------------------------------
                // Stake Operation
                // --------------------------------

                await signerFactory(tezos, firstUserSk);
                stakeOperation = await doormanInstance.methods.stake(firstUserStakeAmount).send();
                await stakeOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
                stakeOperation = await doormanInstance.methods.stake(secondUserStakeAmount).send();
                await stakeOperation.confirmation();
                
                // --------------------------------
                // Unstake and Compound Operation
                // --------------------------------

                await signerFactory(tezos, firstUserSk);
                unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstakeAmount).send();
                await unstakeOperation.confirmation();

                await signerFactory(tezos, secondUserSk);
                compoundOperation = await doormanInstance.methods.compound([secondUser]).send();
                await compoundOperation.confirmation();

                // update storage
                doormanStorage          = await doormanInstance.storage();

                // get pre-compound staked balance
                secondUserStakedRecord  = await doormanStorage.userStakeBalanceLedger.get(secondUser);
                secondUserStakedBalance = secondUserStakedRecord === undefined ? 0 : secondUserStakedRecord.balance.toNumber()

                // compound operation
                compoundOperation = await doormanInstance.methods.compound([secondUser]).send();
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


    describe("%exit", async () => {

        it("user (mallory) should be able to exit the doorman contract and remove all her staked MVK", async() => {

            // Initial values
            user               = mallory.pkh
            userSk             = mallory.sk
            await signerFactory(tezos, userSk);

            // Compound first so values are updated below (for retesting if required)
            compoundOperation   = await doormanInstance.methods.compound([user]).send();
            await compoundOperation.confirmation();
            
            // update storage
            doormanStorage              = await doormanInstance.storage()
            mvkTokenStorage             = await mvkTokenInstance.storage();
            accumulatedFeesPerShare     = doormanStorage.accumulatedFeesPerShare;

            // get initial values
            initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
            initialParticipationFeesPerShare    = initialUserStakedRecord.participationFeesPerShare;
            initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
            initialUserTokenBalance             = await mvkTokenStorage.ledger.get(user)

            // set unstake amount to initial user staked balance for calculation below
            unstakeAmount                        = initialUserStakedBalance;

            // total supply
            initialMvkTotalSupply               = mvkTokenStorage.totalSupply.toNumber()
            initialStakedMvkTotal               = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

            // exit operation
            exitOperation = await doormanInstance.methods.exit().send();
            await exitOperation.confirmation();

            // update storage
            doormanStorage              = await doormanInstance.storage()
            mvkTokenStorage             = await mvkTokenInstance.storage();

            updatedAccumulatedFeesPerShare      = doormanStorage.accumulatedFeesPerShare.toNumber();
            updatedStakedMvkTotal               = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

            // updated values for user
            updatedUserStakedRecord                = await doormanStorage.userStakeBalanceLedger.get(user)
            updatedUserStakedBalance               = updatedUserStakedRecord === undefined ? 0 : updatedUserStakedRecord.balance.toNumber()
            updatedParticipationFeesPerShare       = updatedUserStakedRecord.participationFeesPerShare.toNumber();
            updatedUserTokenBalance                = await mvkTokenStorage.ledger.get(user)

            // Calculate exit fees and final unstake amount
            const mli                   = calculateMavrykLoyaltyIndex(initialStakedMvkTotal, initialMvkTotalSupply);
            const exitFeePercent        = calculateExitFeePercent(mli);
            const paidFeeWithFpa        = Math.trunc( unstakeAmount * (exitFeePercent / 100)); // with fixed point accuracy
            const paidFee               = Math.trunc( paidFeeWithFpa / fixedPointAccuracy);
            finalUnstakeAmount          = unstakeAmount - paidFee;
            
            // check user balances are updated
            assert.equal(updatedUserStakedBalance, 0)
            assert.equal(updatedParticipationFeesPerShare, updatedAccumulatedFeesPerShare)
            assert.equal(updatedUserTokenBalance, +initialUserTokenBalance + +finalUnstakeAmount)

            // check that staked MVK token has decreased by the final unstake amount
            assert.equal(updatedStakedMvkTotal, +initialStakedMvkTotal - +finalUnstakeAmount)
        })

        it("user (mallory) should be able to exit the doorman contract again, but with no rewards earned", async() => {

            // Initial values
            user               = mallory.pkh
            userSk             = mallory.sk
            await signerFactory(tezos, userSk);

            // Compound first so values are updated below (for retesting if required)
            compoundOperation   = await doormanInstance.methods.compound([user]).send();
            await compoundOperation.confirmation();
            
            // update storage
            doormanStorage              = await doormanInstance.storage()
            mvkTokenStorage             = await mvkTokenInstance.storage();
            accumulatedFeesPerShare     = doormanStorage.accumulatedFeesPerShare;

            // get initial values
            initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
            initialParticipationFeesPerShare    = initialUserStakedRecord.participationFeesPerShare;
            initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
            initialUserTokenBalance             = await mvkTokenStorage.ledger.get(user)

            // set unstake amount to initial user staked balance for calculation below
            unstakeAmount                        = initialUserStakedBalance;

            // total supply
            initialMvkTotalSupply               = mvkTokenStorage.totalSupply.toNumber()
            initialStakedMvkTotal               = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

            // exit operation
            exitOperation = await doormanInstance.methods.exit().send();
            await exitOperation.confirmation();

            // update storage
            doormanStorage              = await doormanInstance.storage()
            mvkTokenStorage             = await mvkTokenInstance.storage();

            updatedAccumulatedFeesPerShare      = doormanStorage.accumulatedFeesPerShare.toNumber();
            updatedStakedMvkTotal               = ((await mvkTokenStorage.ledger.get(doormanAddress)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress))).toNumber();

            // updated values for user
            updatedUserStakedRecord                = await doormanStorage.userStakeBalanceLedger.get(user)
            updatedUserStakedBalance               = updatedUserStakedRecord === undefined ? 0 : updatedUserStakedRecord.balance.toNumber()
            updatedParticipationFeesPerShare       = updatedUserStakedRecord.participationFeesPerShare.toNumber();
            updatedUserTokenBalance                = await mvkTokenStorage.ledger.get(user)

            // Calculate exit fees and final unstake amount
            const mli                   = calculateMavrykLoyaltyIndex(initialStakedMvkTotal, initialMvkTotalSupply);
            const exitFeePercent        = calculateExitFeePercent(mli);
            const paidFeeWithFpa        = Math.trunc( unstakeAmount * (exitFeePercent / 100)); // with fixed point accuracy
            const paidFee               = Math.trunc( paidFeeWithFpa / fixedPointAccuracy);
            finalUnstakeAmount          = unstakeAmount - paidFee;
            
            // check user balances are updated
            assert.equal(updatedUserStakedBalance, 0)
            assert.equal(updatedParticipationFeesPerShare, updatedAccumulatedFeesPerShare)
            assert.equal(updatedUserTokenBalance, +initialUserTokenBalance + +finalUnstakeAmount)

            // check that staked MVK token has decreased by the final unstake amount
            assert.equal(updatedStakedMvkTotal, +initialStakedMvkTotal - +finalUnstakeAmount)
        })

    })


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            doormanStorage        = await doormanInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                doormanStorage     = await doormanInstance.storage();
                const currentAdmin = doormanStorage.admin;
                assert.strictEqual(currentAdmin, admin);

                // Operation
                setAdminOperation = await doormanInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                doormanStorage   = await doormanInstance.storage();
                const newAdmin = doormanStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                
                // reset admin
                await signerFactory(tezos, alice.sk);
                resetAdminOperation = await doormanInstance.methods.setAdmin(admin).send();
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

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
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
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(doormanInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(doormanInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
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

                initialContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, adminSk);
                mistakenTransferOperation = await mistakenTransferFa2Token(doormanInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - admin (bob) should not be able to call this entrypoint to transfer MVK tokens (protected for doorman contract)', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mvkTokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const initialUserBalance    = (await mvkTokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, adminSk);
                mistakenTransferOperation = await mistakenTransferFa2Token(doormanInstance, user, mvkTokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

                mvkTokenStorage             = await mvkTokenInstance.storage();
                const updatedUserBalance    = (await mvkTokenStorage.ledger.get(user)).toNumber();

                // no change in balance
                assert.equal(updatedUserBalance, initialUserBalance);

            } catch (e) {
                console.log(e)
            }
        })

        it("%migrateFunds             - admin (bob) should be able to migrate the Doorman contract MVK funds only when all entrypoints are paused", async() => {
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
                await signerFactory(tezos, alice.sk)
                transferOperation = await fa2Transfer(mvkTokenInstance, alice.pkh, doormanAddress, tokenId, initDoormanBalance.toNumber());
                await transferOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%migrateFunds             - admin (bob) should not be able to migrate the Doorman contract (and move MVK funds) if any contract entrypoint is unpaused", async() => {
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


        it("%pauseAll                 - admin (bob) should be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = await doormanInstance.methods.pauseAll().send(); 
                await pauseAllOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - admin (bob) should be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = await doormanInstance.methods.unpauseAll().send(); 
                await unpauseAllOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("stake", true).send(); 
                await pauseOperation.confirmation();
                
                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("unstake", true).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("exit", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("compound", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("farmClaim", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("onVaultDepositStake", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("onVaultWithdrawStake", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await doormanInstance.methods.togglePauseEntrypoint("onVaultLiquidateStake", true).send();
                await pauseOperation.confirmation();

                // update storage
                doormanStorage = await doormanInstance.storage();

                // check that entrypoints are paused
                assert.equal(doormanStorage.breakGlassConfig.stakeIsPaused                  , true)
                assert.equal(doormanStorage.breakGlassConfig.unstakeIsPaused                , true)
                assert.equal(doormanStorage.breakGlassConfig.exitIsPaused                   , true)
                assert.equal(doormanStorage.breakGlassConfig.compoundIsPaused               , true)
                assert.equal(doormanStorage.breakGlassConfig.farmClaimIsPaused              , true)
                assert.equal(doormanStorage.breakGlassConfig.onVaultDepositStakeIsPaused    , true)
                assert.equal(doormanStorage.breakGlassConfig.onVaultWithdrawStakeIsPaused   , true)
                assert.equal(doormanStorage.breakGlassConfig.onVaultLiquidateStakeIsPaused  , true)

                // unpause operations

                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("stake", false).send();
                await unpauseOperation.confirmation();
                
                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("unstake", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("exit", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("compound", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("farmClaim", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("onVaultDepositStake", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("onVaultWithdrawStake", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await doormanInstance.methods.togglePauseEntrypoint("onVaultLiquidateStake", false).send();
                await unpauseOperation.confirmation();

                // update storage
                doormanStorage = await doormanInstance.storage();

                // check that entrypoints are unpaused
                assert.equal(doormanStorage.breakGlassConfig.stakeIsPaused                  , false)
                assert.equal(doormanStorage.breakGlassConfig.unstakeIsPaused                , false)
                assert.equal(doormanStorage.breakGlassConfig.exitIsPaused                   , false)
                assert.equal(doormanStorage.breakGlassConfig.compoundIsPaused               , false)
                assert.equal(doormanStorage.breakGlassConfig.farmClaimIsPaused              , false)
                assert.equal(doormanStorage.breakGlassConfig.onVaultDepositStakeIsPaused    , false)
                assert.equal(doormanStorage.breakGlassConfig.onVaultWithdrawStakeIsPaused   , false)
                assert.equal(doormanStorage.breakGlassConfig.onVaultLiquidateStakeIsPaused  , false)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                doormanStorage      = await doormanInstance.storage();
                const currentAdmin  = doormanStorage.admin;

                // Operation
                setAdminOperation = await doormanInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                doormanStorage    = await doormanInstance.storage();
                const newAdmin    = doormanStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                doormanStorage           = await doormanInstance.storage();
                const currentGovernance  = doormanStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await doormanInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                doormanStorage           = await doormanInstance.storage();
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

        it('%updateConfig             - non-admin (mallory) should not be able to update contract config', async () => {
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
                contractMapKey  = mallory.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await doormanInstance.methods.updateWhitelistContracts(contractMapKey, "update")
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await doormanInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, "update")
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                doormanStorage          = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                user = mallory.pkh;
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to MVK Token Contract
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(doormanInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it("%migrateFunds             - non-admin (mallory) should not be able to migrate the Doorman contract MVK funds", async() => {
            try{
                
                const destination = alice.pkh;
                
                // migrate operation
                migrateOperation = doormanInstance.methods.migrateFunds(destination); 
                await chai.expect(migrateOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%pauseAll                 - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = doormanInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = doormanInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = doormanInstance.methods.togglePauseEntrypoint("stake", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = doormanInstance.methods.togglePauseEntrypoint("unstake", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = doormanInstance.methods.togglePauseEntrypoint("exit", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = doormanInstance.methods.togglePauseEntrypoint("compound", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = doormanInstance.methods.togglePauseEntrypoint("farmClaim", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = doormanInstance.methods.togglePauseEntrypoint("onVaultDepositStake", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = doormanInstance.methods.togglePauseEntrypoint("onVaultWithdrawStake", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = doormanInstance.methods.togglePauseEntrypoint("onVaultLiquidateStake", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                unpauseOperation = doormanInstance.methods.togglePauseEntrypoint("stake", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;
                
                unpauseOperation = doormanInstance.methods.togglePauseEntrypoint("unstake", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = doormanInstance.methods.togglePauseEntrypoint("exit", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = doormanInstance.methods.togglePauseEntrypoint("compound", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = doormanInstance.methods.togglePauseEntrypoint("farmClaim", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = doormanInstance.methods.togglePauseEntrypoint("onVaultDepositStake", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = doormanInstance.methods.togglePauseEntrypoint("onVaultWithdrawStake", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = doormanInstance.methods.togglePauseEntrypoint("onVaultLiquidateStake", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = doormanInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
