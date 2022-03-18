const {
  TezosToolkit,
  ContractAbstraction,
  ContractProvider,
  TezosOperationError,
  WalletParamsWithKind,
  OpKind,
  Tezos,
} = require('@taquito/taquito')
const { InMemorySigner, importKey } = require('@taquito/signer')
import assert, { ok, rejects, strictEqual } from 'assert'
import { Utils, zeroAddress } from '../helpers/Utils'
import fs from 'fs'
import { confirmOperation } from '../../scripts/confirmation'
const saveContractAddress = require('../../helpers/saveContractAddress')
const saveMVKDecimals = require('../../helpers/saveMVKDecimals')
import { MichelsonMap } from '@taquito/michelson-encoder'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import env from '../../env'
import { alice, bob, eve, mallory } from '../../scripts/sandbox/accounts'

import governanceLambdas from '../../build/lambdas/governanceLambdas.json'

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

import { doormanStorage } from '../../storage/doormanStorage'
import { delegationStorage } from '../../storage/delegationStorage'
import { mvkStorage, mvkTokenDecimals } from '../../storage/mvkTokenStorage'
import { governanceStorage } from '../../storage/governanceStorage'
import { breakGlassStorage } from '../../storage/breakGlassStorage'
import { emergencyGovernanceStorage } from '../../storage/emergencyGovernanceStorage'
import { vestingStorage } from '../../storage/vestingStorage'
import { councilStorage } from '../../storage/councilStorage'
import { treasuryStorage } from '../../storage/treasuryStorage'
import { farmStorage } from "../../storage/farmStorage";
import { farmFactoryStorage } from "../../storage/farmFactoryStorage";
import { lpStorage } from "../../storage/testLPTokenStorage";

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
  var farm: Farm;
  var farmFA2: Farm;
  var farmFactory: FarmFactory;
  var lpToken: LPToken;
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
    await utils.init(alice.sk)

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
    delegation = await Delegation.originate(utils.tezos, delegationStorage)

    await saveContractAddress('delegationAddress', delegation.contract.address)
    console.log('Delegation Contract deployed at:', delegation.contract.address)

    governanceStorage.mvkTokenAddress  = mvkToken.contract.address
    governanceStorage.generalContracts = MichelsonMap.fromLiteral({
      delegation: delegation.contract.address,
      mvkToken: mvkToken.contract.address,
    })
    governance = await Governance.originate(utils.tezos, governanceStorage)

    await saveContractAddress('governanceAddress', governance.contract.address)
    console.log('Governance Contract deployed at:', governance.contract.address)

    emergencyGovernanceStorage.mvkTokenAddress  = mvkToken.contract.address
    emergencyGovernanceStorage.generalContracts = MichelsonMap.fromLiteral({
      mvkToken: mvkToken.contract.address,
      governance: governance.contract.address,
    })
    emergencyGovernance = await EmergencyGovernance.originate(utils.tezos, emergencyGovernanceStorage)

    await saveContractAddress('emergencyGovernanceAddress', emergencyGovernance.contract.address)
    console.log('Emergency Governance Contract deployed at:', emergencyGovernance.contract.address)

    vestingStorage.mvkTokenAddress  = mvkToken.contract.address
    vestingStorage.generalContracts = MichelsonMap.fromLiteral({
      mvkToken: mvkToken.contract.address,
      doorman: doorman.contract.address,
      delegation: delegation.contract.address,
      governance: governance.contract.address,
    })
    vesting = await Vesting.originate(utils.tezos, vestingStorage)

    await saveContractAddress('vestingAddress', vesting.contract.address)
    console.log('Vesting Contract deployed at:', vesting.contract.address)

    councilStorage.mvkTokenAddress  = mvkToken.contract.address
    councilStorage.generalContracts = MichelsonMap.fromLiteral({
      vesting: vesting.contract.address,
      governance: governance.contract.address,
    })
    councilStorage.councilMembers = [alice.pkh, bob.pkh, eve.pkh]
    council = await Council.originate(utils.tezos, councilStorage)

    await saveContractAddress('councilAddress', council.contract.address)
    console.log('Council Contract deployed at:', council.contract.address)

    breakGlassStorage.mvkTokenAddress  = mvkToken.contract.address
    breakGlassStorage.generalContracts = MichelsonMap.fromLiteral({
      mvkToken: mvkToken.contract.address,
      doorman: doorman.contract.address,
      delegation: delegation.contract.address,
      governance: governance.contract.address,
      vesting: vesting.contract.address,
      council: council.contract.address,
      emergencyGovernance: emergencyGovernance.contract.address,
    })
    breakGlass = await BreakGlass.originate(utils.tezos, breakGlassStorage)

    await saveContractAddress('breakGlassAddress', breakGlass.contract.address)
    console.log('BreakGlass Contract deployed at:', breakGlass.contract.address)

    treasuryStorage.mvkTokenAddress  = mvkToken.contract.address
    treasuryStorage.generalContracts = MichelsonMap.fromLiteral({
      mvkToken: mvkToken.contract.address,
      delegation: delegation.contract.address,
    })
    treasuryStorage.whitelistContracts = MichelsonMap.fromLiteral({
      governance: governance.contract.address,
    })
    treasury = await Treasury.originate(utils.tezos, treasuryStorage)

    await saveContractAddress('treasury', treasury.contract.address)
    console.log('Treasury Contract deployed at:', treasury.contract.address)

    lpToken = await LPToken.originate(
      utils.tezos,
      lpStorage
    );

    await saveContractAddress("lpTokenAddress", lpToken.contract.address)
    console.log("LP Token Contract deployed at:", lpToken.contract.address);

    farmStorage.mvkTokenAddress  = mvkToken.contract.address
    farmStorage.lpToken.tokenAddress = lpToken.contract.address;
      
    farm = await Farm.originate(
      utils.tezos,
      farmStorage
    );

    await saveContractAddress("farmAddress", farm.contract.address)
    console.log("FA12 Farm Contract deployed at:", farm.contract.address);

    farmStorage.lpToken.tokenAddress = mvkToken.contract.address;
    farmStorage.lpToken.tokenStandard = {
      fa2: ""
    };
    
    farmFA2 = await Farm.originate(
      utils.tezos,
      farmStorage
    );

    await saveContractAddress("farmFA2Address", farmFA2.contract.address)
    console.log("FA2 Farm Contract deployed at:", farmFA2.contract.address);

    farmStorage.lpToken.tokenAddress = lpToken.contract.address;
    farmStorage.infinite = true
    farmStorage.lpToken.tokenStandard = {
      fa12: ""
    };
    
    farmFactoryStorage.mvkTokenAddress  = mvkToken.contract.address;
    farmFactoryStorage.generalContracts = MichelsonMap.fromLiteral({
      "doorman"  : doorman.contract.address,
    });
    farmFactoryStorage.whitelistContracts = MichelsonMap.fromLiteral({
      "council"  : council.contract.address,
    });
    farmFactory = await FarmFactory.originate(
      utils.tezos,
      farmFactoryStorage
    );

    await saveContractAddress("farmFactoryAddress", farmFactory.contract.address)
    console.log("Farm Factory Contract deployed at:", farmFactory.contract.address);

    mockFa12Token = await MockFa12Token.originate(
      utils.tezos,
      mockFa12TokenStorage
    );

    await saveContractAddress("mockFa12TokenAddress", mockFa12Token.contract.address)
    console.log("Mock FA12 Token Contract deployed at:", mockFa12Token.contract.address);

    mockFa2Token = await MockFa2Token.originate(
      utils.tezos,
      mockFa2TokenStorage
    );

    await saveContractAddress("mockFa2TokenAddress", mockFa2Token.contract.address)
    console.log("Mock Fa2 Token Contract deployed at:", mockFa2Token.contract.address);

    /* ---- ---- ---- ---- ---- */

    tezos = doorman.tezos
    console.log('====== break ======')

    //----------------------------
    // Set remaining contract addresses - post-deployment
    //----------------------------

    // MVK Token Contract - set general & whitelist addresses
    const mvkUpdateGeneralContractsOperation = await mvkToken.contract.methods
    .updateGeneralContracts("doorman", doorman.contract.address)
    .send();
    await mvkUpdateGeneralContractsOperation.confirmation();
    const mvkUpdateWhitelistContractsOperation = await mvkToken.contract.methods
    .updateWhitelistContracts("doorman", doorman.contract.address)
    .send();
    await mvkUpdateWhitelistContractsOperation.confirmation();

    // Doorman Contract - set treasury address
    const updateGeneralContractsOperation = await doorman.contract.methods
    .updateGeneralContracts("farmTreasury", eve.pkh)
    .send();
    await updateGeneralContractsOperation.confirmation();
    // Give operator access to treasury for MVK Token Contract
    await signerFactory(eve.sk); //TODO: Treasury should be able to update their operators directly from their contracts
    const updateOperatorsOperation = await mvkToken.contract.methods.update_operators([
        {
            add_operator: {
                owner: eve.pkh,
                operator: doorman.contract.address,
                token_id: 0
            }
        }
    ]).send()
    await updateOperatorsOperation.confirmation();
    await signerFactory(alice.sk);

    // Doorman Contract - set contract addresses [delegation, mvkToken]
    const setDelegationContractAddressInDoormanOperation = await doorman.contract.methods
      .updateGeneralContracts('delegation', delegation.contract.address)
      .send()
    await setDelegationContractAddressInDoormanOperation.confirmation()
    const setMvkTokenAddressInDoormanOperation = await doorman.contract.methods
      .updateGeneralContracts('mvkToken', mvkToken.contract.address)
      .send()
    await setMvkTokenAddressInDoormanOperation.confirmation()
    const setFarmFactoryAddressInDoormanOperation = await doorman.contract.methods
      .updateGeneralContracts("farmFactory", farmFactory.contract.address)
      .send();
    await setFarmFactoryAddressInDoormanOperation.confirmation();
    console.log('doorman contract address set')

    // Farm Contract - set contract addresses [doorman]
    const setDoormanContractAddressInFarmOperation = await farm.contract.methods
      .updateGeneralContracts('doorman', doorman.contract.address)
      .send()
    await setDoormanContractAddressInFarmOperation.confirmation()
    const setCouncilContractAddressInFarmFA12Operation = await farm.contract.methods
      .updateWhitelistContracts('council', council.contract.address)
      .send()
    await setCouncilContractAddressInFarmFA12Operation.confirmation()
    console.log('farm contract address set')

    // Farm Contract - set contract addresses [doorman]
    const setDoormanContractAddressInFarmFA2Operation = await farmFA2.contract.methods
      .updateGeneralContracts('doorman', doorman.contract.address)
      .send()
    await setDoormanContractAddressInFarmFA2Operation.confirmation()
    const setCouncilContractAddressInFarmFA2Operation = await farmFA2.contract.methods
      .updateWhitelistContracts('council', council.contract.address)
      .send()
    await setCouncilContractAddressInFarmFA2Operation.confirmation()
    console.log('farm fa2 contract address set')

    // Delegation Contract - set contract addresses [governance]
    const setGovernanceContractAddressInDelegationOperation = await delegation.contract.methods
      .updateGeneralContracts('governance', governance.contract.address)
      .send()
    await setGovernanceContractAddressInDelegationOperation.confirmation()
    console.log('delegation contract address set')

    // MVK Token Contract - set whitelist contract addresses [vesting, treasury]
    const setWhitelistVestingContractInMvkTokenOperation = await mvkToken.contract.methods
      .updateWhitelistContracts('vesting', vesting.contract.address)
      .send()
    await setWhitelistVestingContractInMvkTokenOperation.confirmation()
    
    const setWhitelistTreasuryContractInMvkTokenOperation = await mvkToken.contract.methods
      .updateWhitelistContracts('treasury', treasury.contract.address)
      .send()
    await setWhitelistTreasuryContractInMvkTokenOperation.confirmation()
    console.log('vesting contract address put in whitelist')

    // Governance Contract - set contract addresses [emergencyGovernance, breakGlass]
    const setEmergencyGovernanceContractInGovernanceOperation = await governance.contract.methods
      .updateGeneralContracts('emergencyGovernance', emergencyGovernance.contract.address)
      .send()
    await setEmergencyGovernanceContractInGovernanceOperation.confirmation()
    
    const setBreakGlassContractInGovernanceOperation = await governance.contract.methods
      .updateGeneralContracts('breakGlass', breakGlass.contract.address)
      .send()
    await setBreakGlassContractInGovernanceOperation.confirmation()
    console.log('governance contract address set')

    // Emergency Governance Contract - set contract addresses map [breakGlass]
    const setBreakGlassContractAddressInEmergencyGovernance = await emergencyGovernance.contract.methods
      .updateGeneralContracts('breakGlass', breakGlass.contract.address)
      .send()
    await setBreakGlassContractAddressInEmergencyGovernance.confirmation()

    const setTreasuryContractAddressInEmergencyGovernance = await emergencyGovernance.contract.methods
      .updateGeneralContracts('treasury', treasury.contract.address)
      .send()
    await setTreasuryContractAddressInEmergencyGovernance.confirmation()


    // Vesting Contract - set whitelist contract addresses map [council]
    const setCouncilContractAddressInVesting = await vesting.contract.methods
      .updateWhitelistContracts('council', council.contract.address)
      .send()
    await setCouncilContractAddressInVesting.confirmation()
    console.log('vesting contract address put in whitelist')

    // Governance Setup Lambdas
    const governanceLambdaBatch = await tezos.wallet
      .batch()
      .withContractCall(governance.contract.methods.setupLambdaFunction(0, governanceLambdas[0])) // callGovernanceLambda
      .withContractCall(governance.contract.methods.setupLambdaFunction(1, governanceLambdas[1])) // updateLambdaFunction
      .withContractCall(governance.contract.methods.setupLambdaFunction(2, governanceLambdas[2])) // updateGovernanceConfig
      .withContractCall(governance.contract.methods.setupLambdaFunction(3, governanceLambdas[3])) // updateDelegationConfig

    const setupGovernanceLambdasOperation = await governanceLambdaBatch.send()
    await setupGovernanceLambdasOperation.confirmation()
    
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
