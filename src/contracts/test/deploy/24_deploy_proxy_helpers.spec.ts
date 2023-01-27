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



// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { ProxyContract } from '../contractHelpers/proxyContractTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Proxy Contract Helpers', async () => {
  
    var tezos
    var utils: Utils
    var proxyContract: ProxyContract

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

            const proxyContractStorage = {
                admin : bob.pkh
            };
            
            const proxyDoormanContract = await ProxyContract.originate("proxyDoorman",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyDoormanAddress', proxyDoormanContract.contract.address)

            const proxyDelegationContract = await ProxyContract.originate("proxyDelegation",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyDelegationAddress', proxyDelegationContract.contract.address)

            const proxyCouncilContract = await ProxyContract.originate("proxyCouncil",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyCouncilAddress', proxyCouncilContract.contract.address)

            const proxyVestingContract = await ProxyContract.originate("proxyVesting",utils.tezos,proxyContractStorage);
            await saveContractAddress('proxyVestingAddress', proxyVestingContract.contract.address)


            console.log('Proxy Doorman Contract deployed at:'       , proxyDoormanContract.contract.address)
            console.log('Proxy Delegation Contract deployed at:'    , proxyDelegationContract.contract.address)
            console.log('Proxy Council Contract deployed at:'       , proxyCouncilContract.contract.address)
            console.log('Proxy Vesting Contract deployed at:'       , proxyVestingContract.contract.address)


        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`proxy contracts deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})