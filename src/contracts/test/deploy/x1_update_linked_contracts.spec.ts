import { TransactionOperation } from "@mavrykdynamics/taquito"

import { MVN, Utils } from "../helpers/Utils"

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob } from '../../scripts/sandbox/accounts'
import { 
    signerFactory
} from './../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Linked contracts updates for Tests', async () => {
  
    var utils: Utils
    var tezos

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
            tezos = utils.tezos;

            //----------------------------
            // Retrieve all contracts
            //----------------------------


            const delegationInstance: any                   = await utils.tezos.contract.at(contractDeployments.delegation.address);
            const mvnTokenInstance: any                     = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
            const governanceInstance: any                   = await utils.tezos.contract.at(contractDeployments.governance.address);
            const governanceFinancialInstance: any          = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            const governanceSatelliteInstance: any          = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            const breakGlassInstance: any                   = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
            const vestingInstance: any                      = await utils.tezos.contract.at(contractDeployments.vesting.address);
            const treasuryInstance: any                     = await utils.tezos.contract.at(contractDeployments.treasury.address);
            const farmFactoryInstance: any                  = await utils.tezos.contract.at(contractDeployments.farmFactory.address);
            const treasuryFactoryInstance: any              = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
            const farmInstance: any                         = await utils.tezos.contract.at(contractDeployments.farm.address);
            const farmFa2Instance: any                      = await utils.tezos.contract.at(contractDeployments.farmFa2.address);
            const aggregatorInstance: any                   = await utils.tezos.contract.at(contractDeployments.aggregator.address);
            const aggregatorFactoryInstance: any            = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            // const lendingControllerInstance: any            = await utils.tezos.contract.at(contractDeployments.lendingController.address);
            // const lendingControllerMockTimeInstance: any    = await utils.tezos.contract.at(contractDeployments.lendingControllerMockTime.address);
            const vaultFactoryInstance: any                 = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);

            //----------------------------
            // Set remaining contract addresses - post-deployment
            //----------------------------

            await signerFactory(tezos, bob.sk);

            // Break Glass Contract - set whitelist contract addresses [emergencyGovernance]
            const breakGlassContractOperation = await breakGlassInstance.methods.updateWhitelistContracts(contractDeployments.emergencyGovernance.address, 'update').send();
            await breakGlassContractOperation.confirmation();

            console.log('Break Glass Contract - set whitelist contract addresses [emergencyGovernance]')
            
            // Treasury Factory Contract - set whitelist contract addresses [mvnToken]
            const treasuryFactoryContractOperation = await treasuryFactoryInstance.methods.updateWhitelistContracts(contractDeployments.mvnToken.address, 'update').send();
            await treasuryFactoryContractOperation.confirmation();
        
            console.log('Treasury Factory Contract - set whitelist contract addresses [mvnToken]')
            
            // Governance Satellite Contract - set whitelist contract addresses [mvnToken]
            const governanceSatelliteContractOperation = await governanceSatelliteInstance.methods.updateWhitelistContracts(contractDeployments.aggregatorFactory.address, 'update').send();
            await governanceSatelliteContractOperation.confirmation();

            console.log('Governance Satellite Contract - set whitelist contract addresses [aggregatorFactory]')

            // Aggregator Factory Contract - set whitelist contract addresses [governanceSatellite]
            // Aggregator Factory Contract - set general contract addresses [governanceSatellite]
            const aggregatorFactoryContractsBatch = await utils.tezos.wallet
            .batch()
            .withContractCall(aggregatorFactoryInstance.methods.updateWhitelistContracts(contractDeployments.governanceSatellite.address, 'update'))
            
            const aggregatorFactoryContractsBatchOperation = await aggregatorFactoryContractsBatch.send()
            await aggregatorFactoryContractsBatchOperation.confirmation();
        
            console.log('Aggregator Factory Contract - set whitelist contract addresses [governanceSatellite]')

            // Aggregator Contract - set whitelist contract addresses [aggregatorFactory]
            const aggregatorContractsBatch = await utils.tezos.wallet
            .batch()
            .withContractCall(aggregatorInstance.methods.updateWhitelistContracts(contractDeployments.aggregatorFactory.address, 'update'))
            .withContractCall(aggregatorInstance.methods.updateWhitelistContracts(contractDeployments.governanceSatellite.address, 'update'))
            
            const aggregatorContractsBatchOperation = await aggregatorContractsBatch.send()
            await aggregatorContractsBatchOperation.confirmation();
            
            console.log('Aggregator Contract - set whitelist contract addresses [aggregatorFactory, governanceSatellite]')

            // MVN Token Contract - set governance contract address
            // MVN Token Contract - set whitelist contract addresses [doorman, vesting, treasury]
        
            const mvnContractsBatch = await utils.tezos.wallet
                .batch()
                .withContractCall(mvnTokenInstance.methods.setGovernance(contractDeployments.governance.address, 'update'))
                .withContractCall(mvnTokenInstance.methods.updateWhitelistContracts(contractDeployments.doorman.address, 'update'))
                .withContractCall(mvnTokenInstance.methods.updateWhitelistContracts(contractDeployments.vesting.address, 'update'))
                .withContractCall(mvnTokenInstance.methods.updateWhitelistContracts(contractDeployments.treasury.address, 'update'))
                
            const mvnContractsBatchOperation = await mvnContractsBatch.send()
            await mvnContractsBatchOperation.confirmation();
        
            console.log('MVN Token Contract - set whitelist contract addresses [doorman, vesting, treasury]')
            
            

            // Farm FA12 Contract - set general contract addresses [doorman]
            // Farm FA12 Contract - set whitelist contract addresses [council] 
            // Farm FA2 Contract - set general contract addresses [doorman]
            // Farm FA2 Contract - set whitelist contract addresses [council]
            const farmContractsBatch = await utils.tezos.wallet
                .batch()
                .withContractCall(farmInstance.methods.updateWhitelistContracts(contractDeployments.council.address, 'update'))
                .withContractCall(farmFa2Instance.methods.updateWhitelistContracts(contractDeployments.council.address, 'update'))
            const farmContractsBatchOperation = await farmContractsBatch.send()
            await farmContractsBatchOperation.confirmation();
        
            console.log('Farm FA12 Contract - set whitelist contract addresses [council]')
            console.log('Farm FA2 Contract - set whitelist contract addresses [council]')
            
        
        
            // Farm Factory Contract - set whitelist contract addresses [council]
            const setCouncilContractAddressInFarmFactoryOperation = (await farmFactoryInstance.methods.updateWhitelistContracts(contractDeployments.council.address, 'update').send()) as TransactionOperation
            await setCouncilContractAddressInFarmFactoryOperation.confirmation();
            console.log('Farm Factory Contract - set whitelist contract addresses [council]')
        
        
        
            // Delegation Contract - set whitelist contract addresses [treasury, governance, governanceSatellite, aggregatorFactory]
            const delegationContractsBatch = await utils.tezos.wallet
            .batch()

            // whitelist contracts
            .withContractCall(delegationInstance.methods.updateWhitelistContracts(contractDeployments.treasury.address,                                     'update'))
            .withContractCall(delegationInstance.methods.updateWhitelistContracts(contractDeployments.governance.address,                                   'update'))
            .withContractCall(delegationInstance.methods.updateWhitelistContracts(contractDeployments.governanceSatellite.address,                          'update'))
            .withContractCall(delegationInstance.methods.updateWhitelistContracts(contractDeployments.aggregatorFactory.address,                            'update'))

            const delegationContractsBatchOperation = await delegationContractsBatch.send()
            await delegationContractsBatchOperation.confirmation();
            console.log('Delegation Contract - set whitelist contract addresses [treasury, governance, governanceSatellite, aggregatorFactory]')

            // Governance Contract - set contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]
            const governanceContractsBatch = await utils.tezos.wallet
            .batch()
        
            // general contracts
            .withContractCall(governanceInstance.methods.updateGeneralContracts('emergencyGovernance'   , contractDeployments.emergencyGovernance.address,  'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('doorman'               , contractDeployments.doorman.address,              'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('delegation'            , contractDeployments.delegation.address,           'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('breakGlass'            , contractDeployments.breakGlass.address,           'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('council'               , contractDeployments.council.address,              'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('vesting'               , contractDeployments.vesting.address,              'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('lendingTreasury'       , contractDeployments.treasury.address,             'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('taxTreasury'           , contractDeployments.treasury.address,             'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('farmTreasury'          , contractDeployments.treasury.address,             'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('paymentTreasury'       , contractDeployments.treasury.address,             'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('satelliteTreasury'     , contractDeployments.treasury.address,             'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('aggregatorTreasury'    , contractDeployments.treasury.address,             'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('farmFactory'           , contractDeployments.farmFactory.address,          'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('treasuryFactory'       , contractDeployments.treasuryFactory.address,      'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('aggregatorFactory'     , contractDeployments.aggregatorFactory.address,    'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('governanceSatellite'   , contractDeployments.governanceSatellite.address,  'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('governanceFinancial'   , contractDeployments.governanceFinancial.address,  'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('vaultFactory'          , contractDeployments.vaultFactory.address,         'update'))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('lendingController'     , contractDeployments.lendingController.address,    'update'))
        
            // whitelist contracts
            .withContractCall(governanceInstance.methods.updateWhitelistContracts(contractDeployments.vaultFactory.address,         'update'))
            .withContractCall(governanceInstance.methods.updateWhitelistContracts(contractDeployments.farmFactory.address,          'update'))
            .withContractCall(governanceInstance.methods.updateWhitelistContracts(contractDeployments.treasuryFactory.address,      'update'))
            .withContractCall(governanceInstance.methods.updateWhitelistContracts(contractDeployments.aggregatorFactory.address,    'update'))
            .withContractCall(governanceInstance.methods.updateWhitelistContracts(contractDeployments.delegation.address,           'update'))
            .withContractCall(governanceInstance.methods.updateWhitelistContracts(contractDeployments.governanceSatellite.address,  'update'))
            .withContractCall(governanceInstance.methods.updateWhitelistContracts(contractDeployments.governanceFinancial.address,  'update'))
        
            // governance proxy
            .withContractCall(governanceInstance.methods.setGovernanceProxy(contractDeployments.governanceProxy.address))
            const governanceContractsBatchOperation = await governanceContractsBatch.send()
            await governanceContractsBatchOperation.confirmation();
        
            console.log('Governance Contract - set general contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]')
            console.log('Governance Contract - set governance proxy address')
        
        
        
            // Governance Financial Contract - set whitelist token contracts [MavenFA2, MavenFA12, MVN]
            const governanceFinancialContractsBatch = await utils.tezos.wallet
            .batch()

            // whitelist token contracts
            .withContractCall(governanceFinancialInstance.methods.updateWhitelistTokenContracts(contractDeployments.mavenFa2Token.address,     'update'))
            .withContractCall(governanceFinancialInstance.methods.updateWhitelistTokenContracts(contractDeployments.mavenFa12Token.address,    'update'))
            .withContractCall(governanceFinancialInstance.methods.updateWhitelistTokenContracts(contractDeployments.mvnToken.address,           'update'))

            const governanceFinancialContractsBatchOperation = await governanceFinancialContractsBatch.send()
            await governanceFinancialContractsBatchOperation.confirmation();
        
            console.log('Governance Financial Contract - set whitelist token contract addresss [MavenFA12, MavenFA2, MVN]')
        


            // Treasury Contract - set whitelist contract addresses map [council, aggregatorFactory]
            // Treasury Contract - set whitelist token contract addresses map [mavenFa12, mavenFA2, MVN]
            const treasuryContractsBatch = await utils.tezos.wallet
            .batch()
        
            // whitelist contracts
            .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.governanceProxy.address,        'update'))
            .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.aggregatorFactory.address,      'update'))
            .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.treasuryFactory.address,        'update'))
            .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.doorman.address,                'update'))
            .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.delegation.address,             'update'))
            .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.governanceFinancial.address,    'update'))
            .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.governance.address,             'update'))
        
            // whitelist token contracts
            .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mavenFa2Token.address,    'update'))
            .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mavenFa12Token.address,   'update'))
            .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mvnToken.address,          'update'))
        
            const treasuryContractsBatchOperation = await treasuryContractsBatch.send()
            await treasuryContractsBatchOperation.confirmation();
            
            console.log('Treasury Contract - set whitelist contract addresses map [governanceProxy, aggregatorFactory, treasuryFactory]')
            console.log('Treasury Contract - set whitelist token contract addresses map [MavenFA12, MavenFA2, MVN]')
        
            // Vesting Contract - set whitelist contract addresses map [council]
            const setCouncilContractAddressInVesting = await vestingInstance.methods.updateWhitelistContracts(contractDeployments.council.address, 'update').send()
            await setCouncilContractAddressInVesting.confirmation();
        
            console.log('Vesting Contract - set whitelist contract addresses map [council]')

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`linked contracts updated`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})