import { Utils } from "../helpers/Utils";
const { InMemorySigner } = require("@taquito/signer");
const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { ProxyContract } from '../contractHelpers/proxyContractTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Proxy Contract Helpers', async () => {
  
    

    var proxyDelegation        : ProxyDelegation

    var utils: Utils
    var proxyContract: ProxyContract
    var proxyDoormanContract : ProxyContract

    var tezos
    
    const signerFactory = async (pk) => {
        await tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) })
        return tezos
    }

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            const proxyContractStorage = bob.pkh;
            
            const proxyAggregatorContract = await ProxyContract.originate("proxyAggregator", utils.tezos, proxyContractStorage);
            await saveContractAddress('proxyAggregatorAddress', proxyAggregatorContract.contract.address)

            const proxyAggregatorFactoryContract = await ProxyContract.originate("proxyAggregatorFactory",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyAggregatorFactoryAddress', proxyAggregatorFactoryContract.contract.address)



            const proxyBreakGlassContract = await ProxyContract.originate("proxyBreakGlass",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyBreakGlassAddress', proxyBreakGlassContract.contract.address)

            const proxyCouncilContract = await ProxyContract.originate("proxyCouncil",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyCouncilAddress', proxyCouncilContract.contract.address)



            const proxyDelegationContract = await ProxyContract.originate("proxyDelegation", utils.tezos, proxyContractStorage);
            await saveContractAddress('proxyDelegationAddress', proxyDelegationContract.contract.address)

            proxyDoormanContract = await ProxyContract.originate("proxyDoorman", utils.tezos, proxyContractStorage);
            await saveContractAddress('proxyDoormanAddress', proxyDoormanContract.contract.address)

            const proxyEmergencyGovernanceContract = await ProxyContract.originate("proxyEmergencyGovernance",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyEmergencyGovernanceAddress', proxyEmergencyGovernanceContract.contract.address)



            const proxyFarmContract = await ProxyContract.originate("proxyFarm",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyFarmAddress', proxyFarmContract.contract.address)

            const proxyFarmFactoryContract = await ProxyContract.originate("proxyFarmFactory",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyFarmFactoryAddress', proxyFarmFactoryContract.contract.address)



            const proxyGovernanceContract = await ProxyContract.originate("proxyGovernance",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyGovernanceAddress', proxyGovernanceContract.contract.address)

            const proxyGovernanceFinancialContract = await ProxyContract.originate("proxyGovernanceFinancial",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyGovernanceFinancialAddress', proxyGovernanceFinancialContract.contract.address)

            const proxyGovernanceSatelliteContract = await ProxyContract.originate("proxyGovernanceSatellite",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyGovernanceSatelliteAddress', proxyGovernanceSatelliteContract.contract.address)

            const proxyGovernanceProxyContract = await ProxyContract.originate("proxyGovernanceProxy",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyGovernanceProxyAddress', proxyGovernanceProxyContract.contract.address)



            const proxyLendingControllerContract = await ProxyContract.originate("proxyLendingController",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyLendingControllerAddress', proxyLendingControllerContract.contract.address)

            const proxyTreasuryContract = await ProxyContract.originate("proxyTreasury",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyTreasuryAddress', proxyTreasuryContract.contract.address)

            const proxyTreasuryFactoryContract = await ProxyContract.originate("proxyTreasuryFactory",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyTreasuryFactoryAddress', proxyTreasuryFactoryContract.contract.address)



            const proxyVaultContract = await ProxyContract.originate("proxyVault",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyVaultAddress', proxyVaultContract.contract.address)

            const proxyVaultFactoryContract = await ProxyContract.originate("proxyVaultFactory",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyVaultFactoryAddress', proxyVaultFactoryContract.contract.address)
            
            const proxyVestingContract = await ProxyContract.originate("proxyVesting",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyVestingAddress', proxyVestingContract.contract.address)


            console.log('Proxy Aggregator Contract              deployed at:'        , proxyAggregatorContract.contract.address)
            console.log('Proxy Aggregator Factory Contract      deployed at:'        , proxyAggregatorFactoryContract.contract.address)

            console.log('Proxy Break Glass Contract             deployed at:'        , proxyBreakGlassContract.contract.address)
            console.log('Proxy Council Contract                 deployed at:'        , proxyCouncilContract.contract.address)

            console.log('Proxy Delegation Contract              deployed at:'        , proxyDelegationContract.contract.address)
            console.log('Proxy Doorman Contract                 deployed at:'        , proxyDoormanContract.contract.address)
            console.log('Proxy Emergency Governance Contract    deployed at:'        , proxyEmergencyGovernanceContract.contract.address)

            console.log('Proxy Farm Contract                    deployed at:'        , proxyFarmContract.contract.address)
            console.log('Proxy Farm Factory Contract            deployed at:'        , proxyFarmFactoryContract.contract.address)

            console.log('Proxy Governance Contract              deployed at:'        , proxyGovernanceContract.contract.address)
            console.log('Proxy Governance Financial Contract    deployed at:'        , proxyGovernanceFinancialContract.contract.address)
            console.log('Proxy Governance Satellite Contract    deployed at:'        , proxyGovernanceSatelliteContract.contract.address)
            console.log('Proxy Governance Proxy Contract        deployed at:'        , proxyGovernanceProxyContract.contract.address)

            console.log('Proxy Lending Controller Contract      deployed at:'        , proxyLendingControllerContract.contract.address)
            console.log('Proxy Treasury Contract                deployed at:'        , proxyTreasuryContract.contract.address)
            console.log('Proxy Treasury Factory Contract        deployed at:'        , proxyTreasuryFactoryContract.contract.address)
            
            console.log('Proxy Vault Contract                   deployed at:'        , proxyVaultContract.contract.address)
            console.log('Proxy Vault Factory Contract           deployed at:'        , proxyVaultFactoryContract.contract.address)
            console.log('Proxy Vesting Contract                 deployed at:'        , proxyVestingContract.contract.address)

        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`proxy contracts deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})