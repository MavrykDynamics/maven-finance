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

import governanceProxyLambdas from '../../build/lambdas/governanceProxyLambdas.json'
import governanceLambdas from '../../build/lambdas/governanceLambdas.json'
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

import { Doorman } from '../helpers/doormanHelper'
import { Delegation } from '../helpers/delegationHelper'
import { MvkToken } from '../helpers/mvkHelper'
import { Governance } from '../helpers/governanceHelper'
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

import { doormanStorage } from '../../storage/doormanStorage'
import { delegationStorage } from '../../storage/delegationStorage'
import { mvkStorage, mvkTokenDecimals } from '../../storage/mvkTokenStorage'
import { governanceStorage } from '../../storage/governanceStorage'
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
  var doorman: Doorman
  var mvkToken: MvkToken
  var delegation: Delegation
  var governance: Governance
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


    governanceProxyStorage.governanceAddress = governance.contract.address;
    governanceProxyStorage.mvkTokenAddress = mvkToken.contract.address;
    governanceProxy = await GovernanceProxy.originate(utils.tezos, governanceProxyStorage);

    await saveContractAddress('governanceProxyAddress', governanceProxy.contract.address)
    console.log('Governance Proxy Contract deployed at:', governanceProxy.contract.address)



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

    // Set Lambdas 

    await signerFactory(bob.sk);
      
    // Governance Setup Proxy Lambdas (external contracts)
      const governanceProxyLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(0, governanceProxyLambdas[0])) // executeGovernanceLambdaProxy
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(1, governanceProxyLambdas[1])) // updateProxyLambda
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(2, governanceProxyLambdas[2])) // setContractAdmin
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(3, governanceProxyLambdas[3])) // updateContractMetadata
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(4, governanceProxyLambdas[4])) // updateContractWhitelistMap
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(5, governanceProxyLambdas[5])) // updateContractGeneralMap
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(6, governanceProxyLambdas[6])) // updateContractWhitelistTokenMap
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(7, governanceProxyLambdas[7])) // updateGovernanceConfig
      .withContractCall(governanceProxy.contract.methods.setProxyLambda(8, governanceProxyLambdas[8])) // updateDelegationConfig
  
      const setupGovernanceProxyLambdasOperation = await governanceProxyLambdaBatch.send()
      await setupGovernanceProxyLambdasOperation.confirmation()
      console.log("Governance Proxy Lambdas Setup")
  

      // Governance Setup Lambdas
      console.log("governance contract address: "+governance.contract.address);
      const governanceLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governance.contract.methods.setLambda("lambdaBreakGlass"                      , governanceLambdas[0]))  // breakGlass
      .withContractCall(governance.contract.methods.setLambda("lambdaSetAdmin"                        , governanceLambdas[1]))  // setAdmin
      .withContractCall(governance.contract.methods.setLambda("lambdaSetGovernanceProxyAddress"       , governanceLambdas[2]))  // setGovernanceProxyAddress
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateMetadata"                  , governanceLambdas[3]))  // updateMetadata
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateConfig"                    , governanceLambdas[4]))  // updateConfig
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateWhitelistContracts"        , governanceLambdas[5]))  // updateWhitelistContracts
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateGeneralContracts"          , governanceLambdas[6]))  // updateGeneralContracts
      .withContractCall(governance.contract.methods.setLambda("lambdaUpdateWhitelistTokenContracts"   , governanceLambdas[7]))  // updateWhitelistTokenContracts
      .withContractCall(governance.contract.methods.setLambda("lambdaStartNextRound"                  , governanceLambdas[8]))  // startNextRound
      .withContractCall(governance.contract.methods.setLambda("lambdaPropose"                         , governanceLambdas[9]))  // propose
      .withContractCall(governance.contract.methods.setLambda("lambdaAddUpdateProposalData"           , governanceLambdas[10]))  // addUpdateProposalData
      .withContractCall(governance.contract.methods.setLambda("lambdaAddUpdatePaymentData"            , governanceLambdas[11])) // addUpdatePaymentData
      .withContractCall(governance.contract.methods.setLambda("lambdaLockProposal"                    , governanceLambdas[12])) // lockProposal
      .withContractCall(governance.contract.methods.setLambda("lambdaProposalRoundVote"               , governanceLambdas[13])) // proposalRoundVote
      .withContractCall(governance.contract.methods.setLambda("lambdaVotingRoundVote"                 , governanceLambdas[14])) // votingRoundVote
      .withContractCall(governance.contract.methods.setLambda("lambdaExecuteProposal"                 , governanceLambdas[15])) // executeProposal
      .withContractCall(governance.contract.methods.setLambda("lambdaDropProposal"                    , governanceLambdas[16])) // dropProposal
      .withContractCall(governance.contract.methods.setLambda("lambdaRequestTokens"                   , governanceLambdas[17])) // requestTokens
      .withContractCall(governance.contract.methods.setLambda("lambdaRequestMint"                     , governanceLambdas[18])) // requestMint
      .withContractCall(governance.contract.methods.setLambda("lambdaSetContractBaker"                , governanceLambdas[19])) // setContractBaker
      .withContractCall(governance.contract.methods.setLambda("lambdaDropFinancialRequest"            , governanceLambdas[20])) // dropFinancialRequest
      .withContractCall(governance.contract.methods.setLambda("lambdaVoteForRequest"                  , governanceLambdas[21])) // voteForRequest
    
      const setupGovernanceLambdasOperation = await governanceLambdaBatch.send()
      await setupGovernanceLambdasOperation.confirmation()
      console.log("Governance Lambdas Setup")


      // Doorman Setup Lambdas
      const doormanLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(doorman.contract.methods.setLambda("lambdaSetAdmin"                     , doormanLambdas[0]))  // setAdmin
      .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateMetadata"               , doormanLambdas[1]))  // updateMetadata
      .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateMinMvkAmount"           , doormanLambdas[2]))  // updateMinMvkAmount
      .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateWhitelistContracts"     , doormanLambdas[3]))  // updateWhitelistContracts
      .withContractCall(doorman.contract.methods.setLambda("lambdaUpdateGeneralContracts"       , doormanLambdas[4]))  // updateGeneralContracts
      .withContractCall(doorman.contract.methods.setLambda("lambdaPauseAll"                     , doormanLambdas[5]))  // pauseAll
      .withContractCall(doorman.contract.methods.setLambda("lambdaUnpauseAll"                   , doormanLambdas[6]))  // unpauseAll
      .withContractCall(doorman.contract.methods.setLambda("lambdaTogglePauseUnstake"           , doormanLambdas[7]))  // togglePauseUnstake
      .withContractCall(doorman.contract.methods.setLambda("lambdaStake"                        , doormanLambdas[8]))  // stake
      .withContractCall(doorman.contract.methods.setLambda("lambdaUnstake"                      , doormanLambdas[9]))  // unstake
      .withContractCall(doorman.contract.methods.setLambda("lambdaCompound"                     , doormanLambdas[10])) // compound
      .withContractCall(doorman.contract.methods.setLambda("lambdaFarmClaim"                    , doormanLambdas[11])) // farmClaim
      .withContractCall(doorman.contract.methods.setLambda("lambdaSatelliteRewardsClaim"        , doormanLambdas[12])) // satelliteRewardsClaim
    
      const setupDoormanLambdasOperation = await doormanLambdaBatch.send()
      await setupDoormanLambdasOperation.confirmation()
      console.log("Doorman Lambdas Setup")

      // Delegation Setup Lambdas
      const delegationLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(delegation.contract.methods.setLambda("lambdaSetAdmin"                           , delegationLambdas[0]))  // setAdmin
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateMetadata"                     , delegationLambdas[1]))  // updateMetadata
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateConfig"                       , delegationLambdas[2]))  // updateConfig
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateWhitelistContracts"           , delegationLambdas[3]))  // updateWhitelistContracts
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateGeneralContracts"             , delegationLambdas[4]))  // updateGeneralContracts
      .withContractCall(delegation.contract.methods.setLambda("lambdaPauseAll"                           , delegationLambdas[5]))  // pauseAll
      .withContractCall(delegation.contract.methods.setLambda("lambdaUnpauseAll"                         , delegationLambdas[6]))  // unpauseAll
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseDelegateToSatellite"     , delegationLambdas[7]))  // togglePauseDelegateToSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseUndelegateSatellite"     , delegationLambdas[8]))  // togglePauseUndelegateSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseRegisterSatellite"       , delegationLambdas[9]))  // togglePauseRegisterSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseUnregisterSatellite"     , delegationLambdas[10])) // togglePauseUnregisterSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseUpdateSatellite"         , delegationLambdas[11])) // togglePauseUpdateSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseDistributeReward"        , delegationLambdas[12])) // togglePauseDistributeReward
      .withContractCall(delegation.contract.methods.setLambda("lambdaTogglePauseClaimRewards"            , delegationLambdas[13])) // togglePauseClaimRewards
      .withContractCall(delegation.contract.methods.setLambda("lambdaDelegateToSatellite"                , delegationLambdas[14])) // delegateToSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaUndelegateFromSatellite"            , delegationLambdas[15])) // undelegateFromSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaRegisterAsSatellite"                , delegationLambdas[16])) // registerAsSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaUnregisterAsSatellite"              , delegationLambdas[17])) // unregisterAsSatellite
      .withContractCall(delegation.contract.methods.setLambda("lambdaUpdateSatelliteRecord"              , delegationLambdas[18])) // updateSatelliteRecord
      .withContractCall(delegation.contract.methods.setLambda("lambdaDistributeReward"                   , delegationLambdas[19])) // distributeReward
      .withContractCall(delegation.contract.methods.setLambda("lambdaClaimRewards"                       , delegationLambdas[20])) // claimRewards
      .withContractCall(delegation.contract.methods.setLambda("lambdaOnStakeChange"                      , delegationLambdas[21])) // onStakeChange
    
      const setupDelegationLambdasOperation = await delegationLambdaBatch.send()
      await setupDelegationLambdasOperation.confirmation()
      console.log("Delegation Lambdas Setup")
      
      // Break Glass Setup Lambdas
      const breakGlassLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaBreakGlass"                , breakGlassLambdas[0]))   // breakGlass
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetAdmin"                  , breakGlassLambdas[1]))   // setAdmin
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateMetadata"            , breakGlassLambdas[2]))   // updateMetadata
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateConfig"              , breakGlassLambdas[3]))   // updateConfig
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateWhitelistContracts"  , breakGlassLambdas[4]))   // updateWhitelistContracts
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateGeneralContracts"    , breakGlassLambdas[5]))   // updateGeneralContracts
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUpdateCouncilMemberInfo"   , breakGlassLambdas[6]))   // updateCouncilMemberInfo
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaAddCouncilMember"          , breakGlassLambdas[7]))   // addCouncilMember
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaRemoveCouncilMember"       , breakGlassLambdas[8]))   // removeCouncilMember
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaChangeCouncilMember"       , breakGlassLambdas[9]))   // changeCouncilMember
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaPauseAllEntrypoints"       , breakGlassLambdas[10]))  // pauseAllEntrypoints
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaUnpauseAllEntrypoints"     , breakGlassLambdas[11]))  // unpauseAllEntrypoints
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetSingleContractAdmin"    , breakGlassLambdas[12]))  // setSingleContractAdmin
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSetAllContractsAdmin"      , breakGlassLambdas[13]))  // setAllContractsAdmin
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaRemoveBreakGlassControl"   , breakGlassLambdas[14]))  // removeBreakGlassControl
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaFlushAction"               , breakGlassLambdas[15]))  // flushAction
      .withContractCall(breakGlass.contract.methods.setLambda("lambdaSignAction"                , breakGlassLambdas[16]))  // signAction
    
      const setupBreakGlassLambdasOperation = await breakGlassLambdaBatch.send()
      await setupBreakGlassLambdasOperation.confirmation()
      console.log("Break Glass Lambdas Setup")


      // Emergency Governance Setup Lambdas
      const emergencyGovernanceLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaSetAdmin"                   , emergencyGovernanceLambdas[0]))  // setAdmin
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaUpdateMetadata"             , emergencyGovernanceLambdas[1]))  // updateMetadata
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaUpdateConfig"               , emergencyGovernanceLambdas[2]))  // updateConfig
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaUpdateGeneralContracts"     , emergencyGovernanceLambdas[3]))  // updateGeneralContracts
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaTriggerEmergencyControl"    , emergencyGovernanceLambdas[4]))  // triggerEmergencyControl
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaVoteForEmergencyControl"    , emergencyGovernanceLambdas[5]))  // voteForEmergencyControl
      .withContractCall(emergencyGovernance.contract.methods.setLambda("lambdaDropEmergencyGovernance"    , emergencyGovernanceLambdas[6]))  // dropEmergencyGovernance

      const setupEmergencyGovernanceLambdasOperation = await emergencyGovernanceLambdaBatch.send()
      await setupEmergencyGovernanceLambdasOperation.confirmation()
      console.log("Emergency Governance Lambdas Setup")
      
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
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionSetBaker"                  , councilLambdas[9]))  // councilActionSetBaker
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionUpdateBlocksPerMinute"     , councilLambdas[10]))  // councilActionUpdateBlocksPerMinute
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionAddVestee"                 , councilLambdas[11])) // councilActionAddVestee
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRemoveVestee"              , councilLambdas[12])) // councilActionRemoveVestee
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionUpdateVestee"              , councilLambdas[13])) // councilActionUpdateVestee
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionToggleVesteeLock"          , councilLambdas[14])) // councilActionToggleVesteeLock
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionTransfer"                  , councilLambdas[15])) // councilActionTransfer
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRequestTokens"             , councilLambdas[16])) // councilActionRequestTokens
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionRequestMint"               , councilLambdas[17])) // councilActionRequestMint
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionSetContractBaker"          , councilLambdas[18])) // councilActionSetContractBaker
      .withContractCall(council.contract.methods.setLambda("lambdaCouncilActionDropFinancialRequest"      , councilLambdas[19])) // councilActionDropFinancialRequest
      .withContractCall(council.contract.methods.setLambda("lambdaFlushAction"                            , councilLambdas[20])) // flushAction
      .withContractCall(council.contract.methods.setLambda("lambdaSignAction"                             , councilLambdas[21])) // signAction
  
      const setupCouncilLambdasOperation = await councilLambdaBatch.send()
      await setupCouncilLambdasOperation.confirmation()
      console.log("Council Lambdas Setup")
  
      // Farm FA12 Setup Lambdas
      const farmFa12LambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(farm.contract.methods.setLambda("lambdaSetAdmin"                               , farmLambdas[0]))  // setAdmin
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateMetadata"                         , farmLambdas[1]))  // updateMetadata
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateConfig"                           , farmLambdas[2]))  // updateConfig
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , farmLambdas[3]))  // updateWhitelistContracts
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , farmLambdas[4]))  // updateGeneralContracts
      .withContractCall(farm.contract.methods.setLambda("lambdaUpdateBlocksPerMinute"                  , farmLambdas[5]))  // updateBlocksPerMinute
      .withContractCall(farm.contract.methods.setLambda("lambdaInitFarm"                               , farmLambdas[6]))  // initFarm
      .withContractCall(farm.contract.methods.setLambda("lambdaCloseFarm"                              , farmLambdas[7]))  // closeFarm
      .withContractCall(farm.contract.methods.setLambda("lambdaPauseAll"                               , farmLambdas[8]))  // pauseAll
      .withContractCall(farm.contract.methods.setLambda("lambdaUnpauseAll"                             , farmLambdas[9]))  // unpauseAll
      .withContractCall(farm.contract.methods.setLambda("lambdaTogglePauseDeposit"                     , farmLambdas[10])) // togglePauseDeposit
      .withContractCall(farm.contract.methods.setLambda("lambdaTogglePauseWithdraw"                    , farmLambdas[11])) // togglePauseWithdraw
      .withContractCall(farm.contract.methods.setLambda("lambdaTogglePauseClaim"                       , farmLambdas[12])) // togglePauseClaim
      .withContractCall(farm.contract.methods.setLambda("lambdaDeposit"                                , farmLambdas[13])) // deposit
      .withContractCall(farm.contract.methods.setLambda("lambdaWithdraw"                               , farmLambdas[14])) // withdraw
      .withContractCall(farm.contract.methods.setLambda("lambdaClaim"                                  , farmLambdas[15])) // claim
      
      const setupFarmFa12LambdasOperation = await farmFa12LambdaBatch.send()
      await setupFarmFa12LambdasOperation.confirmation()
      console.log("Farm FA12 Lambdas Setup")

      // Farm FA2 Setup Lambdas
      const farmFa2LambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaSetAdmin"                               , farmLambdas[0]))  // setAdmin
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateMetadata"                         , farmLambdas[1]))  // updateMetadata
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateConfig"                           , farmLambdas[2]))  // updateConfig
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , farmLambdas[3]))  // updateWhitelistContracts
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , farmLambdas[4]))  // updateGeneralContracts
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUpdateBlocksPerMinute"                  , farmLambdas[5]))  // updateBlocksPerMinute
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaInitFarm"                               , farmLambdas[6]))  // initFarm
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaCloseFarm"                              , farmLambdas[7]))  // closeFarm
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaPauseAll"                               , farmLambdas[8]))  // pauseAll
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaUnpauseAll"                             , farmLambdas[9]))  // unpauseAll
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaTogglePauseDeposit"                     , farmLambdas[10])) // togglePauseDeposit
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaTogglePauseWithdraw"                    , farmLambdas[11])) // togglePauseWithdraw
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaTogglePauseClaim"                       , farmLambdas[12])) // togglePauseClaim
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaDeposit"                                , farmLambdas[13])) // deposit
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaWithdraw"                               , farmLambdas[14])) // withdraw
      .withContractCall(farmFA2.contract.methods.setLambda("lambdaClaim"                                  , farmLambdas[15])) // claim
      
      const setupFarmFa2LambdasOperation = await farmFa2LambdaBatch.send()
      await setupFarmFa2LambdasOperation.confirmation()
      console.log("Farm FA12 Lambdas Setup")


      // Farm Factory Setup Lambdas
      const farmFactoryLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaSetAdmin"                           , farmFactoryLambdas[0]))  // setAdmin
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUpdateMetadata"                     , farmFactoryLambdas[1]))  // updateMetadata
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUpdateWhitelistContracts"           , farmFactoryLambdas[2]))  // updateWhitelistContracts
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUpdateGeneralContracts"             , farmFactoryLambdas[3]))  // updateGeneralContracts
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUpdateBlocksPerMinute"              , farmFactoryLambdas[4]))  // updateBlocksPerMinute
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaPauseAll"                           , farmFactoryLambdas[5]))  // pauseAll
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUnpauseAll"                         , farmFactoryLambdas[6]))  // unpauseAll
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaTogglePauseCreateFarm"              , farmFactoryLambdas[7]))  // togglePauseCreateFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaTogglePauseTrackFarm"               , farmFactoryLambdas[8]))  // togglePauseTrackFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaTogglePauseUntrackFarm"             , farmFactoryLambdas[9]))  // togglePauseUntrackFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaCreateFarm"                         , farmFactoryLambdas[10])) // createFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaTrackFarm"                          , farmFactoryLambdas[11])) // trackFarm
      .withContractCall(farmFactory.contract.methods.setLambda("lambdaUntrackFarm"                        , farmFactoryLambdas[12])) // untrackFarm

      const setupFarmFactoryLambdasOperation = await farmFactoryLambdaBatch.send()
      await setupFarmFactoryLambdasOperation.confirmation()
      console.log("Farm Factory Lambdas Setup")


  
      // Vesting Setup Lambdas
      const vestingLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(vesting.contract.methods.setLambda("lambdaSetAdmin"                               , vestingLambdas[0]))  // setAdmin
      .withContractCall(vesting.contract.methods.setLambda("lambdaUpdateMetadata"                         , vestingLambdas[1]))  // updateMetadata
      .withContractCall(vesting.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , vestingLambdas[2]))  // updateWhitelistContracts
      .withContractCall(vesting.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , vestingLambdas[3]))  // updateGeneralContracts
      .withContractCall(vesting.contract.methods.setLambda("lambdaAddVestee"                              , vestingLambdas[4]))  // addVestee
      .withContractCall(vesting.contract.methods.setLambda("lambdaRemoveVestee"                           , vestingLambdas[5]))  // removeVestee
      .withContractCall(vesting.contract.methods.setLambda("lambdaUpdateVestee"                           , vestingLambdas[6]))  // updateVestee
      .withContractCall(vesting.contract.methods.setLambda("lambdaToggleVesteeLock"                       , vestingLambdas[7]))  // toggleVesteeLock
      .withContractCall(vesting.contract.methods.setLambda("lambdaClaim"                                  , vestingLambdas[8]))  // claim
      
      const setupVestingLambdasOperation = await vestingLambdaBatch.send()
      await setupVestingLambdasOperation.confirmation()
      console.log("Vesting Lambdas Setup")


      // Treasury Setup Lambdas
      const treasuryLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(treasury.contract.methods.setLambda("lambdaSetAdmin"                               , treasuryLambdas[0]))  // setAdmin
      .withContractCall(treasury.contract.methods.setLambda("lambdaSetBaker"                               , treasuryLambdas[1]))  // setBaker
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateMetadata"                         , treasuryLambdas[2]))  // updateMetadata
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateWhitelistContracts"               , treasuryLambdas[3]))  // updateWhitelistContracts
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateGeneralContracts"                 , treasuryLambdas[4]))  // updateGeneralContracts
      .withContractCall(treasury.contract.methods.setLambda("lambdaUpdateWhitelistTokenContracts"          , treasuryLambdas[5]))  // updateWhitelistTokenContracts
      .withContractCall(treasury.contract.methods.setLambda("lambdaPauseAll"                               , treasuryLambdas[6]))  // pauseAll
      .withContractCall(treasury.contract.methods.setLambda("lambdaUnpauseAll"                             , treasuryLambdas[7]))  // unpauseAll
      .withContractCall(treasury.contract.methods.setLambda("lambdaTogglePauseTransfer"                    , treasuryLambdas[8]))  // togglePauseTransfer
      .withContractCall(treasury.contract.methods.setLambda("lambdaTogglePauseMintMvkAndTransfer"          , treasuryLambdas[9]))  // togglePauseMintMvkAndTransfer
      .withContractCall(treasury.contract.methods.setLambda("lambdaTransfer"                               , treasuryLambdas[10]))  // transfer
      .withContractCall(treasury.contract.methods.setLambda("lambdaMintMvkAndTransfer"                     , treasuryLambdas[11]))  // mintMvkAndTransfer

      
      const setupTreasuryLambdasOperation = await treasuryLambdaBatch.send()
      await setupTreasuryLambdasOperation.confirmation()
      console.log("Treasury Lambdas Setup")

      // Treasury Factory Setup Lambdas
      const treasuryFactoryLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaSetAdmin"                           , treasuryFactoryLambdas[0]))  // setAdmin
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUpdateMetadata"                     , treasuryFactoryLambdas[1]))  // updateMetadata
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUpdateWhitelistContracts"           , treasuryFactoryLambdas[2]))  // updateWhitelistContracts
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUpdateGeneralContracts"             , treasuryFactoryLambdas[3]))  // updateGeneralContracts
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUpdateWhitelistTokenContracts"      , treasuryFactoryLambdas[4]))  // updateWhitelistTokenContracts
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaPauseAll"                           , treasuryFactoryLambdas[5]))  // pauseAll
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUnpauseAll"                         , treasuryFactoryLambdas[6]))  // unpauseAll
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaTogglePauseCreateTreasury"          , treasuryFactoryLambdas[7]))  // togglePauseCreateTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaTogglePauseTrackTreasury"           , treasuryFactoryLambdas[8]))  // togglePauseTrackTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaTogglePauseUntrackTreasury"         , treasuryFactoryLambdas[9]))  // togglePauseUntrackTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaCreateTreasury"                     , treasuryFactoryLambdas[10])) // createTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaTrackTreasury"                      , treasuryFactoryLambdas[11])) // trackTreasury
      .withContractCall(treasuryFactory.contract.methods.setLambda("lambdaUntrackTreasury"                    , treasuryFactoryLambdas[12])) // untrackTreasury

      const setupTreasuryFactoryLambdasOperation = await treasuryFactoryLambdaBatch.send()
      await setupTreasuryFactoryLambdasOperation.confirmation()
      console.log("Treasury Factory Lambdas Setup")

    // Set Lambdas End

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
    
    var updateGeneralContractsOperation = await doorman.contract.methods.updateGeneralContracts("satelliteTreasury", treasury.contract.address).send();
    await updateGeneralContractsOperation.confirmation();

    // Doorman Contract - set whitelist contract address [farmTreasury, satelliteTreasury]
    var updateGeneralContractsOperation = await doorman.contract.methods.updateGeneralContracts("farmTreasury", treasury.contract.address).send();
    await updateGeneralContractsOperation.confirmation();

    updateGeneralContractsOperation = await doorman.contract.methods.updateGeneralContracts("satelliteTreasury", treasury.contract.address).send();
    await updateGeneralContractsOperation.confirmation();
    
    console.log('Doorman Contract - set general contract addresses [delegation, farmTreasury, satelliteTreasury, farmFactory]')

    // Farm FA12 Contract - set general contract addresses [doorman]
    // Farm FA12 Contract - set whitelist contract addresses [council] 
    const setDoormanContractAddressInFarmOperation = await farm.contract.methods.updateGeneralContracts('doorman', doorman.contract.address).send()
    await setDoormanContractAddressInFarmOperation.confirmation()
        
    const setCouncilContractAddressInFarmFA12Operation = await farm.contract.methods.updateWhitelistContracts('council', council.contract.address).send()
    await setCouncilContractAddressInFarmFA12Operation.confirmation()
    
    console.log('Farm FA12 Contract - set general contract addresses [doorman]')
    console.log('Farm FA12 Contract - set whitelist contract addresses [council]')



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
    // Delegation Contract - set whitelist contract addresses [treasury, governance]
    const setGovernanceContractAddressInDelegationOperation = await delegation.contract.methods.updateGeneralContracts('governance', governance.contract.address).send()
    await setGovernanceContractAddressInDelegationOperation.confirmation()

    const setWhitelistTreasuryContractAddressInDelegationOperation = await delegation.contract.methods.updateWhitelistContracts('treasury', treasury.contract.address).send();
    await setWhitelistTreasuryContractAddressInDelegationOperation.confirmation()
    
    const setWhitelistGovernanceContractAddressInDelegationOperation = await delegation.contract.methods.updateWhitelistContracts('governance', governance.contract.address).send();
    await setWhitelistGovernanceContractAddressInDelegationOperation.confirmation()

    console.log('Delegation Contract - set general contract addresses [governance]')
    console.log('Delegation Contract - set whitelist contract addresses [treasury, governance]')



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

    const setGovernanceProxyContractInGovernanceOperation = await governance.contract.methods.setGovernanceProxyAddress(governanceProxy.contract.address).send()
    await setGovernanceProxyContractInGovernanceOperation.confirmation()

    console.log('Governance Contract - set general contract addresses [emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]')
    console.log('Governance Contract - set governance proxy address')



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
