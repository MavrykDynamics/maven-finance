// const emergencyGovernance = artifacts.require('emergencyGovernance');
// const mvkToken = artifacts.require('mvkToken');

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// const { MichelsonMap } = require("@taquito/michelson-encoder");
// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");

// /**
//  * For testing on a babylonnet (testnet), instead of the sandbox network,
//  * make sure to replace the keys for alice/bob accordingly.
//  */
// const { alice, bob, eve, mallory } = require('../scripts/sandbox/accounts');
// const truffleConfig  = require("../truffle-config.js");
// const { unit } = require("../helpers/constants");

// contract('emergencyGovernance', accounts => {
//     let emergencyGovernanceInstance;
//     let mvkTokenInstance;

//     const signerFactory = async (pk) => {
//         await Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return Tezos;
//       };

//     before(async () => {

//         Tezos.setProvider({
//             rpc: `${truffleConfig.networks.development.host}:${truffleConfig.networks.development.port}`            
//         })

//         // default: set alice (admin) as originator of transactions
//         await signerFactory(alice.sk);

//         emergencyGovernanceInstance = await emergencyGovernance.deployed();
//         emergencyGovernanceInstance = await Tezos.contract.at(emergencyGovernanceInstance.address);

//         mvkTokenInstance            = await mvkToken.deployed();        
//         mvkTokenInstance            = await Tezos.contract.at(mvkTokenInstance.address);

//         emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
//         mvkStorage                  = await mvkTokenInstance.storage();

//         console.log('-- -- -- -- -- Deployments -- -- -- --')   
//         console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
//         console.log('MVK Contract deployed at:', mvkTokenInstance.address); 
//     });

//     it('alice can trigger emergency control', async () => {
//         try{        

//             beforeEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();

//             const triggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("New Emergency By Alice", "Help me please.").send();
//             await triggerEmergencyControlOperation.confirmation();
            
//             afterEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();
//             emergencyGovernanceProposal         = await afterEmergencyGovernanceStorage.emergencyGovernanceLedger.get('1');

//             console.log(beforeEmergencyGovernanceStorage);
//             console.log(afterEmergencyGovernanceStorage);
//             console.log(emergencyGovernanceProposal);
            
//         } catch (e){
//             console.log(e)
//         }
//     });

//     it('there can be only one emergency governance at any given time', async () => {
//         try{        

//             const failTriggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("New Emergency Again", "Help please.");
//             await chai.expect(failTriggerEmergencyControlOperation.send()).to.be.eventually.rejected;
            
//         } catch (e){
//             console.log(e)
//         }
//     });

//     it('eve can vote for emergency control (0 MVK < 100 MVK required)', async () => {
//         try{        

//             await signerFactory(eve.sk);

//             const voteForEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1).send();
//             await voteForEmergencyControlOperation.confirmation();

//             afterEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();
//             // emergencyGovernanceProposal         = await afterEmergencyGovernanceStorage.emergencyGovernanceLedger.get(1);

//             console.log(afterEmergencyGovernanceStorage);
//             // console.log(emergencyGovernanceProposal);

//             await signerFactory(alice.sk);
            
//         } catch (e){
//             console.log(e)
//         }
//     });

//     it('alice can vote for emergency control and trigger break glass (500 MVK > 100 MVK required)', async () => {
//         try{        

//             const voteForEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1).send();
//             await voteForEmergencyControlOperation.confirmation();

//             afterEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();
//             // emergencyGovernanceProposal         = await afterEmergencyGovernanceStorage.emergencyGovernanceLedger.get(1);

//             console.log(afterEmergencyGovernanceStorage);
//             // console.log(emergencyGovernanceProposal);
            
//         } catch (e){
//             console.log(e)
//         }
//     });

//     it('alice can drop emergency control', async () => {
//         try{        

//             const dropEmergencyControlOperation = await emergencyGovernanceInstance.methods.dropEmergencyGovernance(Tezos.unit).send();
//             await dropEmergencyControlOperation.confirmation();

//             afterEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();
//             emergencyGovernanceProposal         = await afterEmergencyGovernanceStorage.emergencyGovernanceLedger.get('1');

//             console.log(afterEmergencyGovernanceStorage);
//             console.log(emergencyGovernanceProposal);
            
//         } catch (e){
//             console.log(e)
//         }
//     });

//     it('bob can trigger emergency control after previous one is dropped', async () => {
//         try{        

//             await signerFactory(bob.sk);

//             beforeEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();

//             const triggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("New Emergency By Bob", "Help me please.").send();
//             await triggerEmergencyControlOperation.confirmation();
            
//             afterEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();
//             emergencyGovernanceProposal         = await afterEmergencyGovernanceStorage.emergencyGovernanceLedger.get('2');

//             console.log(emergencyGovernanceProposal);
            
//             await signerFactory(alice.sk);

//         } catch (e){
//             console.log(e)
//         }
//     });

// });
