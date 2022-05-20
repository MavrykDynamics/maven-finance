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
// const { alice, bob } = require('../scripts/sandbox/accounts');
// const truffleConfig  = require("../truffle-config.js");

// contract('mvkToken', accounts => {
//     let mvkStorage;
//     let mvkTokenInstance;

//     const signerFactory = async (pk) => {
//         await Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return Tezos;
//       };

//     before(async () => {

//         Tezos.setProvider({
//             rpc: `${truffleConfig.networks.development.host}:${truffleConfig.networks.development.port}`            
//         })

//         // default: set alice (maintainer) as originator of transactions
//         await signerFactory(alice.sk);

//         mvkTokenInstance = await mvkToken.deployed();
//         mvkTokenInstance = await Tezos.contract.at(mvkTokenInstance.address);

//         mvkStorage       = await mvkTokenInstance.storage();

//         console.log('-- -- -- -- -- Deployments -- -- -- --')   
//         console.log('MVK Contract deployed at:', mvkTokenInstance.address);
//     });

//     // it(`should store a balance of for Alice`, async () => {
//     //     const deployedLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
//     //     assert.equal(deployedLedgerAlice.balance, 500000000);
//     // });

//     // it(`should not store any balance for Bob`, async () => {
//     //     let balanceBob = await storage.ledger.get(bob.pkh);
//     //     assert.equal(balanceBob, undefined);
//     // });

//     it('should transfer 1 MVK token from Alice to Bob', async () => {
//         try{
//             const transferMvkTokenOperation = await mvkTokenInstance.methods.transfer(alice.pkh, bob.pkh, 1000000n).send();
//             await transferMvkTokenOperation.confirmation();

//             const deployedLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
//             const deployedLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
// console.log(deployedLedgerAlice);
//             const expectedBalanceBob   = 501000000;
//             const expectedBalanceAlice = 499000000;

//             assert.equal(deployedLedgerBob.balance, expectedBalanceBob);
//             assert.equal(deployedLedgerAlice.balance, expectedBalanceAlice);

//             // reset test to initial storage
//             await signerFactory(bob.sk);
//             const resetMvkTokenOperation = await mvkTokenInstance.methods.transfer(bob.pkh, alice.pkh, 1000000n).send();
//             await resetMvkTokenOperation.confirmation();
//             await signerFactory(alice.sk);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it(`should not allow transfers from an address that did not sign the transaction`, async () => {
//         try {        
//             const failTransferOperation = await mvkTokenInstance.methods.transfer(bob.pkh, alice.pkh, 1000000n);
//             await chai.expect(failTransferOperation.send()).to.be.eventually.rejected;
//         } catch (e) {
//             console.log(e);
//             // assert.equal(e.message, constants.contractErrors.notEnoughAllowance)
//         }
//     });

//     it(`should not transfer tokens from Alice to Bob when Alice's balance is insufficient`, async () => {
//         try {
//             const failTransferInsufficientOperation = await mvkTokenInstance.methods.transfer(alice.pkh, bob.pkh, 100000000000n);
//             await chai.expect(failTransferInsufficientOperation.send()).to.be.eventually.rejected;
//         } catch (e) {
//             console.log(e);
//             // assert.equal(e.message, constants.contractErrors.notEnoughBalance)
//         }
//     });

//     it(`should not allow anyone to burn tokens`, async () => {
//         try {
//             const failBurnTokenOperation = await mvkTokenInstance.methods.burn(alice.pkh, 1000000n);
//             await chai.expect(failBurnTokenOperation.send()).to.be.eventually.rejected;
//         } catch (e) {
//             assert.equal(e.message, constants.contractErrors.notAuthorized)
//         }
//     });

//     it(`should not allow anyone to mint tokens`, async () => {
//         try {
//             const failMintTokenOperation = await mvkTokenInstance.methods.mint(alice.pkh, 1000000n);
//             await chai.expect(failMintTokenOperation.send()).to.be.eventually.rejected;
//         } catch (e) {
//             console.log(e);
//             // assert.equal(e.message, constants.contractErrors.notAuthorized)
//         }
//     });

//     // it(`should allow doorman to burn tokens`, async () => {
//     //     try {
//     //         await mvkTokenInstance.burn(alice.pkh, 1);
//     //     } catch (e) {
//     //         assert.equal(e.message, constants.contractErrors.notAuthorized)
//     //     }
//     // });

// });
