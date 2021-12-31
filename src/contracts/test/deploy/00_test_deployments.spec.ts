const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress } from "../helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require('../../helpers/saveContractAddress')

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
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

import { doormanStorage } from "../../storage/doormanStorage";
import { delegationStorage } from "../../storage/delegationStorage";
import { mvkStorage } from "../../storage/mvkStorage";
import { governanceStorage } from "../../storage/governanceStorage";
import { breakGlassStorage } from "../../storage/breakGlassStorage";
import { emergencyGovernanceStorage } from "../../storage/emergencyGovernanceStorage";
import { vestingStorage } from "../../storage/vestingStorage";

describe("Contracts Deployment for Tests", async () => {
  var utils: Utils;
  var doorman: Doorman;
  var mvkToken : MvkToken;
  var delegation : Delegation;
  var governance : Governance;
  var breakGlass : BreakGlass;
  var emergencyGovernance : EmergencyGovernance;
  var vesting : Vesting;
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

    doorman = await Doorman.originate(
      utils.tezos,
      doormanStorage
    );

    delegationStorage.doormanAddress = doorman.contract.address;
    delegation = await Delegation.originate(
      utils.tezos,
      delegationStorage
    );

    mvkStorage.doormanAddress = doorman.contract.address;
    mvkStorage.whitelistContracts = [doorman.contract.address];
    mvkToken = await MvkToken.originate(
      utils.tezos,
      mvkStorage
    );

    governanceStorage.delegationAddress = delegation.contract.address;
    governanceStorage.mvkTokenAddress   = mvkToken.contract.address;
    governance = await Governance.originate(
      utils.tezos,
      governanceStorage
    );

    breakGlass = await BreakGlass.originate(
      utils.tezos,
      breakGlassStorage
    );

    emergencyGovernanceStorage.mvkTokenAddress           = mvkToken.contract.address;
    emergencyGovernanceStorage.governanceContractAddress = governance.contract.address;
    emergencyGovernanceStorage.breakGlassContractAddress = breakGlass.contract.address;
    emergencyGovernance = await EmergencyGovernance.originate(
      utils.tezos,
      emergencyGovernanceStorage
    );

    vestingStorage.delegationAddress = delegation.contract.address;
    vestingStorage.doormanAddress    = doorman.contract.address;
    vestingStorage.governanceAddress = governance.contract.address;
    vestingStorage.mvkTokenAddress   = mvkToken.contract.address;
    vesting = await Vesting.originate(
      utils.tezos,
      vestingStorage
    );

    /* ---- ---- ---- ---- ---- */

    tezos = doorman.tezos;

    const inDoormanSetDelegationContractAddressOperation = await doorman.contract.methods.setDelegationAddress(delegation.contract.address).send();  
    await inDoormanSetDelegationContractAddressOperation.confirmation();
    const inDoormanSetMvkTokenAddressOperation = await doorman.contract.methods.setMvkTokenAddress(mvkToken.contract.address).send();
    await inDoormanSetMvkTokenAddressOperation.confirmation();

    const inDelegationSetGovernanceContractAddressOperation = await delegation.contract.methods.setGovernanceAddress(governance.contract.address).send();  
    await inDelegationSetGovernanceContractAddressOperation.confirmation();

    const inMvkTokenContractAddVestingContractToWhitelistOperation = await mvkToken.contract.methods.updateWhitelistContracts(vesting.contract.address).send();
    await inMvkTokenContractAddVestingContractToWhitelistOperation.confirmation();
    
    await saveContractAddress('doormanAddress', doorman.contract.address)
    await saveContractAddress('delegationAddress', delegation.contract.address)
    await saveContractAddress('mvkTokenAddress', mvkToken.contract.address)
    await saveContractAddress('governanceAddress', governance.contract.address)
    await saveContractAddress('breakGlassAddress', breakGlass.contract.address)
    await saveContractAddress('emergencyGovernanceAddress', emergencyGovernance.contract.address)
    await saveContractAddress('vestingAddress', vesting.contract.address)

    // deployedDoormanStorage    = await doorman.contract.storage();
    // deployedDelegationStorage = await delegation.contract.storage();
    // deployedMvkTokenStorage   = await mvkToken.contract.storage();
    // const afterDelegationStorage = await delegation.contract.storage();
    // const afterGovernanceStorage = await governance.contract.storage();
    // const afterBreakGlassStorage = await breakGlass.contract.storage();
    // const afterEmergencyGovernanceStorage = await emergencyGovernance.contract.storage();

    // console.log(afterDelegationStorage);
    // console.log(afterGovernanceStorage);
    // console.log(afterBreakGlassStorage);
    // console.log(afterEmergencyGovernanceStorage);

  });


  it(`test all contract deployments`, async () => {
    try{
        
        console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
        console.log('Test: All contracts deployed')
        console.log('-- -- -- -- -- Deployments -- -- -- --')
        console.log('Doorman Contract deployed at:', doorman.contract.address);
        console.log('Delegation Contract deployed at:', delegation.contract.address);
        console.log('Governance Contract deployed at:', governance.contract.address);
        console.log('BreakGlass Contract deployed at:', breakGlass.contract.address);
        console.log('Emergency Governance Contract deployed at:', emergencyGovernance.contract.address);
        console.log('MVK Token Contract deployed at:', mvkToken.contract.address);
        console.log('Vesting Contract deployed at:', vesting.contract.address);

    } catch (e){
        console.log(e);
    }
  }); 

});