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

import { bob, alice, eve, mallory, trudy } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------


describe("Test: Mavryk Tokens (FA12 and FA2)", async () => {

    var utils: Utils;
    let tezos 

    let governanceAddress

    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;

    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);

            governanceAddress               = contractDeployments.governance.address
            
            mavrykFa12TokenInstance         = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
            mavrykFa2TokenInstance          = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);

            mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
            mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
            
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
            
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("FA12", async () => {
    
        describe("%setAdmin", async () => {
        
            beforeEach("Set signer to admin", async () => {
                await helperFunctions.signerFactory(tezos, bob.sk)
            });
            
            it('Admin should be able to update the contract administrator with a new address', async () => {
                try{
                    // Initial Values
                    mavrykFa12TokenStorage  = await mavrykFa12TokenInstance.storage();
                    const currentAdmin      = mavrykFa12TokenStorage.admin;
    
                    // Operation
                    const setAdminOperation = await mavrykFa12TokenInstance.methods.setAdmin(alice.pkh).send();
                    await setAdminOperation.confirmation();
    
                    // Final values
                    mavrykFa12TokenStorage  = await mavrykFa12TokenInstance.storage();
                    const newAdmin          = mavrykFa12TokenStorage.admin;
    
                    // reset admin
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    const resetAdminOperation = await mavrykFa12TokenInstance.methods.setAdmin(bob.pkh).send();
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
                    mavrykFa12TokenStorage  = await mavrykFa12TokenInstance.storage();
                    const currentAdmin      = mavrykFa12TokenStorage.admin;
    
                    // Operation
                    await chai.expect(mavrykFa12TokenInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;
    
                    // Final values
                    mavrykFa12TokenStorage  = await mavrykFa12TokenInstance.storage();
                    const newAdmin          = mavrykFa12TokenStorage.admin;
    
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
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const currentGovernance         = mavrykFa12TokenStorage.governanceAddress;
    
                    // Operation
                    const setGovernanceOperation    = await mavrykFa12TokenInstance.methods.setGovernance(alice.pkh).send();
                    await setGovernanceOperation.confirmation();
    
                    // Final values
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const newGovernance             = mavrykFa12TokenStorage.governanceAddress;
    
                    // reset governanceAddress
                    const resetGovernanceOperation  = await mavrykFa12TokenInstance.methods.setGovernance(governanceAddress).send();
                    await resetGovernanceOperation.confirmation();
    
                    // Assertions
                    assert.notStrictEqual(newGovernance, currentGovernance);
                    assert.strictEqual(newGovernance, alice.pkh);
                    assert.strictEqual(currentGovernance, governanceAddress);
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Non-admin should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    mavrykFa12TokenStorage  = await mavrykFa12TokenInstance.storage();
                    const currentGovernance = mavrykFa12TokenStorage.governanceAddress;
    
                    // Operation
                    await chai.expect(mavrykFa12TokenInstance.methods.setGovernance(alice.pkh).send()).to.be.rejected;
    
                    // Final values
                    mavrykFa12TokenStorage  = await mavrykFa12TokenInstance.storage();
                    const newGovernance     = mavrykFa12TokenStorage.governanceAddress;
    
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
                    mavrykFa12TokenStorage              = await mavrykFa12TokenInstance.storage();
                    const initFirstUserLedgerRecord     = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const initFirstUserBalance          = initFirstUserLedgerRecord.balance.toNumber();
                    const initSecondUserLedgerRecord    = await mavrykFa12TokenStorage.ledger.get(eve.pkh);
                    const initSecondUserBalance         = initSecondUserLedgerRecord.balance.toNumber();
                    const tokenAmount                   = 100;
    
                    // Operation
                    const transferOperation             = await mavrykFa12TokenInstance.methods.transfer(alice.pkh, eve.pkh, tokenAmount).send();
                    await transferOperation.confirmation();
    
                    // Final values
                    mavrykFa12TokenStorage              = await mavrykFa12TokenInstance.storage();
                    const endFirstUserLedgerRecord      = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const endFirstUserBalance           = endFirstUserLedgerRecord.balance.toNumber();
                    const endSecondUserLedgerRecord     = await mavrykFa12TokenStorage.ledger.get(eve.pkh);
                    const endSecondUserBalance          = endSecondUserLedgerRecord.balance.toNumber();
    
                    // Assertions
                    assert.equal(endFirstUserBalance, initFirstUserBalance - tokenAmount);
                    assert.equal(endSecondUserBalance, initSecondUserBalance + tokenAmount);
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('User should be able to transfer token to another user from another address if this address allowed it to', async () => {
                try{
                    // Initial Values
                    mavrykFa12TokenStorage              = await mavrykFa12TokenInstance.storage();
                    const initFirstUserLedgerRecord     = await mavrykFa12TokenStorage.ledger.get(bob.pkh);
                    const initFirstUserBalance          = initFirstUserLedgerRecord.balance.toNumber();
                    const initSecondUserLedgerRecord    = await mavrykFa12TokenStorage.ledger.get(eve.pkh);
                    const initSecondUserBalance         = initSecondUserLedgerRecord.balance.toNumber();
                    const initThirdUserLedgerRecord     = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const initThirdUserBalance          = initThirdUserLedgerRecord.balance.toNumber();
                    const tokenAmount                   = 100;

                    // Approve operation
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    const approveOperation              = await mavrykFa12TokenInstance.methods.approve(alice.pkh, tokenAmount).send();
                    await approveOperation.confirmation();
    
                    // Transfer operation
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    const transferOperation             = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, eve.pkh, tokenAmount).send();
                    await transferOperation.confirmation();
    
                    // Final values
                    mavrykFa12TokenStorage              = await mavrykFa12TokenInstance.storage();
                    const endFirstUserLedgerRecord      = await mavrykFa12TokenStorage.ledger.get(bob.pkh);
                    const endFirstUserBalance           = endFirstUserLedgerRecord.balance.toNumber();
                    const endSecondUserLedgerRecord     = await mavrykFa12TokenStorage.ledger.get(eve.pkh);
                    const endSecondUserBalance          = endSecondUserLedgerRecord.balance.toNumber();
                    const endThirdUserLedgerRecord      = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const endThirdUserBalance           = endThirdUserLedgerRecord.balance.toNumber();
    
                    // Assertions
                    assert.equal(endFirstUserBalance, initFirstUserBalance - tokenAmount);
                    assert.equal(endSecondUserBalance, initSecondUserBalance + tokenAmount);
                    assert.equal(endThirdUserBalance, initThirdUserBalance);
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('User should be not able to transfer more token than it has', async () => {
                try{
                    // Initial Values
                    mavrykFa12TokenStorage              = await mavrykFa12TokenInstance.storage();
                    const initFirstUserLedgerRecord     = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const initFirstUserBalance          = initFirstUserLedgerRecord.balance.toNumber();
                    const tokenAmount                   = initFirstUserBalance + 1;
    
                    // Operation
                    await chai.expect(mavrykFa12TokenInstance.methods.transfer(alice.pkh, eve.pkh, tokenAmount).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('User should be not able to transfer token from another address if nobody allowed it to', async () => {
                try{
                    // Initial Values
                    mavrykFa12TokenStorage              = await mavrykFa12TokenInstance.storage();
                    const tokenAmount                   = 100;
    
                    // Operation
                    await chai.expect(mavrykFa12TokenInstance.methods.transfer(bob.pkh, eve.pkh, tokenAmount).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%approve", async () => {
        
            beforeEach("Set signer to user", async () => {
                await helperFunctions.signerFactory(tezos, alice.sk)
            });
            
            it('User should be able to allow another user to spend its token', async () => {
                try{
                    // Initial Values
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const initFirstUserLedgerRecord = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const initFirstUserAllowances   = initFirstUserLedgerRecord.allowances.get(bob.pkh) === undefined ? 0 : initFirstUserLedgerRecord.allowances.get(bob.pkh).toNumber();
                    const tokenAmount               = 100;
    
                    // Operation
                    const approveOperation          = await mavrykFa12TokenInstance.methods.approve(bob.pkh, tokenAmount).send();
                    await approveOperation.confirmation();
    
                    // Final values
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const endFirstUserLedgerRecord  = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const endFirstUserAllowances    = endFirstUserLedgerRecord.allowances.get(bob.pkh) === undefined ? 0 : endFirstUserLedgerRecord.allowances.get(bob.pkh).toNumber();
    
                    // Assertions
                    assert.equal(endFirstUserAllowances, initFirstUserAllowances + tokenAmount);
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('User should not be able to allow another user to spend its token if it did not yet spend them', async () => {
                try{
                    // Initial Values
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const tokenAmount               = 100;
    
                    // Operation
                    await chai.expect(mavrykFa12TokenInstance.methods.approve(bob.pkh, tokenAmount).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%mintOrBurn", async () => {
        
            before("Set user as whitelisted address", async () => {
                await helperFunctions.signerFactory(tezos, bob.sk);
                const updateWhitelistOperation  = await mavrykFa12TokenInstance.methods.updateWhitelistContracts("user", alice.pkh).send();
                await updateWhitelistOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);
            });
        
            beforeEach("Set signer to whitelisted address", async () => {
                await helperFunctions.signerFactory(tezos, alice.sk)
            });
            
            it('Whitelisted address should be able to mint token on a given address', async () => {
                try{
                    // Initial Values
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const initTotalSupply           = mavrykFa12TokenStorage.totalSupply.toNumber();
                    const initFirstUserLedgerRecord = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const initFirstUserBalance      = initFirstUserLedgerRecord.balance.toNumber();
                    const tokenAmount               = 100;
    
                    // Operation
                    const mintOperation             = await mavrykFa12TokenInstance.methods.mintOrBurn(alice.pkh, tokenAmount).send();
                    await mintOperation.confirmation();

                    // Final values
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const endTotalSupply            = mavrykFa12TokenStorage.totalSupply.toNumber();
                    const endFirstUserLedgerRecord  = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const endFirstUserBalance       = endFirstUserLedgerRecord.balance.toNumber();

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
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const initTotalSupply           = mavrykFa12TokenStorage.totalSupply.toNumber();
                    const initFirstUserLedgerRecord = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const initFirstUserBalance      = initFirstUserLedgerRecord.balance.toNumber();
                    const tokenAmount               = -100;
    
                    // Operation
                    const burnOperation             = await mavrykFa12TokenInstance.methods.mintOrBurn(alice.pkh, tokenAmount).send();
                    await burnOperation.confirmation();

                    // Final values
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const endTotalSupply            = mavrykFa12TokenStorage.totalSupply.toNumber();
                    const endFirstUserLedgerRecord  = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const endFirstUserBalance       = endFirstUserLedgerRecord.balance.toNumber();

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
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const initFirstUserLedgerRecord = await mavrykFa12TokenStorage.ledger.get(alice.pkh);
                    const initFirstUserBalance      = initFirstUserLedgerRecord.balance.toNumber();
                    const tokenAmount               = -1 * (initFirstUserBalance + 1);
    
                    // Operation
                    await chai.expect(mavrykFa12TokenInstance.methods.mintOrBurn(alice.pkh, tokenAmount).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('Non-whitelisted address should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const tokenAmount               = -100;
    
                    // Operation
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    await chai.expect(mavrykFa12TokenInstance.methods.mintOrBurn(alice.pkh, tokenAmount).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        });
    });

    describe("FA2", async () => {
    
        describe("%setAdmin", async () => {
        
            beforeEach("Set signer to admin", async () => {
                await helperFunctions.signerFactory(tezos, bob.sk)
            });
            
            it('Admin should be able to update the contract administrator with a new address', async () => {
                try{
                    // Initial Values
                    mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();
                    const currentAdmin      = mavrykFa2TokenStorage.admin;
    
                    // Operation
                    const setAdminOperation = await mavrykFa2TokenInstance.methods.setAdmin(alice.pkh).send();
                    await setAdminOperation.confirmation();
    
                    // Final values
                    mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();
                    const newAdmin          = mavrykFa2TokenStorage.admin;
    
                    // reset admin
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    const resetAdminOperation = await mavrykFa2TokenInstance.methods.setAdmin(bob.pkh).send();
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
                    mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();
                    const currentAdmin      = mavrykFa2TokenStorage.admin;
    
                    // Operation
                    await chai.expect(mavrykFa2TokenInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;
    
                    // Final values
                    mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();
                    const newAdmin          = mavrykFa2TokenStorage.admin;
    
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
                    mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
                    const currentGovernance         = mavrykFa2TokenStorage.governanceAddress;
    
                    // Operation
                    const setGovernanceOperation    = await mavrykFa2TokenInstance.methods.setGovernance(alice.pkh).send();
                    await setGovernanceOperation.confirmation();
    
                    // Final values
                    mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
                    const newGovernance             = mavrykFa2TokenStorage.governanceAddress;
    
                    // reset governanceAddress
                    const resetGovernanceOperation  = await mavrykFa2TokenInstance.methods.setGovernance(governanceAddress).send();
                    await resetGovernanceOperation.confirmation();
    
                    // Assertions
                    assert.notStrictEqual(newGovernance, currentGovernance);
                    assert.strictEqual(newGovernance, alice.pkh);
                    assert.strictEqual(currentGovernance, governanceAddress);
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Non-admin should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();
                    const currentGovernance = mavrykFa2TokenStorage.governanceAddress;
    
                    // Operation
                    await chai.expect(mavrykFa2TokenInstance.methods.setGovernance(alice.pkh).send()).to.be.rejected;
    
                    // Final values
                    mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();
                    const newGovernance     = mavrykFa2TokenStorage.governanceAddress;
    
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const initFirstUserBalance          = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();
                    const initSecondUserBalance         = (await mavrykFa2TokenStorage.ledger.get(eve.pkh)).toNumber();
                    const initThirdUserBalance          = (await mavrykFa2TokenStorage.ledger.get(bob.pkh)).toNumber();
                    const tokenAmount                   = 100;

                    // Operation
                    const transferOperation             = await mavrykFa2TokenInstance.methods.transfer([
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const endFirstUserBalance           = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();
                    const endSecondUserBalance          = (await mavrykFa2TokenStorage.ledger.get(eve.pkh)).toNumber();
                    const endThirdUserBalance           = (await mavrykFa2TokenStorage.ledger.get(bob.pkh)).toNumber();

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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const initFirstUserBalance          = (await mavrykFa2TokenStorage.ledger.get(bob.pkh)).toNumber();
                    const initSecondUserBalance         = (await mavrykFa2TokenStorage.ledger.get(eve.pkh)).toNumber();
                    const initThirdUserBalance          = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();
                    const tokenAmount                   = 100;

                    // Update operator operation
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    const operatorOperation             = await mavrykFa2TokenInstance.methods.update_operators([
                        {
                            add_operator: {
                                owner: bob.pkh,
                                operator: alice.pkh,
                                token_id: 0,
                            },
                        },
                    ]).send()
                    await operatorOperation.confirmation();

                    // Transfer operation
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    const transferOperation             = await mavrykFa2TokenInstance.methods.transfer([
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const endFirstUserBalance           = (await mavrykFa2TokenStorage.ledger.get(bob.pkh)).toNumber();
                    const endSecondUserBalance          = (await mavrykFa2TokenStorage.ledger.get(eve.pkh)).toNumber();
                    const endThirdUserBalance           = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();

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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const initFirstUserBalance          = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();
                    const tokenAmount                   = initFirstUserBalance + 1;

                    // Operation
                    await chai.expect(mavrykFa2TokenInstance.methods.transfer([
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const tokenAmount                   = 100;

                    // Operation
                    await chai.expect(mavrykFa2TokenInstance.methods.transfer([
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const tokenAmount                   = 100;

                    // Operation
                    await chai.expect(mavrykFa2TokenInstance.methods.transfer([
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const initFirstOperator             = await mavrykFa2TokenStorage.operators.get({
                        0: alice.pkh,
                        1: mallory.pkh,
                        2: 0
                    }) as string;
                    const initSecondOperator            = await mavrykFa2TokenStorage.operators.get({
                        0: alice.pkh,
                        1: eve.pkh,
                        2: 0
                    }) as string;
                    const tokenAmount                   = 100;

                    // Update operator operation
                    const operatorOperation             = await mavrykFa2TokenInstance.methods.update_operators([
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
                    const transferOperation             = await mavrykFa2TokenInstance.methods.transfer([
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const endFirstOperator              = await mavrykFa2TokenStorage.operators.get({
                        0: alice.pkh,
                        1: mallory.pkh,
                        2: 0
                    });
                    const endSecondOperator             = await mavrykFa2TokenStorage.operators.get({
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const initFirstOperator             = await mavrykFa2TokenStorage.operators.get({
                        0: alice.pkh,
                        1: mallory.pkh,
                        2: 0
                    });
                    const initSecondOperator            = await mavrykFa2TokenStorage.operators.get({
                        0: alice.pkh,
                        1: eve.pkh,
                        2: 0
                    });
                    const tokenAmount                   = 100;

                    // Update operator operation
                    const operatorOperation             = await mavrykFa2TokenInstance.methods.update_operators([
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
                    await chai.expect(mavrykFa2TokenInstance.methods.transfer([
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();
                    const endFirstOperator              = await mavrykFa2TokenStorage.operators.get({
                        0: alice.pkh,
                        1: bob.pkh,
                        2: 0
                    });
                    const endSecondOperator             = await mavrykFa2TokenStorage.operators.get({
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();

                    // Update operator operation
                    await chai.expect(mavrykFa2TokenInstance.methods.update_operators([
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
                    mavrykFa2TokenStorage               = await mavrykFa2TokenInstance.storage();

                    // Update operator operation
                    await chai.expect(mavrykFa2TokenInstance.methods.update_operators([
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
                const updateWhitelistOperation      = await mavrykFa2TokenInstance.methods.updateWhitelistContracts("user", alice.pkh).send();
                await updateWhitelistOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);
            });
        
            beforeEach("Set signer to whitelisted address", async () => {
                await helperFunctions.signerFactory(tezos, alice.sk)
            });
            
            it('Whitelisted address should be able to mint token on a given address', async () => {
                try{
                    // Initial Values
                    mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
                    const initTotalSupply           = mavrykFa2TokenStorage.totalSupply.toNumber();
                    const initFirstUserBalance      = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();
                    const tokenAmount               = 100;
    
                    // Operation
                    const mintOperation             = await mavrykFa2TokenInstance.methods.mintOrBurn(alice.pkh, 0, tokenAmount).send();
                    await mintOperation.confirmation();

                    // Final values
                    mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
                    const endTotalSupply            = mavrykFa2TokenStorage.totalSupply.toNumber();
                    const endFirstUserBalance       = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();

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
                    mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
                    const initTotalSupply           = mavrykFa2TokenStorage.totalSupply.toNumber();
                    const initFirstUserBalance      = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();
                    const tokenAmount               = -100;
    
                    // Operation
                    const burnOperation             = await mavrykFa2TokenInstance.methods.mintOrBurn(alice.pkh, 0, tokenAmount).send();
                    await burnOperation.confirmation();

                    // Final values
                    mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
                    const endTotalSupply            = mavrykFa2TokenStorage.totalSupply.toNumber();
                    const endFirstUserBalance       = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();

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
                    mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
                    const initFirstUserBalance      = (await mavrykFa2TokenStorage.ledger.get(alice.pkh)).toNumber();
                    const tokenAmount               = -1 * (initFirstUserBalance + 1);
    
                    // Operation
                    await chai.expect(mavrykFa2TokenInstance.methods.mintOrBurn(alice.pkh, 0, tokenAmount).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('Non-whitelisted address should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
                    const tokenAmount               = -100;
    
                    // Operation
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    await chai.expect(mavrykFa2TokenInstance.methods.mintOrBurn(alice.pkh, 0, tokenAmount).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })
    });
});
