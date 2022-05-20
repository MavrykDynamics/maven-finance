// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require('@taquito/taquito')
// const { InMemorySigner, importKey } = require('@taquito/signer')
// import { Utils, zeroAddress } from './helpers/Utils'
// import fs from 'fs'
// import { confirmOperation } from '../scripts/confirmation'

// const chai = require('chai')
// const assert = require('chai').assert
// const { createHash } = require('crypto')
// const chaiAsPromised = require('chai-as-promised')
// chai.use(chaiAsPromised)
// chai.should()

// import env from '../env'
// import { bob, alice, eve, mallory } from '../scripts/sandbox/accounts'

// import tokenAddress from '../deployments/mvkTokenAddress.json'
// import doormanAddress from '../deployments/doormanAddress.json'

// describe('MVK Token', async () => {
//   let utils: Utils

//   let tokenInstance
//   let tokenStorage

//   let bobTokenLedgerBase
//   let aliceTokenLedgerBase
//   let eveTokenLedgerBase
//   let malloryTokenLedgerBase

//   let totalSupplyBase

//   const signerFactory = async (sk) => {
//     await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(sk) })
//     return utils.tezos
//   }

//   before('setup', async () => {
//     utils = new Utils()
//     await utils.init(bob.sk)
//     tokenInstance = await utils.tezos.contract.at(tokenAddress.address)
//     tokenStorage = await tokenInstance.storage()
//     console.log('-- -- -- -- -- Token Tests -- -- -- --')
//     console.log('Token Contract deployed at:', tokenInstance.address)
//     console.log('Bob address: ' + bob.pkh)
//     console.log('Alice address: ' + alice.pkh)
//     console.log('Eve address: ' + eve.pkh)
//     console.log('Mallory address: ' + mallory.pkh)
//   })

//   beforeEach('storage', async () => {
//     tokenStorage = await tokenInstance.storage()
//     bobTokenLedgerBase = await tokenStorage.ledger.get(bob.pkh)
//     aliceTokenLedgerBase = await tokenStorage.ledger.get(alice.pkh)
//     eveTokenLedgerBase = await tokenStorage.ledger.get(eve.pkh)
//     malloryTokenLedgerBase = await tokenStorage.ledger.get(mallory.pkh)
//     totalSupplyBase = await tokenStorage.totalSupply
//     await signerFactory(bob.sk)
//   })

//   describe("%setAdmin", async () => {
//       beforeEach("Set signer to maintainer", async () => {
//           await signerFactory(bob.sk)
//       });
//       it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
//           try{
//               // Initial Values
//               tokenStorage = await tokenInstance.storage();
//               const currentAdmin = tokenStorage.maintainer;

//               // Operation
//               const setAdminOperation = await tokenInstance.methods.setAdmin(alice.pkh).send();
//               await setAdminOperation.confirmation();

//               // Final values
//               tokenStorage = await tokenInstance.storage();
//               const newAdmin = tokenStorage.maintainer;

//               // reset maintainer
//               await signerFactory(alice.sk);
//               const resetAdminOperation = await tokenInstance.methods.setAdmin(bob.pkh).send();
//               await resetAdminOperation.confirmation();

//               // Assertions
//               assert.notStrictEqual(newAdmin, currentAdmin);
//               assert.strictEqual(newAdmin, alice.pkh);
//               assert.strictEqual(currentAdmin, bob.pkh);
//           } catch(e){
//               console.log(e);
//           }
//       });
//       it('Non-maintainer should not be able to call this entrypoint', async () => {
//           try{
//               // Initial Values
//               await signerFactory(alice.sk);
//               tokenStorage = await tokenInstance.storage();
//               const currentAdmin = tokenStorage.maintainer;

//               // Operation
//               await chai.expect(tokenInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

//               // Final values
//               tokenStorage = await tokenInstance.storage();
//               const newAdmin = tokenStorage.maintainer;

//               // Assertions
//               assert.strictEqual(newAdmin, currentAdmin);
//           } catch(e){
//               console.log(e);
//           }
//       });
//   });

//   describe('%transfer', function () {
//     it('Bob sends 2000MVK to Eve', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 2000,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//           parseInt(bobTokenLedgerAfter),
//           parseInt(bobTokenLedgerBase.minus(2000)),
//           'Bob MVK Ledger should have ' +
//             (bobTokenLedgerBase.minus(2000)) +
//             'MVK but she has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//           parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase.plus(2000)),
//           'Eve MVK Ledger should have ' +
//             (eveTokenLedgerBase.plus(2000)) +
//             'MVK but she has ' +
//             eveTokenLedgerAfter +
//             'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Bob sends 0MVK to Alice', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 0,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//             'Bob MVK Ledger should have ' + bobTokenLedgerBase + 'MVK but she has ' + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt( aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           'Alice MVK Ledger should have ' + aliceTokenLedgerBase + 'MVK but she has ' + aliceTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Bob sends 3000MVK to herself', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: bob.pkh,
//                   token_id: 0,
//                   amount: 3000,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           'Bob MVK Ledger should have ' + bobTokenLedgerBase + 'MVK but she has ' + bobTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Bob sends 0MVK to herself', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: bob.pkh,
//                   token_id: 0,
//                   amount: 0,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           'Bob MVK Ledger should have ' + bobTokenLedgerBase + 'MVK but she has ' + bobTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Bob sends 250000001MVK to herself', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: bob.pkh,
//                   token_id: 0,
//                   amount: 250000001,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Bob shouldn't be able to send more than she has")
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Bob sends 2000MVK to herself then 20000MVK to Eve then 0MVK to Alice', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: bob.pkh,
//                   token_id: 0,
//                   amount: 2000,
//                 },
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 20000,
//                 },
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 0,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase.minus(20000)),
//           'Bob MVK Ledger should have ' +
//             (bobTokenLedgerBase.minus(20000)) +
//             'MVK but she has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           'Alice MVK Ledger should have ' + aliceTokenLedgerBase + 'MVK but she has ' + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase.plus(20000)),
//           'Eve MVK Ledger should have ' +
//             (eveTokenLedgerBase.plus(20000)) +
//             'MVK but she has ' +
//             eveTokenLedgerAfter +
//             'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Bob sends 250000001MVK to Alice', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 250000001,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Bob shouldn't be able to send more than she has")
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Bob sends 10MVK to Alice and 50MVK to Eve in one transaction', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 10,
//                 },
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 50,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase.minus(60)),
//           'Bob MVK Ledger should have ' +
//             (bobTokenLedgerBase.minus(60)) +
//             'MVK but she has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase.plus(10)),
//           'Alice MVK Ledger should have ' + (aliceTokenLedgerBase.plus(10)) + 'MVK but he has ' + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase.plus(50)),
//           'Eve MVK Ledger should have ' + (eveTokenLedgerBase.plus(50)) + 'MVK but she has ' + eveTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Alice sends 0MVK to Eve', async () => {
//       try {
//         await signerFactory(alice.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: alice.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 0,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Alice sends a 100 token from an id that is not supported in the contract to Bob ', async () => {
//       try {
//         await signerFactory(alice.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: alice.pkh,
//               txs: [
//                 {
//                   to_: bob.pkh,
//                   token_id: 1,
//                   amount: 100,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         assert.equal(
//           e.message,
//           'FA2_TOKEN_UNDEFINED',
//           "Alice shouldn't be able to send a token from an id that does not exist on the contract",
//         )
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Bob sends 2000MVK to Alice then 250000001MVK to him again', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 2000,
//                 },
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 250000001,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Bob shouldn't be able to send more than she has")
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Bob uses Eve address to transfer 200MVK to her and Alice address to transfer 35MVK to Eve without being one of Eve operators', async () => {
//       try {
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: bob.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//             {
//               from_: alice.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 35,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(e.message, 'FA2_NOT_OPERATOR', "Bob isn't the operator of Alice and Eve")
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase),
//           "Eve MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Alice become an operator on Bob address and send 200MVK from Bob Address to Eve', async () => {
//       try {
//         const updateOperatorsOperation = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperation.confirmation()

//         await signerFactory(alice.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase.minus(200)),
//           'Bob MVK Ledger should have ' +
//             (bobTokenLedgerBase.minus(200)) +
//             'MVK but she has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase.plus(200)),
//           'Eve MVK Ledger should have ' + (eveTokenLedgerBase.plus(200)) + 'MVK but she has ' + eveTokenLedgerAfter + 'MVK',
//         )
//         //Resetting Bob to be the current signer
//         await signerFactory(bob.sk)
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Alice is removed from Bob operators and send 200MVK from Bob Address to Eve', async () => {
//       try {
//         const updateOperatorsOperation = await tokenInstance.methods
//           .update_operators([
//             {
//               remove_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperation.confirmation()

//         await signerFactory(alice.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Bob")
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase),
//           "Eve MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Bob becomes an operator on Alice and Eve, then sends 300MVK from Alice and Eve accounts to her account', async () => {
//       try {
//         await signerFactory(alice.sk)
//         const updateOperatorsOperationAliceAdd = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: alice.pkh,
//                 operator: bob.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationAliceAdd.confirmation()

//         await signerFactory(eve.sk)
//         const updateOperatorsOperationEveAdd = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: eve.pkh,
//                 operator: bob.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationEveAdd.confirmation()

//         await signerFactory(bob.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: alice.pkh,
//               txs: [
//                 {
//                   to_: bob.pkh,
//                   token_id: 0,
//                   amount: 300,
//                 },
//               ],
//             },
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: bob.pkh,
//                   token_id: 0,
//                   amount: 300,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)

//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase.plus(600)),
//           'Bob MVK Ledger should have ' +
//             (bobTokenLedgerBase.plus(600)) +
//             'MVK but she has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase.minus(300)),
//           'Alice MVK Ledger should have ' + (aliceTokenLedgerBase.minus(300)) + 'MVK but he has ' + aliceTokenLedgerAfter + 'MVK',
//         )
//         // 0 should be set to 300 but look as previous issue with Taquito operator and Eve mentioned earlier
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase.minus(300)),
//           "Eve MVK Ledger shouldn't have changed. Should have " +
//             (eveTokenLedgerBase.minus(300)) +
//             'MVK but she has ' +
//             eveTokenLedgerAfter +
//             'MVK',
//         )

//         await signerFactory(alice.sk)
//         const updateOperatorsOperationAliceRemove = await tokenInstance.methods
//           .update_operators([
//             {
//               remove_operator: {
//                 owner: alice.pkh,
//                 operator: bob.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationAliceRemove.confirmation()

//         await signerFactory(eve.sk)
//         const updateOperatorsOperationEveRemove = await tokenInstance.methods
//           .update_operators([
//             {
//               remove_operator: {
//                 owner: eve.pkh,
//                 operator: bob.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationEveRemove.confirmation()
//         await signerFactory(bob.sk)
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     // Testing the same functions tested on Bob and Alice but for Eve and Mallory (non maintainer addresses)
//     it('Eve sends 2000MVK to Mallory', async () => {
//       try {
//         await signerFactory(eve.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: mallory.pkh,
//                   token_id: 0,
//                   amount: 2000,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase.minus(2000)),
//           "Eve's MVK Ledger should have " +
//             (eveTokenLedgerBase.minus(2000)) +
//             'MVK but she has ' +
//             eveTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//             parseInt(malloryTokenLedgerBase.plus(2000)),
//           "Mallory's MVK Ledger should have " +
//             (malloryTokenLedgerBase.plus(2000)) +
//             'MVK but she has ' +
//             malloryTokenLedgerAfter +
//             'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Eve sends 0MVK to Alice', async () => {
//       try {
//         await signerFactory(eve.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 0,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         assert.equal(
//           parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           'Eve MVK Ledger should have ' + eveTokenLedgerBase + 'MVK but she has ' + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase),
//           "Alice's MVK Ledger should have " + aliceTokenLedgerBase + 'MVK but she has ' + aliceTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Eve sends 3000MVK to herself', async () => {
//       try {
//         await signerFactory(eve.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 3000,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase),
//           "Eve's MVK Ledger should have " + eveTokenLedgerBase + 'MVK but she has ' + eveTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Eve sends 0MVK to herself', async () => {
//       try {
//           await signerFactory(eve.sk);
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 0,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK Ledger should have " + eveTokenLedgerBase + 'MVK but she has ' + eveTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Eve sends 250000001MVK to herself', async () => {
//       try {
//         await signerFactory(eve.sk)

//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 250000001,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const operators = await tokenStorage.operators
//         console.log(tokenStorage)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Eve shouldn't be able to send more than she has")
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Eve sends 2000MVK to herself then 20000MVK to Alice then 0MVK to Mallory', async () => {
//       try {
//         await signerFactory(eve.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 2000,
//                 },
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 20000,
//                 },
//                 {
//                   to_: mallory.pkh,
//                   token_id: 0,
//                   amount: 0,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase.minus(20000)),
//           "Eve's MVK Ledger should have " +
//             (eveTokenLedgerBase - 20000) +
//             'MVK but she has ' +
//             eveTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase.plus(20000)),
//           "Alice's MVK Ledger should have " +
//             (aliceTokenLedgerBase + 20000) +
//             'MVK but he has ' +
//             aliceTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase),
//           "Mallory's MVK Ledger should have " +
//             malloryTokenLedgerBase +
//             'MVK but she has ' +
//             malloryTokenLedgerAfter +
//             'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Eve sends 250000001MVK to Mallory', async () => {
//       try {
//         await signerFactory(eve.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: mallory.pkh,
//                   token_id: 0,
//                   amount: 250000001,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Eve shouldn't be able to send more than she has")
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase),
//           "Mallory's MVK balance shouldn't have changed: " + malloryTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Eve sends 10MVK to Mallory and 50MVK to Alice in one transaction', async () => {
//       try {
//           await signerFactory(eve.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: mallory.pkh,
//                   token_id: 0,
//                   amount: 10,
//                 },
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 50,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase.minus(60)),
//           "Eve's MVK Ledger should have " +
//             (eveTokenLedgerBase.minus(60)) +
//             'MVK but she has ' +
//             eveTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase.plus(10)),
//           "Mallory's MVK Ledger should have " +
//             (malloryTokenLedgerBase.plus(10)) +
//             'MVK but she has ' +
//             malloryTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//             parseInt(aliceTokenLedgerBase.plus(50)),
//           "Alice's MVK Ledger should have " + (aliceTokenLedgerBase.plus(50)) + 'MVK but he has ' + aliceTokenLedgerAfter + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Mallory sends a 100 tokens from an id that is not supported in the contract to Eve', async () => {
//       try {
//         await signerFactory(mallory.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: mallory.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 1,
//                   amount: 100,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//           e.message,
//           'FA2_TOKEN_UNDEFINED',
//           "Mallory shouldn't be able to send a token from an id that does not exist on the contract",
//         )
//         assert.equal(
//           parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + malloryTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase),
//           "Eve MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Eve sends 2000MVK to Mallory then 250000001MVK to her again', async () => {
//       try {
//         await signerFactory(eve.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: eve.pkh,
//               txs: [
//                 {
//                   to_: mallory.pkh,
//                   token_id: 0,
//                   amount: 2000,
//                 },
//                 {
//                   to_: mallory.pkh,
//                   token_id: 0,
//                   amount: 250000001,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Eve shouldn't be able to send more than she has")
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//             parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//             parseInt(malloryTokenLedgerBase),
//           "Mallory's MVK balance shouldn't have changed: " + malloryTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it("Eve uses Mallory's address to transfer 200MVK to herself and uses Alice's address to send 35MVK to herself without being one of Mallory or Alice's operators", async () => {
//       try {
//         await signerFactory(eve.sk)
//         const operation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: mallory.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//             {
//               from_: alice.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 35,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await operation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         assert.equal(e.message, 'FA2_NOT_OPERATOR', "Eve isn't the operator of Alice and Mallory")
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase),
//           "Alice's MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase),
//           "Mallory's MVK balance shouldn't have changed: " + malloryTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Eve becomes an operator on Mallory address and send 200MVK from Mallory Address to Alice', async () => {
//       try {
//         await signerFactory(mallory.sk)
//         const updateOperatorsOperation = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: mallory.pkh,
//                 operator: eve.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperation.confirmation()

//         await signerFactory(eve.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: mallory.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase.minus(200)),
//           "Mallory's MVK Ledger should have " +
//             (malloryTokenLedgerBase.minus(200)) +
//             'MVK but she has ' +
//             malloryTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase.plus(200)),
//           "Alice's MVK Ledger should have " +
//             (aliceTokenLedgerBase.plus(200)) +
//             'MVK but she has ' +
//             aliceTokenLedgerAfter +
//             'MVK',
//         )
//         //Resetting Bob to be the current signer
//         await signerFactory(bob.sk)
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Eve is removed from Mallory operators and send 200MVK from Mallory Address to Alice', async () => {
//       try {
//         await signerFactory(mallory.sk)
//         const updateOperatorsOperation = await tokenInstance.methods
//           .update_operators([
//             {
//               remove_operator: {
//                 owner: mallory.pkh,
//                 operator: eve.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperation.confirmation()

//         await signerFactory(eve.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: mallory.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         assert.equal(e.message, 'FA2_NOT_OPERATOR', "Eve isn't the operator of Mallory")
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase),
//           "Alice's MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase),
//           "Mallory's MVK balance shouldn't have changed: " + malloryTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it("Eve becomes an operator on Alice's and Mallory's accounts, then sends 300MVK from Alice's and Mallory's accounts to her account", async () => {
//       try {
//         await signerFactory(alice.sk)
//         const updateOperatorsOperationAliceAdd = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: alice.pkh,
//                 operator: eve.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationAliceAdd.confirmation()

//         await signerFactory(mallory.sk)
//         const updateOperatorsOperationMalloryAdd = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: mallory.pkh,
//                 operator: eve.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationMalloryAdd.confirmation()

//         await signerFactory(eve.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: alice.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 300,
//                 },
//               ],
//             },
//             {
//               from_: mallory.pkh,
//               txs: [
//                 {
//                   to_: eve.pkh,
//                   token_id: 0,
//                   amount: 300,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)

//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase.plus(600)),
//           "Eve's MVK Ledger should have " +
//             (eveTokenLedgerBase.plus(600)) +
//             'MVK but she has ' +
//             eveTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase.minus(300)),
//           'Alice MVK Ledger should have ' + (aliceTokenLedgerBase.minus(300)) + 'MVK but he has ' + aliceTokenLedgerAfter + 'MVK',
//         )

//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase.minus(300)),
//           "Mallory's MVK Ledger shouldn't have changed. Should have " +
//             (eveTokenLedgerBase.minus(300)) +
//             'MVK but she has ' +
//             malloryTokenLedgerAfter +
//             'MVK',
//         )

//         await signerFactory(alice.sk)
//         const updateOperatorsOperationAliceRemove = await tokenInstance.methods
//           .update_operators([
//             {
//               remove_operator: {
//                 owner: alice.pkh,
//                 operator: eve.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationAliceRemove.confirmation()

//         await signerFactory(mallory.sk)
//         const updateOperatorsOperationEveRemove = await tokenInstance.methods
//           .update_operators([
//             {
//               remove_operator: {
//                 owner: mallory.pkh,
//                 operator: eve.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationEveRemove.confirmation()
//         await signerFactory(eve.sk)
//       } catch (e) {
//         console.log(e)
//       }
//     })
//   })

//   describe('%update_operators', function () {
//     it('Bob makes Alice one of her operators then Alice sends 200MVK from Bob to himself', async () => {
//       try {
//         const updateOperatorsOperationAliceAdd = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationAliceAdd.confirmation()

//         const tokenStorageOperator = await tokenInstance.storage()
//         const operator = await tokenStorageOperator['operators'].get({
//           0: bob.pkh,
//           1: alice.pkh,
//           2: 0,
//         })

//         assert.notStrictEqual(operator, undefined, 'The operator should appear in the operators bigmap in the storage')

//         await signerFactory(alice.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()
//         const tokenStorageTransfer = await tokenInstance.storage()
//         const aliceTokenLedgerAfter = await tokenStorageTransfer.ledger.get(alice.pkh)
//         const bobTokenLedgerAfter = await tokenStorageTransfer.ledger.get(bob.pkh)

//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase.plus(200)),
//           'Alice MVK Ledger should have ' +
//             (aliceTokenLedgerBase.plus(200)) +
//             'MVK but he has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//           parseInt(bobTokenLedgerBase.minus(200)),
//           'Bob MVK Ledger should have ' +
//             (bobTokenLedgerBase.minus(200)) +
//             'MVK but she has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Bob removes Alice from her operators then Alice sends 200MVK from Bob to himself', async () => {
//       try {
//         const updateOperatorsOperationAliceRemove = await tokenInstance.methods
//           .update_operators([
//             {
//               remove_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()

//         await updateOperatorsOperationAliceRemove.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const operator = await tokenStorage['operators'].get({
//           0: bob.pkh,
//           1: alice.pkh,
//           2: 0,
//         })

//         assert.strictEqual(operator, undefined, 'The operator should not appear in the operators bigmap in the storage')

//         await signerFactory(alice.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()
//       } catch (e) {
//         const tokenStorageTransfer = await tokenInstance.storage()
//         const aliceTokenLedgerAfter = await tokenStorageTransfer.ledger.get(alice.pkh)
//         const bobTokenLedgerAfter = await tokenStorageTransfer.ledger.get(bob.pkh)
//         assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Bob")
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//           parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Bob makes Alice one of her operators, removes his address in one transaction then Alice sends 200MVK from Bob to himself', async () => {
//       try {
//         const updateOperatorsOperationAliceAdd = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//             {
//               remove_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationAliceAdd.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const operator = await tokenStorage['operators'].get({
//           0: bob.pkh,
//           1: alice.pkh,
//           2: 0,
//         })

//         assert.strictEqual(operator, undefined, 'The operator should not appear in the operator list in the storage')

//         await signerFactory(alice.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()
//       } catch (e) {
//         const tokenStorageTransfer = await tokenInstance.storage()
//         const aliceTokenLedgerAfter = await tokenStorageTransfer.ledger.get(alice.pkh)
//         const bobTokenLedgerAfter = await tokenStorageTransfer.ledger.get(bob.pkh)
//         assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Bob")
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//           parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//       }
//     })

//     it('Bob makes Alice one of her operators, removes his address in one transaction then adds it again  then Alice sends 200MVK from Bob to himself', async () => {
//       try {
//         const updateOperatorsOperationAliceAdd = await tokenInstance.methods
//           .update_operators([
//             {
//               add_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//             {
//               remove_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//             {
//               add_operator: {
//                 owner: bob.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationAliceAdd.confirmation()
//         tokenStorage = await tokenInstance.storage()
//         const operator = await tokenStorage['operators'].get({
//           0: bob.pkh,
//           1: alice.pkh,
//           2: 0,
//         })

//         assert.notStrictEqual(operator, undefined, 'The operator should appear in the operator bigmap in the storage')

//         await signerFactory(alice.sk)
//         const transferOperation = await tokenInstance.methods
//           .transfer([
//             {
//               from_: bob.pkh,
//               txs: [
//                 {
//                   to_: alice.pkh,
//                   token_id: 0,
//                   amount: 200,
//                 },
//               ],
//             },
//           ])
//           .send()
//         await transferOperation.confirmation()
//         const tokenStorageTransfer = await tokenInstance.storage()
//         const aliceTokenLedgerAfter = await tokenStorageTransfer.ledger.get(alice.pkh)
//         const bobTokenLedgerAfter = await tokenStorageTransfer.ledger.get(bob.pkh)

//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase.plus(200)),
//           'Alice MVK Ledger should have ' +
//             (aliceTokenLedgerBase.plus(200)) +
//             'MVK but he has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//           parseInt(bobTokenLedgerBase.minus(200)),
//           'Bob MVK Ledger should have ' +
//             (bobTokenLedgerBase.minus(200)) +
//             'MVK but she has ' +
//             bobTokenLedgerAfter +
//             'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Alice sets himself as an operator for Eve', async () => {
//       try {
//         await signerFactory(alice.sk)
//         const updateOperatorsOperationEveAdd = await tokenInstance.methods
//           .update_operators([
//             {
//               remove_operator: {
//                 owner: eve.pkh,
//                 operator: alice.pkh,
//                 token_id: 0,
//               },
//             },
//           ])
//           .send()
//         await updateOperatorsOperationEveAdd.confirmation()
//       } catch (e) {
//         assert.equal(e.message, 'FA2_NOT_OWNER', "Alice isn't the owner of Eve account so he cannot add operators to it")
//       }
//     })
//   })

//   describe('%mint', function () {
//     it("Bob tries to mint 20000MVK on Alice's address without being whitelisted", async () => {
//       try {
//         const mintAliceOperation = await tokenInstance.methods.mint(alice.pkh, 20000).send()
//         await mintAliceOperation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const totalSupplyAfter = await tokenStorage.totalSupply
//         assert.equal(
//           e.message,
//           'ONLY_WHITELISTED_CONTRACTS_ALLOWED',
//           "Bob address isn't in the whitelistContracts map",
//         )
//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase),
//           "Alice MVK balance shouldn't have changed: " + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(totalSupplyAfter),
//           parseInt(totalSupplyBase),
//           "MVK Total Supply shouldn't have changed: " + totalSupplyAfter + 'MVK',
//         )
//       }
//     })

//     it("Bob tries to mint 20000MVK on Alice's address being whitelisted", async () => {
//       try {
//         const whitelistBobOperationAdd = await tokenInstance.methods
//           .updateWhitelistContracts('bob', bob.pkh)
//           .send()
//         await whitelistBobOperationAdd.confirmation()

//         const mintAlice = await tokenInstance.methods.mint(alice.pkh, 20000).send()
//         await mintAlice.confirmation()

//         const whitelistBobOperationRemove = await tokenInstance.methods
//           .updateWhitelistContracts('bob', bob.pkh)
//           .send()
//         await whitelistBobOperationRemove.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const totalSupplyAfter = await tokenStorage.totalSupply

//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//             parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase.plus(20000)),
//           'Alice MVK Ledger should have ' +
//             (aliceTokenLedgerBase.plus(20000)) +
//             'MVK but he has ' +
//             aliceTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(totalSupplyAfter),
//           parseInt(totalSupplyBase.plus(20000)),
//           'MVK total supply should have increased by 20000MVK. Current supply: ' + totalSupplyBase + 'MVK',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it("Bob tries to mint 20000MVK on Alice's address being whitelisted and sending 5XTZ in the process", async () => {
//       try {
//         const whitelistBobOperationAdd = await tokenInstance.methods
//           .updateWhitelistContracts('bob', bob.pkh)
//           .send()
//         await whitelistBobOperationAdd.confirmation()
//         const mintAlice = await tokenInstance.methods.mint(alice.pkh, 20000).send({ amount: 5 })
//         await mintAlice.confirmation()
//       } catch (e) {
//         assert.equal(e.message, 'THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ', 'This entrypoint should not receive XTZ')
//         const whitelistBobOperationRemove = await tokenInstance.methods
//           .updateWhitelistContracts('bob', bob.pkh)
//           .send()
//         await whitelistBobOperationRemove.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const bobTokenLedgerAfter = await tokenStorage.ledger.get(bob.pkh)
//         const aliceTokenLedgerAfter = await tokenStorage.ledger.get(alice.pkh)
//         const totalSupplyAfter = await tokenStorage.totalSupply

//         assert.equal(
//             parseInt(bobTokenLedgerAfter),
//           parseInt(bobTokenLedgerBase),
//           "Bob MVK balance shouldn't have changed: " + bobTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(aliceTokenLedgerAfter),
//           parseInt(aliceTokenLedgerBase),
//           'Alice MVK Ledger should have ' + aliceTokenLedgerBase + 'MVK but he has ' + aliceTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(totalSupplyAfter),
//           parseInt(totalSupplyBase),
//           "MVK total supply shouldn't have increased. Current supply: " + totalSupplyAfter + 'MVK',
//         )
//       }
//     })

//     // Testing the same functions tested on Bob and Alice but for Eve and Mallory (non maintainer addresses)
//     it("Eve tries to mint 20000MVK on Mallory's address without being whitelisted", async () => {
//       try {
//         await signerFactory(eve.sk)
//         const mintMalloryOperation = await tokenInstance.methods.mint(mallory.pkh, 20000).send()
//         await mintMalloryOperation.confirmation()
//       } catch (e) {
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         const totalSupplyAfter = await tokenStorage.totalSupply
//         assert.equal(
//           e.message,
//           'ONLY_WHITELISTED_CONTRACTS_ALLOWED',
//           "Eve's address isn't in the whitelistContracts map",
//         )
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase),
//           "Mallory's MVK balance shouldn't have changed: " + malloryTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(totalSupplyAfter),
//           parseInt(totalSupplyBase),
//           "MVK Total Supply shouldn't have changed: " + totalSupplyAfter + 'MVK',
//         )
//       }
//     })

//     it("Eve tries to mint 20000MVK on Mallory's address being whitelisted", async () => {
//       try {
//         const whitelistEveOperationAdd = await tokenInstance.methods.updateWhitelistContracts('eve', eve.pkh).send()
//         await whitelistEveOperationAdd.confirmation()
//       } catch (e) {
//         assert.equal(e.message, 'ONLY_ADMINISTRATOR_ALLOWED', "Eve's address isn't an maintainer on the MVK Token contract")
//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         const totalSupplyAfter = await tokenStorage.totalSupply

//         const whitelistEveOperationRemove = await tokenInstance.methods.updateWhitelistContracts('eve', eve.pkh).send()
//         await whitelistEveOperationRemove.confirmation()
//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase),
//           "Mallory's MVK balance shouldn't have changed: " + malloryTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(totalSupplyAfter),
//             parseInt(totalSupplyBase),
//           "MVK Total Supply shouldn't have changed: " + totalSupplyAfter + 'MVK',
//         )
//       }
//     })

//     it("Eve tries to mint 20000MVK on Mallory's address being whitelisted and sending 5XTZ in the process", async () => {
//       try {
//         const whitelistEveOperationAdd = await tokenInstance.methods.updateWhitelistContracts('eve', eve.pkh).send()
//         await whitelistEveOperationAdd.confirmation()
//         const mintMallory = await tokenInstance.methods.mint(mallory.pkh, 20000).send({ amount: 5 })
//         await mintMallory.confirmation()
//       } catch (e) {
//         assert.equal(e.message, 'THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ', 'This entrypoint should not receive XTZ')
//         const whitelistEveOperationRemove = await tokenInstance.methods.updateWhitelistContracts('eve', eve.pkh).send()
//         await whitelistEveOperationRemove.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const eveTokenLedgerAfter = await tokenStorage.ledger.get(eve.pkh)
//         const malloryTokenLedgerAfter = await tokenStorage.ledger.get(mallory.pkh)
//         const totalSupplyAfter = await tokenStorage.totalSupply

//         assert.equal(
//             parseInt(eveTokenLedgerAfter),
//           parseInt(eveTokenLedgerBase),
//           "Eve's MVK balance shouldn't have changed: " + eveTokenLedgerAfter + 'MVK',
//         )
//         assert.equal(
//             parseInt(malloryTokenLedgerAfter),
//           parseInt(malloryTokenLedgerBase),
//           "Mallory's MVK Ledger should have " +
//             malloryTokenLedgerBase +
//             'MVK but he has ' +
//             malloryTokenLedgerAfter +
//             'MVK',
//         )
//         assert.equal(
//             parseInt(totalSupplyAfter),
//             parseInt(totalSupplyBase),
//           "MVK total supply shouldn't have increased. Current supply: " + totalSupplyAfter + 'MVK',
//         )
//       }
//     })

//     it("Whitelist should not be able to exceed the MVK Maximum total supply while minting", async () => {
//         try {
//             // Initial values
//             const maximumSupply = await tokenStorage.maximumSupply;
//             const currentTotalSupply = await tokenStorage.totalSupply;
//             const amountToMint = maximumSupply.minus(currentTotalSupply).plus(1);

//             // Fake a whitelist contract for minting - add
//             const whitelistOperationAdd = await tokenInstance.methods.updateWhitelistContracts('fake', eve.pkh).send()
//             await whitelistOperationAdd.confirmation()

//             // Mint token
//             await signerFactory(eve.sk);
//             await chai.expect(tokenInstance.methods.mint(eve.pkh,amountToMint).send()).to.be.rejected;

//             // Fake a whitelist contract for minting - remove
//             await signerFactory(bob.sk);
//             const whitelistOperationRemove = await tokenInstance.methods.updateWhitelistContracts('fake', eve.pkh).send()
//             await whitelistOperationRemove.confirmation()
            
//             // Refresh variables
//             tokenStorage = await tokenInstance.storage();
//             const currentTotalSupplyEnd = await tokenStorage.totalSupply;

//             assert.equal(parseInt(currentTotalSupply),parseInt(currentTotalSupplyEnd));
//         } catch (e) {
//             console.log(e)
//         }
//       })
//   })

//   describe('%updateWhitelistContracts', function () {
//     it('Adds Bob to the Whitelisted Contracts map', async () => {
//       try {
//         const oldWhitelistContractsMapBob = await tokenStorage['whitelistContracts'].get('bob')
//         const whitelistBobOperationAdd = await tokenInstance.methods
//           .updateWhitelistContracts('bob', bob.pkh)
//           .send()
//         await whitelistBobOperationAdd.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const newWhitelistContractsMapBob = await tokenStorage['whitelistContracts'].get('bob')

//         assert.strictEqual(
//           oldWhitelistContractsMapBob,
//           undefined,
//           'Bob should not be in the Whitelist Contracts map before adding her to it',
//         )
//         assert.strictEqual(
//           newWhitelistContractsMapBob,
//           bob.pkh,
//           'Bob should be in the Whitelist Contracts map after adding her to it',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Removes Bob from the Whitelisted Contracts map', async () => {
//       try {
//         const oldWhitelistContractsMapBob = await tokenStorage['whitelistContracts'].get('bob')
//         const whitelistBobOperationAdd = await tokenInstance.methods
//           .updateWhitelistContracts('bob', bob.pkh)
//           .send()
//         await whitelistBobOperationAdd.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const newWhitelistContractsMapBob = await tokenStorage['whitelistContracts'].get('bob')

//         assert.strictEqual(
//           oldWhitelistContractsMapBob,
//           bob.pkh,
//           'Bob should be in the Whitelist Contracts map before adding her to it',
//         )
//         assert.strictEqual(
//           newWhitelistContractsMapBob,
//           undefined,
//           'Bob should not be in the Whitelist Contracts map after adding her to it',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Adds Alice to the Whitelisted Contracts map', async () => {
//       try {
//         const oldWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice')
//         const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send()
//         await whitelistAliceOperationAdd.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const newWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice')

//         assert.strictEqual(
//           oldWhitelistContractsMapAlice,
//           undefined,
//           'Alice should not be in the Whitelist Contracts map before adding him to it',
//         )
//         assert.strictEqual(
//           newWhitelistContractsMapAlice,
//           alice.pkh,
//           'Alice should be in the Whitelist Contracts map after adding him to it',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Removes Alice from the Whitelisted Contracts map', async () => {
//       try {
//         const oldWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice')
//         const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send()
//         await whitelistAliceOperationAdd.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const newWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice')

//         assert.strictEqual(
//           oldWhitelistContractsMapAlice,
//           alice.pkh,
//           'Alice should be in the Whitelist Contracts map before adding him to it',
//         )
//         assert.strictEqual(
//           newWhitelistContractsMapAlice,
//           undefined,
//           'Alice should not be in the Whitelist Contracts map after adding him to it',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })
//   })

//   describe('%updateGeneralContracts', function () {
//     it('Adds Bob to the General Contracts map', async () => {
//       try {
//         const oldAddressesContractsMapBob = await tokenStorage['generalContracts'].get('bob')
//         const AddressesBobOperationAdd = await tokenInstance.methods.updateGeneralContracts('bob', bob.pkh).send()
//         await AddressesBobOperationAdd.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const newAddressesContractsMapBob = await tokenStorage['generalContracts'].get('bob')

//         assert.strictEqual(
//           oldAddressesContractsMapBob,
//           undefined,
//           'Bob should not be in the General Contracts map before adding her to it',
//         )
//         assert.strictEqual(
//           newAddressesContractsMapBob,
//           bob.pkh,
//           'Bob should be in the General Contracts map after adding her to it',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Removes Bob from the General Contracts map', async () => {
//       try {
//         const oldAddressesContractsMapBob = await tokenStorage['generalContracts'].get('bob')
//         const AddressesBobOperationAdd = await tokenInstance.methods.updateGeneralContracts('bob', bob.pkh).send()
//         await AddressesBobOperationAdd.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const newAddressesContractsMapBob = await tokenStorage['generalContracts'].get('bob')

//         assert.strictEqual(
//           oldAddressesContractsMapBob,
//           bob.pkh,
//           'Bob should be in the General Contracts map before adding her to it',
//         )
//         assert.strictEqual(
//           newAddressesContractsMapBob,
//           undefined,
//           'Bob should not be in the General Contracts map after adding her to it',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Adds Alice to the General Contracts map', async () => {
//       try {
//         const oldAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice')
//         const AddressesAliceOperationAdd = await tokenInstance.methods.updateGeneralContracts('alice', bob.pkh).send()
//         await AddressesAliceOperationAdd.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const newAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice')

//         assert.strictEqual(
//           oldAddressesContractsMapAlice,
//           undefined,
//           'Alice should not be in the General Contracts map before adding him to it',
//         )
//         assert.strictEqual(
//           newAddressesContractsMapAlice,
//           bob.pkh,
//           'Alice should be in the General Contracts map after adding alice to it',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     it('Removes Alice from the General Contracts map', async () => {
//       try {
//         const oldAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice')
//         const AddressesAliceOperationAdd = await tokenInstance.methods.updateGeneralContracts('alice', bob.pkh).send()
//         await AddressesAliceOperationAdd.confirmation()

//         tokenStorage = await tokenInstance.storage()
//         const newAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice')

//         assert.strictEqual(
//           oldAddressesContractsMapAlice,
//           bob.pkh,
//           'Bob should be in the General Contracts map before adding him to it',
//         )
//         assert.strictEqual(
//           newAddressesContractsMapAlice,
//           undefined,
//           'Alice should not be in the General Contracts map after adding him to it',
//         )
//       } catch (e) {
//         console.log(e)
//       }
//     })
//   })

//   describe('%assertMetadata', function () {
//     it('Checks an non-existent value in the metadata', async () => {
//       try {
//         const metadata = Buffer.from('test', 'ascii').toString('hex')
//         const operation = await tokenInstance.methods.assertMetadata('test', metadata).send()
//         await operation.confirmation()
//       } catch (e) {
//         assert.strictEqual(e.message, 'METADATA_NOT_FOUND', 'The metadata should not be found in the contract storage')
//       }
//     })

//     it('Checks a value with a correct key but a wrong hash in the metadata', async () => {
//       try {
//         const metadata = Buffer.from('test', 'ascii').toString('hex')
//         const operation = await tokenInstance.methods.assertMetadata('', metadata).send()
//         await operation.confirmation()
//       } catch (e) {
//         assert.strictEqual(
//           e.message,
//           'METADATA_HAS_A_WRONG_HASH',
//           'The metadata equal to the provided key should not be equal to the provided metata',
//         )
//       }
//     })

//     it('Checks a value with a correct key and a correct hash in the metadata', async () => {
//       try {
//         const metadata = Buffer.from(
//             JSON.stringify({
//                 name: 'MAVRYK',
//                 description: 'MAVRYK Token',
//                 authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//                 source: {
//                   tools: ['Ligo', 'Flextesa'],
//                   location: 'https://ligolang.org/',
//                 },
//                 interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
//                 errors: [],
//                 views: [],
//                 assets: [
//                   {
//                     symbol: Buffer.from('MVK').toString('hex'),
//                     name: Buffer.from('MAVRYK').toString('hex'),
//                     decimals: Buffer.from("9").toString('hex'),
//                     icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
//                     shouldPreferSymbol: true,
//                     thumbnailUri: 'https://mavryk.finance/logo192.png',
//                   },
//                 ],
//               }),
//               'ascii',
//             ).toString('hex')
//         const operation = await tokenInstance.methods.assertMetadata('data', metadata).send()
//         await operation.confirmation()
//       } catch (e) {
//         console.log(e)
//       }
//     })
//   })
// })
