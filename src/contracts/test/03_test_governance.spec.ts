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
            // console.log(governanceStorage);
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            await signerFactory(bob.sk);
            // Bob stakes 100 MVK tokens and registers as a satellite before the proposal round starts
            const bobStakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
            await bobStakeAmountOperation.confirmation();                        
            const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "700").send();
            await bobRegisterAsSatelliteOperation.confirmation();

            await signerFactory(alice.sk);

            // Alice stakes 100 MVK tokens and registers as a satellite before the proposal round starts
            const aliceStakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
            await aliceStakeAmountOperation.confirmation();                        
            const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "700").send();
            await aliceRegisterAsSatelliteOperation.confirmation();

            // console.log("before: console log checks ----")
            // const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
            // console.log(afterDelegationLedgerAlice);
            // console.log(governanceStorage);

            // console.log("----")
            // admin starts a new proposal round
            const adminStartsNewProposalRoundOperation = await governanceInstance.methods.startProposalRound().send();
            await adminStartsNewProposalRoundOperation.confirmation();


            // await governanceStorage;
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);

            // check active satellites in console
            // const activeSatellitesMap = await newGovernanceStorage.activeSatellitesMap;
            // console.log(activeSatellitesMap);   

            // console.log("after: alice active satellite: ----")
            // const aliceActiveSatellite = await newGovernanceStorage.activeSatellitesMap.get(alice.pkh);
            // console.log(aliceActiveSatellite);

            // console.log(" --- --- --- ")

            console.log("after: alice active satellite snapshot: ----")
            const activeSatellitesMap    = await newGovernanceStorage.snapshotLedger;
            const aliceSatelliteSnapshot = await newGovernanceStorage.snapshotLedger.get(alice.pkh);
            console.log(activeSatellitesMap);
            console.log(aliceSatelliteSnapshot);
            
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
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);
            // admin starts a new proposal round
            const aliceCreatesNewProposalOperation = await governanceInstance.methods.propose("New Proposal #1", "Details about new proposal #1", "ipfs://hash").send();
            await aliceCreatesNewProposalOperation.confirmation();
            

            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);
            // console.log(newGovernanceStorage);
            // console.log(afterDelegationLedgerAlice);
            // console.log(afterAliceStakedBalance);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice and bob can vote for her proposal during the proposal round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: alice and bob can vote for her proposal during the proposal round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            // console.log(delegationStorage);
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);


            await signerFactory(bob.sk)
            const bobVotesForHisProposalOperation = await governanceInstance.methods.proposalRoundVote(1).send();
            await bobVotesForHisProposalOperation.confirmation();

            // alice votes for her proposal
            await signerFactory(alice.sk)
            const aliceVotesForHerProposalOperation = await governanceInstance.methods.proposalRoundVote(1).send();
            await aliceVotesForHerProposalOperation.confirmation();

            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);
            // console.log(newGovernanceStorage);
            const currentRoundProposals  = await newGovernanceStorage.currentRoundProposals;
            const currentRoundVotes      = await newGovernanceStorage.currentRoundVotes;
            const aliceProposal          = await newGovernanceStorage.proposalLedger.get(1);
            const aliceProposalPassVotes = await aliceProposal.passVotersMap;

            console.log(currentRoundProposals);
            console.log(currentRoundVotes);
            console.log(aliceProposal);
            console.log(aliceProposalPassVotes);
            console.log('end vote for proposal check')

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
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            await signerFactory(alice.sk);
            // admin starts a new voting round
            const adminStartsNewVotingRoundOperation = await governanceInstance.methods.startVotingRound().send();
            await adminStartsNewVotingRoundOperation.confirmation();

            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);
            // console.log(newGovernanceStorage);

            // console.log(afterDelegationLedgerAlice);
            // console.log(afterAliceStakedBalance);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice can drop her proposal during the voting round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Alice can drop her proposal during the voting round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            // console.log(governanceStorage.admin)
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            await signerFactory(alice.sk);
            // admin starts a new voting round
            const aliceDropsHerProposalDuringVotingRoundOperation = await governanceInstance.methods.dropProposal().send();
            await aliceDropsHerProposalDuringVotingRoundOperation.confirmation();

            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);
            // console.log(newGovernanceStorage);

            // console.log(afterDelegationLedgerAlice);
            // console.log(afterAliceStakedBalance);

        } catch(e){
            console.log(e);
        } 
    });


});