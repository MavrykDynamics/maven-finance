import {BigNumber} from "bignumber.js";

const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "../helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require("../../helpers/saveContractAddress")
const saveMVKDecimals = require('../../helpers/saveMVKDecimals')
import { MichelsonMap } from '@taquito/michelson-encoder'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import env from '../../env'
import { bob, alice, eve, mallory, oracle0, oracle1, oracle2, oracleMaintainer } from '../../scripts/sandbox/accounts'

import governanceProxyLambdas from '../../build/lambdas/governanceProxyLambdas.json'
import governanceLambdas from '../../build/lambdas/governanceLambdas.json'
import governanceFinancialLambdas from '../../build/lambdas/governanceFinancialLambdas.json'
import governanceSatelliteLambdas from '../../build/lambdas/governanceSatelliteLambdas.json'
import doormanLambdas from '../../build/lambdas/doormanLambdas.json'
import delegationLambdas from '../../build/lambdas/delegationLambdas.json'
import breakGlassLambdas from '../../build/lambdas/breakGlassLambdas.json'
import emergencyGovernanceLambdas from '../../build/lambdas/emergencyGovernanceLambdas.json'
import councilLambdas from '../../build/lambdas/councilLambdas.json'
import farmLambdas from '../../build/lambdas/farmLambdas.json'
import farmFactoryLambdas from '../../build/lambdas/farmFactoryLambdas.json'
import vestingLambdas from '../../build/lambdas/vestingLambdas.json'
import treasuryLambdas from '../../build/lambdas/treasuryLambdas.json'
import treasuryFactoryLambdas from '../../build/lambdas/treasuryFactoryLambdas.json'
import aggregatorLambdas from '../../build/lambdas/aggregatorLambdas.json'
import aggregatorFactoryLambdas from '../../build/lambdas/aggregatorFactoryLambdas.json'

import { Aggregator, aggregatorLambdaIndexOf } from '../helpers/aggregatorHelper'
import { AggregatorFactory, aggregatorFactoryLambdaIndexOf } from '../helpers/aggregatorFactoryHelper'
import { Doorman } from '../helpers/doormanHelper'
import { Delegation } from '../helpers/delegationHelper'
import { MvkToken } from '../helpers/mvkHelper'
import { Governance } from '../helpers/governanceHelper'
import { GovernanceFinancial } from '../helpers/governanceFinancialHelper'
import { GovernanceSatellite } from '../helpers/governanceSatelliteHelper'
import { GovernanceProxy } from '../helpers/governanceProxyHelper'
import { BreakGlass } from '../helpers/breakGlassHelper'
import { EmergencyGovernance } from '../helpers/emergencyGovernanceHelper'
import { Vesting } from '../helpers/vestingHelper'
import { Council } from '../helpers/councilHelper'
import { Farm } from "../helpers/farmHelper";
import { FarmFactory } from "../helpers/farmFactoryHelper";
import { LPToken } from "../helpers/testLPHelper";
import { Treasury } from '../helpers/treasuryHelper'
import { TreasuryFactory } from '../helpers/treasuryFactoryHelper'
import { MockFa12Token } from '../helpers/mockFa12TokenHelper'
import { MockFa2Token } from '../helpers/mockFa2TokenHelper'


import { aggregatorStorage } from '../../storage/aggregatorStorage'
import { aggregatorFactoryStorage } from '../../storage/aggregatorFactoryStorage'
import { doormanStorage } from '../../storage/doormanStorage'
import { delegationStorage } from '../../storage/delegationStorage'
import { mvkStorage, mvkTokenDecimals } from '../../storage/mvkTokenStorage'
import { governanceStorage } from '../../storage/governanceStorage'
import { governanceFinancialStorage } from '../../storage/governanceFinancialStorage'
import { governanceSatelliteStorage } from '../../storage/governanceSatelliteStorage'
import { governanceProxyStorage } from '../../storage/governanceProxyStorage'
import { breakGlassStorage } from '../../storage/breakGlassStorage'
import { emergencyGovernanceStorage } from '../../storage/emergencyGovernanceStorage'
import { vestingStorage } from '../../storage/vestingStorage'
import { councilStorage } from '../../storage/councilStorage'
import { treasuryStorage } from '../../storage/treasuryStorage'
import { treasuryFactoryStorage } from '../../storage/treasuryFactoryStorage'
import { farmStorage } from "../../storage/farmStorage";
import { farmFactoryStorage } from "../../storage/farmFactoryStorage";
import { lpStorage } from "../../storage/testLPTokenStorage";
import { mockFa12TokenStorage } from '../../storage/mockFa12TokenStorage'
import { mockFa2TokenStorage } from '../../storage/mockFa2TokenStorage'

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
  var mockFa12Token : MockFa12Token
  var mockFa2Token : MockFa2Token
  var tezos
  

  const signerFactory = async (pk) => {
    await tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) })
    return tezos
  }

  before('setup', async () => {
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
    delegationStorage.generalContracts  = MichelsonMap.fromLiteral({
      doorman: doorman.contract.address,
    })
    delegationStorage.whitelistContracts = MichelsonMap.fromLiteral({
      doorman: doorman.contract.address,
    })
    delegation = await Delegation.originate(utils.tezos, delegationStorage)

    await saveContractAddress('delegationAddress', delegation.contract.address)
    console.log('Delegation Contract deployed at:', delegation.contract.address)

    emergencyGovernanceStorage.governanceAddress = governance.contract.address
    emergencyGovernanceStorage.mvkTokenAddress  = mvkToken.contract.address
    emergencyGovernanceStorage.generalContracts = MichelsonMap.fromLiteral({
      governance: governance.contract.address,
      doorman: doorman.contract.address
    })
    emergencyGovernance = await EmergencyGovernance.originate(utils.tezos, emergencyGovernanceStorage)

    await saveContractAddress('emergencyGovernanceAddress', emergencyGovernance.contract.address)
    console.log('Emergency Governance Contract deployed at:', emergencyGovernance.contract.address)

    vestingStorage.governanceAddress  = governance.contract.address
    vestingStorage.mvkTokenAddress    = mvkToken.contract.address
    vestingStorage.generalContracts   = MichelsonMap.fromLiteral({
      "doorman"    : doorman.contract.address,
      "delegation" : delegation.contract.address,
    });
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
    farmFactoryStorage.generalContracts = MichelsonMap.fromLiteral({
      doorman: doorman.contract.address,
    });
    farmFactory = await FarmFactory.originate(
      utils.tezos,
      farmFactoryStorage
    );

    await saveContractAddress("farmFactoryAddress", farmFactory.contract.address)
    console.log("Farm Factory Contract deployed at:", farmFactory.contract.address);

    councilStorage.governanceAddress = governance.contract.address
    councilStorage.mvkTokenAddress  = mvkToken.contract.address
    councilStorage.generalContracts = MichelsonMap.fromLiteral({
      vesting: vesting.contract.address,
      governance: governance.contract.address,
      farmFactory: farmFactory.contract.address
    })
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
    breakGlassStorage.generalContracts = MichelsonMap.fromLiteral({
      doorman: doorman.contract.address,
      delegation: delegation.contract.address,
      governance: governance.contract.address,
      vesting: vesting.contract.address,
      council: council.contract.address,
      emergencyGovernance: emergencyGovernance.contract.address,
    })

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

    governanceFinancialStorage.generalContracts = MichelsonMap.fromLiteral({
      "delegation"            : delegation.contract.address,
      "doorman"               : doorman.contract.address,
      "council"               : council.contract.address
    })
    governanceFinancialStorage.mvkTokenAddress     = mvkToken.contract.address
    governanceFinancialStorage.governanceAddress   = governance.contract.address
    governanceFinancial = await GovernanceFinancial.originate(utils.tezos,governanceFinancialStorage);

    await saveContractAddress('governanceFinancialAddress', governanceFinancial.contract.address)
    console.log('Governance Financial Contract deployed at:', governanceFinancial.contract.address)


    treasuryStorage.governanceAddress = governance.contract.address
    treasuryStorage.mvkTokenAddress  = mvkToken.contract.address
    treasuryStorage.generalContracts = MichelsonMap.fromLiteral({
      "doorman"   : doorman.contract.address,
    });
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
    treasuryFactoryStorage.generalContracts = MichelsonMap.fromLiteral({
      "doorman"     : doorman.contract.address,
      "delegation"  : delegation.contract.address
    });
    treasuryFactoryStorage.whitelistTokenContracts = MichelsonMap.fromLiteral({
      mvk             : mvkToken.contract.address,

    })
    treasuryFactory = await TreasuryFactory.originate(utils.tezos, treasuryFactoryStorage)

    await saveContractAddress('treasuryFactoryAddress', treasuryFactory.contract.address)
    console.log('Treasury Factory Contract deployed at:', treasuryFactory.contract.address)


    mockFa12Token = await MockFa12Token.originate(
      utils.tezos,
      mockFa12TokenStorage
    )

    await saveContractAddress('mockFa12TokenAddress', mockFa12Token.contract.address)
    console.log('Mock FA12 Token Contract deployed at:', mockFa12Token.contract.address)

    mockFa2Token = await MockFa2Token.originate(
      utils.tezos,
      mockFa2TokenStorage
    )

    await saveContractAddress('mockFa2TokenAddress', mockFa2Token.contract.address)
    console.log('Mock Fa2 Token Contract deployed at:', mockFa2Token.contract.address)


    governanceProxyStorage.generalContracts   = MichelsonMap.fromLiteral({
      "delegation"            : delegation.contract.address,
      "doorman"               : doorman.contract.address,
      "breakGlass"            : breakGlass.contract.address,
      "treasuryFactory"       : treasuryFactory.contract.address,
      "emergencyGovernance"   : emergencyGovernance.contract.address,
      "farmFactory"           : farmFactory.contract.address,
      "council"               : council.contract.address,
      "governanceFinancial"   : governanceFinancial.contract.address,
      "vesting"               : vesting.contract.address
    });
    governanceProxyStorage.governanceAddress  = governance.contract.address;
    governanceProxyStorage.mvkTokenAddress    = mvkToken.contract.address;
    governanceProxy = await GovernanceProxy.originate(utils.tezos, governanceProxyStorage);

    await saveContractAddress('governanceProxyAddress', governanceProxy.contract.address)
    console.log('Governance Proxy Contract deployed at:', governanceProxy.contract.address)

    aggregatorStorage.mvkTokenAddress = mvkToken.contract.address;
    aggregator = await Aggregator.originate(
      utils.tezos,
      aggregatorStorage
    )

    await saveContractAddress('aggregatorAddress', aggregator.contract.address)
    console.log('Aggregator Contract deployed at:', aggregator.contract.address)

    aggregatorFactoryStorage.mvkTokenAddress = mvkToken.contract.address;
    aggregatorFactory = await AggregatorFactory.originate(
      utils.tezos,
      aggregatorFactoryStorage
    )

    await saveContractAddress('aggregatorFactoryAddress', aggregatorFactory.contract.address)
    console.log('Aggregator Factory Contract deployed at:', aggregatorFactory.contract.address)

    governanceSatelliteStorage.generalContracts = MichelsonMap.fromLiteral({
      "delegation"            : delegation.contract.address,
      "doorman"               : doorman.contract.address,
      "council"               : council.contract.address,
      "aggregatorFactory"     : aggregatorFactory.contract.address
    })
    governanceSatelliteStorage.mvkTokenAddress     = mvkToken.contract.address
    governanceSatelliteStorage.governanceAddress   = governance.contract.address
    governanceSatellite = await GovernanceSatellite.originate(utils.tezos,governanceSatelliteStorage);

    await saveContractAddress('governanceSatelliteAddress', governanceSatellite.contract.address)
    console.log('Governance Satellite Contract deployed at:', governanceSatellite.contract.address)


    /* ---- ---- ---- ---- ---- */

    tezos = doorman.tezos
    console.log('====== break ======')

    // Set Lambdas

    await signerFactory(bob.sk);

    // Governance Proxy Setup Lambdas
    const governanceProxyLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governanceProxy.contract.methods.setLambda("lambdaSetAdmin"                              , governanceProxyLambdas[0]))  // setAdmin
      .withContractCall(governanceProxy.contract.methods.setLambda("lambdaSetGovernance"                         , governanceProxyLambdas[1]))  // setGovernance
      .withContractCall(governanceProxy.contract.methods.setLambda("lambdaUpdateMetadata"                        , governanceProxyLambdas[2]))  // updateMetadata
      .withContractCall(governanceProxy.contract.methods.setLambda("lambdaUpdateWhitelistContracts"              , governanceProxyLambdas[3]))  // updateWhitelistContracts
      .withContractCall(governanceProxy.contract.methods.setLambda("lambdaUpdateWhitelistTokenContracts"         , governanceProxyLambdas[4]))  // updateWhitelistTokenContracts
      .withContractCall(governanceProxy.contract.methods.setLambda("lambdaUpdateGeneralContracts"                , governanceProxyLambdas[5]))  // updateGeneralContracts
      const setupGovernanceProxyLambdasOperation = await governanceProxyLambdaBatch.send()
      await setupGovernanceProxyLambdasOperation.confirmation()
      console.log("Governance Proxy Lambdas Setup")

    // Governance Proxy Setup Proxy Lambdas (external contracts)
      const governanceProxyFirstLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(0, governanceProxyLambdas[6])) // executeGovernanceLambdaProxy
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(1, governanceProxyLambdas[7])) // updateProxyLambda
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(2, governanceProxyLambdas[8])) // setContractAdmin
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(3, governanceProxyLambdas[9])) // setContractGovernance
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(4, governanceProxyLambdas[10])) // setContractLambda
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(5, governanceProxyLambdas[11])) // setFactoryProductLambda
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(6, governanceProxyLambdas[12])) // updateContractMetadata
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(7, governanceProxyLambdas[13])) // updateContractWhitelistMap
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(8, governanceProxyLambdas[14])) // updateContractGeneralMap
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(9, governanceProxyLambdas[15])) // updateContractWhitelistTokenMap
      
      const setupGovernanceProxyFirstLambdasOperation = await governanceProxyFirstLambdaBatch.send()
      await setupGovernanceProxyFirstLambdasOperation.confirmation()
      console.log("GovernanceProxy Proxy Lambdas Setup (1st Batch)")

      const governanceProxySecondLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(10, governanceProxyLambdas[16])) // updateGovernanceConfig
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(11, governanceProxyLambdas[17])) // updateGovernanceFinancialConfig
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(12, governanceProxyLambdas[18])) // updateDelegationConfig
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(13, governanceProxyLambdas[19])) // updateEmergencyConfig
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(14, governanceProxyLambdas[20])) // updateBreakGlassConfig
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(15, governanceProxyLambdas[21])) // updateCouncilConfig
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(16, governanceProxyLambdas[22])) // updateFarmConfig
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(17, governanceProxyLambdas[23])) // updateDoormanMinMvkAmount
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(18, governanceProxyLambdas[24])) // updateWhitelistDevelopersSet
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(19, governanceProxyLambdas[25])) // setGovernanceProxy
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(20, governanceProxyLambdas[26])) // tracreateFarmckFarm
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(21, governanceProxyLambdas[27])) // trackFarm
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(22, governanceProxyLambdas[28])) // untrackFarm

      const setupGovernanceProxySecondLambdasOperation = await governanceProxySecondLambdaBatch.send()
      await setupGovernanceProxySecondLambdasOperation.confirmation()
      console.log("GovernanceProxy Proxy Lambdas Setup (2nd Batch)")
      
      const governanceProxyThirdLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(23, governanceProxyLambdas[29])) // initFarm
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(24, governanceProxyLambdas[30])) // closeFarm
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(25, governanceProxyLambdas[31])) // createTreasury
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(26, governanceProxyLambdas[32])) // trackTreasury
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(27, governanceProxyLambdas[33])) // untrackTreasury
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(28, governanceProxyLambdas[34])) // transferTreasury
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(29, governanceProxyLambdas[35])) // mintMvkAndTransferTreasury
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(30, governanceProxyLambdas[36])) // updateMvkOperatorsTreasury
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(31, governanceProxyLambdas[37])) // stakeMvkTreasury
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(32, governanceProxyLambdas[38])) // unstakeMvkTreasury
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(33, governanceProxyLambdas[39])) // updateInflationRate
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(34, governanceProxyLambdas[40])) // triggerInflation
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(35, governanceProxyLambdas[41])) // addVestee
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(36, governanceProxyLambdas[42])) // removeVestee
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(37, governanceProxyLambdas[43])) // updateVestee
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(38, governanceProxyLambdas[44])) // toggleVesteeLock

      const setupGovernanceProxyThirdLambdasOperation = await governanceProxyThirdLambdaBatch.send()
      await setupGovernanceProxyThirdLambdasOperation.confirmation()
      console.log("Governance Proxy Proxy Lambdas Setup")


      // Governance Financial Setup Lambdas
      const governanceFinancialLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaSetAdmin"                              , governanceFinancialLambdas[0]))  // setAdmin
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaSetGovernance"                         , governanceFinancialLambdas[1]))  // setGovernance
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaUpdateMetadata"                        , governanceFinancialLambdas[2]))  // updateMetadata
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaUpdateConfig"                          , governanceFinancialLambdas[3]))  // updateConfig
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaUpdateGeneralContracts"                , governanceFinancialLambdas[4]))  // updateGeneralContracts
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaUpdateWhitelistTokenContracts"         , governanceFinancialLambdas[5]))  // updateWhitelistTokenContracts
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaRequestTokens"                         , governanceFinancialLambdas[6]))  // requestTokens
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaRequestMint"                           , governanceFinancialLambdas[7]))  // requestMint
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaSetContractBaker"                      , governanceFinancialLambdas[8]))  // setContractBaker
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaDropFinancialRequest"                  , governanceFinancialLambdas[9]))  // dropFinancialRequest
      .withContractCall(governanceFinancial.contract.methods.setLambda("lambdaVoteForRequest"                        , governanceFinancialLambdas[10])) // voteForRequest
      const setupGovernanceFinancialLambdasOperation = await governanceFinancialLambdaBatch.send()
      await setupGovernanceFinancialLambdasOperation.confirmation()
      console.log("Governance Financial Lambdas Setup")

      // Governance Satellite Setup Lambdas
      const governanceSatelliteLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaSetAdmin"                              , governanceSatelliteLambdas[0]))  // setAdmin
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaSetGovernance"                         , governanceSatelliteLambdas[1]))  // setGovernance
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaUpdateMetadata"                        , governanceSatelliteLambdas[2]))  // updateMetadata
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaUpdateConfig"                          , governanceSatelliteLambdas[3]))  // updateConfig
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaUpdateWhitelistContracts"              , governanceSatelliteLambdas[4]))  // updateWhitelistContracts
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaUpdateGeneralContracts"                , governanceSatelliteLambdas[5]))  // updateGeneralContracts
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaSuspendSatellite"                      , governanceSatelliteLambdas[6]))  // suspendSatellite
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaUnsuspendSatellite"                    , governanceSatelliteLambdas[7]))  // unsuspendSatellite
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaBanSatellite"                          , governanceSatelliteLambdas[8]))  // banSatellite
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaUnbanSatellite"                        , governanceSatelliteLambdas[9]))  // unbanSatellite
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaRemoveAllSatelliteOracles"             , governanceSatelliteLambdas[10])) // removeAllSatelliteOracles
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaAddOracleToAggregator"                 , governanceSatelliteLambdas[11])) // removeAddOracleToAggregator
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaRemoveOracleInAggregator"              , governanceSatelliteLambdas[12])) // removeRemoveOracleInAggregator
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaRegisterAggregator"                    , governanceSatelliteLambdas[13])) // registerAggregator
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaUpdateAggregatorStatus"                , governanceSatelliteLambdas[14])) // updateAggregatorStatus
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaDropAction"                            , governanceSatelliteLambdas[15])) // dropAction
      .withContractCall(governanceSatellite.contract.methods.setLambda("lambdaVoteForAction"                         , governanceSatelliteLambdas[16])) // voteForAction
      const setupGovernanceSatelliteLambdasOperation = await governanceSatelliteLambdaBatch.send()
      await setupGovernanceSatelliteLambdasOperation.confirmation()
      console.log("Governance Satellite Lambdas Setup")

      // Governance Setup Lambdas
      const governanceLambdaFirstBatch = await tezos.wallet
      .batch()
      .withContractCall(governance.contract.methods.setLambda("lambdaBreakGlass"                      , governanceLambdas[0]))  // breakGlass
      .withContractCall(governance.contract.methods.setLambda("lambdaPropagateBreakGlass"             , governanceLambdas[1]))  // propagateBreakGlass
      .withContractCall(governance.contract.methods.setLambda("lambdaSetAdmin"                        , governanceLambdas[2]))  // setAdmin
      .withContractCall(governance.contract.methods.setLambda("lambdaSetGovernanceProxy"              , governanceLambdas[3]))  // setGovernanceProxy
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateMetadata"                  , governanceLambdas[4]))  // updateMetadata
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateConfig"                    , governanceLambdas[5]))  // updateConfig
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateGeneralContracts"          , governanceLambdas[6]))  // updateGeneralContracts
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateWhitelistDevelopers"       , governanceLambdas[7]))  // updateWhitelistDevelopers
      .withContractCall(governance.contract.methods.setLambda("lambdaSetContractAdmin"                , governanceLambdas[8])) // setContractAdmin
      .withContractCall(governance.contract.methods.setLambda("lambdaSetContractGovernance"           , governanceLambdas[9])) // setContractGovernance
      .withContractCall(governance.contract.methods.setLambda("lambdaStartNextRound"                  , governanceLambdas[10])) // startNextRound
      .withContractCall(governance.contract.methods.setLambda("lambdaPropose"                         , governanceLambdas[11])) // propose
      const setupGovernanceFirstLambdasOperation = await governanceLambdaFirstBatch.send()
      await setupGovernanceFirstLambdasOperation.confirmation()

      const governanceLambdaSecondBatch = await tezos.wallet
      .batch()
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateProposalData"           , governanceLambdas[12])) // updateProposalData
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdatePaymentData"            , governanceLambdas[13])) // updatePaymentData
      .withContractCall(governance.contract.methods.setLambda("lambdaLockProposal"                    , governanceLambdas[14])) // lockProposal
      .withContractCall(governance.contract.methods.setLambda("lambdaProposalRoundVote"               , governanceLambdas[15])) // proposalRoundVote
      .withContractCall(governance.contract.methods.setLambda("lambdaVotingRoundVote"                 , governanceLambdas[16])) // votingRoundVote
      .withContractCall(governance.contract.methods.setLambda("lambdaExecuteProposal"                 , governanceLambdas[17])) // executeProposal
      .withContractCall(governance.contract.methods.setLambda("lambdaProcessProposalPayment"          , governanceLambdas[18])) // processProposalPayment
      .withContractCall(governance.contract.methods.setLambda("lambdaProcessProposalSingleData"       , governanceLambdas[19])) // processProposalSingleData
      .withContractCall(governance.contract.methods.setLambda("lambdaDropProposal"                    , governanceLambdas[20])) // dropProposal
      const setupGovernanceSecondLambdasOperation = await governanceLambdaSecondBatch.send()
      await setupGovernanceSecondLambdasOperation.confirmation()
      console.log("Governance Lambdas Setup")


      // Doorman Setup Lambdas
      const doormanLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(doorman.contract.methods.setLambda("lambdaSetAdmin"                     , doormanLambdas[0]))  // setAdmin
      .withContractCall(doorman.contract.methods.setLambda("lambdaSetGovernance"                , doormanLambdas[1]))  // setGovernance
      .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateMetadata"               , doormanLambdas[2]))  // updateMetadata
      .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateMinMvkAmount"           , doormanLambdas[3]))  // updateMinMvkAmount
      .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateWhitelistContracts"     , doormanLambdas[4]))  // updateWhitelistContracts
      .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateGeneralContracts"       , doormanLambdas[5]))  // updateGeneralContracts
      .withContractCall(doorman.contract.methods.setLambda("lambdaMigrateFunds"                 , doormanLambdas[6]))  // migrateFunds
      .withContractCall(doorman.contract.methods.setLambda("lambdaPauseAll"                     , doormanLambdas[7]))  // pauseAll
      .withContractCall(doorman.contract.methods.setLambda("lambdaUnpauseAll"                   , doormanLambdas[8]))  // unpauseAll
      .withContractCall(doorman.contract.methods.setLambda("lambdaTogglePauseStake"             , doormanLambdas[9]))  // togglePauseStake
      .withContractCall(doorman.contract.methods.setLambda("lambdaTogglePauseUnstake"           , doormanLambdas[10])) // togglePauseUnstake
      .withContractCall(doorman.contract.methods.setLambda("lambdaTogglePauseCompound"          , doormanLambdas[11])) // togglePauseCompound
      .withContractCall(doorman.contract.methods.setLambda("lambdaTogglePauseFarmClaim"         , doormanLambdas[12])) // togglePauseFarmClaim
      .withContractCall(doorman.contract.methods.setLambda("lambdaStake"                        , doormanLambdas[13])) // stake
      .withContractCall(doorman.contract.methods.setLambda("lambdaUnstake"                      , doormanLambdas[14])) // unstake
      .withContractCall(doorman.contract.methods.setLambda("lambdaCompound"                     , doormanLambdas[15])) // compound
      .withContractCall(doorman.contract.methods.setLambda("lambdaFarmClaim"                    , doormanLambdas[16])) // farmClaim
    
      const setupDoormanLambdasOperation = await doormanLambdaBatch.send()
      await setupDoormanLambdasOperation.confirmation()
      console.log("Doorman Lambdas Setup")

      // Delegation Setup Lambdas
      const delegationLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(delegation.contract.methods.setLambda("lambdaSetAdmin"                           , delegationLambdas[0]))  // setAdmin
      .withContractCall(delegation.contract.methods.setLambda("lambdaSetGovernance"                      , delegationLambdas[1]))  // setGovernance
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateMetadata"                     , delegationLambdas[2]))  // updateMetadata
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateConfig"                       , delegationLambdas[3]))  // updateConfig
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateWhitelistContracts"           , delegationLambdas[4]))  // updateWhitelistContracts
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateGeneralContracts"             , delegationLambdas[5]))  // updateGeneralContracts
      .withContractCall(delegation.contract.methods.setLambda("lambdaPauseAll"                           , delegationLambdas[6]))  // pauseAll
      .withContractCall(delegation.contract.methods.setLambda("lambdaUnpauseAll"                         , delegationLambdas[7]))  // unpauseAll
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseDelegateToSatellite"     , delegationLambdas[8]))  // togglePauseDelegateToSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseUndelegateSatellite"     , delegationLambdas[9]))  // togglePauseUndelegateSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseRegisterSatellite"       , delegationLambdas[10])) // togglePauseRegisterSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseUnregisterSatellite"     , delegationLambdas[11])) // togglePauseUnregisterSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseUpdateSatellite"         , delegationLambdas[12])) // togglePauseUpdateSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseDistributeReward"        , delegationLambdas[13])) // togglePauseDistributeReward
      .withContractCall(delegation.contract.methods.setLambda("lambdaDelegateToSatellite"                , delegationLambdas[14])) // delegateToSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaUndelegateFromSatellite"            , delegationLambdas[15])) // undelegateFromSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaRegisterAsSatellite"                , delegationLambdas[16])) // registerAsSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaUnregisterAsSatellite"              , delegationLambdas[17])) // unregisterAsSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateSatelliteRecord"              , delegationLambdas[18])) // updateSatelliteRecord
      .withContractCall(delegation.contract.methods.setLambda("lambdaDistributeReward"                   , delegationLambdas[19])) // distributeReward
      .withContractCall(delegation.contract.methods.setLambda("lambdaOnStakeChange"                      , delegationLambdas[20])) // onStakeChange
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateSatelliteStatus"              , delegationLambdas[21])) // updateSatelliteStatus
    
      const setupDelegationLambdasOperation = await delegationLambdaBatch.send()
      await setupDelegationLambdasOperation.confirmation()
      console.log("Delegation Lambdas Setup")
      
      // Break Glass Setup Lambdas
      const breakGlassLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaBreakGlass"                , breakGlassLambdas[0]))   // breakGlass
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaPropagateBreakGlass"       , breakGlassLambdas[1]))  // propagateBreakGlass
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetAdmin"                  , breakGlassLambdas[2]))   // setAdmin
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetGovernance"             , breakGlassLambdas[3]))  // setGovernance
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateMetadata"            , breakGlassLambdas[4]))   // updateMetadata
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateConfig"              , breakGlassLambdas[5]))   // updateConfig
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateWhitelistContracts"  , breakGlassLambdas[6]))   // updateWhitelistContracts
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateGeneralContracts"    , breakGlassLambdas[7]))   // updateGeneralContracts
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateCouncilMemberInfo"   , breakGlassLambdas[8]))   // updateCouncilMemberInfo
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaAddCouncilMember"          , breakGlassLambdas[9]))   // addCouncilMember
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaRemoveCouncilMember"       , breakGlassLambdas[10]))   // removeCouncilMember
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaChangeCouncilMember"       , breakGlassLambdas[11]))   // changeCouncilMember
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaPauseAllEntrypoints"       , breakGlassLambdas[12]))  // pauseAllEntrypoints
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUnpauseAllEntrypoints"     , breakGlassLambdas[13]))  // unpauseAllEntrypoints
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetSingleContractAdmin"    , breakGlassLambdas[14]))  // setSingleContractAdmin
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetAllContractsAdmin"      , breakGlassLambdas[15]))  // setAllContractsAdmin
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaRemoveBreakGlassControl"   , breakGlassLambdas[16]))  // removeBreakGlassControl
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaFlushAction"               , breakGlassLambdas[17]))  // flushAction
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSignAction"                , breakGlassLambdas[18]))  // signAction
    
      const setupBreakGlassLambdasOperation = await breakGlassLambdaBatch.send()
      await setupBreakGlassLambdasOperation.confirmation()
      console.log("Break Glass Lambdas Setup")


      // Emergency Governance Setup Lambdas
      const emergencyGovernanceLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaSetAdmin"                   , emergencyGovernanceLambdas[0]))  // setAdmin
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaSetGovernance"              , emergencyGovernanceLambdas[1]))  // setGovernance
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaUpdateMetadata"             , emergencyGovernanceLambdas[2]))  // updateMetadata
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaUpdateConfig"               , emergencyGovernanceLambdas[3]))  // updateConfig
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaUpdateGeneralContracts"     , emergencyGovernanceLambdas[4]))  // updateGeneralContracts
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaTriggerEmergencyControl"    , emergencyGovernanceLambdas[5]))  // triggerEmergencyControl
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaVoteForEmergencyControl"    , emergencyGovernanceLambdas[6]))  // voteForEmergencyControl
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaDropEmergencyGovernance"    , emergencyGovernanceLambdas[7]))  // dropEmergencyGovernance

      const setupEmergencyGovernanceLambdasOperation = await emergencyGovernanceLambdaBatch.send()
      await setupEmergencyGovernanceLambdasOperation.confirmation()
      console.log("Emergency Governance Lambdas Setup")
      
      // Council Setup Lambdas
      const councilLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(council.contract.methods.setLambda("lambdaSetAdmin"                               , councilLambdas[0]))  // setAdmin
      .withContractCall(council.contract.methods.setLambda("lambdaSetGovernance"                          , councilLambdas[1]))  // setGovernance
      .withContractCall(council.contract.methods.setLambda("lambdaUpdateMetadata"                         , councilLambdas[2]))  // updateMetadata
      .withContractCall(council.contract.methods.setLambda("lambdaUpdateConfig"                           , councilLambdas[3]))  // updateConfig
      .withContractCall(council.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , councilLambdas[4]))  // updateWhitelistContracts
      .withContractCall(council.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , councilLambdas[5]))  // updateGeneralContracts
      .withContractCall(council.contract.methods.setLambda("lambdaUpdateCouncilMemberInfo"                , councilLambdas[6]))  // updateCouncilMemberInfo
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionAddMember"                 , councilLambdas[7]))  // councilActionAddMember
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRemoveMember"              , councilLambdas[8]))  // councilActionRemoveMember
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionChangeMember"              , councilLambdas[9]))  // councilActionChangeMember
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionSetBaker"                  , councilLambdas[10]))  // councilActionSetBaker
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionUpdateBlocksPerMinute"     , councilLambdas[11]))  // councilActionUpdateBlocksPerMinute
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionAddVestee"                 , councilLambdas[12])) // councilActionAddVestee
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRemoveVestee"              , councilLambdas[13])) // councilActionRemoveVestee
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionUpdateVestee"              , councilLambdas[14])) // councilActionUpdateVestee
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionToggleVesteeLock"          , councilLambdas[15])) // councilActionToggleVesteeLock
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionTransfer"                  , councilLambdas[16])) // councilActionTransfer
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRequestTokens"             , councilLambdas[17])) // councilActionRequestTokens
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRequestMint"               , councilLambdas[18])) // councilActionRequestMint
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionSetContractBaker"          , councilLambdas[19])) // councilActionSetContractBaker
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionDropFinancialRequest"      , councilLambdas[20])) // councilActionDropFinancialRequest
      .withContractCall(council.contract.methods.setLambda("lambdaFlushAction"                            , councilLambdas[21])) // flushAction
      .withContractCall(council.contract.methods.setLambda("lambdaSignAction"                             , councilLambdas[22])) // signAction
  
      const setupCouncilLambdasOperation = await councilLambdaBatch.send()
      await setupCouncilLambdasOperation.confirmation()
      console.log("Council Lambdas Setup")
  
      // Farm FA12 Setup Lambdas
      const farmFa12LambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(farm.contract.methods.setLambda("lambdaSetAdmin"                               , farmLambdas[0]))  // setAdmin
      .withContractCall(farm.contract.methods.setLambda("lambdaSetGovernance"                          , farmLambdas[1]))  // setGovernance
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateMetadata"                         , farmLambdas[2]))  // updateMetadata
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateConfig"                           , farmLambdas[3]))  // updateConfig
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , farmLambdas[4]))  // updateWhitelistContracts
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , farmLambdas[5]))  // updateGeneralContracts
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateBlocksPerMinute"                  , farmLambdas[6]))  // updateBlocksPerMinute
      .withContractCall(farm.contract.methods.setLambda("lambdaInitFarm"                               , farmLambdas[7]))  // initFarm
      .withContractCall(farm.contract.methods.setLambda("lambdaCloseFarm"                              , farmLambdas[8]))  // closeFarm
      .withContractCall(farm.contract.methods.setLambda("lambdaPauseAll"                               , farmLambdas[9]))  // pauseAll
      .withContractCall(farm.contract.methods.setLambda("lambdaUnpauseAll"                             , farmLambdas[10]))  // unpauseAll
      .withContractCall(farm.contract.methods.setLambda("lambdaTogglePauseDeposit"                     , farmLambdas[11])) // togglePauseDeposit
      .withContractCall(farm.contract.methods.setLambda("lambdaTogglePauseWithdraw"                    , farmLambdas[12])) // togglePauseWithdraw
      .withContractCall(farm.contract.methods.setLambda("lambdaTogglePauseClaim"                       , farmLambdas[13])) // togglePauseClaim
      .withContractCall(farm.contract.methods.setLambda("lambdaDeposit"                                , farmLambdas[14])) // deposit
      .withContractCall(farm.contract.methods.setLambda("lambdaWithdraw"                               , farmLambdas[15])) // withdraw
      .withContractCall(farm.contract.methods.setLambda("lambdaClaim"                                  , farmLambdas[16])) // claim
      
      const setupFarmFa12LambdasOperation = await farmFa12LambdaBatch.send()
      await setupFarmFa12LambdasOperation.confirmation()
      console.log("Farm FA12 Lambdas Setup")

      // Farm FA2 Setup Lambdas
      const farmFa2LambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaSetAdmin"                               , farmLambdas[0]))  // setAdmin
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaSetGovernance"                          , farmLambdas[1]))  // setGovernance
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateMetadata"                         , farmLambdas[2]))  // updateMetadata
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateConfig"                           , farmLambdas[3]))  // updateConfig
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , farmLambdas[4]))  // updateWhitelistContracts
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , farmLambdas[5]))  // updateGeneralContracts
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateBlocksPerMinute"                  , farmLambdas[6]))  // updateBlocksPerMinute
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaInitFarm"                               , farmLambdas[7]))  // initFarm
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaCloseFarm"                              , farmLambdas[8]))  // closeFarm
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaPauseAll"                               , farmLambdas[9]))  // pauseAll
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUnpauseAll"                             , farmLambdas[10]))  // unpauseAll
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaTogglePauseDeposit"                     , farmLambdas[11])) // togglePauseDeposit
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaTogglePauseWithdraw"                    , farmLambdas[12])) // togglePauseWithdraw
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaTogglePauseClaim"                       , farmLambdas[13])) // togglePauseClaim
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaDeposit"                                , farmLambdas[14])) // deposit
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaWithdraw"                               , farmLambdas[15])) // withdraw
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaClaim"                                  , farmLambdas[16])) // claim
      
      const setupFarmFa2LambdasOperation = await farmFa2LambdaBatch.send()
      await setupFarmFa2LambdasOperation.confirmation()
      console.log("Farm FA2 Lambdas Setup")


      // Farm Factory Setup Lambdas
      const farmFactoryLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaSetAdmin"                           , farmFactoryLambdas[0]))  // setAdmin
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaSetGovernance"                      , farmFactoryLambdas[1]))  // setGovernance
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUpdateMetadata"                     , farmFactoryLambdas[2]))  // updateMetadata
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUpdateWhitelistContracts"           , farmFactoryLambdas[3]))  // updateWhitelistContracts
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUpdateGeneralContracts"             , farmFactoryLambdas[4]))  // updateGeneralContracts
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUpdateBlocksPerMinute"              , farmFactoryLambdas[5]))  // updateBlocksPerMinute
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaPauseAll"                           , farmFactoryLambdas[6]))  // pauseAll
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUnpauseAll"                         , farmFactoryLambdas[7]))  // unpauseAll
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaTogglePauseCreateFarm"              , farmFactoryLambdas[8]))  // togglePauseCreateFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaTogglePauseTrackFarm"               , farmFactoryLambdas[9]))  // togglePauseTrackFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaTogglePauseUntrackFarm"             , farmFactoryLambdas[10]))  // togglePauseUntrackFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaCreateFarm"                         , farmFactoryLambdas[11])) // createFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaTrackFarm"                          , farmFactoryLambdas[12])) // trackFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUntrackFarm"                        , farmFactoryLambdas[13])) // untrackFarm

      const setupFarmFactoryLambdasOperation = await farmFactoryLambdaBatch.send()
      await setupFarmFactoryLambdasOperation.confirmation()
      console.log("Farm Factory Lambdas Setup")

      // Farm Factory Setup Product Lambdas
      const farmFactoryProductLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaSetAdmin"                    , farmLambdas[0]))  // setAdmin
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaSetGovernance"               , farmLambdas[1]))  // setGovernance
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaUpdateMetadata"              , farmLambdas[2]))  // updateMetadata
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaUpdateConfig"                , farmLambdas[3]))  // updateConfig
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaUpdateWhitelistContracts"    , farmLambdas[4]))  // updateWhitelistContracts
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaUpdateGeneralContracts"      , farmLambdas[5]))  // updateGeneralContracts
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaUpdateBlocksPerMinute"       , farmLambdas[6]))  // updateBlocksPerMinute
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaInitFarm"                    , farmLambdas[7]))  // initFarm
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaCloseFarm"                   , farmLambdas[8]))  // closeFarm
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaPauseAll"                    , farmLambdas[9]))  // pauseAll
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaUnpauseAll"                  , farmLambdas[10]))  // unpauseAll
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaTogglePauseDeposit"          , farmLambdas[11])) // togglePauseDeposit
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaTogglePauseWithdraw"         , farmLambdas[12])) // togglePauseWithdraw
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaTogglePauseClaim"            , farmLambdas[13])) // togglePauseClaim
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaDeposit"                     , farmLambdas[14])) // deposit
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaWithdraw"                    , farmLambdas[15])) // withdraw
      .withContractCall(farmFactory.contract.methods.setProductLambda("lambdaClaim"                       , farmLambdas[16])) // claim

      const setupFarmFactoryProductLambdasOperation = await farmFactoryProductLambdaBatch.send()
      await setupFarmFactoryProductLambdasOperation.confirmation()
      console.log("Farm Factory Product Lambdas Setup")


  
      // Vesting Setup Lambdas
      const vestingLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(vesting.contract.methods.setLambda("lambdaSetAdmin"                               , vestingLambdas[0]))  // setAdmin
      .withContractCall(vesting.contract.methods.setLambda("lambdaSetGovernance"                          , vestingLambdas[1]))  // setGovernance
      .withContractCall(vesting.contract.methods.setLambda("lambdaUpdateMetadata"                         , vestingLambdas[2]))  // updateMetadata
      .withContractCall(vesting.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , vestingLambdas[3]))  // updateWhitelistContracts
      .withContractCall(vesting.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , vestingLambdas[4]))  // updateGeneralContracts
      .withContractCall(vesting.contract.methods.setLambda("lambdaAddVestee"                              , vestingLambdas[5]))  // addVestee
      .withContractCall(vesting.contract.methods.setLambda("lambdaRemoveVestee"                           , vestingLambdas[6]))  // removeVestee
      .withContractCall(vesting.contract.methods.setLambda("lambdaUpdateVestee"                           , vestingLambdas[7]))  // updateVestee
      .withContractCall(vesting.contract.methods.setLambda("lambdaToggleVesteeLock"                       , vestingLambdas[8]))  // toggleVesteeLock
      .withContractCall(vesting.contract.methods.setLambda("lambdaClaim"                                  , vestingLambdas[9]))  // claim
      
      const setupVestingLambdasOperation = await vestingLambdaBatch.send()
      await setupVestingLambdasOperation.confirmation()
      console.log("Vesting Lambdas Setup")


      // Treasury Setup Lambdas
      const treasuryLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(treasury.contract.methods.setLambda("lambdaSetAdmin"                               , treasuryLambdas[0]))  // setAdmin
      .withContractCall(treasury.contract.methods.setLambda("lambdaSetGovernance"                          , treasuryLambdas[1]))  // setGovernance
      .withContractCall(treasury.contract.methods.setLambda("lambdaSetBaker"                               , treasuryLambdas[2]))  // setBaker
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateMetadata"                         , treasuryLambdas[3]))  // updateMetadata
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , treasuryLambdas[4]))  // updateWhitelistContracts
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , treasuryLambdas[5]))  // updateGeneralContracts
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateWhitelistTokenContracts"          , treasuryLambdas[6]))  // updateWhitelistTokenContracts
      .withContractCall(treasury.contract.methods.setLambda("lambdaPauseAll"                               , treasuryLambdas[7]))  // pauseAll
      .withContractCall(treasury.contract.methods.setLambda("lambdaUnpauseAll"                             , treasuryLambdas[8]))  // unpauseAll
      .withContractCall(treasury.contract.methods.setLambda("lambdaTogglePauseTransfer"                    , treasuryLambdas[9]))  // togglePauseTransfer
      .withContractCall(treasury.contract.methods.setLambda("lambdaTogglePauseMintMvkAndTransfer"          , treasuryLambdas[10]))  // togglePauseMintMvkAndTransfer
      .withContractCall(treasury.contract.methods.setLambda("lambdaTogglePauseStake"                       , treasuryLambdas[11]))  // togglePauseStake
      .withContractCall(treasury.contract.methods.setLambda("lambdaTogglePauseUnstake"                     , treasuryLambdas[12]))  // togglePauseUnstake
      .withContractCall(treasury.contract.methods.setLambda("lambdaTransfer"                               , treasuryLambdas[13]))  // transfer
      .withContractCall(treasury.contract.methods.setLambda("lambdaMintMvkAndTransfer"                     , treasuryLambdas[14]))  // mintMvkAndTransfer
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateMvkOperators"                     , treasuryLambdas[15]))  // updateMvkOperators
      .withContractCall(treasury.contract.methods.setLambda("lambdaStakeMvk"                               , treasuryLambdas[16]))  // stakeMvk
      .withContractCall(treasury.contract.methods.setLambda("lambdaUnstakeMvk"                             , treasuryLambdas[17]))  // unstakeMvk

      
      const setupTreasuryLambdasOperation = await treasuryLambdaBatch.send()
      await setupTreasuryLambdasOperation.confirmation()
      console.log("Treasury Lambdas Setup")

      // Treasury Factory Setup Lambdas
      const treasuryFactoryLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaSetAdmin"                           , treasuryFactoryLambdas[0]))  // setAdmin
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaSetGovernance"                      , treasuryFactoryLambdas[1]))  // setGovernance
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUpdateMetadata"                     , treasuryFactoryLambdas[2]))  // updateMetadata
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUpdateWhitelistContracts"           , treasuryFactoryLambdas[3]))  // updateWhitelistContracts
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUpdateGeneralContracts"             , treasuryFactoryLambdas[4]))  // updateGeneralContracts
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUpdateWhitelistTokenContracts"      , treasuryFactoryLambdas[5]))  // updateWhitelistTokenContracts
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaPauseAll"                           , treasuryFactoryLambdas[6]))  // pauseAll
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUnpauseAll"                         , treasuryFactoryLambdas[7]))  // unpauseAll
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaTogglePauseCreateTreasury"          , treasuryFactoryLambdas[8]))  // togglePauseCreateTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaTogglePauseTrackTreasury"           , treasuryFactoryLambdas[9]))  // togglePauseTrackTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaTogglePauseUntrackTreasury"         , treasuryFactoryLambdas[10]))  // togglePauseUntrackTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaCreateTreasury"                     , treasuryFactoryLambdas[11])) // createTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaTrackTreasury"                      , treasuryFactoryLambdas[12])) // trackTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUntrackTreasury"                    , treasuryFactoryLambdas[13])) // untrackTreasury

      const setupTreasuryFactoryLambdasOperation = await treasuryFactoryLambdaBatch.send()
      await setupTreasuryFactoryLambdasOperation.confirmation()
      console.log("Treasury Factory Lambdas Setup")

      // Treasury Factory Product Setup Lambdas
      const treasuryFactoryProductLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaSetAdmin"                     , treasuryLambdas[0]))  // setAdmin
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaSetGovernance"                , treasuryLambdas[1]))  // setGovernance
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaSetBaker"                     , treasuryLambdas[2]))  // setBaker
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaUpdateMetadata"               , treasuryLambdas[3]))  // updateMetadata
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaUpdateWhitelistContracts"     , treasuryLambdas[4]))  // updateWhitelistContracts
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaUpdateGeneralContracts"       , treasuryLambdas[5]))  // updateGeneralContracts
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaUpdateWhitelistTokenContracts", treasuryLambdas[6]))  // updateWhitelistTokenContracts
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaPauseAll"                     , treasuryLambdas[7]))  // pauseAll
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaUnpauseAll"                   , treasuryLambdas[8]))  // unpauseAll
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaTogglePauseTransfer"          , treasuryLambdas[9]))  // togglePauseTransfer
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaTogglePauseMintMvkAndTransfer", treasuryLambdas[10]))  // togglePauseMintMvkAndTransfer
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaTogglePauseStake"             , treasuryLambdas[11]))  // togglePauseStake
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaTogglePauseUnstake"           , treasuryLambdas[12]))  // togglePauseUnstake
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaTransfer"                     , treasuryLambdas[13]))  // transfer
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaMintMvkAndTransfer"           , treasuryLambdas[14]))  // mintMvkAndTransfer
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaUpdateMvkOperators"           , treasuryLambdas[15]))  // updateMvkOperators
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaStakeMvk"                     , treasuryLambdas[16]))  // stakeMvk
      .withContractCall(treasuryFactory.contract.methods.setProductLambda("lambdaUnstakeMvk"                   , treasuryLambdas[17]))  // unstakeMvk

      const setupTreasuryFactoryProductLambdasOperation = await treasuryFactoryProductLambdaBatch.send()
      await setupTreasuryFactoryProductLambdasOperation.confirmation()
      console.log("Treasury Factory Product Lambdas Setup")

      // Aggregator Setup Lambdas
      const aggregatorLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(aggregator.contract.methods.setLambda("lambdaSetAdmin"                           , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaSetAdmin')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaSetGovernance"                      , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaSetGovernance')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaUpdateMetadata"                     , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaUpdateMetadata')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaUpdateConfig"                       , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaUpdateConfig')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaUpdateWhitelistContracts"           , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaUpdateWhitelistContracts')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaUpdateGeneralContracts"             , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaUpdateGeneralContracts')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaAddOracle"                          , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaAddOracle')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaRemoveOracle"                       , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaRemoveOracle')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaPauseAll"                           , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaPauseAll')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaUnpauseAll"                         , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaUnpauseAll')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaTogglePauseReqRateUpd"              , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaTogglePauseReqRateUpd')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaTogglePauseReqRateUpdDev"           , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaTogglePauseReqRateUpdDev')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaTogglePauseSetObsCommit"            , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaTogglePauseSetObsCommit')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaTogglePauseSetObsReveal"            , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaTogglePauseSetObsReveal')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaTogglePauseRewardXtz"               , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaTogglePauseRewardXtz')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaTogglePauseRewardSMvk"              , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaTogglePauseRewardSMvk')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaRequestRateUpdate"                  , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaRequestRateUpdate')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaRequestRateUpdateDeviation"         , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaRequestRateUpdateDeviation')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaSetObservationCommit"               , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaSetObservationCommit')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaSetObservationReveal"               , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaSetObservationReveal')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaWithdrawRewardXtz"                  , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaWithdrawRewardXtz')]))
      .withContractCall(aggregator.contract.methods.setLambda("lambdaWithdrawRewardStakedMvk"            , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaWithdrawRewardStakedMvk')]))

      const setupAggregatorLambdasOperation = await aggregatorLambdaBatch.send()
      await setupAggregatorLambdasOperation.confirmation()
      console.log("Aggregator Lambdas Setup")


      // Aggregator Factory Setup Lambdas
      const aggregatorFactoryLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaSetAdmin"                           , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaSetAdmin')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaSetGovernance"                      , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaSetGovernance')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaUpdateMetadata"                     , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaUpdateMetadata')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaUpdateWhitelistContracts"           , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaUpdateWhitelistContracts')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaUpdateGeneralContracts"             , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaUpdateGeneralContracts')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaPauseAll"                           , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaPauseAll')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaUnpauseAll"                         , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaUnpauseAll')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaTogglePauseCreateAgg"               , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaTogglePauseCreateAgg')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaTogglePauseTrackAgg"                , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaTogglePauseTrackAgg')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaTogglePauseUntrackAgg"              , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaTogglePauseUntrackAgg')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaTogglePauseDisRewardXtz"            , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaTogglePauseDisRewardXtz')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaTogglePauseDisRewardSMvk"           , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaTogglePauseDisRewardSMvk')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaCreateAggregator"                   , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaCreateAggregator')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaTrackAggregator"                    , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaTrackAggregator')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaUntrackAggregator"                  , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaUntrackAggregator')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaDistributeRewardXtz"                , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaDistributeRewardXtz')]))
      .withContractCall(aggregatorFactory.contract.methods.setLambda("lambdaDistributeRewardStakedMvk"          , aggregatorFactoryLambdas[aggregatorFactoryLambdaIndexOf('lambdaDistributeRewardStakedMvk')]))

      const setupAggregatorFactoryLambdasOperation = await aggregatorFactoryLambdaBatch.send()
      await setupAggregatorFactoryLambdasOperation.confirmation()
      console.log("AggregatorFactory Lambdas Setup")
      
      const aggregatorFactoryProductLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaSetAdmin"                    , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaSetAdmin')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaUpdateMetadata"              , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaUpdateMetadata')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaUpdateConfig"                , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaUpdateConfig')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaAddOracle"                   , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaAddOracle')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaRemoveOracle"                , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaRemoveOracle')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaRequestRateUpdate"           , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaRequestRateUpdate')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaRequestRateUpdateDeviation"  , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaRequestRateUpdateDeviation')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaSetObservationCommit"        , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaSetObservationCommit')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaSetObservationReveal"        , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaSetObservationReveal')]))
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaWithdrawRewardXtz"           , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaWithdrawRewardXtz')]))
      // TODO: Look into the mismatch between lambdaWithdrawRewardMvk and lambdaWithdrawRewardStakedMvk
      .withContractCall(aggregatorFactory.contract.methods.setProductLambda("lambdaWithdrawRewardMvk"           , aggregatorLambdas[aggregatorLambdaIndexOf('lambdaWithdrawRewardStakedMvk')]))

      const setupAggregatorFactoryProductLambdasOperation = await aggregatorFactoryProductLambdaBatch.send()
      await setupAggregatorFactoryProductLambdasOperation.confirmation()
      console.log("Aggregator Factory Product Lambdas Setup")
    // Set Lambdas End

    //----------------------------
    // Set remaining contract addresses - post-deployment
    //----------------------------
    // MVK Token Contract - set governance contract address



    const oracleMap = MichelsonMap.fromLiteral({
      [oracle0.pkh]: true,
      [oracle1.pkh]: true,
      [oracle2.pkh]: true,
//      [oracle3.pkh]: true,
//      [oracle4.pkh]: true,
    }) as MichelsonMap<
        string,
        boolean
        >

    const createAggregatorsBatch = await tezos.wallet
        .batch()
        .withContractCall(aggregatorFactory.contract.methods.createAggregator(
            'USD',
            'BTC',
            oracleMap,
            new BigNumber(8),             // decimals
            new BigNumber(2),             // numberBlocksDelay
            oracleMaintainer.pkh,         // maintainer

            new BigNumber(0),             // minimalTezosAmountDeviationTrigger
            new BigNumber(5),             // perthousandDeviationTrigger
            new BigNumber(60),            // percentOracleThreshold

            new BigNumber(2600),          // deviationRewardAmountXtz
            new BigNumber(5),             // rewardAmountMvk
            new BigNumber(1300),          // rewardAmountXtz
            
            aggregatorFactory.contract.address
        ))
        .withContractCall(aggregatorFactory.contract.methods.createAggregator(
            'USD',
            'XTZ',
            oracleMap,
            new BigNumber(8),             // decimals
            new BigNumber(2),             // numberBlocksDelay
            oracleMaintainer.pkh,         // maintainer
            
            new BigNumber(0),             // minimalTezosAmountDeviationTrigger
            new BigNumber(5),             // perthousandDeviationTrigger
            new BigNumber(60),            // percentOracleThreshold

            new BigNumber(2600),          // deviationRewardAmountXtz
            new BigNumber(5),             // rewardAmountMvk
            new BigNumber(1300),          // rewardAmountXtz
            
            aggregatorFactory.contract.address
        ))
        .withContractCall(aggregatorFactory.contract.methods.createAggregator(
            'USD',
            'DOGE',
            oracleMap,
            new BigNumber(16),            // decimals
            new BigNumber(2),             // numberBlocksDelay
            oracleMaintainer.pkh,         // maintainer
            
            new BigNumber(0),             // minimalTezosAmountDeviationTrigger
            new BigNumber(5),             // perthousandDeviationTrigger
            new BigNumber(60),            // percentOracleThreshold
            
            new BigNumber(2600),          // deviationRewardAmountXtz
            new BigNumber(5),             // rewardAmountMvk
            new BigNumber(1300),          // rewardAmountXtz
            
            aggregatorFactory.contract.address
        ))

    const createAggregatorsBatchOperation = await createAggregatorsBatch.send()
    await createAggregatorsBatchOperation.confirmation()

    console.log("Aggregators deployed")

    // MVK Token Contract - set general contract addresses [doorman]
    // MVK Token Contract - set whitelist contract addresses [doorman, vesting, treasury]

    const mvkContractsBatch = await tezos.wallet
      .batch()
      .withContractCall(mvkToken.contract.methods.setGovernance(governance.contract.address))
      .withContractCall(mvkToken.contract.methods.updateGeneralContracts("doorman", doorman.contract.address))
      .withContractCall(mvkToken.contract.methods.updateWhitelistContracts("doorman", doorman.contract.address))
      .withContractCall(mvkToken.contract.methods.updateWhitelistContracts('vesting', vesting.contract.address))
      .withContractCall(mvkToken.contract.methods.updateWhitelistContracts('treasury', treasury.contract.address))
      const mvkContractsBatchOperation = await mvkContractsBatch.send()
      await mvkContractsBatchOperation.confirmation()

    console.log('MVK Token Contract - set general contract addresses [doorman]')
    console.log('MVK Token Contract - set whitelist contract addresses [doorman, vesting, treasury]')
    
    // Send MVK to treasury contract and council (TODO: keep?)
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
    await transferToTreasury.confirmation()
    const updateOperatorsTreasury = await treasury.contract.methods
      .updateMvkOperators([
        {
          add_operator: {
              owner: treasury.contract.address,
              operator: doorman.contract.address,
              token_id: 0,
          },
      }])
      .send()
    await updateOperatorsTreasury.confirmation()

    // Doorman Contract - set general contract addresses [delegation, farmTreasury, satelliteTreasury, farmFactory]
    const doormanContractsBatch = await tezos.wallet
      .batch()
      .withContractCall(doorman.contract.methods.updateGeneralContracts('delegation', delegation.contract.address))
      .withContractCall(doorman.contract.methods.updateGeneralContracts("farmFactory", farmFactory.contract.address))
      .withContractCall(doorman.contract.methods.updateGeneralContracts("satelliteTreasury", treasury.contract.address))
      .withContractCall(doorman.contract.methods.updateGeneralContracts("farmTreasury", treasury.contract.address))
      const doormanContractsBatchOperation = await doormanContractsBatch.send()
      await doormanContractsBatchOperation.confirmation()
    
    console.log('Doorman Contract - set general contract addresses [delegation, farmTreasury, satelliteTreasury, farmFactory]')

    // Farm FA12 Contract - set general contract addresses [doorman]
    // Farm FA12 Contract - set whitelist contract addresses [council] 
    // Farm FA2 Contract - set general contract addresses [doorman]
    // Farm FA2 Contract - set whitelist contract addresses [council]
    const farmContractsBatch = await tezos.wallet
      .batch()
      .withContractCall(farm.contract.methods.updateGeneralContracts('doorman', doorman.contract.address))
      .withContractCall(farm.contract.methods.updateWhitelistContracts('council', council.contract.address))
      .withContractCall(farmFA2.contract.methods.updateGeneralContracts('doorman', doorman.contract.address))
      .withContractCall(farmFA2.contract.methods.updateWhitelistContracts('council', council.contract.address))
      const farmContractsBatchOperation = await farmContractsBatch.send()
      await farmContractsBatchOperation.confirmation()
    
    console.log('Farm FA12 Contract - set general contract addresses [doorman]')
    console.log('Farm FA12 Contract - set whitelist contract addresses [council]')
    
    console.log('Farm FA2 Contract - set general contract addresses [doorman]')
    console.log('Farm FA2 Contract - set whitelist contract addresses [council]')
    


    // Farm Factory Contract - set whitelist contract addresses [council]
    const setCouncilContractAddressInFarmFactoryOperation = await farmFactory.contract.methods.updateWhitelistContracts('council', council.contract.address).send()
    await setCouncilContractAddressInFarmFactoryOperation.confirmation()
    console.log('Farm Factory Contract - set whitelist contract addresses [council]')



    // Council Contract - set geneal contract addresses map [governanceFinancial]
    const setFinancialContractAddressInCouncil = await council.contract.methods.updateGeneralContracts('governanceFinancial', governanceFinancial.contract.address).send()
    await setFinancialContractAddressInCouncil.confirmation()
    console.log('Council Contract - set general contract addresses map [governanceFinancial]')



    // Delegation Contract - set general contract addresses [governance, satelliteTreasury]
    // Delegation Contract - set whitelist contract addresses [treasury, governance]
    const delegationContractsBatch = await tezos.wallet
    .batch()
    .withContractCall(delegation.contract.methods.updateWhitelistContracts('treasury', treasury.contract.address))
    .withContractCall(delegation.contract.methods.updateWhitelistContracts("governance", governance.contract.address))
    .withContractCall(delegation.contract.methods.updateGeneralContracts("satelliteTreasury", treasury.contract.address))
    const delegationContractsBatchOperation = await delegationContractsBatch.send()
    await delegationContractsBatchOperation.confirmation()
    console.log('Delegation Contract - set general contract addresses [satelliteTreasury]')
    console.log('Delegation Contract - set whitelist contract addresses [treasury, governance]')



    // Governance Contract - set contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]
    const governanceContractsBatch = await tezos.wallet
    .batch()
    .withContractCall(governance.contract.methods.updateGeneralContracts('emergencyGovernance', emergencyGovernance.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('doorman', doorman.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('delegation', delegation.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('breakGlass', breakGlass.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('council', council.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('vesting', vesting.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('taxTreasury', treasury.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('paymentTreasury', treasury.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('farmFactory', farmFactory.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('treasuryFactory', treasuryFactory.contract.address))
    .withContractCall(governance.contract.methods.updateGeneralContracts('governanceFinancial', governanceFinancial.contract.address))
    .withContractCall(governance.contract.methods.setGovernanceProxy(governanceProxy.contract.address))
    const governanceContractsBatchOperation = await governanceContractsBatch.send()
    await governanceContractsBatchOperation.confirmation()

    console.log('Governance Contract - set general contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]')
    console.log('Governance Contract - set governance proxy address')



    // Governance Financial Contract - set contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]
    const governanceFinancialContractsBatch = await tezos.wallet
    .batch()
    .withContractCall(governanceFinancial.contract.methods.updateWhitelistTokenContracts("MockFA2", mockFa2Token.contract.address))
    .withContractCall(governanceFinancial.contract.methods.updateWhitelistTokenContracts("MockFA12", mockFa12Token.contract.address))
    .withContractCall(governanceFinancial.contract.methods.updateWhitelistTokenContracts("MVK", mvkToken.contract.address))
    const governanceFinancialContractsBatchOperation = await governanceFinancialContractsBatch.send()
    await governanceFinancialContractsBatchOperation.confirmation()

    console.log('Governance Financial Contract - set whitelist token contract addresss [mockFA12, mockFA2, MVK]')



    // Emergency Governance Contract - set contract addresses map [breakGlass]
    const emergencyGovernanceContractsBatch = await tezos.wallet
    .batch()
    .withContractCall(emergencyGovernance.contract.methods.updateGeneralContracts('breakGlass', breakGlass.contract.address))
    .withContractCall(emergencyGovernance.contract.methods.updateGeneralContracts('taxTreasury', treasury.contract.address))
    const emergencyGovernanceContractsBatchOperation = await emergencyGovernanceContractsBatch.send()
    await emergencyGovernanceContractsBatchOperation.confirmation()

    console.log('Emergency Governance Contract - set general contract addresses map [breakGlass, treasury]')



    // Treasury Contract - set whitelist contract addresses map [council]
    // Treasury Contract - set whitelist token contract addresses map [mockFA12, mockFA2, MVK]
    const treasuryContractsBatch = await tezos.wallet
    .batch()
    .withContractCall(treasury.contract.methods.updateWhitelistContracts('governanceProxy', governanceProxy.contract.address))
    .withContractCall(treasury.contract.methods.updateWhitelistTokenContracts("MockFA2", mockFa2Token.contract.address))
    .withContractCall(treasury.contract.methods.updateWhitelistTokenContracts("MockFA12", mockFa12Token.contract.address))
    .withContractCall(treasury.contract.methods.updateWhitelistTokenContracts("MVK", mvkToken.contract.address))
    const treasuryContractsBatchOperation = await treasuryContractsBatch.send()
    await treasuryContractsBatchOperation.confirmation()
    
    console.log('Treasury Contract - set whitelist contract addresses map [governanceProxy]')
    console.log('Treasury Contract - set whitelist token contract addresses map [mockFA12, mockFA2, MVK]')



    // Vesting Contract - set whitelist contract addresses map [council]
    const setCouncilContractAddressInVesting = await vesting.contract.methods.updateWhitelistContracts('council', council.contract.address).send()
    await setCouncilContractAddressInVesting.confirmation()

    console.log('Vesting Contract - set whitelist contract addresses map [council]')
    

    //----------------------------
    // Save MVK Decimals to JSON (for reuse in JS / PyTezos Tests)
    //----------------------------
    await saveMVKDecimals(mvkTokenDecimals)

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
