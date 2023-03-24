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

import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract, setGeneralContractLambdas }  from '../contractHelpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { lendingControllerStorage } from '../../storage/lendingControllerStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller', async () => {
  
    var tezos
    var utils: Utils
    var lendingController

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

            lendingControllerStorage.governanceAddress = governanceAddress.address
            lendingControllerStorage.mvkTokenAddress   = mvkTokenAddress.address
            lendingController = await GeneralContract.originate(utils.tezos, "lendingController", lendingControllerStorage);
            await saveContractAddress('lendingControllerAddress', lendingController.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = lendingController.tezos
            await signerFactory(bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "lendingController", lendingController.contract);

        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`lending controller contract deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})