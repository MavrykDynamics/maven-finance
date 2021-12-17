const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';

describe("Governance tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(alice.sk);
        
        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();

        console.log('-- -- -- -- -- Governance Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });

    it('admin can start a new proposal round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Admin can start a new proposal round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            // console.log(delegationStorage);
            // console.log('-----')
            // console.log(governanceStorage.tempFlag);

            await signerFactory(alice.sk);

            // Alice stakes 100 MVK tokens and registers as a satellite before the proposal round starts
            const stakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
            await stakeAmountOperation.confirmation();                        
            const registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "700").send();
            await registerAsSatelliteOperation.confirmation();

            // console.log("before: console log checks ----")
            // const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
            // console.log(afterDelegationLedgerAlice);
            // console.log(governanceStorage);

            // console.log("----")
            // admin starts a new proposal round
            const adminStartsNewProposalRoundOperation = await governanceInstance.methods.startProposalRound().send();
            await adminStartsNewProposalRoundOperation.confirmation();
            // console.log("----")
            // console.log("----")
            // console.log("----")
            
            // console.log("after: console log checks  ----")
            
            // console.log(governanceStorage);

            // await governanceStorage;
            const newGovernanceStorage = await governanceInstance.storage();

            // const activeSatellitesMap = await newGovernanceStorage.activeSatellitesMap;
            // console.log(activeSatellitesMap);
            
            // console.log("after: alice active satellite: ----")
            // const aliceActiveSatellite = await newGovernanceStorage.activeSatellitesMap.get(alice.pkh);
            // console.log(aliceActiveSatellite);

            // console.log(" --- --- --- ")

            // console.log("after: alice active satellite snapshot: ----")
            // const aliceSatelliteSnapshot = await newGovernanceStorage.snapshotLedger.get(alice.pkh);
            // console.log(aliceSatelliteSnapshot);
            
            // console.log(newGovernanceStorage);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice can create a new proposal during the proposal round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: alice can create a new proposal during the proposal round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            // console.log(delegationStorage);
            // console.log(governanceStorage);

            // admin starts a new proposal round
            const aliceCreatesNewProposalOperation = await governanceInstance.methods.propose("New Proposal #1", "Details about new proposal #1", "ipfs://hash").send();
            await aliceCreatesNewProposalOperation.confirmation();

            // console.log("after: console log checks  ----")
            // const newGovernanceStorage = await governanceInstance.storage();
            // console.log(newGovernanceStorage);
            // console.log(afterDelegationLedgerAlice);
            // console.log(afterAliceStakedBalance);

        } catch(e){
            console.log(e);
        } 
    });

    it('admin can start a new voting round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Admin can start a new voting round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            // console.log(governanceStorage.admin)

            await signerFactory(alice.sk);
            // admin starts a new voting round
            const adminStartsNewVotingRoundOperation = await governanceInstance.methods.startVotingRound().send();
            await adminStartsNewVotingRoundOperation.confirmation();

            console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log(newGovernanceStorage);
            // console.log(afterDelegationLedgerAlice);
            // console.log(afterAliceStakedBalance);

        } catch(e){
            console.log(e);
        } 
    });


});