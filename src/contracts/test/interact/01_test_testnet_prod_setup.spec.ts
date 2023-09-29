import { Utils } from "../helpers/Utils"

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
import { ledger } from "../../storage/mvkTokenStorage";

// ------------------------------------------------------------------------------
// Testnet Setup
// ------------------------------------------------------------------------------

describe("Testnet setup helper", async () => {
    
    var utils: Utils;
    var tezos

    let mvkFaucetAddress

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

            mvkFaucetAddress                        = contractDeployments.mvkFaucet.address;
            
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

    describe("PROD ENVIRONMENT SETUP", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Faucet gets all MVK', async () => {
            try{
                for(let accountName in accounts){
                    let account = accounts[accountName];
                    if(ledger.has(account.pkh)){
                        let balance = await mvkTokenStorage.ledger.get(account.pkh);
                        if(balance !== undefined && balance.toNumber() > 0 && account.pkh !== mvkFaucetAddress){
                            // Transfer all funds to bob
                            await helperFunctions.signerFactory(tezos, account.sk);
                            console.log("account:", account)
                            console.log("balance:", balance)
                            let operation = await mvkTokenInstance.methods.transfer([
                                {
                                    from_: account.pkh,
                                    txs: [
                                    {
                                        to_: mvkFaucetAddress,
                                        token_id: 0,
                                        amount: balance.toNumber(),
                                    }
                                    ],
                                },
                                ])
                                .send()
                            await operation.confirmation();
                        }
                    }
                }
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets admin and whitelist of all contracts', async () => {
            try{
                // Set general contracts admin
                governanceStorage             = await governanceInstance.storage();
                var generalContracts          = [
                    contractDeployments.aggregatorFactory.address,
                    contractDeployments.breakGlass.address,
                    contractDeployments.council.address,
                    contractDeployments.delegation.address,
                    contractDeployments.doorman.address,
                    contractDeployments.emergencyGovernance.address,
                    contractDeployments.farmFactory.address,
                    contractDeployments.vesting.address,
                    contractDeployments.treasuryFactory.address,
                    contractDeployments.lendingController.address,
                    contractDeployments.vaultFactory.address,
                    contractDeployments.governance.address,
                ]
                
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                        var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await setAdminOperation.confirmation()
                    }
                }

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
                    if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                        var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await setAdminOperation.confirmation()
                    }
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
                    if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                        var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await setAdminOperation.confirmation()
                    }
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
                    if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                        var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await setAdminOperation.confirmation()
                    }
                }

                // Set governance proxy admin, governance admin and mvkToken admin
                setAdminOperation   = await governanceProxyInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                await setAdminOperation.confirmation()

                setAdminOperation   = await governanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                await setAdminOperation.confirmation()
                
                setAdminOperation   = await mvkTokenInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                await setAdminOperation.confirmation()
                
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })
});