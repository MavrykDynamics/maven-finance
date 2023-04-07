import { Utils } from "./helpers/Utils";

const chai = require("chai");
const assert = require("chai").assert;
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

import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Farm Contract", async () => {

    var utils: Utils;
    let tezos

    let user 
    let userSk
    let tokenId = 0

    let mavrykFa2TokenAddress
    let mavrykFa2TokenInstance
    let mavrykFa2TokenStorage

    let farmAddress
    let farmFactoryAddress
    let mvkTokenAddress
    let lpTokenAddress 
    let doormanAddress
    let treasuryAddress

    let farmInstance;
    let farmStorage;

    let mvkTokenInstance;
    let mvkTokenStorage;

    let lpTokenInstance;
    let lpTokenStorage;

    let farmFactoryInstance;
    let farmFactoryStorage;

    let treasuryInstance;
    let treasuryStorage;

    let doormanInstance;
    let doormanStorage;

    let transferOperation

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
        tezos = utils.tezos

        farmAddress             = contractDeployments.farm.address;
        farmFactoryAddress      = contractDeployments.farmFactory.address;
        mvkTokenAddress         = contractDeployments.mvkToken.address;
        lpTokenAddress          = contractDeployments.mavrykFa12Token.address;
        treasuryAddress         = contractDeployments.treasury.address;
        doormanAddress          = contractDeployments.doorman.address;
        
        farmInstance            = await utils.tezos.contract.at(farmAddress);
        farmFactoryInstance     = await utils.tezos.contract.at(farmFactoryAddress);
        mvkTokenInstance        = await utils.tezos.contract.at(mvkTokenAddress);
        lpTokenInstance         = await utils.tezos.contract.at(lpTokenAddress);
        treasuryInstance        = await utils.tezos.contract.at(treasuryAddress);
        doormanInstance         = await utils.tezos.contract.at(doormanAddress);

        farmStorage             = await farmInstance.storage();
        farmFactoryStorage      = await farmFactoryInstance.storage();
        mvkTokenStorage         = await mvkTokenInstance.storage();
        lpTokenStorage          = await lpTokenInstance.storage();
        treasuryStorage         = await treasuryInstance.storage();
        doormanStorage          = await doormanInstance.storage();

        // for mistaken transfers
        mavrykFa2TokenAddress   = contractDeployments.mavrykFa2Token.address 
        mavrykFa2TokenInstance  = await utils.tezos.contract.at(mavrykFa2TokenAddress);
        mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();

        // Make farm factory track the farm
        if(!farmFactoryStorage.trackedFarms.includes(farmAddress)){
            const trackOperation = await farmFactoryInstance.methods.trackFarm(farmAddress).send();
            await trackOperation.confirmation();
        }
    });

    beforeEach("storage", async () => {
        farmStorage = await farmInstance.storage();
        farmFactoryStorage = await farmFactoryInstance.storage();
        mvkTokenStorage = await mvkTokenInstance.storage();
        lpTokenStorage = await lpTokenInstance.storage();

        await helperFunctions.signerFactory(tezos, bob.sk)
    })

    describe("Non-initialized farm", function() {

        describe("%deposit", function() {
            it('User should not be able to deposit in a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();

                    const farmInit          = farmStorage.init;
                    const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress);
                    const amountToDeposit   = 6;
    
                    // Approval operation
                    if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
                        const approvals         = lpAllowances === undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }
    
                    // Operation
                    await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;

                    // Assertion
                    assert.equal(farmInit, false);
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%withdraw", function() {
            it('User should not be able to withdraw from a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const farmInit          = farmStorage.init;
                    const amountToWithdraw  = 1;
    
                    // Operation
                    await chai.expect(farmInstance.methods.withdraw(amountToWithdraw).send()).to.be.rejected;

                    // Assertion
                    assert.equal(farmInit, false);
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%claim", function() {
            it('User should not be able to claim in a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const farmInit          = farmStorage.init;
    
                    // Operation
                    await chai.expect(farmInstance.methods.claim(bob.pkh).send()).to.be.rejected;

                    // Assertion
                    assert.equal(farmInit, false);
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
        })

    })

    describe("Initialized farm", function() {
        describe('%setAdmin', function() {
            it('Admin should be able to set a new admin', async() => {
                try{
                    // Initial values
                    const previousAdmin = farmStorage.admin;

                    // Create a transaction for initiating a farm
                    const operation = await farmInstance.methods.setAdmin(alice.pkh).send();
                    await operation.confirmation();

                    // Final values
                    farmStorage = await farmInstance.storage();

                    // Assertion
                    assert.strictEqual(farmStorage.admin,alice.pkh);
                    assert.strictEqual(previousAdmin,bob.pkh);

                    // Reset admin
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    const resetOperation = await farmInstance.methods.setAdmin(bob.pkh).send();
                    await resetOperation.confirmation();
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to set a new admin', async() => {
                try{
                    // Create a transaction for initiating a farm
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    const operation = farmInstance.methods.setAdmin(bob.pkh);
                    await chai.expect(operation.send()).to.be.rejected;

                    // Final values
                    farmStorage = await farmInstance.storage();

                    // Assertion
                    assert.strictEqual(farmStorage.admin,bob.pkh)
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe('%initFarm', function() {
            it('User should not be able to initialize a farm', async () => {
                try{
                    // Switch signer to Alice
                    await helperFunctions.signerFactory(tezos, alice.sk);

                    // Operation
                    await chai.expect(farmInstance.methods.initFarm(
                        12000,
                        100,
                        false,
                        false
                    ).send()).to.be.rejected;

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Admin should not be able to initialize without a proper duration', async () => {
                try{
                    // Operation
                    await chai.expect(farmInstance.methods.initFarm(
                        0,
                        100,
                        false,
                        false
                    ).send()).to.be.rejected;

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Admin should be able to initialize a farm', async () => {
                try{
                    // Operation
                    const operation = await farmInstance.methods.initFarm(
                        12000,
                        100,
                        false,
                        false
                    ).send();
                    await operation.confirmation()

                    // Final values
                    farmStorage    = await farmInstance.storage();
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())

                    // Assertions
                    assert.equal(farmStorage.open, true);
                    assert.equal(farmStorage.init, true);
                    assert.equal(farmStorage.config.plannedRewards.totalBlocks, 12000);
                    assert.equal(farmStorage.config.plannedRewards.currentRewardPerBlock, 100);

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Admin should not be able to initialize the same farm twice', async () => {
                try{
                    // Operation
                    await chai.expect(farmInstance.methods.initFarm(
                        12000,
                        100,
                        false,
                        false
                    ).send()).to.be.rejected;
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

        describe('%deposit', function() {
            it('User should be able to deposit LP Tokens into a farm', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalance         = lpLedgerStart.balance.toNumber();
                    const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress);
                    
                    const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalance    = depositRecord===undefined ? 0 : depositRecord.balance.toNumber();
                    
                    const amountToDeposit   = 6;

                    // Approval operation
                    if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
                        const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }

                    // Operation
                    const depositOperation          = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalanceEnd = depositRecordEnd===undefined ? 0 : depositRecordEnd.balance.toNumber();
                    const lpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalanceEnd      = lpLedgerEnd.balance.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance + amountToDeposit);
                    assert.equal(lpBalanceEnd, lpBalance - amountToDeposit);
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not be able to able to deposit more LP Tokens than it has', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress);
                    const lpBalance         = lpLedgerStart===undefined ? 0 : lpLedgerStart.balance.toNumber();
                    const amountToDeposit   = lpBalance + 1;

                    // Approval operation
                    if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
                        const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }

                    // Operation
                    await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                } 
            })

            it('Multiple users should be able to deposit in a farm', async () => {
                try{
                    // Initial values
                    lpTokenStorage                  = await lpTokenInstance.storage();
                    farmStorage                     = await farmInstance.storage();
                    
                    const firstLpLedgerStart        = await lpTokenStorage.ledger.get(bob.pkh);
                    const firstLpBalance            = firstLpLedgerStart.balance.toNumber();
                    const firstLpAllowances         = await firstLpLedgerStart.allowances.get(farmAddress);
                    
                    const firstDepositRecord        = await farmStorage.depositorLedger.get(bob.pkh);
                    const firstDepositBalance       = firstDepositRecord===undefined ? 0 : firstDepositRecord.balance.toNumber();
                    
                    const firstAmountToDeposit      = 10;
                    
                    const secondLpLedgerStart       = await lpTokenStorage.ledger.get(alice.pkh);
                    const secondLpBalance           = secondLpLedgerStart.balance.toNumber();
                    const secondLpAllowances        = await secondLpLedgerStart.allowances.get(farmAddress);
                    
                    const secondDepositRecord       = await farmStorage.depositorLedger.get(alice.pkh);
                    const secondDepositBalance      = secondDepositRecord===undefined ? 0 : secondDepositRecord.balance.toNumber();
                    
                    const secondAmountToDeposit     = 8;

                    // Approval operations
                    if(firstLpAllowances===undefined || firstLpAllowances.toNumber()<=0){
                        await helperFunctions.signerFactory(tezos, bob.sk)
                        const approvals         = firstLpAllowances===undefined ? firstAmountToDeposit : Math.abs(firstLpAllowances.toNumber() - firstAmountToDeposit);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }
                    if(secondLpAllowances===undefined || secondLpAllowances.toNumber()<=0){
                        await helperFunctions.signerFactory(tezos, alice.sk)
                        const approvals         = secondLpAllowances===undefined ? secondAmountToDeposit : Math.abs(secondLpAllowances.toNumber() - secondAmountToDeposit);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }

                    // const bobDepositParam        = await farmInstance.methods.deposit(firstAmountToDeposit).toTransferParams();
                    // const bobEstimate            = await utils.tezos.estimate.transfer(bobDepositParam);
                    // console.log("BOB FARM DEPOSIT ESTIMATION: ", bobEstimate);

                    // await helperFunctions.signerFactory(tezos, alice.sk)
                    // const aliceDepositParam        = await farmInstance.methods.deposit(secondAmountToDeposit).toTransferParams();
                    // const aliceEstimate            = await utils.tezos.estimate.transfer(aliceDepositParam);
                    // console.log("ALICE FARM DEPOSIT ESTIMATION: ", aliceEstimate);


                    // Operations
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    var depositOperation        = await farmInstance.methods.deposit(firstAmountToDeposit).send();
                    await depositOperation.confirmation();
                    
                    await helperFunctions.signerFactory(tezos, alice.sk)
                    var depositOperation        = await farmInstance.methods.deposit(secondAmountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    farmStorage = await farmInstance.storage();
                    const firstDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
                    const firstDepositBalanceEnd    = firstDepositRecordEnd===undefined ? 0 : firstDepositRecordEnd.balance.toNumber();
                    const firstLpLedgerEnd          = await lpTokenStorage.ledger.get(bob.pkh);
                    const firstLpBalanceEnd         = firstLpLedgerEnd.balance.toNumber();
                    const secondDepositRecordEnd    = await farmStorage.depositorLedger.get(alice.pkh);
                    const secondDepositBalanceEnd   = secondDepositRecordEnd===undefined ? 0 : secondDepositRecordEnd.balance.toNumber();
                    const secondLpLedgerEnd         = await lpTokenStorage.ledger.get(alice.pkh);
                    const secondLpBalanceEnd        = secondLpLedgerEnd.balance.toNumber();

                    // Assertions
                    assert.equal(firstDepositBalanceEnd, firstDepositBalance + firstAmountToDeposit);
                    assert.equal(firstLpBalanceEnd, firstLpBalance - firstAmountToDeposit);
                    assert.equal(secondDepositBalanceEnd, secondDepositBalance + secondAmountToDeposit);
                    assert.equal(secondLpBalanceEnd, secondLpBalance - secondAmountToDeposit);
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe('%withdraw', function() {
            it('User should be able to withdraw LP Tokens from a farm', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalance         = lpLedgerStart.balance.toNumber();
                    const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalance    = depositRecord===undefined ? 0 : depositRecord.balance.toNumber();
                    const amountToWithdraw  = 1;

                    // const bobWithdrawParam        = await farmInstance.methods.withdraw(amountToWithdraw).toTransferParams();
                    // const bobEstimate            = await utils.tezos.estimate.transfer(bobWithdrawParam);
                    // console.log("BOB Withdraw Farm ESTIMATION: ", bobEstimate);

                    // Operation
                    const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalanceEnd = depositRecordEnd===undefined ? 0 : depositRecordEnd.balance.toNumber();
                    const lpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalanceEnd      = lpLedgerEnd.balance.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance - amountToWithdraw);
                    assert.equal(lpBalanceEnd, lpBalance + amountToWithdraw);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not be able to withdraw LP Tokens from a farm if it never deposited into it', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const amountToWithdraw  = 1;

                    // Operation
                    await chai.expect(farmInstance.methods.withdraw(amountToWithdraw).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not be able to withdraw more LP Tokens than it deposited', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalance         = lpLedgerStart.balance.toNumber();

                    const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalance    = depositRecord===undefined ? 0 : depositRecord.balance.toNumber();
                    
                    const excessAmount      = 100;
                    const amountToWithdraw  = depositBalance + excessAmount;

                    // Operation
                    const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalanceEnd = depositRecordEnd===undefined ? 0 : depositRecordEnd.balance.toNumber();
                    
                    const lpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalanceEnd      = lpLedgerEnd.balance.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance - depositBalance);
                    assert.equal(lpBalanceEnd, lpBalance + amountToWithdraw - excessAmount);

                    // reset - deposit some lpToken into farm again for subsequent tests

                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const lpLedger          = await lpTokenStorage.ledger.get(bob.pkh);
                    // const resetLpBalance    = lpLedger.balance.toNumber();
                    const lpAllowances      = await lpLedger.allowances.get(farmAddress);
                    
                    // const resetDepositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    // const resetDepositBalance    = resetDepositRecord===undefined ? 0 : resetDepositRecord.balance.toNumber();
                    
                    const amountToDeposit   = 10;

                    // Approval operation
                    if(lpAllowances === undefined || lpAllowances.toNumber() <= amountToDeposit){
                        const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }

                    // Operation
                    const depositOperation          = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Multiple users should be able to withdraw tokens', async () => {
                try{
                    // Initial values
                    lpTokenStorage                  = await lpTokenInstance.storage();
                    farmStorage                     = await farmInstance.storage();
                    
                    const firstLpLedgerStart        = await lpTokenStorage.ledger.get(bob.pkh);
                    const firstLpBalance            = firstLpLedgerStart.balance.toNumber();
                    
                    const firstDepositRecord        = await farmStorage.depositorLedger.get(bob.pkh);
                    const firstDepositBalance       = firstDepositRecord === undefined ? 0 : firstDepositRecord.balance.toNumber();
                    
                    const firstAmountToWithdraw     = 2;
                    
                    const secondLpLedgerStart       = await lpTokenStorage.ledger.get(alice.pkh);
                    const secondLpBalance           = secondLpLedgerStart.balance.toNumber();
                    
                    const secondDepositRecord       = await farmStorage.depositorLedger.get(alice.pkh);
                    const secondDepositBalance      = secondDepositRecord===undefined ? 0 : secondDepositRecord.balance.toNumber();
                    
                    const secondAmountToWithdraw    = 4;

                    // Operations
                    await helperFunctions.signerFactory(tezos, alice.sk)
                    var withdrawOperation            = await farmInstance.methods.withdraw(secondAmountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, bob.sk)
                    var withdrawOperation            = await farmInstance.methods.withdraw(firstAmountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    lpTokenStorage                  = await lpTokenInstance.storage();
                    
                    const firstDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
                    const firstDepositBalanceEnd    = firstDepositRecordEnd===undefined ? 0 : firstDepositRecordEnd.balance.toNumber();
                    
                    const firstLpLedgerEnd          = await lpTokenStorage.ledger.get(bob.pkh);
                    const firstLpBalanceEnd         = firstLpLedgerEnd.balance.toNumber();
                    
                    const secondDepositRecordEnd    = await farmStorage.depositorLedger.get(alice.pkh);
                    const secondDepositBalanceEnd   = secondDepositRecordEnd===undefined ? 0 : secondDepositRecordEnd.balance.toNumber();
                    
                    const secondLpLedgerEnd         = await lpTokenStorage.ledger.get(alice.pkh);
                    const secondLpBalanceEnd        = secondLpLedgerEnd.balance.toNumber();

                    // Assertions
                    assert.equal(firstDepositBalanceEnd, firstDepositBalance - firstAmountToWithdraw);
                    assert.equal(firstLpBalanceEnd, firstLpBalance + firstAmountToWithdraw);
                    assert.equal(secondDepositBalanceEnd, secondDepositBalance - secondAmountToWithdraw);
                    assert.equal(secondLpBalanceEnd, secondLpBalance + secondAmountToWithdraw);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        });



        describe('%claim', function() {
            it('User should not be able to claim in a farm if it never deposited into it', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();

                    // Operation
                    await chai.expect(farmInstance.methods.claim(eve.pkh).send()).to.be.rejected;
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('User should not be able to claim in a farm if it has no rewards to claim', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, mallory.sk);
                    lpTokenStorage              = await lpTokenInstance.storage();
                    farmStorage                 = await farmInstance.storage();
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operations
                    await helperFunctions.wait(4 * blockTime * 1000);
                    // const firstClaimOperation   = await farmInstance.methods.claim(mallory.pkh).send();
                    // await firstClaimOperation.confirmation();
                    await chai.expect(farmInstance.methods.claim(mallory.pkh).send()).to.be.rejected;

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to claim rewards from a farm', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operations
                    await helperFunctions.wait(10 * blockTime * 1000);
                    const firstClaimOperation   = await farmInstance.methods.claim(bob.pkh).send();
                    await firstClaimOperation.confirmation();

                    // Final values
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalanceEnd    = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

                    // Assertions
                    assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)
                    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to withdraw all its LP Tokens then claim the remaining rewards', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    lpTokenStorage              = await lpTokenInstance.storage();
                    
                    const userLpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const userLpBalance         = userLpLedgerStart.balance.toNumber();
                    
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()

                    const userDepositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    const userDepositBalance    = userDepositRecord === undefined ? 0 : userDepositRecord.balance.toNumber();

                    console.log(userDepositRecord);
                    console.log(`userDepositBalance: ${userDepositBalance}`);
                    
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operations
                    await helperFunctions.wait(10 * blockTime * 1000);
                    const withdrawOperation     = await farmInstance.methods.withdraw(userDepositBalance).send();
                    await withdrawOperation.confirmation();

                    const firstClaimOperation   = await farmInstance.methods.claim(bob.pkh).send();
                    await firstClaimOperation.confirmation();

                    // Final values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    lpTokenStorage              = await lpTokenInstance.storage();

                    const userDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
                    const userDepositBalanceEnd    = userDepositRecordEnd===undefined ? 0 : userDepositRecordEnd.balance.toNumber();

                    console.log(userDepositRecordEnd);
                    console.log(`userDepositBalanceEnd: ${userDepositBalanceEnd}`);
                    
                    const userLpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
                    const userLpBalanceEnd      = userLpLedgerEnd.balance.toNumber();
                    
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalanceEnd    = userSMVKLedgerEnd.balance.toNumber()

                    // Assertions
                    assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)
                    assert.notEqual(userLpBalanceEnd, userLpBalance)
                    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%togglePauseEntrypoint", async () => {
            
            beforeEach("Set signer to admin", async () => {
                await helperFunctions.signerFactory(tezos, bob.sk)
            });

            it('Admin should be able to call the entrypoint and pause/unpause the deposit entrypoint', async () => {
                try{
                    // Initial Values
                    farmStorage         = await farmInstance.storage();
                    const initState     = farmStorage.breakGlassConfig.depositIsPaused;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("deposit", true).send();
                    await pauseOperation.confirmation();

                    // Mid values
                    farmStorage         = await farmInstance.storage();
                    const midState      = farmStorage.breakGlassConfig.depositIsPaused;
                    const lpLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpAllowances  = await lpLedgerStart.allowances.get(farmAddress);
                    const testAmount    = 1;

                    // Test operation
                    if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
                        const approvals         = lpAllowances===undefined ? testAmount : Math.abs(lpAllowances.toNumber() - testAmount);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }
                    await chai.expect(farmInstance.methods.deposit(testAmount).send()).to.be.rejected;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("deposit", false).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmStorage         = await farmInstance.storage();
                    const endState      = farmStorage.breakGlassConfig.depositIsPaused;

                    // Test operation
                    if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
                        const approvals         = lpAllowances===undefined ? testAmount : Math.abs(lpAllowances.toNumber() - testAmount);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }
                    const testOperation = await farmInstance.methods.deposit(testAmount).send();
                    await testOperation.confirmation();

                    // Assertions
                    assert.equal(initState, false)
                    assert.equal(midState, true)
                    assert.equal(endState, false)

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Admin should be able to call the entrypoint and pause/unpause the withdraw entrypoint', async () => {
                try{
                    // Initial Values
                    farmStorage         = await farmInstance.storage();
                    const initState     = farmStorage.breakGlassConfig.withdrawIsPaused;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("withdraw", true).send();
                    await pauseOperation.confirmation();

                    // Mid values
                    farmStorage         = await farmInstance.storage();
                    const midState      = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const testAmount    = 1;

                    // Test operation
                    await chai.expect(farmInstance.methods.withdraw(testAmount).send()).to.be.rejected;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("withdraw", false).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmStorage         = await farmInstance.storage();
                    const endState      = farmStorage.breakGlassConfig.withdrawIsPaused;

                    // Test operation
                    const testOperation = await farmInstance.methods.withdraw(testAmount).send();
                    await testOperation.confirmation();

                    // Assertions
                    assert.equal(initState, false)
                    assert.equal(midState, true)
                    assert.equal(endState, false)

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Admin should be able to call the entrypoint and pause/unpause the claim entrypoint', async () => {
                try{
                    // Initial Values
                    farmStorage         = await farmInstance.storage();
                    const initState     = farmStorage.breakGlassConfig.claimIsPaused;
                    const blockTime     = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("claim", true).send();
                    await pauseOperation.confirmation();

                    // Mid values
                    farmStorage         = await farmInstance.storage();
                    const midState      = farmStorage.breakGlassConfig.claimIsPaused;

                    // Test operation
                    await helperFunctions.wait(4 * blockTime * 1000);
                    await chai.expect(farmInstance.methods.claim(bob.pkh).send()).to.be.rejected;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("claim", false).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmStorage         = await farmInstance.storage();
                    const endState      = farmStorage.breakGlassConfig.claimIsPaused;

                    // Test operation
                    await helperFunctions.wait(4 * blockTime * 1000);
                    const testOperation = await farmInstance.methods.claim(bob.pkh).send();
                    await testOperation.confirmation();

                    // Assertions
                    assert.equal(initState, false)
                    assert.equal(midState, true)
                    assert.equal(endState, false)

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Non-admin should not be able to call the entrypoint', async () => {
                try{
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(farmInstance.methods.togglePauseEntrypoint("deposit", true).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe('%updateConfig', function() {

            it('Admin should be able to force the rewards to come from transfers instead of minting', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    mvkTokenStorage         = await mvkTokenInstance.storage();
                    
                    const mvkTotalSupply    = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupply   = await mvkTokenStorage.ledger.get(doormanAddress);
                    
                    const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress);

                    const userDepositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    const userDepositBalance    = userDepositRecord===undefined ? 0 : userDepositRecord.balance.toNumber();
                    console.log(userDepositRecord);
                    
                    const toggleTransfer    = farmStorage.config.forceRewardFromTransfer;
                    const blockTime         = farmStorage.minBlockTimeSnapshot.toNumber();
                    const amountToDeposit   = 10;

                    // Approval operation
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    if(lpAllowances === undefined || lpAllowances.toNumber()<=0){
                        const approvals         = lpAllowances === undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                        console.log(`approval amount: ${approvals}`);
                    }

                    // Operation - deposit amount so user balance will be greater than zero
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    const depositOperation  = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Wait at least one block before claiming rewards
                    await helperFunctions.wait(12 * blockTime * 1000);

                    farmStorage                    = await farmInstance.storage();
                    const userDepositRecordMid     = await farmStorage.depositorLedger.get(bob.pkh);
                    const userDepositBalanceMid    = userDepositRecordMid === undefined ? 0 : userDepositRecordMid.balance.toNumber();
                    console.log(userDepositRecordMid);

                    // First claim operation - sMVK rewards should be minted (hence increase in sMVK total supply)
                    var claimOperation  = await farmInstance.methods.claim(bob.pkh).send();
                    await claimOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, bob.sk);
                    farmStorage                    = await farmInstance.storage();
                    const userDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
                    const userDepositBalanceEnd    = userDepositRecordEnd===undefined ? 0 : userDepositRecordEnd.balance.toNumber();
                    console.log(userDepositRecordEnd);

                    // Updated values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const mvkTotalSupplyFirstUpdate     = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupplyFirstUpdate    = (await mvkTokenStorage.ledger.get(doormanAddress)).toNumber();
                    const treasuryFirstUpdate           = (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber();

                    // Operation - set forceRewardFromTransfer to TRUE
                    const firstToggleOperation      = await farmInstance.methods.updateConfig(1, "configForceRewardFromTransfer").send();
                    await firstToggleOperation.confirmation();

                    // Updated values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    farmStorage                     = await farmInstance.storage();
                    const toggleTransferFirstUpdate = farmStorage.config.forceRewardFromTransfer;

                    // Do another claim - sMVK rewards should be transferred from Farm Treasury
                    await helperFunctions.wait(12 * blockTime * 1000);
                    claimOperation = await farmInstance.methods.claim(bob.pkh).send();
                    await claimOperation.confirmation();

                    // Updated values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const mvkTotalSupplySecondUpdate    = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupplySecondUpdate   = (await mvkTokenStorage.ledger.get(doormanAddress)).toNumber();
                    const treasurySecondUpdate          = (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber();

                    // Toggle back to mint  
                    const secondToggleOperation = await farmInstance.methods.updateConfig(0, "configForceRewardFromTransfer").send();
                    await secondToggleOperation.confirmation();

                    // Updated values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    farmStorage = await farmInstance.storage();
                    const toggleTransferSecondUpdate = farmStorage.config.forceRewardFromTransfer;

                    //Do another claim
                    await helperFunctions.wait(12 * blockTime * 1000);
                    claimOperation = await farmInstance.methods.claim(bob.pkh).send();
                    await claimOperation.confirmation();

                    // Updated values
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const mvkTotalSupplyThirdUpdate     = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupplyThirdUpdate    = (await mvkTokenStorage.ledger.get(doormanAddress)).toNumber();
                    const treasuryThirdUpdate           = (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber();

                    // Assertions
                    assert.notEqual(mvkTotalSupply,mvkTotalSupplyFirstUpdate);
                    assert.equal(mvkTotalSupplySecondUpdate,mvkTotalSupplyFirstUpdate);
                    assert.notEqual(mvkTotalSupplySecondUpdate,mvkTotalSupplyThirdUpdate);

                    assert.notEqual(toggleTransferFirstUpdate,toggleTransfer);
                    assert.equal(toggleTransfer,toggleTransferSecondUpdate);

                    assert.notEqual(smvkTotalSupply,smvkTotalSupplyFirstUpdate);
                    assert.notEqual(smvkTotalSupply,smvkTotalSupplySecondUpdate);
                    assert.notEqual(smvkTotalSupplyFirstUpdate,smvkTotalSupplySecondUpdate);
                    assert.notEqual(smvkTotalSupplySecondUpdate,smvkTotalSupplyThirdUpdate);

                    console.log("MVK total supply at beginning: ",mvkTotalSupply)
                    console.log("MVK total supply after first mint: ",mvkTotalSupplyFirstUpdate)
                    console.log("MVK total supply after transfer: ",mvkTotalSupplySecondUpdate)
                    console.log("MVK total supply after second mint: ",mvkTotalSupplyThirdUpdate)
                    console.log("Transfer forced after first toggling: ",toggleTransferFirstUpdate)
                    console.log("Transfer forced after second toggling: ",toggleTransferSecondUpdate)
                    console.log("SMVK total supply after first mint: ", smvkTotalSupplyFirstUpdate)
                    console.log("SMVK total supply after transfer: ", smvkTotalSupplySecondUpdate)
                    console.log("SMVK total supply after second mint: ", smvkTotalSupplyThirdUpdate)
                    console.log("Treasury after first mint: ",treasuryFirstUpdate)
                    console.log("Treasury after transfer: ",treasurySecondUpdate)
                    console.log("Treasury after second mint: ",treasuryThirdUpdate)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Admin should be able to increase the rewards of a farm', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    farmStorage                     = await farmInstance.storage();
                    const currentTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
                    const currentRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();
                    const newRewards                = 150;

                    // Operation
                    const operation = await farmInstance.methods.updateConfig(newRewards, "configRewardPerBlock").send();
                    await operation.confirmation()

                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const updatedTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
                    const updatedRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();

                    // Assertions
                    assert.equal(updatedRewardsPerBlock, newRewards);
                    assert.equal(updatedRewardsPerBlock > currentRewardsPerBlock, true);
                    assert.notEqual(currentRewardsPerBlock, updatedRewardsPerBlock);
                    assert.notEqual(currentTotalRewards, updatedTotalRewards);

                    // Logs
                    // console.log("Initial :")
                    // console.log("  Total rewards:", currentTotalRewards)
                    // console.log("  Rewards per block:", currentRewardsPerBlock)
                    // console.log("Updated :")
                    // console.log("  Total rewards:", updatedTotalRewards)
                    // console.log("  Rewards per block:", updatedRewardsPerBlock)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Admin should be able to decrease the rewards of a farm', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    farmStorage                     = await farmInstance.storage();
                    const currentTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
                    const currentRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();
                    const newRewards                = 120;

                    // Operation
                    const operation = await farmInstance.methods.updateConfig(newRewards, "configRewardPerBlock").send();
                    await operation.confirmation()

                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const updatedTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
                    const updatedRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();

                    // Assertions
                    assert.equal(updatedRewardsPerBlock, newRewards);
                    assert.equal(updatedRewardsPerBlock > currentRewardsPerBlock, false);
                    assert.notEqual(currentRewardsPerBlock, updatedRewardsPerBlock);
                    assert.notEqual(currentTotalRewards, updatedTotalRewards);

                    // Logs
                    // console.log("Initial :")
                    // console.log("  Total rewards:", currentTotalRewards)
                    // console.log("  Rewards per block:", currentRewardsPerBlock)
                    // console.log("Updated :")
                    // console.log("  Total rewards:", updatedTotalRewards)
                    // console.log("  Rewards per block:", updatedRewardsPerBlock)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Non-admin should not be able to force the rewards to come from transfers instead of minting', async () => {
                try{
                    // Toggle to transfer
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(farmInstance.methods.updateConfig(1, "configForceRewardFromTransfer").send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        });

        describe('%closeFarm', function() {

            it('Non-admin should not be able to close a farm', async () => {
                try{
                    // Toggle to transfer
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(farmInstance.methods.closeFarm().send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Admin should be able to close a farm', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    farmStorage             = await farmInstance.storage();
                    const farmOpen          = farmStorage.open;
                    
                    // Operation
                    const closeOperation    = await farmInstance.methods.closeFarm().send();
                    await closeOperation.confirmation();

                    // Final values
                    farmStorage             = await farmInstance.storage();
                    const farmOpenEnd       = farmStorage.open;

                    // Assertions
                    assert.equal(farmOpenEnd, false);
                    assert.notEqual(farmOpenEnd, farmOpen);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not be able to deposit in a closed farm', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const farmOpen          = farmStorage.open;
                    const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress);
                    const amountToDeposit   = 1;

                    // Approval operation
                    if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
                        const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
                        const approveOperation  = await lpTokenInstance.methods.approve(farmAddress,approvals).send();
                        await approveOperation.confirmation();
                    }
                    
                    // Operation
                    await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;

                    // Assertions
                    assert.equal(farmOpen, false);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should be able to claim in a closed farm', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
                    const farmOpen              = farmStorage.open;
                    
                    // Operation
                    await helperFunctions.wait(4 * blockTime * 1000);
                    const claimOperation        = await farmInstance.methods.claim(bob.pkh).send();
                    await claimOperation.confirmation();

                    // Final values
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalanceEnd    = userSMVKLedgerEnd.balance.toNumber()

                    // Assertions
                    assert.equal(farmOpen, false);
                    assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not see any increase in rewards even if it still has LP Token deposited in the farm', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    farmStorage                 = await farmInstance.storage();
                    lpTokenStorage              = await lpTokenInstance.storage();
                    
                    const lpLedgerStart         = await lpTokenStorage.ledger.get(alice.pkh);
                    const lpBalance             = lpLedgerStart.balance.toNumber();
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    const farmOpen                  = farmStorage.open;
                    const initialAccRewardsPerShare = farmStorage.accumulatedRewardsPerShare;
                    
                    // Operation - let alice claim her eligible rewards 
                    await helperFunctions.wait(4 * blockTime * 1000);
                    const claimOperation = await farmInstance.methods.claim(alice.pkh).send();
                    await claimOperation.confirmation();

                    // Update storage
                    doormanStorage                = await doormanInstance.storage();
                    farmStorage                   = await farmInstance.storage();

                    var updatedAccRewardsPerShare = farmStorage.accumulatedRewardsPerShare; 

                    const userSMVKLedger          = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                    const userSMVKBalance         = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber();

                    var userDepositRecord     = await farmStorage.depositorLedger.get(alice.pkh);

                    // Assertions - there should be no increase in accumulated rewards per share for the farm
                    assert.equal(farmOpen, false);
                    assert.equal(initialAccRewardsPerShare.toNumber(), updatedAccRewardsPerShare.toNumber());

                    // Second operation to check no change in sMVK balance
                    await helperFunctions.wait(4 * blockTime * 1000);
                    const secondClaimOperation = await farmInstance.methods.claim(alice.pkh).send();
                    await secondClaimOperation.confirmation();

                    // Update storage
                    doormanStorage                = await doormanInstance.storage();
                    farmStorage                   = await farmInstance.storage();

                    const userDepositRecordEnd    = await farmStorage.depositorLedger.get(alice.pkh);

                    const userSMVKLedgerEnd       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                    const userSMVKBalanceEnd      = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

                    // Assertions - user should have no change in unclaimed rewards, claimed rewards and participation rewards per share
                    assert.equal(farmOpen, false);
                    assert.equal(userSMVKBalanceEnd, userSMVKBalance);
                    
                    assert.equal(userDepositRecordEnd.unclaimedRewards.toNumber(), userDepositRecord.unclaimedRewards.toNumber());
                    assert.equal(userDepositRecordEnd.claimedRewards.toNumber(), userDepositRecord.claimedRewards.toNumber());
                    assert.equal(userDepositRecordEnd.participationRewardsPerShare.toNumber(), userDepositRecord.participationRewardsPerShare.toNumber());

                    assert.notEqual(lpBalance, 0);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should be able to withdraw in a closed farm', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    farmStorage                 = await farmInstance.storage();
                    lpTokenStorage              = await lpTokenInstance.storage();
                    const lpLedgerStart         = await lpTokenStorage.ledger.get(alice.pkh);
                    const lpBalance             = lpLedgerStart.balance.toNumber();
                    const amountToWithdraw      = 1;
                    const farmOpen              = farmStorage.open;
                    
                    // Operation
                    const withdrawOperation     = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    lpTokenStorage              = await lpTokenInstance.storage();
                    const lpLedgerStartEnd      = await lpTokenStorage.ledger.get(alice.pkh);
                    const lpBalanceEnd          = lpLedgerStartEnd.balance.toNumber();

                    // Assertions
                    assert.equal(farmOpen, false);
                    assert.notEqual(lpBalanceEnd, lpBalance)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        })
    })


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                farmStorage        = await farmInstance.storage();
                const currentAdmin  = farmStorage.admin;

                // Operation
                setAdminOperation = await farmInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                farmStorage    = await farmInstance.storage();
                const newAdmin  = farmStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                farmStorage        = await farmInstance.storage();
                const currentGovernance  = farmStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await farmInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                farmStorage    = await farmInstance.storage();
                const updatedGovernance  = farmStorage.governanceAddress;

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

                farmStorage          = await farmInstance.storage();   
                const initialMetadata   = await farmStorage.metadata.get(key);

                // Operation
                const updateOperation = await farmInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                farmStorage          = await farmInstance.storage();            
                const updatedData       = await farmStorage.metadata.get(key);

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
                farmStorage           = await farmInstance.storage();
                const initialConfigValue = farmStorage.config.forceRewardFromTransfer;
                const newConfigValue     = !initialConfigValue;

                // Operation
                const updateConfigOperation = await farmInstance.methods.updateConfig(newConfigValue, "configForceRewardFromTransfer");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                farmStorage           = await farmInstance.storage();
                const updatedConfigValue = farmStorage.config.minMvkAmount;

                // check that there is no change in config values
                assert.equal(updatedConfigValue, initialConfigValue);
                assert.notEqual(updatedConfigValue, newConfigValue);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(farmStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await farmInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh)
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                farmStorage = await farmInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(farmStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await helperFunctions.getStorageMapValue(farmStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await farmInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh)
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                farmStorage          = await farmInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(farmStorage, storageMap, contractMapKey);

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
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(farmInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it("%migrateFunds             - non-admin (mallory) should not be able to migrate the Doorman contract MVK funds", async() => {
            try{
                
                const destination = alice.pkh;
                
                // migrate operation
                migrateOperation = farmInstance.methods.migrateFunds(destination); 
                await chai.expect(migrateOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%pauseAll                 - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = farmInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = farmInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = farmInstance.methods.togglePauseEntrypoint("deposit", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = farmInstance.methods.togglePauseEntrypoint("withdraw", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = farmInstance.methods.togglePauseEntrypoint("claim", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                unpauseOperation = farmInstance.methods.togglePauseEntrypoint("deposit", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;
                
                unpauseOperation = farmInstance.methods.togglePauseEntrypoint("withdraw", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = farmInstance.methods.togglePauseEntrypoint("claim", false); 
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

                const setLambdaOperation = farmInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
