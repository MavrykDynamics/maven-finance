import assert from "assert";
import { Utils } from "./helpers/Utils";

const chai              = require("chai");
const chaiAsPromised    = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------


describe("Test: Mavryk FA2 Token Contract", async () => {

    var utils: Utils;
    let tezos 

    // misc defaults
    let tokenId = 0
    let tokenAmount
    let operator
    let operatorKey

    // contract instances 
    let tokenAddress
    let tokenInstance;
    let tokenStorage;
    let mavrykFa12TokenAddress
    let mavrykFa12TokenInstance
    let mavrykFa12TokenStorage

    // user accounts
    let user 
    let userSk
    let sender
    let senderSk
    let receiver
    let receiverSk
    let approver
    let approverSk

    // initial token balances
    let initialUserTokenBalance
    let initialSenderTokenBalance
    let initialReceiverTokenBalance
    let initialBobTokenBalance
    let initialAliceTokenBalance
    let initialEveTokenBalance
    let initialMalloryTokenBalance

    // updated token balances
    let updatedUserTokenBalance
    let updatedSenderTokenBalance
    let updatedReceiverTokenBalance
    let updatedBobTokenBalance
    let updatedAliceTokenBalance
    let updatedEveTokenBalance
    let updatedMalloryTokenBalance

    // token supply
    let initialTotalSupply
    let updatedTotalSupply

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue

    // operations
    let transferOperation
    let mistakenTransferOperation
    let updateOperatorsOperation
    let removeOperatorsOperation
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let mintOperation
    let burnOperation
    let updateWhitelistContractsOperation


    before("setup", async () => {
        try{

            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos

            // mock fa2 token 
            tokenAddress            = contractDeployments.mavrykFa2Token.address
            tokenInstance           = await utils.tezos.contract.at(tokenAddress);
            tokenStorage            = await tokenInstance.storage();

            // for mistaken transfers
            mavrykFa12TokenAddress   = contractDeployments.mavrykFa12Token.address 
            mavrykFa12TokenInstance  = await utils.tezos.contract.at(mavrykFa12TokenAddress);
            mavrykFa12TokenStorage   = await mavrykFa12TokenInstance.storage();
            
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
            
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("%transfer", async () => {
    
        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk)
        });
        
        it('user (eve) should be able to send non-zero token amount to another user (mallory)', async () => {
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

        it('user (eve) should be able to send zero tokens to another user (alice)', async () => {
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

        it('user (eve) should be able to send non-zero token amount to herself', async () => {
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

        it('user (eve) should be able to send zero tokens to herself', async () => {
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

        
        it('user (eve) should be able to send variable amounts of tokens (including zero) to multiple users (alice, mallory, herself) in a single transaction', async () => {
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

        it('user (eve) should be able to send variable amounts of tokens (10, 50) to multiple users (mallory, alice) in one transaction', async () => {
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

        it('user (eve) should be able to send all her tokens to another user (mallory)', async () => {
            try {

                // init variables
                sender   = eve.pkh;
                receiver = mallory.pkh;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                initialReceiverTokenBalance = await tokenStorage.ledger.get(receiver);

                tokenAmount = initialSenderTokenBalance;

                // transfer operation
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = await tokenStorage.ledger.get(sender);
                updatedReceiverTokenBalance = await tokenStorage.ledger.get(receiver);
                
                assert.equal(updatedSenderTokenBalance.toNumber()   , +initialSenderTokenBalance.toNumber()   -  +tokenAmount);
                assert.equal(updatedReceiverTokenBalance.toNumber() , +initialReceiverTokenBalance.toNumber() +  +tokenAmount);

                // --------------------------------------------------------------------------
                // reset token balance for eve for subsequent retesting if needed
                // --------------------------------

                // set signer to mallory
                await helperFunctions.signerFactory(tezos, mallory.sk);
                sender   = mallory.pkh;
                receiver = eve.pkh;

                // transfer tokens back to eve
                transferOperation = await helperFunctions.fa2Transfer(tokenInstance, sender, receiver, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // --------------------------------------------------------------------------

            } catch (e) {
                console.log(e)
            }
        })


        it('user (eve) should not be able to send more tokens than what she has to herself', async () => {
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

        it('user (eve) should not be able to send more tokens than what she has in a single transaction to another user (mallory)', async () => {
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

        it('user (eve) should not be able to send more tokens than what she has in a multi-transfer transaction to another user (mallory)', async () => {
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


        it('user (eve) should not be able to send tokens with the wrong token id to another user (mallory)', async () => {
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

        it('user (eve) should not be able to send negative amounts of tokens to another user (mallory)', async () => {
            try {

                // init variables
                sender             = eve.pkh;
                receiver           = mallory.pkh;
                tokenAmount        = -100;

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

                // no changes in balances
                assert.equal(updatedSenderTokenBalance.toNumber()   , initialSenderTokenBalance.toNumber());
                assert.equal(updatedReceiverTokenBalance.toNumber() , initialReceiverTokenBalance.toNumber());

            }
        })

    });

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

    describe('%transfer and %update_operators', function () {

        beforeEach("Set signer to user (eve)", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it("user (eve) should be able to make multiple transfers on multiple users' (alice, mallory) behalf if she is set as an operator", async () => {
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

        it("user (eve) should be able to make transfers on another user's (mallory) behalf if she is set as an operator", async () => {
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

        it("user (eve) should not be able to make transfers on another user's (mallory) behalf if she is removed as an operator", async () => {
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

        it("user (eve) should not be able to make transfers on another user's (alice, mallory) if she is not their operator", async () => {
            try {

                // init variables
                const amountSentToMallory  = 35;
                const amountSentToEve      = 200;

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

    })

    describe('%mint', function () {

        beforeEach("Set signer to user (eve)", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it("user (eve) should be able to mint to another user (alice) if she is whitelisted", async () => {
            try {
                
                // init
                contractMapKey = "eve";

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                // init variables and set signer back to user (eve)
                const mintAmount = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;
                
                await helperFunctions.signerFactory(tezos, eve.sk);
                mintOperation = await tokenInstance.methods.mintOrBurn(alice.pkh, tokenId, mintAmount).send()
                await mintOperation.confirmation()

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'remove');
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

        it("user (eve) should not be able to mint without being whitelisted", async () => {
            try {
                
                receiver    = alice.pkh;
                tokenAmount = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialEveTokenBalance      = await tokenStorage.ledger.get(eve.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;

                mintOperation = await tokenInstance.methods.mintOrBurn(receiver, tokenId, tokenAmount).send()
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

        it("user (eve) should not be able to send Tez and mint tokens to another user (alice) in a single transaction even if she is whitelisted", async () => {
            try {
                
                // init
                contractMapKey = "eve";

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()
                
                // set signer back to user (eve)
                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(tokenInstance.methods.mintOrBurn(alice.pkh, tokenId, 20000).send({ amount: 5 })).to.be.rejected;

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("admin (bob) should not be able to mint without being whitelisted", async () => {
            try {

                // set signer to admin (bob)
                await helperFunctions.signerFactory(tezos, bob.sk);
                
                receiver    = alice.pkh;
                tokenAmount = 20000;

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                initialAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                initialTotalSupply          = await tokenStorage.totalSupply;

                mintOperation = await tokenInstance.methods.mintOrBurn(receiver, tokenId, tokenAmount).send()
                await mintOperation.confirmation()

            } catch (e) {
                
                tokenStorage                = await tokenInstance.storage()
                updatedBobTokenBalance      = await tokenStorage.ledger.get(bob.pkh);
                updatedAliceTokenBalance    = await tokenStorage.ledger.get(alice.pkh);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                assert.equal(e.message, 'ONLY_WHITELISTED_CONTRACTS_ALLOWED', "Bob address isn't in the whitelistContracts map")
                assert.equal(updatedBobTokenBalance.toNumber()    , initialBobTokenBalance.toNumber());
                assert.equal(updatedAliceTokenBalance.toNumber()  , initialAliceTokenBalance.toNumber());
                assert.equal(updatedTotalSupply.toNumber()        , initialTotalSupply.toNumber());

            }
        })
        
    })

    describe('%burn', function () {

        beforeEach("Set signer to user (eve)", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk);
        });

        it("user (eve) should be able to burn a non-zero amount of her token balance but not exceeding what she has, if she is whitelisted", async () => {
            try {
                
                user        = eve.pkh;
                tokenAmount = -2000;

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialUserTokenBalance     = await tokenStorage.ledger.get(user);
                initialTotalSupply          = await tokenStorage.totalSupply;

                await helperFunctions.signerFactory(tezos, eve.sk);
                burnOperation = await tokenInstance.methods.mintOrBurn(user, tokenId, tokenAmount).send()
                await burnOperation.confirmation()

                tokenStorage                = await tokenInstance.storage()
                updatedUserTokenBalance     = await tokenStorage.ledger.get(user);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                // check that user token balance and total supply have decreased by token amount
                assert.equal(updatedUserTokenBalance.toNumber()   , initialUserTokenBalance.toNumber() + tokenAmount);
                assert.equal(updatedTotalSupply.toNumber()        , initialTotalSupply.toNumber() + tokenAmount);

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()
                
            } catch (e) {
                console.log(e)
            }
        })

        it("user (eve) should be able to burn a zero amount of her token balance, if she is whitelisted", async () => {
            try {
                
                user        = eve.pkh;
                tokenAmount = 0;

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialUserTokenBalance     = await tokenStorage.ledger.get(user);
                initialTotalSupply          = await tokenStorage.totalSupply;

                await helperFunctions.signerFactory(tezos, eve.sk);
                burnOperation = await tokenInstance.methods.mintOrBurn(user, tokenId, tokenAmount).send()
                await burnOperation.confirmation()

                tokenStorage                = await tokenInstance.storage()
                updatedUserTokenBalance     = await tokenStorage.ledger.get(user);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                // check that there are no changes to user token balance and total supply 
                assert.equal(updatedUserTokenBalance.toNumber()   , initialUserTokenBalance.toNumber());
                assert.equal(updatedTotalSupply.toNumber()        , initialTotalSupply.toNumber());

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()
                
            } catch (e) {
                console.log(e)
            }
        })

        it("user (eve) should be able to burn all the tokens than she has", async () => {
            try {
                
                user = eve.pkh;

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialUserTokenBalance     = await tokenStorage.ledger.get(user);
                tokenAmount                 = initialUserTokenBalance.toNumber();
                initialTotalSupply          = await tokenStorage.totalSupply;

                await helperFunctions.signerFactory(tezos, eve.sk);
                burnOperation = await tokenInstance.methods.mintOrBurn(user, tokenId, (-1 * tokenAmount)).send()
                await burnOperation.confirmation()

                tokenStorage                = await tokenInstance.storage()
                updatedUserTokenBalance     = await tokenStorage.ledger.get(user);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                // check that user token balance and total supply have decreased by token amount
                assert.equal(updatedUserTokenBalance.toNumber()   , +initialUserTokenBalance.toNumber() - +tokenAmount);
                assert.equal(updatedTotalSupply.toNumber()        , +initialTotalSupply.toNumber() - +tokenAmount);

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                // --------------------------------------------------------------------------
                // reset token balance for eve for subsequent retesting if needed
                // --------------------------------

                // set signer to admin (bob)
                contractMapKey  = "bob";
                storageMap      = "whitelistContracts";
                await helperFunctions.signerFactory(tezos, bob.sk);

                // set admin (bob) as a whitelisted contract
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, bob.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                // mint burned tokens back to user (eve)
                mintOperation = await tokenInstance.methods.mintOrBurn(user, tokenId, tokenAmount).send()
                await mintOperation.confirmation()

                // remove admin (bob) as a whitelisted contract
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, bob.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                

                // --------------------------------------------------------------------------
                
            } catch (e) {
                console.log(e)   
            }
        })

        it("user (eve) should not be able to burn more tokens than what she has", async () => {
            try {
                
                user = eve.pkh;

                // set admin (bob) as signer and add eve to whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                // initial storage
                tokenStorage                = await tokenInstance.storage()
                initialUserTokenBalance     = await tokenStorage.ledger.get(user);
                tokenAmount                 = initialUserTokenBalance + 1000;
                initialTotalSupply          = await tokenStorage.totalSupply;

                await helperFunctions.signerFactory(tezos, eve.sk);
                burnOperation = await tokenInstance.methods.mintOrBurn(user, tokenId, (-1 * tokenAmount))
                await chai.expect(burnOperation.send()).to.be.rejected;

            } catch (e) {
                
                tokenStorage                = await tokenInstance.storage()
                updatedUserTokenBalance     = await tokenStorage.ledger.get(user);
                updatedTotalSupply          = await tokenStorage.totalSupply;

                // check message
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Eve shouldn't be able to burn more tokens than she has")

                // check that there are no changes to user token balance and total supply 
                assert.equal(updatedUserTokenBalance.toNumber()   , initialUserTokenBalance.toNumber());
                assert.equal(updatedTotalSupply.toNumber()        , initialTotalSupply.toNumber());

                // set admin (bob) as signer and remove eve from whitelist contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()
            }
        })

    })

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            
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
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
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

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage            = await tokenInstance.storage()
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

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(tokenInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage            = await tokenInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })


        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA12 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa12Tokens to Token Contract
                await helperFunctions.signerFactory(tezos, userSk);
                transferOperation = await helperFunctions.fa12Transfer(mavrykFa12TokenInstance, user, tokenAddress, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa12TokenStorage.ledger.get(user)).balance.toNumber()

                await helperFunctions.signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa12Token(tokenInstance, user, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa12TokenStorage.ledger.get(user)).balance.toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

    })
    

    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
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

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                tokenStorage             = await tokenInstance.storage();
                const currentGovernance  = tokenStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await tokenInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                tokenStorage            = await tokenInstance.storage();
                const updatedGovernance = tokenStorage.governanceAddress;

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

                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                tokenStorage            = await tokenInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                user = mallory.pkh;
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa12Tokens to Token Contract
                transferOperation = await helperFunctions.fa12Transfer(mavrykFa12TokenInstance, user, tokenAddress, tokenAmount);
                await transferOperation.confirmation();

                mistakenTransferOperation = await helperFunctions.mistakenTransferFa12Token(tokenInstance, user, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it('%mintOrBurn               - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                tokenAmount = 100;
                mintOperation = await tokenInstance.methods.mintOrBurn(mallory.pkh, tokenId, tokenAmount);
                await chai.expect(mintOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })
    
    })



});
