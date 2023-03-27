const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../helpers/saveContractAddress")
import { MichelsonMap } from '@taquito/michelson-encoder'

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

import { delegationStorage } from '../../storage/delegationStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Delegation', async () => {
  
    var utils: Utils
    var delegation
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
        
            delegationStorage.governanceAddress = contractDeployments.governance.address
            delegationStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
            delegationStorage.whitelistContracts = MichelsonMap.fromLiteral({
                doorman: contractDeployments.doorman.address,
            })
            delegation = await GeneralContract.originate(utils.tezos, "delegation", delegationStorage);
            await saveContractAddress('delegationAddress', delegation.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = delegation.tezos
            await signerFactory(bob.sk);

            // Set Lambdas
            await setGeneralContractLambdas(tezos, "delegation", delegation.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`delegation contract deployment`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})