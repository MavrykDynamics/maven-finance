import assert from 'assert';
import { Utils, MVK } from './helpers/Utils';
import * as doormanLambdas from '../build/lambdas/doormanLambdas.json';

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

import { bob, alice, eve, trudy, baker } from '../scripts/sandbox/accounts';
import { compileLambdaFunction } from '../scripts/proxyLambdaFunctionMaker/proxyLambdaFunctionPacker'
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe('Governance proxy lambdas tests', async () => {
    
    var utils: Utils;
    let tezos

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
    let vaultFactoryInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;

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
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;

    before('setup', async () => {
        try {
            
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos 

            governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
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
            mavrykFa12TokenInstance         = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
            mavrykFa2TokenInstance          = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);

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
            vaultFactoryStorage             = await vaultFactoryInstance.storage();
            mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
            mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();

            // console.log('-- -- -- -- -- Governance Proxy Tests -- -- -- --')
            // console.log('Governance Proxy Contract deployed at:'        , governanceProxyInstance.address);
            // console.log('MVK Token Contract deployed at:'               , mvkTokenInstance.address);
            // console.log('Vesting Contract deployed at:'                 , vestingInstance.address);
            // console.log('Farm Contract deployed at:'                    , farmInstance.address);
            // console.log('Farm Factory Contract deployed at:'            , farmFactoryInstance.address);
            // console.log('Treasury Contract deployed at:'                , treasuryInstance.address);
            // console.log('Treasury Factory Contract deployed at:'        , treasuryFactoryInstance.address);
            // console.log('Governance Contract deployed at:'              , governanceInstance.address);
            // console.log('Doorman Contract deployed at:'                 , doormanInstance.address);
            // console.log('Aggregator Contract deployed at:'              , aggregatorInstance.address);
            // console.log('Aggregator Factory Contract deployed at:'      , aggregatorFactoryInstance.address);
            // console.log('Break Glass Contract deployed at:'             , breakGlassInstance.address);
            // console.log('Council Contract deployed at:'                 , councilInstance.address);
            // console.log('Delegation Contract deployed at:'              , delegationInstance.address);
            // console.log('Emergency Governance Contract deployed at:'    , emergencyGovernanceInstance.address);
            // console.log('Governance Financial Contract deployed at:'    , governanceFinancialInstance.address);
            // console.log('Governance Satellite Contract deployed at:'    , governanceSatelliteInstance.address);
            // console.log('Lending Controller Contract deployed at:'      , lendingControllerInstance.address);
            // console.log('Vault Factory Contract deployed at:'           , vaultFactoryInstance.address);
            // console.log('Mavryk FA12 Contract deployed at:'             , mavrykFa12TokenInstance.address);
            // console.log('Mavryk FA2 Contract deployed at:'              , mavrykFa2TokenInstance.address);

            // console.log('Bob address: '         + bob.pkh);
            // console.log('Alice address: '       + alice.pkh);
            // console.log('Eve address: '         + eve.pkh);
            // console.log('Mallory address: '     + mallory.pkh);
            // console.log('Oscar address: '       + oscar.pkh);
            // console.log('-- -- -- -- -- -- -- -- --')

        } catch(e){
            console.dir(e, {depth:5})
        }
    });

    describe('%setAdmin', function() {

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{        

                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(governanceProxyInstance.methods.setAdmin(eve.pkh).send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        }); 
        
        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{        

                await helperFunctions.signerFactory(tezos, bob.sk);
                const setAdminOperation = await governanceProxyInstance.methods.setAdmin(eve.pkh).send();
                await setAdminOperation.confirmation();

                governanceProxyStorage   = await governanceProxyInstance.storage();            
                assert.equal(governanceProxyStorage.admin, eve.pkh);

                // reset treasury admin to bob
                await helperFunctions.signerFactory(tezos, eve.sk);
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
                await helperFunctions.signerFactory(tezos, eve.sk);
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
                await helperFunctions.signerFactory(tezos, bob.sk);
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    mvkTokenStorage     = await mvkTokenInstance.storage();
    
                    // Operation
                    if(mvkTokenStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation = await mvkTokenInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await operation.confirmation();
                    }
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            });

            it('%updateInflationRate', async () => {
                try{
                    // Initial values
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const initInflationRate             = mvkTokenStorage.inflationRate.toNumber();
                    const newInflationRate              = initInflationRate * 2;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateInflationRate',
                        [
                            contractDeployments.mvkToken.address,
                            newInflationRate
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const finalInflationRate            = mvkTokenStorage.inflationRate.toNumber();

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
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const initInflationTimestamp        = mvkTokenStorage.nextInflationTimestamp;
                    const initMaximumSupply             = mvkTokenStorage.maximumSupply;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'triggerInflation',
                        [
                            contractDeployments.mvkToken.address
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const finalInflationTimestamp       = mvkTokenStorage.nextInflationTimestamp;
                    const finalMaximumSupply            = mvkTokenStorage.maximumSupply;

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
                    const initMvkGovernance     = mvkTokenStorage.governanceAddress;
    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'setGovernance',
                        [
                            contractDeployments.mvkToken.address,
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
                        contractDeployments.governanceProxy.address,
                        
                        'setAdmin',
                        [
                            contractDeployments.mvkToken.address,
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    vestingStorage      = await vestingInstance.storage();
    
                    // Operation
                    if(vestingStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation = await vestingInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'toggleVesteeLock',
                        [
                            contractDeployments.vesting.address,
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
                        contractDeployments.governanceProxy.address,
                        
                        'removeVestee',
                        [
                            contractDeployments.vesting.address,
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    farmStorage         = await farmInstance.storage();
    
                    // Operation
                    if(farmStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation = await farmInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                    const farmNewName               = "FarmProxyTest";
                    const initFarmName              = farmStorage.name;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'setName',
                        [
                            contractDeployments.farm.address,
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
                        contractDeployments.governanceProxy.address,
                        
                        'closeFarm',
                        [
                            contractDeployments.farm.address
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
                        contractDeployments.governanceProxy.address,
                        
                        'pauseAll',
                        [
                            contractDeployments.farm.address
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
                        contractDeployments.governanceProxy.address,
                        
                        'unpauseAll',
                        [
                            contractDeployments.farm.address
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.farm.address,
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    farmStorage                         = await farmInstance.storage();
                    const targetEntrypoint              = "Deposit";
                    const targetContractType            = "farm";
                    const initConfigValue               = farmStorage.breakGlassConfig.depositIsPaused;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.farm.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    farmFactoryStorage  = await farmFactoryInstance.storage();
    
                    // Operation
                    if(farmFactoryStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation = await farmFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                    const farmName                  = "FarmProxyTest";
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
                    const lpTokenAddress            = contractDeployments.mTokenEurl.address;
                    const lpTokenId                 = 0;
                    const lpTokenStandard           = "FA2";
                    const initTrackedFarmsLength    = farmFactoryStorage.trackedFarms.length;
                    const initFarmTestGovernance    = await governanceStorage.generalContracts.get(farmName);
    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
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
                        contractDeployments.governanceProxy.address,
                        
                        'setProductLambda',
                        [
                            contractDeployments.farmFactory.address,
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.farmFactory.address,
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const targetEntrypoint              = "CreateFarm";
                    const targetContractType            = "farmFactory";
                    const initConfigValue               = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.farmFactory.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'trackProductContract',
                        [
                            contractDeployments.farmFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'trackProductContract',
                        [
                            contractDeployments.farmFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    farmFactoryStorage                  = await farmFactoryInstance.storage();
                    const finalTrackProductContracts    = farmFactoryStorage.trackedFarms.length;

                    // Assertions
                    assert.notEqual(initTrackProductContracts, finalTrackProductContracts);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });

        describe('Treasury Contract', function() {

            before('Change the Treasury contract admin and sends token to it', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    treasuryStorage     = await treasuryInstance.storage();
    
                    // Set WhitelistContracts Operation
                    const adminWhitelist        = await treasuryStorage.whitelistContracts.get("admin");
                    if(adminWhitelist === undefined){
                        const updateWhitelistContractsOperation    = await treasuryInstance.methods.updateWhitelistContracts("admin", contractDeployments.governanceProxy.address).send();
                        await updateWhitelistContractsOperation.confirmation();
                    }
    
                    // Transfer Operations
                    // XTX
                    const transferXTZOperation  = await utils.tezos.contract.transfer({ to: contractDeployments.treasury.address, amount: 50});
                    await transferXTZOperation.confirmation();
                    
                    // FA12
                    const fa12InTreasury        = await treasuryStorage.whitelistTokenContracts.get("mavrykFa12");
                    if(fa12InTreasury === undefined){
                        const updateWhitelistTokenContractsOperation    = await treasuryInstance.methods.updateWhitelistTokenContracts("mavrykFa12", contractDeployments.mavrykFa12Token.address).send();
                        await updateWhitelistTokenContractsOperation.confirmation();
                    }
                    const transferFA12Operation = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.treasury.address, 50).send();
                    await transferFA12Operation.confirmation();
                    
                    // FA2
                    const fa2InTreasury         = await treasuryStorage.whitelistTokenContracts.get("mavrykFa2");
                    if(fa2InTreasury === undefined){
                        const updateWhitelistTokenContractsOperation    = await treasuryInstance.methods.updateWhitelistTokenContracts("mavrykFa2", contractDeployments.mavrykFa2Token.address).send();
                        await updateWhitelistTokenContractsOperation.confirmation();
                    }
                    const transferFA2Operation  = await mavrykFa2TokenInstance.methods.transfer([
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
                        const operation = await treasuryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'mintMvkAndTransfer',
                        [
                            contractDeployments.treasury.address,
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

            it('%updateMvkOperators', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const initTreasuryOperators         = await mvkTokenStorage.operators.get({
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateMvkOperators',
                        [
                            contractDeployments.treasury.address,
                            operators
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const finalTreasuryOperators        = await mvkTokenStorage.operators.get({
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

            it('%stakeMvk', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const stakedAmount                  = MVK(2);
                    const initTreasurySMvkLedger        = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);
                    const initTreasurySMvkBalance       = initTreasurySMvkLedger ? initTreasurySMvkLedger.balance.toNumber() : 0;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'stakeMvk',
                        [
                            contractDeployments.treasury.address,
                            stakedAmount
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const finalTreasurySMvkLedger       = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);
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
                    const initTreasurySMvkLedger        = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);
                    const initTreasurySMvkBalance       = initTreasurySMvkLedger ? initTreasurySMvkLedger.balance.toNumber() : 0;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'unstakeMvk',
                        [
                            contractDeployments.treasury.address,
                            unstakedAmount
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    const finalTreasurySMvkLedger       = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);
                    const finalTreasurySMvkBalance      = finalTreasurySMvkLedger ? finalTreasurySMvkLedger.balance.toNumber() : 0;

                    // Assertions
                    assert.notEqual(finalTreasurySMvkBalance, initTreasurySMvkBalance);

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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.treasury.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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

            it('%transfer', async () => {
                try{
                    // Initial values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mavrykFa12TokenStorage              = await mavrykFa12TokenInstance.storage();
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const receiver                      = bob.pkh;
                    const initUserFA12Ledger            = await mavrykFa12TokenStorage.ledger.get(receiver)
                    const initUserFA12Balance           = initUserFA12Ledger ? initUserFA12Ledger.balance.toNumber() : 0;
                    const initUserFA2Ledger             = await mavrykFa2TokenStorage.ledger.get(receiver)
                    const initUserFA2Balance            = initUserFA2Ledger ? initUserFA2Ledger.toNumber() : 0;
                    const initUserXTZBalance            = (await utils.tezos.tz.getBalance(receiver)).toNumber();
                    const tokenAmount                   = 50;
                    const transfers                     = [
                        {
                            to_: receiver,
                            amount: tokenAmount,
                            token: {
                                fa12: contractDeployments.mavrykFa12Token.address
                            }
                        },
                        {
                            to_: receiver,
                            amount: tokenAmount,
                            token: {
                                fa2: {
                                    tokenContractAddress: contractDeployments.mavrykFa2Token.address,
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'transfer',
                        [
                            contractDeployments.treasury.address,
                            transfers
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    treasuryStorage                     = await treasuryInstance.storage();
                    mavrykFa12TokenStorage              = await mavrykFa12TokenInstance.storage();
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const finalUserFA12Ledger           = await mavrykFa12TokenStorage.ledger.get(receiver)
                    const finalUserFA12Balance          = finalUserFA12Ledger ? finalUserFA12Ledger.balance.toNumber() : 0;
                    const finalUserFA2Ledger            = await mavrykFa2TokenStorage.ledger.get(receiver)
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
        });

        describe('Treasury Factory Contract', function() {

            before('Change the Treasury Factory contract admin', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    treasuryFactoryStorage    = await treasuryFactoryInstance.storage();
    
                    // Operation
                    if(treasuryFactoryStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await treasuryFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                    const treasuryName                  = "TreasuryProxyTest";
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
                        contractDeployments.governanceProxy.address,
                        
                        'createTreasury',
                        [
                            baker.pkh,
                            contractDeployments.treasuryFactory.address,
                            treasuryName,
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.treasuryFactory.address,
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    treasuryFactoryStorage              = await treasuryFactoryInstance.storage();
                    const targetEntrypoint              = "CreateTreasury";
                    const targetContractType            = "treasuryFactory";
                    const initConfigValue               = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.treasuryFactory.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'trackProductContract',
                        [
                            contractDeployments.treasuryFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'untrackProductContract',
                        [
                            contractDeployments.treasuryFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    governanceStorage       = await governanceInstance.storage();
    
                    // Operation
                    if(governanceStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await governanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'setGovernanceProxy',
                        [
                            contractDeployments.governance.address,
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateWhitelistDevelopers',
                        [
                            contractDeployments.governance.address,
                            newWhistlistedDeveloperAddress
                        ]
                    );
                    const operation                             = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
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

        describe('Aggregator Contract', function() {

            before('Change the Aggregator contract admin', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    aggregatorStorage       = await aggregatorInstance.storage();
    
                    // Operation
                    if(aggregatorStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await aggregatorInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.aggregator.address,
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    aggregatorStorage                   = await aggregatorInstance.storage();
                    const targetEntrypoint              = "UpdateData";
                    const targetContractType            = "aggregator";
                    const initConfigValue               = aggregatorStorage.breakGlassConfig.updateDataIsPaused;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.aggregator.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
    
                    // Operation
                    if(aggregatorFactoryStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await aggregatorFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.aggregatorFactory.address,
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
                    const heartBeatSeconds              = 5;
                    const rewardAmountStakedMvk         = 100;
                    const rewardAmountXtz               = 100;
                    const metadata                      = Buffer.from(
                            JSON.stringify({
                                name: 'MAVRYK Aggregator Contract',
                                icon: 'https://logo.chainbit.xyz/xtz',
                                version: 'v1.0.0',
                                authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                            }),
                            'ascii',
                        ).toString('hex');
                    const initTrackedAggregatorsLength  = aggregatorFactoryStorage.trackedAggregators.length;
                    const initAggregatorTestGovernance  = await governanceStorage.generalContracts.get(aggregatorName);
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
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
                            heartBeatSeconds,
                            rewardAmountStakedMvk,
                            rewardAmountXtz,
                            metadata
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    assert.strictEqual(createdAggregatorStorage.config.heartBeatSeconds.toNumber(), heartBeatSeconds);
                    assert.strictEqual(createdAggregatorStorage.config.rewardAmountStakedMvk.toNumber(), rewardAmountStakedMvk);
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.aggregatorFactory.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'trackProductContract',
                        [
                            contractDeployments.aggregatorFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'untrackProductContract',
                        [
                            contractDeployments.aggregatorFactory.address,
                            targetContractType,
                            targetContractAddress
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    breakGlassStorage       = await breakGlassInstance.storage();
    
                    // Operation
                    if(breakGlassStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await breakGlassInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.breakGlass.address,
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

        describe('Council Contract', function() {

            before('Change the Council contract admin', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    councilStorage       = await councilInstance.storage();
    
                    // Operation
                    if(councilStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
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

        describe('Delegation Contract', function() {

            before('Change the Delegation contract admin', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    delegationStorage       = await delegationInstance.storage();
    
                    // Operation
                    if(delegationStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await delegationInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.delegation.address,
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    delegationStorage                   = await delegationInstance.storage();
                    const targetEntrypoint              = "DelegateToSatellite";
                    const targetContractType            = "delegation";
                    const initConfigValue               = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.delegation.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    doormanStorage          = await doormanInstance.storage();
    
                    // Operation
                    if(doormanStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await doormanInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.doorman.address,
                            targetContractType,
                            updateConfigAction,
                            updateConfigNewValue
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalConfigValue              = doormanStorage.config.minMvkAmount.toNumber();

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
                    const targetEntrypoint              = "Stake";
                    const targetContractType            = "doorman";
                    const initConfigValue               = doormanStorage.breakGlassConfig.stakeIsPaused;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.doorman.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    doormanStorage                      = await doormanInstance.storage();
                    const finalConfigValue              = doormanStorage.breakGlassConfig.stakeIsPaused;

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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    emergencyGovernanceStorage          = await emergencyGovernanceInstance.storage();
    
                    // Operation
                    if(emergencyGovernanceStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await emergencyGovernanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.emergencyGovernance.address,
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

        describe('Governance Financial Contract', function() {

            before('Change the GovernanceFinancial contract admin', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    governanceFinancialStorage          = await governanceFinancialInstance.storage();
    
                    // Operation
                    if(governanceFinancialStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await governanceFinancialInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governanceFinancial.address,
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

        describe('Governance Satellite Contract', function() {

            before('Change the GovernanceSatellite contract admin', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
    
                    // Operation
                    if(governanceSatelliteStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await governanceSatelliteInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governanceSatellite.address,
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

        describe('Lending Controller Contract', function() {

            before('Change the Lending Controller contract admin', async () => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    lendingControllerStorage          = await lendingControllerInstance.storage();
    
                    // Operation
                    if(lendingControllerStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await lendingControllerInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.lendingController.address,
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
                            tokenContractAddress: contractDeployments.mavrykFa2Token.address,
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
                    const initLoanToken                 = lendingControllerStorage.loanTokenLedger.get(tokenName);

                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        "setLoanToken",
                        [
                            contractDeployments.lendingController.address,
                            setLoanTokenAction
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalLoanToken                = lendingControllerStorage.loanTokenLedger.get(tokenName);

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
                    const initLoanToken                 = lendingControllerStorage.loanTokenLedger.get(tokenName);

                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        "setLoanToken",
                        [
                            contractDeployments.lendingController.address,
                            setLoanTokenAction
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalLoanToken                = lendingControllerStorage.loanTokenLedger.get(tokenName);

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
                        fa12: contractDeployments.mavrykFa12Token.address
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
                    const initCollateralToken                   = lendingControllerStorage.collateralTokenLedger.get(tokenName);

                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        "setCollateralToken",
                        [
                            contractDeployments.lendingController.address,
                            setCollateralTokenAction
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalCollateralToken          = lendingControllerStorage.loanTokenLedger.get("Test");

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
                    const initCollateralToken                   = lendingControllerStorage.collateralTokenLedger.get(tokenName);

                    // Operation
                    const lambdaFunction                = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        "setCollateralToken",
                        [
                            contractDeployments.lendingController.address,
                            setCollateralTokenAction
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
                    // Final values
                    lendingControllerStorage            = await lendingControllerInstance.storage();
                    const finalCollateralToken          = lendingControllerStorage.loanTokenLedger.get("Test");

                    // Assertions
                    assert.notStrictEqual(initCollateralToken, undefined);
                    assert.notStrictEqual(finalCollateralToken, undefined);
                    assert.equal(finalCollateralToken.tokenName, tokenName);
                    assert.equal(finalCollateralToken.oracleAddress, oracleAddress);
                    assert.equal(finalCollateralToken.protected, isPaused);
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
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.lendingController.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    vaultFactoryStorage          = await vaultFactoryInstance.storage();
    
                    // Operation
                    if(vaultFactoryStorage.admin !== contractDeployments.governanceProxy.address){
                        const operation     = await vaultFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.vaultFactory.address,
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

            it('%togglePauseEntrypoint', async () => {
                try{
                    // Initial values
                    vaultFactoryStorage                 = await vaultFactoryInstance.storage();
                    const targetEntrypoint              = "CreateVault";
                    const targetContractType            = "vaultFactory";
                    const initConfigValue               = vaultFactoryStorage.breakGlassConfig.createVaultIsPaused;
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'togglePauseEntrypoint',
                        [
                            contractDeployments.vaultFactory.address,
                            targetContractType,
                            targetEntrypoint,
                            true
                        ]
                    );
                    const operation                     = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                    await operation.confirmation();
    
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
                    const lambdaName                    = "lambdaUnstake";
                    const newDoormanUnstakeLambda       = doormanLambdas.lambdaNewUnstake;
                    const initDoormanUnstakeLambda      = doormanStorage.lambdaLedger.get(lambdaName);
                    
                    // Operation
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'setLambda',
                        [
                            contractDeployments.doorman.address,
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateMetadata',
                        [
                            contractDeployments.doorman.address,
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateWhitelistContracts',
                        [
                            contractDeployments.doorman.address,
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateGeneralContracts',
                        [
                            contractDeployments.doorman.address,
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
                        contractDeployments.governanceProxy.address,
                        
                        'updateWhitelistTokenContracts',
                        [
                            contractDeployments.treasuryFactory.address,
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