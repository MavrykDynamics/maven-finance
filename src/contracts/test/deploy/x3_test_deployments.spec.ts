const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "../helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require("../../helpers/saveContractAddress")
const saveMVKDecimals = require('../../helpers/saveMVKDecimals')
import { MichelsonMap } from '@taquito/michelson-encoder'
import {TezosToolkit, TransactionOperation} from "@taquito/taquito";
import {BigNumber} from "bignumber.js";

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import env from '../../env'
import { bob, alice, eve, mallory, oracle0, oracle1, oracle2, oracleMaintainer } from '../../scripts/sandbox/accounts'


// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { Governance, setGovernanceLambdas } from '../contractHelpers/governanceTestHelper'
import { GovernanceFinancial, setGovernanceFinancialLambdas } from '../contractHelpers/governanceFinancialTestHelper'
import { GovernanceSatellite, setGovernanceSatelliteLambdas } from '../contractHelpers/governanceSatelliteTestHelper'
import { GovernanceProxy, setGovernanceProxyContractLambdas, setGovernanceProxyContractProxyLambdas } from '../contractHelpers/governanceProxyTestHelper'
import { EmergencyGovernance, setEmergencyGovernanceLambdas } from '../contractHelpers/emergencyGovernanceTestHelper'
import { BreakGlass, setBreakGlassLambdas } from '../contractHelpers/breakGlassTestHelper'
import { Vesting, setVestingLambdas } from '../contractHelpers/vestingTestHelper'
import { Council, setCouncilLambdas } from '../contractHelpers/councilTestHelper'

import { Doorman, setDoormanLambdas } from '../contractHelpers/doormanTestHelper'
import { Delegation, setDelegationLambdas } from '../contractHelpers/delegationTestHelper'

import { Farm, setFarmLambdas } from "../contractHelpers/farmTestHelper"
import { FarmFactory, setFarmFactoryLambdas, setFarmFactoryProductLambdas } from "../contractHelpers/farmFactoryTestHelper"

import { Treasury, setTreasuryLambdas } from '../contractHelpers/treasuryTestHelper'
import { TreasuryFactory, 
  setTreasuryFactoryLambdas, setTreasuryFactoryProductLambdas 
} from '../contractHelpers/treasuryFactoryTestHelper'

import {Aggregator, setAggregatorLambdas} from '../contractHelpers/aggregatorTestHelper'
import {
  AggregatorFactory,
  setAggregatorFactoryLambdas, setAggregatorFactoryProductLambdas
} from '../contractHelpers/aggregatorFactoryTestHelper'

import { MvkToken } from '../contractHelpers/mvkTestHelper'
import { MavrykFa12Token } from '../contractHelpers/mavrykFa12TokenTestHelper'
import { MavrykFa2Token } from '../contractHelpers/mavrykFa2TokenTestHelper'
import { LPToken } from "../contractHelpers/testLPHelper"
import { TokenPoolLpToken } from "../contractHelpers/tokenPoolLpTokenTestHelper"

import { Vault } from "../contractHelpers/vaultTestHelper"

import { LendingController, setLendingControllerLambdas } from "../contractHelpers/lendingControllerTestHelper"
import { TokenPoolReward } from "../contractHelpers/tokenPoolRewardTestHelper"


// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { governanceStorage } from '../../storage/governanceStorage'
import { governanceFinancialStorage } from '../../storage/governanceFinancialStorage'
import { governanceSatelliteStorage } from '../../storage/governanceSatelliteStorage'
import { governanceProxyStorage } from '../../storage/governanceProxyStorage'
import { breakGlassStorage } from '../../storage/breakGlassStorage'
import { emergencyGovernanceStorage } from '../../storage/emergencyGovernanceStorage'

import { vestingStorage } from '../../storage/vestingStorage'
import { councilStorage } from '../../storage/councilStorage'

import { doormanStorage } from '../../storage/doormanStorage'
import { delegationStorage } from '../../storage/delegationStorage'

import { treasuryStorage } from '../../storage/treasuryStorage'
import { treasuryFactoryStorage } from '../../storage/treasuryFactoryStorage'

import { farmStorage } from "../../storage/farmStorage"
import { farmFactoryStorage } from "../../storage/farmFactoryStorage"

import { aggregatorStorage } from '../../storage/aggregatorStorage'
import { aggregatorFactoryStorage } from '../../storage/aggregatorFactoryStorage'

import { mvkStorage, mvkTokenDecimals } from '../../storage/mvkTokenStorage'
import { mavrykFa12TokenStorage } from '../../storage/mavrykFa12TokenStorage'
import { mavrykFa2TokenStorage } from '../../storage/mavrykFa2TokenStorage'
import { lpStorage } from "../../storage/testLPTokenStorage"
import { tokenPoolLpTokenStorage } from "../../storage/tokenPoolLpTokenStorage"

import { vaultStorage } from "../../storage/vaultStorage"


import { lendingControllerStorage } from "../../storage/lendingControllerStorage"
import { tokenPoolRewardStorage } from "../../storage/tokenPoolRewardStorage"

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Contracts Deployment for Tests', async () => {
  
  var utils: Utils

  var aggregator: Aggregator
  var aggregatorFactory: AggregatorFactory
  var doorman: Doorman
  var mvkToken: MvkToken
  var delegation: Delegation
  var governance: Governance
  var governanceFinancial: GovernanceFinancial
  var governanceSatellite: GovernanceSatellite
  var governanceProxy: GovernanceProxy
  var breakGlass: BreakGlass
  var emergencyGovernance: EmergencyGovernance
  var vesting: Vesting
  var council: Council
  var treasury: Treasury
  var treasuryFactory: TreasuryFactory
  var farm: Farm;
  var farmFA2: Farm;
  var farmFactory: FarmFactory;
  var lpToken: LPToken;
  var mockFa12Token : MavrykFa12Token
  var mockFa2Token : MavrykFa2Token

  var mockUsdXtzAggregator : Aggregator;
  var mockUsdMockFa12TokenAggregator : Aggregator;
  var mockUsdMockFa2TokenAggregator : Aggregator;

  var lpTokenPoolMockFa12Token : TokenPoolLpToken;
  var lpTokenPoolMockFa2Token : TokenPoolLpToken;
  var lpTokenPoolXtz : TokenPoolLpToken;

  var lendingController : LendingController
  var tokenPoolReward : TokenPoolReward
  
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
  
      mvkToken = await MvkToken.originate(utils.tezos, mvkStorage)
  
      await saveContractAddress('mvkTokenAddress', mvkToken.contract.address)
      console.log('MVK Token Contract deployed at:', mvkToken.contract.address)
  
      governanceStorage.whitelistDevelopers = [alice.pkh, bob.pkh]
      governanceStorage.mvkTokenAddress     = mvkToken.contract.address
      governance = await Governance.originate(utils.tezos,governanceStorage);
  
      await saveContractAddress('governanceAddress', governance.contract.address)
      console.log('Governance Contract deployed at:', governance.contract.address)
  
      doormanStorage.governanceAddress  = governance.contract.address
      doormanStorage.mvkTokenAddress    = mvkToken.contract.address
      doorman = await Doorman.originate(utils.tezos, doormanStorage)
  
      await saveContractAddress('doormanAddress', doorman.contract.address)
      console.log('Doorman Contract deployed at:', doorman.contract.address)
  
      delegationStorage.governanceAddress = governance.contract.address
      delegationStorage.mvkTokenAddress   = mvkToken.contract.address
      delegationStorage.whitelistContracts = MichelsonMap.fromLiteral({
        doorman: doorman.contract.address,
      })
      delegation = await Delegation.originate(utils.tezos, delegationStorage)
  
      await saveContractAddress('delegationAddress', delegation.contract.address)
      console.log('Delegation Contract deployed at:', delegation.contract.address)
  
      emergencyGovernanceStorage.governanceAddress = governance.contract.address
      emergencyGovernanceStorage.mvkTokenAddress  = mvkToken.contract.address
      emergencyGovernance = await EmergencyGovernance.originate(utils.tezos, emergencyGovernanceStorage)
  
      await saveContractAddress('emergencyGovernanceAddress', emergencyGovernance.contract.address)
      console.log('Emergency Governance Contract deployed at:', emergencyGovernance.contract.address)
  
      vestingStorage.governanceAddress  = governance.contract.address
      vestingStorage.mvkTokenAddress    = mvkToken.contract.address
      vesting = await Vesting.originate(utils.tezos,vestingStorage);
  
      await saveContractAddress('vestingAddress', vesting.contract.address)
      console.log('Vesting Contract deployed at:', vesting.contract.address)
  
      lpToken = await LPToken.originate(
        utils.tezos,
        lpStorage
      );
  
      await saveContractAddress("lpTokenAddress", lpToken.contract.address)
      console.log("LP Token Contract deployed at:", lpToken.contract.address);
  
      farmStorage.governanceAddress = governance.contract.address
      farmStorage.mvkTokenAddress  = mvkToken.contract.address
      farmStorage.config.lpToken.tokenAddress = lpToken.contract.address;
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
  
      farmStorage.config.lpToken.tokenAddress = mvkToken.contract.address;
      farmStorage.config.lpToken.tokenStandard = {
        fa2: ""
      };
       
      farmFA2 = await Farm.originate(
        utils.tezos,
        farmStorage
      );
  
      await saveContractAddress("farmFA2Address", farmFA2.contract.address)
      console.log("FA2 Farm Contract deployed at:", farmFA2.contract.address);
  
      farmStorage.config.lpToken.tokenAddress = lpToken.contract.address;
      farmStorage.config.infinite = true
      farmStorage.config.lpToken.tokenStandard = {
        fa12: ""
      };
  
      farmFactoryStorage.governanceAddress = governance.contract.address
      farmFactoryStorage.mvkTokenAddress  = mvkToken.contract.address;
      farmFactory = await FarmFactory.originate(
        utils.tezos,
        farmFactoryStorage
      );
  
      await saveContractAddress("farmFactoryAddress", farmFactory.contract.address)
      console.log("Farm Factory Contract deployed at:", farmFactory.contract.address);
  
      councilStorage.governanceAddress = governance.contract.address
      councilStorage.mvkTokenAddress  = mvkToken.contract.address
      councilStorage.councilMembers.set(bob.pkh, {
        name: "Bob",
        image: "Bob image",
        website: "Bob website"
      })
      councilStorage.councilMembers.set(alice.pkh, {
        name: "Alice",
        image: "Alice image",
        website: "Alice website"
      })
      councilStorage.councilMembers.set(eve.pkh, {
        name: "Eve",
        image: "Eve image",
        website: "Eve website"
      })
      council = await Council.originate(utils.tezos, councilStorage)
  
      await saveContractAddress('councilAddress', council.contract.address)
      console.log('Council Contract deployed at:', council.contract.address)
  
      breakGlassStorage.governanceAddress = governance.contract.address
      breakGlassStorage.mvkTokenAddress  = mvkToken.contract.address
  
      breakGlassStorage.councilMembers.set(bob.pkh, {
        name: "Bob",
        image: "Bob image",
        website: "Bob website"
      })
      breakGlassStorage.councilMembers.set(alice.pkh, {
        name: "Alice",
        image: "Alice image",
        website: "Alice website"
      })
      breakGlassStorage.councilMembers.set(eve.pkh, {
        name: "Eve",
        image: "Eve image",
        website: "Eve website"
      })
      breakGlassStorage.whitelistContracts = MichelsonMap.fromLiteral({
        emergencyGovernance: emergencyGovernance.contract.address
      })
      breakGlass = await BreakGlass.originate(utils.tezos, breakGlassStorage)
  
      await saveContractAddress('breakGlassAddress', breakGlass.contract.address)
      console.log('BreakGlass Contract deployed at:', breakGlass.contract.address)
  
      governanceFinancialStorage.mvkTokenAddress     = mvkToken.contract.address
      governanceFinancialStorage.governanceAddress   = governance.contract.address
      governanceFinancial = await GovernanceFinancial.originate(utils.tezos,governanceFinancialStorage);
  
      await saveContractAddress('governanceFinancialAddress', governanceFinancial.contract.address)
      console.log('Governance Financial Contract deployed at:', governanceFinancial.contract.address)
  
  
      treasuryStorage.governanceAddress = governance.contract.address
      treasuryStorage.mvkTokenAddress  = mvkToken.contract.address
      treasuryStorage.whitelistContracts = MichelsonMap.fromLiteral({
        doorman                   : doorman.contract.address,
        delegation                : delegation.contract.address,
        governanceFinancial       : governanceFinancial.contract.address,
        governance                : governance.contract.address
      })
      treasuryStorage.whitelistTokenContracts = MichelsonMap.fromLiteral({
        mvk       : mvkToken.contract.address,
      })
      treasury = await Treasury.originate(utils.tezos, treasuryStorage)
  
      await saveContractAddress('treasuryAddress', treasury.contract.address)
      console.log('Treasury Contract deployed at:', treasury.contract.address)
  
      treasuryFactoryStorage.governanceAddress = governance.contract.address
      treasuryFactoryStorage.mvkTokenAddress  = mvkToken.contract.address
      treasuryFactoryStorage.whitelistTokenContracts = MichelsonMap.fromLiteral({
        mvk             : mvkToken.contract.address,
  
      })
      treasuryFactory = await TreasuryFactory.originate(utils.tezos, treasuryFactoryStorage)
  
      await saveContractAddress('treasuryFactoryAddress', treasuryFactory.contract.address)
      console.log('Treasury Factory Contract deployed at:', treasuryFactory.contract.address)
  
  
      mockFa12Token = await MavrykFa12Token.originate(
        utils.tezos,
        mavrykFa12TokenStorage
      )
  
      await saveContractAddress('mockFa12TokenAddress', mockFa12Token.contract.address)
      console.log('Mock FA12 Token Contract deployed at:', mockFa12Token.contract.address)
  
      mockFa2Token = await MavrykFa2Token.originate(
        utils.tezos,
        mavrykFa2TokenStorage
      )
  
      await saveContractAddress('mockFa2TokenAddress', mockFa2Token.contract.address)
      console.log('Mock Fa2 Token Contract deployed at:', mockFa2Token.contract.address)
  
      governanceProxyStorage.governanceAddress  = governance.contract.address;
      governanceProxyStorage.mvkTokenAddress    = mvkToken.contract.address;
      governanceProxy = await GovernanceProxy.originate(utils.tezos, governanceProxyStorage);
  
      await saveContractAddress('governanceProxyAddress', governanceProxy.contract.address)
      console.log('Governance Proxy Contract deployed at:', governanceProxy.contract.address)
  
      aggregatorStorage.mvkTokenAddress = mvkToken.contract.address;
      aggregatorStorage.governanceAddress = governance.contract.address;
      aggregator = await Aggregator.originate(
        utils.tezos,
        aggregatorStorage
      )
  
      await saveContractAddress('aggregatorAddress', aggregator.contract.address)
      console.log('Aggregator Contract deployed at:', aggregator.contract.address)
  
      aggregatorFactoryStorage.mvkTokenAddress   = mvkToken.contract.address;
      aggregatorFactoryStorage.governanceAddress = governance.contract.address;
      aggregatorFactory = await AggregatorFactory.originate(
        utils.tezos,
        aggregatorFactoryStorage
      )
  
      await saveContractAddress('aggregatorFactoryAddress', aggregatorFactory.contract.address)
      console.log('Aggregator Factory Contract deployed at:', aggregatorFactory.contract.address)
  
      governanceSatelliteStorage.whitelistContracts = MichelsonMap.fromLiteral({
        "aggregatorFactory"     : aggregatorFactory.contract.address
      })
      governanceSatelliteStorage.mvkTokenAddress     = mvkToken.contract.address
      governanceSatelliteStorage.governanceAddress   = governance.contract.address
      governanceSatellite = await GovernanceSatellite.originate(utils.tezos,governanceSatelliteStorage);
  
      await saveContractAddress('governanceSatelliteAddress', governanceSatellite.contract.address)
      console.log('Governance Satellite Contract deployed at:', governanceSatellite.contract.address)


      lendingControllerStorage.mvkTokenAddress     = mvkToken.contract.address
      lendingControllerStorage.governanceAddress   = governance.contract.address
      lendingController = await LendingController.originate(utils.tezos,lendingControllerStorage);

      await saveContractAddress('lendingControllerAddress', lendingController.contract.address)
      console.log('Lending Controller Contract deployed at:', lendingController.contract.address)

      // LP Token for Mock FA12 Token in Lending Controller Token Pool 
      tokenPoolLpTokenStorage.whitelistContracts = MichelsonMap.fromLiteral({
        "lendingController"     : lendingController.contract.address
      })
      lpTokenPoolMockFa12Token = await TokenPoolLpToken.originate(
        utils.tezos,
        tokenPoolLpTokenStorage
      );
  
      await saveContractAddress("lpTokenPoolMockFa12TokenAddress", lpTokenPoolMockFa12Token.contract.address)
      console.log("LP Token Pool Mock Fa12 Token Contract deployed at:", lpTokenPoolMockFa12Token.contract.address);

      // LP Token for Mock FA12 Token in Lending Controller Token Pool 
      lpTokenPoolMockFa2Token = await TokenPoolLpToken.originate(
        utils.tezos,
        tokenPoolLpTokenStorage
      );
  
      await saveContractAddress("lpTokenPoolMockFa2TokenAddress", lpTokenPoolMockFa2Token.contract.address)
      console.log("LP Token Pool Mock Fa2 Token Contract deployed at:", lpTokenPoolMockFa2Token.contract.address);

      // LP Token for XTZ in Lending Controller Token Pool 
      lpTokenPoolXtz= await TokenPoolLpToken.originate(
        utils.tezos,
        tokenPoolLpTokenStorage
      );
  
      await saveContractAddress("lpTokenPoolXtzAddress", lpTokenPoolXtz.contract.address)
      console.log("LP Token Pool XTZ Contract deployed at:", lpTokenPoolXtz.contract.address);
  

      aggregatorStorage.config = {
        decimals                            : new BigNumber(6),
        alphaPercentPerThousand             : new BigNumber(2),
        
        percentOracleThreshold              : new BigNumber(49),
        heartBeatSeconds                    : new BigNumber(3),
        
        rewardAmountStakedMvk               : new BigNumber(10000000), // 0.01 MVK
        rewardAmountXtz                     : new BigNumber(1300),     // ~0.0013 tez 
      };
      aggregatorStorage.lastCompletedData = {
        round                   : new BigNumber(0),
        epoch                   : new BigNumber(0),
        data                    : new BigNumber(1500000),
        percentOracleResponse   : new BigNumber(100),
        lastUpdatedAt           : '1'
      };
      mockUsdMockFa12TokenAggregator = await Aggregator.originate(
        utils.tezos,
        aggregatorStorage
      )
  
      await saveContractAddress('mockUsdMockFa12TokenAggregatorAddress', mockUsdMockFa12TokenAggregator.contract.address)
      console.log('Mock USD/MockFA12Token Aggregator Contract deployed at:', mockUsdMockFa12TokenAggregator.contract.address)


      aggregatorStorage.lastCompletedData = {
        round                   : new BigNumber(0),
        epoch                   : new BigNumber(0),
        data                    : new BigNumber(3500000),
        percentOracleResponse   : new BigNumber(100),
        lastUpdatedAt           : '1'
      };
      mockUsdMockFa2TokenAggregator = await Aggregator.originate(
        utils.tezos,
        aggregatorStorage
      )
  
      await saveContractAddress('mockUsdMockFa2TokenAggregatorAddress', mockUsdMockFa2TokenAggregator.contract.address)
      console.log('Mock USD/MockFA2Token Aggregator Contract deployed at:', mockUsdMockFa2TokenAggregator.contract.address)


      aggregatorStorage.lastCompletedData = {
        round                   : new BigNumber(0),
        epoch                   : new BigNumber(0),
        data                    : new BigNumber(1800000),
        percentOracleResponse   : new BigNumber(100),
        lastUpdatedAt           : '1'
      };
      mockUsdXtzAggregator = await Aggregator.originate(
        utils.tezos,
        aggregatorStorage
      )
      await saveContractAddress('mockUsdXtzAggregatorAddress', mockUsdXtzAggregator.contract.address)
      console.log('Mock USD/XTZ Aggregator Contract deployed at:', mockUsdXtzAggregator.contract.address)
  
      tokenPoolReward = await TokenPoolReward.originate(
        utils.tezos,
        tokenPoolRewardStorage
      )
      await saveContractAddress('tokenPoolRewardAddress', tokenPoolReward.contract.address)
      console.log('Token Pool Reward Contract deployed at:', tokenPoolReward.contract.address)
  
  


      
  
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = doorman.tezos
      console.log('====== break ======')
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Governance Proxy Setup Lambdas - Contract Lambdas
      await setGovernanceProxyContractLambdas(tezos, governanceProxy.contract, 7) // 7 is the last index + 1 (exclusive)
      console.log("Governance Proxy Contract - Lambdas Setup")

      // Governance Proxy Setup Lambdas - Proxy Lambdas
      await setGovernanceProxyContractProxyLambdas(tezos, governanceProxy.contract, 7) // 7 is the starting index (inclusive)
      console.log("Governance Proxy Contract - Proxy Lambdas Setup")



      // Governance Setup Lambdas
      await setGovernanceLambdas(tezos, governance.contract)
      console.log("Governance Lambdas Setup")

      // Governance Financial Setup Lambdas
      await setGovernanceFinancialLambdas(tezos, governanceFinancial.contract)
      console.log("Governance Financial Lambdas Setup")

      // Governance Satellite Setup Lambdas      
      await setGovernanceSatelliteLambdas(tezos, governanceSatellite.contract)
      console.log("Governance Satellite Lambdas Setup")



      // Doorman Setup Lambdas
      await setDoormanLambdas(tezos, doorman.contract)
      console.log("Doorman Lambdas Setup")



      // Delegation Setup Lambdas
      await setDelegationLambdas(tezos, delegation.contract)
      console.log("Delegation Lambdas Setup")
      


      // Break Glass Setup Lambdas
      await setBreakGlassLambdas(tezos, breakGlass.contract)
      console.log("Break Glass Lambdas Setup")



      // Emergency Governance Setup Lambdas
      await setEmergencyGovernanceLambdas(tezos, emergencyGovernance.contract)
      console.log("Emergency Governance Lambdas Setup")
      


      // Council Setup Lambdas
      await setCouncilLambdas(tezos, council.contract);
      console.log("Council Lambdas Setup")
  


      // Vesting Setup Lambdas      
      await setVestingLambdas(tezos, vesting.contract);
      console.log("Vesting Lambdas Setup")



      // Farm FA12 Setup Lambdas
      await setFarmLambdas(tezos, farm.contract)
      console.log("Farm FA12 Lambdas Setup")

      // Farm FA2 Setup Lambdas
      await setFarmLambdas(tezos, farmFA2.contract)
      console.log("Farm FA2 Lambdas Setup")

      // Farm Factory Setup Lambdas
      await setFarmFactoryLambdas(tezos, farmFactory.contract)
      console.log("Farm Factory Lambdas Setup")

      // Farm Factory Setup Product Lambdas
      await setFarmFactoryProductLambdas(tezos, farmFactory.contract)
      console.log("Farm Factory Product Lambdas Setup")



      // Treasury Setup Lambdas
      await setTreasuryLambdas(tezos, treasury.contract);
      console.log("Treasury Lambdas Setup")

      // Treasury Factory Setup Lambdas
      await setTreasuryFactoryLambdas(tezos, treasuryFactory.contract);
      console.log("Treasury Factory Lambdas Setup")

      // Treasury Factory Product Setup Lambdas
      await setTreasuryFactoryProductLambdas(tezos, treasuryFactory.contract);
      console.log("Treasury Factory Product Lambdas Setup")



      // Aggregator Setup Lambdas
      await setAggregatorLambdas(tezos, aggregator.contract);
      console.log("Aggregator Lambdas Setup")

      // Aggregator Factory Setup Lambdas
      await setAggregatorFactoryLambdas(tezos, aggregatorFactory.contract);
      console.log("AggregatorFactory Lambdas Setup")

      await setAggregatorFactoryProductLambdas(tezos, aggregatorFactory.contract);
      console.log("Aggregator Factory Product Lambdas Setup")


      // Lending Controller Lambdas
      await setLendingControllerLambdas(tezos, lendingController.contract);
      console.log("Lending Controller Lambdas Setup")

      // Lending Controller Setup Vault Lambdas
      // await setLendingControllerProductLambdas(tezos, lendingController.contract)
      // console.log("Lending Controller Vault Lambdas Setup")
  
    
      // Set Lambdas End

      //----------------------------
      // Set remaining contract addresses - post-deployment
      //----------------------------
  
      // Aggregator Factory Contract - set whitelist contract addresses [governanceSatellite]
      // Aggregator Factory Contract - set general contract addresses [governanceSatellite]
      const aggregatorFactoryContractsBatch = await tezos.wallet
      .batch()
      .withContractCall(aggregatorFactory.contract.methods.updateWhitelistContracts("governanceSatellite", governanceSatellite.contract.address))
      
      const aggregatorFactoryContractsBatchOperation = await aggregatorFactoryContractsBatch.send()
      await confirmOperation(tezos, aggregatorFactoryContractsBatchOperation.opHash)
  
      console.log('Aggregator Factory Contract - set whitelist contract addresses [governanceSatellite]')
  
      // Aggregator Contract - set whitelist contract addresses [aggregatorFactory]
      const aggregatorContractsBatch = await tezos.wallet
      .batch()
      .withContractCall(aggregator.contract.methods.updateWhitelistContracts("aggregatorFactory", aggregatorFactory.contract.address))
      .withContractCall(aggregator.contract.methods.updateWhitelistContracts("governanceSatellite", governanceSatellite.contract.address))
      
      const aggregatorContractsBatchOperation = await aggregatorContractsBatch.send()
      await confirmOperation(tezos, aggregatorContractsBatchOperation.opHash)
      
  
      // MVK Token Contract - set governance contract address
      // MVK Token Contract - set whitelist contract addresses [doorman, vesting, treasury]
  
      const mvkContractsBatch = await tezos.wallet
        .batch()
        .withContractCall(mvkToken.contract.methods.setGovernance(governance.contract.address))
        .withContractCall(mvkToken.contract.methods.updateWhitelistContracts("doorman", doorman.contract.address))
        .withContractCall(mvkToken.contract.methods.updateWhitelistContracts('vesting', vesting.contract.address))
        .withContractCall(mvkToken.contract.methods.updateWhitelistContracts('treasury', treasury.contract.address))
        const mvkContractsBatchOperation = await mvkContractsBatch.send()
        await confirmOperation(tezos, mvkContractsBatchOperation.opHash)
  
      console.log('MVK Token Contract - set whitelist contract addresses [doorman, vesting, treasury]')
      
      // Send MVK to treasury contract and council 
      const transferToTreasury = await mvkToken.contract.methods
        .transfer([
          {
            from_: bob.pkh,
            txs: [
              {
                to_: treasury.contract.address,
                token_id: 0,
                amount: MVK(6000),
              },
              {
                to_: council.contract.address,
                token_id: 0,
                amount: MVK(15),
              }
            ],
          },
        ])
        .send()
      await confirmOperation(tezos, transferToTreasury.hash)
      const updateOperatorsTreasury = (await treasury.contract.methods
        .updateMvkOperators([
          {
            add_operator: {
                owner: treasury.contract.address,
                operator: doorman.contract.address,
                token_id: 0,
            },
        }])
        .send()) as TransactionOperation
  
      await confirmOperation(tezos, updateOperatorsTreasury.hash)
  
      // Farm FA12 Contract - set general contract addresses [doorman]
      // Farm FA12 Contract - set whitelist contract addresses [council] 
      // Farm FA2 Contract - set general contract addresses [doorman]
      // Farm FA2 Contract - set whitelist contract addresses [council]
      const farmContractsBatch = await tezos.wallet
        .batch()
        .withContractCall(farm.contract.methods.updateWhitelistContracts('council', council.contract.address))
        .withContractCall(farmFA2.contract.methods.updateWhitelistContracts('council', council.contract.address))
      const farmContractsBatchOperation = await farmContractsBatch.send()
      await confirmOperation(tezos, farmContractsBatchOperation.opHash)
  
      console.log('Farm FA12 Contract - set whitelist contract addresses [council]')
      console.log('Farm FA2 Contract - set whitelist contract addresses [council]')
      
  
  
      // Farm Factory Contract - set whitelist contract addresses [council]
      const setCouncilContractAddressInFarmFactoryOperation = (await farmFactory.contract.methods.updateWhitelistContracts('council', council.contract.address).send()) as TransactionOperation
      await confirmOperation(tezos, setCouncilContractAddressInFarmFactoryOperation.hash)
      console.log('Farm Factory Contract - set whitelist contract addresses [council]')
  
  
  
      // Delegation Contract - set whitelist contract addresses [treasury, governance, governanceSatellite, aggregatorFactory]
      const delegationContractsBatch = await tezos.wallet
      .batch()

      // whitelist contracts
      .withContractCall(delegation.contract.methods.updateWhitelistContracts('treasury', treasury.contract.address))
      .withContractCall(delegation.contract.methods.updateWhitelistContracts("governance", governance.contract.address))
      .withContractCall(delegation.contract.methods.updateWhitelistContracts("governanceSatellite", governanceSatellite.contract.address))
      .withContractCall(delegation.contract.methods.updateWhitelistContracts("aggregatorFactory", aggregatorFactory.contract.address))

      const delegationContractsBatchOperation = await delegationContractsBatch.send()
      await confirmOperation(tezos, delegationContractsBatchOperation.opHash)
      console.log('Delegation Contract - set whitelist contract addresses [treasury, governance, governanceSatellite, aggregatorFactory]')
  
  
  
      // Governance Contract - set contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]
      const governanceContractsBatch = await tezos.wallet
      .batch()
  
      // general contracts
      .withContractCall(governance.contract.methods.updateGeneralContracts('emergencyGovernance', emergencyGovernance.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('doorman', doorman.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('delegation', delegation.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('breakGlass', breakGlass.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('council', council.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('vesting', vesting.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('lendingTreasury', treasury.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('taxTreasury', treasury.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('farmTreasury', treasury.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('paymentTreasury', treasury.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('satelliteTreasury', treasury.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('aggregatorTreasury', treasury.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('farmFactory', farmFactory.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('treasuryFactory', treasuryFactory.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('aggregatorFactory', aggregatorFactory.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('governanceSatellite', governanceSatellite.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('governanceFinancial', governanceFinancial.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('lendingController', lendingController.contract.address))
      .withContractCall(governance.contract.methods.updateGeneralContracts('tokenPoolReward', tokenPoolReward.contract.address))
  
      // whitelist contracts
      .withContractCall(governance.contract.methods.updateWhitelistContracts('farmFactory', farmFactory.contract.address))
      .withContractCall(governance.contract.methods.updateWhitelistContracts('treasuryFactory', treasuryFactory.contract.address))
      .withContractCall(governance.contract.methods.updateWhitelistContracts('aggregatorFactory', aggregatorFactory.contract.address))
      .withContractCall(governance.contract.methods.updateWhitelistContracts('delegation', delegation.contract.address))
      .withContractCall(governance.contract.methods.updateWhitelistContracts('governanceSatellite', governanceSatellite.contract.address))
      .withContractCall(governance.contract.methods.updateWhitelistContracts('governanceFinancial', governanceFinancial.contract.address))
  
      // governance proxy
      .withContractCall(governance.contract.methods.setGovernanceProxy(governanceProxy.contract.address))
      const governanceContractsBatchOperation = await governanceContractsBatch.send()
      await confirmOperation(tezos, governanceContractsBatchOperation.opHash)
  
      console.log('Governance Contract - set general contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]')
      console.log('Governance Contract - set governance proxy address')
  
  
      // Governance Financial Contract - set whitelist token contracts [MockFA2, MockFA12, MVK]
      const governanceFinancialContractsBatch = await tezos.wallet
      .batch()

      // whitelist token contracts
      .withContractCall(governanceFinancial.contract.methods.updateWhitelistTokenContracts("MockFA2", mockFa2Token.contract.address))
      .withContractCall(governanceFinancial.contract.methods.updateWhitelistTokenContracts("MockFA12", mockFa12Token.contract.address))
      .withContractCall(governanceFinancial.contract.methods.updateWhitelistTokenContracts("MVK", mvkToken.contract.address))

      const governanceFinancialContractsBatchOperation = await governanceFinancialContractsBatch.send()
      await confirmOperation(tezos, governanceFinancialContractsBatchOperation.opHash)
  
      console.log('Governance Financial Contract - set whitelist token contract addresss [MockFA12, MockFA2, MVK]')
  

   
      // Treasury Contract - set whitelist contract addresses map [council, aggregatorFactory]
      // Treasury Contract - set whitelist token contract addresses map [mockFA12, mockFA2, MVK]
      const treasuryContractsBatch = await tezos.wallet
      .batch()
  
      // whitelist contracts
      .withContractCall(treasury.contract.methods.updateWhitelistContracts('governanceProxy', governanceProxy.contract.address))
      .withContractCall(treasury.contract.methods.updateWhitelistContracts("aggregatorFactory", aggregatorFactory.contract.address))
  
      // whitelist token contracts
      .withContractCall(treasury.contract.methods.updateWhitelistTokenContracts("MockFA2", mockFa2Token.contract.address))
      .withContractCall(treasury.contract.methods.updateWhitelistTokenContracts("MockFA12", mockFa12Token.contract.address))
      .withContractCall(treasury.contract.methods.updateWhitelistTokenContracts("MVK", mvkToken.contract.address))
  
      const treasuryContractsBatchOperation = await treasuryContractsBatch.send()
      await confirmOperation(tezos, treasuryContractsBatchOperation.opHash)
      
      console.log('Treasury Contract - set whitelist contract addresses map [governanceProxy, aggregatorFactory]')
      console.log('Treasury Contract - set whitelist token contract addresses map [MockFA12, MockFA2, MVK]')
  
  
  
      // Vesting Contract - set whitelist contract addresses map [council]
      const setCouncilContractAddressInVesting = (await vesting.contract.methods.updateWhitelistContracts('council', council.contract.address).send()) as TransactionOperation
      await confirmOperation(tezos, setCouncilContractAddressInVesting.hash)
  
      console.log('Vesting Contract - set whitelist contract addresses map [council]')
      
  
      //----------------------------
      // Save MVK Decimals to JSON (for reuse in JS / PyTezos Tests)
      //----------------------------
      await saveMVKDecimals(mvkTokenDecimals)
  
  
      //----------------------------
      // For Oracle/Aggregator test net deployment if needed
      //----------------------------
  
      if(utils.network != "development"){
  
          console.log("Setup Oracles")
  
          const oracleMap = MichelsonMap.fromLiteral({
            [oracle0.pkh] : true,
            [oracle1.pkh] : true,
            [oracle2.pkh] : true,
            // [oracle3.pkh]: true,
            // [oracle4.pkh]: true,
          }) as MichelsonMap<
              string,
              boolean
              >

            const aggregatorMetadataBase = Buffer.from(
                JSON.stringify({
                    name: 'MAVRYK Aggregator Contract',
                    version: 'v1.0.0',
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                }),
                'ascii',
                ).toString('hex')
  
          const createAggregatorsBatch = await tezos.wallet
              .batch()
              .withContractCall(aggregatorFactory.contract.methods.createAggregator(
                  'USD',
                  'BTC',
  
                  'USDBTC',
                  true,
                  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // numberBlocksDelay
                  
                  new BigNumber(86400),         // deviationTriggerBanDuration
                  new BigNumber(5),             // perthousandDeviationTrigger
                  new BigNumber(60),            // percentOracleThreshold
                  
                  new BigNumber(0),             // requestRateDeviationDepositFee
  
                  new BigNumber(10000000),      // deviationRewardStakedMvk
                  new BigNumber(0),             // deviationRewardAmountXtz
                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
                  oracleMaintainer.pkh,         // maintainer
                  aggregatorMetadataBase       // metadata bytes

              ))
              .withContractCall(aggregatorFactory.contract.methods.createAggregator(
                  'USD',
                  'XTZ',
  
                  'USDXTZ',
                  true,
  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // numberBlocksDelay
                  
                  new BigNumber(86400),         // deviationTriggerBanDuration
                  new BigNumber(5),             // perthousandDeviationTrigger
                  new BigNumber(60),            // percentOracleThreshold
                  
                  new BigNumber(0),             // requestRateDeviationDepositFee
                  
                  new BigNumber(10000000),      // deviationRewardStakedMvk
                  new BigNumber(0),             // deviationRewardAmountXtz
                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
                  oracleMaintainer.pkh,         // maintainer
                  aggregatorMetadataBase        // metadata bytes

              ))
              .withContractCall(aggregatorFactory.contract.methods.createAggregator(
                  'USD',
                  'DOGE',
  
                  'USDDOGE',
                  true,
  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // numberBlocksDelay
                  
                  new BigNumber(86400),         // deviationTriggerBanDuration
                  new BigNumber(5),             // perthousandDeviationTrigger
                  new BigNumber(60),            // percentOracleThreshold
                  
                  new BigNumber(0),             // requestRateDeviationDepositFee
                  
                  new BigNumber(10000000),      // deviationRewardStakedMvk
                  new BigNumber(0),             // deviationRewardAmountXtz
                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
                  oracleMaintainer.pkh,         // maintainer
                  aggregatorMetadataBase        // metadata bytes
                  
              ))
  
          const createAggregatorsBatchOperation = await createAggregatorsBatch.send()
          await confirmOperation(tezos, createAggregatorsBatchOperation.opHash)
  
          console.log("Aggregators deployed")
      }

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`test all contract deployments`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --') 
      console.log('Test: All contracts deployed')
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})