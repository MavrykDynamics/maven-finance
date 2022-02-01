const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "./helpers/Utils";

const chai = require("chai");
const assert = require("chai").assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import { alice, bob } from "../scripts/sandbox/accounts";

import farmFactoryAddress from '../deployments/farmFactoryAddress.json';
import lpTokenAddress from '../deployments/lpTokenAddress.json';
import doormanAddress from '../deployments/doormanAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import { farmStorageType } from "./types/farmStorageType";

let farmAddress: string;
let farmInstance;
let farmStorage;

describe("FarmFactory", async () => {
    var utils: Utils;

    let farmFactoryInstance;
    let farmFactoryStorage;

    let lpTokenInstance;
    let lpTokenStorage;

    let doormanInstance;
    let doormanStorage;

    let mvkTokenInstance;
    let mvkTokenStorage;

    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        utils = new Utils();
        await utils.init(alice.sk);
        
        farmFactoryInstance   = await utils.tezos.contract.at(farmFactoryAddress.address);
        farmFactoryStorage    = await farmFactoryInstance.storage();
        lpTokenInstance = await utils.tezos.contract.at(lpTokenAddress.address);
        lpTokenStorage    = await lpTokenInstance.storage();
        doormanInstance = await utils.tezos.contract.at(doormanAddress.address);
        doormanStorage    = await doormanInstance.storage();
        mvkTokenInstance = await utils.tezos.contract.at(mvkTokenAddress.address);
        mvkTokenStorage    = await mvkTokenInstance.storage();
    });

    beforeEach("storage", async () => {
        farmFactoryStorage = await farmFactoryInstance.storage();
        lpTokenStorage    = await lpTokenInstance.storage();
        doormanStorage    = await doormanInstance.storage();
        mvkTokenStorage    = await mvkTokenInstance.storage();
        await signerFactory(alice.sk)
    })

    describe('Farm Factory', function() {
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
                    farmInstance                            = await utils.tezos.contract.at(farmAddress);
                    farmStorage                             = await farmInstance.storage();

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

            it('Check with a non-farm address', async () => {
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

    describe('Newly created farm', function() {
        describe('%claim', function() {
            it('Create a farm, deposit and try to claim in it', async () => {
                try{
                    // Deposit
                    const amountToDeposit = 2;

                    // Create a transaction for initiating a farm
                    const createFarmOperation = await farmFactoryInstance.methods.createFarm(
                        100,
                        12000,
                        lpTokenAddress.address,
                        0,
                        "fa12"
                    ).send();
                    await createFarmOperation.confirmation()

                    // Created farms
                    farmFactoryStorage    = await farmFactoryInstance.storage();

                    // Get the new farm
                    farmAddress                             = farmFactoryStorage.createdFarms[farmFactoryStorage.createdFarms.length - 1];
                    farmInstance                            = await utils.tezos.contract.at(farmAddress);
                    farmStorage                             = await farmInstance.storage();

                     // Create a transaction for allowing farm to spend LP Token in the name of Alice
                    const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
                    const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress);

                    // Check Alice has no pending approvals for the farm
                    if(aliceApprovalsStart===undefined || aliceApprovalsStart<amountToDeposit){
                        const allowances = aliceApprovalsStart===undefined ? amountToDeposit : Math.abs(aliceApprovalsStart - amountToDeposit);
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress,allowances).send();
                        await approveOperation.confirmation();
                    }
                    // Deposit operation
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Claim operation after a few blocks
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    const claimOperation = await farmInstance.methods.claim().send();
                    await claimOperation.confirmation()
                    
                    farmStorage = await farmInstance.storage();
                    doormanStorage = await doormanInstance.storage();

                    // Delegator's record
                    const delegatorRecord = await farmStorage.delegators.get(alice.pkh)
                    console.log("User's deposit in Farm Contract")
                    console.log(delegatorRecord)

                    // Stake's record
                    const doormanRecord = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)
                    console.log("User's balance in Doorman Contract")
                    console.log(doormanRecord)

                    // Doorman's balance in MVK Token Contract
                    const doormanLedger = await mvkTokenStorage.ledger.get(doormanAddress.address)
                    console.log("Doorman's ledger in MVK Token Contract")
                    console.log(doormanLedger)
                }catch(e){
                    console.log(e);
                }
            })

            it('Create a farm, deposit and try to claim in it with a farm unknown to the farm factory', async () => {
                try{
                    // Deposit
                    const amountToDeposit = 2;
                    
                    // Untrack the farm
                    const untrackOperation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                    await untrackOperation.confirmation();

                    // Create a transaction for allowing farm to spend LP Token in the name of Alice
                    const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
                    const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress);

                    // Check Alice has no pending approvals for the farm
                    if(aliceApprovalsStart===undefined || aliceApprovalsStart<amountToDeposit){
                        const allowances = aliceApprovalsStart===undefined ? amountToDeposit : Math.abs(aliceApprovalsStart - amountToDeposit);
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress,allowances).send();
                        await approveOperation.confirmation();
                    }
                    // Deposit operation
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Claim operation after a few blocks
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    const claimOperation = await farmInstance.methods.claim().send();
                    await claimOperation.confirmation()
                    
                    farmStorage = await farmInstance.storage();
                    doormanStorage = await doormanInstance.storage();

                    // Delegator's record
                    const delegatorRecord = await farmStorage.delegators.get(alice.pkh)
                    console.log(delegatorRecord)

                    // Delegator's record
                    const doormanRecord = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)
                    console.log(doormanRecord)
                }catch(e){
                    assert.strictEqual(e.message, "The provided farm contract does not exist in the createdFarms big_map")
                }
            })

            // it('Create a farm, deposit and try to claim in it without having the farm factory contract in the doorman generalContracts map', async () => {
            //     try{
            //         // Deposit
            //         const amountToDeposit = 2;

            //         // Create a transaction for initiating a farm
            //         const createFarmOperation = await farmFactoryInstance.methods.createFarm(
            //             100,
            //             12000,
            //             lpTokenAddress.address,
            //             0,
            //             "fa12"
            //         ).send();
            //         await createFarmOperation.confirmation()

            //         // Created farms
            //         farmFactoryStorage    = await farmFactoryInstance.storage();

            //         // Get the new farm
            //         farmAddress                             = farmFactoryStorage.createdFarms[farmFactoryStorage.createdFarms.length - 1];
            //         farmInstance                            = await utils.tezos.contract.at(farmAddress);
            //         farmStorage                             = await farmInstance.storage();

            //          // Create a transaction for allowing farm to spend LP Token in the name of Alice
            //         const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
            //         const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress);

            //         // Check Alice has no pending approvals for the farm
            //         if(aliceApprovalsStart===undefined || aliceApprovalsStart<amountToDeposit){
            //             const allowances = aliceApprovalsStart===undefined ? amountToDeposit : Math.abs(aliceApprovalsStart - amountToDeposit);
            //             const approveOperation = await lpTokenInstance.methods.approve(farmAddress,allowances).send();
            //             await approveOperation.confirmation();
            //         }
            //         // Deposit operation
            //         const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
            //         await depositOperation.confirmation();

            //         // Claim operation after a few blocks
            //         await new Promise(resolve => setTimeout(resolve, 6000));
            //         const claimOperation = await farmInstance.methods.claim().send();
            //         await claimOperation.confirmation()
            //     }catch(e){
            //         assert.strictEqual(e.message, "Error. Farm Factory Contract is not found.")
            //     }
            // })
        });
    });
});