const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress } from "../helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require("../../helpers/saveContractAddress")
import { MichelsonMap } from "@taquito/michelson-encoder";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);   
chai.should();

import env from "../../env";
import { alice, bob, eve, mallory } from "../../scripts/sandbox/accounts";

import { Doorman } from "../helpers/doormanHelper";
import { Delegation } from "../helpers/delegationHelper";
import { MvkToken } from "../helpers/mvkHelper";
import { Governance } from "../helpers/governanceHelper";
import { BreakGlass } from "../helpers/breakGlassHelper";
import { EmergencyGovernance } from "../helpers/emergencyGovernanceHelper";
import { Vesting } from "../helpers/vestingHelper";
import { Council } from "../helpers/councilHelper";

import { doormanStorage } from "../../storage/doormanStorage";
import { delegationStorage } from "../../storage/delegationStorage";
import { mvkStorage } from "../../storage/mvkTokenStorage";
import { governanceStorage } from "../../storage/governanceStorage";
import { breakGlassStorage } from "../../storage/breakGlassStorage";
import { emergencyGovernanceStorage } from "../../storage/emergencyGovernanceStorage";
import { vestingStorage } from "../../storage/vestingStorage";
import { councilStorage } from "../../storage/councilStorage";

describe("Contracts Deployment for Tests", async () => {
  var utils: Utils;
  var doorman: Doorman;
  var mvkToken : MvkToken;
  var delegation : Delegation;
  var governance : Governance;
  var breakGlass : BreakGlass;
  var emergencyGovernance : EmergencyGovernance;
  var vesting : Vesting;
  var council : Council;
  var tezos;
  let deployedDoormanStorage;
  let deployedDelegationStorage;
  let deployedMvkTokenStorage;

  const signerFactory = async (pk) => {
    await tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
    return tezos;
  };

  before("setup", async () => {
    
    utils = new Utils();
    await utils.init(alice.sk);

    //----------------------------
    // Originate and deploy contracts 
    //----------------------------

    doorman = await Doorman.originate(
      utils.tezos,
      doormanStorage
    );

    delegationStorage.contractAddresses = MichelsonMap.fromLiteral({
      "doorman" : doorman.contract.address
    });
    delegation = await Delegation.originate(
      utils.tezos,
      delegationStorage
    );

    mvkStorage.contractAddresses = MichelsonMap.fromLiteral({
      "doorman" : doorman.contract.address
    });
    mvkStorage.whitelistContracts = MichelsonMap.fromLiteral({
      "doorman" : doorman.contract.address
    });
    mvkToken = await MvkToken.originate(
      utils.tezos,
      mvkStorage
    );

    governanceStorage.contractAddresses = MichelsonMap.fromLiteral({
      "delegation" : delegation.contract.address,
      "mvkToken" : mvkToken.contract.address,
    });
    governance = await Governance.originate(
      utils.tezos,
      governanceStorage
    );

    emergencyGovernanceStorage.contractAddresses = MichelsonMap.fromLiteral({
      "mvkToken"  : mvkToken.contract.address,
      "governance": governance.contract.address,
    });
    emergencyGovernance = await EmergencyGovernance.originate(
      utils.tezos,
      emergencyGovernanceStorage
    );

    vestingStorage.contractAddresses = MichelsonMap.fromLiteral({
      "mvkToken"  : mvkToken.contract.address,
      "doorman"   : doorman.contract.address,
      "delegation": delegation.contract.address,
      "governance": governance.contract.address,
    });
    vesting = await Vesting.originate(
      utils.tezos,
      vestingStorage
    );

    councilStorage.contractAddresses = MichelsonMap.fromLiteral({
      "vesting"  : vesting.contract.address
    });
    councilStorage.councilMembers = [alice.pkh, bob.pkh];
    council = await Council.originate(
      utils.tezos,
      councilStorage
    );

    breakGlassStorage.contractAddresses = MichelsonMap.fromLiteral({
      "mvkToken"  : mvkToken.contract.address,
      "doorman"   : doorman.contract.address,
      "delegation": delegation.contract.address,
      "governance": governance.contract.address,
      "vesting"   : vesting.contract.address,
      "council"   : council.contract.address,
      "emergencyGovernance": emergencyGovernance.contract.address
    });
    breakGlass = await BreakGlass.originate(
      utils.tezos,
      breakGlassStorage
    );

    /* ---- ---- ---- ---- ---- */

    tezos = doorman.tezos;

    //----------------------------
    // Set remaining contract addresses - post-deployment
    //----------------------------

    // Doorman Contract - set contract addresses [delegation, mvkToken]
    const setDelegationContractAddressInDoormanOperation = await doorman.contract.methods.updateContractAddresses("delegation", delegation.contract.address).send();  
    await setDelegationContractAddressInDoormanOperation.confirmation();
    const setMvkTokenAddressInDoormanOperation = await doorman.contract.methods.updateContractAddresses("mvkToken", mvkToken.contract.address).send();
    await setMvkTokenAddressInDoormanOperation.confirmation();

    // Delegation Contract - set contract addresses [governance]
    const setGovernanceContractAddressInDelegationOperation = await delegation.contract.methods.updateContractAddresses("governance", governance.contract.address).send();  
    await setGovernanceContractAddressInDelegationOperation.confirmation();

    // MVK Token Contract - set whitelist contract addresses [vesting]
    const setWhitelistVestingContractInMvkTokenOperation = await mvkToken.contract.methods.updateWhitelistContracts("vesting", vesting.contract.address).send();
    await setWhitelistVestingContractInMvkTokenOperation.confirmation();

    // Governance Contract - set contract addresses [emergencyGovernance, breakGlass]
    const setEmergencyGovernanceContractInGovernanceOperation = await governance.contract.methods.updateContractAddresses("emergencyGovernance", emergencyGovernance.contract.address).send();
    await setEmergencyGovernanceContractInGovernanceOperation.confirmation();
    const setBreakGlassContractInGovernanceOperation = await governance.contract.methods.updateContractAddresses("breakGlass", breakGlass.contract.address).send();
    await setBreakGlassContractInGovernanceOperation.confirmation();

    // Emergency Governance Contract - set contract addresses map [breakGlass]
    const setBreakGlassContractAddressInEmergencyGovernance = await emergencyGovernance.contract.methods.updateContractAddresses("breakGlass", breakGlass.contract.address).send();
    await setBreakGlassContractAddressInEmergencyGovernance.confirmation();

    // Vesting Contract - set whitelist contract addresses map [council]
    const setCouncilContractAddressInVesting = await vesting.contract.methods.updateWhitelistContracts("council", council.contract.address).send();
    await setCouncilContractAddressInVesting.confirmation();

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

    // deployedDoormanStorage    = await doorman.contract.storage();
    // deployedDelegationStorage = await delegation.contract.storage();
    // deployedMvkTokenStorage   = await mvkToken.contract.storage();
    // const afterMvkTokenStorage = await mvkToken.contract.storage();
    // const afterDelegationStorage = await delegation.contract.storage();
    // const afterGovernanceStorage = await governance.contract.storage();
    // const afterBreakGlassStorage = await breakGlass.contract.storage();
    // const afterEmergencyGovernanceStorage = await emergencyGovernance.contract.storage();

    // console.log(afterMvkTokenStorage);
    // console.log(afterDelegationStorage);
    // console.log(afterGovernanceStorage);
    // console.log(afterBreakGlassStorage);
    // console.log(afterEmergencyGovernanceStorage);

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

    } catch (e){
        console.log(e);
    }
  }); 

});