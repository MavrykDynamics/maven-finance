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

describe('Test: MVK Token Contract', async () => {

    // default
    let utils: Utils
    let tezos

    // contract instances and storage
    let tokenInstance
    let tokenStorage

    // common inputs 
    let sender
    let receiver 
    let tokenId = 0
    let tokenAmount
    let operator
    let operatorKey

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

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue

    // operations
    let transferOperation
    let updateOperatorsOperation
    let removeOperatorsOperation
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let mintOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation

    before('setup', async () => {
        
        utils = new Utils()
        await utils.init(bob.sk)
        tezos = utils.tezos;

        tokenInstance = await utils.tezos.contract.at(contractDeployments.mvkToken.address)
        tokenStorage  = await tokenInstance.storage()

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    })

    beforeEach('storage', async () => {
        tokenStorage            = await tokenInstance.storage()
    })

    describe('%transfer', function () {
        
        beforeEach("Set signer to user (eve)", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it('user (eve) should be able to send non-zero MVK amount to another user (mallory)', async () => {
            try {

                // init variables
                sender      = eve.pkh;
                receiver    = mallory.pkh;
                tokenAmount = 2000;

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

        it('user (eve) should be able to send zero MVK to another user (alice)', async () => {
            try {

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

        it('user (eve) should be able to send non-zero MVK amount to herself', async () => {
            try {

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

        it('user (eve) should be able to send zero MVK to herself', async () => {
            try {
                
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

        it('user (eve) should not be able to send more MVK than what she has to herself', async () => {
            try {

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
                assert.equal(updatedSenderTokenBalance.toNumber(), initialSenderTokenBalance.toNumber());

            }
        })

        it('user (eve) should not be able to send more MVK than what she has to another user (mallory)', async () => {
            try {

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

        it('user (eve) should be able to send variable amounts of MVK (including zero) to multiple users (alice, mallory, herself) in a single transaction', async () => {
            try {

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

        it('user (eve) should be able to send variable amounts of MVK (10, 50) to multiple users (mallory, alice) in one transaction', async () => {
            try {

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

        it('user (eve) should not be able to send MVK with the wrong token id to another user (mallory)', async () => {
            try {

                // init variables
                sender             = eve.pkh;
                receiver           = mallory.pkh;
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

        it('user (eve) should not be able to send more than MVK what she has to another user (mallory)', async () => {
            try {

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

        it("user (eve) should not be able to make transfers on another user's (alice, mallory) behalf without being their operators", async () => {
            try {

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

        it("user (eve) should be able to make transfers on another user's (mallory) behalf if they are set as operators", async () => {
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

        it("user (eve) should not be able to make transfers on another user's (mallory) behalf if they are removed as operators", async () => {
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

        it("user (eve) should be able to make multiple transfers on multiple users' (alice, mallory) behalf if she is set as operators", async () => {
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

        beforeEach("Set signer to user (eve)", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk);
        });
        
        it("user (eve) should be able to add another user (alice) as an operator, and operator (alice) should be able to make transfers on eve's behalf", async () => {
            try {

                // eve sets alice as operator
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, eve.pkh, alice.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

                // check that operators are set 
                tokenStorage = await tokenInstance.storage()
                operatorKey = {
                    0 : eve.pkh,
                    1 : alice.pkh,
                    2 : 0,
                }
                operator = await helperFunctions.getStorageMapValue(tokenStorage, 'operators', operatorKey);
                assert.notStrictEqual(operator, undefined, 'The operator should appear in the operators bigmap in the storage')

                // init variables 
                sender        = eve.pkh;
                receiver      = alice.pkh;
                tokenAmount   = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage();
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage();
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber()    , +initialSenderTokenBalance.toNumber()   - +tokenAmount);
                assert.equal(updatedReceiverTokenBalance.toNumber()  , +initialReceiverTokenBalance.toNumber() + +tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

        // it('Bob removes Alice from his operators, then Alice sends 200MVK from Bob to herself', async () => {
        it("user (eve) should be able to remove user (alice) as an operator, and operator (alice) should then not be able to make transfers on eve's behalf", async () => {
            try {
        
                // eve removes alice as operator
                removeOperatorsOperation = await helperFunctions.removeOperators(tokenInstance, eve.pkh, alice.pkh, tokenId);
                await removeOperatorsOperation.confirmation();

                // check that operators is now undefined
                tokenStorage = await tokenInstance.storage()
                operatorKey = {
                    0 : eve.pkh,
                    1 : alice.pkh,
                    2 : 0,
                }
                operator = await helperFunctions.getStorageMapValue(tokenStorage, 'operators', operatorKey);
                assert.strictEqual(operator, undefined, 'The operator should not appear in the operators bigmap in the storage')

                // init variables 
                sender      = eve.pkh;
                receiver    = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check error message
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Eve")

                // check no change in balances
                assert.equal(updatedSenderTokenBalance.toNumber()    , initialSenderTokenBalance.toNumber());
                assert.equal(updatedReceiverTokenBalance.toNumber()  , initialReceiverTokenBalance.toNumber());

            }
        })

        it('user (eve) should be able to add and remove an operator (alice) in the same transaction', async () => {
            try {

                // eve sets alice as operator, and removes alice as operator, in the same transaction
                updateOperatorsOperation = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: alice.pkh,
                            token_id: 0,
                        }
                    },
                    {
                        remove_operator: {
                            owner: eve.pkh,
                            operator: alice.pkh,
                            token_id: 0,
                        }
                    }
                ]).send()
                await updateOperatorsOperation.confirmation()
                
                // check that operator should be undefined
                tokenStorage = await tokenInstance.storage()
                operatorKey = {
                    0 : eve.pkh,
                    1 : alice.pkh,
                    2 : 0,
                }
                operator = await helperFunctions.getStorageMapValue(tokenStorage, 'operators', operatorKey);
                assert.strictEqual(operator, undefined, 'The operator should not appear in the operator list in the storage')

                // init variables 
                sender      = eve.pkh;
                receiver    = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

            } catch (e) {

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check error message
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Eve")

                // no changes in balance
                assert.equal(updatedSenderTokenBalance.toNumber()    , initialSenderTokenBalance.toNumber());
                assert.equal(updatedReceiverTokenBalance.toNumber()  , initialReceiverTokenBalance.toNumber());

            }
        })

        it('user (eve) should be able to add, remove, and add an operator (alice) in the same transaction', async () => {
            try {
                
                updateOperatorsOperation = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    },
                    {
                        remove_operator: {
                            owner: eve.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    },
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperation.confirmation()

                // check that alice is set as bob's operator
                tokenStorage = await tokenInstance.storage()
                operatorKey = {
                    0 : eve.pkh,
                    1 : alice.pkh,
                    2 : 0,
                }
                operator = await helperFunctions.getStorageMapValue(tokenStorage, 'operators', operatorKey);
                assert.notStrictEqual(operator, undefined, 'The operator should appear in the operator bigmap in the storage')

                // init variables 
                sender      = eve.pkh;
                receiver    = alice.pkh;
                tokenAmount = 200;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                await helperFunctions.signerFactory(tezos, alice.sk);
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                // check balances
                assert.equal(updatedSenderTokenBalance.toNumber()    , +initialSenderTokenBalance.toNumber()   - +tokenAmount);
                assert.equal(updatedReceiverTokenBalance.toNumber()  , +initialReceiverTokenBalance.toNumber() + +tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it('user (eve) should not be able to set herself as an operator for another user (mallory)', async () => {
            try {
                
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, mallory.pkh, eve.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

            } catch (e) {
                assert.equal(e.message, 'FA2_NOT_OWNER', "Eve isn't the owner of Mallory's account so she cannot add herself as an operator")
            }
        })
        
    })

    describe('%mint', function () {

        beforeEach("Set signer to user (eve)", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it("user (eve) should not be able to mint without being whitelisted", async () => {
            try {
                
                receiver    = alice.pkh;
                tokenAmount = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;

                mintOperation = await tokenInstance.methods.mint(receiver, tokenAmount).send()
                await mintOperation.confirmation()

            } catch (e) {
                
                tokenStorage                = await tokenInstance.storage()
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                assert.equal(e.message, 'ONLY_WHITELISTED_CONTRACTS_ALLOWED', "Eve address isn't in the whitelistContracts map")
                assert.equal(updatedEveTokenBalance.toNumber()    , initialEveTokenBalance.toNumber());
                assert.equal(updatedAliceTokenBalance.toNumber()  , initialAliceTokenBalance.toNumber());
                assert.equal(updatedTotalSupply.toNumber()        , initialTotalSupply.toNumber());

            }
        })

        it("user (eve) should be able to mint to another user (alice) if she is whitelisted", async () => {
            try {
                
                // init
                contractMapKey = "eve";

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()

                // init variables and set signer back to user (eve)
                await helperFunctions.signerFactory(tezos, eve.sk);
                const mintAmount = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;

                mintOperation = await tokenInstance.methods.mint(alice.pkh, mintAmount).send()
                await mintOperation.confirmation()

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage                = await tokenInstance.storage()
                updatedEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                assert.equal(updatedEveTokenBalance.toNumber()      , initialEveTokenBalance.toNumber());
                assert.equal(updatedAliceTokenBalance.toNumber()    , +initialAliceTokenBalance.toNumber() + +mintAmount);
                assert.equal(updatedTotalSupply.toNumber()          , +initialTotalSupply.toNumber() + +mintAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it("user (eve) should not be able to send Tez and mint MVK to another user (alice) in a single transaction even if she is whitelisted", async () => {
            try {
                
                // init
                contractMapKey = "eve";

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()
                
                // set signer back to user (eve)
                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(tokenInstance.methods.mint(alice.pkh, 20000).send({ amount: 5 })).to.be.rejected;

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })
        

        it("user (eve) should not be able to mint more than the maximum total supply set", async () => {
            try {
                
                // init
                contractMapKey = "eve";

                // Initial values
                const maximumSupply      = await tokenStorage.maximumSupply;
                initialTotalSupply       = await tokenStorage.totalSupply;
                const amountToMint       = maximumSupply.minus(initialTotalSupply).plus(1);

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()

                // Mint token
                await helperFunctions.signerFactory(tezos, eve.sk);
                mintOperation = await tokenInstance.methods.mint(eve.pkh, amountToMint);
                await chai.expect(mintOperation.send()).to.be.rejected;

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()
                
                // Update storage
                tokenStorage       = await tokenInstance.storage();
                updatedTotalSupply = await tokenStorage.totalSupply;

                assert.equal(initialTotalSupply.toNumber(), updatedTotalSupply.toNumber());

            } catch (e) {
                console.log(e)
            }
        })
    })

    describe('%assertMetadata', function () {

        beforeEach("Set signer to user (eve)", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it('user (eve) should not be able to call assertMetadata with the wrong key and hash', async () => {
            try {

                const metadata = Buffer.from('test', 'ascii').toString('hex')
                const operation = await tokenInstance.methods.assertMetadata('test', metadata).send()
                await operation.confirmation()

            } catch (e) {

                assert.strictEqual(e.message, 'METADATA_NOT_FOUND', 'The metadata cannot be found in the contract storage')

            }
        })

        it('user (eve) should not be able to call assertMetadata with the correct key but wrong hash', async () => {
            try {

                const metadata = Buffer.from('test', 'ascii').toString('hex')
                const operation = await tokenInstance.methods.assertMetadata('', metadata).send()
                await operation.confirmation()

            } catch (e) {

                assert.strictEqual(e.message, 'METADATA_HAS_A_WRONG_HASH', 'The metadata of the provided key does not match the provided metadata');
            }
        })

        it('user (eve) should be able to call assertMetadata with the correct key and correct hash', async () => {
            try {
                
                const metadata = mockTokenData.mvkToken.metadataHex;
                const operation = await tokenInstance.methods.assertMetadata('data', metadata).send()
                await operation.confirmation()

            } catch (e) {
                console.log(e)
            }
        })
    })


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('%setAdmin - admin (bob) should be able to update the contract admin address', async () => {
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

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await tokenInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                tokenStorage       = await tokenInstance.storage();
                const currentGovernance = tokenStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await tokenInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                tokenStorage   = await tokenInstance.storage();
                const updatedGovernance = tokenStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await tokenInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.strictEqual(updatedContractMapValue, eve.pkh,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateGeneralContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(tokenInstance, contractMapKey, eve.pkh);
                await updateGeneralContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

    });

    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                tokenStorage        = await tokenInstance.storage();
                const currentAdmin  = tokenStorage.admin;

                // Operation
                setAdminOperation = await tokenInstance.methods.setAdmin(mallory.pkh);
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

        it('%setGovernance - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                tokenStorage        = await tokenInstance.storage();
                const currentGovernance  = tokenStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await tokenInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                tokenStorage    = await tokenInstance.storage();
                const updatedGovernance  = tokenStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh)
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await tokenInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh)
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MVK to MVK Token Contract
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, mallory.pkh, contractDeployments.mvkToken.address, tokenId, tokenAmount);
                await transferOperation.confirmation();

                const mistakenTransferOperation = await tokenInstance.methods.mistakenTransfer(
                [
                    {
                        "to_"    : mallory.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress": contractDeployments.mvkToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : tokenAmount
                    }
                ]);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it('%mint - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                tokenAmount = 100;
                mintOperation = await tokenInstance.methods.mint(mallory.pkh,tokenAmount);
                await chai.expect(mintOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateInflationRate - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                const updateInflationRateOperation = await tokenInstance.methods.updateInflationRate(1000);
                await chai.expect(updateInflationRateOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it('%triggerInflation - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                const triggerInflationOperation = await tokenInstance.methods.triggerInflation();
                await chai.expect(triggerInflationOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

    })
})
