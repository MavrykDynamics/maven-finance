const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "../helpers/Utils";
import { createHash } from "crypto";
import fs from "fs";
import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
import { confirmOperation } from "../../scripts/confirmation";
import { BigNumber } from "bignumber.js";

const chai = require("chai");
const salt          = 'azerty';
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../../env";
import { bob, alice, eve, mallory, trudy } from "../../scripts/sandbox/accounts";
import * as accounts from "../../scripts/sandbox/accounts";

import { ledger } from "../../storage/mvkTokenStorage";

import doormanAddress from '../../deployments/doormanAddress.json';
import farmFactoryAddress from '../../deployments/farmFactoryAddress.json';
import delegationAddress from '../../deployments/delegationAddress.json';
import councilAddress from '../../deployments/councilAddress.json'
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';
import governanceProxyAddress from '../../deployments/governanceProxyAddress.json';
import emergencyGovernanceAddress from '../../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress from '../../deployments/breakGlassAddress.json';
import mTokenUsdtAddress from '../../deployments/mTokenUsdtAddress.json';
import mockUsdMockFa12TokenAggregatorAddress from "../../deployments/mockUsdMockFa12TokenAggregatorAddress.json";
import mockUsdXtzAggregatorAddress from "../../deployments/mockUsdXtzAggregatorAddress.json";
import mockUsdMvkAggregatorAddress from "../../deployments/mockUsdMvkAggregatorAddress.json";
import mavrykFa12TokenAddress from '../../deployments/mavrykFa12TokenAddress.json';
import mavrykFa2TokenAddress from '../../deployments/mavrykFa2TokenAddress.json';
import mvkFaucetAddress from '../../deployments/mvkFaucetAddress.json';
import treasuryAddress from '../../deployments/treasuryAddress.json';
import vestingAddress from '../../deployments/vestingAddress.json';
import governanceFinancialAddress from '../../deployments/governanceFinancialAddress.json';
import treasuryFactoryAddress from '../../deployments/treasuryFactoryAddress.json';
import farmAddress from '../../deployments/farmAddress.json';
import governanceSatelliteAddress from '../../deployments/governanceSatelliteAddress.json';
import aggregatorAddress from '../../deployments/aggregatorAddress.json';
import aggregatorFactoryAddress from '../../deployments/aggregatorFactoryAddress.json';
import tokenSaleAddress from '../../deployments/tokenSaleAddress.json';
import lendingControllerAddress from '../../deployments/lendingControllerAddress.json';
import lendingControllerMockTimeAddress from '../../deployments/lendingControllerMockTimeAddress.json';
import vaultFactoryAddress from '../../deployments/vaultFactoryAddress.json';

describe("Testnet setup helper", async () => {
    var utils: Utils;

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
    let tokenSaleInstance;
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
    let tokenSaleStorage;
    let lendingControllerStorage;
    let lendingControllerMockTimeStorage;
    let vaultStorage;
    let vaultFactoryStorage;
    let mavrykFa12TokenStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            
            doormanInstance                         = await utils.tezos.contract.at(doormanAddress.address);
            delegationInstance                      = await utils.tezos.contract.at(delegationAddress.address);
            mvkTokenInstance                        = await utils.tezos.contract.at(mvkTokenAddress.address);
            governanceInstance                      = await utils.tezos.contract.at(governanceAddress.address);
            governanceProxyInstance                 = await utils.tezos.contract.at(governanceProxyAddress.address);
            emergencyGovernanceInstance             = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
            breakGlassInstance                      = await utils.tezos.contract.at(breakGlassAddress.address);
            councilInstance                         = await utils.tezos.contract.at(councilAddress.address);
            farmFactoryInstance                     = await utils.tezos.contract.at(farmFactoryAddress.address);
            vestingInstance                         = await utils.tezos.contract.at(vestingAddress.address);
            governanceFinancialInstance             = await utils.tezos.contract.at(governanceFinancialAddress.address);
            treasuryFactoryInstance                 = await utils.tezos.contract.at(treasuryFactoryAddress.address);
            treasuryInstance                        = await utils.tezos.contract.at(treasuryAddress.address);
            farmInstance                            = await utils.tezos.contract.at(farmAddress.address);
            lpTokenInstance                         = await utils.tezos.contract.at(mavrykFa12TokenAddress.address);
            governanceSatelliteInstance             = await utils.tezos.contract.at(governanceSatelliteAddress.address);
            aggregatorInstance                      = await utils.tezos.contract.at(aggregatorAddress.address);
            aggregatorFactoryInstance               = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
            tokenSaleInstance                       = await utils.tezos.contract.at(tokenSaleAddress.address);
            lendingControllerInstance               = await utils.tezos.contract.at(lendingControllerAddress.address);
            lendingControllerMockTimeInstance       = await utils.tezos.contract.at(lendingControllerMockTimeAddress.address);
            vaultFactoryInstance                    = await utils.tezos.contract.at(vaultFactoryAddress.address);
            mavrykFa12TokenInstance                 = await utils.tezos.contract.at(mavrykFa12TokenAddress.address);
    
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
            tokenSaleStorage                        = await tokenSaleInstance.storage();
            lendingControllerStorage                = await lendingControllerInstance.storage();
            lendingControllerMockTimeStorage        = await lendingControllerMockTimeInstance.storage();
            vaultFactoryStorage                     = await vaultFactoryInstance.storage();
            mavrykFa12TokenStorage                  = await mavrykFa12TokenInstance.storage();
    
            console.log('-- -- -- -- -- Testnet Environment Setup -- -- -- --')
            console.log('Doorman Contract deployed at:', doormanInstance.address);
            console.log('Delegation Contract deployed at:', delegationInstance.address);
            console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
            console.log('Governance Contract deployed at:', governanceInstance.address);
            console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
            console.log('Vesting Contract deployed at:', vestingInstance.address);
            console.log('Governance Financial Contract deployed at:', governanceFinancialInstance.address);
            console.log('Treasury Factory Contract deployed at:', treasuryFactoryInstance.address);
            console.log('Treasury Contract deployed at:', treasuryInstance.address);
            console.log('Farm Contract deployed at:', farmInstance.address);
            console.log('LP Token Contract deployed at:', lpTokenInstance.address);
            console.log('Governance Satellite Contract deployed at:', governanceSatelliteInstance.address);
            console.log('Aggregator Contract deployed at:', aggregatorInstance.address);
            console.log('Aggregator Factory Contract deployed at:', aggregatorFactoryInstance.address);
            console.log('Token Sale Contract deployed at:', tokenSaleInstance.address);
            console.log('Lending Controller Contract deployed at:', lendingControllerInstance.address);
            console.log('Lending Controller Mock Time Contract deployed at:', lendingControllerMockTimeInstance.address);
            console.log('Vault Factory Contract deployed at:', vaultFactoryInstance.address);
            console.log('Mavryk FA12 Token Contract deployed at:', mavrykFa12TokenInstance.address);

        } catch(e){
            console.log(e)
        }
    });

    describe("PROD ENVIRONMENT SETUP", async () => {

        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Faucet gets all MVK', async () => {
            try{
                for(let accountName in accounts){
                    let account = accounts[accountName];
                    if(ledger.has(account.pkh)){
                        let balance = await mvkTokenStorage.ledger.get(account.pkh);
                        if(balance !== undefined && balance.toNumber() > 0 && account.pkh !== mvkFaucetAddress.address){
                            // Transfer all funds to bob
                            await signerFactory(account.sk);
                            console.log("account:", account)
                            console.log("balance:", balance)
                            let operation = await mvkTokenInstance.methods.transfer([
                                {
                                    from_: account.pkh,
                                    txs: [
                                    {
                                        to_: mvkFaucetAddress.address,
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
                var generalContracts          = governanceStorage.generalContracts.entries();
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==governanceProxyAddress.address){
                        var setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
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

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==governanceProxyAddress.address){
                        var setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
                        await setAdminOperation.confirmation()
                    }

                    // Check whitelist [Council, Factory]
                    if(storage.hasOwnProperty('whitelistContracts')){
                        if(storage.whitelistContracts.get("council") === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts('council', councilAddress.address).send()
                            await operation.confirmation()
                        }
                        if(storage.whitelistContracts.get("farmFactory") === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts('farmFactory', farmFactoryAddress.address).send()
                            await operation.confirmation()
                        }
                    }
                }

                // Set treasury contracts admin
                treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
                var trackedTreasuries           = treasuryFactoryStorage.trackedTreasuries.entries();
                for (let entry of trackedTreasuries){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==governanceProxyAddress.address){
                        var setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
                        await setAdminOperation.confirmation()
                    }

                    // Check whitelist [Gov proxy, Factory]
                    if(storage.hasOwnProperty('whitelistContracts')){
                        if(storage.whitelistContracts.get("governanceProxy") === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts('governanceProxy', governanceProxyAddress.address).send()
                            await operation.confirmation()
                        }
                        if(storage.whitelistContracts.get("treasuryFactory") === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts('treasuryFactory', treasuryFactoryAddress.address).send()
                            await operation.confirmation()
                        }
                    }
                }

                // Set aggregator contracts admin
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                var trackedAggregators          = aggregatorFactoryStorage.trackedAggregators.entries();
                for (let entry of trackedAggregators){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==governanceProxyAddress.address){
                        var setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
                        await setAdminOperation.confirmation()
                    }

                    // Check whitelist [Gov satellite, Factory]
                    if(storage.hasOwnProperty('whitelistContracts')){
                        if(storage.whitelistContracts.get("governanceSatellite") === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts('governanceSatellite', governanceSatelliteAddress.address).send()
                            await operation.confirmation()
                        }
                        if(storage.whitelistContracts.get("aggregatorFactory") === undefined){
                            var operation   = await contract.methods.updateWhitelistContracts('aggregatorFactory', aggregatorFactoryAddress.address).send()
                            await operation.confirmation()
                        }
                    }
                }

                // Set governance proxy admin, governance admin and mvkToken admin
                setAdminOperation   = await governanceProxyInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation()
                setAdminOperation   = await governanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation()
                setAdminOperation   = await mvkTokenInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation()
                
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })
});