const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { 
    GovernanceProxy, 
    setGovernanceProxyContractLambdas, 
    setGovernanceProxyContractProxyLambdas, 
    setGovernanceProxyLambdaPointers, 
    setGovernanceProxyNodeLambdaPointers, 
    setGovernanceProxyNodeAddress 
} from '../contractHelpers/governanceProxyTestHelper'

import { 
    GovernanceProxyNode, 
    setGovernanceProxyNodeContractLambdas, 
    setGovernanceProxyNodeContractProxyLambdas 
} from '../contractHelpers/governanceProxyNodeTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { governanceProxyStorage } from '../../storage/governanceProxyStorage'
import { governanceProxyNodeStorage } from '../../storage/governanceProxyNodeStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance Proxy', async () => {
  
    var utils: Utils
    var governanceProxy: GovernanceProxy
    var governanceProxyNode: GovernanceProxyNode
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
        
            // Governance Proxy
            governanceProxyStorage.governanceAddress  = governanceAddress.address;
            governanceProxyStorage.mvkTokenAddress    = mvkTokenAddress.address;
            governanceProxy = await GovernanceProxy.originate(utils.tezos, governanceProxyStorage);
        
            await saveContractAddress('governanceProxyAddress', governanceProxy.contract.address)
            console.log('Governance Proxy Contract deployed at:', governanceProxy.contract.address)

            // Governance Proxy Node 
            governanceProxyNodeStorage.governanceAddress  = governanceAddress.address;
            governanceProxyNodeStorage.mvkTokenAddress    = mvkTokenAddress.address;
            governanceProxyNode = await GovernanceProxyNode.originate("governanceProxyNode", utils.tezos, governanceProxyNodeStorage);
        
            await saveContractAddress('governanceProxyNodeAddress', governanceProxyNode.contract.address)
            console.log('Governance Proxy Node Contract deployed at:', governanceProxyNode.contract.address)

            /* ---- ---- ---- ---- ---- */
        
            tezos = governanceProxy.tezos
        
            /* ============ Set Lambdas ============ */
        
            await signerFactory(bob.sk);
        
            // Governance Proxy Setup Lambdas - Contract Lambdas
            await setGovernanceProxyContractLambdas(tezos, governanceProxy.contract, 9);
            console.log("Governance Proxy Contract - Lambdas Setup")

            // Governance Proxy Setup Lambdas - Contract Proxy Lambdas (index should start at executeGovernanceAction (exclude) in contractsLambdaIndex.json)
            await setGovernanceProxyContractProxyLambdas(tezos, governanceProxy.contract, 9);
            console.log("Governance Proxy Contract - Proxy Lambdas Setup")

            console.log("---")

            // Governance Proxy Setup Lambda Pointers - Governance Proxy Lambdas Pointers
            await setGovernanceProxyLambdaPointers(tezos, governanceProxy.contract, 11);
            console.log("Governance Proxy Contract - Lambda Pointers for Governance Proxy Lambdas")

            // Governance Proxy Setup Lambda Pointers - Proxy Node Lambdas Pointers
            await setGovernanceProxyNodeLambdaPointers(tezos, governanceProxy.contract, governanceProxyNode.contract.address, 9);
            console.log("Governance Proxy Contract - Lambda Pointers for Governance Proxy Node Lambdas")

            console.log("---")

            // Governance Proxy Node Setup Lambdas - Contract Lambdas
            await setGovernanceProxyNodeContractLambdas(tezos, governanceProxyNode.contract, 6) 
            console.log("Governance Proxy Node Contract - Lambdas Setup")

            // Governance Proxy Node Setup Lambdas - Contract Proxy Lambdas (index should start at executeGovernanceAction (exclude) in contractsLambdaIndex.json)
            await setGovernanceProxyNodeContractProxyLambdas(tezos, governanceProxyNode.contract, 6)
            console.log("Governance Proxy Node Contract - Proxy Lambdas Setup")

            console.log("---")

            // set proxy node address in Governance Proxy contract
            await setGovernanceProxyNodeAddress(tezos, governanceProxy.contract, governanceProxyNode.contract.address);

        } catch(e){
            console.dir(e, {depth: 5})
        }

  })

    it(`governance proxy and proxy node contracts deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})