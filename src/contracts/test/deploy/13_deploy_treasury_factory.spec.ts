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

import { GeneralContract, setGeneralContractLambdas, setGeneralContractProductLambdas }  from '../contractHelpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { treasuryFactoryStorage } from '../../storage/treasuryFactoryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Treasury Factory', async () => {
  
    var utils: Utils
    var treasuryFactory
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
        
            treasuryFactoryStorage.governanceAddress = governanceAddress.address
            treasuryFactoryStorage.mvkTokenAddress  = mvkTokenAddress.address
            treasuryFactory = await GeneralContract.originate(utils.tezos, "treasuryFactory", treasuryFactoryStorage);
            await saveContractAddress('treasuryFactoryAddress', treasuryFactory.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = treasuryFactory.tezos
            await signerFactory(bob.sk);

            // Set Lambdas
            await setGeneralContractLambdas(tezos, "treasuryFactory", treasuryFactory.contract);
            await setGeneralContractProductLambdas(tezos, "treasuryFactory", treasuryFactory.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`treasury factory contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
    
})