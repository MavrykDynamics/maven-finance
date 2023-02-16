const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";
import { BigNumber } from 'bignumber.js'
import * as sharedTestHelper from "./helpers/sharedTestHelpers"

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan, oracleMaintainer } from "../scripts/sandbox/accounts";

import doormanAddress                           from '../deployments/doormanAddress.json';
import delegationAddress                        from '../deployments/delegationAddress.json';
import mvkTokenAddress                          from '../deployments/mvkTokenAddress.json';
import councilAddress                           from '../deployments/councilAddress.json';
import governanceAddress                        from '../deployments/governanceAddress.json';
import governanceFinancialAddress               from '../deployments/governanceFinancialAddress.json';
import governanceProxyAddress                   from '../deployments/governanceProxyAddress.json';
import governanceProxyNodeAddress               from '../deployments/governanceProxyNodeAddress.json';
import emergencyGovernanceAddress               from '../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress                        from '../deployments/breakGlassAddress.json';
import vestingAddress                           from '../deployments/vestingAddress.json';
import treasuryAddress                          from '../deployments/treasuryAddress.json';
import mavrykFa12TokenAddress                   from '../deployments/mavrykFa12TokenAddress.json';
import farmFactoryAddress                       from '../deployments/farmFactoryAddress.json'
import treasuryFactoryAddress                   from '../deployments/treasuryFactoryAddress.json'
import governanceSatelliteAddress               from '../deployments/governanceSatelliteAddress.json'
import aggregatorAddress                        from '../deployments/aggregatorAddress.json'
import aggregatorFactoryAddress                 from '../deployments/aggregatorFactoryAddress.json'
import farmAddress                              from '../deployments/farmAddress.json'
import vaultFactoryAddress                      from '../deployments/vaultFactoryAddress.json'
import lendingControllerAddress                 from '../deployments/lendingControllerAddress.json'
import mockFa12TokenAddress                     from '../deployments/mavrykFa12TokenAddress.json';
import mockFa2TokenAddress                      from '../deployments/mavrykFa2TokenAddress.json';

import mockUsdMockFa12TokenAggregatorAddress    from "../deployments/mockUsdMockFa12TokenAggregatorAddress.json";
import mockUsdMockFa2TokenAggregatorAddress     from "../deployments/mockUsdMockFa2TokenAggregatorAddress.json";
import mockUsdXtzAggregatorAddress              from "../deployments/mockUsdXtzAggregatorAddress.json";
import mockUsdMvkAggregatorAddress              from "../deployments/mockUsdMvkAggregatorAddress.json";

import lpTokenPoolMockFa12TokenAddress          from "../deployments/lpTokenPoolMockFa12TokenAddress.json";
import lpTokenPoolMockFa2TokenAddress           from "../deployments/lpTokenPoolMockFa2TokenAddress.json";
import lpTokenPoolXtzAddress                    from "../deployments/lpTokenPoolXtzAddress.json";


import doormanLambdas               from '../build/lambdas/doormanLambdas.json'

import { MichelsonMap }             from "@taquito/taquito";
import { farmStorageType }          from "./types/farmStorageType";
import { aggregatorStorageType }    from "./types/aggregatorStorageType";

describe("Governance proxy lambdas tests", async () => {
    
    var utils: Utils;
    let rpc;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let councilInstance;
    let governanceInstance;
    let governanceFinancialInstance;
    
    let governanceProxyInstance;
    let governanceProxyNodeInstance;

    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let vestingInstance;
    let treasuryInstance;
    let farmFactoryInstance;
    let treasuryFactoryInstance;
    let farmInstance;
    let governanceSatelliteInstance;
    let aggregatorInstance;
    let aggregatorFactoryInstance;
    let vaultFactoryInstance;
    let lendingControllerInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let councilStorage;
    let governanceStorage;
    let governanceFinancialStorage;
    let governanceProxyStorage;
    let governanceProxyNodeStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let vestingStorage;
    let treasuryStorage;
    let farmFactoryStorage;
    let treasuryFactoryStorage;
    let farmStorage;
    let governanceSatelliteStorage;
    let aggregatorStorage;
    let aggregatorFactoryStorage;
    let vaultFactoryStorage;
    let lendingControllerStorage;

    // For testing purposes
    var aTrackedFarm;
    var aTrackedTreasury;
    var aTrackedAggregator;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        try {
            
            utils = new Utils();
            await utils.init(bob.sk);
            rpc = utils.tezos.rpc
    
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
            delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
            mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
            councilInstance                 = await utils.tezos.contract.at(councilAddress.address);
            governanceInstance              = await utils.tezos.contract.at(governanceAddress.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(governanceFinancialAddress.address);
            governanceProxyInstance         = await utils.tezos.contract.at(governanceProxyAddress.address);
            governanceProxyNodeInstance     = await utils.tezos.contract.at(governanceProxyNodeAddress.address);
            emergencyGovernanceInstance     = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
            breakGlassInstance              = await utils.tezos.contract.at(breakGlassAddress.address);
            vestingInstance                 = await utils.tezos.contract.at(vestingAddress.address);
            treasuryInstance                = await utils.tezos.contract.at(treasuryAddress.address);
            farmFactoryInstance             = await utils.tezos.contract.at(farmFactoryAddress.address);
            treasuryFactoryInstance         = await utils.tezos.contract.at(treasuryFactoryAddress.address);
            farmInstance                    = await utils.tezos.contract.at(farmAddress.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(governanceSatelliteAddress.address);
            aggregatorInstance              = await utils.tezos.contract.at(aggregatorAddress.address);
            aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
            vaultFactoryInstance            = await utils.tezos.contract.at(vaultFactoryAddress.address);
            lendingControllerInstance       = await utils.tezos.contract.at(lendingControllerAddress.address);
                
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            councilStorage                  = await councilInstance.storage();
            governanceStorage               = await governanceInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            governanceProxyStorage          = await governanceProxyInstance.storage();
            governanceProxyNodeStorage      = await governanceProxyNodeInstance.storage();
            emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
            breakGlassStorage               = await breakGlassInstance.storage();
            vestingStorage                  = await vestingInstance.storage();
            treasuryStorage                 = await treasuryInstance.storage();
            farmFactoryStorage              = await farmFactoryInstance.storage();
            treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
            farmStorage                     = await farmInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            vaultFactoryStorage             = await vaultFactoryInstance.storage();
            lendingControllerStorage        = await lendingControllerInstance.storage();
    
            console.log('-- -- -- -- -- Governance Proxy Tests -- -- -- --')
            console.log('Doorman Contract deployed at:'                 , doormanInstance.address);
            console.log('Delegation Contract deployed at:'              , delegationInstance.address);
            console.log('MVK Token Contract deployed at:'               , mvkTokenInstance.address);
            console.log('Council Contract deployed at:'                 , councilInstance.address);
            console.log('Governance Contract deployed at:'              , governanceInstance.address);
            console.log('Governance Satellite Contract deployed at:'    , governanceSatelliteAddress.address);
            console.log('Governance Proxy Contract deployed at:'        , governanceProxyInstance.address);
            console.log('Governance Proxy Node Contract deployed at:'   , governanceProxyNodeInstance.address);
            console.log('Emergency Governance Contract deployed at:'    , emergencyGovernanceInstance.address);
            console.log('Break Glass Contract deployed at:'             , breakGlassInstance.address);
            console.log('Vesting Contract deployed at:'                 , vestingInstance.address);
            console.log('Treasury Contract deployed at:'                , treasuryInstance.address);
            console.log('Farm Factory Contract deployed at:'            , farmFactoryAddress.address);
            console.log('Treasury Factory Contract deployed at:'        , treasuryFactoryAddress.address);
            console.log('Farm Contract deployed at:'                    , farmAddress.address);
            console.log('Aggregator Contract deployed at:'              , aggregatorAddress.address);
            console.log('Aggregator Factory Contract deployed at:'      , aggregatorFactoryAddress.address);
            console.log('Vault Factory Contract deployed at:'           , vaultFactoryAddress.address);
            console.log('Lending Controller Contract deployed at:'      , lendingControllerAddress.address);

            console.log('Bob address: '         + bob.pkh);
            console.log('Alice address: '       + alice.pkh);
            console.log('Eve address: '         + eve.pkh);
            console.log('Mallory address: '     + mallory.pkh);
            console.log('Oscar address: '       + oscar.pkh);
            console.log('-- -- -- -- -- -- -- -- --')
    
            // Check if cycle already started (for retest purposes)
            const cycleEnd  = governanceStorage.currentCycleInfo.cycleEndLevel;
            if (cycleEnd == 0) {

                console.log('first governance cycle (cycle end == 0)');
                
                await signerFactory(bob.sk);

                // Update governance config for shorter cycles
                var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                await updateGovernanceConfig.confirmation();

                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                await updateGovernanceConfig.confirmation();

                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                await updateGovernanceConfig.confirmation();

                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
                await updateGovernanceConfig.confirmation();

                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
                await updateGovernanceConfig.confirmation();

                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
                await updateGovernanceConfig.confirmation();

                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinYayVotePercentage").send();
                await updateGovernanceConfig.confirmation();
    
                // Register satellites
                var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : bob.pkh,
                        operator : doormanAddress.address,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();

                var stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
                await stakeOperation.confirmation();
                
                var registerAsSatelliteOperation = await delegationInstance.methods
                    .registerAsSatellite(
                        "Bob", 
                        "Bob description", 
                        "Bob image", 
                        "Bob website",
                        1000
                    ).send();
                await registerAsSatelliteOperation.confirmation();
    
                await signerFactory(alice.sk)
                var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : alice.pkh,
                        operator : doormanAddress.address,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
                
                stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
                await stakeOperation.confirmation();
                
                var registerAsSatelliteOperation = await delegationInstance.methods
                    .registerAsSatellite(
                        "Alice", 
                        "Alice description", 
                        "Alice image", 
                        "Alice website",
                        1000
                    ).send();
                await registerAsSatelliteOperation.confirmation();
        
                // Set contracts admin to governance proxy
                await signerFactory(bob.sk);
                governanceStorage               = await governanceInstance.storage();            
                const generalContracts          = governanceStorage.generalContracts.entries();

                var setAdminOperation           = await governanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation();

                setAdminOperation               = await mvkTokenInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation();

                setAdminOperation               = await farmInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation();

                setAdminOperation               = await aggregatorInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation();

                // set admin for contracts in governance general contracts map
                for (let entry of generalContracts){
                    // Get contract storage
                    let contract        = await utils.tezos.contract.at(entry[1]);
                    var storage : any   = await contract.storage();
    
                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin !== governanceProxyAddress.address && storage.admin !== breakGlassAddress.address){
                        setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
                        await setAdminOperation.confirmation()
                    }
                }

            } else {

                console.log('not first governance cycle (cycle end !== 0)');

                // Start next round until new proposal round
                governanceStorage                = await governanceInstance.storage()
                var currentCycleInfoRound        = governanceStorage.currentCycleInfo.round
                var currentCycleInfoRoundString  = Object.keys(currentCycleInfoRound)[0]
    
                delegationStorage       = await delegationInstance.storage();
                // console.log(await delegationStorage.satelliteLedger.size);
    
                while(currentCycleInfoRoundString !== "proposal"){
                    var restartRound                = await governanceInstance.methods.startNextRound(false).send();
                    await restartRound.confirmation()
                    governanceStorage               = await governanceInstance.storage()
                    currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                    currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                }

                console.log("Current round: ", currentCycleInfoRoundString)
            }

            governanceProxyNodeStorage = await governanceProxyNodeInstance.storage();
            const currentProxyNodeAdmin = governanceProxyNodeStorage.admin;

            if(currentProxyNodeAdmin == bob.pkh){

                await signerFactory(bob.sk);
                const setProxyNodeAdminOperation = await governanceProxyNodeInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setProxyNodeAdminOperation.confirmation();

                governanceProxyNodeStorage = await governanceProxyNodeInstance.storage();
                const newProxyNodeAdmin = governanceProxyNodeStorage.admin;

                assert.equal(newProxyNodeAdmin, governanceProxyAddress.address);

            };

        } catch(e){
            console.dir(e, {depth:5})
        }
    });

    // ====================================================
    //
    //  Governance Proxy MAIN Lambdas Test 
    //
    // ====================================================

    describe(`
    -- -- -- -- -- -- -- -- -- -- -- -- --

    Governance Proxy MAIN Tests Start
    
    -- -- -- -- -- -- -- -- -- -- -- -- --`, async() => {
        it(``, async () => {
            try {

            } catch (e) {
                console.log(e)
            }
        })
    })

    describe("%setContractAdmin", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Set a contract admin to another address", async() => {
            try{

                // Initial values
                governanceStorage           = await governanceInstance.storage();
                governanceProxyStorage      = await governanceProxyInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initAdmin             = delegationStorage.admin;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Set contract";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setContractAdmin',
                    delegationAddress.address,
                    alice.pkh,
                ).toTransferParams();
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType  = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
    
                // pack data
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "SetAdmin#1",           // title
                    "setContractAdmin",     // entrypointName
                    packedData,             // encodedCode
                    ""                      // codeDescription
                );

                //Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endAdmin              = delegationStorage.admin;
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(initAdmin, endAdmin);
                assert.equal(endAdmin, alice.pkh);

                // Reset the contract admin
                await signerFactory(alice.sk);
                const resetAdminOperation   = await delegationInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await resetAdminOperation.confirmation()

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%setContractGovernance", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Set all contracts governance to another address (same address for the tests)", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                governanceProxyStorage      = await governanceProxyInstance.storage();
                const generalContracts      = governanceStorage.generalContracts.entries();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Set contract governance";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Set a contract governance compiled params
                const proposalData      = [];
                var generalCounter      = 0;

                for (let entry of generalContracts){
                    // Get contract storage
                    let contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    var entryName       = "Governance#"+generalCounter

                    // const name = Object.keys(entry)[entry];
                    // console.log("CONTRACT:", contract)
                    // console.log("STORAGE:", storage)
                    // console.log("ADDRESS:", entry[1])

                    // Check admin
                    if(storage.hasOwnProperty('governanceAddress')){
                        
                        // Compile params into bytes
                        var lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                            'setContractGovernance',
                            entry[1],
                            governanceAddress.address,
                        ).toTransferParams();

                        var packedDataValue = lambdaParams.parameter.value;
                        var packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
                        // pack data
                        const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                        // Add new setGovernance data
                        proposalData[generalCounter] = {
                            addOrSetProposalData: {
                                title: entryName, 
                                entrypointName: "setContractGovernance",
                                encodedCode: packedData,
                                codeDescription: ""
                            }
                        }
                        generalCounter++;
                    }
                }

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();            

                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                for (let entry of generalContracts){
                    // Get contract storage
                    let contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('governanceAddress')){
                        assert.strictEqual(storage.governanceAddress, governanceAddress.address);
                    }
                }

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%setContractLambda", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the unstake entrypoint of the doorman contract with a new exit fee calculation", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();

                const firstUserMvkBalance           = await mvkTokenStorage.ledger.get(bob.pkh);
                const initMVKTotalSupply            = mvkTokenStorage.totalSupply.toNumber();
                const initSMVKTotalSupply           = ((await mvkTokenStorage.ledger.get(doormanAddress.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress.address))).toNumber();

                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Update the unstake entrypoint of the doorman contract";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                const unstakeAmount                 = MVK(50);

                // Unstake once to calculate an exit fee and compound with both users to set the new SMVK Total Supply amount
                var unstakeOperation    = await doormanInstance.methods.unstake(unstakeAmount).send()
                await unstakeOperation.confirmation();
                var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send()
                await compoundOperation.confirmation();
                compoundOperation   = await doormanInstance.methods.compound(alice.pkh).send()
                await compoundOperation.confirmation()

                // Refresh the values and calculate the exit fee
                mvkTokenStorage                             = await mvkTokenInstance.storage();
                doormanStorage                              = await doormanInstance.storage();
                const firstRefreshedSMVKTotalSupply         = ((await mvkTokenStorage.ledger.get(doormanAddress.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress.address))).toNumber();
                const firstRefreshedUserMvkBalance          = await mvkTokenStorage.ledger.get(bob.pkh);
                const firstExitFee                          = Math.abs(firstUserMvkBalance.toNumber() + unstakeAmount - firstRefreshedUserMvkBalance.toNumber())
                // console.log("OLD UNSTAKE EXIT FEE: ", firstExitFee);
                // console.log("INIT SMVK: ", initSMVKTotalSupply);
                // console.log("NEW SMVK: ", firstRefreshedSMVKTotalSupply);

                // Stake MVK for later use (calculate next exit fee)
                const restakeAmount             = Math.abs(firstRefreshedSMVKTotalSupply - initSMVKTotalSupply);
                // console.log("NEW STAKE AMOUNT: ", restakeAmount);

                var stakeOperation              = await doormanInstance.methods.stake(restakeAmount).send()
                await stakeOperation.confirmation();

                // Refreshed values
                mvkTokenStorage                             = await mvkTokenInstance.storage();
                doormanStorage                              = await doormanInstance.storage();
                const secondRefreshedMVKTotalSupply         = mvkTokenStorage.totalSupply.toNumber();
                const secondRefreshedSMVKTotalSupply        = ((await mvkTokenStorage.ledger.get(doormanAddress.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress.address))).toNumber();
                
                // Assertions
                assert.equal(initMVKTotalSupply, secondRefreshedMVKTotalSupply);
                assert.equal(initSMVKTotalSupply, secondRefreshedSMVKTotalSupply);


                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setContractLambda',
                    doormanAddress.address,
                    'lambdaUnstake',
                    doormanLambdas['lambdaNewUnstake']
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "SetContractLambda#1",   // title
                    "setContractLambda",     // entrypointName
                    packedData,              // encodedCode
                    ""                      // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                
                // Try the new unstake entrypoint with the updated exit fee reward calculation
                mvkTokenStorage                             = await mvkTokenInstance.storage();
                doormanStorage                              = await doormanInstance.storage();
                const preUnstakeUserMVKBalance              = await mvkTokenStorage.ledger.get(bob.pkh)

                var unstakeOperation    = await doormanInstance.methods.unstake(unstakeAmount).send()
                await unstakeOperation.confirmation();
                var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send()
                await compoundOperation.confirmation();
                compoundOperation   = await doormanInstance.methods.compound(alice.pkh).send()
                await compoundOperation.confirmation()

                // Refresh the values and calculate the exit fee
                mvkTokenStorage                             = await mvkTokenInstance.storage();
                doormanStorage                              = await doormanInstance.storage();
                const finalRefreshedUserMvkBalance          = await mvkTokenStorage.ledger.get(bob.pkh);
                const finalExitFee                          = Math.abs(preUnstakeUserMVKBalance.toNumber() + unstakeAmount - finalRefreshedUserMvkBalance.toNumber())
                // console.log("FINAL EXIT FEE: ", finalExitFee)
                assert.notEqual(finalExitFee, firstExitFee)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%setFactoryProductLambda", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Use the deposit entrypoint of the farm contract as the withdraw entrypoint (set from the FarmFactory contract)", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                farmFactoryStorage                  = await farmFactoryInstance.storage();
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setFactoryProductLambda',
                    farmFactoryAddress.address,
                    'lambdaWithdraw',
                    farmFactoryStorage.farmLambdaLedger.get("lambdaDeposit")
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "SetFactoryProductLambda#1",    // title
                    "setFactoryProductLambda",      // entrypointName
                    packedData,                     // encodedCode
                    ""                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.equal(farmFactoryStorage.farmLambdaLedger.get("lambdaDeposit"), farmFactoryStorage.farmLambdaLedger.get("lambdaWithdraw"))
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateContractWhitelistMap", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Add a new address to the delegation contract whitelist map", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initWhitelist         = delegationStorage.whitelistContracts;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update whitelist";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // generate random key for re-running test
                const randomNumber = Math.floor(Math.random() * 1000000);
                const randomKey  = "bob" + randomNumber;

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateContractWhitelistMap',
                    delegationAddress.address,
                    randomKey,
                    bob.pkh
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "UpdateContractWhitelistMap#1",  // title
                    "updateContractWhitelistMap",    // entrypointName
                    packedData,                      // encodedCode
                    ""                               // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endWhitelist          = delegationStorage.whitelistContracts;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endWhitelist.size, initWhitelist.size);
                assert.strictEqual(endWhitelist.get(randomKey), bob.pkh);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateContractWhitelistTokenMap", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Add a new token to the treasury factory contract whitelist tokens map", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const initWhitelist         = await treasuryFactoryStorage.whitelistTokenContracts;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update whitelist tokens";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // generate random key for re-running test
                const randomNumber = Math.floor(Math.random() * 1000000);
                const randomKey    = "bob" + randomNumber;

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateContractWhitelistTokenMap',
                    treasuryFactoryAddress.address,
                    randomKey,
                    bob.pkh
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "UpdateContractWhitelistTokenMap#1",  // title
                    "updateContractWhitelistTokenMap",    // entrypointName
                    packedData,                      // encodedCode
                    ""                               // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const endWhitelist          = await treasuryFactoryStorage.whitelistTokenContracts;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endWhitelist.size, initWhitelist.size);
                assert.strictEqual(endWhitelist.get(randomKey), bob.pkh);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateWhitelistDevelopersSet", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Add a new developer to the governance developers set", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const initWhitelist         = governanceStorage.whitelistDevelopers;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update whitelist developers";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateWhitelistDevelopersSet',
                    trudy.pkh
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "updateWhitelistDevelopersSet#1",              // title
                    "updateWhitelistDevelopersSet",     // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endWhitelist          = governanceStorage.whitelistDevelopers;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endWhitelist.length, initWhitelist.length);
                assert.equal(endWhitelist.includes(trudy.pkh), true);
                assert.equal(initWhitelist.includes(trudy.pkh), false);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    // describe("%setGovernanceProxy", async() => {

    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Set governance proxy to another address", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             governanceProxyStorage      = await governanceProxyInstance.storage();

    //             const newGovProxyAddress    = trudy.pkh;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Set contract governance proxy";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Compile params into bytes
    //             const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'setGovernanceProxy',
    //                 newGovProxyAddress
    //             ).toTransferParams();
                
    //             const packedDataValue = lambdaParams.parameter.value;
    //             const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
    //             const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

    //             // create proposal data
    //             const proposalData = sharedTestHelper.createProposalData(
    //                 "Data to set Governance Proxy",     // title
    //                 "setGovernanceProxy",               // entrypointName
    //                 packedData,                         // encodedCode
    //                 ""                                  // codeDescription
    //             );

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
    //             await proposeOperation.confirmation();            

    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();

    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage               = await governanceInstance.storage();
    //             const endGovernanceProxyAddress = governanceStorage.governanceProxyAddress;
    //             const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                
    //             // Assertions
    //             assert.strictEqual(proposal.executed, true);
    //             assert.equal(endGovernanceProxyAddress, newGovProxyAddress); 

    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })

    //     it("Scenario - Reset governance proxy address", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             governanceProxyStorage      = await governanceProxyInstance.storage();

    //             const newGovProxyAddress    = governanceProxyAddress.address;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Set contract governance proxy";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Compile params into bytes
    //             const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'setGovernanceProxy',
    //                 newGovProxyAddress
    //             ).toTransferParams();
                
    //             const packedDataValue = lambdaParams.parameter.value;
    //             const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
    //             const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

    //             // create proposal data
    //             const proposalData = sharedTestHelper.createProposalData(
    //                 "Data to set Governance Proxy",     // title
    //                 "setGovernanceProxy",               // entrypointName
    //                 packedData,                         // encodedCode
    //                 ""                                  // codeDescription
    //             );

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
    //             await proposeOperation.confirmation();            

    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();

    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage               = await governanceInstance.storage();
    //             const endGovernanceProxyAddress = governanceStorage.governanceProxyAddress;
    //             const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                
    //             // Assertions
    //             assert.strictEqual(proposal.executed, true);
    //             assert.equal(endGovernanceProxyAddress, newGovProxyAddress); 

    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    
    // })



    describe("%createFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Creation of a single farm", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const farmMetadataBase = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK PLENTY-USDTz Farm',
                    description: 'MAVRYK Farm Contract',
                    version: 'v1.0.0',
                    liquidityPairToken: {
                        tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
                        origin: ['Plenty'],
                        token0: {
                            symbol: ['PLENTY'],
                            tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
                        },
                        token1: {
                            symbol: ['USDtz'],
                            tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
                        }
                    },
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                ).toString('hex')

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createFarm',
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase,
                    mavrykFa12TokenAddress.address,
                    0,
                    "fa12",
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Create a new Farm",    // title
                    "createFarm",                   // entrypointName
                    packedData,                     // encodedCode
                    ""                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
                // Assertions
                // console.log("TRACKED FARMS: ", endTrackedFarms);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
                aTrackedFarm    = endTrackedFarms[0]
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Creation of multiple farms (stress test)", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create multiple farms";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const farmMetadataBase = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK PLENTY-USDTz Farm',
                    description: 'MAVRYK Farm Contract',
                    version: 'v1.0.0',
                    liquidityPairToken: {
                        tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
                        origin: ['Plenty'],
                        token0: {
                            symbol: ['PLENTY'],
                            tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
                        },
                        token1: {
                            symbol: ['USDtz'],
                            tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
                        }
                    },
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                ).toString('hex')

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createFarm',
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase,
                    mavrykFa12TokenAddress.address,
                    0,
                    "fa12",
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                const lambdaParamsTwo = governanceProxyInstance.methods.dataPackingHelper(
                    'createFarm',
                    "testFarmTwo",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase,
                    mavrykFa12TokenAddress.address,
                    0,
                    "fa12",
                ).toTransferParams();

                const packedDataValueTwo = lambdaParamsTwo.parameter.value;
                const packedDataTwo = await sharedTestHelper.packData(rpc, packedDataValueTwo, packedDataType);

                const proposalData      = [
                    {
                        addOrSetProposalData: {
                            title: "Data To Create First Farm",
                            entrypointName: "createFarm",
                            encodedCode: packedData,
						    codeDescription: ""
                        }
                    },
                    {
                        addOrSetProposalData: {
                            title: "Data To Create Second Farm",
                            entrypointName: "createFarm",
                            encodedCode: packedDataTwo,
						    codeDescription: ""
                        }
                    }
                ];
                

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Start Next Round
                nextRoundOperation          = await governanceInstance.methods.startNextRound(false).send();
                await nextRoundOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound(false).send();
                await nextRoundOperation.confirmation();

                // const executeOperation = await governanceInstance.methods.executeProposal(proposalId).send();
                // await executeOperation.confirmation();

                let processProposalSingleData
                processProposalSingleData =  await governanceInstance.methods.processProposalSingleData(proposalId).send();
                await processProposalSingleData.confirmation();

                processProposalSingleData =  await governanceInstance.methods.processProposalSingleData(proposalId).send();
                await processProposalSingleData.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedFarms       = await farmFactoryStorage.trackedFarms;

                // Assertions
                // console.log("TRACKED FARMS: ", endTrackedFarms);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

    })


    describe("%createTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Creation of a single treasury and send MVK to a user through payment data", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create a treasury";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const treasuryMetadataBase = Buffer.from(
                JSON.stringify({
                    name: 'MAVRYK PLENTY-USDTz Farm',
                    description: 'MAVRYK Farm Contract',
                    version: 'v1.0.0',
                    liquidityPairToken: {
                    tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
                    origin: ['Plenty'],
                    token0: {
                        symbol: ['PLENTY'],
                        tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
                    },
                    token1: {
                        symbol: ['USDtz'],
                        tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
                    }
                    },
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                }),
                'ascii',
                ).toString('hex')
                    
                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createTreasury',
                    "testTreasuryPropoposal",
                    false,
                    treasuryMetadataBase
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Create a new Treasury",    // title
                    "createTreasury",                   // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Mid values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
                // Assertions
                // console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
                aTrackedTreasury    = endtrackedTreasuries[0];

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Creation of multiple treasuries", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create a treasury";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const treasuryMetadataBase = Buffer.from(
                JSON.stringify({
                    name: 'MAVRYK PLENTY-USDTz Farm',
                    description: 'MAVRYK Farm Contract',
                    version: 'v1.0.0',
                    liquidityPairToken: {
                    tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
                    origin: ['Plenty'],
                    token0: {
                        symbol: ['PLENTY'],
                        tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
                    },
                    token1: {
                        symbol: ['USDtz'],
                        tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
                    }
                    },
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                }),
                'ascii',
                ).toString('hex')
                    
                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createTreasury',
                    "testTreasuryPropo",
                    false,
                    treasuryMetadataBase
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                const proposalData      = [
                    {
                        addOrSetProposalData: {
                            title: "Data To Create First Treasury",
                            entrypointName: "createTreasury",
                            encodedCode: packedData,
						    codeDescription: ""
                        }
                    },
                    {
                        addOrSetProposalData: {
                            title: "Data To Create Second Treasury",
                            entrypointName: "createTreasury",
                            encodedCode: packedData,
						    codeDescription: ""
                        }
                    }
                ];

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                const nextRoundParam        = await governanceInstance.methods.startNextRound(true).toTransferParams();
                const estimate              = await utils.tezos.estimate.transfer(nextRoundParam);
                // console.log("ESTIMATION: ", estimate)

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
                // Assertions
                // console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%createAggregator", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Creation of a single aggregator", async() => {
            try{
                // Initial values
                governanceStorage               = await governanceInstance.storage();
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                const inittrackedAggregators    = await aggregatorFactoryStorage.trackedAggregators;
                const proposalId                = governanceStorage.nextProposalId.toNumber();
                const proposalName              = "Create an aggregator";
                const proposalDesc              = "Details about new proposal";
                const proposalIpfs              = "ipfs://QM123456789";
                const proposalSourceCode        = "Proposal Source Code";

                // generate random key for re-running test
                const randomNumber = Math.floor(Math.random() * 1000000);
                const randomAggregatorName  = "USDBTC" + randomNumber;

                const oracleMap = MichelsonMap.fromLiteral({
                    [bob.pkh]              : {
                                                oraclePublicKey: bob.pk,
                                                oraclePeerId: bob.peerId
                                            },
                    [eve.pkh]              : {
                                                oraclePublicKey: eve.pk,
                                                oraclePeerId: eve.peerId
                                            },
                    [mallory.pkh]          : {
                                                oraclePublicKey: mallory.pk,
                                                oraclePeerId: mallory.peerId
                                            },
                    [oracleMaintainer.pkh] : {
                                                oraclePublicKey: oracleMaintainer.pk,
                                                oraclePeerId: oracleMaintainer.peerId
                                            },
                });
                  
                const aggregatorMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'MAVRYK Aggregator Contract',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                    ).toString('hex')
                    
                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createAggregator',
    
                    randomAggregatorName,
                    true,
                    
                    oracleMap,
    
                    new BigNumber(16),            // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
                    
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds

                    new BigNumber(10000000),      // rewardAmountStakedMvk
                    new BigNumber(1300),          // rewardAmountXtz
                    
                    aggregatorMetadataBase        // metadata
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Create An Aggregator",    // title
                    "createAggregator",                // entrypointName
                    packedData,                        // encodedCode
                    ""                                 // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Mid values
                governanceStorage               = await governanceInstance.storage();
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                const endtrackedAggregators     = await aggregatorFactoryStorage.trackedAggregators;
                const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedAggregators.length, inittrackedAggregators.length);
                aTrackedAggregator = endtrackedAggregators[0];
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Creation of multiple aggregators", async() => {
            try{
                // Initial values
                governanceStorage               = await governanceInstance.storage();
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                const inittrackedAggregators    = await aggregatorFactoryStorage.trackedAggregators;
                const proposalId                = governanceStorage.nextProposalId.toNumber();
                const proposalName              = "Create an aggregator";
                const proposalDesc              = "Details about new proposal";
                const proposalIpfs              = "ipfs://QM123456789";
                const proposalSourceCode        = "Proposal Source Code";

                // generate random key for re-running test
                const randomNumber              = Math.floor(Math.random() * 1000000);
                const randomAggregatorName      = "USDBTC" + randomNumber;
                const randomAggregatorNameTwo   = "USDETH" + randomNumber;

                const oracleMap = MichelsonMap.fromLiteral({
                    [bob.pkh]              : {
                                                oraclePublicKey: bob.pk,
                                                oraclePeerId: bob.peerId
                                            },
                    [eve.pkh]              : {
                                                oraclePublicKey: eve.pk,
                                                oraclePeerId: eve.peerId
                                            },
                    [mallory.pkh]          : {
                                                oraclePublicKey: mallory.pk,
                                                oraclePeerId: mallory.peerId
                                            },
                    [oracleMaintainer.pkh] : {
                                                oraclePublicKey: oracleMaintainer.pk,
                                                oraclePeerId: oracleMaintainer.peerId
                                            },
                });
                  
                const aggregatorMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'MAVRYK Aggregator Contract',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                    ).toString('hex')
                    
                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createAggregator',
    
                    randomAggregatorName,
                    true,
                    
                    oracleMap,
    
                    new BigNumber(16),            // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
                    
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds

                    new BigNumber(10000000),      // rewardAmountStakedMvk
                    new BigNumber(1300),          // rewardAmountXtz
                    
                    aggregatorMetadataBase        // metadata
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Compile params into bytes
                const lambdaParamsTwo = governanceProxyInstance.methods.dataPackingHelper(
                    'createAggregator',
    
                    randomAggregatorNameTwo,
                    true,
                    
                    oracleMap,
    
                    new BigNumber(16),            // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
                    
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds

                    new BigNumber(10000000),      // rewardAmountStakedMvk
                    new BigNumber(1300),          // rewardAmountXtz
                    
                    aggregatorMetadataBase        // metadata
                ).toTransferParams();
                
                const packedDataValueTwo = lambdaParamsTwo.parameter.value;
                const packedDataTwo = await sharedTestHelper.packData(rpc, packedDataValueTwo, packedDataType);

                const proposalData      = [
                    {
                        addOrSetProposalData: {
                            title: "Data To Create First Aggregator",
                            entrypointName: "createAggregator",
                            encodedCode: packedData,
						    codeDescription: ""
                        }
                    },
                    {
                        addOrSetProposalData: {
                            title: "Data To Create Second Aggregator",
                            entrypointName: "createAggregator",
                            encodedCode: packedDataTwo,
						    codeDescription: ""
                        }
                    }
                ];

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Mid values
                governanceStorage               = await governanceInstance.storage();
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                const endtrackedAggregators     = await aggregatorFactoryStorage.trackedAggregators;
                const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedAggregators.length, inittrackedAggregators.length);
                aTrackedAggregator = endtrackedAggregators[0];
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })



    describe("%pauseAllContractEntrypoint", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses all the doorman entrypoints", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const initBreakGlass        = doormanStorage.breakGlassConfig;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses all entrypoints";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // console.log("BREAK GLASS CONFIG BEFORE: ", initBreakGlass)

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'pauseAllContractEntrypoint',
                    doormanAddress.address
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "pauseEntrypoint#1",              // title
                    "pauseAllContractEntrypoint",     // entrypointName
                    packedData,                       // encodedCode
                    ""                                // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const endBreakGlass         = doormanStorage.breakGlassConfig;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endBreakGlass, initBreakGlass);
                // console.log("BREAK GLASS CONFIG AFTER: ", endBreakGlass)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%unpauseAllContractEntrypoint", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Unpauses all the doorman entrypoints", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const initBreakGlass        = doormanStorage.breakGlassConfig;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpauses all entrypoints";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // console.log("BREAK GLASS CONFIG BEFORE: ", initBreakGlass)

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'unpauseAllContractEntrypoint',
                    doormanAddress.address
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "unpauseEntrypoint#1",              // title
                    "unpauseAllContractEntrypoint",     // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const endBreakGlass         = doormanStorage.breakGlassConfig;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endBreakGlass, initBreakGlass);
                // console.log("BREAK GLASS CONFIG AFTER: ", endBreakGlass)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%toggleDoormanEntrypoint", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the doorman stake entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const initPaused            = doormanStorage.breakGlassConfig.stakeIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses stake";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleDoormanEntrypoint',
                    'stake',
                    true
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "toggleDoormanEntrypoint#1",    // title
                    "toggleDoormanEntrypoint",      // entrypointName
                    packedData,                     // encodedCode
                    ""                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const endPaused             = doormanStorage.breakGlassConfig.stakeIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })


        it("Scenario - Reset pause for the doorman stake entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const initPaused            = doormanStorage.breakGlassConfig.stakeIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpauses stake";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleDoormanEntrypoint',
                    'stake',
                    false
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "toggleDoormanEntrypoint#1",    // title
                    "toggleDoormanEntrypoint",      // entrypointName
                    packedData,                     // encodedCode
                    ""                              // codeDescription
                );
                
                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const endPaused             = doormanStorage.breakGlassConfig.stakeIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%toggleDelegationEntrypoint", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the delegation registerAsSatellite entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initPaused            = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses registerAsSatellite";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleDelegationEntrypoint',
                    'registerAsSatellite',
                    true
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "toggleDelegationEntrypoint#1",    // title
                    "toggleDelegationEntrypoint",      // entrypointName
                    packedData,                        // encodedCode
                    ""                                 // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endPaused             = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Reset pause for the delegation registerAsSatellite entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initPaused            = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpauses registerAsSatellite";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleDelegationEntrypoint',
                    'registerAsSatellite',
                    false
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "toggleDelegationEntrypoint#1",    // title
                    "toggleDelegationEntrypoint",      // entrypointName
                    packedData,                        // encodedCode
                    ""                                 // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endPaused             = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%toggleAggregatorEntrypoint", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the aggregator updateData entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                aggregatorStorage           = await aggregatorInstance.storage();
                const initPaused            = aggregatorStorage.breakGlassConfig.updateDataIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses updateData";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleAggregatorEntrypoint',
                    aggregatorAddress.address,
                    'updateData',
                    true
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Pause Aggregator Entrypoint",      // title
                    "toggleAggregatorEntrypoint",               // entrypointName
                    packedData,                                 // encodedCode
                    ""                                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aggregatorStorage           = await aggregatorInstance.storage();
                const endPaused             = aggregatorStorage.breakGlassConfig.updateDataIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%toggleAggregatorFactoryEntrypoint", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the aggregator factory createAggregator entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const initPaused            = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses createAggregator";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleAggregatorFacEntrypoint',
                    'createAggregator',
                    true
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Unpause Aggregator Entrypoint",    // title
                    "toggleAggregatorFacEntrypoint",            // entrypointName
                    packedData,                                 // encodedCode
                    ""                                          // codeDescription
                );
            
                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const endPaused             = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Reset pause for aggregator factory createAggregator entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const initPaused            = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpause createAggregator";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleAggregatorFacEntrypoint',
                    'createAggregator',
                    false
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to UnPause Aggregator Factory Entrypoint",    // title
                    "toggleAggregatorFacEntrypoint",                    // entrypointName
                    packedData,                                         // encodedCode
                    ""                                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const endPaused             = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%toggleFarmEntrypoint", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the farm deposit entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const initPaused            = farmStorage.breakGlassConfig.depositIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses deposit";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleFarmEntrypoint',
                    farmAddress.address,
                    'deposit',
                    true
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to pause farm entrypoint",    // title
                    "toggleFarmEntrypoint",             // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const endPaused             = farmStorage.breakGlassConfig.depositIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Reset pause for the farm deposit entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const initPaused            = farmStorage.breakGlassConfig.depositIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpause deposit";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleFarmEntrypoint',
                    farmAddress.address,
                    'deposit',
                    false
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Unpause farm entrypoint",  // title
                    "toggleFarmEntrypoint",             // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const endPaused             = farmStorage.breakGlassConfig.depositIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%toggleFarmFactoryEntrypoint", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the farm factory createFarm entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initPaused            = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses createFarm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleFarmFacEntrypoint',
                    'createFarm',
                    true
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to pause farm factory entrypoint",    // title
                    "toggleFarmFacEntrypoint",                  // entrypointName
                    packedData,                                 // encodedCode
                    ""                                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const endPaused             = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Reset pause for the farm factory createFarm entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initPaused            = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpauses createFarm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleFarmFacEntrypoint',
                    'createFarm',
                    false
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to unpause farm factory entrypoint",  // title
                    "toggleFarmFacEntrypoint",                  // entrypointName
                    packedData,                                 // encodedCode
                    ""                                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const endPaused             = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })



    describe("%toggleTreasuryEntrypoint", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the treasury mintMvkAndTransfer entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                const initPaused            = treasuryStorage.breakGlassConfig.mintMvkAndTransferIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses mintMvkAndTransfer";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleTreasuryEntrypoint',
                    treasuryAddress.address,
                    'mintMvkAndTransfer',
                    true
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Pause Treasury Entrypoint#1",    // title
                    "toggleTreasuryEntrypoint",      // entrypointName
                    packedData,                      // encodedCode
                    ""                               // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                const endPaused             = treasuryStorage.breakGlassConfig.mintMvkAndTransferIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Reset pause for the treasury mintMvkAndTransfer entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                const initPaused            = treasuryStorage.breakGlassConfig.mintMvkAndTransferIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpause mintMvkAndTransfer";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleTreasuryEntrypoint',
                    treasuryAddress.address,
                    'mintMvkAndTransfer',
                    false
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Unpause Treasury Entrypoint#1",    // title
                    "toggleTreasuryEntrypoint",      // entrypointName
                    packedData,                      // encodedCode
                    ""                               // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                const endPaused             = treasuryStorage.breakGlassConfig.mintMvkAndTransferIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%toggleTreasuryFactoryEntrypoint", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the treasury factory createTreasury entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const initPaused            = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses createTreasury";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleTreasuryFacEntrypoint',
                    'createTreasury',
                    true
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Pause Treasury Factory Entrypoint#1",    // title
                    "toggleTreasuryFacEntrypoint",      // entrypointName
                    packedData,                      // encodedCode
                    ""                               // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const endPaused             = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Reset pause for the treasury factory createTreasury entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const initPaused            = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpauses createTreasury";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleTreasuryFacEntrypoint',
                    'createTreasury',
                    false
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Unpause Treasury Factory Entrypoint",    // title
                    "toggleTreasuryFacEntrypoint",                    // entrypointName
                    packedData,                                       // encodedCode
                    ""                                                // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const endPaused             = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%toggleVaultFactoryEntrypoint", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the vault factory createVault entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const initPaused            = vaultFactoryStorage.breakGlassConfig.createVaultIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses createVault";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleVaultFacEntrypoint',
                    'createVault',
                    true
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Pause Vault Factory Entrypoint#1",     // title
                    "toggleVaultFacEntrypoint",             // entrypointName
                    packedData,                             // encodedCode
                    ""                                      // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const endPaused             = vaultFactoryStorage.breakGlassConfig.createVaultIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Reset pause for the vault factory createVault entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const initPaused            = vaultFactoryStorage.breakGlassConfig.createVaultIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpauses createVault";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleVaultFacEntrypoint',
                    'createVault',
                    false
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Unpause Vault Factory Entrypoint",     // title
                    "toggleVaultFacEntrypoint",                     // entrypointName
                    packedData,                                     // encodedCode
                    ""                                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const endPaused             = vaultFactoryStorage.breakGlassConfig.createVaultIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%toggleLendingContEntrypoint", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Pauses the lending controller addLiquidity entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const initPaused            = lendingControllerStorage.breakGlassConfig.addLiquidityIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Pauses addLiquidity";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleLendingContEntrypoint',
                    'addLiquidity',
                    true
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Pause Lending Controller Entrypoint#1",    // title
                    "toggleLendingContEntrypoint",              // entrypointName
                    packedData,                                 // encodedCode
                    ""                                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const endPaused             = lendingControllerStorage.breakGlassConfig.addLiquidityIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, true);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Reset pause for the lending controller addLiquidity entrypoint", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const initPaused            = lendingControllerStorage.breakGlassConfig.addLiquidityIsPaused;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Unpauses addLiquidity";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleLendingContEntrypoint',
                    'addLiquidity',
                    false
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Unpause Lending Controller Entrypoint#1",      // title
                    "toggleLendingContEntrypoint",                          // entrypointName
                    packedData,                                             // encodedCode
                    ""                                                      // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const endPaused             = lendingControllerStorage.breakGlassConfig.addLiquidityIsPaused;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endPaused, initPaused);
                assert.equal(endPaused, false);
                
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%transferTreasury", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Transfer MVK from a treasury to a user address", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                treasuryStorage                     = await treasuryInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const initUserBalance               = await mvkTokenStorage.ledger.get(bob.pkh);
                const initTreasuryBalance           = await mvkTokenStorage.ledger.get(treasuryAddress.address);
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Transfer MVK";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'transferTreasury',
                    treasuryAddress.address,
                    [
                        {
                            "to_"    : bob.pkh,
                            "token"  : {
                                "fa2" : {
                                    "tokenContractAddress" : mvkTokenAddress.address,
                                    "tokenId" : 0
                                }
                            },
                            "amount" : MVK(10)
                        }
                    ]
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data for Transfer Treasury",    // title
                    "transferTreasury",              // entrypointName
                    packedData,                      // encodedCode
                    ""                               // codeDescription
                );
                

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const endUserBalance        = await mvkTokenStorage.ledger.get(bob.pkh);
                const endTreasuryBalance    = await mvkTokenStorage.ledger.get(treasuryAddress.address);
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endUserBalance.toNumber(), initUserBalance.toNumber());
                assert.notEqual(endTreasuryBalance.toNumber(), initTreasuryBalance.toNumber());
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%mintMvkAndTransferTreasury", async() => {
        
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Mint and Transfer MVK from a treasury to a user address", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                treasuryStorage                     = await treasuryInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const initMVKTotalSupply            = mvkTokenStorage.totalSupply; 
                const initUserBalance               = await mvkTokenStorage.ledger.get(bob.pkh);
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Transfer MVK";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'mintMvkAndTransferTreasury',
                    treasuryAddress.address,
                    bob.pkh,
                    MVK(100)
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data for Mint MVK and Transfer Treasury",  // title
                    "mintMvkAndTransferTreasury",               // entrypointName
                    packedData,                                 // encodedCode
                    ""                                          // codeDescription
                );
                
                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const endMVKTotalSupply     = mvkTokenStorage.totalSupply; 
                const endUserBalance        = await mvkTokenStorage.ledger.get(bob.pkh);
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endUserBalance.toNumber(), initUserBalance.toNumber());
                assert.equal(initUserBalance.toNumber() + MVK(100), endUserBalance.toNumber());
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateMvkInflationRate", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the Mvk Inflation rate", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const initMVKInflationRate  = mvkTokenStorage.inflationRate;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update MVK Inflation Rate";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Untrack a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateMvkInflationRate',
                    700
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data for Updating MVK Inflation Rate",  // title
                    "updateMvkInflationRate",                // entrypointName
                    packedData,                              // encodedCode
                    ""                                       // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endMVKInflationRate   = mvkTokenStorage.inflationRate;
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endMVKInflationRate, initMVKInflationRate);
                assert.equal(endMVKInflationRate, 700);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%addVestee", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Create a new vestee", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                vestingStorage                      = await vestingInstance.storage();
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";
                const cliffInMonths                 = 0;
                const vestingInMonths               = 24;
                const vesteeAddress                 = eve.pkh;
                const totalAllocated                = MVK(20000000);

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'addVestee',
                    vesteeAddress, 
                    totalAllocated, 
                    cliffInMonths, 
                    vestingInMonths
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Add New Veste",    // title
                    "addVestee",                // entrypointName
                    packedData,                 // encodedCode
                    ""                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                vestingStorage              = await vestingInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const vestee                = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.equal(vestee.totalAllocatedAmount, totalAllocated)
                assert.equal(vestee.cliffMonths, cliffInMonths)
                assert.equal(vestee.vestingMonths, vestingInMonths)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateVestee", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the previously created vestee", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                vestingStorage                      = await vestingInstance.storage();
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";
                const cliffInMonths                 = 2;
                const vestingInMonths               = 12;
                const vesteeAddress                 = eve.pkh;
                const totalAllocated                = MVK(40000000);

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateVestee',
                    vesteeAddress, 
                    totalAllocated, 
                    cliffInMonths, 
                    vestingInMonths
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Vestee",    // title
                    "updateVestee",             // entrypointName
                    packedData,                 // encodedCode
                    ""                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                vestingStorage              = await vestingInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const vestee                = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.equal(vestee.totalAllocatedAmount, totalAllocated)
                assert.equal(vestee.cliffMonths, cliffInMonths)
                assert.equal(vestee.vestingMonths, vestingInMonths)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%toggleVesteeLock", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Lock the previously created vestee", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                vestingStorage                      = await vestingInstance.storage();
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";
                const vesteeAddress                 = eve.pkh;

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'toggleVesteeLock',
                    vesteeAddress
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data To Toggle Vestee Lock",       // title
                    "toggleVesteeLock",                 // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                vestingStorage              = await vestingInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const vestee                = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.strictEqual(vestee.status, "LOCKED")
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%removeVestee", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Remove the previously created vestee", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                vestingStorage                      = await vestingInstance.storage();
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";
                const vesteeAddress                 = eve.pkh;

                // Compile params into bytes
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'removeVestee',
                    vesteeAddress
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Remove Vestee",    // title
                    "removeVestee",             // entrypointName
                    packedData,                 // encodedCode
                    ""                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                vestingStorage              = await vestingInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const vestee                = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.strictEqual(vestee, undefined)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%setLoanToken", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Set Loan Token on the Lending Controller (Create New Loan Token)", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Lending Controller %setLoanToken";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const setLoanTokenActionType                = "createLoanToken";
                const tokenName                             = "mockLoanToken";
                const tokenContractAddress                  = mockFa12TokenAddress.address;
                const tokenType                             = "fa12";
                const tokenDecimals                         = 6;

                const oracleAddress                         = mockUsdMockFa12TokenAggregatorAddress.address;

                const lpTokenContractAddress                = lpTokenPoolMockFa12TokenAddress.address;
                const lpTokenId                             = 0;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 3000; // 30% reserves (4 decimals)
                const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setLoanToken',
                    
                    setLoanTokenActionType,

                    tokenName,
                    tokenDecimals,

                    oracleAddress,

                    lpTokenContractAddress,
                    lpTokenId,
                    
                    reserveRatio,
                    optimalUtilisationRate,
                    baseInterestRate,
                    maxInterestRate,
                    interestRateBelowOptimalUtilisation,
                    interestRateAboveOptimalUtilisation,

                    minRepaymentAmount,

                    // fa12 token type - token contract address
                    tokenType,
                    tokenContractAddress,
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to set loan token",    // title
                    "setLoanToken",              // entrypointName
                    packedData,                  // encodedCode
                    ""                           // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const mockLoanToken         = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                // Assertions
                assert.strictEqual(proposal.executed, true);

                assert.equal(mockLoanToken.tokenName              , tokenName);

                assert.equal(mockLoanToken.lpTokensTotal          , 0);
                assert.equal(mockLoanToken.lpTokenContractAddress , lpTokenContractAddress);
                assert.equal(mockLoanToken.lpTokenId              , 0);

                assert.equal(mockLoanToken.reserveRatio           , reserveRatio);
                assert.equal(mockLoanToken.tokenPoolTotal         , 0);
                assert.equal(mockLoanToken.totalBorrowed          , 0);
                assert.equal(mockLoanToken.totalRemaining         , 0);

                assert.equal(mockLoanToken.optimalUtilisationRate , optimalUtilisationRate);
                assert.equal(mockLoanToken.baseInterestRate       , baseInterestRate);
                assert.equal(mockLoanToken.maxInterestRate        , maxInterestRate);
                
                assert.equal(mockLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                assert.equal(mockLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

                assert.equal(mockLoanToken.minRepaymentAmount       , minRepaymentAmount);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Set Loan Token on the Lending Controller (Update Loan Token)", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Lending Controller %setLoanToken";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const setLoanTokenActionType                   = "updateLoanToken";
                
                const tokenName                                = "mockLoanToken";
                const interestRateDecimals                     = 27;
                
                const newOracleAddress                         = mockUsdMockFa2TokenAggregatorAddress.address;

                const newReserveRatio                          = 2000; // 20% reserves (4 decimals)
                const newOptimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));   // 50% utilisation rate kink
                const newBaseInterestRate                      = 10  * (10 ** (interestRateDecimals - 2));  // 5%
                const newMaxInterestRate                       = 50 * (10 ** (interestRateDecimals - 2));  // 25% 
                const newInterestRateBelowOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 10% 
                const newInterestRateAboveOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 20%
                const newMinRepaymentAmount                    = 20000;
                const isPaused                                 = true;


                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setLoanToken',
                    
                    setLoanTokenActionType,
                    
                    tokenName,

                    newOracleAddress,
                    
                    newReserveRatio,
                    newOptimalUtilisationRate,
                    newBaseInterestRate,
                    newMaxInterestRate,
                    newInterestRateBelowOptimalUtilisation,
                    newInterestRateAboveOptimalUtilisation,
                    newMinRepaymentAmount,

                    isPaused

                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to update loan token", // title
                    "setLoanToken",              // entrypointName
                    packedData,                  // encodedCode
                    ""                           // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const mockLoanToken         = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                // Assertions
                assert.strictEqual(proposal.executed, true);

                assert.equal(mockLoanToken.tokenName      , tokenName);
                assert.equal(mockLoanToken.isPaused       , isPaused);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%setCollateralToken", async() => {

        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Set Collateral Token on the Lending Controller (Create New Collateral Token)", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Lending Controller %setCollateralToken";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const setCollateralTokenActionType      = "createCollateralToken";

                const tokenName                         = "mockCollateralToken";
                const tokenContractAddress              = mockFa12TokenAddress.address;
                const tokenType                         = "fa12";

                const tokenDecimals                     = 6;
                const oracleAddress                     = mockUsdMockFa12TokenAggregatorAddress.address;
                const tokenProtected                    = false;
                
                const isScaledToken                     = false;
                const isStakedToken                     = false;
                const stakingContractAddress            = null;
                
                const maxDepositAmount                  = null;

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setCollateralToken',
                    
                    setCollateralTokenActionType,

                    tokenName,
                    tokenContractAddress,
                    tokenDecimals,

                    oracleAddress,
                    tokenProtected,
                    
                    isScaledToken,
                    isStakedToken,
                    stakingContractAddress,

                    maxDepositAmount,

                    // fa12 token type - token contract address
                    tokenType,
                    tokenContractAddress,

                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to set collateral token",     // title
                    "setCollateralToken",               // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const mockCollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // Assertions
                assert.strictEqual(proposal.executed, true);

                assert.equal(mockCollateralToken.tokenName              , tokenName);
                assert.equal(mockCollateralToken.tokenDecimals          , tokenDecimals);
                assert.equal(mockCollateralToken.oracleAddress          , oracleAddress);
                assert.equal(mockCollateralToken.protected              , tokenProtected);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Set Collateral Token on the Lending Controller (Update Collateral Token)", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Lending Controller %setCollateralToken";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const setCollateralTokenActionType      = "updateCollateralToken";

                const tokenName                         = "mockCollateralToken";
                
                const newOracleAddress                  = mockUsdMockFa2TokenAggregatorAddress.address;
                const stakingContractAddress            = null;
                const maxDepositAmount                  = null;
                const isPaused                          = false;

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setCollateralToken',
                    
                    setCollateralTokenActionType,

                    tokenName,
                    newOracleAddress,
                    isPaused,

                    stakingContractAddress,
                    maxDepositAmount

                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
                
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to update collateral token",  // title
                    "setCollateralToken",               // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const mockCollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // Assertions
                assert.strictEqual(proposal.executed, true);

                assert.equal(mockCollateralToken.tokenName              , tokenName);
                assert.equal(mockCollateralToken.oracleAddress          , newOracleAddress);
                assert.equal(mockCollateralToken.maxDepositAmount       , maxDepositAmount);
                assert.equal(mockCollateralToken.isPaused               , isPaused);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    // ====================================================
    //
    //  Governance Proxy NODE Lambdas Test 
    //
    // ====================================================


    describe(`
    -- -- -- -- -- -- -- -- -- -- -- -- --

    Governance Proxy NODE Tests Start
    
    -- -- -- -- -- -- -- -- -- -- -- -- --`, async() => {
        it(``, async () => {
            try {

            } catch (e) {
                console.log(e)
            }
        })
    })


    describe("%setContractName", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Updates the name of the farm contract", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const initName              = farmStorage.name;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update farm name";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // generate random key for re-running test
                const randomNumber = Math.floor(Math.random() * 1000000);
                const newName      = "NewFarmName" + randomNumber;

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'setContractName',
                    farmAddress.address,
                    newName
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "setContractName#1",     // title
                    "setContractName",       // entrypointName
                    packedData,              // encodedCode
                    ""                       // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const endName               = farmStorage.name;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endName, initName);
                assert.strictEqual(endName, newName);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateContractMetadata", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update version of the doorman contract", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const initMetadata          = await doormanStorage.metadata.get("data");
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update metadata";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // generate random key for re-running test
                const randomNumber = Math.floor(Math.random() * 1000000);
                const randomKey  = "MAVRYK Doorman Contract v" + randomNumber;

                const newMetadata = Buffer.from(
                    JSON.stringify({
                    name: randomKey,
                    version: 'v1.0.1',
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                    },
                    }),
                    'ascii',
                ).toString('hex')

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateContractMetadata',
                    doormanAddress.address,
                    "data",
                    newMetadata
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "UpdateContractMetadata#1",     // title
                    "updateContractMetadata",       // entrypointName
                    packedData,                     // encodedCode
                    ""                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endMetadata           = await doormanStorage.metadata.get("data");

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endMetadata, initMetadata);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })
    
    describe("%updateContractGeneralMap", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Add a new address to the delegation contract whitelist map", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initGeneral           = delegationStorage.generalContracts;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update general";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // generate random key for re-running test
                const randomNumber = Math.floor(Math.random() * 1000000);
                const randomKey  = "bob" + randomNumber;

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateContractGeneralMap',
                    delegationAddress.address,
                    randomKey,
                    bob.pkh
                ).toTransferParams();

                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "UpdateContractGeneralMap#1",    // title
                    "updateContractGeneralMap",      // entrypointName
                    packedData,                      // encodedCode
                    ""                               // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endGeneral            = delegationStorage.generalContracts;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endGeneral.size, initGeneral.size);
                assert.strictEqual(endGeneral.get(randomKey), bob.pkh);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateGovernanceConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the governance successReward", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const initSuccessReward     = governanceStorage.config.successReward;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update successReward";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateGovernanceConfig',
                    MVK(10),
                    'configSuccessReward'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Proposal to update Governance Config",     // title
                    "updateGovernanceConfig",                   // entrypointName
                    packedData,                                 // encodedCode
                    ""                                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const endSuccessReward      = governanceStorage.config.successReward;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endSuccessReward, initSuccessReward);
                assert.equal(endSuccessReward, MVK(10));
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateGovernanceFinancialConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the governanceFinancial financialRequestDurationInDays", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                governanceFinancialStorage          = await governanceFinancialInstance.storage();
                const initDays                      = governanceFinancialStorage.config.financialRequestDurationInDays;
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Update financialRequestDurationInDays";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateGovernanceFinancialConfig',
                    1,
                    'configFinancialReqDurationDays'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to update Governance Financial Config",   // title
                    "updateGovernanceFinancialConfig",              // entrypointName
                    packedData,                                     // encodedCode
                    ""                                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const endDays               = governanceFinancialStorage.config.financialRequestDurationInDays;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endDays, initDays);
                assert.equal(endDays, 1);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateGovernanceSatelliteConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the governanceSatellite governanceSatelliteDurationInDays", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
                const initDays                      = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Update governanceSatelliteDurationInDays";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateGovernanceSatelliteConfig',
                    1,
                    'configSatelliteDurationInDays'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Governance Satellite Config",   // title
                    "updateGovernanceSatelliteConfig",              // entrypointName
                    packedData,                                     // encodedCode
                    ""                                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                const endDays               = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endDays, initDays);
                assert.equal(endDays, 1);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateDoormanConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the doorman minMvkAmount", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await breakGlassInstance.storage();
                const initAmount            = doormanStorage.config.minMvkAmount;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update minMvkAmount";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateDoormanConfig',
                    new BigNumber(MVK(0.01)),
                    'configMinMvkAmount'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update minMvk Amount",     // title
                    "updateDoormanConfig",              // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const endAmount             = doormanStorage.config.minMvkAmount;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endAmount, initAmount);
                assert.equal(endAmount.toNumber(), MVK(0.01));
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateDelegationConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the delegation maxSatellites", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initSatellites        = delegationStorage.config.maxSatellites;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update maxSatellites";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateDelegationConfig',
                    1234,
                    'configMaxSatellites'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Delegation Max Satellites Config",   // title
                    "updateGovernanceSatelliteConfig",                   // entrypointName
                    packedData,                                          // encodedCode
                    ""                                                   // codeDescription
                );
                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endSatellites         = delegationStorage.config.maxSatellites;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endSatellites, initSatellites);
                assert.equal(endSatellites, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateEmergencyConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the emergency governance voteExpiryDays", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const initExpiry            = emergencyGovernanceStorage.config.voteExpiryDays;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update voteExpiryDays";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateEmergencyConfig',
                    1234,
                    'configVoteExpiryDays'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to update Vote Expiry Days",  // title
                    "updateEmergencyConfig",            // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const endExpiry             = emergencyGovernanceStorage.config.voteExpiryDays;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endExpiry, initExpiry);
                assert.equal(endExpiry, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateBreakGlassConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the break glass actionExpiryDays", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                breakGlassStorage           = await breakGlassInstance.storage();
                const initExpiry            = breakGlassStorage.config.actionExpiryDays;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update actionExpiryDays";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateBreakGlassConfig',
                    1234,
                    'configActionExpiryDays'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Action Expiry Days",   // title
                    "updateBreakGlassConfig",       // entrypointName
                    packedData,                     // encodedCode
                    ""                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                breakGlassStorage           = await breakGlassInstance.storage();
                const endExpiry             = breakGlassStorage.config.actionExpiryDays;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endExpiry, initExpiry);
                assert.equal(endExpiry, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    

    describe("%updateCouncilConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the council actionExpiryDays", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                councilStorage              = await councilInstance.storage();
                const initExpiry            = councilStorage.config.actionExpiryDays;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update actionExpiryDays";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateCouncilConfig',
                    1234,
                    'configActionExpiryDays'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Action Expiry Days",    // title
                    "updateCouncilConfig",                  // entrypointName
                    packedData,                             // encodedCode
                    ""                                      // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                councilStorage              = await councilInstance.storage();
                const endExpiry             = councilStorage.config.actionExpiryDays;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endExpiry, initExpiry);
                assert.equal(endExpiry, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateFarmConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update a farm rewardPerBlock", async() => {
            try{
                // Initial values
                governanceStorage                           = await governanceInstance.storage();
                const aTrackedFarmInstance                  = await utils.tezos.contract.at(aTrackedFarm);
                var aTrackedFarmStorage: farmStorageType    = await aTrackedFarmInstance.storage();
                const initReward                            = aTrackedFarmStorage.config.plannedRewards.currentRewardPerBlock;
                const proposalId                            = governanceStorage.nextProposalId.toNumber();
                const proposalName                          = "Update rewardPerBlock";
                const proposalDesc                          = "Details about new proposal";
                const proposalIpfs                          = "ipfs://QM123456789";
                const proposalSourceCode                    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateFarmConfig',
                    aTrackedFarm,
                    MVK(123),
                    'configRewardPerBlock'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update RewardPerBlock",     // title
                    "updateFarmConfig",                  // entrypointName
                    packedData,                          // encodedCode
                    ""                                   // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aTrackedFarmStorage         = await aTrackedFarmInstance.storage();
                const endReward             = aTrackedFarmStorage.config.plannedRewards.currentRewardPerBlock;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endReward, initReward);
                assert.equal(endReward, MVK(123));
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateFarmFactoryConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the farm factory farm name max length", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initMaxLength         = farmFactoryStorage.config.farmNameMaxLength;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update farm name max length";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateFarmFactoryConfig',
                    1234,
                    'configFarmNameMaxLength'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Name Max Length",       // title
                    "updateFarmFactoryConfig",              // entrypointName
                    packedData,                             // encodedCode
                    ""                                      // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const endMaxLength          = farmFactoryStorage.config.farmNameMaxLength;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endMaxLength, initMaxLength);
                assert.equal(endMaxLength, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateAggregatorConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update an aggregator percentOracleThreshold", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                aggregatorStorage           = await aggregatorInstance.storage();
                
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update percentOracleThreshold";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const initPercentOracleThreshold  = aggregatorStorage.config.percentOracleThreshold.toNumber();

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateAggregatorConfig',
                    aggregatorAddress.address,
                    30,
                    'configPercentOracleThreshold'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Percent Oracle Threshold",      // title
                    "updateAggregatorConfig",                       // entrypointName
                    packedData,                                     // encodedCode
                    ""                                              // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aggregatorStorage           = await aggregatorInstance.storage();
                const percentOracleThreshold = aggregatorStorage.config.percentOracleThreshold.toNumber();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(percentOracleThreshold, initPercentOracleThreshold);
                assert.equal(percentOracleThreshold, 30);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateAggregatorFactoryConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the aggregator factory aggregator name max length", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                aggregatorFactoryStorage    = await treasuryFactoryInstance.storage();
                const initMaxLength         = aggregatorFactoryStorage.config.aggregatorNameMaxLength;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update aggregator name max length";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateAggregatorFactoryConfig',
                    1234,
                    'configAggregatorNameMaxLength'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Name Max Length",      // title
                    "updateAggregatorFactoryConfig",       // entrypointName
                    packedData,                            // encodedCode
                    ""                                     // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const endMaxLength          = aggregatorFactoryStorage.config.aggregatorNameMaxLength;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endMaxLength, initMaxLength);
                assert.equal(endMaxLength, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateTreasuryFactoryConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the treasury factory name max length", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const initMaxLength         = treasuryFactoryStorage.config.treasuryNameMaxLength;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update treasury name max length";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateTreasuryFactoryConfig',
                    1234,
                    'configTreasuryNameMaxLength'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Name Max Length",      // title
                    "updateTreasuryFactoryConfig",         // entrypointName
                    packedData,                            // encodedCode
                    ""                                     // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const endMaxLength          = treasuryFactoryStorage.config.treasuryNameMaxLength;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endMaxLength, initMaxLength);
                assert.equal(endMaxLength, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateVaultFactoryConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the vault factory name max length", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const initMaxLength         = vaultFactoryStorage.config.vaultNameMaxLength;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update vault name max length";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateVaultFactoryConfig',
                    1234,
                    'configVaultNameMaxLength'
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Name Max Length",      // title
                    "updateVaultFactoryConfig",            // entrypointName
                    packedData,                            // encodedCode
                    ""                                     // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const endMaxLength          = vaultFactoryStorage.config.vaultNameMaxLength;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endMaxLength, initMaxLength);
                assert.equal(endMaxLength, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    

    describe("%initFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Initialize a farm", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                farmStorage                         = await farmInstance.storage();
                const initConfig                    = farmStorage.config;
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Init a farm";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'initFarm',
                    farmAddress.address,
                    100,
                    MVK(100),
                    false,
                    false
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Init New Farm",      // title
                    "initFarm",                   // entrypointName
                    packedData,                   // encodedCode
                    ""                            // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const endConfig             = farmStorage.config;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endConfig, initConfig);
                assert.equal(endConfig.plannedRewards.currentRewardPerBlock, MVK(100));
                assert.equal(endConfig.plannedRewards.totalBlocks, 100);
                assert.equal(endConfig.infinite, false);
                assert.equal(endConfig.forceRewardFromTransfer, false);
                assert.equal(farmStorage.init, true);
                assert.equal(farmStorage.open, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%untrackFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Untrack a previously created farm", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Untrack a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Untrack a farm compiled params
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'untrackFarm',
                    aTrackedFarm
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Untrack Farm",       // title
                    "untrackFarm",                // entrypointName
                    packedData,                   // encodedCode
                    ""                            // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
                assert.equal(endTrackedFarms.includes(aTrackedFarm), false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%trackFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Track the previously untracked farm", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Track a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'trackFarm',
                    aTrackedFarm
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Track Farm",       // title
                    "trackFarm",                // entrypointName
                    packedData,                 // encodedCode
                    ""                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
                // Assertions
                // console.log("TRACKED FARMS: ", endTrackedFarms);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
                assert.equal(endTrackedFarms.includes(aTrackedFarm), true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%closeFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Close a farm", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                farmStorage                         = await farmInstance.storage();
                const initOpen                      = farmStorage.open;
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Close a farm";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'closeFarm',
                    farmAddress.address
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Close Farm",         // title
                    "closeFarm",                  // entrypointName
                    packedData,                   // encodedCode
                    ""                            // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const endOpen               = farmStorage.open;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endOpen, initOpen);
                assert.equal(endOpen, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })



    describe("%untrackTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Untrack a previously created treasury", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Untrack a treasury";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'untrackTreasury',
                    aTrackedTreasury
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Untrack Treasury",   // title
                    "untrackTreasury",            // entrypointName
                    packedData,                   // encodedCode
                    ""                            // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
                // Assertions
                // console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
                // console.log(endtrackedTreasuries.length)
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
                assert.equal(endtrackedTreasuries.includes(aTrackedTreasury), false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%trackTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Track the previously untracked treasury", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Track a treasury";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'trackTreasury',
                    aTrackedTreasury
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Track Treasury",         // title
                    "trackTreasury",                  // entrypointName
                    packedData,                   // encodedCode
                    ""                            // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
                // Assertions
                // console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
                assert.equal(endtrackedTreasuries.includes(aTrackedTreasury), true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%updateMvkOperatorsTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the treasury operators", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                treasuryStorage                     = await treasuryInstance.storage();
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Update operators Treasury";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'updateMvkOperatorsTreasury',
                    treasuryAddress.address,
                    [
                        {
                            add_operator: {
                                owner: treasuryAddress.address,
                                operator: bob.pkh,
                                token_id: 0,
                            },
                        },
                    ]
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Update Treasury MVK Operators",    // title
                    "updateMvkOperatorsTreasury",               // entrypointName
                    packedData,                                 // encodedCode
                    ""                                          // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%stakeMvkTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Stake MVK in treasury", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                treasuryStorage                     = await treasuryInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                const initTreasuryMVK               = await mvkTokenStorage.ledger.get(treasuryAddress.address);
                const initTreasurySMVK              = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Stake MVK";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'stakeMvkTreasury',
                    treasuryAddress.address,
                    MVK(10)
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Stake MVK for Treasury",   // title
                    "stakeMvkTreasury",                 // entrypointName
                    packedData,                         // encodedCode
                    ""                                  // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const endTreasuryMVK        = await mvkTokenStorage.ledger.get(treasuryAddress.address);
                const endTreasurySMVK       = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTreasuryMVK.toNumber(), initTreasuryMVK.toNumber());
                assert.strictEqual(initTreasurySMVK, undefined)
                assert.notStrictEqual(endTreasurySMVK, undefined)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%unstakeMvkTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Unstake MVK in Treasury", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                treasuryStorage                     = await treasuryInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                const initTreasuryMVK               = await mvkTokenStorage.ledger.get(treasuryAddress.address);
                const initTreasurySMVK              = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Untake MVK";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'unstakeMvkTreasury',
                    treasuryAddress.address,
                    MVK(5)
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Unstake MVK for Treasury",   // title
                    "unstakeMvkTreasury",                 // entrypointName
                    packedData,                           // encodedCode
                    ""                                    // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const endTreasuryMVK        = await mvkTokenStorage.ledger.get(treasuryAddress.address);
                const endTreasurySMVK       = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTreasuryMVK.toNumber(), initTreasuryMVK.toNumber());
                assert.notEqual(endTreasurySMVK.balance.toNumber(), initTreasurySMVK.balance.toNumber());
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })


    describe("%untrackAggregator", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Untrack a previously created aggregator", async() => {
            try{
                // Initial values
                governanceStorage               = await governanceInstance.storage();
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                const inittrackedAggregators    = await aggregatorFactoryStorage.trackedAggregators;
                const proposalId                = governanceStorage.nextProposalId.toNumber();
                const proposalName              = "Untrack a aggregator";
                const proposalDesc              = "Details about new proposal";
                const proposalIpfs              = "ipfs://QM123456789";
                const proposalSourceCode        = "Proposal Source Code";
                
                // console.log("INIT TRACKED AGGREGATORS: ", inittrackedAggregators);
                // console.log(inittrackedAggregators.size)

                const sampleAggregator          = inittrackedAggregators[0];

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'untrackAggregator',
                    sampleAggregator
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Untrack Aggregator",        // title
                    "untrackAggregator",                 // entrypointName
                    packedData,                          // encodedCode
                    ""                                   // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedAggregators = await aggregatorFactoryStorage.trackedAggregators;
                
                // Assertions
                // console.log("TRACKED AGGREGATORS: ", endTrackedAggregators);
                // console.log(endTrackedAggregators.size)
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedAggregators.length, inittrackedAggregators.length);
                assert.equal(endTrackedAggregators.includes(aTrackedAggregator), false);

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%trackAggregator", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Track the previously untracked aggregator", async() => {
            try{
                // Initial values
                governanceStorage               = await governanceInstance.storage();
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                const initTrackedAggregators    = await aggregatorFactoryStorage.trackedAggregators;
                const proposalId                = governanceStorage.nextProposalId.toNumber();
                const proposalName              = "Track a aggregator";
                const proposalDesc              = "Details about new proposal";
                const proposalIpfs              = "ipfs://QM123456789";
                const proposalSourceCode        = "Proposal Source Code";

                // Compile params into bytes
                const lambdaParams = governanceProxyNodeInstance.methods.dataPackingHelper(
                    'trackAggregator',
                    aTrackedAggregator
                ).toTransferParams();
                
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType = await governanceProxyNodeInstance.entrypoints.entrypoints.dataPackingHelper;

                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // create proposal data
                const proposalData = sharedTestHelper.createProposalData(
                    "Data to Track Aggregator",          // title
                    "trackAggregator",                   // entrypointName
                    packedData,                          // encodedCode
                    ""                                   // codeDescription
                );

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedAggregators = await aggregatorFactoryStorage.trackedAggregators;

                // Assertions
                // console.log("TRACKED AGGREGATORS: ", endTrackedAggregators);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedAggregators.length, initTrackedAggregators.length);
                assert.equal(endTrackedAggregators.includes(aTrackedAggregator), true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

});