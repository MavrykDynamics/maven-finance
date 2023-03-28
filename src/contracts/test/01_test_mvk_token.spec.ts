import { Utils } from './helpers/Utils'

const chai = require('chai')
const assert = require('chai').assert
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory } from '../scripts/sandbox/accounts'
import { mockTokenData } from './helpers/mockSampleData'
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe('MVK Token', async () => {

    let utils: Utils
    let tezos

    let tokenInstance
    let tokenStorage

    // init variables
    let sender
    let receiver 
    let tokenId = 0
    let tokenAmount

    // initial token balances
    let initialSenderTokenBalance
    let initialReceiverTokenBalance
    let initialBobTokenBalance
    let initialAliceTokenBalance
    let initialEveTokenBalance
    let initialMalloryTokenBalance
    let initialTotalSupply

    // updated token balances
    let updatedSenderTokenBalance
    let updatedReceiverTokenBalance
    let updatedBobTokenBalance
    let updatedAliceTokenBalance
    let updatedEveTokenBalance
    let updatedMalloryTokenBalance
    let updatedTotalSupply

    // operations
    let transferOperation
    let updateOperatorsOperation
    let removeOperatorsOperation
    let setAdminOperation
    let resetAdminOperation
    let mintOperation
    let updateWhitelistContractsOperation
    let updateWhitelistTokenContractsOperation
    let updateGeneralContractsOperation

    before('setup', async () => {
        
        utils = new Utils()
        await utils.init(bob.sk)
        tezos = utils.tezos;

        tokenInstance = await utils.tezos.contract.at(contractDeployments.mvkToken.address)
        tokenStorage  = await tokenInstance.storage()

    })

    beforeEach('storage', async () => {
        tokenStorage            = await tokenInstance.storage()
        await helperFunctions.signerFactory(tezos, bob.sk);
    })

    describe("%setAdmin", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{
                // Initial Values
                tokenStorage       = await tokenInstance.storage();
                const currentAdmin = tokenStorage.admin;

                // Operation
                setAdminOperation = await tokenInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                tokenStorage   = await tokenInstance.storage();
                const newAdmin = tokenStorage.admin;

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await tokenInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

            } catch(e){
                console.log(e);
            }
        });
        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                tokenStorage        = await tokenInstance.storage();
                const currentAdmin  = tokenStorage.admin;

                // Operation
                setAdminOperation = await tokenInstance.methods.setAdmin(alice.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                tokenStorage    = await tokenInstance.storage();
                const newAdmin  = tokenStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

    });

    describe('%transfer', function () {
        it('Bob sends 2000MVK to Eve', async () => {
            try {
                
                // init variables
                sender        = bob.pkh;
                receiver      = eve.pkh;
                tokenAmount   = 2000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);
                
                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber()   , +initialSenderTokenBalance.toNumber() - +tokenAmount);
                assert.equal(updatedReceiverTokenBalance.toNumber() , +initialReceiverTokenBalance.toNumber() + +tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it('Bob sends 0MVK to Alice', async () => {
            try {

                // init variables
                sender        = bob.pkh;
                receiver      = alice.pkh;
                tokenAmount   = 0;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber()   , +initialSenderTokenBalance.toNumber() - +tokenAmount);
                assert.equal(updatedReceiverTokenBalance.toNumber() , +initialReceiverTokenBalance.toNumber() + +tokenAmount);
                
            } catch (e) {
                console.log(e)
            }
        })

        it('Bob sends 3000MVK to himself', async () => {
            try {

                // init variables
                sender        = bob.pkh;
                receiver      = bob.pkh;
                tokenAmount   = 3000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber(), initialSenderTokenBalance.toNumber());
            
            } catch (e) {
                console.log(e)
            }
        })

        it('Bob sends 0MVK to himself', async () => {
            try {

                // init variables
                sender        = bob.pkh;
                receiver      = bob.pkh;
                tokenAmount   = 0;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber(), initialSenderTokenBalance.toNumber());

            } catch (e) {
                console.log(e)
            }
        })

        it('Bob sends 250000001MVK to himself', async () => {
            try {
                
                // init variables
                sender        = bob.pkh;
                receiver      = bob.pkh;
                tokenAmount   = 250000001;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Bob shouldn't be able to send more than she has")
                assert.equal(updatedSenderTokenBalance.toNumber(), initialSenderTokenBalance.toNumber());

            }
        })

        it('Bob sends 2000MVK to himself then 20000MVK to Eve then 0MVK to Alice', async () => {
            try {

                // init variables
                sender = bob.pkh;
                const amountSentToSelf = 2000;
                const amountSentToEve  = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // transfer operation
                transferOperation = await helperFunctions.fa2MultiTransfer(
                    tokenInstance, 
                    sender, 
                    [
                        [bob.pkh    , 0, amountSentToSelf],
                        [eve.pkh    , 0, amountSentToEve],
                        [alice.pkh  , 0, 0]
                    ]
                );
                await transferOperation.confirmation();

                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                assert.equal(updatedBobTokenBalance.toNumber(), +initialBobTokenBalance.toNumber() - +amountSentToEve)
                assert.equal(updatedEveTokenBalance.toNumber(), +initialEveTokenBalance.toNumber() + +amountSentToEve)
                assert.equal(updatedAliceTokenBalance.toNumber(), initialAliceTokenBalance.toNumber())

            } catch (e) {
                console.log(e)
            }
        })

        it('Bob sends 250000001MVK to Alice', async () => {
            try {

                // init variables
                sender        = bob.pkh;
                receiver      = alice.pkh;
                tokenAmount   = 250000001;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Bob shouldn't be able to send more than she has")
                assert.equal(updatedSenderTokenBalance.toNumber()   , initialSenderTokenBalance.toNumber());
                assert.equal(updatedReceiverTokenBalance.toNumber() , initialReceiverTokenBalance.toNumber());

            }
        })

        it('Bob sends 10MVK to Alice and 50MVK to Eve in one transaction', async () => {
            try {

                // init variables
                sender = bob.pkh;
                const amountSentToAlice = 10;
                const amountSentToEve   = 50;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // transfer operation
                transferOperation = await helperFunctions.fa2MultiTransfer(
                    tokenInstance, 
                    sender, 
                    [
                        [alice.pkh  , 0, amountSentToAlice],
                        [eve.pkh    , 0, amountSentToEve]
                    ]
                );
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                assert.equal(updatedSenderTokenBalance.toNumber()   , +initialSenderTokenBalance.toNumber() -  +amountSentToAlice - +amountSentToEve)
                assert.equal(updatedEveTokenBalance.toNumber()      , +initialEveTokenBalance.toNumber()    +  +amountSentToEve);
                assert.equal(updatedAliceTokenBalance.toNumber()    , +initialAliceTokenBalance.toNumber()  +  +amountSentToAlice);
            
            } catch (e) {
                console.log(e)
            }
        })

        it('Alice sends 0MVK to Eve', async () => {
            try {

                await helperFunctions.signerFactory(tezos, alice.sk);

                // init variables
                sender        = alice.pkh;
                receiver      = eve.pkh;
                tokenAmount   = 0;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber()   , initialSenderTokenBalance.toNumber());
                assert.equal(updatedReceiverTokenBalance.toNumber() , initialReceiverTokenBalance.toNumber());

            } catch (e) {
                console.log(e)
            }
        })

        it('Alice sends 100 MVK token with the wrong token id to Bob ', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, alice.sk);

                // init variables
                sender             = alice.pkh;
                receiver           = eve.pkh;
                tokenAmount        = 100;
                const wrongTokenId = 1;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, wrongTokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check error message
                assert.equal(e.message, 'FA2_TOKEN_UNDEFINED', "Alice shouldn't be able to send a token from a token id that does not exist on the contract",);

                // no changes in balances
                assert.equal(updatedSenderTokenBalance.toNumber()   , initialSenderTokenBalance.toNumber());
                assert.equal(updatedReceiverTokenBalance.toNumber() , initialReceiverTokenBalance.toNumber());
                
            }
        })

        it('Bob sends 2000MVK to Alice then 250000001MVK to Alice again', async () => {
            try {

                await helperFunctions.signerFactory(tezos, bob.sk);

                // init variables
                sender   = bob.pkh;
                receiver = alice.pkh;
                const amountSentToAlice       = 2000;
                const amountSentToAliceAgain  = 250000001;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2MultiTransfer(
                    tokenInstance, 
                    sender, 
                    [
                        [receiver, 0, amountSentToAlice],
                        [receiver, 0, amountSentToAliceAgain]
                    ]
                );
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check error message
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Bob shouldn't be able to send more than she has")
                
                // no changes in balance
                assert.equal(updatedSenderTokenBalance.toNumber()    , initialSenderTokenBalance.toNumber())
                assert.equal(updatedReceiverTokenBalance.toNumber()  , initialReceiverTokenBalance.toNumber());

            }
        })

        it('Bob uses Eve address to transfer 200MVK to himself, and uses Alice address to transfer 35MVK to Eve, without being operators for Eve and Alice', async () => {
            try {

                await helperFunctions.signerFactory(tezos, bob.sk);

                // init variables
                const amountSentToEve  = 35;
                const amountSentToBob  = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                transferOperation = await tokenInstance.methods.transfer([
                    {
                        from_: eve.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: amountSentToBob
                            }
                        ]
                    },
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: amountSentToEve
                            }
                        ]
                    }
                ]).send()
                await transferOperation.confirmation()

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check error message
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Bob isn't the operator of Alice and Eve")

                // no changes in balance
                assert.equal(updatedBobTokenBalance.toNumber()   , initialBobTokenBalance.toNumber())
                assert.equal(updatedEveTokenBalance.toNumber()   , initialEveTokenBalance.toNumber())
                assert.equal(updatedAliceTokenBalance.toNumber() , initialAliceTokenBalance.toNumber());
            }
        })

        it('Alice become an operator on Bob address and send 200MVK from Bob Address to Eve', async () => {
            try {

                // bob sets alice as operator
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, bob.pkh, alice.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

                // init variables 
                const from = bob.pkh;
                const to   = eve.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // transfer operation - alice transfer on bob's behalf
                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, from, to, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check balances
                assert.equal(updatedBobTokenBalance.toNumber()   , +initialBobTokenBalance.toNumber() - +tokenAmount);
                assert.equal(updatedEveTokenBalance.toNumber()   , +initialEveTokenBalance.toNumber() + +tokenAmount);
                assert.equal(updatedAliceTokenBalance.toNumber() , +initialAliceTokenBalance.toNumber());

            } catch (e) {
                console.log(e)
            }
        })

        it('Alice is removed from Bob operators and send 200MVK from Bob Address to Eve', async () => {
            try {

                // bob removes alice as operator
                await helperFunctions.signerFactory(tezos, bob.sk);
                removeOperatorsOperation = await helperFunctions.removeOperators(tokenInstance, bob.pkh, alice.pkh, tokenId);
                await removeOperatorsOperation.confirmation();

                // init variables 
                const from = bob.pkh;
                const to   = eve.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // transfer operation - alice transfer on bob's behalf
                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, from, to, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check error message
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Bob")

                // check no change in balances
                assert.equal(updatedBobTokenBalance.toNumber()   , initialBobTokenBalance.toNumber());
                assert.equal(updatedEveTokenBalance.toNumber()   , initialEveTokenBalance.toNumber());
                assert.equal(updatedAliceTokenBalance.toNumber() , initialAliceTokenBalance.toNumber());
            }
        })

        it('Bob becomes an operator on Alice and Eve, then sends 300MVK from Alice and Eve accounts to his account', async () => {
            try {

                // alice sets bob as operator
                await helperFunctions.signerFactory(tezos, alice.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, alice.pkh, bob.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

                // eve sets bob as operator
                await helperFunctions.signerFactory(tezos, eve.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, eve.pkh, bob.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

                // init variables 
                tokenAmount = 300;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                await helperFunctions.signerFactory(tezos, bob.sk);
                transferOperation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: tokenAmount
                            }
                        ]
                    },
                    {
                        from_: eve.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: tokenAmount
                            }
                        ]
                    }
                ]).send()
                await transferOperation.confirmation()

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check balances
                assert.equal(updatedBobTokenBalance.toNumber()   , +initialBobTokenBalance.toNumber()   +  +tokenAmount + +tokenAmount);
                assert.equal(updatedEveTokenBalance.toNumber()   , +initialEveTokenBalance.toNumber()   -  +tokenAmount);
                assert.equal(updatedAliceTokenBalance.toNumber() , +initialAliceTokenBalance.toNumber() -  +tokenAmount);

                // alice removes bob as operator
                await helperFunctions.signerFactory(tezos, alice.sk);
                removeOperatorsOperation = await helperFunctions.removeOperators(tokenInstance, alice.pkh, bob.pkh, tokenId);
                await removeOperatorsOperation.confirmation();

                // eve removes bob as operator
                await helperFunctions.signerFactory(tezos, eve.sk);
                removeOperatorsOperation = await helperFunctions.removeOperators(tokenInstance, eve.pkh, bob.pkh, tokenId);
                await removeOperatorsOperation.confirmation();
                
            } catch (e) {
                console.log(e)
            }
        })

        // Testing the same functions tested on Bob and Alice but for Eve and Mallory (non admin addresses)
        it('Eve sends 2000MVK to Mallory', async () => {
            try {

                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                sender        = eve.pkh;
                receiver      = mallory.pkh;
                tokenAmount   = 2000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber()   , +initialSenderTokenBalance.toNumber() - +tokenAmount);
                assert.equal(updatedReceiverTokenBalance.toNumber() , +initialReceiverTokenBalance.toNumber() + +tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it('Eve sends 0MVK to Alice', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                sender        = eve.pkh;
                receiver      = alice.pkh;
                tokenAmount   = 0;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber()   , +initialSenderTokenBalance.toNumber() - +tokenAmount);
                assert.equal(updatedReceiverTokenBalance.toNumber() , +initialReceiverTokenBalance.toNumber() + +tokenAmount);
                
            } catch (e) {
                console.log(e)
            }
        })

        it('Eve sends 3000MVK to herself', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                sender        = eve.pkh;
                receiver      = eve.pkh;
                tokenAmount   = 3000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber(), initialSenderTokenBalance.toNumber());

            } catch (e) {
                console.log(e)
            }
        })

        it('Eve sends 0MVK to herself', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);
                
                // init variables
                sender        = eve.pkh;
                receiver      = eve.pkh;
                tokenAmount   = 0;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber(), initialSenderTokenBalance.toNumber());

            } catch (e) {
                console.log(e)
            }
        })

        it('Eve sends 250000001MVK to herself', async () => {
            try {

                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                sender        = eve.pkh;
                receiver      = eve.pkh;
                tokenAmount   = 250000001;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);

                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Eve shouldn't be able to send more than she has")

                assert.equal(
                    initialSenderTokenBalance.toNumber(),
                    updatedSenderTokenBalance.toNumber(),
                    "Eve's MVK balance shouldn't have changed: " + updatedSenderTokenBalance + 'MVK',
                )
            }
        })

        it('Eve sends 2000MVK to herself then 20000MVK to Alice then 0MVK to Mallory', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                sender = eve.pkh;
                const amountSentToSelf   = 2000;
                const amountSentToAlice  = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // transfer operation
                transferOperation = await helperFunctions.fa2MultiTransfer(
                    tokenInstance, 
                    sender, 
                    [
                        [eve.pkh      , 0, amountSentToSelf],
                        [alice.pkh    , 0, amountSentToAlice],
                        [mallory.pkh  , 0, 0],
                    ]
                );
                await transferOperation.confirmation();

                tokenStorage                = await tokenInstance.storage()
                updatedMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                
                assert.equal(updatedEveTokenBalance.toNumber()      , +initialEveTokenBalance.toNumber() - +amountSentToAlice)
                assert.equal(updatedAliceTokenBalance.toNumber()    , +initialAliceTokenBalance.toNumber() + +amountSentToAlice)
                assert.equal(updatedMalloryTokenBalance.toNumber()  , initialMalloryTokenBalance.toNumber())

            } catch (e) {
                console.log(e)
            }
        })

        it('Eve sends 250000001MVK to Mallory', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                sender        = eve.pkh;
                receiver      = mallory.pkh;
                tokenAmount   = 250000001;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {
                
                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Eve shouldn't be able to send more than she has")
                assert.equal(updatedSenderTokenBalance.toNumber()   , initialSenderTokenBalance.toNumber());
                assert.equal(updatedReceiverTokenBalance.toNumber() , initialReceiverTokenBalance.toNumber());

            }
        })

        it('Eve sends 10MVK to Mallory and 50MVK to Alice in one transaction', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                sender = eve.pkh;
                const amountSentToMallory = 10;
                const amountSentToAlice   = 50;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                initialMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);

                // transfer operation
                transferOperation = await helperFunctions.fa2MultiTransfer(
                    tokenInstance, 
                    sender, 
                    [
                        [alice.pkh   , 0, amountSentToAlice],
                        [mallory.pkh , 0, amountSentToMallory]
                    ]
                );
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                updatedMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);

                assert.equal(updatedSenderTokenBalance.toNumber()   , +initialSenderTokenBalance.toNumber()  -  +amountSentToAlice - +amountSentToMallory)
                assert.equal(updatedMalloryTokenBalance.toNumber()  , +initialMalloryTokenBalance.toNumber() +  +amountSentToMallory);
                assert.equal(updatedAliceTokenBalance.toNumber()    , +initialAliceTokenBalance.toNumber()   +  +amountSentToAlice);

            } catch (e) {
                console.log(e)
            }
        })

        it('Mallory sends 100 MVK tokens with the wrong token id to Eve', async () => {
            try {

                await helperFunctions.signerFactory(tezos, mallory.sk);

                // init variables
                sender             = mallory.pkh;
                receiver           = eve.pkh;
                tokenAmount        = 100;
                const wrongTokenId = 1;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, wrongTokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check error message
                assert.equal(e.message, 'FA2_TOKEN_UNDEFINED', "Mallory shouldn't be able to send a token from a token id that does not exist on the contract",);

                // no changes in balances
                assert.equal(updatedSenderTokenBalance.toNumber()   , initialSenderTokenBalance.toNumber());
                assert.equal(updatedReceiverTokenBalance.toNumber() , initialReceiverTokenBalance.toNumber());

            }
        })

        it('Eve sends 2000MVK to Mallory then 250000001MVK to her again', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                sender   = eve.pkh;
                receiver = mallory.pkh;
                const amountSentToMallory       = 2000;
                const amountSentToMalloryAgain  = 250000001;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // transfer operation
                transferOperation = await helperFunctions.fa2MultiTransfer(
                    tokenInstance, 
                    sender, 
                    [
                        [receiver, 0, amountSentToMallory],
                        [receiver, 0, amountSentToMalloryAgain]
                    ]
                );
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check error message
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Eve shouldn't be able to send more than she has")
                
                // no changes in balance
                assert.equal(updatedSenderTokenBalance.toNumber()    , initialSenderTokenBalance.toNumber())
                assert.equal(updatedReceiverTokenBalance.toNumber()  , initialReceiverTokenBalance.toNumber());
            }
        })

        it("Eve uses Mallory's address to transfer 200MVK to herself, and uses Alice's address to send 35MVK to Mallory, without being operators for Mallory or Alice", async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);

                // init variables
                const amountSentToMallory  = 35;
                const amountSentToEve  = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                transferOperation = await tokenInstance.methods.transfer([
                    {
                        from_: mallory.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: amountSentToEve
                            }
                        ]
                    },
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: mallory.pkh,
                                token_id: 0,
                                amount: amountSentToMallory
                            }
                        ]
                    }
                ]).send()
                await transferOperation.confirmation()

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check error message
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Eve isn't the operator of Alice and Eve")

                // no changes in balance
                assert.equal(updatedEveTokenBalance.toNumber()      , initialEveTokenBalance.toNumber())
                assert.equal(updatedMalloryTokenBalance.toNumber()  , initialMalloryTokenBalance.toNumber())
                assert.equal(updatedAliceTokenBalance.toNumber()    , initialAliceTokenBalance.toNumber());
            }
        })

        it('Eve becomes an operator on Mallory address and send 200MVK from Mallory Address to Alice', async () => {
            try {

                // mallory sets eve as operator
                await helperFunctions.signerFactory(tezos, mallory.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, mallory.pkh, eve.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

                // init variables 
                const from  = mallory.pkh;
                const to    = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // transfer operation - eve transfer on mallory's behalf
                await helperFunctions.signerFactory(tezos, eve.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, from, to, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check balances
                assert.equal(updatedMalloryTokenBalance.toNumber()  , +initialMalloryTokenBalance.toNumber() - +tokenAmount);
                assert.equal(updatedAliceTokenBalance.toNumber()    , +initialAliceTokenBalance.toNumber() + +tokenAmount);
                assert.equal(updatedEveTokenBalance.toNumber()      , initialEveTokenBalance.toNumber());

            } catch (e) {
                console.log(e)
            }
        })

        it('Eve is removed from Mallory operators and send 200MVK from Mallory Address to Alice', async () => {
            try {

                // mallory removes eve as operator
                await helperFunctions.signerFactory(tezos, mallory.sk);
                removeOperatorsOperation = await helperFunctions.removeOperators(tokenInstance, mallory.pkh, eve.pkh, tokenId);
                await removeOperatorsOperation.confirmation();
                
                // init variables 
                const from  = mallory.pkh;
                const to    = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // transfer operation - eve transfer on mallory's behalf
                await helperFunctions.signerFactory(tezos, eve.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, from, to, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check error message
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Eve isn't the operator of Mallory")

                // check no change in balances
                assert.equal(updatedEveTokenBalance.toNumber()      , initialEveTokenBalance.toNumber());
                assert.equal(updatedMalloryTokenBalance.toNumber()  , initialMalloryTokenBalance.toNumber());
                assert.equal(updatedAliceTokenBalance.toNumber()    , initialAliceTokenBalance.toNumber());
                
            }
        })

        it("Eve becomes an operator on Alice's and Mallory's accounts, then sends 300MVK from Alice's and Mallory's accounts to her account", async () => {
            try {

                // alice sets eve as operator
                await helperFunctions.signerFactory(tezos, alice.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, alice.pkh, eve.pkh, tokenId);
                await updateOperatorsOperation.confirmation();
                
                // mallory sets eve as operator
                await helperFunctions.signerFactory(tezos, mallory.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, mallory.pkh, eve.pkh, tokenId);
                await updateOperatorsOperation.confirmation();
                
                // init variables 
                tokenAmount = 300;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // transfer operation
                await helperFunctions.signerFactory(tezos, eve.sk);
                transferOperation = await tokenInstance.methods.transfer([
                    {
                    from_: alice.pkh,
                    txs: [
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: tokenAmount,
                        },
                    ],
                    },
                    {
                    from_: mallory.pkh,
                    txs: [
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: tokenAmount,
                        },
                    ],
                    },
                ]).send()
                await transferOperation.confirmation()

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check balances
                assert.equal(updatedEveTokenBalance.toNumber()      , +initialEveTokenBalance.toNumber()      +  +tokenAmount + +tokenAmount);
                assert.equal(updatedMalloryTokenBalance.toNumber()  , +initialMalloryTokenBalance.toNumber()  -  +tokenAmount);
                assert.equal(updatedAliceTokenBalance.toNumber()    , +initialAliceTokenBalance.toNumber()    -  +tokenAmount);

                // alice removes eve as operator
                await helperFunctions.signerFactory(tezos, alice.sk);
                removeOperatorsOperation = await helperFunctions.removeOperators(tokenInstance, alice.pkh, eve.pkh, tokenId);
                await removeOperatorsOperation.confirmation();
                
                // mallory removes eve as operator
                await helperFunctions.signerFactory(tezos, mallory.sk);
                removeOperatorsOperation = await helperFunctions.removeOperators(tokenInstance, mallory.pkh, eve.pkh, tokenId);
                await removeOperatorsOperation.confirmation();
                
            } catch (e) {
                console.log(e)
            }
            })
    })

    describe('%update_operators', function () {
        it('Bob makes Alice one of his operators, then Alice sends 200MVK from Bob to himself', async () => {
            try {

                // bob sets alice as operator
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, bob.pkh, alice.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

                // check that operators are set 
                tokenStorage = await tokenInstance.storage()
                const operator = await tokenStorage['operators'].get({
                    0: bob.pkh,
                    1: alice.pkh,
                    2: 0,
                })
                assert.notStrictEqual(operator, undefined, 'The operator should appear in the operators bigmap in the storage')

                // init variables 
                const from  = bob.pkh;
                const to    = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage();
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, from, to, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage();
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check balances
                assert.equal(updatedAliceTokenBalance.toNumber()  , +initialAliceTokenBalance.toNumber() + +tokenAmount);
                assert.equal(updatedBobTokenBalance.toNumber()    , +initialBobTokenBalance.toNumber() - +tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it('Bob removes Alice from his operators, then Alice sends 200MVK from Bob to herself', async () => {
            try {
        
                // bob removes alice as operator
                await helperFunctions.signerFactory(tezos, bob.sk);
                removeOperatorsOperation = await helperFunctions.removeOperators(tokenInstance, bob.pkh, alice.pkh, tokenId);
                await removeOperatorsOperation.confirmation();

                // check that operators is now undefined
                tokenStorage = await tokenInstance.storage()
                const operator = await tokenStorage['operators'].get({
                    0: bob.pkh,
                    1: alice.pkh,
                    2: 0,
                })
                assert.strictEqual(operator, undefined, 'The operator should not appear in the operators bigmap in the storage')

                // init variables 
                const from = bob.pkh;
                const to   = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, from, to, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check error message
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Bob")

                // check no change in balances
                assert.equal(updatedBobTokenBalance.toNumber()    , initialBobTokenBalance.toNumber());
                assert.equal(updatedAliceTokenBalance.toNumber()  , initialAliceTokenBalance.toNumber());

            }
        })

        it('Bob makes Alice one of his operators, removes his address in one transaction then Alice sends 200MVK from Bob to herself', async () => {
            try {

                // bob sets alice as operator, and removes alice as operator, in the same transaction
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperatorsOperation = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: alice.pkh,
                            token_id: 0,
                        }
                    },
                    {
                        remove_operator: {
                            owner: bob.pkh,
                            operator: alice.pkh,
                            token_id: 0,
                        }
                    }
                ]).send()
                await updateOperatorsOperation.confirmation()
                
                // check that operator should be undefined
                tokenStorage = await tokenInstance.storage()
                const operator = await tokenStorage['operators'].get({
                    0: bob.pkh,
                    1: alice.pkh,
                    2: 0,
                })
                assert.strictEqual(operator, undefined, 'The operator should not appear in the operator list in the storage')

                // init variables 
                const from  = bob.pkh;
                const to    = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, from, to, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check error message
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Bob")

                // no changes in balance
                assert.equal(updatedBobTokenBalance.toNumber()      , initialBobTokenBalance.toNumber())
                assert.equal(updatedAliceTokenBalance.toNumber()    , initialAliceTokenBalance.toNumber());

            }
        })

        it('Bob makes Alice one of his operators, removes alice, then adds alice again in one operation; then Alice tries to send 200MVK from Bob to herself', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperatorsOperation = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    },
                    {
                        remove_operator: {
                            owner: bob.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    },
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperation.confirmation()

                // check that alice is set as bob's operator
                tokenStorage = await tokenInstance.storage()
                const operator = await tokenStorage['operators'].get({
                    0: bob.pkh,
                    1: alice.pkh,
                    2: 0,
                })
                assert.notStrictEqual(operator, undefined, 'The operator should appear in the operator bigmap in the storage')

                // init variables 
                const from  = bob.pkh;
                const to    = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, from, to, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);

                // check balances
                assert.equal(updatedBobTokenBalance.toNumber()      , +initialBobTokenBalance.toNumber()   -  +tokenAmount);
                assert.equal(updatedAliceTokenBalance.toNumber()    , +initialAliceTokenBalance.toNumber() +  +tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it('Alice sets herself as an operator for Eve', async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, alice.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, eve.pkh, alice.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

            } catch (e) {
                assert.equal(e.message, 'FA2_NOT_OWNER', "Alice isn't the owner of Eve account so he cannot add operators to it")
            }
        })
    })

    describe('%mint', function () {
        it("Bob tries to mint 20000MVK to Alice's address without being whitelisted", async () => {
            try {
                
                receiver    = alice.pkh;
                tokenAmount = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;

                mintOperation = await tokenInstance.methods.mint(receiver, tokenAmount).send()
                await mintOperation.confirmation()

            } catch (e) {
                
                tokenStorage = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                assert.equal(e.message, 'ONLY_WHITELISTED_CONTRACTS_ALLOWED', "Bob address isn't in the whitelistContracts map")
                assert.equal(updatedBobTokenBalance.toNumber()    , initialBobTokenBalance.toNumber());
                assert.equal(updatedAliceTokenBalance.toNumber()  , initialAliceTokenBalance.toNumber());
                assert.equal(updatedTotalSupply.toNumber()        , initialTotalSupply.toNumber());

            }
        })

        it("Bob tries to mint 20000MVK to Alice's address being whitelisted", async () => {
            try {
                
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('bob', bob.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

                // init variables
                const mintAmount = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;

                mintOperation = await tokenInstance.methods.mint(alice.pkh, mintAmount).send()
                await mintOperation.confirmation()

                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('bob', bob.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                assert.equal(updatedBobTokenBalance.toNumber()      , initialBobTokenBalance.toNumber());
                assert.equal(updatedAliceTokenBalance.toNumber()    , +initialAliceTokenBalance.toNumber() + +mintAmount);
                assert.equal(updatedTotalSupply.toNumber()          , +initialTotalSupply.toNumber() + +mintAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it("Bob tries to mint 20000MVK to Alice's address being whitelisted and sending 5XTZ in the process", async () => {
            try {
                
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('bob', bob.pkh).send()
                await updateWhitelistContractsOperation.confirmation()
                
                await chai.expect(tokenInstance.methods.mint(alice.pkh, 20000).send({ amount: 5 })).to.be.rejected;

                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('bob', bob.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        // Testing the same functions tested on Bob and Alice but for Eve and Mallory (non admin addresses)
        it("Eve tries to mint 20000MVK to Mallory's address without being whitelisted", async () => {
            try {
                
                await helperFunctions.signerFactory(tezos, eve.sk);

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;

                mintOperation = await tokenInstance.methods.mint(mallory.pkh, 20000).send()
                await mintOperation.confirmation()

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                // check error message
                assert.equal(e.message,'ONLY_WHITELISTED_CONTRACTS_ALLOWED',"Eve's address isn't in the whitelistContracts map")

                // check no change in balances
                assert.equal(updatedEveTokenBalance.toNumber()      , initialEveTokenBalance.toNumber());
                assert.equal(updatedMalloryTokenBalance.toNumber()  , initialMalloryTokenBalance.toNumber());
                assert.equal(updatedTotalSupply.toNumber()          , initialTotalSupply.toNumber());
            }
        })

        it("Eve tries to mint 20000MVK to Mallory's address being whitelisted", async () => {
            try {

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;
                
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('eve', eve.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

            } catch (e) {
                
                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedMalloryTokenBalance  = await tokenStorage.ledger.get(mallory.pkh);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                // check error message
                assert.equal(e.message, 'ONLY_ADMINISTRATOR_ALLOWED', "Eve's address isn't an admin on the MVK Token contract")
                
                // check no change in balances
                assert.equal(updatedEveTokenBalance.toNumber()      , initialEveTokenBalance.toNumber());
                assert.equal(updatedMalloryTokenBalance.toNumber()  , initialMalloryTokenBalance.toNumber());
                assert.equal(updatedTotalSupply.toNumber()          , initialTotalSupply.toNumber());

            }
        })

        it("Eve tries to mint 20000MVK to Mallory's address being whitelisted and sending 5XTZ in the process", async () => {
            try {

                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('eve', eve.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

                await chai.expect(tokenInstance.methods.mint(mallory.pkh, 20000).send({ amount: 5 })).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Whitelist should not be able to exceed the MVK Maximum total supply while minting", async () => {
            try {
                // Initial values
                const maximumSupply      = await tokenStorage.maximumSupply;
                initialTotalSupply       = await tokenStorage.totalSupply;
                const amountToMint       = maximumSupply.minus(initialTotalSupply).plus(1);

                // Fake a whitelist contract for minting - add
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('fake', eve.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

                // Mint token
                await helperFunctions.signerFactory(tezos, eve.sk);
                mintOperation = await tokenInstance.methods.mint(eve.pkh,amountToMint);
                await chai.expect(mintOperation.send()).to.be.rejected;

                // Fake a whitelist contract for minting - remove
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('fake', eve.pkh).send()
                await updateWhitelistContractsOperation.confirmation()
                
                // Refresh variables
                tokenStorage       = await tokenInstance.storage();
                updatedTotalSupply = await tokenStorage.totalSupply;

                assert.equal(initialTotalSupply.toNumber(), updatedTotalSupply.toNumber());

            } catch (e) {
                console.log(e)
            }
        })
    })

    describe('%updateWhitelistContracts', function () {
        it('Adds Eve to the Whitelisted Contracts map', async () => {
            try {

                const oldWhitelistContractsMapEve = await tokenStorage['whitelistContracts'].get('eve')
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('eve', eve.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                const newWhitelistContractsMapEve = await tokenStorage['whitelistContracts'].get('eve')

                assert.strictEqual(oldWhitelistContractsMapEve, undefined, 'Eve should not be in the Whitelist Contracts map before adding her to it')
                assert.strictEqual(newWhitelistContractsMapEve, eve.pkh,  'Eve should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('Removes Eve from the Whitelisted Contracts map', async () => {
            try {

                const oldWhitelistContractsMapEve = await tokenStorage['whitelistContracts'].get('eve')
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('eve', eve.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                const newWhitelistContractsMapEve = await tokenStorage['whitelistContracts'].get('eve')

                assert.strictEqual(oldWhitelistContractsMapEve, eve.pkh, 'Eve should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(newWhitelistContractsMapEve, undefined, 'Eve should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('Adds Alice to the Whitelisted Contracts map', async () => {
            try {

                const oldWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice')
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                const newWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice')

                assert.strictEqual(oldWhitelistContractsMapAlice, undefined, 'Alice should not be in the Whitelist Contracts map before adding him to it');
                assert.strictEqual(newWhitelistContractsMapAlice, alice.pkh, 'Alice should be in the Whitelist Contracts map after adding him to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('Removes Alice from the Whitelisted Contracts map', async () => {
            try {

                const oldWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice')
                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send()
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                const newWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice')

                assert.strictEqual(oldWhitelistContractsMapAlice, alice.pkh, 'Alice should be in the Whitelist Contracts map before adding him to it');
                assert.strictEqual(newWhitelistContractsMapAlice, undefined, 'Alice should not be in the Whitelist Contracts map after adding him to it');

            } catch (e) {
                console.log(e)
            }
        })
    })

    describe('%updateGeneralContracts', function () {
        it('Adds Bob to the General Contracts map', async () => {
            try {

                const oldAddressesContractsMapBob = await tokenStorage['generalContracts'].get('bob')
                updateGeneralContractsOperation = await tokenInstance.methods.updateGeneralContracts('bob', bob.pkh).send()
                await updateGeneralContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                const newAddressesContractsMapBob = await tokenStorage['generalContracts'].get('bob')

                assert.strictEqual(oldAddressesContractsMapBob, undefined, 'Bob should not be in the General Contracts map before adding her to it');
                assert.strictEqual(newAddressesContractsMapBob, bob.pkh, 'Bob should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('Removes Bob from the General Contracts map', async () => {
            try {

                const oldAddressesContractsMapBob = await tokenStorage['generalContracts'].get('bob')
                updateGeneralContractsOperation = await tokenInstance.methods.updateGeneralContracts('bob', bob.pkh).send()
                await updateGeneralContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                const newAddressesContractsMapBob = await tokenStorage['generalContracts'].get('bob')

                assert.strictEqual(oldAddressesContractsMapBob, bob.pkh, 'Bob should be in the General Contracts map before adding her to it');
                assert.strictEqual(newAddressesContractsMapBob, undefined, 'Bob should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('Adds Alice to the General Contracts map', async () => {
            try {

                const oldAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice')
                updateGeneralContractsOperation = await tokenInstance.methods.updateGeneralContracts('alice', bob.pkh).send()
                await updateGeneralContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                const newAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice')

                assert.strictEqual(oldAddressesContractsMapAlice, undefined, 'Alice should not be in the General Contracts map before adding him to it');
                assert.strictEqual(newAddressesContractsMapAlice, bob.pkh, 'Alice should be in the General Contracts map after adding alice to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('Removes Alice from the General Contracts map', async () => {
            try {

                const oldAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice')
                updateGeneralContractsOperation = await tokenInstance.methods.updateGeneralContracts('alice', bob.pkh).send()
                await updateGeneralContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                const newAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice')

                assert.strictEqual(oldAddressesContractsMapAlice, bob.pkh, 'Bob should be in the General Contracts map before adding him to it');
                assert.strictEqual(newAddressesContractsMapAlice, undefined, 'Alice should not be in the General Contracts map after adding him to it');

            } catch (e) {
                console.log(e)
            }
        })
    })

    describe('%assertMetadata', function () {
        it('Checks a non-existent value in the metadata', async () => {
            try {

                const metadata = Buffer.from('test', 'ascii').toString('hex')
                const operation = await tokenInstance.methods.assertMetadata('test', metadata).send()
                await operation.confirmation()

            } catch (e) {

                assert.strictEqual(e.message, 'METADATA_NOT_FOUND', 'The metadata cannot be found in the contract storage')

            }
        })

        it('Checks a value with a correct key but a wrong hash in the metadata', async () => {
            try {

                const metadata = Buffer.from('test', 'ascii').toString('hex')
                const operation = await tokenInstance.methods.assertMetadata('', metadata).send()
                await operation.confirmation()

            } catch (e) {

                assert.strictEqual(e.message, 'METADATA_HAS_A_WRONG_HASH', 'The metadata of the provided key does not match the provided metadata');
            }
        })

        it('Checks a value with a correct key and a correct hash in the metadata', async () => {
            try {
                
                const metadata = mockTokenData.mvkToken.metadata;
                const operation = await tokenInstance.methods.assertMetadata('data', metadata).send()
                await operation.confirmation()

            } catch (e) {
                console.log(e)
            }
        })
    })
})
