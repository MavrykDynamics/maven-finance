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
import mTokenUsdtAddress from '../../deployments/mTokenUsdtAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { FarmMToken, setFarmMTokenLambdas } from "../contractHelpers/farmMTokenTestHelper"

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { farmMTokenStorage } from "../../storage/farmMTokenStorage";

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Farms mToken', async () => {
  
  var utils: Utils
  var farmMToken: FarmMToken;
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

      // Deploy Farm mToken

      farmMTokenStorage.governanceAddress           = governanceAddress.address;
      farmMTokenStorage.mvkTokenAddress             = mvkTokenAddress.address;
      farmMTokenStorage.config.loanToken            = "usdt";
      farmMTokenStorage.config.lpToken.tokenAddress = mTokenUsdtAddress.address;
      
      farmMToken = await FarmMToken.originate(
        utils.tezos,
        farmMTokenStorage
      );
  
      await saveContractAddress("farmMTokenAddress", farmMToken.contract.address)
      console.log("Farm mToken USDT Contract deployed at:", farmMToken.contract.address);
  
  
      tezos = farmMToken.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);

      // Farm FA12 Setup Lambdas
      await setFarmMTokenLambdas(tezos, farmMToken.contract)
      console.log("Farm mToken USDT Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`farm mToken contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})