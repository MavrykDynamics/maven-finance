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

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract, setGeneralContractLambdas }  from '../helpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { treasuryStorage } from '../../storage/treasuryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Treasury', async () => {
  
    var utils: Utils
    var treasury
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
        
            treasuryStorage.governanceAddress = contractDeployments.governance.address
            treasuryStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
            treasury = await GeneralContract.originate(utils.tezos, "treasury", treasuryStorage);
            await saveContractAddress('treasuryAddress', treasury.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = treasury.tezos
            await signerFactory(bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "treasury", treasury.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`treasury contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})