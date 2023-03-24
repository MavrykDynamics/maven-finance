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
import fa12LpTokenAddress from '../../deployments/mavrykFa12TokenAddress.json';
import fa2LpTokenAddress from '../../deployments/mavrykFa2TokenAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract, setGeneralContractLambdas }  from '../contractHelpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { farmStorage } from "../../storage/farmStorage";

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Farms', async () => {
  
    var utils: Utils
    var farm
    var farmFA2
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
        
            // Farm FA12 Token
            farmStorage.governanceAddress           = governanceAddress.address;
            farmStorage.mvkTokenAddress             = mvkTokenAddress.address;
            farmStorage.config.lpToken.tokenAddress = fa12LpTokenAddress.address;
            farmStorage.config.tokenPair = {
                token0Address: "KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb",
                token1Address: "KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b"
            }

            farm = await GeneralContract.originate(utils.tezos, "farm", farmStorage);
            await saveContractAddress("farmAddress", farm.contract.address)
        
            // Farm FA2 Token
            farmStorage.config.lpToken.tokenAddress = fa2LpTokenAddress.address;
            farmStorage.config.lpToken.tokenStandard = {
                fa2: ""
            };
            
            farmFA2 = await GeneralContract.originate(utils.tezos, "farm", farmStorage);
            await saveContractAddress("farmFa2Address", farmFA2.contract.address)
        
            farmStorage.config.lpToken.tokenAddress = fa12LpTokenAddress.address;
            farmStorage.config.infinite = true
            farmStorage.config.lpToken.tokenStandard = {
                fa12: ""
            };
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = farm.tezos
            await signerFactory(bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "farm", farm.contract)
            await setGeneralContractLambdas(tezos, "farm", farmFA2.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`farm contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})