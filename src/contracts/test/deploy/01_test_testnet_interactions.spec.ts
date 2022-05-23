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
import delegationAddress from '../../deployments/delegationAddress.json';
import councilAddress from '../../deployments/councilAddress.json'
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';
import governanceProxyAddress from '../../deployments/governanceProxyAddress.json';
import emergencyGovernanceAddress from '../../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress from '../../deployments/breakGlassAddress.json';
import lpTokenAddress from '../../deployments/lpTokenAddress.json'

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

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceProxyStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let councilStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

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
            
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvkTokenStorage                 = await mvkTokenInstance.storage();
        governanceStorage               = await governanceInstance.storage();
        governanceProxyStorage          = await governanceProxyInstance.storage();
        emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
        breakGlassStorage               = await breakGlassInstance.storage();
        councilStorage                  = await councilInstance.storage();

        console.log('-- -- -- -- -- Testnet Interactions Helper -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);        
    });

    // describe("DOORMAN", async () => {
    //     beforeEach("Set signer to admin", async () => {
    //         await signerFactory(bob.sk)
    //     });

    //     it('Admin add Doorman as an operator', async () => {
    //         try{
    //             // Operation
    //             const operation = await mvkTokenInstance.methods
    //                 .update_operators([
    //                 {
    //                     add_operator: {
    //                         owner: bob.pkh,
    //                         operator: doormanAddress.address,
    //                         token_id: 0,
    //                     },
    //                 },
    //                 ])
    //                 .send()
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin stakes 100MVK', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.stake(MVK(100)).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin unstakes 50MVK', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.unstake(MVK(50)).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin compounds', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.compound(bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin sets admin', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.setAdmin(bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin sets governance', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.setGovernance(governanceAddress.address).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates min MVK amount', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.updateMinMvkAmount(new BigNumber(MVK(0.01))).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates whitelist contracts', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.updateWhitelistContracts("test", bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates general contracts', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.updateGeneralContracts("test", bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses stake', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.togglePauseStake().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses unstake', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.togglePauseUnstake().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses compound', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.togglePauseCompound().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses farmClaim', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.togglePauseFarmClaim().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses all entrypoint', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.pauseAll().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin unpauses all entrypoint', async () => {
    //         try{
    //             // Operation
    //             const operation = await doormanInstance.methods.unpauseAll().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });
    // })

    // describe("DELEGATION", async () => {
    //     beforeEach("Set signer to admin", async () => {
    //         await signerFactory(bob.sk)
    //     });

    //     it('Admin sets admin', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.setAdmin(bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin sets governance', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.setGovernance(governanceAddress.address).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates min SMVK balance required to interact with the entrypoints', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateConfig(new BigNumber(MVK(0.01)), "configMinimumStakedMvkBalance").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates delegation ratio', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateConfig(100, "configDelegationRatio").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates maximum satellites', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateConfig(100, "configMaxSatellites").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates satellite name max length', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateConfig(500, "configSatNameMaxLength").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });


    //     it('Admin updates satellite description max length', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateConfig(1000, "configSatDescMaxLength").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });


    //     it('Admin updates satellite image max length', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateConfig(1000, "configSatImageMaxLength").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });


    //     it('Admin updates satellite website max length', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateConfig(1000, "configSatWebsiteMaxLength").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates whitelist contracts', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateWhitelistContracts("test", bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates general contracts', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.updateGeneralContracts("test", bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses delegateToSatellite', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.togglePauseDelegateToSatellite().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses undelegateSatellite', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.togglePauseUndelegateSatellite().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses registerSatellite', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses unregisterSatellite', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses updateSatellite', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.togglePauseUpdateSatellite().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses distributeReward', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.togglePauseDistributeReward().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses all entrypoint', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.pauseAll().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin unpauses all entrypoint', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.unpauseAll().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin registers as a satellite', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods
    //             .registerAsSatellite(
    //                 "Astronaut Satellite", 
    //                 "This is the description", 
    //                 "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3", 
    //                 "https://mavryk.finance/", 
    //                 1000
    //             ).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates its satellite record', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods
    //             .updateSatelliteRecord(
    //                 "Astronaut Satellite", 
    //                 "This is the description", 
    //                 "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3", 
    //                 "https://mavryk.finance/", 
    //                 1000
    //             ).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin unregister its satellite', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods
    //             .unregisterAsSatellite(bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin register as satellite and user delegates to it', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods
    //             .registerAsSatellite(
    //                 "Astronaut Satellite", 
    //                 "This is the description", 
    //                 "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3", 
    //                 "https://mavryk.finance/", 
    //                 1000
    //             ).send();
    //             await operation.confirmation();

    //             // Delegate Part
    //             await signerFactory(alice.sk)
    //             var delegationOperation = await mvkTokenInstance.methods
    //             .update_operators([
    //             {
    //                 add_operator: {
    //                     owner: alice.pkh,
    //                     operator: doormanAddress.address,
    //                     token_id: 0,
    //                 },
    //             },
    //             ])
    //             .send()
    //             await delegationOperation.confirmation()
    //             delegationOperation = await doormanInstance.methods.stake(MVK(10)).send()
    //             await delegationOperation.confirmation()
    //             delegationOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh, bob.pkh).send()
    //             await delegationOperation.confirmation()
    //         await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin distributes rewards', async () => {
    //         try{
    //             // Operation
    //             const operation = await delegationInstance.methods.distributeReward([bob.pkh], MVK(100)).send();
    //             await operation.confirmation();
    //         await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('User undelegates from satellite', async () => {
    //         try{
    //             // Operation
    //             await signerFactory(alice.sk)
    //             const operation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
    //             await operation.confirmation();
    //         await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });
    // });

    describe("GOVERNANCE", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        // it('Admin sets admin', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.setAdmin(bob.pkh).send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin sets governance proxy', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.setGovernanceProxy(governanceProxyAddress.address).send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates success reward', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(new BigNumber(MVK(300)), "configSuccessReward").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates cycle voters reward', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(new BigNumber(MVK(500)), "configCycleVotersReward").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates min proposal round vote pct', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates min proposal round vote req', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates min quorum pct', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates min quorum mvk total', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(1, "configMinQuorumMvkTotal").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates voting power ratio', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(2000, "configVotingPowerRatio").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates propose fee mutez', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(1000000, "configProposeFeeMutez").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates minimum stake req pct', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(0, "configMinimumStakeReqPercentage").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates max proposal per delegate', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(2, "configMaxProposalsPerDelegate").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates blocks per proposal round', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates blocks per voting round', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates blocks per timelock round', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });
        
        // it('Admin updates proposal data title max length', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(500, "configProposalDatTitleMaxLength").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });
        
        // it('Admin updates proposal title max length', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(500, "configProposalTitleMaxLength").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });


        // it('Admin updates proposal description max length', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(1000, "configProposalDescMaxLength").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });


        // it('Admin updates proposal invoice max length', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(1000, "configProposalInvoiceMaxLength").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });


        // it('Admin updates proposal code max length', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateConfig(1000, "configProposalCodeMaxLength").send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates whitelist developers', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateWhitelistDevelopers(trudy.pkh).send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin updates general contracts', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.updateGeneralContracts("test", bob.pkh).send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin sets other contract admin', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.setContractAdmin(bob.pkh, doormanAddress.address).send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin sets other contract governance', async () => {
        //     try{
        //         // Operation
        //         const operation = await governanceInstance.methods.setContractGovernance(governanceAddress.address, doormanAddress.address).send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        it('Admin starts an entire governance cycle (with %executeProposal at the end)', async () => {
            try{
                // Initial values
                // governanceStorage           = await governanceInstance.storage();
                // const proposalId            = governanceStorage.nextProposalId.toNumber();
                // const proposalName          = "Create a farm";
                // const proposalDesc          = "Details about new proposal";
                // const proposalIpfs          = "ipfs://QM123456789";
                // const proposalSourceCode    = "Proposal Source Code";

                // const farmMetadataBase = Buffer.from(
                //     JSON.stringify({
                //     name: 'MAVRYK PLENTY-USDTz Farm',
                //     description: 'MAVRYK Farm Contract',
                //     version: 'v1.0.0',
                //     liquidityPairToken: {
                //         tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
                //         origin: ['Plenty'],
                //         token0: {
                //             symbol: ['PLENTY'],
                //             tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
                //         },
                //         token1: {
                //             symbol: ['USDtz'],
                //             tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
                //         }
                //     },
                //     authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                //     }),
                //     'ascii',
                // ).toString('hex')

                // // Create a farm compiled params
                // const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                //     'createFarm',
                //     false,
                //     false,
                //     12000,
                //     100,
                //     farmMetadataBase,
                //     lpTokenAddress.address,
                //     0,
                //     "fa12",
                // ).toTransferParams();
                // const lambdaParamsValue = lambdaParams.parameter.value;
                // const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                // const referenceDataPacked = await utils.tezos.rpc.packData({
                //     data: lambdaParamsValue,
                //     type: proxyDataPackingHelperType
                // }).catch(e => console.error('error:', e));

                // var packedParam;
                // if (referenceDataPacked) {
                //     packedParam = referenceDataPacked.packed
                //     console.log('packed %createFarm param: ' + packedParam);
                // } else {
                // throw `packing failed`
                // };

                // const proposalMetadata      = MichelsonMap.fromLiteral({
                //     "FirstFarm#1": packedParam
                // });

                // // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                // await nextRoundOperation.confirmation();

                // const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                // await proposeOperation.confirmation();
                // var addPaymentDataOperation   = await governanceInstance.methods.addUpdatePaymentData(proposalId, "Payment#1", bob.pkh, "fa2", mvkTokenAddress.address, 0, MVK(50)).send()
                // await addPaymentDataOperation.confirmation();
                // addPaymentDataOperation   = await governanceInstance.methods.addUpdatePaymentData(proposalId, "Payment#2", eve.pkh, "fa2", mvkTokenAddress.address, 0, MVK(20)).send()
                // await addPaymentDataOperation.confirmation();
                // const addMetadataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "FirstFarm#2", packedParam).send();
                // await addMetadataOperation.confirmation();
                // const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                // await lockOperation.confirmation();
                // var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                // await voteOperation.confirmation();
                // await signerFactory(alice.sk);
                // voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                // await voteOperation.confirmation();
                // await signerFactory(bob.sk);
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
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin starts an entire governance cycle (with %processProposalSingleData at the end)', async () => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update maxSatellites";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                const proposalPaymentData   = MichelsonMap.fromLiteral({
                    "Payment#1": {
                        "to_"    : bob.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : mvkTokenAddress.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVK(50)
                    },
                    "Payment#2": {
                        "to_"    : eve.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : mvkTokenAddress.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVK(20)
                    },
                });

                // Update general map compiled params
                const firstLambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateDelegationConfig',
                    23,
                    'configMaxSatellites'
                ).toTransferParams();
                const firstLambdaParamsValue = firstLambdaParams.parameter.value;
                const firstProxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                const firstReferenceDataPacked = await utils.tezos.rpc.packData({
                    data: firstLambdaParamsValue,
                    type: firstProxyDataPackingHelperType
                }).catch(e => console.error('error:', e));

                var firstPackedParam;
                if (firstReferenceDataPacked) {
                    firstPackedParam = firstReferenceDataPacked.packed
                    console.log('packed %updateDelegationConfig param: ' + firstPackedParam);
                } else {
                    throw `packing failed`
                };

                const secondLambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateDelegationConfig',
                    15,
                    'configMaxSatellites'
                ).toTransferParams();
                const secondLambdaParamsValue = secondLambdaParams.parameter.value;
                const secondProxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                const secondReferenceDataPacked = await utils.tezos.rpc.packData({
                    data: secondLambdaParamsValue,
                    type: secondProxyDataPackingHelperType
                }).catch(e => console.error('error:', e));

                var secondPackedParam;
                if (secondReferenceDataPacked) {
                    secondPackedParam = secondReferenceDataPacked.packed
                    console.log('packed %updateDelegationConfig param: ' + secondPackedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "MaxSatellites#1": secondPackedParam,
                    "MaxSatellites#2": firstPackedParam,
                    "MaxSatellites#3": firstPackedParam,
                    "MaxSatellites#4": firstPackedParam,
                    "MaxSatellites#5": firstPackedParam,
                    "MaxSatellites#6": firstPackedParam,
                    "MaxSatellites#7": firstPackedParam,
                    "MaxSatellites#8": firstPackedParam,
                    "MaxSatellites#9": firstPackedParam,
                    "MaxSatellites#10": firstPackedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata, proposalPaymentData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                // await signerFactory(alice.sk);
                // voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                // await voteOperation.confirmation();
                // await signerFactory(bob.sk);
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
                nextRoundOperation          = await governanceInstance.methods.startNextRound(false).send();
                await nextRoundOperation.confirmation();

                // Process data in batch and check which operation was executed last
                const executeSingleDataBatch = await utils.tezos.wallet
                .batch()
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                .withContractCall(governanceInstance.methods.processProposalSingleData())
                .withContractCall(governanceInstance.methods.processProposalSingleData())
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
    })
});