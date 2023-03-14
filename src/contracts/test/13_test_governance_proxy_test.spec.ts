const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require('@taquito/taquito')
const { InMemorySigner, importKey } = require('@taquito/signer');
import assert, { ok, rejects, strictEqual } from 'assert';
import { Utils, MVK } from './helpers/Utils';
import fs from 'fs';
import { confirmOperation } from '../scripts/confirmation';
import { BigNumber } from 'bignumber.js'
import { compileLambdaFunction } from '../scripts/proxyLambdaFunctionPacker'
import * as doormanLambdas from '../build/lambdas/doormanLambdas.json';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from '../env';
import { bob, alice, eve, mallory, oscar, trudy } from '../scripts/sandbox/accounts';

import governanceProxyAddress       from '../deployments/governanceProxyAddress.json';
import mvkTokenAddress              from '../deployments/mvkTokenAddress.json';
import vestingAddress               from '../deployments/vestingAddress.json';
import farmAddress                  from '../deployments/farmAddress.json';
import farmFactoryAddress           from '../deployments/farmFactoryAddress.json';
import treasuryAddress              from '../deployments/treasuryAddress.json';
import treasuryFactoryAddress       from '../deployments/treasuryFactoryAddress.json';
import governanceAddress            from '../deployments/governanceAddress.json';
import mTokenEurlAddress            from '../deployments/mTokenEurlAddress.json';
import doormanAddress               from '../deployments/doormanAddress.json';
import aggregatorAddress            from '../deployments/aggregatorAddress.json';
import aggregatorFactoryAddress     from '../deployments/aggregatorFactoryAddress.json';
import breakGlassAddress            from '../deployments/breakGlassAddress.json';
import councilAddress               from '../deployments/councilAddress.json';
import delegationAddress            from '../deployments/delegationAddress.json';
import emergencyGovernanceAddress   from '../deployments/emergencyGovernanceAddress.json';
import governanceFinancialAddress   from '../deployments/governanceFinancialAddress.json';
import governanceSatelliteAddress   from '../deployments/governanceSatelliteAddress.json';
import lendingControllerAddress     from '../deployments/lendingControllerAddress.json';
import tokenSaleAddress             from '../deployments/tokenSaleAddress.json';
import vaultFactoryAddress          from '../deployments/vaultFactoryAddress.json';

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
    let treasuryInstance;
    let treasuryFactoryInstance;
    let governanceInstance;
    let doormanInstance;
    let aggregatorInstance;
    let aggregatorFactoryInstance;
    let breakGlassInstance;
    let councilInstance;
    let delegationInstance;
    let emergencyGovernanceInstance;
    let governanceFinancialInstance;
    let governanceSatelliteInstance;
    let lendingControllerInstance;
    let tokenSaleInstance;
    let vaultFactoryInstance;

    let governanceProxyStorage;
    let mvkTokenStorage;
    let vestingStorage;
    let farmStorage;
    let farmFactoryStorage;
    let treasuryStorage;
    let treasuryFactoryStorage;
    let governanceStorage;
    let doormanStorage;
    let aggregatorStorage;
    let aggregatorFactoryStorage;
    let breakGlassStorage;
    let councilStorage;
    let delegationStorage;
    let emergencyGovernanceStorage;
    let governanceFinancialStorage;
    let governanceSatelliteStorage;
    let lendingControllerStorage;
    let tokenSaleStorage;
    let vaultFactoryStorage;

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
            treasuryInstance                = await utils.tezos.contract.at(treasuryAddress.address);
            treasuryFactoryInstance         = await utils.tezos.contract.at(treasuryFactoryAddress.address);
            governanceInstance              = await utils.tezos.contract.at(governanceAddress.address);
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
            aggregatorInstance              = await utils.tezos.contract.at(aggregatorAddress.address);
            aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
            breakGlassInstance              = await utils.tezos.contract.at(breakGlassAddress.address);
            councilInstance                 = await utils.tezos.contract.at(councilAddress.address);
            delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
            emergencyGovernanceInstance     = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(governanceFinancialAddress.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(governanceSatelliteAddress.address);
            lendingControllerInstance       = await utils.tezos.contract.at(lendingControllerAddress.address);
            tokenSaleInstance               = await utils.tezos.contract.at(tokenSaleAddress.address);
            vaultFactoryInstance            = await utils.tezos.contract.at(vaultFactoryAddress.address);

            governanceProxyStorage          = await governanceProxyInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            vestingStorage                  = await vestingInstance.storage();
            farmStorage                     = await farmInstance.storage();
            farmFactoryStorage              = await farmFactoryInstance.storage();
            treasuryStorage                 = await treasuryInstance.storage();
            treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
            governanceStorage               = await governanceInstance.storage();
            doormanStorage                  = await doormanInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            breakGlassStorage               = await breakGlassInstance.storage();
            councilStorage                  = await councilInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            lendingControllerStorage        = await lendingControllerInstance.storage();
            tokenSaleStorage                = await tokenSaleInstance.storage();
            vaultFactoryStorage             = await vaultFactoryInstance.storage();

            console.log('-- -- -- -- -- Governance Proxy Tests -- -- -- --')
            console.log('Governance Proxy Contract deployed at:'        , governanceProxyInstance.address);
            console.log('MVK Token Contract deployed at:'               , mvkTokenInstance.address);
            console.log('Vesting Contract deployed at:'                 , vestingInstance.address);
            console.log('Farm Contract deployed at:'                    , farmInstance.address);
            console.log('Farm Factory Contract deployed at:'            , farmFactoryInstance.address);
            console.log('Treasury Contract deployed at:'                , treasuryInstance.address);
            console.log('Treasury Factory Contract deployed at:'        , treasuryFactoryInstance.address);
            console.log('Governance Contract deployed at:'              , governanceInstance.address);
            console.log('Doorman Contract deployed at:'                 , doormanInstance.address);
            console.log('Aggregator Contract deployed at:'              , aggregatorInstance.address);
            console.log('Aggregator Factory Contract deployed at:'      , aggregatorFactoryInstance.address);
            console.log('Break Glass Contract deployed at:'             , breakGlassInstance.address);
            console.log('Council Contract deployed at:'                 , councilInstance.address);
            console.log('Delegation Contract deployed at:'              , delegationInstance.address);
            console.log('Emergency Governance Contract deployed at:'    , emergencyGovernanceInstance.address);
            console.log('Governance Financial Contract deployed at:'    , governanceFinancialInstance.address);
            console.log('Governance Satellite Contract deployed at:'    , governanceSatelliteInstance.address);
            console.log('Lending Controller Contract deployed at:'      , lendingControllerInstance.address);
            console.log('Token Sale Contract deployed at:'              , tokenSaleInstance.address);
            console.log('Vault Factory Contract deployed at:'           , vaultFactoryInstance.address);

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

    describe('%setAdmin', function() {

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{        

                await signerFactory(eve.sk);
                await chai.expect(governanceProxyInstance.methods.setAdmin(eve.pkh).send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        }); 
        
        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{        

                await signerFactory(bob.sk);
                const setAdminOperation = await governanceProxyInstance.methods.setAdmin(eve.pkh).send();
                await setAdminOperation.confirmation();

                governanceProxyStorage   = await governanceProxyInstance.storage();            
                assert.equal(governanceProxyStorage.admin, eve.pkh);

                // reset treasury admin to bob
                await signerFactory(eve.sk);
                const resetAdminOperation = await governanceProxyInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                governanceProxyStorage   = await governanceProxyInstance.storage();            
                assert.equal(governanceProxyStorage.admin, bob.pkh);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });
    })

    describe('%updateMetadata', function() {

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:dato', 'ascii').toString('hex')

                // Operation
                await signerFactory(eve.sk);
                await chai.expect(governanceProxyInstance.methods.updateMetadata(key,hash).send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        }); 
        
        it('Admin should be able to call this entrypoint', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:dato', 'ascii').toString('hex')

                // Operation
                await signerFactory(bob.sk);
                const updateOperation = await governanceProxyInstance.methods.updateMetadata(key,hash).send();
                await updateOperation.confirmation();

                // Final values
                governanceProxyStorage      = await governanceProxyInstance.storage();            
                const updatedData           = await governanceProxyStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });
    })

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
            });
    
            it('%setGovernance', async () => {
                try{
                    // Initial values
                    const newGovernance         = alice.pkh;
                    const initMvkGovernance     = mvkTokenStorage.governanceAddress;
    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'setGovernance',
                        [
                            mvkTokenAddress.address,
                            newGovernance
                        ]
                    );

                    const operation             = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    mvkTokenStorage             = await mvkTokenInstance.storage();
                    const finalMvkGovernance    = mvkTokenStorage.governanceAddress;
    
                    // Assertions
                    assert.notStrictEqual(initMvkGovernance, newGovernance);
                    assert.strictEqual(finalMvkGovernance, newGovernance);
                    assert.notStrictEqual(initMvkGovernance, finalMvkGovernance);
    
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        
            it('%setAdmin', async () => {
                try{
                    // Initial values
                    const newAdmin      = alice.pkh;
                    const initMvkAdmin  = mvkTokenStorage.admin;
    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'setAdmin',
                        [
                            mvkTokenAddress.address,
                            newAdmin
                        ]
                    );
                    const operation     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    mvkTokenStorage     = await mvkTokenInstance.storage();
                    const finalMvkAdmin = mvkTokenStorage.admin;
    
                    // Assertions
                    assert.notStrictEqual(initMvkAdmin, newAdmin);
                    assert.strictEqual(finalMvkAdmin, newAdmin);
                    assert.notStrictEqual(initMvkAdmin, finalMvkAdmin);
    
                } catch(e){
                    console.dir(e, {depth: 5});
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'addVestee',
                        [
                            vestingAddress.address,
                            vesteeAddress,
                            totalAllocatedAmount,
                            cliffInMonths,
                            vestingInMonths
                        ]
                    );
                    const operation             = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
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
                    console.dir(e, {depth: 5});
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateVestee',
                        [
                            vestingAddress.address,
                            vesteeAddress,
                            newTotalAllocatedAmount,
                            newCliffInMonths,
                            newVestingInMonths
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
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
                    console.dir(e, {depth: 5});
                } 
            });

            it('%toggleVesteeLock', async () => {
                try{
                    // Initial values
                    vestingStorage                  = await vestingInstance.storage();
                    const vesteeAddress             = alice.pkh;
                    const initVesteeRecord          = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'toggleVesteeLock',
                        [
                            vestingAddress.address,
                            vesteeAddress
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
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
                    console.dir(e, {depth: 5});
                } 
            });

            it('%removeVestee', async () => {
                try{
                    // Initial values
                    vestingStorage                  = await vestingInstance.storage();
                    const vesteeAddress             = alice.pkh;
                    const initVesteeRecord          = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'removeVestee',
                        [
                            vestingAddress.address,
                            vesteeAddress
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    vestingStorage                  = await vestingInstance.storage();
                    const finalVesteeRecord         = await vestingStorage.vesteeLedger.get(vesteeAddress);
    
                    // Assertions
                    assert.notStrictEqual(initVesteeRecord, undefined);
                    assert.strictEqual(finalVesteeRecord, undefined);

                } catch(e){
                    console.dir(e, {depth: 5});
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'setName',
                        [
                            farmAddress.address,
                            farmNewName
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const finalFarmName             = farmStorage.name;

                    // Assertions
                    assert.notStrictEqual(finalFarmName, initFarmName);
                    assert.strictEqual(finalFarmName, farmNewName);
                    assert.notStrictEqual(initFarmName, farmNewName);

                } catch(e){
                    console.dir(e, {depth: 5});
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'initFarm',
                        [
                            farmAddress.address,
                            totalBlocks,
                            currentRewardPerBlock,
                            forceRewardFromTransfer,
                            infinite
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
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
                    console.dir(e, {depth: 5});
                } 
            });

            it('%closeFarm', async () => {
                try{
                    // Initial values
                    farmStorage                     = await farmInstance.storage();
                    const initFarmOpen              = farmStorage.open;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'closeFarm',
                        [
                            farmAddress.address
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const finalFarmOpen             = farmStorage.open;

                    // Assertions
                    assert.notEqual(finalFarmOpen, initFarmOpen);
                    assert.equal(finalFarmOpen, false);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('%pauseAll', async () => {
                try{
                    // Initial values
                    farmStorage                     = await farmInstance.storage();
                    const initFarmBreakGlassConfig  = await farmStorage.breakGlassConfig;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'pauseAll',
                        [
                            farmAddress.address
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const finalFarmBreakGlassConfig = await farmStorage.breakGlassConfig;

                    // Assertions
                    assert.equal(initFarmBreakGlassConfig.depositIsPaused, false);
                    assert.equal(initFarmBreakGlassConfig.withdrawIsPaused, false);
                    assert.equal(initFarmBreakGlassConfig.claimIsPaused, false);
                    assert.equal(finalFarmBreakGlassConfig.depositIsPaused, true);
                    assert.equal(finalFarmBreakGlassConfig.withdrawIsPaused, true);
                    assert.equal(finalFarmBreakGlassConfig.claimIsPaused, true);


                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('%unpauseAll', async () => {
                try{
                    // Initial values
                    farmStorage                     = await farmInstance.storage();
                    const initFarmBreakGlassConfig  = await farmStorage.breakGlassConfig;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'unpauseAll',
                        [
                            farmAddress.address
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const finalFarmBreakGlassConfig = await farmStorage.breakGlassConfig;

                    // Assertions
                    assert.equal(initFarmBreakGlassConfig.depositIsPaused, true);
                    assert.equal(initFarmBreakGlassConfig.withdrawIsPaused, true);
                    assert.equal(initFarmBreakGlassConfig.claimIsPaused, true);
                    assert.equal(finalFarmBreakGlassConfig.depositIsPaused, false);
                    assert.equal(finalFarmBreakGlassConfig.withdrawIsPaused, false);
                    assert.equal(finalFarmBreakGlassConfig.claimIsPaused, false);


                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    farmStorage                         = await farmInstance.storage();
                    const updateConfigAction            = "ConfigForceRewardFromTransfer";
                    const targetContractType            = "farm";
                    const updateConfigNewValue          = 1;
                    const initConfigValue               = farmStorage.config.forceRewardFromTransfer;
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            farmAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    farmStorage                         = await farmInstance.storage();
                    const finalConfigValue              = farmStorage.config.forceRewardFromTransfer;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'createFarm',
                        [
                            farmFactoryAddress.address,
                            farmName,
                            addToGeneralContracts,
                            forceRewardFromTransfer,
                            infinite,
                            totalBlocks,
                            currentRewardPerBlock,
                            metadataBytes,
                            lpTokenAddress,
                            lpTokenId,
                            lpTokenStandard
                        ]
                    );
                    const operation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
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
                    console.dir(e, {depth: 5});
                } 
            });

            it('%setProductLambda', async () => {
                try{
                    // Initial values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const lambdaName                    = "lambdaUnstake";
                    const newFarmUnstakeLambda          = doormanLambdas.lambdaNewUnstake;
                    const initFarmUnstakeLambda         = farmFactoryStorage.farmLambdaLedger.get(lambdaName);
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'setProductLambda',
                        [
                            farmFactoryAddress.address,
                            lambdaName,
                            newFarmUnstakeLambda
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const finalFarmFactoryUnstakeLambda = farmFactoryStorage.farmLambdaLedger.get(lambdaName);

                    // Assertions
                    assert.notStrictEqual(initFarmUnstakeLambda, finalFarmFactoryUnstakeLambda);
                    assert.strictEqual(finalFarmFactoryUnstakeLambda, newFarmUnstakeLambda);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const updateConfigAction            = "ConfigFarmNameMaxLength";
                    const targetContractType            = "farmFactory";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = farmFactoryStorage.config.farmNameMaxLength.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            farmFactoryAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const finalConfigValue              = farmFactoryStorage.config.farmNameMaxLength.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Treasury Contract', function() {

            before('Change the Treasury contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    treasuryStorage     = await treasuryInstance.storage();
    
                    // Operation
                    if(treasuryStorage.admin !== governanceProxyAddress.address){
                        const operation = await treasuryInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%mintMvkAndTransfer', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const receiverAddress               = alice.pkh;
                    const mintedAmount                  = MVK(2);
                    const initReceiverMvkLedger         = await mvkTokenStorage.ledger.get(receiverAddress);
                    const initReceiverMvkBalance        = initReceiverMvkLedger ? initReceiverMvkLedger.toNumber() : 0;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'mintMvkAndTransfer',
                        [
                            treasuryAddress.address,
                            receiverAddress,
                            mintedAmount
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const finalReceiverMvkLedger        = await mvkTokenStorage.ledger.get(receiverAddress);
                    const finalReceiverMvkBalance       = finalReceiverMvkLedger ? finalReceiverMvkLedger.toNumber() : 0;

                    // Assertions
                    assert.equal(finalReceiverMvkBalance, initReceiverMvkBalance + mintedAmount);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%stakeMvk', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const stakedAmount                  = MVK(2);
                    const initTreasurySMvkLedger        = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
                    const initTreasurySMvkBalance       = initTreasurySMvkLedger ? initTreasurySMvkLedger.balance.toNumber() : 0;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'stakeMvk',
                        [
                            treasuryAddress.address,
                            stakedAmount
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const finalTreasurySMvkLedger       = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
                    const finalTreasurySMvkBalance      = finalTreasurySMvkLedger ? finalTreasurySMvkLedger.balance.toNumber() : 0;

                    // Assertions
                    assert.equal(finalTreasurySMvkBalance, initTreasurySMvkBalance + stakedAmount);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%unstakeMvk', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const unstakedAmount                = MVK();
                    const initTreasurySMvkLedger        = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
                    const initTreasurySMvkBalance       = initTreasurySMvkLedger ? initTreasurySMvkLedger.balance.toNumber() : 0;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'unstakeMvk',
                        [
                            treasuryAddress.address,
                            unstakedAmount
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const finalTreasurySMvkLedger       = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
                    const finalTreasurySMvkBalance      = finalTreasurySMvkLedger ? finalTreasurySMvkLedger.balance.toNumber() : 0;

                    // Assertions
                    assert.notEqual(finalTreasurySMvkBalance, initTreasurySMvkBalance);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Treasury Factory Contract', function() {

            before('Change the Treasury Factory contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    treasuryFactoryStorage    = await treasuryFactoryInstance.storage();
    
                    // Operation
                    if(treasuryFactoryStorage.admin !== governanceProxyAddress.address){
                        const operation     = await treasuryFactoryInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%createTreasury', async () => {
                try{
                    // Initial values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    governanceStorage                   = await governanceInstance.storage();
                    const treasuryName                  = "TreasuryTest";
                    const addToGeneralContracts         = true;
                    const metadataBytes                 = Buffer.from(
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
                        ).toString('hex')
                    const initTrackedTreasuryLength     = treasuryFactoryStorage.trackedTreasuries.length;
                    const initTreasuryTestGovernance    = await governanceStorage.generalContracts.get(treasuryName);
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'createTreasury',
                        [
                            treasuryFactoryAddress.address,
                            addToGeneralContracts,
                            metadataBytes
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    governanceStorage                   = await governanceInstance.storage();
                    const createdTreasuryAddress        = treasuryFactoryStorage.trackedTreasuries[0];
                    const createdTreasuryInstance       = await utils.tezos.contract.at(createdTreasuryAddress);
                    const createdTreasuryStorage: any   = await createdTreasuryInstance.storage();
                    const finalTrackedFarmsLength       = treasuryFactoryStorage.trackedTreasuries.length;
                    const finalTreasuryTestGovernance   = await governanceStorage.generalContracts.get(treasuryName);

                    // Assertions
                    assert.equal(initTrackedTreasuryLength, 0);
                    assert.equal(initTreasuryTestGovernance, undefined);
                    assert.equal(finalTrackedFarmsLength, 1);
                    console.log(await governanceStorage.generalContracts)
                    assert.strictEqual(finalTreasuryTestGovernance, createdTreasuryAddress);
                    assert.strictEqual(createdTreasuryStorage.name, treasuryName);


                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const updateConfigAction            = "ConfigTreasuryNameMaxLength";
                    const targetContractType            = "treasuryFactory";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = treasuryFactoryStorage.config.treasuryNameMaxLength.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            treasuryFactoryAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const finalConfigValue              = treasuryFactoryStorage.config.treasuryNameMaxLength.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Governance Contract', function() {

            before('Change the Governance contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    governanceStorage       = await governanceInstance.storage();
    
                    // Operation
                    if(governanceStorage.admin !== governanceProxyAddress.address){
                        const operation     = await governanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%setGovernanceProxy', async () => {
                try{
                    // Initial values
                    governanceStorage                   = await governanceInstance.storage();
                    const newGovernanceProxyAddress     = bob.pkh;
                    const initGovernanceProxyAddress    = governanceStorage.governanceProxyAddress;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'setGovernanceProxy',
                        [
                            governanceAddress.address,
                            newGovernanceProxyAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    governanceStorage                   = await governanceInstance.storage();
                    const finalGovernanceProxyAddress   = governanceStorage.governanceProxyAddress;

                    // Assertions
                    assert.notStrictEqual(initGovernanceProxyAddress, finalGovernanceProxyAddress);
                    assert.strictEqual(initGovernanceProxyAddress, governanceProxyAddress.address);
                    assert.strictEqual(finalGovernanceProxyAddress, newGovernanceProxyAddress);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateWhitelistDevelopers', async () => {
                try{
                    // Initial values
                    governanceStorage                           = await governanceInstance.storage();
                    const newWhistlistedDeveloperAddress        = trudy.pkh;
                    const initGovernanceWhitelistedDevelopers   = await governanceStorage.whitelistDevelopers;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateWhitelistDevelopers',
                        [
                            governanceAddress.address,
                            newWhistlistedDeveloperAddress
                        ]
                    );
                    const operation                             = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    governanceStorage                           = await governanceInstance.storage();
                    const finalGovernanceWhitelistedDevelopers  = await governanceStorage.whitelistDevelopers;
                    console.log(finalGovernanceWhitelistedDevelopers);

                    // Assertions
                    assert.notEqual(initGovernanceWhitelistedDevelopers.length, finalGovernanceWhitelistedDevelopers.length);
                    assert.equal(newWhistlistedDeveloperAddress in finalGovernanceWhitelistedDevelopers, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    governanceStorage                   = await governanceInstance.storage();
                    const updateConfigAction            = "ConfigSuccessReward";
                    const targetContractType            = "governance";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = governanceStorage.config.successReward.toNumber();
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            governanceAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    governanceStorage                   = await governanceInstance.storage();
                    const finalConfigValue              = governanceStorage.config.successReward.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Aggregator', function() {

            before('Change the Aggregator contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    aggregatorStorage       = await aggregatorInstance.storage();
    
                    // Operation
                    if(aggregatorStorage.admin !== governanceProxyAddress.address){
                        const operation     = await aggregatorInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    aggregatorStorage                   = await aggregatorInstance.storage();
                    const updateConfigAction            = "ConfigDecimals";
                    const targetContractType            = "aggregator";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = aggregatorStorage.config.decimals.toNumber();
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            aggregatorAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    aggregatorStorage                   = await aggregatorInstance.storage();
                    const finalConfigValue              = aggregatorStorage.config.decimals.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('AggregatorFactory', function() {

            before('Change the AggregatorFactory contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
    
                    // Operation
                    if(aggregatorFactoryStorage.admin !== governanceProxyAddress.address){
                        const operation     = await aggregatorFactoryInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const updateConfigAction            = "ConfigAggregatorNameMaxLength";
                    const targetContractType            = "aggregatorFactory";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = aggregatorFactoryStorage.config.aggregatorNameMaxLength.toNumber();
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            aggregatorFactoryAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const finalConfigValue              = aggregatorFactoryStorage.config.aggregatorNameMaxLength.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('BreakGlass', function() {

            before('Change the BreakGlass contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    breakGlassStorage       = await breakGlassInstance.storage();
    
                    // Operation
                    if(breakGlassStorage.admin !== governanceProxyAddress.address){
                        const operation     = await breakGlassInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    breakGlassStorage                   = await breakGlassInstance.storage();
                    const updateConfigAction            = "ConfigActionExpiryDays";
                    const targetContractType            = "breakGlass";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = breakGlassStorage.config.actionExpiryDays.toNumber();
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            breakGlassAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    breakGlassStorage            = await breakGlassInstance.storage();
                    const finalConfigValue              = breakGlassStorage.config.actionExpiryDays.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Council', function() {

            before('Change the Council contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    councilStorage       = await councilInstance.storage();
    
                    // Operation
                    if(councilStorage.admin !== governanceProxyAddress.address){
                        const operation     = await councilInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    councilStorage                      = await councilInstance.storage();
                    const updateConfigAction            = "ConfigActionExpiryDays";
                    const targetContractType            = "council";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = councilStorage.config.actionExpiryDays.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            councilAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    councilStorage                      = await councilInstance.storage();
                    const finalConfigValue              = councilStorage.config.actionExpiryDays.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Delegation', function() {

            before('Change the Delegation contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    delegationStorage       = await delegationInstance.storage();
    
                    // Operation
                    if(delegationStorage.admin !== governanceProxyAddress.address){
                        const operation     = await delegationInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    delegationStorage                   = await delegationInstance.storage();
                    const updateConfigAction            = "ConfigDelegationRatio";
                    const targetContractType            = "delegation";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = delegationStorage.config.delegationRatio.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            delegationAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    delegationStorage                   = await delegationInstance.storage();
                    const finalConfigValue              = delegationStorage.config.delegationRatio.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Doorman', function() {

            before('Change the Doorman contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    doormanStorage          = await doormanInstance.storage();
    
                    // Operation
                    if(doormanStorage.admin !== governanceProxyAddress.address){
                        const operation     = await doormanInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    doormanStorage                      = await doormanInstance.storage();
                    const updateConfigAction            = "ConfigMinMvkAmount";
                    const targetContractType            = "doorman";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = doormanStorage.config.minMvkAmount.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            doormanAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    doormanStorage                      = await delegationInstance.storage();
                    const finalConfigValue              = doormanStorage.config.minMvkAmount.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('EmergencyGovernance', function() {

            before('Change the EmergencyGovernance contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    emergencyGovernanceStorage          = await emergencyGovernanceInstance.storage();
    
                    // Operation
                    if(emergencyGovernanceStorage.admin !== governanceProxyAddress.address){
                        const operation     = await emergencyGovernanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    emergencyGovernanceStorage          = await emergencyGovernanceInstance.storage();
                    const updateConfigAction            = "ConfigVoteExpiryDays";
                    const targetContractType            = "emergencyGovernance";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = emergencyGovernanceStorage.config.voteExpiryDays.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            emergencyGovernanceAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    emergencyGovernanceStorage          = await emergencyGovernanceInstance.storage();
                    const finalConfigValue              = emergencyGovernanceStorage.config.voteExpiryDays.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('GovernanceFinancial', function() {

            before('Change the GovernanceFinancial contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    governanceFinancialStorage          = await governanceFinancialInstance.storage();
    
                    // Operation
                    if(governanceFinancialStorage.admin !== governanceProxyAddress.address){
                        const operation     = await governanceFinancialInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    governanceFinancialStorage          = await governanceFinancialInstance.storage();
                    const updateConfigAction            = "ConfigFinancialReqApprovalPct";
                    const targetContractType            = "governanceFinancial";
                    const updateConfigNewValue          = 10;
                    const initConfigValue               = governanceFinancialStorage.config.financialRequestApprovalPercentage.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            governanceFinancialAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    governanceFinancialStorage          = await governanceFinancialInstance.storage();
                    const finalConfigValue              = governanceFinancialStorage.config.financialRequestApprovalPercentage.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('GovernanceSatellite', function() {

            before('Change the GovernanceSatellite contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
    
                    // Operation
                    if(governanceSatelliteStorage.admin !== governanceProxyAddress.address){
                        const operation     = await governanceSatelliteInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
                    const updateConfigAction            = "ConfigApprovalPercentage";
                    const targetContractType            = "governanceSatellite";
                    const updateConfigNewValue          = 10;
                    const initConfigValue               = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            governanceSatelliteAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
                    const finalConfigValue              = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('LendingController', function() {

            before('Change the LendingController contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    lendingControllerStorage          = await lendingControllerInstance.storage();
    
                    // Operation
                    if(lendingControllerStorage.admin !== governanceProxyAddress.address){
                        const operation     = await lendingControllerInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const updateConfigAction            = "ConfigCollateralRatio";
                    const targetContractType            = "lendingController";
                    const updateConfigNewValue          = 10;
                    const initConfigValue               = lendingControllerStorage.config.collateralRatio.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            lendingControllerAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    lendingControllerStorage          = await lendingControllerInstance.storage();
                    const finalConfigValue              = lendingControllerStorage.config.collateralRatio.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('TokenSale', function() {

            before('Change the TokenSale contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    tokenSaleStorage          = await tokenSaleInstance.storage();
    
                    // Operation
                    if(tokenSaleStorage.admin !== governanceProxyAddress.address){
                        const operation     = await tokenSaleInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    tokenSaleStorage                    = await tokenSaleInstance.storage();
                    const updateConfigAction            = "ConfigMaxAmountCap";
                    const targetContractType            = "tokenSale";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = (await tokenSaleStorage.config.buyOptions.get("1")).maxAmountCap.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            tokenSaleAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue,
                            1
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    tokenSaleStorage                    = await tokenSaleInstance.storage();
                    const finalConfigValue              = (await tokenSaleStorage.config.buyOptions.get("1")).maxAmountCap.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('VaultFactory', function() {

            before('Change the VaultFactory contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(bob.sk)
                    vaultFactoryStorage          = await vaultFactoryInstance.storage();
    
                    // Operation
                    if(vaultFactoryStorage.admin !== governanceProxyAddress.address){
                        const operation     = await vaultFactoryInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    vaultFactoryStorage                 = await vaultFactoryInstance.storage();
                    const updateConfigAction            = "ConfigVaultNameMaxLength";
                    const targetContractType            = "vaultFactory";
                    const updateConfigNewValue          = 10;
                    const initConfigValue               = vaultFactoryStorage.config.vaultNameMaxLength.toNumber();
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateConfig',
                        [
                            vaultFactoryAddress.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    vaultFactoryStorage                 = await vaultFactoryInstance.storage();
                    const finalConfigValue              = vaultFactoryStorage.config.vaultNameMaxLength.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Misc', function() {

            it('%setLambda', async () => {
                try{
                    // Initial values
                    doormanStorage                      = await doormanInstance.storage();
                    const lambdaName                    = "lambdaUnstake";
                    const newDoormanUnstakeLambda       = doormanLambdas.lambdaNewUnstake;
                    const initDoormanUnstakeLambda      = doormanStorage.lambdaLedger.get(lambdaName);
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'setLambda',
                        [
                            doormanAddress.address,
                            lambdaName,
                            newDoormanUnstakeLambda
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalDoormanUnstakeLambda     = doormanStorage.lambdaLedger.get(lambdaName);

                    // Assertions
                    assert.notStrictEqual(initDoormanUnstakeLambda, finalDoormanUnstakeLambda);
                    assert.strictEqual(finalDoormanUnstakeLambda, newDoormanUnstakeLambda);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateMetadata', async () => {
                try{
                    // Initial values
                    doormanStorage                      = await doormanInstance.storage();
                    const metadataKey                   = "";
                    const newDoormanMetadata            = Buffer.from(
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
                    const initDoormanMetadata           = await doormanStorage.metadata.get(metadataKey);
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateMetadata',
                        [
                            doormanAddress.address,
                            metadataKey,
                            newDoormanMetadata
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalDoormanMetadata          = await doormanStorage.metadata.get(metadataKey);

                    // Assertions
                    assert.notStrictEqual(initDoormanMetadata, finalDoormanMetadata);
                    assert.strictEqual(finalDoormanMetadata, newDoormanMetadata);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateWhitelistContracts', async () => {
                try{
                    // Initial values
                    doormanStorage                      = await doormanInstance.storage();
                    const whitelistContractName         = "test";
                    const whitelistContractAddress      = bob.pkh;
                    const initDoormanWhitelistContract  = await doormanStorage.whitelistContracts.get(whitelistContractName);
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateWhitelistContracts',
                        [
                            doormanAddress.address,
                            whitelistContractName,
                            whitelistContractAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalDoormanWhitelistContract = await doormanStorage.whitelistContracts.get(whitelistContractName);

                    // Assertions
                    assert.notStrictEqual(initDoormanWhitelistContract, finalDoormanWhitelistContract);
                    assert.strictEqual(finalDoormanWhitelistContract, whitelistContractAddress);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateGeneralContracts', async () => {
                try{
                    // Initial values
                    doormanStorage                      = await doormanInstance.storage();
                    const generalContractName           = "test";
                    const generalContractAddress        = bob.pkh;
                    const initDoormanGeneralContract    = await doormanStorage.generalContracts.get(generalContractName);
                    
                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateGeneralContracts',
                        [
                            doormanAddress.address,
                            generalContractName,
                            generalContractAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalDoormanGeneralContract   = await doormanStorage.generalContracts.get(generalContractName);

                    // Assertions
                    assert.notStrictEqual(initDoormanGeneralContract, finalDoormanGeneralContract);
                    assert.strictEqual(finalDoormanGeneralContract, generalContractAddress);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateWhitelistTokenContracts', async () => {
                try{
                    // Initial values
                    treasuryFactoryStorage                              = await treasuryFactoryInstance.storage();
                    const whitelistTokenContractName                    = "test";
                    const whitelistTokenContractAddress                 = bob.pkh;
                    const initTreasuryFactoryWhitelistTokenContract     = await treasuryFactoryStorage.whitelistTokenContracts.get(whitelistTokenContractName);
                    
                    // Operation
                    const lambdaFunction                                = await compileLambdaFunction(
                        'development',
                        governanceProxyAddress.address,
                        './contracts/main/governanceProxyLambdaFunction.ligo',
                        'updateWhitelistTokenContracts',
                        [
                            treasuryFactoryAddress.address,
                            whitelistTokenContractName,
                            whitelistTokenContractAddress
                        ]
                    );
                    const operation                                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage                              = await treasuryFactoryInstance.storage();
                    const finalTreasuryFactoryWhitelistTokenContract    = await treasuryFactoryStorage.whitelistTokenContracts.get(whitelistTokenContractName);

                    // Assertions
                    assert.notStrictEqual(initTreasuryFactoryWhitelistTokenContract, finalTreasuryFactoryWhitelistTokenContract);
                    assert.strictEqual(finalTreasuryFactoryWhitelistTokenContract, whitelistTokenContractAddress);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });
    });
});