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

import { bob, eve, mallory } from "../../scripts/sandbox/accounts";
import * as helperFunctions from '../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Testnet Setup
// ------------------------------------------------------------------------------

describe("Testnet setup helper", async () => {
    
    var utils: Utils
    var tezos

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceProxyInstance;
    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let councilInstance;
    let farmFactoryInstance;
    let vestingInstance;
    let governanceFinancialInstance;
    let treasuryFactoryInstance;
    let treasuryInstance;
    let farmInstance;
    let lpTokenInstance;
    let governanceSatelliteInstance;
    let aggregatorInstance;
    let aggregatorFactoryInstance;
    let lendingControllerInstance;
    let lendingControllerMockTimeInstance;
    let vaultInstance;
    let vaultFactoryInstance;
    let mavrykFa12TokenInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceProxyStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let councilStorage;
    let farmFactoryStorage;
    let vestingStorage;
    let governanceFinancialStorage;
    let treasuryFactoryStorage;
    let treasuryStorage;
    let farmStorage;
    let lpTokenStorage;
    let governanceSatelliteStorage;
    let aggregatorStorage;
    let aggregatorFactoryStorage;
    let lendingControllerStorage;
    let lendingControllerMockTimeStorage;
    let vaultStorage;
    let vaultFactoryStorage;
    let mavrykFa12TokenStorage;

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos;
            
            doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            governanceInstance                      = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceProxyInstance                 = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            emergencyGovernanceInstance             = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
            breakGlassInstance                      = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
            councilInstance                         = await utils.tezos.contract.at(contractDeployments.council.address);
            farmFactoryInstance                     = await utils.tezos.contract.at(contractDeployments.farmFactory.address);
            vestingInstance                         = await utils.tezos.contract.at(contractDeployments.vesting.address);
            governanceFinancialInstance             = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            treasuryFactoryInstance                 = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
            treasuryInstance                        = await utils.tezos.contract.at(contractDeployments.treasury.address);
            farmInstance                            = await utils.tezos.contract.at(contractDeployments.farm.address);
            lpTokenInstance                         = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
            governanceSatelliteInstance             = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            aggregatorInstance                      = await utils.tezos.contract.at(contractDeployments.aggregator.address);
            aggregatorFactoryInstance               = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            lendingControllerInstance               = await utils.tezos.contract.at(contractDeployments.lendingController.address);
            lendingControllerMockTimeInstance       = await utils.tezos.contract.at(contractDeployments.lendingControllerMockTime.address);
            vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);
            mavrykFa12TokenInstance                 = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
    
            doormanStorage                          = await doormanInstance.storage();
            delegationStorage                       = await delegationInstance.storage();
            mvkTokenStorage                         = await mvkTokenInstance.storage();
            governanceStorage                       = await governanceInstance.storage();
            governanceProxyStorage                  = await governanceProxyInstance.storage();
            emergencyGovernanceStorage              = await emergencyGovernanceInstance.storage();
            breakGlassStorage                       = await breakGlassInstance.storage();
            councilStorage                          = await councilInstance.storage();
            farmFactoryStorage                      = await farmFactoryInstance.storage();
            vestingStorage                          = await vestingInstance.storage();
            governanceFinancialStorage              = await governanceFinancialInstance.storage();
            treasuryFactoryStorage                  = await treasuryFactoryInstance.storage();
            treasuryStorage                         = await treasuryInstance.storage();
            farmStorage                             = await farmInstance.storage();
            lpTokenStorage                          = await lpTokenInstance.storage();
            governanceSatelliteStorage              = await governanceSatelliteInstance.storage();
            aggregatorStorage                       = await aggregatorInstance.storage();
            aggregatorFactoryStorage                = await aggregatorFactoryInstance.storage();
            lendingControllerStorage                = await lendingControllerInstance.storage();
            lendingControllerMockTimeStorage        = await lendingControllerMockTimeInstance.storage();
            vaultFactoryStorage                     = await vaultFactoryInstance.storage();
            mavrykFa12TokenStorage                  = await mavrykFa12TokenInstance.storage();
    
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

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Creation of 3 Satellites', async () => {
            try{
                // Bob Satellite
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                var stakeOperation              = await doormanInstance.methods.stake(MVK(1000)).send();
                await stakeOperation.confirmation();
                var registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    "Mavryk Dynamics", 
                    "The Mavryk Dynamics belongs to one of the core teams contributing to Mavryk Finance. The team as Mavryk Dynamics are heavily focused on building the future of financial independence while ensuring a smooth and simple user experience.",
                    "https://infura-ipfs.io/ipfs/QmaqwZAnSWj89kGomozvk8Ng2M5SrSzwibvFyRijWeRbjg",
                    "https://mavryk.finance/", 
                    500,
                    bob.pk,
                    bob.peerId
                ).send();
                await registerOperation.confirmation();

                // // Eve Satellite
                await helperFunctions.signerFactory(tezos, eve.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation              = await doormanInstance.methods.stake(MVK(200)).send();
                await stakeOperation.confirmation();
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    "Buzz Lightyear", 
                    "Buzz is a fabled part of our childhood. He was created by Disney and Pixar mainly voiced by Tim Allen. He is a Superhero toy action figure based on the in-universe media franchise Toy Story, consisting of a blockbuster feature film and animated series, a Space Ranger. While Buzz Lightyear's sole mission used to be defeating the evil Emperor Zurg, what he now cares about most is keeping Andy's toy family together. After he feature-film Lightyear starring Chris Evans, Buzz has decided to operate a satellite of the Mavryk Finance network and sign oracle price feeds to further grow and secure the future of financial independence.", 
                    "https://infura-ipfs.io/ipfs/QmcbigzB5PVfawr1jhctTWDgGTmLBZFbHPNfosDfq9zckQ", 
                    "https://toystory.disney.com/buzz-lightyear", 
                    350,
                    eve.pk,
                    eve.peerId
                ).send();
                await registerOperation.confirmation();

                // Mallory Satellite
                await helperFunctions.signerFactory(tezos, mallory.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: mallory.pkh,
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
                    mallory.pk,
                    mallory.peerId
                ).send();
                await registerOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })
});