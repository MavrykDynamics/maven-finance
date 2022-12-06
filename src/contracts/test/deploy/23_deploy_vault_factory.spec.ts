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

import { VaultFactory, setVaultFactoryLambdas, setVaultFactoryProductLambdas } from '../contractHelpers/vaultFactoryTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { vaultFactoryStorage } from '../../storage/vaultFactoryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Vault Factory', async () => {
  
    var tezos
    var utils: Utils
    var vaultFactory: VaultFactory

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

            vaultFactoryStorage.governanceAddress = governanceAddress.address
            vaultFactoryStorage.mvkTokenAddress   = mvkTokenAddress.address
            vaultFactory = await VaultFactory.originate(
                utils.tezos,
                vaultFactoryStorage
            )

            await saveContractAddress('vaultFactoryAddress', vaultFactory.contract.address)
            console.log('Vault Factory Contract deployed at:', vaultFactory.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = vaultFactory.tezos

            // Vault Factory Lambdas
            await setVaultFactoryLambdas(tezos, vaultFactory.contract);
            console.log("Vault Factory Lambdas Setup")

            // Vault Factory Setup Vault Lambdas
            await setVaultFactoryProductLambdas(tezos, vaultFactory.contract)
            console.log("Vault Factory - Vault Lambdas Setup")

        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`vault factory contract deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})