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

import { Farm, setFarmLambdas } from "../helpers/farmHelper"

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { farmStorage } from "../../storage/farmStorage";

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Farms', async () => {
  
  var utils: Utils
  var farm: Farm;
  var farmFA2: Farm;
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
  
      farmStorage.governanceAddress = governanceAddress.address;
      farmStorage.mvkTokenAddress  = mvkTokenAddress.address;
      farmStorage.config.lpToken.tokenAddress = fa12LpTokenAddress.address;
      farmStorage.config.tokenPair = {
        token0Address: "KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb",
        token1Address: "KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b"
      }
        
      farm = await Farm.originate(
        utils.tezos,
        farmStorage
      );
  
      await saveContractAddress("farmAddress", farm.contract.address)
      console.log("FA12 Farm Contract deployed at:", farm.contract.address);
  
      farmStorage.config.lpToken.tokenAddress = fa2LpTokenAddress.address;
      farmStorage.config.lpToken.tokenStandard = {
        fa2: ""
      };
       
      farmFA2 = await Farm.originate(
        utils.tezos,
        farmStorage
      );
  
      await saveContractAddress("farmFA2Address", farmFA2.contract.address)
      console.log("FA2 Farm Contract deployed at:", farmFA2.contract.address);
  
      farmStorage.config.lpToken.tokenAddress = fa12LpTokenAddress.address;
      farmStorage.config.infinite = true
      farmStorage.config.lpToken.tokenStandard = {
        fa12: ""
      };
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = farm.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);

      // Farm FA12 Setup Lambdas
      await setFarmLambdas(tezos, farm.contract)
      console.log("Farm FA12 Lambdas Setup")

      // Farm FA2 Setup Lambdas
      await setFarmLambdas(tezos, farmFA2.contract)
      console.log("Farm FA2 Lambdas Setup")

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