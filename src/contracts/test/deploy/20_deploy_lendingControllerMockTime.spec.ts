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

import { LendingControllerMockTime, setLendingControllerLambdas } from '../contractHelpers/lendingControllerMockTimeTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { lendingControllerMockTimeStorage } from '../../storage/lendingControllerMockTimeStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller Mock Time', async () => {
  
    var tezos
    var utils: Utils
    var lendingControllerMockTime: LendingControllerMockTime

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

            lendingControllerMockTimeStorage.governanceAddress = governanceAddress.address
            lendingControllerMockTimeStorage.mvkTokenAddress   = mvkTokenAddress.address
            lendingControllerMockTime = await LendingControllerMockTime.originate(
                utils.tezos,
                lendingControllerMockTimeStorage
            )

            await saveContractAddress('lendingControllerMockTimeAddress', lendingControllerMockTime.contract.address)
            console.log('Lending Controller (Mock Time) Contract deployed at:', lendingControllerMockTime.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = lendingControllerMockTime.tezos

            // Lending Controller Lambdas
            await setLendingControllerLambdas(tezos, lendingControllerMockTime.contract);
            console.log("Lending Controller (Mock Time) Lambdas Setup")

        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`lending controller mock time contract deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})