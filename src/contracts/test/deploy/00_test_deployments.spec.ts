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
import { Utils, zeroAddress } from "../helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require("../../helpers/saveContractAddress")
const saveMVKDecimals = require('../../helpers/saveMVKDecimals')
import { MichelsonMap } from "@taquito/michelson-encoder";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);   
chai.should();

import env from "../../env";
import { alice, bob, eve, mallory } from "../../scripts/sandbox/accounts";

import governanceLambdas from "../../build/lambdas/governanceLambdas.json";

import { Doorman } from "../helpers/doormanHelper";
import { Delegation } from "../helpers/delegationHelper";
import { MvkToken } from "../helpers/mvkHelper";
import { Governance } from "../helpers/governanceHelper";
import { BreakGlass } from "../helpers/breakGlassHelper";
import { EmergencyGovernance } from "../helpers/emergencyGovernanceHelper";
import { Vesting } from "../helpers/vestingHelper";
import { Council } from "../helpers/councilHelper";
import { Treasury } from "../helpers/treasuryHelper";
import { MockFa12Token } from "../helpers/mockFa12TokenHelper";
import { MockFa2Token } from "../helpers/mockFa2TokenHelper";
import { UsdmToken } from "../helpers/usdmTokenHelper";
import { UsdmTokenController } from "../helpers/usdmTokenControllerHelper";
import { LpTokenUsdmXtz } from "../helpers/lpTokenUsdmXtzHelper";
import { Cfmm } from "../helpers/cfmmHelper";
import { Vault } from "../helpers/vaultHelper";

import { doormanStorage } from "../../storage/doormanStorage";
import { delegationStorage } from "../../storage/delegationStorage";
import { mvkStorage, mvkTokenDecimals } from '../../storage/mvkTokenStorage'
import { governanceStorage } from "../../storage/governanceStorage";
import { breakGlassStorage } from "../../storage/breakGlassStorage";
import { emergencyGovernanceStorage } from "../../storage/emergencyGovernanceStorage";
import { vestingStorage } from "../../storage/vestingStorage";
import { councilStorage } from "../../storage/councilStorage";
import { treasuryStorage } from "../../storage/treasuryStorage";
import { mockFa12TokenStorage } from "../../storage/mockFa12TokenStorage";
import { mockFa2TokenStorage } from "../../storage/mockFa2TokenStorage";

import { usdmTokenStorage } from "../../storage/usdmTokenStorage";
import { usdmTokenControllerStorage } from "../../storage/usdmTokenControllerStorage";
import { lpTokenUsdmXtzStorage } from "../../storage/lpTokenUsdmXtzStorage";
import { cfmmStorage } from "../../storage/cfmmStorage";
import { vaultStorage } from "../../storage/vaultStorage";

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
  var mockFa12Token : MockFa12Token
  var mockFa2Token : MockFa2Token
  var usdmToken : UsdmToken
  var usdmTokenController : UsdmTokenController
  var lpTokenUsdmXtz : LpTokenUsdmXtz
  var cfmm : Cfmm
  // var vault : Vault
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

    doorman = await Doorman.originate(utils.tezos, doormanStorage)

    console.log('doorman contract originated')

    delegationStorage.generalContracts = MichelsonMap.fromLiteral({
      "doorman" : doorman.contract.address
    });
    delegationStorage.whitelistContracts = MichelsonMap.fromLiteral({
      "doorman" : doorman.contract.address
    });
    delegation = await Delegation.originate(utils.tezos,delegationStorage);

    console.log('delegation contract originated')

    mvkStorage.generalContracts = MichelsonMap.fromLiteral({
      doorman: doorman.contract.address,
    })
    mvkStorage.whitelistContracts = MichelsonMap.fromLiteral({
      doorman: doorman.contract.address,
    })
    mvkToken = await MvkToken.originate(utils.tezos, mvkStorage)

    console.log('MVK token contract originated')

    governanceStorage.generalContracts = MichelsonMap.fromLiteral({
      "delegation" : delegation.contract.address,
      "mvkToken"   : mvkToken.contract.address,
      "doorman"    : doorman.contract.address
    });
    governance = await Governance.originate(utils.tezos,governanceStorage);

    console.log('governance contract originated')

    emergencyGovernanceStorage.generalContracts = MichelsonMap.fromLiteral({
      "mvkToken"   : mvkToken.contract.address,
      "doorman"    : doorman.contract.address,
      "governance" : governance.contract.address,
    });
    emergencyGovernance = await EmergencyGovernance.originate(utils.tezos,emergencyGovernanceStorage);

    console.log('emergency governance contract originated')

    vestingStorage.generalContracts = MichelsonMap.fromLiteral({
      "mvkToken"   : mvkToken.contract.address,
      "doorman"    : doorman.contract.address,
      "delegation" : delegation.contract.address,
      "governance" : governance.contract.address,
    });
    vesting = await Vesting.originate(utils.tezos,vestingStorage);

    console.log("vesting contract originated")

    councilStorage.generalContracts = MichelsonMap.fromLiteral({
      vesting: vesting.contract.address,
      governance: governance.contract.address,
    })
    councilStorage.councilMembers = [alice.pkh, bob.pkh, eve.pkh]
    council = await Council.originate(utils.tezos, councilStorage)

    console.log('council contract originated')

    breakGlassStorage.generalContracts = MichelsonMap.fromLiteral({
      "mvkToken"            : mvkToken.contract.address,
      "doorman"             : doorman.contract.address,
      "delegation"          : delegation.contract.address,
      "governance"          : governance.contract.address,
      "vesting"             : vesting.contract.address,
      "council"             : council.contract.address,
      "emergencyGovernance" : emergencyGovernance.contract.address
    });
    breakGlassStorage.whitelistContracts = MichelsonMap.fromLiteral({
      "emergencyGovernance" : emergencyGovernance.contract.address
    });
    breakGlass = await BreakGlass.originate(
      utils.tezos,
      breakGlassStorage
    );

    console.log("break glass contract originated")

    treasuryStorage.generalContracts = MichelsonMap.fromLiteral({
      "mvkToken"     : mvkToken.contract.address,
      "delegation"   : delegation.contract.address,
    });
    treasuryStorage.whitelistContracts = MichelsonMap.fromLiteral({
      "governance"   : governance.contract.address,
    });
    treasuryStorage.whitelistTokenContracts = MichelsonMap.fromLiteral({
      "mvk"          : mvkToken.contract.address,
    });
    treasury = await Treasury.originate(
      utils.tezos,
      treasuryStorage
    );

    console.log('treasury contract originated')

    mockFa12Token = await MockFa12Token.originate(
      utils.tezos,
      mockFa12TokenStorage
    );

    console.log("mock FA12 Token originated")

    mockFa2Token = await MockFa2Token.originate(
      utils.tezos,
      mockFa2TokenStorage
    );

    console.log("mock FA2 Token originated")

    usdmToken = await UsdmToken.originate(
      utils.tezos,
      usdmTokenStorage
    );

    console.log("USDM Token originated")

    usdmTokenControllerStorage.collateralTokenLedger = MichelsonMap.fromLiteral({
      "mockFA12"  : {
        "tokenContractAddress" : mockFa12Token.contract.address, 
        "tokenType": {
          "fa12" : mockFa12Token.contract.address
        }
      },
      "mockFA2"   : {
        "tokenContractAddress" : mockFa2Token.contract.address, 
        "tokenType" : {
          "fa2": {
            "tokenContractAddress" : mockFa2Token.contract.address, 
            "tokenId" : 0
          }
        }
      },
      "mvk"       : {
        "tokenContractAddress" : mvkToken.contract.address, 
        "tokenType" : {
          "fa2": {
            "tokenContractAddress" : mvkToken.contract.address, 
            "tokenId" : 0
          }
        }
      }
    });
    usdmTokenController = await UsdmTokenController.originate(
      utils.tezos,
      usdmTokenControllerStorage
    );

    console.log("USDM Token Controller originated")

    cfmmStorage.usdmTokenAddress = usdmToken.contract.address;
    cfmm = await Cfmm.originate(
      utils.tezos,
      cfmmStorage
    );

    console.log("CFMM originated")

    lpTokenUsdmXtz = await LpTokenUsdmXtz.originate(
      utils.tezos,
      lpTokenUsdmXtzStorage
    );

    console.log("LP Token USDM/XTZ originated")


    /* ---- ---- ---- ---- ---- */

    tezos = doorman.tezos
    console.log('====== break ======')

    //----------------------------
    // Set remaining contract addresses - post-deployment
    //----------------------------

    // Doorman Contract - set contract addresses [delegation, mvkToken]
    const setDelegationContractAddressInDoormanOperation = await doorman.contract.methods
      .updateGeneralContracts('delegation', delegation.contract.address)
      .send()
    await setDelegationContractAddressInDoormanOperation.confirmation()
    const setMvkTokenAddressInDoormanOperation = await doorman.contract.methods
      .updateGeneralContracts('mvkToken', mvkToken.contract.address)
      .send()
    await setMvkTokenAddressInDoormanOperation.confirmation()
    console.log('doorman contract address set')

    // Delegation Contract - set contract addresses [governance]
    const setGovernanceContractAddressInDelegationOperation = await delegation.contract.methods
      .updateGeneralContracts("governance", governance.contract.address)
      .send();  
    await setGovernanceContractAddressInDelegationOperation.confirmation();
    const setWhitelistTreasuryContractAddressInDelegationOperation = await delegation.contract.methods
      .updateWhitelistContracts("treasury", treasury.contract.address)
      .send();  
    await setWhitelistTreasuryContractAddressInDelegationOperation.confirmation();
    console.log("delegation contract address set")

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
    const setCouncilContractInGovernanceOperation = await governance.contract.methods
      .updateGeneralContracts("council", council.contract.address)
      .send();
    await setCouncilContractInGovernanceOperation.confirmation();
    console.log('governance contract address set')

    // Emergency Governance Contract - set contract addresses map [breakGlass]
    const setBreakGlassContractAddressInEmergencyGovernance = await emergencyGovernance.contract.methods
      .updateGeneralContracts('breakGlass', breakGlass.contract.address)
      .send()
    await setBreakGlassContractAddressInEmergencyGovernance.confirmation()

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


    // USDM Token Controller - set collateral tokens in collateralTokenLedger
    // const setMockFa12TokenCollateralInUsdmTokenController = await usdmTokenController.contract.methods
    //   .updateCollateralTokenLedger('mockFa12', mockFa12Token.contract.address, mockFa12Token.contract.address)
    //   .send()
    // await setMockFa12TokenCollateralInUsdmTokenController.confirmation()
    

    //----------------------------
    // Save Contract Addresses to JSON (for reuse in JS / PyTezos Tests)
    //----------------------------
    await saveContractAddress("doormanAddress", doorman.contract.address)
    await saveContractAddress("delegationAddress", delegation.contract.address)
    await saveContractAddress("mvkTokenAddress", mvkToken.contract.address)
    await saveContractAddress("governanceAddress", governance.contract.address)
    await saveContractAddress("breakGlassAddress", breakGlass.contract.address)
    await saveContractAddress("emergencyGovernanceAddress", emergencyGovernance.contract.address)
    await saveContractAddress("vestingAddress", vesting.contract.address)
    await saveContractAddress("councilAddress", council.contract.address)
    await saveContractAddress("treasuryAddress", treasury.contract.address)
    
    await saveContractAddress("mockFa12TokenAddress", mockFa12Token.contract.address)
    await saveContractAddress("mockFa2TokenAddress", mockFa2Token.contract.address)
    
    await saveContractAddress("usdmTokenAddress", usdmToken.contract.address)
    await saveContractAddress("usdmTokenControllerAddress", usdmTokenController.contract.address)
    await saveContractAddress("lpTokenUsdmXtz", lpTokenUsdmXtz.contract.address)
    await saveContractAddress("cfmmAddress", cfmm.contract.address)

    //----------------------------
    // Save MVK Decimals to JSON (for reuse in JS / PyTezos Tests)
    //----------------------------
    await saveMVKDecimals(mvkTokenDecimals)

  });


  it(`test all contract deployments`, async () => {
    try{
        
        console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
        console.log("Test: All contracts deployed")
        console.log("-- -- -- -- -- Deployments -- -- -- --")
        console.log("Doorman Contract deployed at:", doorman.contract.address);
        console.log("Delegation Contract deployed at:", delegation.contract.address);
        console.log("Governance Contract deployed at:", governance.contract.address);
        console.log("BreakGlass Contract deployed at:", breakGlass.contract.address);
        console.log("Emergency Governance Contract deployed at:", emergencyGovernance.contract.address);
        console.log("MVK Token Contract deployed at:", mvkToken.contract.address);
        console.log("Vesting Contract deployed at:", vesting.contract.address);
        console.log("Council Contract deployed at:", council.contract.address);
        console.log("Treasury Contract deployed at:", treasury.contract.address);
        console.log("Mock FA12 Token Contract deployed at:", mockFa12Token.contract.address);
        console.log("Mock Fa2 Token Contract deployed at:", mockFa2Token.contract.address);

        console.log("USDM Token deployed at:", usdmToken.contract.address);
        console.log("USDM Token Controller Contract deployed at:", usdmTokenController.contract.address);
        console.log("LP Token USDM/XTZ deployed at:", lpTokenUsdmXtz.contract.address);
        console.log("CFMM (USDM/XTZ) Contract deployed at:", cfmm.contract.address);

    } catch (e){
        console.log(e);
    }
  })
})
