const sender = artifacts.require('sender');
const proxy = artifacts.require('proxy');

const { UnitValue } = require('@taquito/michelson-encoder');

const { senderInitialStorage } = require('../migrations/4_deploy_sender.js');
const { proxyInitialStorage } = require('../migrations/5_deploy_proxy.js');

const { alice, bob } = require('../scripts/sandbox/accounts');

contract('sender & proxy', accounts => {
    let senderStorage;
    let senderInstance;
    let proxyInstance;

    before(async () => {
        senderInstance = await sender.deployed();
        console.log('Sender contract deployed at:', senderInstance.address);
        senderStorage = await senderInstance.storage();

        proxyInstance = await proxy.deployed();
        console.log('Proxy contract deployed at:', proxyInstance.address);
        proxyStorage = await proxyInstance.storage();
    });

    it(`call sender increment through proxy`, async () => {
        try{
            
            const beforeSenderStorage = await senderInstance.storage();
            console.log('before Sender storage: '+ beforeSenderStorage); // 0        
        
            const increment = await proxyInstance.increment(5);

            const afterSenderStorage = await senderInstance.storage();
            console.log('after Sender storage: '+ afterSenderStorage); // 5   

            assert.equal(afterSenderStorage, 5);

        } catch (e){
            console.log(e);
        }
    });

    it(`call sender decrement through proxy`, async () => {
        try{
            
            const beforeSenderStorage = await senderInstance.storage();
            console.log('before Sender storage: '+ beforeSenderStorage); // 5     
        
            const decrement = await proxyInstance.decrement(3);

            const afterSenderStorage = await senderInstance.storage();
            console.log('after Sender storage: '+ afterSenderStorage); // 2       

            assert.equal(afterSenderStorage, 2);

        } catch (e){
            console.log(e);
        }
    });

    it(`call sender reset through proxy`, async () => {
        try{
            
            const beforeSenderStorage = await senderInstance.storage();
            console.log('before Sender storage: '+ beforeSenderStorage); // 2  
        
            const reset = await proxyInstance.reset(UnitValue);

            const afterSenderStorage = await senderInstance.storage();
            console.log('after Sender storage: '+ afterSenderStorage); // 0

            assert.equal(afterSenderStorage, 0);

        } catch (e){
            console.log(e);
        }
    });

    


    // it(`should not store any balance for Bob`, async () => {
    //     let balanceBob = await storage.ledger.get(bob.pkh);
    //     assert.equal(balanceBob, undefined);
    // });

    // it('should transfer 1 MVK token from Alice to Bob', async () => {
    //     await senderInstance.transfer(alice.pkh, bob.pkh, 1);
    //     const deployedLedgerBob = await storage.ledger.get(bob.pkh);
    //     const expectedBalanceBob = 1;
    //     assert.equal(deployedLedgerBob.balance, expectedBalanceBob);
    // });

    // it(`should not allow transfers from_ an address that did not sign the transaction`, async () => {
    //     try {
    //         /**
    //          * Transactions in the test suite are signed by a secret/private key
    //          * configured in truffle-config.js
    //          */
    //         await senderInstance.transfer(bob.pkh, alice.pkh, 1);
    //     } catch (e) {
    //         assert.equal(e.message, constants.contractErrors.notEnoughAllowance)
    //     }
    // });

    // it(`should not transfer tokens from Alice to Bob when Alice's balance is insufficient`, async () => {
    //     try {
    //         await senderInstance.transfer(alice.pkh, bob.pkh, 100000000000);
    //     } catch (e) {
    //         assert.equal(e.message, constants.contractErrors.notEnoughBalance)
    //     }
    // });

    // it(`should not allow anyone to burn tokens`, async () => {
    //     try {
    //         await senderInstance.burn(alice.pkh, 1);
    //     } catch (e) {
    //         assert.equal(e.message, constants.contractErrors.notAuthorized)
    //     }
    // });

    // it(`should not allow anyone to mint tokens`, async () => {
    //     try {
    //         await senderInstance.mint(alice.pkh, 1);
    //     } catch (e) {
    //         assert.equal(e.message, constants.contractErrors.notAuthorized)
    //     }
    // });

    // it(`should allow doorman to burn tokens`, async () => {
    //     try {
    //         await senderInstance.burn(alice.pkh, 1);
    //     } catch (e) {
    //         assert.equal(e.message, constants.contractErrors.notAuthorized)
    //     }
    // });

});
