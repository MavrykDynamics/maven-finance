import { MVK, Utils } from "../helpers/Utils";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, eve, mallory, alice, oscar } from "../../scripts/sandbox/accounts";
import * as helperFunctions from '../helpers/helperFunctions'
import { mockSatelliteData } from "../helpers/mockTestnetData"

// ------------------------------------------------------------------------------
// Testnet Setup
// ------------------------------------------------------------------------------

describe("Testnet setup helper", async () => {
    
    var utils: Utils
    var tezos

    let doormanAddress
    let tokenId = 0

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;

    // operations
    let updateOperatorsOperation
    let stakeOperation
    let registerOperation

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos;

            doormanAddress = contractDeployments.doorman.address
            
            doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);

            console.log('-- -- -- -- -- Testnet Environment Setup -- -- -- --')
            console.log('Doorman Contract deployed at:'                         , contractDeployments.doorman.address);
            console.log('Delegation Contract deployed at:'                      , contractDeployments.delegation.address);
            console.log('MVK Token Contract deployed at:'                       , contractDeployments.mvkToken.address);
            console.log('Governance Contract deployed at:'                      , contractDeployments.governance.address);
            console.log('Emergency Governance Contract deployed at:'            , contractDeployments.emergencyGovernance.address);
            console.log('Vesting Contract deployed at:'                         , contractDeployments.vesting.address);
            console.log('Governance Financial Contract deployed at:'            , contractDeployments.governanceFinancial.address);
            console.log('Treasury Factory Contract deployed at:'                , contractDeployments.treasuryFactory.address);
            console.log('Treasury Contract deployed at:'                        , contractDeployments.treasury.address);
            console.log('Farm Contract deployed at:'                            , contractDeployments.farm.address);
            console.log('LP Token Contract deployed at:'                        , contractDeployments.mavrykFa12Token.address);
            console.log('Governance Satellite Contract deployed at:'            , contractDeployments.governanceSatellite.address);
            console.log('Aggregator Contract deployed at:'                      , contractDeployments.aggregator.address);
            console.log('Aggregator Factory Contract deployed at:'              , contractDeployments.aggregatorFactory.address);
            console.log('Lending Controller Contract deployed at:'              , contractDeployments.lendingController.address);
            console.log('Lending Controller Mock Time Contract deployed at:'    , contractDeployments.lendingControllerMockTime.address);
            console.log('Vault Factory Contract deployed at:'                   , contractDeployments.vaultFactory.address);
            console.log('Mavryk FA12 Token Contract deployed at:'               , contractDeployments.mavrykFa12Token.address);

        } catch(e){
            console.log(e)
        }
    });

    describe("INVESTOR ENVIRONMENT SETUP", async () => {

        it('Creation of 5 Satellites', async () => {
            try{
                
                // ------------------------------
                // Staking Operations
                // ------------------------------

                // Bob 
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                stakeOperation = await doormanInstance.methods.stake(MVK(1000)).send();
                await stakeOperation.confirmation();

                // Eve 
                await helperFunctions.signerFactory(tezos, eve.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                await updateOperatorsOperation.confirmation();
                stakeOperation = await doormanInstance.methods.stake(MVK(200)).send();
                await stakeOperation.confirmation();

                // Mallory 
                await helperFunctions.signerFactory(tezos, mallory.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                stakeOperation = await doormanInstance.methods.stake(MVK(700)).send();
                await stakeOperation.confirmation();

                // ------------------------------
                // Register Satellite Operations
                // ------------------------------

                // Bob Satellite
                await helperFunctions.signerFactory(tezos, bob.sk);
                registerOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.bob.name, 
                    mockSatelliteData.bob.desc,
                    mockSatelliteData.bob.image,
                    mockSatelliteData.bob.website, 
                    mockSatelliteData.bob.satelliteFee,
                    mockSatelliteData.bob.oraclePublicKey,
                    mockSatelliteData.bob.oraclePeerId
                ).send();
                await registerOperation.confirmation();

                // Eve Satellite
                await helperFunctions.signerFactory(tezos, eve.sk);
                registerOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc,
                    mockSatelliteData.eve.image,
                    mockSatelliteData.eve.website, 
                    mockSatelliteData.eve.satelliteFee,
                    mockSatelliteData.eve.oraclePublicKey,
                    mockSatelliteData.eve.oraclePeerId
                ).send();
                await registerOperation.confirmation();

                // Mallory Satellite
                await helperFunctions.signerFactory(tezos, mallory.sk);
                registerOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.mallory.name, 
                    mockSatelliteData.mallory.desc,
                    mockSatelliteData.mallory.image,
                    mockSatelliteData.mallory.website, 
                    mockSatelliteData.mallory.satelliteFee,
                    mockSatelliteData.mallory.oraclePublicKey,
                    mockSatelliteData.mallory.oraclePeerId
                ).send();
                await registerOperation.confirmation();

                // Alice Satellite
                await helperFunctions.signerFactory(tezos, alice.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation              = await doormanInstance.methods.stake(MVK(700)).send();
                await stakeOperation.confirmation();
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    "Captain Kirk", 
                    "James Tiberius \"Jim\" Kirk is a legendary Starfleet officer who lived during the 23rd century. His time in Starfleet, made Kirk arguably one of the most famous and sometimes infamous starship captains in Starfleet history. The highly decorated Kirk served as the commanding officer of the Constitution-class starships USS Enterprise and USS Enterprise-A, where he served Federation interests as an explorer, soldier, diplomat, and time traveler. He currently spends his time as a Mavryk Satellite and signs Oracle price feeds for the Mavryk Finance network.", 
                    "https://infura-ipfs.io/ipfs/QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn", 
                    "https://intl.startrek.com/",
                    700,
                    alice.pk,
                    alice.peerId
                ).send();
                await registerOperation.confirmation();

                // Oscar Satellite
                await helperFunctions.signerFactory(tezos, oscar.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: oscar.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation              = await doormanInstance.methods.stake(MVK(700)).send();
                await stakeOperation.confirmation();
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    "Captain Kirk", 
                    "James Tiberius \"Jim\" Kirk is a legendary Starfleet officer who lived during the 23rd century. His time in Starfleet, made Kirk arguably one of the most famous and sometimes infamous starship captains in Starfleet history. The highly decorated Kirk served as the commanding officer of the Constitution-class starships USS Enterprise and USS Enterprise-A, where he served Federation interests as an explorer, soldier, diplomat, and time traveler. He currently spends his time as a Mavryk Satellite and signs Oracle price feeds for the Mavryk Finance network.", 
                    "https://infura-ipfs.io/ipfs/QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn", 
                    "https://intl.startrek.com/",
                    700,
                    oscar.pk,
                    oscar.peerId
                ).send();
                await registerOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })
});