const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require("../helpers/saveContractAddress")
import { MichelsonMap } from '@taquito/michelson-encoder'
import {BigNumber} from "bignumber.js";

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

import { GeneralContract, setGeneralContractLambdas, setGeneralContractProductLambdas }  from '../helpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorFactoryStorage } from '../../storage/aggregatorFactoryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Aggregator Factory', async () => {
  
    var utils: Utils
    var aggregatorFactory
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
        
            aggregatorFactoryStorage.mvkTokenAddress   = mvkTokenAddress.address;
            aggregatorFactoryStorage.governanceAddress = governanceAddress.address;
            aggregatorFactory = await GeneralContract.originate(utils.tezos, "aggregatorFactory", aggregatorFactoryStorage);
            await saveContractAddress('aggregatorFactoryAddress', aggregatorFactory.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = aggregatorFactory.tezos
            await signerFactory(bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "aggregatorFactory", aggregatorFactory.contract);
            await setGeneralContractProductLambdas(tezos, "aggregatorFactory", aggregatorFactory.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`aggregator factory contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})
