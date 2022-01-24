// const governance = artifacts.require('governance');
// const delegation = artifacts.require('delegation');
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

// contract('governance', accounts => {

//     let governanceInstance;
//     let mvkTokenInstance;
//     let delegationInstance;

//     let governanceStorage;

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

//         governanceInstance   = await governance.deployed();
//         governanceInstance   = await Tezos.contract.at(governanceInstance.address);

//         delegationInstance = await delegation.deployed();
//         delegationInstance = await Tezos.contract.at(delegationInstance.address);

//         mvkTokenInstance = await mvkToken.deployed();        
//         mvkTokenInstance = await Tezos.contract.at(mvkTokenInstance.address);

//         governanceStorage    = await governanceInstance.storage();
//         delegationStorage    = await delegationInstance.storage();
//         mvkStorage           = await mvkTokenInstance.storage();
        
//         console.log('-- -- -- -- -- Deployments -- -- -- --')   
//         console.log('Governance Contract deployed at:', governanceInstance.address);        
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Contract deployed at:', mvkTokenInstance.address);      
//     });


//     // it('alice can make a proposal during a proposal round', async () => {
//     //     try{        
//     //         console.log(governanceStorage);
//     //     } catch(e){
//     //         console.log(e);
//     //     } 
//     // });

//      it('test add to set', async () => {
//         try{        

//             beforeGovernanceStorage     = await governanceInstance.storage();
//             console.log("before:")
//             console.log(beforeGovernanceStorage)
            


//             // const testAddToSetOperation = await governanceInstance.methods.updateActiveSatellitesMap(alice.pkh).send();
//             // await testAddToSetOperation.confirmation();

//             // await signerFactory(bob.sk);
//             // const testAddToSetOperation2 = await governanceInstance.methods.updateActiveSatellitesMap(bob.pkh).send();
//             // await testAddToSetOperation2.confirmation();


//             afterGovernanceStorage     = await governanceInstance.storage();
//             console.log("after:")
//             console.log(afterGovernanceStorage)

//         } catch(e){
//             console.log(e);
//         } 
//     });


// });

