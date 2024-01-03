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
import {
    fa12Transfer,
    fa2Transfer,
    getStorageMapValue,
    mistakenTransferFa2Token,
    signerFactory,
    updateGeneralContracts,
    updateWhitelistContracts,
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------


describe("Test: Maven FA12 Token Contract", async () => {

    var utils: Utils;
    let tezos 

    // defaults
    let tokenId = 0
    let tokenAmount
    let approvedAmount

    // contract instances 
    let tokenAddress
    let tokenInstance;
    let tokenStorage;
    let mavenFa2TokenAddress
    let mavenFa2TokenInstance
    let mavenFa2TokenStorage

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
    let initialSenderTokenBalance
    let initialReceiverTokenBalance
    let initialApproverTokenBalance

    // updated token balances
    let updatedSenderTokenBalance
    let updatedReceiverTokenBalance
    let updatedApproverTokenBalance

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
    let approveOperation
    let mistakenTransferOperation
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
            
            // mock fa12 token
            tokenAddress            = contractDeployments.mavenFa12Token.address
            tokenInstance           = await utils.tezos.contract.at(tokenAddress);
            tokenStorage            = await tokenInstance.storage();

            // for mistaken transfers
            mavenFa2TokenAddress   = contractDeployments.mavenFa2Token.address 
            mavenFa2TokenInstance  = await utils.tezos.contract.at(mavenFa2TokenAddress);
            mavenFa2TokenStorage   = await mavenFa2TokenInstance.storage();
            
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
            
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });


    describe("%transfer", async () => {
    
        beforeEach("Set signer to user", async () => {
            await signerFactory(tezos, eve.sk)
        });
        
        it('user (eve) should be able to transfer non-zero token amount to another user', async () => {
            try{
                
                // initial variables
                sender      = eve.pkh;
                receiver    = alice.pkh;
                tokenAmount = 100;

                // initial storage
                tokenStorage                        = await tokenInstance.storage();
                initialSenderTokenBalance           = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                initialReceiverTokenBalance         = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // transfer operation
                transferOperation = await fa12Transfer(tokenInstance, sender, receiver, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                        = await tokenInstance.storage();
                updatedSenderTokenBalance           = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                updatedReceiverTokenBalance         = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // assertions
                assert.equal(updatedSenderTokenBalance, initialSenderTokenBalance - tokenAmount);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance + tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (eve) should be able to transfer zero token amount to another user', async () => {
            try{
                
                // initial variables
                sender      = eve.pkh;
                receiver    = alice.pkh;
                tokenAmount = 0;

                // initial storage
                tokenStorage                        = await tokenInstance.storage();
                initialSenderTokenBalance           = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                initialReceiverTokenBalance         = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // transfer operation
                transferOperation = await fa12Transfer(tokenInstance, sender, receiver, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                        = await tokenInstance.storage();
                updatedSenderTokenBalance           = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                updatedReceiverTokenBalance         = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // assertions
                assert.equal(updatedSenderTokenBalance, initialSenderTokenBalance - tokenAmount);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance + tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('user (eve) should not be able to transfer more token than she has', async () => {
            try{
                
                // initial values
                sender      = eve.pkh;
                receiver    = alice.pkh;

                // initial storage
                tokenStorage                  = await tokenInstance.storage();
                initialSenderTokenBalance     = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                tokenAmount                   = initialSenderTokenBalance + 1;

                // Operation
                transferOperation = await fa12Transfer(tokenInstance, approver, receiver, tokenAmount);
                await transferOperation.confirmation();

            } catch(e){
                
                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = (await tokenStorage.ledger.get(sender)).balance.toNumber();

                // no change in balance
                assert.equal(updatedSenderTokenBalance, initialSenderTokenBalance);

            }
        });
        
        it('user (eve) should not be able to transfer negative amounts of token', async () => {
            try{
                
                // initial values
                sender      = eve.pkh;
                receiver    = alice.pkh;

                // initial storage
                tokenStorage                  = await tokenInstance.storage();
                initialSenderTokenBalance     = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                tokenAmount                   = -100;

                // Operation
                transferOperation = await fa12Transfer(tokenInstance, approver, receiver, tokenAmount);
                await transferOperation.confirmation();

            } catch(e){
                
                // updated storage
                tokenStorage                = await tokenInstance.storage()
                updatedSenderTokenBalance   = (await tokenStorage.ledger.get(sender)).balance.toNumber();

                // no change in balance
                assert.equal(updatedSenderTokenBalance, initialSenderTokenBalance);

            }
        });
        
    })

    describe("%approve", async () => {
    
        beforeEach("Set signer to user", async () => {
            await signerFactory(tezos, eve.sk)
        });

        it('user (eve) should be able to transfer tokens from another user (mallory), if given approval, to another user (alice)', async () => {
            try{

                // initial values
                sender      = eve.pkh;
                senderSk    = eve.sk;
                receiver    = alice.pkh;
                approver    = mallory.pkh;
                approverSk  = mallory.sk;
                tokenAmount = 100;
                
                // initial storage
                tokenStorage                        = await tokenInstance.storage();
                initialSenderTokenBalance           = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                initialReceiverTokenBalance         = (await tokenStorage.ledger.get(receiver)).balance.toNumber();
                initialApproverTokenBalance         = (await tokenStorage.ledger.get(approver)).balance.toNumber();

                // approve operation - set to 0
                await signerFactory(tezos, approverSk);
                approveOperation = await tokenInstance.methods.approve(sender, 0).send();
                await approveOperation.confirmation();

                // approve operation - set to token amount
                await signerFactory(tezos, approverSk);
                approveOperation = await tokenInstance.methods.approve(sender, tokenAmount).send();
                await approveOperation.confirmation();

                // transfer operation
                await signerFactory(tezos, senderSk);                
                transferOperation = await fa12Transfer(tokenInstance, approver, receiver, tokenAmount);
                await transferOperation.confirmation();

                // updated storage
                tokenStorage                        = await tokenInstance.storage();
                updatedSenderTokenBalance           = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                updatedReceiverTokenBalance         = (await tokenStorage.ledger.get(receiver)).balance.toNumber();
                updatedApproverTokenBalance         = (await tokenStorage.ledger.get(approver)).balance.toNumber();

                // Assertions
                assert.equal(updatedApproverTokenBalance, initialApproverTokenBalance - tokenAmount);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance + tokenAmount);
                assert.equal(updatedSenderTokenBalance, initialSenderTokenBalance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (eve) should not be able to transfer tokens from another user (mallory) if she is not approved', async () => {
            try{
                
                // initial values
                sender      = eve.pkh;
                senderSk    = eve.sk;
                receiver    = alice.pkh;
                tokenAmount = 100;

                // initial storage
                tokenStorage                        = await tokenInstance.storage();
                initialSenderTokenBalance           = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                initialReceiverTokenBalance         = (await tokenStorage.ledger.get(receiver)).balance.toNumber();
                initialApproverTokenBalance         = (await tokenStorage.ledger.get(approver)).balance.toNumber();

                // transfer operation
                await signerFactory(tezos, senderSk);                
                transferOperation = await fa12Transfer(tokenInstance, approver, receiver, tokenAmount);
                await transferOperation.confirmation();

            } catch(e){
                
                // updated storage
                tokenStorage                    = await tokenInstance.storage()
                updatedSenderTokenBalance       = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                updatedReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();
                updatedApproverTokenBalance     = (await tokenStorage.ledger.get(approver)).balance.toNumber();

                // check no change in balances as sender is not approved to send on behalf of approver
                assert.equal(updatedSenderTokenBalance, initialSenderTokenBalance);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance);
                assert.equal(updatedApproverTokenBalance, initialApproverTokenBalance);

            }
        });

        it('user (eve) should not be able to transfer more tokens than what has been approved from another user (mallory)', async () => {
            try{
                
                // initial values
                sender          = eve.pkh;
                senderSk        = eve.sk;
                receiver        = alice.pkh;
                approver        = mallory.pkh;
                approverSk      = mallory.sk;
                
                approvedAmount  = 100;
                tokenAmount     = 101;

                // initial storage
                tokenStorage                        = await tokenInstance.storage();
                initialSenderTokenBalance           = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                initialReceiverTokenBalance         = (await tokenStorage.ledger.get(receiver)).balance.toNumber();
                initialApproverTokenBalance         = (await tokenStorage.ledger.get(approver)).balance.toNumber();

                // approve operation
                await signerFactory(tezos, approverSk);
                approveOperation = await tokenInstance.methods.approve(sender, approvedAmount).send();
                await approveOperation.confirmation();

                // transfer operation
                await signerFactory(tezos, senderSk);                
                transferOperation = await fa12Transfer(tokenInstance, approver, receiver, tokenAmount);
                await transferOperation.confirmation();

            } catch(e){
                
                // updated storage
                tokenStorage                    = await tokenInstance.storage()
                updatedSenderTokenBalance       = (await tokenStorage.ledger.get(sender)).balance.toNumber();
                updatedReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();
                updatedApproverTokenBalance     = (await tokenStorage.ledger.get(approver)).balance.toNumber();

                // check no change in balances as token amount to be sent is greater than approved amount
                assert.equal(updatedSenderTokenBalance, initialSenderTokenBalance);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance);
                assert.equal(updatedApproverTokenBalance, initialApproverTokenBalance);

            }
        });
        
    })

    describe("%mintOrBurn", async () => {
    
        beforeEach("Set signer to user (eve)", async () => {
            await signerFactory(tezos, eve.sk)
        });
        
        it('user (eve) should be able to mint to another user (alice) if she is whitelisted', async () => {
            try{
                
                // initial variables
                contractMapKey  = eve.pkh;
                sender          = eve.pkh;
                senderSk        = eve.sk;
                receiver        = alice.pkh;
                tokenAmount     = 0;

                // set admin (bob) as signer and add eve to whitelist contracts
                await signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await updateWhitelistContracts(tokenInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                // initial storage
                tokenStorage                    = await tokenInstance.storage();
                initialTotalSupply              = tokenStorage.totalSupply.toNumber();
                initialReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // mint operation
                await signerFactory(tezos, senderSk);
                mintOperation = await tokenInstance.methods.mintOrBurn(receiver, tokenAmount).send();
                await mintOperation.confirmation();

                // updated storage
                tokenStorage                    = await tokenInstance.storage();
                updatedTotalSupply              = tokenStorage.totalSupply.toNumber();
                updatedReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // assertions
                assert.equal(updatedTotalSupply, initialTotalSupply + tokenAmount);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance + tokenAmount);

                // set admin (bob) as signer and remove eve from whitelist contracts
                await signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await updateWhitelistContracts(tokenInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('user (eve) should be able to burn some tokens from a user (alice) if she is whitelisted', async () => {
            try{
                
                // initial variables
                contractMapKey  = eve.pkh;
                sender          = eve.pkh;
                senderSk        = eve.sk;
                receiver        = alice.pkh;
                tokenAmount     = -100;

                // set admin (bob) as signer and add eve to whitelist contracts
                await signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await updateWhitelistContracts(tokenInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                // initial storage
                tokenStorage                    = await tokenInstance.storage();
                initialTotalSupply              = tokenStorage.totalSupply.toNumber();
                initialReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // burn operation
                await signerFactory(tezos, senderSk);
                burnOperation = await tokenInstance.methods.mintOrBurn(receiver, tokenAmount).send();
                await burnOperation.confirmation();

                // updated storage
                tokenStorage                    = await tokenInstance.storage();
                updatedTotalSupply              = tokenStorage.totalSupply.toNumber();
                updatedReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // asertions
                assert.equal(updatedTotalSupply, initialTotalSupply + tokenAmount);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance + tokenAmount);

                // set admin (bob) as signer and remove eve from whitelist contracts
                await signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await updateWhitelistContracts(tokenInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('user (eve) should not be able to burn more tokens from a user (alice) than what she has, even if she is whitelisted', async () => {
            try{

                // initial variables
                contractMapKey  = eve.pkh;
                sender          = eve.pkh;
                senderSk        = eve.sk;
                receiver        = alice.pkh;

                // set admin (bob) as signer and add eve to whitelist contracts
                await signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await updateWhitelistContracts(tokenInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()
                
                // initial storage
                tokenStorage                    = await tokenInstance.storage();
                initialTotalSupply              = tokenStorage.totalSupply.toNumber();
                initialReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();
                tokenAmount                     = -1 * (initialReceiverTokenBalance + 1);

                // burn operation
                await signerFactory(tezos, senderSk);
                burnOperation = await tokenInstance.methods.mintOrBurn(receiver, tokenAmount).send();
                await burnOperation.confirmation();

            } catch(e){

                // updated storage
                tokenStorage                    = await tokenInstance.storage();
                updatedTotalSupply              = tokenStorage.totalSupply.toNumber();
                updatedReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // asertions - no change
                assert.equal(updatedTotalSupply, initialTotalSupply);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance);

                // set admin (bob) as signer and remove eve from whitelist contracts
                await signerFactory(tezos, bob.sk);
                updateWhitelistContractsOperation = await updateWhitelistContracts(tokenInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()
            }
        });
        
        it('user (eve) should not be able to mint without being whitelisted', async () => {
            try{

                // initial variables
                sender          = eve.pkh;
                receiver        = alice.pkh;
                tokenAmount     = 100;

                // initial storage
                tokenStorage                    = await tokenInstance.storage();
                initialTotalSupply              = tokenStorage.totalSupply.toNumber();
                initialReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // mint operation
                mintOperation                   = await tokenInstance.methods.mintOrBurn(receiver, tokenAmount).send();
                await mintOperation.confirmation();

            } catch(e){
                
                // updated storage
                tokenStorage                    = await tokenInstance.storage();
                updatedTotalSupply              = tokenStorage.totalSupply.toNumber();
                updatedReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // assertions - no change
                assert.equal(updatedTotalSupply, initialTotalSupply);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance);

            }
        });

        it('user (eve) should not be able to burn without being whitelisted', async () => {
            try{

                // initial variables
                sender          = eve.pkh;
                receiver        = alice.pkh;
                tokenAmount     = -100;

                // initial storage
                tokenStorage                    = await tokenInstance.storage();
                initialTotalSupply              = tokenStorage.totalSupply.toNumber();
                initialReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // burn operation
                burnOperation                   = await tokenInstance.methods.mintOrBurn(receiver, tokenAmount).send();
                await burnOperation.confirmation();

            } catch(e){
                
                // updated storage
                tokenStorage                    = await tokenInstance.storage();
                updatedTotalSupply              = tokenStorage.totalSupply.toNumber();
                updatedReceiverTokenBalance     = (await tokenStorage.ledger.get(receiver)).balance.toNumber();

                // assertions - no change
                assert.equal(updatedTotalSupply, initialTotalSupply);
                assert.equal(updatedReceiverTokenBalance, initialReceiverTokenBalance);

            }
        });
    });

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            await signerFactory(tezos, bob.sk);
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
                await signerFactory(tezos, alice.sk);
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
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(tokenInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(tokenInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
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

                // Mistaken Operation - user (mallory) send 10 MavenFa2Tokens to MVN Token Contract
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, user, tokenAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const initialUserBalance    = (await mavenFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await mistakenTransferFa2Token(tokenInstance, user, mavenFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavenFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

    })

    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await signerFactory(tezos, mallory.sk);
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
                contractMapKey  = alice.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(tokenStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await tokenInstance.methods.updateWhitelistContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                tokenStorage = await tokenInstance.storage()
                updatedContractMapValue = await getStorageMapValue(tokenStorage, storageMap, contractMapKey);

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

                // Mistaken Operation - send 10 MVN to MVN Token Contract
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, user, tokenAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                mistakenTransferOperation = await mistakenTransferFa2Token(tokenInstance, user, mavenFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it('%mintOrBurn               - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                tokenAmount = 100;
                mintOperation = await tokenInstance.methods.mintOrBurn(mallory.pkh, tokenAmount);
                await chai.expect(mintOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })
    
    })

});
