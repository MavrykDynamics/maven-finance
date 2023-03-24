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

import { GeneralContract, setGeneralContractLambdas }  from '../contractHelpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { vestingStorage } from '../../storage/vestingStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Vesting', async () => {
  
    var utils: Utils
    var vesting
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

            vestingStorage.governanceAddress  = governanceAddress.address
            vestingStorage.mvkTokenAddress    = mvkTokenAddress.address
            vesting = await GeneralContract.originate(utils.tezos, "vesting", vestingStorage);
            await saveContractAddress('vestingAddress', vesting.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = vesting.tezos
            await signerFactory(bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "vesting", vesting.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`vesting contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})