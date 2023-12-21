import assert from 'assert';

import * as doormanLambdas from '../build/lambdas/doormanLambdas.json';
import { MVN, Utils } from './helpers/Utils';

const chai = require('chai');
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

import { bob, alice, eve, trudy, baker, mallory } from '../scripts/sandbox/accounts';
import { createLambdaBytes } from '@mavrykdynamics/create-lambda-bytes';
import { mockPackedLambdaData } from "./helpers/mockSampleData"
import { 
    signerFactory, 
    getStorageMapValue,
    fa12Transfer,
    fa2Transfer,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts,
    calcStakedMvnRequiredForActionApproval, 
    calcTotalVotingPower 
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe('Governance proxy lambdas tests', async () => {
    
    var utils: Utils;
    let tezos

    let user 
    let userSk 
    
    let admin 
    let adminSk 

    let tokenId = 0
    let tokenAmount

    let lambdaFunction;

    let governanceProxyInstance;
    let mvnTokenInstance;
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
    let vaultFactoryInstance;
    let mavenFa12TokenInstance;
    let mavenFa2TokenInstance;

    let governanceProxyStorage;
    let mvnTokenStorage;
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
    let mavenFa12TokenStorage;
    let mavenFa2TokenStorage;

    // operations
    let setAdminOperation
    let resetAdminOperation
    let transferOperation
    let mistakenTransferOperation
    let setGovernanceOperation
    let executeGovernanceActionOperation


    before('setup', async () => {
        try {
            
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos 

            governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            mvnTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
            vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
            farmInstance                    = await utils.tezos.contract.at(contractDeployments.farm.address);
            farmFactoryInstance             = await utils.tezos.contract.at(contractDeployments.farmFactory.address);
            treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
            treasuryFactoryInstance         = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
            governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            doormanInstance                 = await utils.tezos.contract.at(contractDeployments.doorman.address);
            aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
            aggregatorFactoryInstance       = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
            councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
            delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
            emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            lendingControllerInstance       = await utils.tezos.contract.at(contractDeployments.lendingController.address);
            vaultFactoryInstance            = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);
            mavenFa12TokenInstance         = await utils.tezos.contract.at(contractDeployments.mavenFa12Token.address);
            mavenFa2TokenInstance          = await utils.tezos.contract.at(contractDeployments.mavenFa2Token.address);

            governanceProxyStorage          = await governanceProxyInstance.storage();
            mvnTokenStorage                 = await mvnTokenInstance.storage();
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
            vaultFactoryStorage             = await vaultFactoryInstance.storage();
            mavenFa12TokenStorage          = await mavenFa12TokenInstance.storage();
            mavenFa2TokenStorage           = await mavenFa2TokenInstance.storage();

            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
            
        } catch(e){
            console.dir(e, {depth:5})
        }
    });


    describe('%executeGovernanceAction', function() {

        describe('MVN Token Contract', function() {

            before('Change the MVN Token contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    mvnTokenStorage     = await mvnTokenInstance.storage();
    
                    // Operation
                    if(mvnTokenStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation = await mvnTokenInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateInflationRate', async () => {
                try{
                    // Initial values
                    mvnTokenStorage                     = await mvnTokenInstance.storage();
                    const initInflationRate             = mvnTokenStorage.inflationRate.toNumber();
                    const newInflationRate              = initInflationRate * 2;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateInflationRate',
                        [
                            contractDeployments.mvnToken.address,
                            newInflationRate
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    mvnTokenStorage                     = await mvnTokenInstance.storage();
                    const finalInflationRate            = mvnTokenStorage.inflationRate.toNumber();

                    // Assertions
                    assert.notEqual(initInflationRate, finalInflationRate);
                    assert.equal(newInflationRate, finalInflationRate);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%triggerInflation', async () => {
                try{
                    // Initial values
                    mvnTokenStorage                     = await mvnTokenInstance.storage();
                    const initInflationTimestamp        = mvnTokenStorage.nextInflationTimestamp;
                    const initMaximumSupply             = mvnTokenStorage.maximumSupply;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'triggerInflation',
                        [
                            contractDeployments.mvnToken.address
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    mvnTokenStorage                     = await mvnTokenInstance.storage();
                    const finalInflationTimestamp       = mvnTokenStorage.nextInflationTimestamp;
                    const finalMaximumSupply            = mvnTokenStorage.maximumSupply;

                    // Assertions
                    assert.notEqual(finalMaximumSupply, initMaximumSupply);
                    assert.notEqual(finalInflationTimestamp, initInflationTimestamp);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('%setGovernance', async () => {
                try{
                    // Initial values
                    const newGovernance         = alice.pkh;
                    const initMvnGovernance     = mvnTokenStorage.governanceAddress;
    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'setGovernance',
                        [
                            contractDeployments.mvnToken.address,
                            newGovernance
                        ]
                    );

                    executeGovernanceActionOperation             = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    mvnTokenStorage             = await mvnTokenInstance.storage();
                    const finalMvnGovernance    = mvnTokenStorage.governanceAddress;
    
                    // Assertions
                    assert.notStrictEqual(initMvnGovernance, newGovernance);
                    assert.strictEqual(finalMvnGovernance, newGovernance);
                    assert.notStrictEqual(initMvnGovernance, finalMvnGovernance);
    
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        
            it('%setAdmin', async () => {
                try{
                    // Initial values
                    let newAdmin      = alice.pkh;
                    const initMvnAdmin  = mvnTokenStorage.admin;
    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'setAdmin',
                        [
                            contractDeployments.mvnToken.address,
                            newAdmin
                        ]
                    );

                    executeGovernanceActionOperation     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();

                    // Final values
                    mvnTokenStorage     = await mvnTokenInstance.storage();
                    const finalMvnAdmin = mvnTokenStorage.admin;
    
                    // Assertions
                    assert.notStrictEqual(initMvnAdmin, newAdmin);
                    assert.strictEqual(finalMvnAdmin, newAdmin);
                    assert.notStrictEqual(initMvnAdmin, finalMvnAdmin);

                    // Reset Operation
                    newAdmin = bob.pkh;
                    await signerFactory(tezos, alice.sk);
                    setAdminOperation     = await mvnTokenInstance.methods.setAdmin(newAdmin).send();
                    await setAdminOperation.confirmation();
    
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

        });

        describe('Vesting Contract', function() {

            before('Change the Vesting contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    vestingStorage      = await vestingInstance.storage();
    
                    // Operation
                    if(vestingStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation = await vestingInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'addVestee',
                        [
                            contractDeployments.vesting.address,
                            vesteeAddress,
                            totalAllocatedAmount,
                            cliffInMonths,
                            vestingInMonths
                        ]
                    );
                    executeGovernanceActionOperation             = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateVestee',
                        [
                            contractDeployments.vesting.address,
                            vesteeAddress,
                            newTotalAllocatedAmount,
                            newCliffInMonths,
                            newVestingInMonths
                        ]
                    );
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'toggleVesteeLock',
                        [
                            contractDeployments.vesting.address,
                            vesteeAddress
                        ]
                    );
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'removeVestee',
                        [
                            contractDeployments.vesting.address,
                            vesteeAddress
                        ]
                    );
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    await signerFactory(tezos, bob.sk)
                    farmStorage         = await farmInstance.storage();
    
                    // Operation
                    if(farmStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation = await farmInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%setName', async () => {
                try{
                    // Initial values
                    farmStorage                     = await farmInstance.storage();
                    const farmNewName               = "FarmProxyTest";
                    const initFarmName              = farmStorage.name;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'setName',
                        [
                            contractDeployments.farm.address,
                            farmNewName
                        ]
                    );
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'initFarm',
                        [
                            contractDeployments.farm.address,
                            totalBlocks,
                            currentRewardPerBlock,
                            forceRewardFromTransfer,
                            infinite
                        ]
                    );
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'closeFarm',
                        [
                            contractDeployments.farm.address
                        ]
                    );
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'pauseAll',
                        [
                            contractDeployments.farm.address
                        ]
                    );
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'unpauseAll',
                        [
                            contractDeployments.farm.address
                        ]
                    );
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.farm.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    farmStorage                         = await farmInstance.storage();
                    const targetEntrypoint              = "Deposit";
                    const targetContractType            = "farm";
                    const initConfigValue               = farmStorage.breakGlassConfig.depositIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.farm.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    farmStorage                         = await farmInstance.storage();
                    const finalConfigValue              = farmStorage.breakGlassConfig.depositIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Farm Factory Contract', function() {

            before('Change the Farm Factory contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    farmFactoryStorage  = await farmFactoryInstance.storage();
    
                    // Operation
                    if(farmFactoryStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation = await farmFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    const farmName                  = "FarmProxyTest";
                    const addToGeneralContracts     = true;
                    const forceRewardFromTransfer   = false;
                    const infinite                  = true;
                    const totalBlocks               = 999;
                    const currentRewardPerBlock     = 123;
                    const metadataBytes             = Buffer.from(
                        JSON.stringify({
                        name: 'MAVEN Farm',
                        description: 'MAVEN Farm Contract',
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
                        authors: ['MAVEN Dev Team <contact@maven.finance>'],
                        }),
                        'ascii',
                    ).toString('hex');
                    const lpTokenAddress            = contractDeployments.mTokenEurl.address;
                    const lpTokenId                 = 0;
                    const lpTokenStandard           = "FA2";
                    const initTrackedFarmsLength    = farmFactoryStorage.trackedFarms.length;
                    const initFarmTestGovernance    = await governanceStorage.generalContracts.get(farmName);
    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'createFarm',
                        [
                            contractDeployments.farmFactory.address,
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
                    executeGovernanceActionOperation                 = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const updateConfigAction            = "ConfigFarmNameMaxLength";
                    const targetContractType            = "farmFactory";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = farmFactoryStorage.config.farmNameMaxLength.toNumber();
                    
                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.farmFactory.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const targetEntrypoint              = "CreateFarm";
                    const targetContractType            = "farmFactory";
                    const initConfigValue               = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.farmFactory.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const finalConfigValue              = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%trackFarm', async () => {
                try{
                    // Initial values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const targetContractType            = "farm";
                    const targetContractAddress         = contractDeployments.farm.address;
                    const initTrackProductContracts     = farmFactoryStorage.trackedFarms.length;

                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'trackProductContract',
                        [
                            contractDeployments.farmFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const finalTrackProductContracts    = farmFactoryStorage.trackedFarms.length;

                    // Assertions
                    assert.notEqual(initTrackProductContracts, finalTrackProductContracts);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%untrackFarm', async () => {
                try{
                    // Initial values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const targetContractType            = "farm";
                    const targetContractAddress         = bob.pkh;
                    const initTrackProductContracts     = farmFactoryStorage.trackedFarms.length;

                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'trackProductContract',
                        [
                            contractDeployments.farmFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const finalTrackProductContracts    = farmFactoryStorage.trackedFarms.length;

                    // Assertions
                    assert.notEqual(initTrackProductContracts, finalTrackProductContracts);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%setProductLambda', async () => {
                try{
                    // Initial values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const lambdaName                    = "lambdaUnstakeMvn";
                    const newFarmUnstakeLambda          = doormanLambdas.lambdaNewUnstake;
                    const initFarmUnstakeLambda         = await farmFactoryStorage.mFarmLambdaLedger.get(lambdaName);
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'setProductLambda',
                        [
                            contractDeployments.farmFactory.address,
                            lambdaName,
                            newFarmUnstakeLambda,
                            "MFarm"
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const finalFarmFactoryUnstakeLambda = await farmFactoryStorage.mFarmLambdaLedger.get(lambdaName);

                    // Assertions
                    assert.notStrictEqual(initFarmUnstakeLambda, finalFarmFactoryUnstakeLambda);
                    assert.strictEqual(finalFarmFactoryUnstakeLambda, newFarmUnstakeLambda);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        });

        describe('Treasury Contract', function() {

            before('Change the Treasury contract admin and sends token to it', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    treasuryStorage     = await treasuryInstance.storage();
    
                    // Set WhitelistContracts Operation
                    const adminWhitelist        = await treasuryStorage.whitelistContracts.get(contractDeployments.governanceProxy.address);
                    if(adminWhitelist === undefined){
                        const updateWhitelistContractsOperation    = await treasuryInstance.methods.updateWhitelistContracts(contractDeployments.governanceProxy.address, "update").send();
                        await updateWhitelistContractsOperation.confirmation();
                    }
    
                    // Transfer Operations
                    // XTX
                    const transferXTZOperation  = await utils.tezos.contract.transfer({ to: contractDeployments.treasury.address, amount: 50});
                    await transferXTZOperation.confirmation();
                    
                    // FA12
                    const fa12InTreasury        = await treasuryStorage.whitelistTokenContracts.get(contractDeployments.mavenFa12Token.address);
                    if(fa12InTreasury === undefined){
                        const updateWhitelistTokenContractsOperation    = await treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mavenFa12Token.address, "update").send();
                        await updateWhitelistTokenContractsOperation.confirmation();
                    }
                    const transferFA12Operation = await mavenFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.treasury.address, 50).send();
                    await transferFA12Operation.confirmation();
                    
                    // FA2
                    const fa2InTreasury         = await treasuryStorage.whitelistTokenContracts.get(contractDeployments.mavenFa2Token.address);
                    if(fa2InTreasury === undefined){
                        const updateWhitelistTokenContractsOperation    = await treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mavenFa2Token.address, "update").send();
                        await updateWhitelistTokenContractsOperation.confirmation();
                    }
                    const transferFA2Operation  = await mavenFa2TokenInstance.methods.transfer([
                        {
                            from_: bob.pkh,
                            txs: [
                                {
                                    to_: contractDeployments.treasury.address,
                                    token_id: 0,
                                    amount: 50
                                }
                            ]
                        }
                    ]).send();
                    await transferFA2Operation.confirmation();
    
                    // Set Admin Operation
                    if(treasuryStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation = await treasuryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%mintMvnAndTransfer', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mvnTokenStorage                     = await mvnTokenInstance.storage();
                    const receiverAddress               = alice.pkh;
                    const mintedAmount                  = MVN(2);
                    const initReceiverMvnLedger         = await mvnTokenStorage.ledger.get(receiverAddress);
                    const initReceiverMvnBalance        = initReceiverMvnLedger ? initReceiverMvnLedger.toNumber() : 0;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'mintMvnAndTransfer',
                        [
                            contractDeployments.treasury.address,
                            receiverAddress,
                            mintedAmount
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mvnTokenStorage                     = await mvnTokenInstance.storage();
                    const finalReceiverMvnLedger        = await mvnTokenStorage.ledger.get(receiverAddress);
                    const finalReceiverMvnBalance       = finalReceiverMvnLedger ? finalReceiverMvnLedger.toNumber() : 0;

                    // Assertions
                    assert.equal(finalReceiverMvnBalance, initReceiverMvnBalance + mintedAmount);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%updateTokenOperators', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mvnTokenStorage                     = await mvnTokenInstance.storage();
                    const initTreasuryOperators         = await mvnTokenStorage.operators.get({
                        0: contractDeployments.treasury.address,
                        1: bob.pkh,
                        2: 0
                    }) as string;
                    const operators                     = [
                        {
                            addOperator: {
                                owner: contractDeployments.treasury.address,
                                operator: contractDeployments.doorman.address,
                                tokenId: 0
                            }
                        },
                        {
                            addOperator: {
                                owner: contractDeployments.treasury.address,
                                operator: bob.pkh,
                                tokenId: 0
                            }
                        }
                    ];
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateTokenOperators',
                        [
                            contractDeployments.treasury.address,
                            contractDeployments.mvnToken.address,
                            operators
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mvnTokenStorage                     = await mvnTokenInstance.storage();
                    const finalTreasuryOperators        = await mvnTokenStorage.operators.get({
                        0: contractDeployments.treasury.address,
                        1: bob.pkh,
                        2: 0
                    }) as string;

                    // Assertions
                    assert.strictEqual(initTreasuryOperators, undefined);
                    assert.notStrictEqual(finalTreasuryOperators, undefined);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%stakeTokens', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const stakedAmount                  = MVN(2);
                    const initTreasurySMvnLedger        = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);
                    const initTreasurySMvnBalance       = initTreasurySMvnLedger ? initTreasurySMvnLedger.balance.toNumber() : 0;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'stakeTokens',
                        [
                            contractDeployments.treasury.address,
                            contractDeployments.doorman.address,
                            stakedAmount
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const finalTreasurySMvnLedger       = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);
                    const finalTreasurySMvnBalance      = finalTreasurySMvnLedger ? finalTreasurySMvnLedger.balance.toNumber() : 0;

                    // Assertions
                    assert.equal(finalTreasurySMvnBalance, initTreasurySMvnBalance + stakedAmount);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%unstakeTokens', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const unstakedAmount                = MVN();
                    const initTreasurySMvnLedger        = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);
                    const initTreasurySMvnBalance       = initTreasurySMvnLedger ? initTreasurySMvnLedger.balance.toNumber() : 0;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'unstakeTokens',
                        [
                            contractDeployments.treasury.address,
                            contractDeployments.doorman.address,
                            unstakedAmount
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const finalTreasurySMvnLedger       = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);
                    const finalTreasurySMvnBalance      = finalTreasurySMvnLedger ? finalTreasurySMvnLedger.balance.toNumber() : 0;

                    // Assertions
                    assert.notEqual(finalTreasurySMvnBalance, initTreasurySMvnBalance);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%transfer', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mavenFa12TokenStorage              = await mavenFa12TokenInstance.storage();
                    mavenFa2TokenStorage               = await mavenFa2TokenInstance.storage();
                    const receiver                      = alice.pkh;
                    const initUserFA12Ledger            = await mavenFa12TokenStorage.ledger.get(receiver)
                    const initUserFA12Balance           = initUserFA12Ledger ? initUserFA12Ledger.balance.toNumber() : 0;
                    const initUserFA2Ledger             = await mavenFa2TokenStorage.ledger.get(receiver)
                    const initUserFA2Balance            = initUserFA2Ledger ? initUserFA2Ledger.toNumber() : 0;
                    const initUserXTZBalance            = (await utils.tezos.tz.getBalance(receiver)).toNumber();
                    const tokenAmount                   = 50;
                    const transfers                     = [
                        {
                            to_: receiver,
                            amount: tokenAmount,
                            token: {
                                fa12: contractDeployments.mavenFa12Token.address
                            }
                        },
                        {
                            to_: receiver,
                            amount: tokenAmount,
                            token: {
                                fa2: {
                                    tokenContractAddress: contractDeployments.mavenFa2Token.address,
                                    tokenId: 0
                                }
                            }
                        },
                        {
                            to_: receiver,
                            amount: tokenAmount,
                            token: "tez"
                        },
                    ];
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'transfer',
                        [
                            contractDeployments.treasury.address,
                            transfers
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mavenFa12TokenStorage              = await mavenFa12TokenInstance.storage();
                    mavenFa2TokenStorage               = await mavenFa2TokenInstance.storage();
                    const finalUserFA12Ledger           = await mavenFa12TokenStorage.ledger.get(receiver)
                    const finalUserFA12Balance          = finalUserFA12Ledger ? finalUserFA12Ledger.balance.toNumber() : 0;
                    const finalUserFA2Ledger            = await mavenFa2TokenStorage.ledger.get(receiver)
                    const finalUserFA2Balance           = finalUserFA2Ledger ? finalUserFA2Ledger.toNumber() : 0;
                    const finalUserXTZBalance           = (await utils.tezos.tz.getBalance(receiver)).toNumber();

                    // Assertions
                    assert.equal(finalUserFA12Balance, initUserFA12Balance + tokenAmount);
                    assert.equal(finalUserFA2Balance, initUserFA2Balance + tokenAmount);
                    assert.equal(finalUserXTZBalance, initUserXTZBalance + tokenAmount);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    const targetEntrypoint              = "Transfer";
                    const targetContractType            = "treasury";
                    const initConfigValue               = treasuryStorage.breakGlassConfig.transferIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.treasury.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    const finalConfigValue              = treasuryStorage.breakGlassConfig.transferIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Treasury Factory Contract', function() {

            before('Change the Treasury Factory contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    treasuryFactoryStorage    = await treasuryFactoryInstance.storage();
    
                    // Operation
                    if(treasuryFactoryStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await treasuryFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    const treasuryName                  = "TreasuryProxyTest";
                    const addToGeneralContracts         = true;
                    const metadataBytes                 = Buffer.from(
                        JSON.stringify({
                            name: 'MAVEN PLENTY-USDTz Farm',
                            description: 'MAVEN Farm Contract',
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
                            authors: ['MAVEN Dev Team <contact@maven.finance>'],
                        }),
                        'ascii',
                        ).toString('hex')
                    const initTrackedTreasuryLength     = treasuryFactoryStorage.trackedTreasuries.length;
                    const initTreasuryTestGovernance    = await governanceStorage.generalContracts.get(treasuryName);
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'createTreasury',
                        [
                            contractDeployments.treasuryFactory.address,
                            baker.pkh,
                            treasuryName,
                            addToGeneralContracts,
                            metadataBytes
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.treasuryFactory.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const targetEntrypoint              = "CreateTreasury";
                    const targetContractType            = "treasuryFactory";
                    const initConfigValue               = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.treasuryFactory.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const finalConfigValue              = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%trackTreasury', async () => {
                try{
                    // Initial values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const targetContractType            = "treasury";
                    const targetContractAddress         = contractDeployments.treasury.address;
                    const initTrackProductContracts     = treasuryFactoryStorage.trackedTreasuries.length;

                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'trackProductContract',
                        [
                            contractDeployments.treasuryFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const finalTrackProductContracts    = treasuryFactoryStorage.trackedTreasuries.length;

                    // Assertions
                    assert.notEqual(initTrackProductContracts, finalTrackProductContracts);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%untrackTreasury', async () => {
                try{
                    // Initial values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const targetContractType            = "treasury";
                    const targetContractAddress         = contractDeployments.treasury.address;
                    const initTrackProductContracts     = treasuryFactoryStorage.trackedTreasuries.length;

                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'untrackProductContract',
                        [
                            contractDeployments.treasuryFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const finalTrackProductContracts    = treasuryFactoryStorage.trackedTreasuries.length;

                    // Assertions
                    assert.notEqual(initTrackProductContracts, finalTrackProductContracts);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Governance Contract', function() {

            before('Change the Governance contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    governanceStorage       = await governanceInstance.storage();
    
                    // Operation
                    if(governanceStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await governanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'setGovernanceProxy',
                        [
                            contractDeployments.governance.address,
                            newGovernanceProxyAddress
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    governanceStorage                   = await governanceInstance.storage();
                    const finalGovernanceProxyAddress   = governanceStorage.governanceProxyAddress;

                    // Assertions
                    assert.notStrictEqual(initGovernanceProxyAddress, finalGovernanceProxyAddress);
                    assert.strictEqual(initGovernanceProxyAddress, contractDeployments.governanceProxy.address);
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateWhitelistDevelopers',
                        [
                            contractDeployments.governance.address,
                            newWhistlistedDeveloperAddress
                        ]
                    );
                    executeGovernanceActionOperation                             = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    governanceStorage                           = await governanceInstance.storage();
                    const finalGovernanceWhitelistedDevelopers  = await governanceStorage.whitelistDevelopers;

                    // Assertions
                    assert.notEqual(initGovernanceWhitelistedDevelopers.length, finalGovernanceWhitelistedDevelopers.length);

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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

        describe('Aggregator Contract', function() {

            before('Change the Aggregator contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    aggregatorStorage       = await aggregatorInstance.storage();
    
                    // Operation
                    if(aggregatorStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await aggregatorInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.aggregator.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    aggregatorStorage                   = await aggregatorInstance.storage();
                    const targetEntrypoint              = "UpdateData";
                    const targetContractType            = "aggregator";
                    const initConfigValue               = aggregatorStorage.breakGlassConfig.updateDataIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.aggregator.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    aggregatorStorage                   = await aggregatorInstance.storage();
                    const finalConfigValue              = aggregatorStorage.breakGlassConfig.updateDataIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Aggregator Factory Contract', function() {

            before('Change the AggregatorFactory contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
    
                    // Operation
                    if(aggregatorFactoryStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await aggregatorFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.aggregatorFactory.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%createAggregator', async () => {
                try{
                    // Initial values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const aggregatorName                = "AggregatorProxyTest";
                    const addToGeneralContracts         = true;
                    const oraclesInformation            = [
                        {
                            oracleAddress: bob.pkh,
                            oraclePublicKey: bob.pk,
                            oraclePeerId: bob.peerId
                        }
                    ];
                    const decimals                      = 6;
                    const alphaPercentPerThousand       = 10;
                    const percentOracleThreshold        = 10;
                    const heartbeatSeconds              = 5;
                    const rewardAmountStakedMvn         = 100;
                    const rewardAmountXtz               = 100;
                    const metadata                      = Buffer.from(
                            JSON.stringify({
                                name: 'MAVEN Aggregator Contract',
                                icon: 'https://logo.chainbit.xyz/xtz',
                                version: 'v1.0.0',
                                authors: ['MAVEN Dev Team <contact@maven.finance>'],
                            }),
                            'ascii',
                        ).toString('hex');
                    const initTrackedAggregatorsLength  = aggregatorFactoryStorage.trackedAggregators.length;
                    const initAggregatorTestGovernance  = await governanceStorage.generalContracts.get(aggregatorName);
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'createAggregator',
                        [
                            contractDeployments.aggregatorFactory.address,
                            aggregatorName,
                            addToGeneralContracts,
                            oraclesInformation,
                            decimals,
                            alphaPercentPerThousand,
                            percentOracleThreshold,
                            heartbeatSeconds,
                            rewardAmountStakedMvn,
                            rewardAmountXtz,
                            metadata
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    governanceStorage                   = await governanceInstance.storage();
                    const createdAggregatorAddress      = aggregatorFactoryStorage.trackedAggregators[0];
                    const createdAggregatorInstance     = await utils.tezos.contract.at(createdAggregatorAddress);
                    const createdAggregatorStorage: any = await createdAggregatorInstance.storage();
                    const finalTrackedAggregatorLength  = aggregatorFactoryStorage.trackedAggregators.length;
                    const finalAggregatorTestGovernance = await governanceStorage.generalContracts.get(aggregatorName);

                    // Assertions
                    assert.equal(initTrackedAggregatorsLength, 0);
                    assert.equal(initAggregatorTestGovernance, undefined);
                    assert.equal(finalTrackedAggregatorLength, 1);
                    assert.strictEqual(finalAggregatorTestGovernance, createdAggregatorAddress);
                    assert.strictEqual(createdAggregatorStorage.name, aggregatorName);
                    assert.strictEqual(createdAggregatorStorage.config.decimals.toNumber(), decimals);
                    assert.strictEqual(createdAggregatorStorage.config.alphaPercentPerThousand.toNumber(), alphaPercentPerThousand);
                    assert.strictEqual(createdAggregatorStorage.config.percentOracleThreshold.toNumber(), percentOracleThreshold);
                    assert.strictEqual(createdAggregatorStorage.config.heartbeatSeconds.toNumber(), heartbeatSeconds);
                    assert.strictEqual(createdAggregatorStorage.config.rewardAmountStakedMvn.toNumber(), rewardAmountStakedMvn);
                    assert.strictEqual(createdAggregatorStorage.config.rewardAmountXtz.toNumber(), rewardAmountXtz);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const targetEntrypoint              = "CreateAggregator";
                    const targetContractType            = "aggregatorFactory";
                    const initConfigValue               = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.aggregatorFactory.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const finalConfigValue              = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%trackAggregator', async () => {
                try{
                    // Initial values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const targetContractType            = "aggregator";
                    const targetContractAddress         = contractDeployments.aggregator.address;
                    const initTrackProductContracts     = aggregatorFactoryStorage.trackedAggregators.length;

                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'trackProductContract',
                        [
                            contractDeployments.aggregatorFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const finalTrackProductContracts    = aggregatorFactoryStorage.trackedAggregators.length;

                    // Assertions
                    assert.notEqual(initTrackProductContracts, finalTrackProductContracts);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%untrackAggregator', async () => {
                try{
                    // Initial values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const targetContractType            = "aggregator";
                    const targetContractAddress         = contractDeployments.aggregator.address;
                    const initTrackProductContracts     = aggregatorFactoryStorage.trackedAggregators.length;

                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'untrackProductContract',
                        [
                            contractDeployments.aggregatorFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                    const finalTrackProductContracts    = aggregatorFactoryStorage.trackedAggregators.length;

                    // Assertions
                    assert.notEqual(initTrackProductContracts, finalTrackProductContracts);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Break Glass Contract', function() {

            before('Change the BreakGlass contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    breakGlassStorage       = await breakGlassInstance.storage();
    
                    // Operation
                    if(breakGlassStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await breakGlassInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.breakGlass.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

        describe('Council Contract', function() {

            before('Change the Council contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    councilStorage       = await councilInstance.storage();
    
                    // Operation
                    if(councilStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

        describe('Delegation Contract', function() {

            before('Change the Delegation contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    delegationStorage       = await delegationInstance.storage();
    
                    // Operation
                    if(delegationStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await delegationInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.delegation.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    delegationStorage                   = await delegationInstance.storage();
                    const targetEntrypoint              = "DelegateToSatellite";
                    const targetContractType            = "delegation";
                    const initConfigValue               = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.delegation.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    delegationStorage                   = await delegationInstance.storage();
                    const finalConfigValue              = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Doorman Contract', function() {

            before('Change the Doorman contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    doormanStorage          = await doormanInstance.storage();
    
                    // Operation
                    if(doormanStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await doormanInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    doormanStorage                      = await doormanInstance.storage();
                    const updateConfigAction            = "ConfigMinMvnAmount";
                    const targetContractType            = "doorman";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = doormanStorage.config.minMvnAmount.toNumber();
                    
                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.doorman.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalConfigValue              = doormanStorage.config.minMvnAmount.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    doormanStorage                      = await doormanInstance.storage();
                    const targetEntrypoint              = "StakeMvn";
                    const targetContractType            = "doorman";
                    const initConfigValue               = doormanStorage.breakGlassConfig.stakeMvnIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.doorman.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalConfigValue              = doormanStorage.breakGlassConfig.stakeMvnIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Emergency Governance Contract', function() {

            before('Change the EmergencyGovernance contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    emergencyGovernanceStorage          = await emergencyGovernanceInstance.storage();
    
                    // Operation
                    if(emergencyGovernanceStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await emergencyGovernanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    emergencyGovernanceStorage          = await emergencyGovernanceInstance.storage();
                    const updateConfigAction            = "ConfigDurationInMinutes";
                    const targetContractType            = "emergencyGovernance";
                    const updateConfigNewValue          = 1010;
                    const initConfigValue               = emergencyGovernanceStorage.config.durationInMinutes.toNumber();
                    
                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.emergencyGovernance.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    emergencyGovernanceStorage          = await emergencyGovernanceInstance.storage();
                    const finalConfigValue              = emergencyGovernanceStorage.config.durationInMinutes.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Governance Financial Contract', function() {

            before('Change the GovernanceFinancial contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    governanceFinancialStorage          = await governanceFinancialInstance.storage();
    
                    // Operation
                    if(governanceFinancialStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await governanceFinancialInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateConfig', async () => {
                try{
                    // Initial values
                    governanceFinancialStorage          = await governanceFinancialInstance.storage();
                    const updateConfigAction            = "ConfigApprovalPercentage";
                    const targetContractType            = "governanceFinancial";
                    const updateConfigNewValue          = 10;
                    const initConfigValue               = governanceFinancialStorage.config.approvalPercentage.toNumber();
                    
                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governanceFinancial.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    governanceFinancialStorage          = await governanceFinancialInstance.storage();
                    const finalConfigValue              = governanceFinancialStorage.config.approvalPercentage.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Governance Satellite Contract', function() {

            before('Change the GovernanceSatellite contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
    
                    // Operation
                    if(governanceSatelliteStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await governanceSatelliteInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    const initConfigValue               = governanceSatelliteStorage.config.approvalPercentage.toNumber();
                    
                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governanceSatellite.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
                    const finalConfigValue              = governanceSatelliteStorage.config.approvalPercentage.toNumber();

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, updateConfigNewValue);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Lending Controller Contract', function() {

            before('Change the Lending Controller contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    lendingControllerStorage          = await lendingControllerInstance.storage();
    
                    // Operation
                    if(lendingControllerStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await lendingControllerInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.lendingController.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%setLoanToken (createLoanToken)', async () => {
                try{
                    // Initial values
                    lendingControllerStorage                    = await lendingControllerInstance.storage();
                    const tokenName                             = "Test";
                    const tokenDecimals                         = 2;
                    const oracleAddress                         = "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM";
                    const mTokenAddress                         = "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM";
                    const reserveRatio                          = 3;
                    const optimalUtilisationRate                = 4;
                    const baseInterestRate                      = 5;
                    const maxInterestRate                       = 6;
                    const interestRateBelowOptimalUtilisation   = 7;
                    const interestRateAboveOptimalUtilisation   = 8;
                    const minRepaymentAmount                    = 9;
                    const tokenType                             = {
                        fa2: {
                            tokenContractAddress: contractDeployments.mavenFa2Token.address,
                            tokenId             : 0
                        }
                    };
                    const setLoanTokenAction            = 
                    {
                        createLoanToken: {
                            tokenName                           : tokenName,
                            tokenDecimals                       : tokenDecimals,
                            oracleAddress                       : oracleAddress,
                            mTokenAddress                       : mTokenAddress,
                            reserveRatio                        : reserveRatio,
                            optimalUtilisationRate              : optimalUtilisationRate,
                            baseInterestRate                    : baseInterestRate,
                            maxInterestRate                     : maxInterestRate,
                            interestRateBelowOptimalUtilisation : interestRateBelowOptimalUtilisation,
                            interestRateAboveOptimalUtilisation : interestRateAboveOptimalUtilisation,
                            minRepaymentAmount                  : minRepaymentAmount,
                            tokenType                           : tokenType
                        }
                    };
                    const initLoanToken                 = await lendingControllerStorage.loanTokenLedger.get(tokenName);

                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        "setLoanToken",
                        [
                            contractDeployments.lendingController.address,
                            setLoanTokenAction
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalLoanToken                = await lendingControllerStorage.loanTokenLedger.get(tokenName);

                    // Assertions
                    assert.strictEqual(initLoanToken, undefined);
                    assert.notStrictEqual(finalLoanToken, undefined);
                    assert.equal(finalLoanToken.tokenName, tokenName);
                    assert.equal(finalLoanToken.tokenDecimals.toNumber(), tokenDecimals);
                    assert.equal(finalLoanToken.oracleAddress, oracleAddress);
                    assert.equal(finalLoanToken.mTokenAddress, mTokenAddress);
                    assert.equal(finalLoanToken.reserveRatio.toNumber(), reserveRatio);
                    assert.equal(finalLoanToken.optimalUtilisationRate.toNumber(), optimalUtilisationRate);
                    assert.equal(finalLoanToken.baseInterestRate.toNumber(), baseInterestRate);
                    assert.equal(finalLoanToken.maxInterestRate.toNumber(), maxInterestRate);
                    assert.equal(finalLoanToken.interestRateBelowOptimalUtilisation.toNumber(), interestRateBelowOptimalUtilisation);
                    assert.equal(finalLoanToken.interestRateAboveOptimalUtilisation.toNumber(), interestRateAboveOptimalUtilisation);
                    assert.equal(finalLoanToken.minRepaymentAmount.toNumber(), minRepaymentAmount);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%setLoanToken (updateLoanToken)', async () => {
                try{
                    // Initial values
                    lendingControllerStorage                    = await lendingControllerInstance.storage();
                    const tokenName                             = "Test";
                    const tokenDecimals                         = 2;
                    const oracleAddress                         = "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM";
                    const mTokenAddress                         = "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM";
                    const reserveRatio                          = 3;
                    const optimalUtilisationRate                = 4;
                    const baseInterestRate                      = 5;
                    const maxInterestRate                       = 6;
                    const interestRateBelowOptimalUtilisation   = 7;
                    const interestRateAboveOptimalUtilisation   = 8;
                    const minRepaymentAmount                    = 9;
                    const isPaused                              = true;
                    const setLoanTokenAction            = 
                    {
                        updateLoanToken: {
                            tokenName                           : tokenName,
                            tokenDecimals                       : tokenDecimals,
                            oracleAddress                       : oracleAddress,
                            reserveRatio                        : reserveRatio,
                            optimalUtilisationRate              : optimalUtilisationRate,
                            baseInterestRate                    : baseInterestRate,
                            maxInterestRate                     : maxInterestRate,
                            interestRateBelowOptimalUtilisation : interestRateBelowOptimalUtilisation,
                            interestRateAboveOptimalUtilisation : interestRateAboveOptimalUtilisation,
                            minRepaymentAmount                  : minRepaymentAmount,
                            isPaused                            : isPaused
                        }
                    };
                    const initLoanToken                 = await lendingControllerStorage.loanTokenLedger.get(tokenName);

                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        "setLoanToken",
                        [
                            contractDeployments.lendingController.address,
                            setLoanTokenAction
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalLoanToken                = await lendingControllerStorage.loanTokenLedger.get(tokenName);

                    // Assertions
                    assert.notStrictEqual(initLoanToken, undefined);
                    assert.notStrictEqual(finalLoanToken, undefined);
                    assert.equal(finalLoanToken.tokenName, tokenName);
                    assert.equal(finalLoanToken.tokenDecimals.toNumber(), tokenDecimals);
                    assert.equal(finalLoanToken.oracleAddress, oracleAddress);
                    assert.equal(finalLoanToken.reserveRatio.toNumber(), reserveRatio);
                    assert.equal(finalLoanToken.optimalUtilisationRate.toNumber(), optimalUtilisationRate);
                    assert.equal(finalLoanToken.baseInterestRate.toNumber(), baseInterestRate);
                    assert.equal(finalLoanToken.maxInterestRate.toNumber(), maxInterestRate);
                    assert.equal(finalLoanToken.interestRateBelowOptimalUtilisation.toNumber(), interestRateBelowOptimalUtilisation);
                    assert.equal(finalLoanToken.interestRateAboveOptimalUtilisation.toNumber(), interestRateAboveOptimalUtilisation);
                    assert.equal(finalLoanToken.minRepaymentAmount.toNumber(), minRepaymentAmount);
                    assert.equal(finalLoanToken.isPaused, isPaused);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%setCollateralToken (createCollateralToken)', async () => {
                try{
                    // Initial values
                    lendingControllerStorage                    = await lendingControllerInstance.storage();
                    const tokenName                             = "Test";
                    const tokenDecimals                         = 2;
                    const tokenContractAddress                  = "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM";
                    const oracleAddress                         = "tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM";
                    const protectedToken                        = false;
                    const isScaledToken                         = false;
                    const isStakedToken                         = false;
                    const tokenType                             = {
                        fa12: contractDeployments.mavenFa12Token.address
                    };
                    const setCollateralTokenAction              = 
                    {
                        createCollateralToken                   : {
                            tokenName                               : tokenName,
                            tokenContractAddress                    : tokenContractAddress,
                            tokenDecimals                           : tokenDecimals,
                            oracleAddress                           : oracleAddress,
                            protected                               : protectedToken,
                            isScaledToken                           : isScaledToken,
                            isStakedToken                           : isStakedToken,
                            tokenType                               : tokenType
                        }
                    };
                    const initCollateralToken                   = await lendingControllerStorage.collateralTokenLedger.get(tokenName);

                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        "setCollateralToken",
                        [
                            contractDeployments.lendingController.address,
                            setCollateralTokenAction
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalCollateralToken          = await lendingControllerStorage.collateralTokenLedger.get(tokenName);

                    // Assertions
                    assert.strictEqual(initCollateralToken, undefined);
                    assert.notStrictEqual(finalCollateralToken, undefined);
                    assert.equal(finalCollateralToken.tokenName, tokenName);
                    assert.equal(finalCollateralToken.tokenContractAddress, tokenContractAddress);
                    assert.equal(finalCollateralToken.tokenDecimals.toNumber(), tokenDecimals);
                    assert.equal(finalCollateralToken.protected, protectedToken);
                    assert.equal(finalCollateralToken.isScaledToken, isScaledToken);
                    assert.equal(finalCollateralToken.isStakedToken, isStakedToken);
                    assert.equal(finalCollateralToken.stakingContractAddress, null);
                    assert.equal(finalCollateralToken.maxDepositAmount, null);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%setCollateralToken (updateCollateralToken)', async () => {
                try{
                    // Initial values
                    lendingControllerStorage                    = await lendingControllerInstance.storage();
                    const tokenName                             = "Test";
                    const oracleAddress                         = alice.pkh;
                    const isPaused                              = true;
                    const stakingContractAddress                = alice.pkh;
                    const maxDepositAmount                      = 50;
                    const setCollateralTokenAction              = 
                    {
                        updateCollateralToken                   : {
                            tokenName                               : tokenName,
                            oracleAddress                           : oracleAddress,
                            isPaused                                : isPaused,
                            stakingContractAddress                  : stakingContractAddress,
                            maxDepositAmount                        : maxDepositAmount
                        }
                    };
                    const initCollateralToken                   = await lendingControllerStorage.collateralTokenLedger.get(tokenName);

                    // Operation
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        "setCollateralToken",
                        [
                            contractDeployments.lendingController.address,
                            setCollateralTokenAction
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalCollateralToken          = await lendingControllerStorage.collateralTokenLedger.get(tokenName);

                    // Assertions
                    assert.notStrictEqual(initCollateralToken, undefined);
                    assert.notStrictEqual(finalCollateralToken, undefined);
                    assert.equal(finalCollateralToken.tokenName, tokenName);
                    assert.equal(finalCollateralToken.oracleAddress, oracleAddress);
                    assert.equal(finalCollateralToken.isPaused, isPaused);
                    assert.equal(finalCollateralToken.stakingContractAddress, stakingContractAddress);
                    assert.equal(finalCollateralToken.maxDepositAmount.toNumber(), maxDepositAmount);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const targetEntrypoint              = "SetLoanToken";
                    const targetContractType            = "lendingController";
                    const initConfigValue               = lendingControllerStorage.breakGlassConfig.setLoanTokenIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.lendingController.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalConfigValue              = lendingControllerStorage.breakGlassConfig.setLoanTokenIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });


        describe('Vault Factory Contract', function() {

            before('Change the VaultFactory contract admin', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    vaultFactoryStorage          = await vaultFactoryInstance.storage();
    
                    // Operation
                    if(vaultFactoryStorage.admin !== contractDeployments.governanceProxy.address){
                        executeGovernanceActionOperation     = await vaultFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await executeGovernanceActionOperation.confirmation();
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
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.vaultFactory.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    vaultFactoryStorage                 = await vaultFactoryInstance.storage();
                    const targetEntrypoint              = "CreateVault";
                    const targetContractType            = "vaultFactory";
                    const initConfigValue               = vaultFactoryStorage.breakGlassConfig.createVaultIsPaused;
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.vaultFactory.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    vaultFactoryStorage                 = await vaultFactoryInstance.storage();
                    const finalConfigValue              = vaultFactoryStorage.breakGlassConfig.createVaultIsPaused;

                    // Assertions
                    assert.notEqual(initConfigValue, finalConfigValue);
                    assert.equal(finalConfigValue, true);

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
                    const lambdaName                    = "lambdaUnstakeMvn";
                    const newDoormanUnstakeLambda       = doormanLambdas.lambdaNewUnstake;
                    const initDoormanUnstakeLambda      = doormanStorage.lambdaLedger.get(lambdaName);
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'setLambda',
                        [
                            contractDeployments.doorman.address,
                            lambdaName,
                            newDoormanUnstakeLambda
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalDoormanUnstakeLambda     = await doormanStorage.lambdaLedger.get(lambdaName);

                    // Assertions
                    assert.notStrictEqual(initDoormanUnstakeLambda, finalDoormanUnstakeLambda);
                    assert.strictEqual(finalDoormanUnstakeLambda, newDoormanUnstakeLambda);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('%setProductLambda', async () => {
                try{
                    // Initial values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const lambdaName                    = "lambdaUnstakeMvn";
                    const newTreasuryUnstakeLambda      = doormanLambdas.lambdaNewUnstake;
                    const initTreasuryUnstakeLambda     = await treasuryFactoryStorage.treasuryLambdaLedger.get(lambdaName);
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'setProductLambda',
                        [
                            contractDeployments.treasuryFactory.address,
                            lambdaName,
                            newTreasuryUnstakeLambda
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const finalTreasuryFactoryUnstakeLambda = await treasuryFactoryStorage.treasuryLambdaLedger.get(lambdaName);

                    // Assertions
                    assert.notStrictEqual(initTreasuryUnstakeLambda, finalTreasuryFactoryUnstakeLambda);
                    assert.strictEqual(finalTreasuryFactoryUnstakeLambda, newTreasuryUnstakeLambda);

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
                        name: 'MAVEN PLENTY-USDTz Farm',
                        description: 'MAVEN Farm Contract',
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
                        authors: ['MAVEN Dev Team <contact@maven.finance>'],
                        }),
                        'ascii',
                    ).toString('hex');
                    const initDoormanMetadata           = await doormanStorage.metadata.get(metadataKey);
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateMetadata',
                        [
                            contractDeployments.doorman.address,
                            metadataKey,
                            newDoormanMetadata
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    const whitelistContractAddress      = bob.pkh;
                    const initDoormanWhitelistContract  = await doormanStorage.whitelistContracts.get(whitelistContractAddress);
                    
                    // Operation
                    lambdaFunction        = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateWhitelistContracts',
                        [
                            contractDeployments.doorman.address,
                            whitelistContractAddress,
                            "Update"
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalDoormanWhitelistContract = await doormanStorage.whitelistContracts.get(whitelistContractAddress);

                    // Assertions
                    assert.strictEqual(initDoormanWhitelistContract, undefined);
                    assert.notStrictEqual(finalDoormanWhitelistContract, undefined);

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
                    lambdaFunction                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateGeneralContracts',
                        [
                            contractDeployments.doorman.address,
                            generalContractName,
                            generalContractAddress,
                            "Update"
                        ]
                    );
                    executeGovernanceActionOperation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
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
                    const whitelistTokenContractAddress                 = bob.pkh;
                    const initTreasuryFactoryWhitelistTokenContract     = await treasuryFactoryStorage.whitelistTokenContracts.get(whitelistTokenContractAddress);
                    
                    // Operation
                    lambdaFunction                                = await createLambdaBytes(
                        tezos.rpc.url,
                        contractDeployments.governanceProxy.address,
                        
                        'updateWhitelistTokenContracts',
                        [
                            contractDeployments.treasuryFactory.address,
                            whitelistTokenContractAddress,
                            "Update"
                        ]
                    );
                    executeGovernanceActionOperation                                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await executeGovernanceActionOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage                              = await treasuryFactoryInstance.storage();
                    const finalTreasuryFactoryWhitelistTokenContract    = await treasuryFactoryStorage.whitelistTokenContracts.get(whitelistTokenContractAddress);

                    // Assertions
                    assert.notStrictEqual(initTreasuryFactoryWhitelistTokenContract, finalTreasuryFactoryWhitelistTokenContract);
                    assert.notStrictEqual(finalTreasuryFactoryWhitelistTokenContract, undefined);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });
    });

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            governanceProxyStorage        = await governanceProxyInstance.storage();
            await signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                governanceProxyStorage   = await governanceProxyInstance.storage();
                const currentAdmin  = governanceProxyStorage.admin;

                // Operation
                setAdminOperation   = await governanceProxyInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                governanceProxyStorage   = await governanceProxyInstance.storage();
                const newAdmin      = governanceProxyStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await signerFactory(tezos, alice.sk);
                resetAdminOperation = await governanceProxyInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                governanceProxyStorage       = await governanceProxyInstance.storage();
                const currentGovernance = governanceProxyStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceProxyInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                governanceProxyStorage       = await governanceProxyInstance.storage();
                const updatedGovernance = governanceProxyStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await governanceProxyInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await governanceProxyInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                governanceProxyStorage       = await governanceProxyInstance.storage();            

                const updatedData       = await governanceProxyStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavenFa2Tokens to Contract
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, user, contractDeployments.governanceProxy.address, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const initialUserBalance    = (await mavenFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await mistakenTransferFa2Token(governanceProxyInstance, user, contractDeployments.mavenFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavenFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            governanceProxyStorage = await governanceProxyInstance.storage();
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceProxyStorage  = await governanceProxyInstance.storage();
                const currentAdmin      = governanceProxyStorage.admin;

                // Operation
                setAdminOperation = await governanceProxyInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                governanceProxyStorage  = await governanceProxyInstance.storage();
                const newAdmin          = governanceProxyStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceProxyStorage   = await governanceProxyInstance.storage();
                const currentGovernance  = governanceProxyStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceProxyInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                governanceProxyStorage   = await governanceProxyInstance.storage();
                const updatedGovernance  = governanceProxyStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata           - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                governanceProxyStorage  = await governanceProxyInstance.storage();   
                const initialMetadata   = await governanceProxyStorage.metadata.get(key);

                // Operation
                const updateOperation = await governanceProxyInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                governanceProxyStorage  = await governanceProxyInstance.storage();            
                const updatedData       = await governanceProxyStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavenFa2Tokens to Contract
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, mallory.pkh, contractDeployments.aggregatorFactory.address, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(governanceProxyInstance, mallory.pkh, contractDeployments.mavenFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%executeGovernanceAction  - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomGovernanceActionBytes = mockPackedLambdaData.updateCouncilConfig;

                const executeGovernanceActionOperation = governanceProxyInstance.methods.executeGovernanceAction(randomGovernanceActionBytes); 
                await chai.expect(executeGovernanceActionOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = governanceProxyInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })
});