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


describe("Test: Mavryk FA12 Token Contract", async () => {

    var utils: Utils;
    let tezos 

    // contract addresses
    let tokenAddress
    let mavrykFa2TokenAddress

    let user 
    let userSk 

    let tokenInstance;
    let tokenStorage;

    let mavrykFa2TokenInstance
    let mavrykFa2TokenStorage

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
            
            // mock fa12 token
            tokenAddress            = contractDeployments.mavrykFa12Token.address
            tokenInstance           = await utils.tezos.contract.at(tokenAddress);
            tokenStorage            = await tokenInstance.storage();

            // for mistaken transfers
            mavrykFa2TokenAddress   = contractDeployments.mavrykFa2Token.address 
            mavrykFa2TokenInstance  = await utils.tezos.contract.at(mavrykFa2TokenAddress);
            mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();
            
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
            
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });


    describe("%transfer", async () => {
    
        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('User should be able to transfer token to another user', async () => {
            try{
                // Initial Values
                tokenStorage              = await tokenInstance.storage();
                const initFirstUserLedgerRecord     = await tokenStorage.ledger.get(alice.pkh);
                const initFirstUserBalance          = initFirstUserLedgerRecord.balance.toNumber();
                const initSecondUserLedgerRecord    = await tokenStorage.ledger.get(eve.pkh);
                const initSecondUserBalance         = initSecondUserLedgerRecord.balance.toNumber();
                const tokenAmount                   = 100;

                // Operation
                const transferOperation             = await tokenInstance.methods.transfer(alice.pkh, eve.pkh, tokenAmount).send();
                await transferOperation.confirmation();

                // Final values
                tokenStorage              = await tokenInstance.storage();
                const endFirstUserLedgerRecord      = await tokenStorage.ledger.get(alice.pkh);
                const endFirstUserBalance           = endFirstUserLedgerRecord.balance.toNumber();
                const endSecondUserLedgerRecord     = await tokenStorage.ledger.get(eve.pkh);
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
                tokenStorage              = await tokenInstance.storage();
                const initFirstUserLedgerRecord     = await tokenStorage.ledger.get(bob.pkh);
                const initFirstUserBalance          = initFirstUserLedgerRecord.balance.toNumber();
                const initSecondUserLedgerRecord    = await tokenStorage.ledger.get(eve.pkh);
                const initSecondUserBalance         = initSecondUserLedgerRecord.balance.toNumber();
                const initThirdUserLedgerRecord     = await tokenStorage.ledger.get(alice.pkh);
                const initThirdUserBalance          = initThirdUserLedgerRecord.balance.toNumber();
                const tokenAmount                   = 100;

                // Approve operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                const approveOperation              = await tokenInstance.methods.approve(alice.pkh, tokenAmount).send();
                await approveOperation.confirmation();

                // Transfer operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                const transferOperation             = await tokenInstance.methods.transfer(bob.pkh, eve.pkh, tokenAmount).send();
                await transferOperation.confirmation();

                // Final values
                tokenStorage              = await tokenInstance.storage();
                const endFirstUserLedgerRecord      = await tokenStorage.ledger.get(bob.pkh);
                const endFirstUserBalance           = endFirstUserLedgerRecord.balance.toNumber();
                const endSecondUserLedgerRecord     = await tokenStorage.ledger.get(eve.pkh);
                const endSecondUserBalance          = endSecondUserLedgerRecord.balance.toNumber();
                const endThirdUserLedgerRecord      = await tokenStorage.ledger.get(alice.pkh);
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
                tokenStorage              = await tokenInstance.storage();
                const initFirstUserLedgerRecord     = await tokenStorage.ledger.get(alice.pkh);
                const initFirstUserBalance          = initFirstUserLedgerRecord.balance.toNumber();
                const tokenAmount                   = initFirstUserBalance + 1;

                // Operation
                await chai.expect(tokenInstance.methods.transfer(alice.pkh, eve.pkh, tokenAmount).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('User should be not able to transfer token from another address if nobody allowed it to', async () => {
            try{
                // Initial Values
                tokenStorage              = await tokenInstance.storage();
                const tokenAmount                   = 100;

                // Operation
                await chai.expect(tokenInstance.methods.transfer(bob.pkh, eve.pkh, tokenAmount).send()).to.be.rejected;
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
                tokenStorage          = await tokenInstance.storage();
                const initFirstUserLedgerRecord = await tokenStorage.ledger.get(alice.pkh);
                const initFirstUserAllowances   = initFirstUserLedgerRecord.allowances.get(bob.pkh) === undefined ? 0 : initFirstUserLedgerRecord.allowances.get(bob.pkh).toNumber();
                const tokenAmount               = 100;

                // Operation
                const approveOperation          = await tokenInstance.methods.approve(bob.pkh, tokenAmount).send();
                await approveOperation.confirmation();

                // Final values
                tokenStorage          = await tokenInstance.storage();
                const endFirstUserLedgerRecord  = await tokenStorage.ledger.get(alice.pkh);
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
                tokenStorage          = await tokenInstance.storage();
                const tokenAmount               = 100;

                // Operation
                await chai.expect(tokenInstance.methods.approve(bob.pkh, tokenAmount).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%mintOrBurn", async () => {
    
        before("Set user as whitelisted address", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
            const updateWhitelistOperation  = await tokenInstance.methods.updateWhitelistContracts("user", alice.pkh).send();
            await updateWhitelistOperation.confirmation();
            await helperFunctions.signerFactory(tezos, alice.sk);
        });
    
        beforeEach("Set signer to whitelisted address", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Whitelisted address should be able to mint token on a given address', async () => {
            try{
                // Initial Values
                tokenStorage          = await tokenInstance.storage();
                const initTotalSupply           = tokenStorage.totalSupply.toNumber();
                const initFirstUserLedgerRecord = await tokenStorage.ledger.get(alice.pkh);
                const initFirstUserBalance      = initFirstUserLedgerRecord.balance.toNumber();
                const tokenAmount               = 100;

                // Operation
                const mintOperation             = await tokenInstance.methods.mintOrBurn(alice.pkh, tokenAmount).send();
                await mintOperation.confirmation();

                // Final values
                tokenStorage          = await tokenInstance.storage();
                const endTotalSupply            = tokenStorage.totalSupply.toNumber();
                const endFirstUserLedgerRecord  = await tokenStorage.ledger.get(alice.pkh);
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
                tokenStorage          = await tokenInstance.storage();
                const initTotalSupply           = tokenStorage.totalSupply.toNumber();
                const initFirstUserLedgerRecord = await tokenStorage.ledger.get(alice.pkh);
                const initFirstUserBalance      = initFirstUserLedgerRecord.balance.toNumber();
                const tokenAmount               = -100;

                // Operation
                const burnOperation             = await tokenInstance.methods.mintOrBurn(alice.pkh, tokenAmount).send();
                await burnOperation.confirmation();

                // Final values
                tokenStorage          = await tokenInstance.storage();
                const endTotalSupply            = tokenStorage.totalSupply.toNumber();
                const endFirstUserLedgerRecord  = await tokenStorage.ledger.get(alice.pkh);
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
                tokenStorage          = await tokenInstance.storage();
                const initFirstUserLedgerRecord = await tokenStorage.ledger.get(alice.pkh);
                const initFirstUserBalance      = initFirstUserLedgerRecord.balance.toNumber();
                const tokenAmount               = -1 * (initFirstUserBalance + 1);

                // Operation
                await chai.expect(tokenInstance.methods.mintOrBurn(alice.pkh, tokenAmount).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Non-whitelisted address should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                tokenStorage          = await tokenInstance.storage();
                const tokenAmount               = -100;

                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(tokenInstance.methods.mintOrBurn(alice.pkh, tokenAmount).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

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
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, tokenAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await helperFunctions.signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(tokenInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

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
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, tokenAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(tokenInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount);
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
