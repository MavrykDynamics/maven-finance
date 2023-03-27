const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../helpers/saveContractAddress")

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

import { GeneralContract, setGeneralContractLambdas }  from '../helpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorStorage } from '../../storage/aggregatorStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Aggregator', async () => {
  
    var utils: Utils

    var aggregator
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
        
            aggregatorStorage.mvkTokenAddress = mvkTokenAddress.address
            aggregatorStorage.governanceAddress = governanceAddress.address
            aggregator = await GeneralContract.originate(utils.tezos, "aggregator", aggregatorStorage);
            await saveContractAddress('aggregatorAddress', aggregator.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = aggregator.tezos
            await signerFactory(bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "aggregator", aggregator.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`aggregator contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})