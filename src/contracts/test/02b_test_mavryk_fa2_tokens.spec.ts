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

    let tokenAddress
    let mavrykFa12TokenAddress

    let tokenInstance;
    let tokenStorage;

    let mavrykFa12TokenInstance
    let mavrykFa12TokenStorage

    let user 
    let userSk

    let tokenId = 0
    let tokenAmount

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
    let updateGeneralContractsOperation


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

    describe("%setAdmin", async () => {
    
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        
        it('Admin should be able to update the contract administrator with a new address', async () => {
            try{
                // Initial Values
                tokenStorage   = await tokenInstance.storage();
                const currentAdmin      = tokenStorage.admin;

                // Operation
                const setAdminOperation = await tokenInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                tokenStorage   = await tokenInstance.storage();
                const newAdmin          = tokenStorage.admin;

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                const resetAdminOperation = await tokenInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                tokenStorage   = await tokenInstance.storage();
                const currentAdmin      = tokenStorage.admin;

                // Operation
                await chai.expect(tokenInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

                // Final values
                tokenStorage   = await tokenInstance.storage();
                const newAdmin          = tokenStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%setGovernance", async () => {
    
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        
        it('Admin should be able to update the contract governance address with a new address', async () => {
            try{
                // Initial Values
                tokenStorage           = await tokenInstance.storage();
                const currentGovernance         = tokenStorage.governanceAddress;

                // Operation
                const setGovernanceOperation    = await tokenInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                tokenStorage           = await tokenInstance.storage();
                const newGovernance             = tokenStorage.governanceAddress;

                // reset governanceAddress
                const resetGovernanceOperation  = await tokenInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await resetGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newGovernance, currentGovernance);
                assert.strictEqual(newGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                tokenStorage   = await tokenInstance.storage();
                const currentGovernance = tokenStorage.governanceAddress;

                // Operation
                await chai.expect(tokenInstance.methods.setGovernance(alice.pkh).send()).to.be.rejected;

                // Final values
                tokenStorage   = await tokenInstance.storage();
                const newGovernance     = tokenStorage.governanceAddress;

                // Assertions
                assert.strictEqual(newGovernance, currentGovernance);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%transfer", async () => {
    
        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('User should be able to transfer token to another user', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();
                const initFirstUserBalance          = (await tokenStorage.ledger.get(alice.pkh)).toNumber();
                const initSecondUserBalance         = (await tokenStorage.ledger.get(eve.pkh)).toNumber();
                const initThirdUserBalance          = (await tokenStorage.ledger.get(bob.pkh)).toNumber();
                const tokenAmount                   = 100;

                // Operation
                const transferOperation             = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: tokenAmount / 2,
                            },
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: tokenAmount / 2,
                            },
                        ],
                    },
                ]).send()
                await transferOperation.confirmation()

                // Final values
                tokenStorage               = await tokenInstance.storage();
                const endFirstUserBalance           = (await tokenStorage.ledger.get(alice.pkh)).toNumber();
                const endSecondUserBalance          = (await tokenStorage.ledger.get(eve.pkh)).toNumber();
                const endThirdUserBalance           = (await tokenStorage.ledger.get(bob.pkh)).toNumber();

                // Assertions
                assert.equal(endFirstUserBalance, initFirstUserBalance - tokenAmount);
                assert.equal(endSecondUserBalance, initSecondUserBalance + tokenAmount / 2);
                assert.equal(endThirdUserBalance, initThirdUserBalance + tokenAmount / 2);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('User should be able to transfer token to another user from another address if this address allowed it to', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();
                const initFirstUserBalance          = (await tokenStorage.ledger.get(bob.pkh)).toNumber();
                const initSecondUserBalance         = (await tokenStorage.ledger.get(eve.pkh)).toNumber();
                const initThirdUserBalance          = (await tokenStorage.ledger.get(alice.pkh)).toNumber();
                const tokenAmount                   = 100;

                // Update operator operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(tokenInstance, bob.pkh, alice.pkh, tokenId);
                await updateOperatorsOperation.confirmation();

                // Transfer operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                const transferOperation             = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: tokenAmount / 2,
                            },
                        ],
                    },
                    {
                        from_: bob.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: tokenAmount / 2,
                            },
                        ],
                    },
                ]).send()
                await transferOperation.confirmation();

                // Final values
                tokenStorage               = await tokenInstance.storage();
                const endFirstUserBalance           = (await tokenStorage.ledger.get(bob.pkh)).toNumber();
                const endSecondUserBalance          = (await tokenStorage.ledger.get(eve.pkh)).toNumber();
                const endThirdUserBalance           = (await tokenStorage.ledger.get(alice.pkh)).toNumber();

                // Assertions
                assert.equal(endFirstUserBalance, initFirstUserBalance - tokenAmount / 2);
                assert.equal(endSecondUserBalance, initSecondUserBalance + tokenAmount);
                assert.equal(endThirdUserBalance, initThirdUserBalance - tokenAmount / 2);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('User should be not able to transfer more token than it has', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();
                const initFirstUserBalance          = (await tokenStorage.ledger.get(alice.pkh)).toNumber();
                const tokenAmount                   = initFirstUserBalance + 1;

                // Operation
                await chai.expect(tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: tokenAmount
                            }
                        ],
                    },
                ]).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('User should be not able to transfer token from another address if nobody allowed it to', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();
                const tokenAmount                   = 100;

                // Operation
                await chai.expect(tokenInstance.methods.transfer([
                    {
                        from_: eve.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: tokenAmount
                            }
                        ],
                    },
                ]).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('User should be not able to transfer token from an undefined token_id', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();
                const tokenAmount                   = 100;

                // Operation
                await chai.expect(tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 1,
                                amount: tokenAmount
                            }
                        ],
                    },
                ]).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%update_operators", async () => {
    
        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('User should be able to add operators to its account', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();
                const initFirstOperator             = await tokenStorage.operators.get({
                    0: alice.pkh,
                    1: mallory.pkh,
                    2: 0
                }) as string;
                const initSecondOperator            = await tokenStorage.operators.get({
                    0: alice.pkh,
                    1: eve.pkh,
                    2: 0
                }) as string;
                const tokenAmount                   = 100;

                // Update operator operation
                const operatorOperation             = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: mallory.pkh,
                            token_id: 0,
                        },
                    },
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: eve.pkh,
                            token_id: 0,
                        },
                    },
                ]).send()
                await operatorOperation.confirmation();

                // Transfer operation
                await helperFunctions.signerFactory(tezos, mallory.sk);
                const transferOperation             = await tokenInstance.methods.transfer([
                    {
                        from_: mallory.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: tokenAmount / 4,
                            }
                        ],
                    },
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: tokenAmount / 4,
                            },
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: tokenAmount / 4,
                            },
                            {
                                to_: mallory.pkh,
                                token_id: 0,
                                amount: tokenAmount / 4,
                            }
                        ],
                    },
                ]).send()
                await transferOperation.confirmation()

                // Final values
                tokenStorage               = await tokenInstance.storage();
                const endFirstOperator              = await tokenStorage.operators.get({
                    0: alice.pkh,
                    1: mallory.pkh,
                    2: 0
                });
                const endSecondOperator             = await tokenStorage.operators.get({
                    0: alice.pkh,
                    1: eve.pkh,
                    2: 0
                });

                // Assertions
                assert.strictEqual(initFirstOperator, undefined);
                assert.strictEqual(initSecondOperator, undefined);
                assert.notStrictEqual(endFirstOperator, undefined);
                assert.notStrictEqual(endSecondOperator, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should be able to remove operators from its account', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();
                const initFirstOperator             = await tokenStorage.operators.get({
                    0: alice.pkh,
                    1: mallory.pkh,
                    2: 0
                });
                const initSecondOperator            = await tokenStorage.operators.get({
                    0: alice.pkh,
                    1: eve.pkh,
                    2: 0
                });
                const tokenAmount                   = 100;

                // Update operator operation
                const operatorOperation             = await tokenInstance.methods.update_operators([
                    {
                        remove_operator: {
                            owner: alice.pkh,
                            operator: mallory.pkh,
                            token_id: 0,
                        },
                    },
                    {
                        remove_operator: {
                            owner: alice.pkh,
                            operator: eve.pkh,
                            token_id: 0,
                        },
                    },
                ]).send()
                await operatorOperation.confirmation();

                // Transfer operation
                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(tokenInstance.methods.transfer([
                    {
                        from_: eve.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: tokenAmount / 4,
                            }
                        ],
                    },
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: mallory.pkh,
                                token_id: 0,
                                amount: tokenAmount / 4,
                            }
                        ],
                    },
                ]).send()).to.be.rejected;

                // Final values
                tokenStorage               = await tokenInstance.storage();
                const endFirstOperator              = await tokenStorage.operators.get({
                    0: alice.pkh,
                    1: bob.pkh,
                    2: 0
                });
                const endSecondOperator             = await tokenStorage.operators.get({
                    0: alice.pkh,
                    1: eve.pkh,
                    2: 0
                });

                // Assertions
                assert.notStrictEqual(initFirstOperator, undefined);
                assert.notStrictEqual(initSecondOperator, undefined);
                assert.strictEqual(endFirstOperator, undefined);
                assert.strictEqual(endSecondOperator, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to add or remove operators from another account', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();

                // Update operator operation
                await chai.expect(tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: bob.pkh,
                            token_id: 0,
                        },
                    },
                    {
                        remove_operator: {
                            owner: mallory.pkh,
                            operator: eve.pkh,
                            token_id: 0,
                        },
                    },
                ]).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to add or remove operators from another account for a undefined token_id', async () => {
            try{
                // Initial Values
                tokenStorage               = await tokenInstance.storage();

                // Update operator operation
                await chai.expect(tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 2,
                        },
                    },
                    {
                        remove_operator: {
                            owner: alice.pkh,
                            operator: eve.pkh,
                            token_id: 0,
                        },
                    },
                ]).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%mintOrBurn", async () => {

        before("Set user as whitelisted address", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
            const updateWhitelistOperation      = await tokenInstance.methods.updateWhitelistContracts("user", alice.pkh).send();
            await updateWhitelistOperation.confirmation();
            await helperFunctions.signerFactory(tezos, alice.sk);
        });
    
        beforeEach("Set signer to whitelisted address", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Whitelisted address should be able to mint token on a given address', async () => {
            try{
                // Initial Values
                tokenStorage           = await tokenInstance.storage();
                const initTotalSupply           = tokenStorage.totalSupply.toNumber();
                const initFirstUserBalance      = (await tokenStorage.ledger.get(alice.pkh)).toNumber();
                const tokenAmount               = 100;

                // Operation
                const mintOperation             = await tokenInstance.methods.mintOrBurn(alice.pkh, 0, tokenAmount).send();
                await mintOperation.confirmation();

                // Final values
                tokenStorage           = await tokenInstance.storage();
                const endTotalSupply            = tokenStorage.totalSupply.toNumber();
                const endFirstUserBalance       = (await tokenStorage.ledger.get(alice.pkh)).toNumber();

                // Assertions
                assert.equal(endTotalSupply, initTotalSupply + tokenAmount);
                assert.equal(endFirstUserBalance, initFirstUserBalance + tokenAmount);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Whitelisted address should be able to burn token on a given address', async () => {
            try{
                // Initial Values
                tokenStorage           = await tokenInstance.storage();
                const initTotalSupply           = tokenStorage.totalSupply.toNumber();
                const initFirstUserBalance      = (await tokenStorage.ledger.get(alice.pkh)).toNumber();
                const tokenAmount               = -100;

                // Operation
                const burnOperation             = await tokenInstance.methods.mintOrBurn(alice.pkh, 0, tokenAmount).send();
                await burnOperation.confirmation();

                // Final values
                tokenStorage           = await tokenInstance.storage();
                const endTotalSupply            = tokenStorage.totalSupply.toNumber();
                const endFirstUserBalance       = (await tokenStorage.ledger.get(alice.pkh)).toNumber();

                // Assertions
                assert.equal(endTotalSupply, initTotalSupply + tokenAmount);
                assert.equal(endFirstUserBalance, initFirstUserBalance + tokenAmount);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Whitelisted address should not be able to burn too much token on a given address', async () => {
            try{
                // Initial Values
                tokenStorage           = await tokenInstance.storage();
                const initFirstUserBalance      = (await tokenStorage.ledger.get(alice.pkh)).toNumber();
                const tokenAmount               = -1 * (initFirstUserBalance + 1);

                // Operation
                await chai.expect(tokenInstance.methods.mintOrBurn(alice.pkh, 0, tokenAmount).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Non-whitelisted address should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                tokenStorage           = await tokenInstance.storage();
                const tokenAmount               = -100;

                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(tokenInstance.methods.mintOrBurn(alice.pkh, 0, tokenAmount).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
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


        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await helperFunctions.signerFactory(tezos, userSk);
                transferOperation = await helperFunctions.fa12Transfer(mavrykFa12TokenInstance, user, tokenAddress, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa12TokenStorage       = await mavrykFa12TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa12TokenStorage.ledger.get(user)).toNumber()

                await helperFunctions.signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa12Token(tokenInstance, user, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa12TokenStorage       = await mavrykFa12TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa12TokenStorage.ledger.get(user)).toNumber();

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

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                user = mallory.pkh;
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MVK to MVK Token Contract
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
                mintOperation = await tokenInstance.methods.mint(mallory.pkh,tokenAmount);
                await chai.expect(mintOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })
    
    })



});
