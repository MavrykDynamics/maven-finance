const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "../helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../../scripts/confirmation";
import { BigNumber } from "bignumber.js";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../../env";
import { bob, alice, eve, mallory, trudy } from "../../scripts/sandbox/accounts";

import doormanAddress from '../../deployments/doormanAddress.json';
import farmFactoryAddress from '../../deployments/farmFactoryAddress.json';
import delegationAddress from '../../deployments/delegationAddress.json';
import councilAddress from '../../deployments/councilAddress.json'
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';
import governanceProxyAddress from '../../deployments/governanceProxyAddress.json';
import emergencyGovernanceAddress from '../../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress from '../../deployments/breakGlassAddress.json';
import lpTokenAddress from '../../deployments/lpTokenAddress.json';
import treasuryAddress from '../../deployments/treasuryAddress.json';
import vestingAddress from '../../deployments/vestingAddress.json';
import governanceFinancialAddress from '../../deployments/governanceFinancialAddress.json';
import treasuryFactoryAddress from '../../deployments/treasuryFactoryAddress.json';
import farmAddress from '../../deployments/farmAddress.json';

// import governanceLambdaParamBytes from "../build/lambdas/governanceLambdaParametersBytes.json";
import { config } from "yargs";
import { MichelsonMap } from "@taquito/taquito";

describe("Testnet interactions helper", async () => {
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

    let createdTreasuryAddress;
    const treasuryMetadataBase = Buffer.from(
        JSON.stringify({
          name: 'MAVRYK Farm Treasury',
          description: 'MAVRYK Treasury Contract',
          version: 'v1.0.0',
          authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
      ).toString('hex')

    let createdFarmAddress;
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

    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
            delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
            mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
            governanceInstance              = await utils.tezos.contract.at(governanceAddress.address);
            governanceProxyInstance         = await utils.tezos.contract.at(governanceProxyAddress.address);
            emergencyGovernanceInstance     = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
            breakGlassInstance              = await utils.tezos.contract.at(breakGlassAddress.address);
            councilInstance                 = await utils.tezos.contract.at(councilAddress.address);
            farmFactoryInstance             = await utils.tezos.contract.at(farmFactoryAddress.address);
            vestingInstance                 = await utils.tezos.contract.at(vestingAddress.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(governanceFinancialAddress.address);
            treasuryFactoryInstance         = await utils.tezos.contract.at(treasuryFactoryAddress.address);
            treasuryInstance                = await utils.tezos.contract.at(treasuryAddress.address);
            farmInstance                    = await utils.tezos.contract.at(farmAddress.address);
            lpTokenInstance                 = await utils.tezos.contract.at(lpTokenAddress.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            governanceStorage               = await governanceInstance.storage();
            governanceProxyStorage          = await governanceProxyInstance.storage();
            emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
            breakGlassStorage               = await breakGlassInstance.storage();
            councilStorage                  = await councilInstance.storage();
            farmFactoryStorage              = await farmFactoryInstance.storage();
            vestingStorage                  = await vestingInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
            treasuryStorage                 = await treasuryInstance.storage();
            farmStorage                     = await farmInstance.storage();
            lpTokenStorage                  = await lpTokenInstance.storage();
    
            console.log('-- -- -- -- -- Testnet Interactions Helper -- -- -- --')
            console.log('Doorman Contract deployed at:', doormanInstance.address);
            console.log('Delegation Contract deployed at:', delegationInstance.address);
            console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
            console.log('Governance Contract deployed at:', governanceInstance.address);
            console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
            console.log('Vesting Contract deployed at:', vestingAddress.address);
            console.log('Governance Financial Contract deployed at:', governanceFinancialAddress.address);
            console.log('Treasury Factory Contract deployed at:', treasuryFactoryAddress.address);
            console.log('Treasury Contract deployed at:', treasuryAddress.address);
            console.log('Farm Contract deployed at:', farmAddress.address);
            console.log('LP Token Contract deployed at:', lpTokenAddress.address);
        } catch(e){
            console.log(e)
        }
    });

    describe("MVK TOKEN", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.updateWhitelistContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.updateGeneralContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin transfers MVK', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.transfer([
                    {
                        from_: bob.pkh,
                        txs: [
                        {
                            to_: bob.pkh,
                            token_id: 0,
                            amount: MVK(1),
                        },
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: MVK(1),
                        },
                        {
                            to_: alice.pkh,
                            token_id: 0,
                            amount: 0,
                        },
                        ],
                    },
                    ])
                    .send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates its operators', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin mints 50MVK', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.mint(bob.pkh, MVK(50)).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the MVK inflation rate', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.updateInflationRate(700).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("DOORMAN", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin add Doorman as an operator', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin stakes 100MVK', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.stake(MVK(100)).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unstakes 50MVK', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.unstake(MVK(50)).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin compounds', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.compound(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min MVK amount', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.updateMinMvkAmount(new BigNumber(MVK(0.01))).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.updateWhitelistContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.updateGeneralContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses stake', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseStake().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses unstake', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseUnstake().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses compound', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseCompound().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses farmClaim', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseFarmClaim().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unpauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("DELEGATION", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min SMVK balance required to interact with the entrypoints', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(new BigNumber(MVK(0.01)), "configMinimumStakedMvkBalance").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates delegation ratio', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(100, "configDelegationRatio").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates maximum satellites', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(100, "configMaxSatellites").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates satellite name max length', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(500, "configSatNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates satellite description max length', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(1000, "configSatDescMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates satellite image max length', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(1000, "configSatImageMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates satellite website max length', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(1000, "configSatWebsiteMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateWhitelistContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateGeneralContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses delegateToSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseDelegateToSatellite().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses undelegateSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseUndelegateSatellite().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses registerSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses unregisterSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses updateSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseUpdateSatellite().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses distributeReward', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseDistributeReward().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unpauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin registers as a satellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods
                .registerAsSatellite(
                    "Astronaut Satellite", 
                    "This is the description", 
                    "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3", 
                    "https://mavryk.finance/", 
                    1000
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates its satellite record', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods
                .updateSatelliteRecord(
                    "Astronaut Satellite", 
                    "This is the description", 
                    "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3", 
                    "https://mavryk.finance/", 
                    1000
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unregister its satellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods
                .unregisterAsSatellite(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin register as satellite and user delegates to it', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods
                .registerAsSatellite(
                    "Astronaut Satellite", 
                    "This is the description", 
                    "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3", 
                    "https://mavryk.finance/", 
                    1000
                ).send();
                await operation.confirmation();

                // Delegate Part
                await signerFactory(alice.sk)
                var delegationOperation = await mvkTokenInstance.methods
                .update_operators([
                {
                    add_operator: {
                        owner: alice.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                },
                ])
                .send()
                await delegationOperation.confirmation()
                delegationOperation = await doormanInstance.methods.stake(MVK(10)).send()
                await delegationOperation.confirmation()
                delegationOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh, bob.pkh).send()
                await delegationOperation.confirmation()
            await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin distributes rewards', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.distributeReward([bob.pkh], MVK(100)).send();
                await operation.confirmation();
            await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('User undelegates from satellite', async () => {
            try{
                // Operation
                await signerFactory(alice.sk)
                const operation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
                await operation.confirmation();
            await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe("COUNCIL", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates threshold', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(1, "configThreshold").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates action expiry in days', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(1, "configActionExpiryDays").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates council member name max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configCouncilNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates council member website max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configCouncilWebsiteMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates council member image max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configCouncilImageMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates request token name max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configRequestTokenNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates request purpose max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configRequestPurposeMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateWhitelistContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateGeneralContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates council member info', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateCouncilMemberInfo("Bob", "https://mavryk.finance/", "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin adds a council member', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionAddMember(trudy.pkh, "Trudy", "https://mavryk.finance/", "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes a council member', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionRemoveMember(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin changes a council member', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionChangeMember(alice.pkh, trudy.pkh, "Trudy", "https://mavryk.finance/", "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets a baker', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionSetBaker().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates farm factory blocks per minute', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, 3).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin adds a new vestee', async () => {
            try{
                // Operation
                councilStorage  = await councilInstance.storage();
                const actionId  = councilStorage.actionCounter;
                var operation   = await councilInstance.methods.councilActionAddVestee(bob.pkh, new BigNumber(MVK(1000000000)), 0, 24).send()
                await operation.confirmation();

                await signerFactory(alice.sk)
                operation       = await councilInstance.methods.signAction(actionId).send()
                await operation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates a vestee', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionUpdateVestee(bob.pkh, new BigNumber(MVK(1000000000)), 0, 24).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin locks a vestee', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionToggleVesteeLock(bob.pkh).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes a vestee', async () => {
            try{
                // Operation
                councilStorage  = await councilInstance.storage();
                const actionId  = councilStorage.actionCounter;
                var operation   = await councilInstance.methods.councilActionRemoveVestee(bob.pkh).send()
                await operation.confirmation();

                await signerFactory(alice.sk)
                operation       = await councilInstance.methods.signAction(actionId).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin transfers token', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionTransfer(
                    bob.pkh,
                    mvkTokenAddress.address,
                    MVK(20),
                    "FA2",
                    0,
                    "For testing purposes"
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin requests token', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionRequestTokens(
                    treasuryAddress.address,
                    mvkTokenAddress.address,
                    "MVK",
                    MVK(20),
                    "FA2",
                    0,
                    "For testing purposes"
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin requests mint', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionRequestMint(
                    treasuryAddress.address,
                    MVK(20),
                    "For testing purposes"
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets another contract baker', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionSetContractBaker(treasuryAddress.address).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin drops financial request', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.councilActionDropFinancialReq(1).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin flushes an action', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.flushAction(1).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin signs an action', async () => {
            try{
                // Operation
                councilStorage  = await councilInstance.storage();
                const actionId  = councilStorage.actionCounter;
                var operation = await councilInstance.methods.councilActionRequestTokens(
                    treasuryAddress.address,
                    mvkTokenAddress.address,
                    "MVK",
                    MVK(20),
                    "FA2",
                    0,
                    "For testing purposes"
                ).send()
                await operation.confirmation();

                await signerFactory(alice.sk)
                operation = await councilInstance.methods.signAction(actionId).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("VESTING", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.updateWhitelistContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.updateGeneralContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin adds a new vestee', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.addVestee(bob.pkh, MVK(2000000), 0, 24).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates a vestee', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.updateVestee(bob.pkh, MVK(2000000), 0, 36).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin claims', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.claim().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin locks a vestee', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.toggleVesteeLock(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes a vestee', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.removeVestee(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("GOVERNANCE FINANCIAL", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates voting power ratio', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateConfig(2000, "configVotingPowerRatio").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the request approval percentage', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateConfig(10, "configFinancialReqApprovalPct").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the request duration in days', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateConfig(1, "configFinancialReqDurationDays").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateGeneralContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates whitelist token contracts', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateWhitelistTokenContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin requests tokens', async () => {
            try{
                // Operation
                councilStorage          = await councilInstance.storage()
                const actionCounter     = councilStorage.actionCounter
                var operation           = await councilInstance.methods.councilActionRequestTokens(
                    treasuryAddress.address,
                    mvkTokenAddress.address,
                    "MVK",
                    MVK(20),
                    "FA2",
                    0,
                    "For testing purposes"
                ).send()
                await operation.confirmation();
                await signerFactory(alice.sk)
                operation               = await councilInstance.methods.signAction(actionCounter).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin requests mint', async () => {
            try{
                // Operation
                councilStorage          = await councilInstance.storage()
                const actionCounter     = councilStorage.actionCounter
                var operation = await councilInstance.methods.councilActionRequestMint(
                    treasuryAddress.address,
                    MVK(20),
                    "For testing purposes"
                ).send()
                await operation.confirmation();
                await signerFactory(alice.sk)
                operation               = await councilInstance.methods.signAction(actionCounter).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin drops financial request', async () => {
            try{
                // Operation
                councilStorage              = await councilInstance.storage()
                governanceFinancialStorage  = await governanceFinancialInstance.storage()
                const requestToDrop         = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
                const actionCounter         = councilStorage.actionCounter
                var operation               = await councilInstance.methods.councilActionDropFinancialReq(requestToDrop).send()
                await operation.confirmation();
                await signerFactory(alice.sk)
                operation                   = await councilInstance.methods.signAction(actionCounter).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin votes for first request', async () => {
            try{
                // Operation
                councilStorage              = await councilInstance.storage()
                governanceFinancialStorage  = await governanceFinancialInstance.storage()
                const requestToDrop         = governanceFinancialStorage.financialRequestCounter.toNumber() - 2
                const operation             = await governanceFinancialInstance.methods.voteForRequest(requestToDrop, "approve").send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("TREASURY FACTORY", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.updateWhitelistContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.updateGeneralContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates whitelist token contracts', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.updateWhitelistTokenContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates treasury name max length', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.updateConfig(100, "configTreasuryNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses create treasury entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.togglePauseCreateTreasury().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses track treasury entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.togglePauseTrackTreasury().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses untrack treasury entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.togglePauseUntrackTreasury().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin creates a treasury', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.createTreasury(
                    "treasuryInteraction",
                    true,
                    treasuryMetadataBase
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin untracks a treasury', async () => {
            try{
                // Operation
                treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                const trackedTreasuries = treasuryFactoryStorage.trackedTreasuries
                createdTreasuryAddress  = trackedTreasuries[0]
                const operation = await treasuryFactoryInstance.methods.untrackTreasury(createdTreasuryAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin tracks a treasury', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.trackTreasury(createdTreasuryAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("TREASURY", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.updateWhitelistContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.updateGeneralContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates whitelist token contracts', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.updateWhitelistTokenContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses create transfer entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.togglePauseTransfer().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses mint and transfer entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.togglePauseMintMvkAndTransfer().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses stake MVK entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.togglePauseStakeMvk().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses unstake MVK entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.togglePauseUnstakeMvk().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("FARM FACTORY", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.updateWhitelistContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.updateGeneralContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates farm name max length', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.updateConfig(100, "configFarmNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates blocks per minute', async () => {
            try{
                // Operation
                councilStorage  = await councilInstance.storage();
                const actionId  = councilStorage.actionCounter;
                var operation = await councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, 3).send();
                await operation.confirmation();
                await signerFactory(alice.sk)
                operation = await councilInstance.methods.signAction(actionId).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses create farm entrypoint', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.togglePauseCreateFarm().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses track farm entrypoint', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.togglePauseTrackFarm().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses untrack farm entrypoint', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.togglePauseUntrackFarm().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin creates a farm', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.createFarm(
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase,
                    lpTokenAddress.address,
                    0,
                    "fa12",
                ).send();
                await operation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin untracks a farm', async () => {
            try{
                // Operation
                farmFactoryStorage  = await farmFactoryInstance.storage();
                const trackedFarms  = farmFactoryStorage.trackedFarms
                createdFarmAddress  = trackedFarms[0]
                const operation = await farmFactoryInstance.methods.untrackFarm(createdFarmAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin tracks a farm', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.trackFarm(createdFarmAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("FARM", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin init a farm', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.initFarm(
                    12000,
                    100,
                    2,
                    false,
                    false
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the rewards from transfer boolean', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.updateConfig(0, "configForceRewardFromTransfer").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates rewards per block', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.updateConfig(new BigNumber(MVK(2)), "configRewardPerBlock").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.updateWhitelistContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.updateGeneralContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses deposit entrypoint', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.togglePauseDeposit().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses withdraw entrypoint', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.togglePauseWithdraw().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses claim entrypoint', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.togglePauseClaim().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin deposits 2LP into the farm', async () => {
            try{
                // Operation
                var operation = await lpTokenInstance.methods.approve(farmAddress.address, 2).send()
                await operation.confirmation();
                operation = await farmInstance.methods.deposit(2).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin withdraw 1LP from the farm', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.withdraw(1).send();
                await operation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin claims from the farm', async () => {
            try{
                // Operation
                var operation   = await farmFactoryInstance.methods.trackFarm(farmAddress.address).send()
                await operation.confirmation();
                operation       = await farmInstance.methods.claim(bob.pkh).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin closes a farm', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.closeFarm().send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("GOVERNANCE", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance proxy', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.setGovernanceProxy(governanceProxyAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates success reward', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(new BigNumber(MVK(300)), "configSuccessReward").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates cycle voters reward', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(new BigNumber(MVK(500)), "configCycleVotersReward").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min proposal round vote pct', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min proposal round vote req', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min quorum pct', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min quorum mvk total', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1, "configMinQuorumMvkTotal").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates voting power ratio', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(2000, "configVotingPowerRatio").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates propose fee mutez', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1000000, "configProposeFeeMutez").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates max proposal per delegate', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(2, "configMaxProposalsPerDelegate").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates blocks per proposal round', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates blocks per voting round', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates blocks per timelock round', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates proposal data title max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(500, "configProposalDatTitleMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates proposal title max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(500, "configProposalTitleMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates proposal description max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1000, "configProposalDescMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates proposal invoice max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1000, "configProposalInvoiceMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates proposal code max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1000, "configProposalCodeMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist developers', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateWhitelistDevelopers(trudy.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateGeneralContracts("test", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets other contract admin', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.setContractAdmin(bob.pkh, doormanAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets other contract governance', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.setContractGovernance(governanceAddress.address, doormanAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin executes an entire proposal (with %executeProposal)', async () => {
            try{
                // Set the farm factory admin
                const setAdminOperation     = await farmFactoryInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation()

                // Initial values
                governanceStorage           = await governanceInstance.storage();
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

                // Create a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createFarm',
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase,
                    lpTokenAddress.address,
                    0,
                    "fa12",
                ).toTransferParams();
                const lambdaParamsValue = lambdaParams.parameter.value;
                const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                const referenceDataPacked = await utils.tezos.rpc.packData({
                    data: lambdaParamsValue,
                    type: proxyDataPackingHelperType
                }).catch(e => console.error('error:', e));

                var packedParam;
                if (referenceDataPacked) {
                    packedParam = referenceDataPacked.packed
                    console.log('packed %createFarm param: ' + packedParam);
                } else {
                throw `packing failed`
                };

                const proposalMetadata      = [
                    {
                        title: "FirstFarm#1",
                        data: packedParam
                    }
                ]

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                var addPaymentDataOperation   = await governanceInstance.methods.updatePaymentData(proposalId, "Payment#1", bob.pkh, "fa2", mvkTokenAddress.address, 0, MVK(50)).send()
                await addPaymentDataOperation.confirmation();
                addPaymentDataOperation   = await governanceInstance.methods.updatePaymentData(proposalId, "Payment#2", eve.pkh, "fa2", mvkTokenAddress.address, 0, MVK(20)).send()
                await addPaymentDataOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin executes an entire proposal (with %processProposalSingleData)', async () => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
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

                // Create a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createFarm',
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase,
                    lpTokenAddress.address,
                    0,
                    "fa12",
                ).toTransferParams();
                const lambdaParamsValue = lambdaParams.parameter.value;
                const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                const referenceDataPacked = await utils.tezos.rpc.packData({
                    data: lambdaParamsValue,
                    type: proxyDataPackingHelperType
                }).catch(e => console.error('error:', e));

                var packedParam;
                if (referenceDataPacked) {
                    packedParam = referenceDataPacked.packed
                    console.log('packed %createFarm param: ' + packedParam);
                } else {
                throw `packing failed`
                };

                const proposalMetadata      = [
                    {
                        title: "FirstFarm#1",
                        data: packedParam
                    },
                    {
                        title: "FirstFarm#2",
                        data: packedParam
                    },
                    {
                        title: "FirstFarm#3",
                        data: packedParam
                    },
                    {
                        title: "FirstFarm#4",
                        data: packedParam
                    },
                    {
                        title: "FirstFarm#5",
                        data: packedParam
                    }
                ]

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(false).send();
                await nextRoundOperation.confirmation();

                const executeSingleDataBatch = await utils.tezos.wallet
                .batch()
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                const processProposalSingleDataBatchOperation = await executeSingleDataBatch.send()
                await processProposalSingleDataBatchOperation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin drops a proposal', async () => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "proposal to drop";
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

                // Create a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createFarm',
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase,
                    lpTokenAddress.address,
                    0,
                    "fa12",
                ).toTransferParams();
                const lambdaParamsValue = lambdaParams.parameter.value;
                const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                const referenceDataPacked = await utils.tezos.rpc.packData({
                    data: lambdaParamsValue,
                    type: proxyDataPackingHelperType
                }).catch(e => console.error('error:', e));

                var packedParam;
                if (referenceDataPacked) {
                    packedParam = referenceDataPacked.packed
                    console.log('packed %createFarm param: ' + packedParam);
                } else {
                throw `packing failed`
                };

                const proposalMetadata      = [
                    {
                        title: "FirstFarm#1",
                        data: packedParam
                    }
                ]

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const dropOperation         = await governanceInstance.methods.dropProposal(proposalId).send();
                await dropOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe("EMERGENCY GOVERNANCE", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates vote expiry days', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(1, "configVoteExpiryDays").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates required fee mutez to trigger emergency', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(1000000, "configRequiredFeeMutez").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates SMVK percentage required', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(0, "configStakedMvkPercentRequired").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates minimum SMVK for voting', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(new BigNumber(MVK(0.1)), "configMinStakedMvkForVoting").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates minimum SMVK to trigger', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(new BigNumber(MVK(0.1)), "configMinStakedMvkForTrigger").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates proposal title max length', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(500, "configProposalTitleMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates proposal description max length', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(500, "configProposalDescMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateGeneralContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin triggers emergency governance', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("Emergency title", "Emergency description").send({amount: 1});
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin drops emergency governance', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.dropEmergencyGovernance().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin votes for emergency governance', async () => {
            try{
                // Operation
                var operation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("Emergency title", "Emergency description").send({amount: 1});
                await operation.confirmation();

                // Operation
                operation = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("BREAK GLASS", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates threshold', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(0, "configThreshold").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates action expiry days', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(1, "configActionExpiryDays").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates name max length', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(500, "configCouncilNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates website max length', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(500, "configCouncilWebsiteMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates image max length', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(500, "configCouncilImageMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateGeneralContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateWhitelistContracts("bob", bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates its council member info', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateCouncilMemberInfo("Bob", "https://mavryk.finance/", "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin adds a new council member', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.addCouncilMember(trudy.pkh, "Trudy", "https://mavryk.finance/", "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes a council member', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.removeCouncilMember(alice.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin changes a council member', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.changeCouncilMember(alice.pkh, trudy.pkh, "Trudy", "https://mavryk.finance/", "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin propagate break glass', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.propagateBreakGlass().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets single contract admin', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.setSingleContractAdmin(bob.pkh, governanceAddress.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets all contracts admin', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.setAllContractsAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.pauseAllEntrypoints().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unpauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.unpauseAllEntrypoints().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes break glass control', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.removeBreakGlassControl().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin flushes an action', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.flushAction(1).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin signs an action', async () => {
            try{
                // Operation
                breakGlassStorage   = await breakGlassInstance.storage();
                const recordId      = breakGlassStorage.actionCounter
                var operation = await breakGlassInstance.methods.flushAction(1).send();
                await operation.confirmation();

                await signerFactory(alice.sk)
                operation = await breakGlassInstance.methods.signAction(recordId).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })
});