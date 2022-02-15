const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const assert = require("chai").assert;
const { createHash } = require("crypto")
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve } from "../scripts/sandbox/accounts";

import farmAddress from '../deployments/farmAddress.json';
import lpAddress from '../deployments/lpTokenAddress.json';
import mvkAddress from '../deployments/mvkTokenAddress.json';

describe("Farm", async () => {
    var utils: Utils;

    let farmInstance;
    let farmStorage;

    let mvkTokenInstance;
    let mvkTokenStorage;

    let lpTokenInstance;
    let lpTokenStorage;

    let farmBlockStart;
    let farmBlockEnd;

    // Tolerance and accuracy for mathematical rewards calculation
    const FIXED_POINT_ACCURACY= 100000000000;

    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        utils = new Utils();
        await utils.init(alice.sk);
        
        farmInstance   = await utils.tezos.contract.at(farmAddress.address);
        farmStorage    = await farmInstance.storage();
        mvkTokenInstance = await utils.tezos.contract.at(mvkAddress.address);
        mvkTokenStorage    = await mvkTokenInstance.storage();
        lpTokenInstance = await utils.tezos.contract.at(lpAddress.address);
        lpTokenStorage    = await lpTokenInstance.storage();

        // Bob (reserve contract) gives operator permission to the farm contract
        await signerFactory(eve.sk);
        const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner: eve.pkh,
                    operator: farmAddress.address,
                    token_id: 0
                }
            }
        ]).send()
        await updateOperatorsOperation.confirmation();
    });

    beforeEach("storage", async () => {
        farmStorage = await farmInstance.storage();
        mvkTokenStorage = await mvkTokenInstance.storage();
        lpTokenStorage = await lpTokenInstance.storage();

        await signerFactory(alice.sk)
    })

    describe('%initFarm', function() {
        it('Initialize a farm without being the admin', async () => {
            try{
                // Switch signer to Bob
                await signerFactory(bob.sk);

                // Create a transaction for initiating a farm 
                const operation = await farmInstance.methods.initFarm(100,12000).send();
                await operation.confirmation()

            }catch(e){
                assert.equal(e.message,"ONLY_ADMINISTRATOR_ALLOWED");
            }
        })

        it('Initialize a farm with 100 rewards per block that will last for 12 000 blocks', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmInstance.methods.initFarm(100,12000).send();
                await operation.confirmation()

                // Refresh farm storage
                farmStorage    = await farmInstance.storage();

                // Check that the farm has the correct values
                const farmOpenEnd = farmStorage.open;
                const farmTotalBlocksEnd = farmStorage.plannedRewards.totalBlocks;
                const farmRewardPerBlockEnd = farmStorage.plannedRewards.rewardPerBlock;

                assert.equal(farmOpenEnd, true, "The farm should be closed when originated");
                assert.equal(farmTotalBlocksEnd, 12000, "The farm should have totalBlocks set on initFarm");
                assert.equal(farmRewardPerBlockEnd, 100, "The farm should have a rewardPerBlock set on initFarm");

                // Keep the block where the farm was initiated in a variable for future use
                farmStorage    = await farmInstance.storage();
                farmBlockStart = parseInt(farmStorage.lastBlockUpdate);
                farmBlockEnd   = farmBlockStart + 12000;
            }catch(e){
                console.log(e)
            }
        })

        it('Initialize a farm after it has been already initiated', async () => {
            try{
                // Create a transaction for initiating a farm 
                const operation = await farmInstance.methods.initFarm(100,12000).send();
                await operation.confirmation()
            }catch(e){
                assert.equal(e.message, "This farm is already opened you cannot initialize it again")
            }
        })
    });

        describe('%deposit', function() {
            it('Alice deposits 2LP Tokens', async () => {
                try{
                    // Amount of LP to deposit
                    const amountToDeposit = 2;
                    
                    // Create a transaction for allowing farm to spend LP Token in the name of Alice
                    const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
                    const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress.address);
                    // Check Alice has no pending approvals for the farm
                    if(aliceApprovalsStart===undefined || aliceApprovalsStart<=0){
                        const allowances = aliceApprovalsStart===undefined ? amountToDeposit : Math.abs(aliceApprovalsStart - amountToDeposit);
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
                        await approveOperation.confirmation();
                    }
    
                    // Get Alice LP delegated amount before deposing
                    const aliceDelegatorRecordStart = await farmStorage.delegators.get(alice.pkh);
                    const aliceLPDelegatedStart = parseInt(aliceDelegatorRecordStart===undefined ? 0 : aliceDelegatorRecordStart.balance);

                    // Create a transaction for depositing LP to a farm
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();
    
                    // Refresh Farm storage
                    farmStorage = await farmInstance.storage();
    
                    // Check that LP have been deposited
                    const aliceDelegatorRecordEnd = await farmStorage.delegators.get(alice.pkh);
                    const aliceLPDelegatedEnd = parseInt(aliceDelegatorRecordEnd===undefined ? 0 : aliceDelegatorRecordEnd.balance);
                    assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart + amountToDeposit, "Alice should have "+(aliceLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");
                } catch(e){
                    console.log(e);
                } 
            });

            it('Alice deposits more LP than she has', async () => {
                try{
                    
                    // Create a transaction for allowing farm to spend LP Token in the name of Alice
                    const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
                    const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress.address);

                    // Amount of LP to deposit
                    const amountToDeposit = parseInt(aliceLedgerStart.balance) + 1;

                    // Check Alice has no pending approvals for the farm
                    if(aliceApprovalsStart===undefined || aliceApprovalsStart<=0){
                        const allowances = aliceApprovalsStart===undefined ? amountToDeposit : Math.abs(aliceApprovalsStart - amountToDeposit);
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();

                        await approveOperation.confirmation();

                        // Check that LP FA12 has been approved
                        lpTokenStorage = await lpTokenInstance.storage();
                        const aliceLedgerEnd = await lpTokenStorage.ledger.get(alice.pkh);
                        assert.notStrictEqual(aliceLedgerEnd, undefined, "Alice should have an account in the LP Token contract");
                        
                        const aliceApprovalsEnd = await aliceLedgerEnd.allowances.get(farmAddress.address);

                        assert.notStrictEqual(aliceApprovalsEnd, undefined, "Alice should have the farm address in her approvals");
                        assert.equal(aliceApprovalsEnd, amountToDeposit, "Alice should have approved "+amountToDeposit+" LP Token to spend to the farm");
                        
                    }
    
                    // Create a transaction for depositing LP to a farm
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    console.log('ZOUSTAS:', amountToDeposit)

                } catch(e){
                    assert.strictEqual(e.message, "NotEnoughBalance", "Alice should not be able to spend more LP than she has");
                } 
            })

            it('Alice deposits 3LP Tokens then Bob deposits 8LP', async () => {
                try{
                    // Amount of LP to deposit
                    var amountToDeposit = 3;
                    
                    // Create a transaction for allowing farm to spend LP Token in the name of Alice
                    const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
                    const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress.address);
                    // Check Alice has no pending approvals for the farm
                    if(aliceApprovalsStart===undefined || aliceApprovalsStart<=0){
                        const allowances = aliceApprovalsStart===undefined ? amountToDeposit : Math.abs(aliceApprovalsStart - amountToDeposit);
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
                        await approveOperation.confirmation();
                    }

                    // Get Alice LP delegated amount before deposing
                    const aliceDelegatorRecordStart = await farmStorage.delegators.get(alice.pkh);
                    const aliceLPDelegatedStart = parseInt(aliceDelegatorRecordStart===undefined ? 0 : aliceDelegatorRecordStart.balance);
                    
                    // Create a transaction for depositing LP to a farm
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();
    
                    // Refresh Farm storage
                    farmStorage = await farmInstance.storage();
    
                    // Check that LP have been deposited
                    const aliceDelegatorRecordEnd = await farmStorage.delegators.get(alice.pkh);
                    const aliceLPDelegatedEnd = parseInt(aliceDelegatorRecordEnd===undefined ? 0 : aliceDelegatorRecordEnd.balance);
                    assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart + amountToDeposit, "Alice should have "+(aliceLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");

                    // Switch signer to Bob
                    await signerFactory(bob.sk);

                    // Amount of LP to deposit
                    var amountToDeposit = 8;
                    
                    // Create a transaction for allowing farm to spend LP Token in the name of Alice
                    const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
                    const bobApprovalsStart = await bobLedgerStart.allowances.get(farmAddress.address);
                    // Check Alice has no pending approvals for the farm
                    if(bobApprovalsStart===undefined || bobApprovalsStart<=0){
                        const allowances = bobApprovalsStart===undefined ? amountToDeposit : Math.abs(bobApprovalsStart - amountToDeposit);
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
                        await approveOperation.confirmation();
                    }
    
                    // Get Alice LP delegated amount before deposing
                    const bobDelegatorRecordStart = await farmStorage.delegators.get(bob.pkh);
                    const bobLPDelegatedStart = parseInt(bobDelegatorRecordStart===undefined ? 0 : bobDelegatorRecordStart.balance);
                    
                    // Create a transaction for depositing LP to a farm
                    const bobDepositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await bobDepositOperation.confirmation();
    
                    // Refresh Farm storage
                    farmStorage = await farmInstance.storage();
    
                    // Check that LP have been deposited
                    const bobDelegatorRecordEnd = await farmStorage.delegators.get(bob.pkh);
                    const bobLPDelegatedEnd = parseInt(bobDelegatorRecordEnd===undefined ? 0 : bobDelegatorRecordEnd.balance);
                    assert.equal(bobLPDelegatedEnd, bobLPDelegatedStart + amountToDeposit, "Bob should have "+(bobLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");
                } catch(e){
                    console.log(e);
                }
            });
        })
    
        describe('%withdraw', function() {
            it('Alice withdraws 1LP Token', async () => {
                try{
                    // Amount of LP to withdraw
                    const amountToWithdraw = 1;
    
                    // Get Alice LP delegated amount before withdrawing
                    const aliceDelegatorRecordStart = await farmStorage.delegators.get(alice.pkh);
                    const aliceLPTokensStart = await lpTokenStorage.ledger.get(alice.pkh);
                    console.log(aliceDelegatorRecordStart)
                    console.log("alice ledger start: ", aliceLPTokensStart)
                    const aliceLPDelegatedStart = parseInt(aliceDelegatorRecordStart===undefined ? 0 : aliceDelegatorRecordStart.balance);
                    
                    // Create a transaction for depositing LP to a farm
                    const withdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();
    
                    // Refresh Farm storage
                    farmStorage = await farmInstance.storage();
    
                    // Check that LP have been withdrawed
                    const aliceDelegatorRecordEnd = await farmStorage.delegators.get(alice.pkh);
                    lpTokenStorage = await lpTokenInstance.storage();
                    const aliceLPTokensEnd = await lpTokenStorage.ledger.get(alice.pkh);
                    console.log(aliceDelegatorRecordEnd)
                    console.log("alice ledger end: ", aliceLPTokensEnd)

                    const aliceLPDelegatedEnd = parseInt(aliceDelegatorRecordEnd===undefined ? 0 : aliceDelegatorRecordEnd.balance);
                    assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart - amountToWithdraw, "Alice should have "+(aliceLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");
                } catch(e){
                    console.log(e);
                } 
            });

            it('Alice withdraws 2LP Token and Bob withdraws 1LP Token', async () => {
                try{
                    // Amount of LP to withdraw
                    var amountToWithdraw = 2;
    
                    // Get Alice LP delegated amount before withdrawing
                    const aliceDelegatorRecordStart = await farmStorage.delegators.get(alice.pkh);
                    const aliceLPTokensStart = await lpTokenStorage.ledger.get(alice.pkh);
                    console.log(aliceDelegatorRecordStart)
                    console.log("alice ledger start: ", aliceLPTokensStart)
                    const aliceLPDelegatedStart = parseInt(aliceDelegatorRecordStart===undefined ? 0 : aliceDelegatorRecordStart.balance);
                    
                    // Create a transaction for depositing LP to a farm
                    const withdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();
    
                    // Refresh Farm storage
                    farmStorage = await farmInstance.storage();
    
                    // Check that LP have been deposited
                    const aliceDelegatorRecordEnd = await farmStorage.delegators.get(alice.pkh);
                    lpTokenStorage = await lpTokenInstance.storage();
                    const aliceLPTokensEnd = await lpTokenStorage.ledger.get(alice.pkh);
                    console.log(aliceDelegatorRecordEnd)
                    console.log("alice ledger end: ", aliceLPTokensEnd)
                    const aliceLPDelegatedEnd = parseInt(aliceDelegatorRecordEnd===undefined ? 0 : aliceDelegatorRecordEnd.balance);

                    assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart - amountToWithdraw, "Alice should have "+(aliceLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");

                    // Switch signer to Bob
                    await signerFactory(bob.sk);

                    // Amount of LP to withdraw
                    amountToWithdraw = 1;
    
                    // Get Alice LP delegated amount before withdrawing
                    const bobDelegatorRecordStart = await farmStorage.delegators.get(bob.pkh);
                    const bobLPTokensStart = await lpTokenStorage.ledger.get(alice.pkh);
                    console.log(bobLPTokensStart)
                    console.log("bob ledger start: ", bobLPTokensStart)
                    const bobLPDelegatedStart = parseInt(bobDelegatorRecordStart===undefined ? 0 : bobDelegatorRecordStart.balance);
                    
                    // Create a transaction for depositing LP to a farm
                    const bobWithdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await bobWithdrawOperation.confirmation();
    
                    // Refresh Farm storage
                    farmStorage = await farmInstance.storage();
    
                    // Check that LP have been deposited
                    const bobDelegatorRecordEnd = await farmStorage.delegators.get(bob.pkh);
                    lpTokenStorage = await lpTokenInstance.storage();
                    const bobLPTokensEnd = await lpTokenStorage.ledger.get(bob.pkh);
                    console.log(bobDelegatorRecordEnd)
                    console.log("bob ledger end: ", bobLPTokensEnd)
                    const bobLPDelegatedEnd = parseInt(bobDelegatorRecordEnd===undefined ? 0 : bobDelegatorRecordEnd.balance);
                    assert.equal(bobLPDelegatedEnd, bobLPDelegatedStart - amountToWithdraw, "Bob should have "+(bobLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");
                } catch(e){
                    console.log(e);
                } 
            });
        });
});
