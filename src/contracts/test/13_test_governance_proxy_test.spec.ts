const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require('@taquito/taquito')
const { InMemorySigner, importKey } = require('@taquito/signer');
import assert, { ok, rejects, strictEqual } from 'assert';
import { Utils, MVK } from './helpers/Utils';
import fs from 'fs';
import { confirmOperation } from '../scripts/confirmation';
import { BigNumber } from 'bignumber.js'
import { addVestee, closeFarm, createFarm, initFarm, removeVestee, setAdmin, setGovernance, setName, toggleVesteeLock, updateVestee } from './helpers/governanceProxyHelpers';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from '../env';
import { bob, alice, eve, mallory, oscar } from '../scripts/sandbox/accounts';

import governanceProxyAddress       from '../deployments/governanceProxyAddress.json';
import mvkTokenAddress              from '../deployments/mvkTokenAddress.json';
import vestingAddress               from '../deployments/vestingAddress.json';
import farmAddress                  from '../deployments/farmAddress.json';
import farmFactoryAddress           from '../deployments/farmFactoryAddress.json';
import governanceAddress            from '../deployments/governanceAddress.json';
import mTokenEurlAddress            from '../deployments/mTokenEurlAddress.json';

import { MichelsonMap }             from '@taquito/taquito';
import { farmStorageType }          from './types/farmStorageType';
import { aggregatorStorageType }    from './types/aggregatorStorageType';

describe('Governance proxy lambdas tests', async () => {
    var utils: Utils;

    let governanceProxyInstance;
    let mvkTokenInstance;
    let vestingInstance;
    let farmInstance;
    let farmFactoryInstance;
    let governanceInstance;

    let governanceProxyStorage;
    let mvkTokenStorage;
    let vestingStorage;
    let farmStorage;
    let farmFactoryStorage;
    let governanceStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before('setup', async () => {
        try {
            
            utils = new Utils();
            await utils.init(bob.sk);

            governanceProxyInstance         = await utils.tezos.contract.at(governanceProxyAddress.address);
            mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
            vestingInstance                 = await utils.tezos.contract.at(vestingAddress.address);
            farmInstance                    = await utils.tezos.contract.at(farmAddress.address);
            farmFactoryInstance             = await utils.tezos.contract.at(farmFactoryAddress.address);
            governanceInstance              = await utils.tezos.contract.at(governanceAddress.address);

            governanceProxyStorage          = await governanceProxyInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            vestingStorage                  = await vestingInstance.storage();
            farmStorage                     = await farmInstance.storage();
            farmFactoryStorage              = await farmFactoryInstance.storage();
            governanceStorage               = await governanceInstance.storage();
    
            console.log('-- -- -- -- -- Governance Proxy Tests -- -- -- --')
            console.log('Governance Proxy Contract deployed at:'        , governanceProxyInstance.address);
            console.log('MVK Token Contract deployed at:'               , mvkTokenInstance.address);
            console.log('Vesting Contract deployed at:'                 , vestingInstance.address);
            console.log('Farm Contract deployed at:'                    , farmInstance.address);
            console.log('Farm Factory Contract deployed at:'            , farmFactoryInstance.address);
            console.log('Governance Contract deployed at:'              , governanceInstance.address);

            console.log('Bob address: '         + bob.pkh);
            console.log('Alice address: '       + alice.pkh);
            console.log('Eve address: '         + eve.pkh);
            console.log('Mallory address: '     + mallory.pkh);
            console.log('Oscar address: '       + oscar.pkh);
            console.log('-- -- -- -- -- -- -- -- --')

        } catch(e){
            console.dir(e, {depth:5})
        }
    });

    // describe('%setAdmin', function() {

    //     it('Non-admin should not be able to call this entrypoint', async () => {
    //         try{        

    //             await signerFactory(eve.sk);
    //             await chai.expect(governanceProxyInstance.methods.setAdmin(eve.pkh).send()).to.be.eventually.rejected;

    //         } catch(e){
    //             console.log(e);
    //         } 
    //     }); 
        
    //     it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
    //         try{        

    //             await signerFactory(bob.sk);
    //             const setAdminOperation = await governanceProxyInstance.methods.setAdmin(eve.pkh).send();
    //             await setAdminOperation.confirmation();

    //             governanceProxyStorage   = await governanceProxyInstance.storage();            
    //             assert.equal(governanceProxyStorage.admin, eve.pkh);

    //             // reset treasury admin to bob
    //             await signerFactory(eve.sk);
    //             const resetAdminOperation = await governanceProxyInstance.methods.setAdmin(bob.pkh).send();
    //             await resetAdminOperation.confirmation();

    //             governanceProxyStorage   = await governanceProxyInstance.storage();            
    //             assert.equal(governanceProxyStorage.admin, bob.pkh);

    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });
    // })

    // describe('%updateMetadata', function() {

    //     it('Non-admin should not be able to call this entrypoint', async () => {
    //         try{
    //             // Initial values
    //             const key   = ''
    //             const hash  = Buffer.from('tezos-storage:dato', 'ascii').toString('hex')

    //             // Operation
    //             await signerFactory(eve.sk);
    //             await chai.expect(governanceProxyInstance.methods.updateMetadata(key,hash).send()).to.be.eventually.rejected;

    //         } catch(e){
    //             console.log(e);
    //         } 
    //     }); 
        
    //     it('Admin should be able to call this entrypoint', async () => {
    //         try{
    //             // Initial values
    //             const key   = ''
    //             const hash  = Buffer.from('tezos-storage:dato', 'ascii').toString('hex')

    //             // Operation
    //             await signerFactory(bob.sk);
    //             const updateOperation = await governanceProxyInstance.methods.updateMetadata(key,hash).send();
    //             await updateOperation.confirmation();

    //             // Final values
    //             governanceProxyStorage      = await governanceProxyInstance.storage();            
    //             const updatedData           = await governanceProxyStorage.metadata.get(key);
    //             assert.equal(hash, updatedData);

    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });
    // })

    describe('%executeGovernanceAction', function() {

        describe('MVK Token Contract', function() {

            before('Change the MVK Token contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    mvkTokenStorage     = await mvkTokenInstance.storage();
    
                    // Operation
                    if(mvkTokenStorage.admin !== governanceProxyAddress.address){
                        const operation = await mvkTokenInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
    
            it('%setGovernance', async () => {
                try{
                    // Initial values
                    const newGovernance         = alice.pkh;
                    const initMvkGovernance     = mvkTokenStorage.governanceAddress;
    
                    // Operation
                    const operation             = await governanceProxyInstance.methods.executeGovernanceAction(await setGovernance(utils.tezos, governanceProxyAddress.address, mvkTokenAddress.address, newGovernance)).send();
                    await operation.confirmation();
    
                    // Final values
                    mvkTokenStorage             = await mvkTokenInstance.storage();
                    const finalMvkGovernance    = mvkTokenStorage.governanceAddress;
    
                    // Assertions
                    assert.notStrictEqual(initMvkGovernance, newGovernance);
                    assert.strictEqual(finalMvkGovernance, newGovernance);
                    assert.notStrictEqual(initMvkGovernance, finalMvkGovernance);
    
                } catch(e){
                    console.log(e);
                } 
            });
        
            it('%setAdmin', async () => {
                try{
                    // Initial values
                    const newAdmin      = alice.pkh;
                    const initMvkAdmin  = mvkTokenStorage.admin;
    
                    // Operation
                    const operation     = await governanceProxyInstance.methods.executeGovernanceAction(await setAdmin(utils.tezos, governanceProxyAddress.address, mvkTokenAddress.address, newAdmin)).send();
                    await operation.confirmation();
    
                    // Final values
                    mvkTokenStorage     = await mvkTokenInstance.storage();
                    const finalMvkAdmin = mvkTokenStorage.admin;
    
                    // Assertions
                    assert.notStrictEqual(initMvkAdmin, newAdmin);
                    assert.strictEqual(finalMvkAdmin, newAdmin);
                    assert.notStrictEqual(initMvkAdmin, finalMvkAdmin);
    
                } catch(e){
                    console.log(e);
                } 
            });

        });

        describe('Vesting Contract', function() {

            before('Change the Vesting contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    vestingStorage      = await vestingInstance.storage();
    
                    // Operation
                    if(vestingStorage.admin !== governanceProxyAddress.address){
                        const operation = await vestingInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
    
            it('%addVestee', async () => {
                try{
                    // Initial values
                    vestingStorage              = await vestingInstance.storage();
                    const vesteeAddress         = alice.pkh;
                    const totalAllocatedAmount  = 1000;
                    const cliffInMonths         = 2000;
                    const vestingInMonths       = 3000;
                    const initVesteeRecord      = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Operation
                    const operation             = await governanceProxyInstance.methods.executeGovernanceAction(await addVestee(utils.tezos, governanceProxyAddress.address, vestingAddress.address, vesteeAddress, totalAllocatedAmount, cliffInMonths, vestingInMonths)).send();
                    await operation.confirmation();
    
                    // Final values
                    vestingStorage              = await vestingInstance.storage();
                    const finalVesteeRecord     = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Assertions
                    assert.strictEqual(initVesteeRecord, undefined);
                    assert.notStrictEqual(finalVesteeRecord, undefined);
                    assert.equal(finalVesteeRecord.totalAllocatedAmount.toNumber(), totalAllocatedAmount);
                    assert.equal(finalVesteeRecord.vestingMonths.toNumber(), vestingInMonths);
                    assert.equal(finalVesteeRecord.cliffMonths.toNumber(), cliffInMonths);

                } catch(e){
                    console.log(e);
                } 
            });
    
            it('%updateVestee', async () => {
                try{
                    // Initial values
                    vestingStorage                  = await vestingInstance.storage();
                    const vesteeAddress             = alice.pkh;
                    const newTotalAllocatedAmount   = 1001;
                    const newCliffInMonths          = 2002;
                    const newVestingInMonths        = 3003;
                    const initVesteeRecord          = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Operation
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(await updateVestee(utils.tezos, governanceProxyAddress.address, vestingAddress.address, vesteeAddress, newTotalAllocatedAmount, newCliffInMonths, newVestingInMonths)).send();
                    await operation.confirmation();
    
                    // Final values
                    vestingStorage                  = await vestingInstance.storage();
                    const finalVesteeRecord         = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Assertions
                    assert.notStrictEqual(initVesteeRecord, undefined);
                    assert.notStrictEqual(finalVesteeRecord, undefined);
                    assert.equal(finalVesteeRecord.totalAllocatedAmount.toNumber(), newTotalAllocatedAmount);
                    assert.equal(finalVesteeRecord.vestingMonths.toNumber(), newVestingInMonths);
                    assert.equal(finalVesteeRecord.cliffMonths.toNumber(), newCliffInMonths);

                } catch(e){
                    console.log(e);
                } 
            });

            it('%toggleVesteeLock', async () => {
                try{
                    // Initial values
                    vestingStorage                  = await vestingInstance.storage();
                    const vesteeAddress             = alice.pkh;
                    const initVesteeRecord          = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Operation
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(await toggleVesteeLock(utils.tezos, governanceProxyAddress.address, vestingAddress.address, vesteeAddress)).send();
                    await operation.confirmation();
    
                    // Final values
                    vestingStorage                  = await vestingInstance.storage();
                    const finalVesteeRecord         = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Assertions
                    assert.notStrictEqual(initVesteeRecord, undefined);
                    assert.notStrictEqual(finalVesteeRecord, undefined);
                    assert.notStrictEqual(finalVesteeRecord.status, initVesteeRecord.status);
                    assert.strictEqual(initVesteeRecord.status, "ACTIVE");
                    assert.strictEqual(finalVesteeRecord.status, "LOCKED");

                } catch(e){
                    console.log(e);
                } 
            });

            it('%removeVestee', async () => {
                try{
                    // Initial values
                    vestingStorage                  = await vestingInstance.storage();
                    const vesteeAddress             = alice.pkh;
                    const initVesteeRecord          = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Operation
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(await removeVestee(utils.tezos, governanceProxyAddress.address, vestingAddress.address, vesteeAddress)).send();
                    await operation.confirmation();
    
                    // Final values
                    vestingStorage                  = await vestingInstance.storage();
                    const finalVesteeRecord         = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Assertions
                    assert.notStrictEqual(initVesteeRecord, undefined);
                    assert.strictEqual(finalVesteeRecord, undefined);

                } catch(e){
                    console.log(e);
                } 
            });
        });

        describe('Farm Contract', function() {

            before('Change the Farm contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    farmStorage         = await farmInstance.storage();
    
                    // Operation
                    if(farmStorage.admin !== governanceProxyAddress.address){
                        const operation = await farmInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%setName', async () => {
                try{
                    // Initial values
                    farmStorage                     = await farmInstance.storage();
                    const farmNewName               = "FarmTest";
                    const initFarmName              = farmStorage.name;
                    
                    // Operation
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(await setName(utils.tezos, governanceProxyAddress.address, farmAddress.address, farmNewName)).send();
                    await operation.confirmation();
    
                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const finalFarmName             = farmStorage.name;

                    // Assertions
                    assert.notStrictEqual(finalFarmName, initFarmName);
                    assert.strictEqual(finalFarmName, farmNewName);
                    assert.notStrictEqual(initFarmName, farmNewName);

                } catch(e){
                    console.log(e);
                } 
            });

            it('%initFarm', async () => {
                try{
                    // Initial values
                    farmStorage                     = await farmInstance.storage();
                    const forceRewardFromTransfer   = false;
                    const infinite                  = true;
                    const totalBlocks               = 999;
                    const currentRewardPerBlock     = 123;
                    const initFarmInit              = farmStorage.init;
                    const initFarmOpen              = farmStorage.open;
                    
                    // Operation
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(await initFarm(utils.tezos, governanceProxyAddress.address, farmAddress.address, forceRewardFromTransfer, infinite, totalBlocks, currentRewardPerBlock)).send();
                    await operation.confirmation();
    
                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const finalFarmInit             = farmStorage.init;
                    const finalFarmOpen             = farmStorage.open;

                    // Assertions
                    assert.notEqual(finalFarmInit, initFarmInit);
                    assert.notEqual(finalFarmOpen, initFarmOpen);
                    assert.equal(finalFarmInit, true);
                    assert.equal(finalFarmOpen, true);
                    assert.equal(farmStorage.config.forceRewardFromTransfer, forceRewardFromTransfer);
                    assert.equal(farmStorage.config.infinite, infinite);
                    assert.equal(farmStorage.config.plannedRewards.totalBlocks.toNumber(), totalBlocks);
                    assert.equal(farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber(), currentRewardPerBlock);

                } catch(e){
                    console.log(e);
                } 
            });

            it('%closeFarm', async () => {
                try{
                    // Initial values
                    farmStorage                     = await farmInstance.storage();
                    const initFarmOpen              = farmStorage.open;
                    
                    // Operation
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(await closeFarm(utils.tezos, governanceProxyAddress.address, farmAddress.address)).send();
                    await operation.confirmation();
    
                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const finalFarmOpen             = farmStorage.open;

                    // Assertions
                    assert.notEqual(finalFarmOpen, initFarmOpen);
                    assert.equal(finalFarmOpen, false);

                } catch(e){
                    console.log(e);
                } 
            });
            
        });

        describe('Farm Factory Contract', function() {

            before('Change the Farm Factory contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    farmFactoryStorage  = await farmFactoryInstance.storage();
    
                    // Operation
                    if(farmFactoryStorage.admin !== governanceProxyAddress.address){
                        const operation = await farmFactoryInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%createFarm', async () => {
                try{
                    // Initial values
                    farmFactoryStorage              = await farmFactoryInstance.storage();
                    governanceStorage               = await governanceInstance.storage();
                    const farmName                  = "FarmTest";
                    const addToGeneralContracts     = true;
                    const forceRewardFromTransfer   = false;
                    const infinite                  = true;
                    const totalBlocks               = 999;
                    const currentRewardPerBlock     = 123;
                    const metadataBytes             = Buffer.from(
                        JSON.stringify({
                        name: 'MAVRYK PLENTY-USDTz Farm',
                        description: 'MAVRYK Farm Contract',
                        version: 'v1.0.0',
                        liquidityPairToken: {
                            tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
                            origin: ['Plenty'],
                            token0: {
                                symbol: ['PLENTY'],
                                tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
                            },
                            token1: {
                                symbol: ['USDtz'],
                                tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
                            }
                        },
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                        }),
                        'ascii',
                    ).toString('hex');
                    const lpTokenAddress            = mTokenEurlAddress.address;
                    const lpTokenId                 = 0;
                    const lpTokenStandard           = "FA2";
                    const initTrackedFarmsLength    = farmFactoryStorage.trackedFarms.length;
                    const initFarmTestGovernance    = await governanceStorage.generalContracts.get(farmName);
    
                    // Operation
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(await createFarm(utils.tezos, governanceProxyAddress.address, farmFactoryAddress.address, farmName, addToGeneralContracts, forceRewardFromTransfer, infinite, totalBlocks, currentRewardPerBlock, metadataBytes, lpTokenAddress, lpTokenId, lpTokenStandard)).send();
                    await operation.confirmation();
    
                    // Final values
                    farmFactoryStorage              = await farmFactoryInstance.storage();
                    governanceStorage               = await governanceInstance.storage();
                    const createdFarmAddress        = farmFactoryStorage.trackedFarms[0];
                    const createdFarmInstance       = await utils.tezos.contract.at(createdFarmAddress);
                    const createdFarmStorage: any   = await createdFarmInstance.storage();
                    const finalTrackedFarmsLength   = farmFactoryStorage.trackedFarms.length;
                    const finalFarmTestGovernance   = await governanceStorage.generalContracts.get(farmName);

                    // Assertions
                    assert.equal(initTrackedFarmsLength, 0);
                    assert.equal(initFarmTestGovernance, undefined);
                    assert.equal(finalTrackedFarmsLength, 1);
                    assert.strictEqual(finalFarmTestGovernance, createdFarmAddress);
                    assert.strictEqual(createdFarmStorage.name, farmName);
                    assert.strictEqual(createdFarmStorage.config.forceRewardFromTransfer, forceRewardFromTransfer);
                    assert.strictEqual(createdFarmStorage.config.infinite, infinite);
                    assert.strictEqual(createdFarmStorage.config.plannedRewards.totalBlocks.toNumber(), totalBlocks);
                    assert.strictEqual(createdFarmStorage.config.plannedRewards.currentRewardPerBlock.toNumber(), currentRewardPerBlock);
                    assert.strictEqual(createdFarmStorage.config.lpToken.tokenAddress, lpTokenAddress);
                    assert.strictEqual(createdFarmStorage.config.lpToken.tokenId.toNumber(), lpTokenId);

                } catch(e){
                    console.log(e);
                } 
            });
        })
    });
});