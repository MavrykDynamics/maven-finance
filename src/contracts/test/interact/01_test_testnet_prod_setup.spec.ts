import { MVN, Utils } from "../helpers/Utils"

const chai = require("chai")
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob } from "../../scripts/sandbox/accounts";
import accounts from "../../scripts/sandbox/accounts";
import * as helperFunctions from '../helpers/helperFunctions'
import { ledger as mvnLedger } from "../../storage/mvnTokenStorage";
import { ledger as fakeUsdtLedger } from "../../storage/mavenFa2TokenStorage";

// ------------------------------------------------------------------------------
// Testnet Setup
// ------------------------------------------------------------------------------

describe("Testnet setup helper", async () => {
    
    var utils: Utils;
    var tezos

    let mvnFaucetAddress

    let doormanInstance;
    let delegationInstance;
    let mvnTokenInstance;
    let fakeUSDTTokenInstance;
    let governanceInstance;
    let governanceProxyInstance;
    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let councilInstance;
    let farmFactoryInstance;
    let vestingInstance;
    let governanceFinancialInstance;
    let treasuryFactoryInstance;
    let lpTokenInstance;
    let governanceSatelliteInstance;
    let aggregatorFactoryInstance;
    let lendingControllerInstance;
    let vaultInstance;
    let fakeUsdtTokenInstance;
    let mvnFaucetInstance;
    let vaultFactoryInstance;
    let mavenFa12TokenInstance;

    let doormanStorage;
    let delegationStorage;
    let mvnTokenStorage;
    let fakeUSDTTokenStorage;
    let governanceStorage;
    let governanceProxyStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let councilStorage;
    let farmFactoryStorage;
    let vestingStorage;
    let governanceFinancialStorage;
    let treasuryFactoryStorage;
    let lpTokenStorage;
    let governanceSatelliteStorage;
    let aggregatorFactoryStorage;
    let lendingControllerStorage;
    let vaultStorage;
    let vaultFactoryStorage;
    let mavenFa12TokenStorage;

    before("setup", async () => {
        try{
            
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos;

            mvnFaucetAddress                        = contractDeployments.mvnFaucet.address;
            
            doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvnTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
            fakeUSDTTokenInstance                   = await utils.tezos.contract.at(contractDeployments.fakeUSDtToken.address);
            governanceInstance                      = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceProxyInstance                 = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            emergencyGovernanceInstance             = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
            breakGlassInstance                      = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
            councilInstance                         = await utils.tezos.contract.at(contractDeployments.council.address);
            farmFactoryInstance                     = await utils.tezos.contract.at(contractDeployments.farmFactory.address);
            vestingInstance                         = await utils.tezos.contract.at(contractDeployments.vesting.address);
            governanceFinancialInstance             = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            treasuryFactoryInstance                 = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
            lpTokenInstance                         = await utils.tezos.contract.at(contractDeployments.mavenFa12Token.address);
            mvnFaucetInstance                       = await utils.tezos.contract.at(contractDeployments.mvnFaucet.address);
            governanceSatelliteInstance             = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            aggregatorFactoryInstance               = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            lendingControllerInstance               = await utils.tezos.contract.at(contractDeployments.lendingController.address);
            vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);
            mavenFa12TokenInstance                  = await utils.tezos.contract.at(contractDeployments.mavenFa12Token.address);
            fakeUsdtTokenInstance                   = await utils.tezos.contract.at(contractDeployments.fakeUSDtToken.address);

            doormanStorage                          = await doormanInstance.storage();
            delegationStorage                       = await delegationInstance.storage();
            mvnTokenStorage                         = await mvnTokenInstance.storage();
            fakeUSDTTokenStorage                    = await fakeUSDTTokenInstance.storage();
            governanceStorage                       = await governanceInstance.storage();
            governanceProxyStorage                  = await governanceProxyInstance.storage();
            emergencyGovernanceStorage              = await emergencyGovernanceInstance.storage();
            breakGlassStorage                       = await breakGlassInstance.storage();
            councilStorage                          = await councilInstance.storage();
            farmFactoryStorage                      = await farmFactoryInstance.storage();
            vestingStorage                          = await vestingInstance.storage();
            governanceFinancialStorage              = await governanceFinancialInstance.storage();
            treasuryFactoryStorage                  = await treasuryFactoryInstance.storage();
            lpTokenStorage                          = await lpTokenInstance.storage();
            governanceSatelliteStorage              = await governanceSatelliteInstance.storage();
            aggregatorFactoryStorage                = await aggregatorFactoryInstance.storage();
            lendingControllerStorage                = await lendingControllerInstance.storage();
            vaultFactoryStorage                     = await vaultFactoryInstance.storage();
            mavenFa12TokenStorage                  = await mavenFa12TokenInstance.storage();
    
            console.log('-- -- -- -- -- Testnet Environment Setup -- -- -- --')
            console.log('Doorman Contract deployed at:'                         , contractDeployments.doorman.address);
            console.log('Delegation Contract deployed at:'                      , contractDeployments.delegation.address);
            console.log('MVN Token Contract deployed at:'                       , contractDeployments.mvnToken.address);
            console.log('Fake USDT Token Contract deployed at:'                 , contractDeployments.fakeUSDtToken.address);
            console.log('Governance Contract deployed at:'                      , contractDeployments.governance.address);
            console.log('Emergency Governance Contract deployed at:'            , contractDeployments.emergencyGovernance.address);
            console.log('Vesting Contract deployed at:'                         , contractDeployments.vesting.address);
            console.log('Governance Financial Contract deployed at:'            , contractDeployments.governanceFinancial.address);
            console.log('Treasury Factory Contract deployed at:'                , contractDeployments.treasuryFactory.address);
            console.log('LP Token Contract deployed at:'                        , contractDeployments.mavenFa12Token.address);
            console.log('Governance Satellite Contract deployed at:'            , contractDeployments.governanceSatellite.address);
            console.log('Aggregator Contract deployed at:'                      , contractDeployments.aggregator.address);
            console.log('Aggregator Factory Contract deployed at:'              , contractDeployments.aggregatorFactory.address);
            console.log('Lending Controller Contract deployed at:'              , contractDeployments.lendingController.address);
            console.log('Lending Controller Mock Time Contract deployed at:'    , contractDeployments.lendingControllerMockTime.address);
            console.log('Vault Factory Contract deployed at:'                   , contractDeployments.vaultFactory.address);
            console.log('Maven FA12 Token Contract deployed at:'                , contractDeployments.mavenFa12Token.address);

        } catch(e){
            console.log(e)
        }
    });

    describe("PROD ENVIRONMENT SETUP", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin add USDT and MVN as tokens on the faucet', async () => {
            try{
                // Operation
                var operation             = await mvnFaucetInstance.methods.updateToken(MVN(400), contractDeployments.mvnToken.address, 0).send();
                await operation.confirmation();
                operation                 = await mvnFaucetInstance.methods.updateToken(1000000000, contractDeployments.fakeUSDtToken.address, 0).send();
                await operation.confirmation();
                operation                 = await mvnFaucetInstance.methods.updateToken(100000000, "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d", 0).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts of USDT', async () => {
            try{
                // Operation
                const operation = await fakeUsdtTokenInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin mints 10,000,000 USDT on the faucet', async () => {
            try{
                // Operation
                var operation             = await fakeUsdtTokenInstance.methods.mintOrBurn(mvnFaucetInstance.address, 0, 10000000000000).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts of MVN', async () => {
            try{
                // Operation
                const operation = await mvnTokenInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin mints 10,000,000 MVN on the faucet', async () => {
            try{
                // Operation
                var operation             = await mvnTokenInstance.methods.mint(mvnFaucetInstance.address, MVN(10000000)).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets admin and whitelist of all contracts', async () => {
            try{
                // Set general contracts admin
                governanceStorage             = await governanceInstance.storage();
                // var generalContracts          = [
                //     contractDeployments.aggregatorFactory.address,
                //     contractDeployments.breakGlass.address,
                //     contractDeployments.council.address,
                //     contractDeployments.delegation.address,
                //     contractDeployments.doorman.address,
                //     contractDeployments.emergencyGovernance.address,
                //     contractDeployments.farmFactory.address,
                //     contractDeployments.vesting.address,
                //     contractDeployments.treasuryFactory.address,
                //     contractDeployments.lendingController.address,
                //     contractDeployments.vaultFactory.address,
                //     contractDeployments.governance.address,
                // ]
                
                // for (let entry of generalContracts){
                //     // Get contract storage
                //     var contract        = await utils.tezos.contract.at(entry);
                //     var storage:any     = await contract.storage();

                //     // Check admin
                //     if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                //         var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                //         await setAdminOperation.confirmation()
                //     }
                // }

                // Set farm contracts admin
                farmFactoryStorage              = await farmFactoryInstance.storage();
                var trackedFarms                = farmFactoryStorage.trackedFarms.entries();
                for (let entry of trackedFarms){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check whitelist [Council, Factory]
                    if(storage.hasOwnProperty('whitelistContracts')){
                        if(await storage.whitelistContracts.get(contractDeployments.council.address) === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts(contractDeployments.council.address, 'update').send()
                            await operation.confirmation()
                        }
                        if(await storage.whitelistContracts.get(contractDeployments.farmFactory.address) === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts(contractDeployments.farmFactory.address, 'update').send()
                            await operation.confirmation()
                        }
                    }

                    // Check admin
                    // if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                    //     var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                    //     await setAdminOperation.confirmation()
                    // }
                }

                // Set treasury contracts admin
                treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
                var trackedTreasuries           = treasuryFactoryStorage.trackedTreasuries.entries();
                for (let entry of trackedTreasuries){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check whitelist [Gov proxy, Factory]
                    if(storage.hasOwnProperty('whitelistContracts')){
                        if(storage.whitelistContracts.get(contractDeployments.governanceProxy.address) === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts(contractDeployments.governanceProxy.address, 'update').send()
                            await operation.confirmation()
                        }
                        if(storage.whitelistContracts.get(contractDeployments.treasuryFactory.address) === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts(contractDeployments.treasuryFactory.address, 'update').send()
                            await operation.confirmation()
                        }
                    }

                    // Check admin
                    // if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                    //     var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                    //     await setAdminOperation.confirmation()
                    // }
                }

                // Set aggregator contracts admin
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                var trackedAggregators          = aggregatorFactoryStorage.trackedAggregators.entries();
                for (let entry of trackedAggregators){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check whitelist [Gov satellite, Factory]
                    if(storage.hasOwnProperty('whitelistContracts')){
                        if(storage.whitelistContracts.get(contractDeployments.governanceSatellite.address) === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts(contractDeployments.governanceSatellite.address, 'update').send()
                            await operation.confirmation()
                        }
                        if(storage.whitelistContracts.get(contractDeployments.aggregatorFactory.address) === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts(contractDeployments.aggregatorFactory.address, 'update').send()
                            await operation.confirmation()
                        }
                    }

                    // Check admin
                    // if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                    //     var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                    //     await setAdminOperation.confirmation()
                    // }
                }

                // Set governance proxy admin, governance admin and mvnToken admin
                // setAdminOperation   = await governanceProxyInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                // await setAdminOperation.confirmation()

                // // setAdminOperation   = await governanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                // // await setAdminOperation.confirmation()
                
                // setAdminOperation   = await mvnTokenInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                // await setAdminOperation.confirmation()
                
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })
});