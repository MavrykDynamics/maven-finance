const mvkToken = artifacts.require('mvkToken');

const { initial_storage } = require('../migrations/1_deploy_mvk_token.js');
const constants = require('../helpers/constants.js');
/**
 * For testing on a babylonnet (testnet), instead of the sandbox network,
 * make sure to replace the keys for alice/bob accordingly.
 */
const { alice, bob } = require('../scripts/sandbox/accounts');

contract('mvkToken', accounts => {
    let storage;
    let mvkTokenInstance;

    before(async () => {
        mvkTokenInstance = await mvkToken.deployed();
        console.log('Contract deployed at:', mvkTokenInstance.address);
        storage = await mvkTokenInstance.storage();
    });

    const expectedBalanceAlice = initial_storage.ledger.get(alice.pkh).balance;
    it(`should store a balance of ${expectedBalanceAlice} for Alice`, async () => {
        const deployedLedgerAlice = await storage.ledger.get(alice.pkh);
        assert.equal(expectedBalanceAlice, deployedLedgerAlice.balance);
    });

    it(`should not store any balance for Bob`, async () => {
        let balanceBob = await storage.ledger.get(bob.pkh);
        assert.equal(balanceBob, undefined);
    });

    it('should transfer 1 MVK token from Alice to Bob', async () => {
        await mvkTokenInstance.transfer(alice.pkh, bob.pkh, 1);
        const deployedLedgerBob = await storage.ledger.get(bob.pkh);
        const expectedBalanceBob = 1;
        assert.equal(deployedLedgerBob.balance, expectedBalanceBob);
    });

    it(`should not allow transfers from_ an address that did not sign the transaction`, async () => {
        try {
            /**
             * Transactions in the test suite are signed by a secret/private key
             * configured in truffle-config.js
             */
            await mvkTokenInstance.transfer(bob.pkh, alice.pkh, 1);
        } catch (e) {
            assert.equal(e.message, constants.contractErrors.notEnoughAllowance)
        }
    });

    it(`should not transfer tokens from Alice to Bob when Alice's balance is insufficient`, async () => {
        try {
            await mvkTokenInstance.transfer(alice.pkh, bob.pkh, 100000000000);
        } catch (e) {
            assert.equal(e.message, constants.contractErrors.notEnoughBalance)
        }
    });

});
