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

import { TokenPoolReward, setTokenPoolRewardLambdas } from '../contractHelpers/tokenPoolRewardTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { tokenPoolRewardStorage } from '../../storage/tokenPoolRewardStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Token Pool Reward', async () => {
  
    var tezos
    var utils: Utils
    var tokenPoolReward: TokenPoolReward

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

            tokenPoolRewardStorage.governanceAddress = governanceAddress.address
            tokenPoolRewardStorage.mvkTokenAddress   = mvkTokenAddress.address
            tokenPoolReward = await TokenPoolReward.originate(
                utils.tezos,
                tokenPoolRewardStorage
            )

            await saveContractAddress('tokenPoolRewardAddress', tokenPoolReward.contract.address)
            console.log('Token Pool Reward Contract deployed at:', tokenPoolReward.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = tokenPoolReward.tezos

            // Token Pool Reward Lambdas
            await setTokenPoolRewardLambdas(tezos, tokenPoolReward.contract);
            console.log("Token Pool Reward Lambdas Setup")

        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`token pool reward contract deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})