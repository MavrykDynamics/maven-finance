const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")
const saveMVKDecimals = require('../../helpers/saveMVKDecimals')

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

import { farmFactoryStorage } from "../../storage/farmFactoryStorage";

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Farm Factory', async () => {
  
    var utils: Utils
    var farmFactory
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
        
            farmFactoryStorage.governanceAddress = governanceAddress.address
            farmFactoryStorage.mvkTokenAddress  = mvkTokenAddress.address
            farmFactory = await GeneralContract.originate(utils.tezos, "farmFactory", farmFactoryStorage);
            await saveContractAddress("farmFactoryAddress", farmFactory.contract.address)

            /* ---- ---- ---- ---- ---- */
        
            tezos = farmFactory.tezos
            await signerFactory(bob.sk);

            // Set Lambdas
            await setGeneralContractLambdas(tezos, "farmFactory", farmFactory.contract)
            await setGeneralContractProductLambdas(tezos, "farmFactory", farmFactory.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`farm factory contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})