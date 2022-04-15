const {
  TezosToolkit,
  ContractAbstraction,
  ContractProvider,
  TezosOperationError,
  WalletParamsWithKind,
  OpKind, 
  Tezos, 
} = require("@taquito/taquito")
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
import { bob, alice, eve, mallory } from '../../scripts/sandbox/accounts'

import governanceLambdas from '../../build/lambdas/governanceLambdas.json'
import doormanLambdas from '../../build/lambdas/doormanLambdas.json'
import breakGlassLambdas from '../../build/lambdas/breakGlassLambdas.json'
import councilLambdas from '../../build/lambdas/councilLambdas.json'

import { Doorman } from '../helpers/doormanHelper'
import { Delegation } from '../helpers/delegationHelper'
import { MvkToken } from '../helpers/mvkHelper'
import { Governance } from '../helpers/governanceHelper'
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

import { doormanStorage } from '../../storage/doormanStorage'
import { delegationStorage } from '../../storage/delegationStorage'
import { mvkStorage, mvkTokenDecimals } from '../../storage/mvkTokenStorage'
import { governanceStorage } from '../../storage/governanceStorage'
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
  var doorman: Doorman
  var mvkToken: MvkToken
  var delegation: Delegation
  var governance: Governance
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
  let deployedDoormanStorage
  let deployedDelegationStorage
  let deployedMvkTokenStorage

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

    doormanStorage.mvkTokenAddress  = mvkToken.contract.address
    doorman = await Doorman.originate(utils.tezos, doormanStorage)

    await saveContractAddress('doormanAddress', doorman.contract.address)
    console.log('Doorman Contract deployed at:', doorman.contract.address)

    delegationStorage.mvkTokenAddress  = mvkToken.contract.address
    delegationStorage.generalContracts = MichelsonMap.fromLiteral({
      doorman: doorman.contract.address,
    })
    delegationStorage.whitelistContracts = MichelsonMap.fromLiteral({
      doorman: doorman.contract.address,
    })
    delegation = await Delegation.originate(utils.tezos, delegationStorage)

    await saveContractAddress('delegationAddress', delegation.contract.address)
    console.log('Delegation Contract deployed at:', delegation.contract.address)

    governanceStorage.mvkTokenAddress  = mvkToken.contract.address
    governanceStorage.generalContracts = MichelsonMap.fromLiteral({
      "delegation" : delegation.contract.address,
      "doorman"    : doorman.contract.address
    });
    governance = await Governance.originate(utils.tezos,governanceStorage);

    await saveContractAddress('governanceAddress', governance.contract.address)
    console.log('Governance Contract deployed at:', governance.contract.address)

    emergencyGovernanceStorage.mvkTokenAddress  = mvkToken.contract.address
    emergencyGovernanceStorage.generalContracts = MichelsonMap.fromLiteral({
      governance: governance.contract.address,
      doorman: doorman.contract.address
    })
    emergencyGovernance = await EmergencyGovernance.originate(utils.tezos, emergencyGovernanceStorage)

    await saveContractAddress('emergencyGovernanceAddress', emergencyGovernance.contract.address)
    console.log('Emergency Governance Contract deployed at:', emergencyGovernance.contract.address)

    vestingStorage.mvkTokenAddress  = mvkToken.contract.address
    vestingStorage.generalContracts = MichelsonMap.fromLiteral({
      "mvkToken"   : mvkToken.contract.address,
      "doorman"    : doorman.contract.address,
      "delegation" : delegation.contract.address,
      "governance" : governance.contract.address,
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

    treasuryStorage.mvkTokenAddress  = mvkToken.contract.address
    treasuryStorage.generalContracts = MichelsonMap.fromLiteral({
      "delegation"   : delegation.contract.address,
    });
    treasuryStorage.whitelistContracts = MichelsonMap.fromLiteral({
      governance: governance.contract.address,
      doorman: doorman.contract.address
    })
    treasuryStorage.whitelistTokenContracts = MichelsonMap.fromLiteral({
      mvk       : mvkToken.contract.address,
    })
    treasury = await Treasury.originate(utils.tezos, treasuryStorage)

    await saveContractAddress('treasuryAddress', treasury.contract.address)
    console.log('Treasury Contract deployed at:', treasury.contract.address)


    treasuryFactoryStorage.mvkTokenAddress  = mvkToken.contract.address
    treasuryFactoryStorage.generalContracts = MichelsonMap.fromLiteral({
      "delegation"   : delegation.contract.address,
    });
    treasuryFactoryStorage.whitelistContracts = MichelsonMap.fromLiteral({
      governance: governance.contract.address,
    })
    treasuryFactoryStorage.whitelistTokenContracts = MichelsonMap.fromLiteral({
      mvk       : mvkToken.contract.address,
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

    /* ---- ---- ---- ---- ---- */

    tezos = doorman.tezos
    console.log('====== break ======')

    //----------------------------
    // Set remaining contract addresses - post-deployment
    //----------------------------

    // MVK Token Contract - set general contract addresses [doorman]
    // MVK Token Contract - set whitelist contract addresses [doorman, vesting, treasury]
    const mvkUpdateGeneralContractsOperation = await mvkToken.contract.methods.updateGeneralContracts("doorman", doorman.contract.address).send();
    await mvkUpdateGeneralContractsOperation.confirmation();
    
    console.log('MVK Token Contract - set general contract addresses [doorman]')

    const mvkUpdateWhitelistContractsOperation = await mvkToken.contract.methods.updateWhitelistContracts("doorman", doorman.contract.address).send();
    await mvkUpdateWhitelistContractsOperation.confirmation();
    
    const setWhitelistVestingContractInMvkTokenOperation = await mvkToken.contract.methods.updateWhitelistContracts('vesting', vesting.contract.address).send()
    await setWhitelistVestingContractInMvkTokenOperation.confirmation()
    
    const setWhitelistTreasuryContractInMvkTokenOperation = await mvkToken.contract.methods.updateWhitelistContracts('treasury', treasury.contract.address).send()
    await setWhitelistTreasuryContractInMvkTokenOperation.confirmation()

    console.log('MVK Token Contract - set whitelist contract addresses [doorman, vesting, treasury]')
    
    // Doorman Contract - set whitelist contract address [farmTreasury]
    const updateGeneralContractsOperation = await doorman.contract.methods.updateGeneralContracts("farmTreasury", treasury.contract.address).send();
    await updateGeneralContractsOperation.confirmation();
    
    // Send MVK to treasury contract and council (TODO: keep?)
    const transferToTreasury = await mvkToken.contract.methods
      .transfer([
        {
          from_: bob.pkh,
          txs: [
            {
              to_: treasury.contract.address,
              token_id: 0,
              amount: MVK(200),
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

    // Doorman Contract - set general contract addresses [delegation, mvkToken, farmFactory]
    const setDelegationContractAddressInDoormanOperation = await doorman.contract.methods.updateGeneralContracts('delegation', delegation.contract.address).send()
    await setDelegationContractAddressInDoormanOperation.confirmation()

    const setMvkTokenAddressInDoormanOperation = await doorman.contract.methods.updateGeneralContracts('mvkToken', mvkToken.contract.address).send()
    await setMvkTokenAddressInDoormanOperation.confirmation()
    
    const setFarmFactoryAddressInDoormanOperation = await doorman.contract.methods.updateGeneralContracts("farmFactory", farmFactory.contract.address).send();
    await setFarmFactoryAddressInDoormanOperation.confirmation();
    
    console.log('Doorman Contract - set general contract addresses [delegation, mvkToken, farmFactory]')



    // Farm FA12 Contract - set general contract addresses [doorman]
    // Farm FA12 Contract - set whitelist contract addresses [council] 
    const setDoormanContractAddressInFarmOperation = await farm.contract.methods.updateGeneralContracts('doorman', doorman.contract.address).send()
    await setDoormanContractAddressInFarmOperation.confirmation()
        
    const setCouncilContractAddressInFarmFA12Operation = await farm.contract.methods.updateWhitelistContracts('council', council.contract.address).send()
    await setCouncilContractAddressInFarmFA12Operation.confirmation()
    
    console.log('Farm Contract - set general contract addresses [doorman]')
    console.log('Farm Contract - set whitelist contract addresses [council]')



    // Farm FA2 Contract - set general contract addresses [doorman]
    // Farm FA2 Contract - set whitelist contract addresses [council]
    const setDoormanContractAddressInFarmFA2Operation = await farmFA2.contract.methods.updateGeneralContracts('doorman', doorman.contract.address).send()
    await setDoormanContractAddressInFarmFA2Operation.confirmation()
    
    const setCouncilContractAddressInFarmFA2Operation = await farmFA2.contract.methods.updateWhitelistContracts('council', council.contract.address).send()
    await setCouncilContractAddressInFarmFA2Operation.confirmation()
    
    console.log('Farm FA2 Contract - set general contract addresses [doorman]')
    console.log('Farm FA2 Contract - set whitelist contract addresses [council]')
    


    // Farm Factory Contract - set whitelist contract addresses [council]
    const setCouncilContractAddressInFarmFactoryOperation = await farmFactory.contract.methods.updateWhitelistContracts('council', council.contract.address).send()
    await setCouncilContractAddressInFarmFactoryOperation.confirmation()
    console.log('Farm Factory Contract - set whitelist contract addresses [council]')



    // Delegation Contract - set general contract addresses [governance]
    // Delegation Contract - set whitelist contract addresses [treasury]
    const setGovernanceContractAddressInDelegationOperation = await delegation.contract.methods.updateGeneralContracts('governance', governance.contract.address).send()
    await setGovernanceContractAddressInDelegationOperation.confirmation()

    const setWhitelistTreasuryContractAddressInDelegationOperation = await delegation.contract.methods.updateWhitelistContracts('treasury', treasury.contract.address).send()  
    await setWhitelistTreasuryContractAddressInDelegationOperation.confirmation()
    
    console.log('Delegation Contract - set general contract addresses [governance]')
    console.log('Delegation Contract - set whitelist contract addresses [treasury]')



    // Governance Contract - set contract addresses [emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]
    const setEmergencyGovernanceContractInGovernanceOperation = await governance.contract.methods.updateGeneralContracts('emergencyGovernance', emergencyGovernance.contract.address).send()
    await setEmergencyGovernanceContractInGovernanceOperation.confirmation()
    
    const setBreakGlassContractInGovernanceOperation = await governance.contract.methods.updateGeneralContracts('breakGlass', breakGlass.contract.address).send()
    await setBreakGlassContractInGovernanceOperation.confirmation()
    
    const setCouncilContractInGovernanceOperation = await governance.contract.methods.updateGeneralContracts('council', council.contract.address).send()
    await setCouncilContractInGovernanceOperation.confirmation()
    
    const setVestingContractInGovernanceOperation = await governance.contract.methods.updateGeneralContracts('vesting', vesting.contract.address).send()
    await setVestingContractInGovernanceOperation.confirmation()

    const setTreasuryContractInGovernanceOperation = await governance.contract.methods.updateGeneralContracts('treasury', treasury.contract.address).send()
    await setTreasuryContractInGovernanceOperation.confirmation()

    const setFarmFactoryContractInGovernanceOperation = await governance.contract.methods.updateGeneralContracts('farmFactory', farmFactory.contract.address).send()
    await setFarmFactoryContractInGovernanceOperation.confirmation()

    const setTreasuryFactoryContractInGovernanceOperation = await governance.contract.methods.updateGeneralContracts('treasuryFactory', treasuryFactory.contract.address).send()
    await setTreasuryFactoryContractInGovernanceOperation.confirmation()

    console.log('Governance Contract - set general contract addresses [emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]')



    // Emergency Governance Contract - set contract addresses map [breakGlass]
    const setBreakGlassContractAddressInEmergencyGovernance = await emergencyGovernance.contract.methods.updateGeneralContracts('breakGlass', breakGlass.contract.address).send()
    await setBreakGlassContractAddressInEmergencyGovernance.confirmation()

    const setTreasuryContractAddressInEmergencyGovernance = await emergencyGovernance.contract.methods.updateGeneralContracts('treasury', treasury.contract.address).send()
    await setTreasuryContractAddressInEmergencyGovernance.confirmation()

    console.log('Emergency Governance Contract - set general contract addresses map [breakGlass, treasury]')



    // Vesting Contract - set whitelist contract addresses map [council]
    const setCouncilContractAddressInVesting = await vesting.contract.methods.updateWhitelistContracts('council', council.contract.address).send()
    await setCouncilContractAddressInVesting.confirmation()

    console.log('Vesting Contract - set whitelist contract addresses map [council]')


    // Governance Setup Lambdas
    const governanceLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governance.contract.methods.setupLambdaFunction(0, governanceLambdas[0])) // callGovernanceLambda
      .withContractCall(governance.contract.methods.setupLambdaFunction(1, governanceLambdas[1])) // updateLambdaFunction
      .withContractCall(governance.contract.methods.setupLambdaFunction(2, governanceLambdas[2])) // updateGovernanceConfig
      .withContractCall(governance.contract.methods.setupLambdaFunction(3, governanceLambdas[3])) // updateDelegationConfig

    const setupGovernanceLambdasOperation = await governanceLambdaBatch.send()
    await setupGovernanceLambdasOperation.confirmation()
    console.log("Governance Lambdas Setup")

    // Doorman Setup Lambdas
    const doormanLambdaBatch = await tezos.wallet
    .batch()
    .withContractCall(doorman.contract.methods.setLambda("lambdaSetAdmin"           , doormanLambdas[0])) // setAdmin
    .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateMinMvkAmount" , doormanLambdas[1])) // updateMinMvkAmount
    .withContractCall(doorman.contract.methods.setLambda("lambdaPauseAll"           , doormanLambdas[2])) // pauseAll
    .withContractCall(doorman.contract.methods.setLambda("lambdaUnpauseAll"         , doormanLambdas[3])) // unpauseAll
    .withContractCall(doorman.contract.methods.setLambda("lambdaTogglePauseUnstake" , doormanLambdas[4])) // togglePauseUnstake
    .withContractCall(doorman.contract.methods.setLambda("lambdaStake"              , doormanLambdas[5])) // stake
    .withContractCall(doorman.contract.methods.setLambda("lambdaUnstake"            , doormanLambdas[6])) // unstake
    .withContractCall(doorman.contract.methods.setLambda("lambdaCompound"           , doormanLambdas[7])) // compound
    .withContractCall(doorman.contract.methods.setLambda("lambdaFarmClaim"          , doormanLambdas[8])) // farmClaim
  
    const setupDoormanLambdasOperation = await doormanLambdaBatch.send()
    await setupDoormanLambdasOperation.confirmation()
    console.log("Doorman Lambdas Setup")
    
    // Break Glass Setup Lambdas
    const breakGlassLambdaBatch = await tezos.wallet
    .batch()
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaBreakGlass"                , breakGlassLambdas[0]))  // breakGlass
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetAdmin"                  , breakGlassLambdas[1]))  // setAdmin
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateConfig"              , breakGlassLambdas[2]))  // updateConfig
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaAddCouncilMember"          , breakGlassLambdas[3]))  // addCouncilMember
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaRemoveCouncilMember"       , breakGlassLambdas[4]))  // removeCouncilMember
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaChangeCouncilMember"       , breakGlassLambdas[5]))  // changeCouncilMember
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaPauseAllEntrypoints"       , breakGlassLambdas[6]))  // pauseAllEntrypoints
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaUnpauseAllEntrypoints"     , breakGlassLambdas[7]))  // unpauseAllEntrypoints
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetSingleContractAdmin"    , breakGlassLambdas[8]))  // setSingleContractAdmin
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetAllContractsAdmin"      , breakGlassLambdas[9]))  // setAllContractsAdmin
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaRemoveBreakGlassControl"   , breakGlassLambdas[10])) // removeBreakGlassControl
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaFlushAction"               , breakGlassLambdas[11])) // flushAction
    .withContractCall(breakGlass.contract.methods.setLambda("lambdaSignAction"                , breakGlassLambdas[12])) // signAction
  
    const setupBreakGlassLambdasOperation = await breakGlassLambdaBatch.send()
    await setupBreakGlassLambdasOperation.confirmation()
    console.log("Break Glass Lambdas Setup")
    
    // Council Setup Lambdas
    const councilLambdaBatch = await tezos.wallet
    .batch()
    .withContractCall(council.contract.methods.setLambda("lambdaSetAdmin"                               , councilLambdas[0]))  // setAdmin
    .withContractCall(council.contract.methods.setLambda("lambdaUpdateMetadata"                         , councilLambdas[1]))  // updateMetadata
    .withContractCall(council.contract.methods.setLambda("lambdaUpdateConfig"                           , councilLambdas[2]))  // updateConfig
    .withContractCall(council.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , councilLambdas[3]))  // updateWhitelistContracts
    .withContractCall(council.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , councilLambdas[4]))  // updateGeneralContracts
    .withContractCall(council.contract.methods.setLambda("lambdaUpdateCouncilMemberInfo"                , councilLambdas[5]))  // updateCouncilMemberInfo
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionAddMember"                 , councilLambdas[6]))  // councilActionAddMember
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRemoveMember"              , councilLambdas[7]))  // councilActionRemoveMember
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionChangeMember"              , councilLambdas[8]))  // councilActionChangeMember
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionUpdateBlocksPerMinute"     , councilLambdas[9]))  // councilActionUpdateBlocksPerMinute
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionAddVestee"                 , councilLambdas[10])) // councilActionAddVestee
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRemoveVestee"              , councilLambdas[11])) // councilActionRemoveVestee
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionUpdateVestee"              , councilLambdas[12])) // councilActionUpdateVestee
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionToggleVesteeLock"          , councilLambdas[13])) // councilActionToggleVesteeLock
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionTransfer"                  , councilLambdas[14])) // councilActionTransfer
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRequestTokens"             , councilLambdas[15])) // councilActionRequestTokens
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRequestMint"               , councilLambdas[16])) // councilActionRequestMint
    .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionDropFinancialRequest"      , councilLambdas[17])) // councilActionDropFinancialRequest
    .withContractCall(council.contract.methods.setLambda("lambdaFlushAction"                            , councilLambdas[18])) // flushAction
    .withContractCall(council.contract.methods.setLambda("lambdaSignAction"                             , councilLambdas[19])) // signAction

  
    const setupCouncilLambdasOperation = await councilLambdaBatch.send()
    await setupCouncilLambdasOperation.confirmation()
    console.log("Council Lambdas Setup")
    

    //----------------------------
    // Save MVK Decimals to JSON (for reuse in JS / PyTezos Tests)
    //----------------------------
    await saveMVKDecimals(mvkTokenDecimals)

  })

  it(`test all contract deployments`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --') // break
      console.log('Test: All contracts deployed')
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
})
