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

import { Governance, setGovernanceLambdas } from '../helpers/governanceHelper'
import { GovernanceFinancial, setGovernanceFinancialLambdas } from '../helpers/governanceFinancialHelper'
import { GovernanceSatellite, setGovernanceSatelliteLambdas } from '../helpers/governanceSatelliteHelper'
import { GovernanceProxy, setGovernanceProxyContractLambdas, setGovernanceProxyContractProxyLambdas } from '../helpers/governanceProxyHelper'
import { EmergencyGovernance, setEmergencyGovernanceLambdas } from '../helpers/emergencyGovernanceHelper'
import { BreakGlass, setBreakGlassLambdas } from '../helpers/breakGlassHelper'
import { Vesting, setVestingLambdas } from '../helpers/vestingHelper'
import { Council, setCouncilLambdas } from '../helpers/councilHelper'

import { Doorman, setDoormanLambdas } from '../helpers/doormanHelper'
import { Delegation, setDelegationLambdas } from '../helpers/delegationHelper'

import { Farm, setFarmLambdas } from "../helpers/farmHelper"
import { FarmFactory, setFarmFactoryLambdas, setFarmFactoryProductLambdas } from "../helpers/farmFactoryHelper"

import { Treasury, setTreasuryLambdas } from '../helpers/treasuryHelper'
import { TreasuryFactory, 
  setTreasuryFactoryLambdas, setTreasuryFactoryProductLambdas 
} from '../helpers/treasuryFactoryHelper'

import {Aggregator, setAggregatorLambdas} from '../helpers/aggregatorHelper'
import {
  AggregatorFactory,
  setAggregatorFactoryLambdas, setAggregatorFactoryProductLambdas
} from '../helpers/aggregatorFactoryHelper'

import { MvkToken } from '../helpers/mvkHelper'
import { MockFa12Token } from '../helpers/mockFa12TokenHelper'
import { MockFa2Token } from '../helpers/mockFa2TokenHelper'
import { LPToken } from "../helpers/testLPHelper"
import { TokenPoolLpToken } from "../helpers/tokenPoolLpTokenHelper"

// import { UsdmToken } from "../helpers/usdmTokenHelper"
// import { UsdmTokenController } from "../helpers/usdmTokenControllerHelper"
// import { LpTokenUsdmXtz } from "../helpers/lpTokenUsdmXtzHelper"
// import { Cfmm } from "../helpers/cfmmHelper"
// import { CfmmTezFa2Token } from "../helpers/cfmmTezFa2TokenHelper"
// import { CfmmTezFa12Token } from "../helpers/cfmmTezFa12TokenHelper"
import { Vault } from "../helpers/vaultHelper"

import { LendingController, setLendingControllerLambdas, setLendingControllerProductLambdas } from "../helpers/lendingControllerHelper"


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
import { mockFa12TokenStorage } from '../../storage/mockFa12TokenStorage'
import { mockFa2TokenStorage } from '../../storage/mockFa2TokenStorage'
import { lpStorage } from "../../storage/testLPTokenStorage"
import { tokenPoolLpTokenStorage } from "../../storage/tokenPoolLpTokenStorage"

// import { usdmTokenStorage } from "../../storage/usdmTokenStorage"
// import { usdmTokenControllerStorage } from "../../storage/usdmTokenControllerStorage"
// import { lpTokenUsdmXtzStorage } from "../../storage/lpTokenUsdmXtzStorage"
// import { cfmmStorage } from "../../storage/cfmmStorage"
// import { cfmmTezFa2TokenStorage } from "../../storage/cfmmTezFa2TokenStorage"
// import { cfmmTezFa12TokenStorage } from "../../storage/cfmmTezFa12TokenStorage"
import { vaultStorage } from "../../storage/vaultStorage"


import { lendingControllerStorage } from "../../storage/lendingControllerStorage"

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
  var mockFa12Token : MockFa12Token
  var mockFa2Token : MockFa2Token

  var mockUsdXtzAggregator : Aggregator;
  var mockUsdMockFa12TokenAggregator : Aggregator;
  var mockUsdMockFa2TokenAggregator : Aggregator;

  var lpTokenPoolMockFa12Token : TokenPoolLpToken;
  var lpTokenPoolMockFa2Token : TokenPoolLpToken;
  var lpTokenPoolXtz : TokenPoolLpToken;

  // var usdmToken : UsdmToken
  // var usdmTokenController : UsdmTokenController
  
  // var lpTokenUsdmXtz : LpTokenUsdmXtz
  // var lpTokenMockFa2Xtz : LpTokenUsdmXtz
  // var lpTokenMockFa12Xtz : MockFa12Token

  // var cfmm : Cfmm
  // var cfmmTezUsdm : CfmmTezFa2Token
  // var cfmmTezMockFa2Token : CfmmTezFa2Token
  // var cfmmTezMockFa12Token : CfmmTezFa12Token

  var lendingController : LendingController
  
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
        nameMaxLength                       : new BigNumber(200),
        decimals                            : new BigNumber(6),
        numberBlocksDelay                   : new BigNumber(2),
        
        deviationTriggerBanDuration         : new BigNumber(86400), // one day
        perThousandDeviationTrigger         : new BigNumber(2),
        percentOracleThreshold              : new BigNumber(49),
    
        requestRateDeviationDepositFee      : new BigNumber(0),
        
        deviationRewardStakedMvk            : new BigNumber(15000000), // 0.015 MVK
        deviationRewardAmountXtz            : new BigNumber(0),  
        rewardAmountStakedMvk               : new BigNumber(10000000), // 0.01 MVK
        rewardAmountXtz                     : new BigNumber(1300),     // ~0.0013 tez 
      };
      aggregatorStorage.lastCompletedRoundPrice = {
        round                   : new BigNumber(0),
        price                   : new BigNumber(1500000),
        percentOracleResponse   : new BigNumber(100),
        priceDateTime           : '1'
      };
      mockUsdMockFa12TokenAggregator = await Aggregator.originate(
        utils.tezos,
        aggregatorStorage
      )
  
      await saveContractAddress('mockUsdMockFa12TokenAggregatorAddress', mockUsdMockFa12TokenAggregator.contract.address)
      console.log('Mock USD/MockFA12Token Aggregator Contract deployed at:', mockUsdMockFa12TokenAggregator.contract.address)


      aggregatorStorage.lastCompletedRoundPrice = {
        round                   : new BigNumber(0),
        price                   : new BigNumber(3500000),
        percentOracleResponse   : new BigNumber(100),
        priceDateTime           : '1'
      };
      mockUsdMockFa2TokenAggregator = await Aggregator.originate(
        utils.tezos,
        aggregatorStorage
      )
  
      await saveContractAddress('mockUsdMockFa2TokenAggregatorAddress', mockUsdMockFa2TokenAggregator.contract.address)
      console.log('Mock USD/MockFA2Token Aggregator Contract deployed at:', mockUsdMockFa2TokenAggregator.contract.address)


      aggregatorStorage.lastCompletedRoundPrice = {
        round                   : new BigNumber(0),
        price                   : new BigNumber(1800000),
        percentOracleResponse   : new BigNumber(100),
        priceDateTime           : '1'
      };
      mockUsdXtzAggregator = await Aggregator.originate(
        utils.tezos,
        aggregatorStorage
      )
  
      await saveContractAddress('mockUsdXtzAggregatorAddress', mockUsdXtzAggregator.contract.address)
      console.log('Mock USD/XTZ Aggregator Contract deployed at:', mockUsdXtzAggregator.contract.address)
  
  


      // usdmToken = await UsdmToken.originate(
      //   utils.tezos,
      //   usdmTokenStorage
      // );
  
      // console.log("USDM Token originated")
  
  
  
      // usdmTokenControllerStorage.collateralTokenLedger = MichelsonMap.fromLiteral({
      //   "mockFA12"  : {
      //     "tokenContractAddress" : mockFa12Token.contract.address, 
      //     "tokenType": {
      //       "fa12" : mockFa12Token.contract.address
      //     }
      //   },
      //   "mockFA2"   : {
      //     "tokenContractAddress" : mockFa2Token.contract.address, 
      //     "tokenType" : {
      //       "fa2": {
      //         "tokenContractAddress" : mockFa2Token.contract.address, 
      //         "tokenId" : 0
      //       }
      //     }
      //   },
      //   "mvk"       : {
      //     "tokenContractAddress" : mvkToken.contract.address, 
      //     "tokenType" : {
      //       "fa2": {
      //         "tokenContractAddress" : mvkToken.contract.address, 
      //         "tokenId" : 0
      //       }
      //     }
      //   },
      //   "usdm"       : {
      //     "tokenContractAddress" : usdmToken.contract.address, 
      //     "tokenType" : {
      //       "fa2": {
      //         "tokenContractAddress" : usdmToken.contract.address, 
      //         "tokenId" : 0
      //       }
      //     }
      //   }
      // });
      // usdmTokenControllerStorage.usdmTokenAddress = usdmToken.contract.address;
      // usdmTokenController = await UsdmTokenController.originate(
      //   utils.tezos,
      //   usdmTokenControllerStorage
      // );

      // console.log("USDM Token Controller originated")

      // cfmmStorage.usdmTokenAddress = usdmToken.contract.address;
      // cfmm = await Cfmm.originate(
      //   utils.tezos,
      //   cfmmStorage
      // );

      // console.log("CFMM originated")

      // lpTokenUsdmXtz = await LpTokenUsdmXtz.originate(
      //   utils.tezos,
      //   lpTokenUsdmXtzStorage
      // );

      // console.log("LP Token USDM/XTZ originated")

      // lpTokenMockFa2Xtz = await LpTokenUsdmXtz.originate(
      //   utils.tezos,
      //   lpTokenUsdmXtzStorage
      // );

      // console.log("LP Token MockFa2/XTZ originated")

      // mockFa12TokenStorage.ledger = MichelsonMap.fromLiteral({});
      // lpTokenMockFa12Xtz = await MockFa12Token.originate(
      //   utils.tezos,
      //   mockFa12TokenStorage
      // );

      // console.log("LP Token MockFa12/XTZ originated")

      // cfmmTezFa2TokenStorage.usdmTokenControllerAddress = usdmTokenController.contract.address;
      // cfmmTezFa2TokenStorage.lpTokenAddress             = lpTokenUsdmXtz.contract.address;
      // cfmmTezFa2TokenStorage.tokenName                  = "usdm";
      // cfmmTezFa2TokenStorage.tokenAddress               = usdmToken.contract.address;
      // cfmmTezUsdm = await CfmmTezFa2Token.originate(
      //   utils.tezos,
      //   cfmmTezFa2TokenStorage
      // );

      // console.log("CFMM (XTZ/USDM) originated")


      
      // cfmmTezFa2TokenStorage.usdmTokenControllerAddress = usdmTokenController.contract.address;
      // cfmmTezFa2TokenStorage.lpTokenAddress             = lpTokenMockFa2Xtz.contract.address;
      // cfmmTezFa2TokenStorage.lpTokensTotal              = new BigNumber(200000000); // 200 LP Tokens - 1:10 ratio
      // cfmmTezFa2TokenStorage.tokenName                  = "mockFa2";
      // cfmmTezFa2TokenStorage.tokenAddress               = mockFa2Token.contract.address;
      // cfmmTezMockFa2Token = await CfmmTezFa2Token.originate(
      //   utils.tezos,
      //   cfmmTezFa2TokenStorage
      // );

      // console.log("CFMM (XTZ/MockFa2Token) originated")


      // cfmmTezFa12TokenStorage.usdmTokenControllerAddress = usdmTokenController.contract.address;
      // cfmmTezFa12TokenStorage.lpTokenAddress             = lpTokenMockFa12Xtz.contract.address;
      // cfmmTezFa12TokenStorage.lpTokensTotal              = new BigNumber(100000000); // 100 LP Tokens - 1:20 ratio
      // cfmmTezFa12TokenStorage.tokenName                  = "mockFa12";
      // cfmmTezFa12TokenStorage.tokenAddress               = mockFa12Token.contract.address;
      // cfmmTezMockFa12Token = await CfmmTezFa12Token.originate(
      //   utils.tezos,
      //   cfmmTezFa12TokenStorage
      // );

      // console.log("CFMM (XTZ/MockFa12Token) originated")


      // usdmToken = await UsdmToken.originate(
      //   utils.tezos,
      //   usdmTokenStorage
      // );

      // console.log("USDM Token originated")

  
  
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
      await setLendingControllerProductLambdas(tezos, lendingController.contract)
      console.log("Lending Controller Vault Lambdas Setup")
  
    
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
  

      // LP Token XTZ/USDM
      // const setCfmmContractAddressInLpTokenUsdmXtzOperation = await lpTokenUsdmXtz.contract.methods
      // .updateWhitelistContracts("cfmm", cfmmTezUsdm.contract.address)
      // .send();  
      // await setCfmmContractAddressInLpTokenUsdmXtzOperation.confirmation();
      // console.log('cfmm (XTZ/USDM) contract address set in LP Token (USDM/XTZ) whitelist')

      // USDM Token
      // const setUsdmTokenControllerInUsdmTokenWhitelistOperation = await usdmToken.contract.methods
      //   .updateWhitelistContracts("controller", usdmTokenController.contract.address)
      //   .send();  
      // await setUsdmTokenControllerInUsdmTokenWhitelistOperation.confirmation();
      // console.log('USDM Token Controller set in USDM Token whitelist')

      // LP Token XTZ/MockFA2
      // const setCfmmContractAddressInLpTokenMockFa2TokenXtzOperation = await lpTokenMockFa2Xtz.contract.methods
      //   .updateWhitelistContracts("cfmm", cfmmTezMockFa2Token.contract.address)
      //   .send();  
      // await setCfmmContractAddressInLpTokenMockFa2TokenXtzOperation.confirmation();
      // console.log('cfmm (XTZ/MockFa2Token) contract address set in LP Token (MockFa2Token/XTZ) whitelist')

      // LP Token XTZ/MockFA12
      // const setCfmmContractAddressInLpTokenMockFa12TokenXtzOperation = await lpTokenMockFa12Xtz.contract.methods
      //   .updateWhitelistContracts("cfmm", cfmmTezMockFa12Token.contract.address)
      //   .send();  
      // await setCfmmContractAddressInLpTokenMockFa12TokenXtzOperation.confirmation();
      // console.log('cfmm (XTZ/MockFa12Token) contract address set in LP Token (MockFa12Token/XTZ) whitelist')


      // const usdmTokenControllerContractsBatch = await tezos.wallet
      // .batch()
  
      // update cfmm address ledger
      // .withContractCall(usdmTokenController.contract.methods.updateCfmmAddressLedger("usdm", cfmmTezUsdm.contract.address))
      // .withContractCall(usdmTokenController.contract.methods.updateCfmmAddressLedger("mockFa2Token", cfmmTezMockFa2Token.contract.address))
      // .withContractCall(usdmTokenController.contract.methods.updateCfmmAddressLedger("mockFa2Token", cfmmTezMockFa2Token.contract.address))
  
      // const usdmTokenControllerContractsBatchOperation = await usdmTokenControllerContractsBatch.send()
      // await confirmOperation(tezos, usdmTokenControllerContractsBatchOperation.opHash)
      
      
      // await saveContractAddress("usdmTokenAddress", usdmToken.contract.address)
      // await saveContractAddress("usdmTokenControllerAddress", usdmTokenController.contract.address)
      
      // await saveContractAddress("lpTokenUsdmXtzTokenAddress", lpTokenUsdmXtz.contract.address)
      // await saveContractAddress("lpTokenMockFa2XtzAddress", lpTokenMockFa2Xtz.contract.address)
      // await saveContractAddress("lpTokenMockFa12XtzAddress", lpTokenMockFa12Xtz.contract.address)

      // // await saveContractAddress("cfmmAddress", cfmm.contract.address)
      // await saveContractAddress("cfmmTezUsdmAddress", cfmmTezUsdm.contract.address)
      // await saveContractAddress("cfmmTezMockFa2TokenAddress", cfmmTezMockFa2Token.contract.address)
      // await saveContractAddress("cfmmTezMockFa12TokenAddress", cfmmTezMockFa12Token.contract.address)


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