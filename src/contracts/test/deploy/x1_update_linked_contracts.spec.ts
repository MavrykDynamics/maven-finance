const { InMemorySigner } = require("@taquito/signer");
import { MVK, Utils } from "../helpers/Utils";
import {TransactionOperation} from "@taquito/taquito";

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import doormanAddress from '../../deployments/doormanAddress.json';
import delegationAddress from '../../deployments/delegationAddress.json';
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import councilAddress from '../../deployments/councilAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';
import governanceFinancialAddress from '../../deployments/governanceFinancialAddress.json';
import governanceProxyAddress from '../../deployments/governanceProxyAddress.json';
import emergencyGovernanceAddress from '../../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress from '../../deployments/breakGlassAddress.json';
import vestingAddress from '../../deployments/vestingAddress.json';
import treasuryAddress from '../../deployments/treasuryAddress.json';
import mavrykFa12TokenAddress from '../../deployments/mavrykFa12TokenAddress.json';
import mavrykFa2TokenAddress from '../../deployments/mavrykFa2TokenAddress.json';
import farmFactoryAddress from '../../deployments/farmFactoryAddress.json'
import treasuryFactoryAddress from '../../deployments/treasuryFactoryAddress.json'
import governanceSatelliteAddress from '../../deployments/governanceSatelliteAddress.json'
import farmAddress from '../../deployments/farmAddress.json'
import farmFA2Address from '../../deployments/farmFA2Address.json'
import tokenSaleAddress from '../../deployments/tokenSaleAddress.json'
import lendingControllerAddress from '../../deployments/lendingControllerAddress.json'
import lendingControllerMockTimeAddress from '../../deployments/lendingControllerMockTimeAddress.json'
import vaultFactoryAddress from '../../deployments/vaultFactoryAddress.json'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Linked contracts updates for Tests', async () => {
  
  var utils: Utils
  var tezos
  

  const signerFactory = async (pk) => {
    await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) })
    return utils.tezos
  }

  before('setup', async () => {
    try{
      utils = new Utils()
      await utils.init(bob.sk)
      
      //----------------------------
      // Retrieve all contracts
      //----------------------------

      const delegationInstance: any                   = await utils.tezos.contract.at(delegationAddress.address);
      const mvkTokenInstance: any                     = await utils.tezos.contract.at(mvkTokenAddress.address);
      const governanceInstance: any                   = await utils.tezos.contract.at(governanceAddress.address);
      const governanceFinancialInstance: any          = await utils.tezos.contract.at(governanceFinancialAddress.address);
      const governanceSatelliteInstance: any          = await utils.tezos.contract.at(governanceSatelliteAddress.address);
      const breakGlassInstance: any                   = await utils.tezos.contract.at(breakGlassAddress.address);
      const vestingInstance: any                      = await utils.tezos.contract.at(vestingAddress.address);
      const treasuryInstance: any                     = await utils.tezos.contract.at(treasuryAddress.address);
      const farmFactoryInstance: any                  = await utils.tezos.contract.at(farmFactoryAddress.address);
      const treasuryFactoryInstance: any              = await utils.tezos.contract.at(treasuryFactoryAddress.address);
      const farmInstance: any                         = await utils.tezos.contract.at(farmAddress.address);
      const farmFA2Instance: any                      = await utils.tezos.contract.at(farmFA2Address.address);
      // const aggregatorInstance: any                   = await utils.tezos.contract.at(aggregatorAddress.address);
      const aggregatorFactoryInstance: any            = await utils.tezos.contract.at("KT18oMzNd8brk5b92TqeNWZC4EigjF8TnKkv");
      // const lendingControllerInstance: any            = await utils.tezos.contract.at(lendingControllerAddress.address);
      // const lendingControllerMockTimeInstance: any    = await utils.tezos.contract.at(lendingControllerMockTimeAddress.address);
      // const vaultFactoryInstance: any                 = await utils.tezos.contract.at(vaultFactoryAddress.address);
      
      //----------------------------
      // Set remaining contract addresses - post-deployment
      //----------------------------

      await signerFactory(bob.sk);

      // Break Glass Contract - set whitelist contract addresses [emergencyGovernance]
      // const breakGlassContractOperation = await breakGlassInstance.methods.updateWhitelistContracts("emergencyGovernance", emergencyGovernanceAddress.address).send();
      // await breakGlassContractOperation.confirmation();
  
      // console.log('Break Glass Contract - set whitelist contract addresses [emergencyGovernance]')
      
      // // Treasury Factory Contract - set whitelist contract addresses [mvkToken]
      // const treasuryFactoryContractOperation = (await treasuryFactoryInstance.methods.updateWhitelistContracts("mvk", mvkTokenAddress.address).send()) as TransactionOperation
      // await treasuryFactoryContractOperation.confirmation();
  
      // console.log('Treasury Factory Contract - set whitelist contract addresses [mvkToken]')
      
      // // Governance Satellite Contract - set whitelist contract addresses [mvkToken]
      // const governanceSatelliteContractOperation = (await governanceSatelliteInstance.methods.updateWhitelistContracts("aggregatorFactory", "KT18oMzNd8brk5b92TqeNWZC4EigjF8TnKkv").send()) as TransactionOperation
      // await governanceSatelliteContractOperation.confirmation();

      // console.log('Governance Satellite Contract - set whitelist contract addresses [aggregatorFactory]')

      // // Aggregator Factory Contract - set whitelist contract addresses [governanceSatellite]
      // // Aggregator Factory Contract - set general contract addresses [governanceSatellite]
      // const aggregatorFactoryContractsBatch = await utils.tezos.wallet
      // .batch()
      // .withContractCall(aggregatorFactoryInstance.methods.updateWhitelistContracts("governanceSatellite2", governanceSatelliteAddress.address))
      
      // const aggregatorFactoryContractsBatchOperation = await aggregatorFactoryContractsBatch.send()
      // await aggregatorFactoryContractsBatchOperation.confirmation();
  
      // console.log('Aggregator Factory Contract - set whitelist contract addresses [governanceSatellite]')
  
      // // Aggregator Contract - set whitelist contract addresses [aggregatorFactory]
      // const aggregatorContractsBatch = await utils.tezos.wallet
      // .batch()
      // .withContractCall(aggregatorInstance.methods.updateWhitelistContracts("aggregatorFactory", aggregatorFactoryAddress.address))
      // .withContractCall(aggregatorInstance.methods.updateWhitelistContracts("governanceSatellite", governanceSatelliteAddress.address))
      
      // const aggregatorContractsBatchOperation = await aggregatorContractsBatch.send()
      // await aggregatorContractsBatchOperation.confirmation();
      
  
      // MVK Token Contract - set governance contract address
      // MVK Token Contract - set whitelist contract addresses [doorman, vesting, treasury]
  
      const mvkContractsBatch = await utils.tezos.wallet
        .batch()
        .withContractCall(mvkTokenInstance.methods.setGovernance(governanceAddress.address))
        .withContractCall(mvkTokenInstance.methods.updateWhitelistContracts("doorman", doormanAddress.address))
        .withContractCall(mvkTokenInstance.methods.updateWhitelistContracts('vesting', vestingAddress.address))
        .withContractCall(mvkTokenInstance.methods.updateWhitelistContracts('treasury', treasuryAddress.address))
      const mvkContractsBatchOperation = await mvkContractsBatch.send()
      await mvkContractsBatchOperation.confirmation();
  
      console.log('MVK Token Contract - set whitelist contract addresses [doorman, vesting, treasury]')
      
      // Send MVK to treasury contract and council (TODO: keep?)
      if (utils.production !== "true"){
        const transferToTreasury = await mvkTokenInstance.methods
          .transfer([
            {
              from_: bob.pkh,
              txs: [
                {
                  to_: treasuryAddress.address,
                  token_id: 0,
                  amount: MVK(6000),
                },
                {
                  to_: councilAddress.address,
                  token_id: 0,
                  amount: MVK(15),
                }
              ],
            },
          ])
          .send()
        await transferToTreasury.confirmation();
      }
      const updateOperatorsTreasury = (await treasuryInstance.methods
        .updateMvkOperators([
          {
            add_operator: {
                owner: treasuryAddress.address,
                operator: doormanAddress.address,
                token_id: 0,
            },
        }])
        .send()) as TransactionOperation
  
      await updateOperatorsTreasury.confirmation();
  
      // Farm FA12 Contract - set general contract addresses [doorman]
      // Farm FA12 Contract - set whitelist contract addresses [council] 
      // Farm FA2 Contract - set general contract addresses [doorman]
      // Farm FA2 Contract - set whitelist contract addresses [council]
      const farmContractsBatch = await utils.tezos.wallet
        .batch()
        .withContractCall(farmInstance.methods.updateWhitelistContracts('council', councilAddress.address))
        .withContractCall(farmFA2Instance.methods.updateWhitelistContracts('council', councilAddress.address))
      const farmContractsBatchOperation = await farmContractsBatch.send()
      await farmContractsBatchOperation.confirmation();
  
      console.log('Farm FA12 Contract - set whitelist contract addresses [council]')
      console.log('Farm FA2 Contract - set whitelist contract addresses [council]')
      
  
  
      // Farm Factory Contract - set whitelist contract addresses [council]
      const setCouncilContractAddressInFarmFactoryOperation = (await farmFactoryInstance.methods.updateWhitelistContracts('council', councilAddress.address).send()) as TransactionOperation
      await setCouncilContractAddressInFarmFactoryOperation.confirmation();
      console.log('Farm Factory Contract - set whitelist contract addresses [council]')
  
  
  
      // Delegation Contract - set whitelist contract addresses [treasury, governance, governanceSatellite, aggregatorFactory]
      const delegationContractsBatch = await utils.tezos.wallet
      .batch()

      // whitelist contracts
      .withContractCall(delegationInstance.methods.updateWhitelistContracts('treasury', treasuryAddress.address))
      .withContractCall(delegationInstance.methods.updateWhitelistContracts("governance", governanceAddress.address))
      .withContractCall(delegationInstance.methods.updateWhitelistContracts("governanceSatellite", governanceSatelliteAddress.address))
      .withContractCall(delegationInstance.methods.updateWhitelistContracts("aggregatorFactory", "KT18oMzNd8brk5b92TqeNWZC4EigjF8TnKkv"))

      const delegationContractsBatchOperation = await delegationContractsBatch.send()
      await delegationContractsBatchOperation.confirmation();
      console.log('Delegation Contract - set whitelist contract addresses [treasury, governance, governanceSatellite, aggregatorFactory]')
  
  
  
      // Governance Contract - set contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]
      const governanceContractsBatch = await utils.tezos.wallet
      .batch()
  
      // general contracts
      .withContractCall(governanceInstance.methods.updateGeneralContracts('emergencyGovernance'   , emergencyGovernanceAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('doorman'               , doormanAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('delegation'            , delegationAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('breakGlass'            , breakGlassAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('council'               , councilAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('vesting'               , vestingAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('lendingTreasury'       , treasuryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('taxTreasury'           , treasuryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('farmTreasury'          , treasuryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('paymentTreasury'       , treasuryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('satelliteTreasury'     , treasuryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('aggregatorTreasury'    , treasuryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('farmFactory'           , farmFactoryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('treasuryFactory'       , treasuryFactoryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('aggregatorFactory'     , "KT18oMzNd8brk5b92TqeNWZC4EigjF8TnKkv"))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('governanceSatellite'   , governanceSatelliteAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('governanceFinancial'   , governanceFinancialAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('vaultFactory'          , vaultFactoryAddress.address))
      .withContractCall(governanceInstance.methods.updateGeneralContracts('lendingController'     , lendingControllerMockTimeAddress.address))

      // uncomment if lending controller mock time contract is used
      // .withContractCall(governanceInstance.methods.updateGeneralContracts('lendingController'     , lendingControllerMockTimeAddress.address))
  
      // whitelist contracts
      .withContractCall(governanceInstance.methods.updateWhitelistContracts('vaultFactory'        , vaultFactoryAddress.address))
      .withContractCall(governanceInstance.methods.updateWhitelistContracts('farmFactory'         , farmFactoryAddress.address))
      .withContractCall(governanceInstance.methods.updateWhitelistContracts('treasuryFactory'     , treasuryFactoryAddress.address))
      .withContractCall(governanceInstance.methods.updateWhitelistContracts('aggregatorFactory'   , "KT18oMzNd8brk5b92TqeNWZC4EigjF8TnKkv"))
      .withContractCall(governanceInstance.methods.updateWhitelistContracts('delegation'          , delegationAddress.address))
      .withContractCall(governanceInstance.methods.updateWhitelistContracts('governanceSatellite' , governanceSatelliteAddress.address))
      .withContractCall(governanceInstance.methods.updateWhitelistContracts('governanceFinancial' , governanceFinancialAddress.address))
  
      // governance proxy
      .withContractCall(governanceInstance.methods.setGovernanceProxy(governanceProxyAddress.address))
      const governanceContractsBatchOperation = await governanceContractsBatch.send()
      await governanceContractsBatchOperation.confirmation();
  
      console.log('Governance Contract - set general contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]')
      console.log('Governance Contract - set governance proxy address')
  
  
  
      // Governance Financial Contract - set whitelist token contracts [MavrykFA2, MavrykFA12, MVK]
      const governanceFinancialContractsBatch = await utils.tezos.wallet
      .batch()

      // whitelist token contracts
      .withContractCall(governanceFinancialInstance.methods.updateWhitelistTokenContracts("MavrykFA2", mavrykFa2TokenAddress.address))
      .withContractCall(governanceFinancialInstance.methods.updateWhitelistTokenContracts("MavrykFA12", mavrykFa12TokenAddress.address))
      .withContractCall(governanceFinancialInstance.methods.updateWhitelistTokenContracts("MVK", mvkTokenAddress.address))

      const governanceFinancialContractsBatchOperation = await governanceFinancialContractsBatch.send()
      await governanceFinancialContractsBatchOperation.confirmation();
  
      console.log('Governance Financial Contract - set whitelist token contract addresss [MavrykFA12, MavrykFA2, MVK]')
  


      // Treasury Contract - set whitelist contract addresses map [council, aggregatorFactory]
      // Treasury Contract - set whitelist token contract addresses map [mavrykFa12, mavrykFA2, MVK]
      const treasuryContractsBatch = await utils.tezos.wallet
      .batch()
  
      // whitelist contracts
      .withContractCall(treasuryInstance.methods.updateWhitelistContracts('governanceProxy', governanceProxyAddress.address))
      .withContractCall(treasuryInstance.methods.updateWhitelistContracts("aggregatorFactory", "KT18oMzNd8brk5b92TqeNWZC4EigjF8TnKkv"))
      .withContractCall(treasuryInstance.methods.updateWhitelistContracts("treasuryFactory", treasuryFactoryAddress.address))
      .withContractCall(treasuryInstance.methods.updateWhitelistContracts("tokenSale", tokenSaleAddress.address))
      .withContractCall(treasuryInstance.methods.updateWhitelistContracts("doorman", doormanAddress.address))
      .withContractCall(treasuryInstance.methods.updateWhitelistContracts("delegation", delegationAddress.address))
      .withContractCall(treasuryInstance.methods.updateWhitelistContracts("governanceFinancial", governanceFinancialAddress.address))
      .withContractCall(treasuryInstance.methods.updateWhitelistContracts("governance", governanceAddress.address))
  
      // whitelist token contracts
      .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("MavrykFA2", mavrykFa2TokenAddress.address))
      .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("MavrykFA12", mavrykFa12TokenAddress.address))
      .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("MVK", mvkTokenAddress.address))
  
      const treasuryContractsBatchOperation = await treasuryContractsBatch.send()
      await treasuryContractsBatchOperation.confirmation();
      
      console.log('Treasury Contract - set whitelist contract addresses map [governanceProxy, aggregatorFactory, treasuryFactory]')
      console.log('Treasury Contract - set whitelist token contract addresses map [MavrykFA12, MavrykFA2, MVK]')
  
      // Vesting Contract - set whitelist contract addresses map [council]
      const setCouncilContractAddressInVesting = (await vestingInstance.methods.updateWhitelistContracts('council', councilAddress.address).send()) as TransactionOperation
      await setCouncilContractAddressInVesting.confirmation();
  
      console.log('Vesting Contract - set whitelist contract addresses map [council]')

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`linked contracts updated`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})