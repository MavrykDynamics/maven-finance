import { Utils } from "../helpers/Utils"
import { MichelsonMap } from '@taquito/michelson-encoder'
const saveContractAddress = require("../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract, setGeneralContractLambdas } from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'
import * as helperFunctions from '../helpers/helperFunctions'

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

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            delegationStorage.governanceAddress = contractDeployments.governance.address
            delegationStorage.mvnTokenAddress   = contractDeployments.mvnToken.address
            delegationStorage.whitelistContracts = MichelsonMap.fromLiteral({
                [contractDeployments.doorman.address]: null,
            })
            delegation = await GeneralContract.originate(utils.tezos, "delegation", delegationStorage);
            await saveContractAddress('delegationAddress', delegation.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = delegation.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);

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