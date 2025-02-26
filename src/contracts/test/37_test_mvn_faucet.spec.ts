import assert from "assert";

import { MVN, Utils } from "./helpers/Utils";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'


// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, eve, mallory } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("MVN Faucet tests", async () => {

    var utils: Utils
    var tezos;

    let user
    let userSk

    let secondUser
    let secondUserSk

    let admin
    let adminSk

    const zeroAddress = "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d"

    let mvnFaucetInstance
    let mvnTokenInstance
    let usdtTokenInstance

    let mvnFaucetStorage
    let mvnTokenStorage
    let usdtTokenStorage

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin   = bob.pkh;
        adminSk = bob.sk;

        user    = eve.pkh;
        userSk  = eve.sk;

        secondUser    = mallory.pkh;
        secondUserSk  = mallory.sk;
        
        mvnFaucetInstance                       = await utils.tezos.contract.at(contractDeployments.mvnFaucet.address);
        mvnTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
        usdtTokenInstance                       = await utils.tezos.contract.at(contractDeployments.fakeUSDtToken.address);

        mvnFaucetStorage                        = await mvnFaucetInstance.storage();
        mvnTokenStorage                         = await mvnTokenInstance.storage();
        usdtTokenStorage                        = await usdtTokenInstance.storage();

        console.log('-- -- -- -- -- Faucet Tests -- -- -- --')
        console.log('MVN Faucet Contract deployed at:',         mvnFaucetInstance.address);
        console.log('MVN Token Contract deployed at:',          mvnTokenInstance.address);
        console.log('Fake USDT Token Contract deployed at:',    usdtTokenInstance.address);

    });

    describe('%updateToken', function () {
        it('admin (bob) should be able to add a token in the faucet', async () => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, adminSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const maxAmountPerUser      = MVN(6000);
                const tokenAddress          = mvnTokenInstance.address;
                const tokenId               = 0;
                const initFaucetToken       = await mvnFaucetStorage.tokens.get({
                    0: tokenAddress,
                    1: tokenId
                });
                
                // Operation
                const operation             = await mvnFaucetInstance.methods.updateToken(maxAmountPerUser, tokenAddress, tokenId).send();
                await operation.confirmation();

                // Final values
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const finalFaucetToken      = await mvnFaucetStorage.tokens.get({
                    0: tokenAddress,
                    1: tokenId
                });

                // Assertions
                assert.strictEqual(initFaucetToken, undefined);
                assert.equal(finalFaucetToken.toNumber(), maxAmountPerUser);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('admin (bob) should be able to add MVRK in the faucet', async () => {
            try{
                // Admin adds mvrk to the faucet
                await helperFunctions.signerFactory(tezos, adminSk)
                const maxAmountPerUser      = 100000000;
                const tokenAddress          = zeroAddress;
                const tokenId               = 0;
                const initFaucetBalance     = await utils.tezos.tz.getBalance(mvnFaucetInstance.address);

                // Operation
                var operation                   = await mvnFaucetInstance.methods.updateToken(maxAmountPerUser, tokenAddress, tokenId).send();
                await operation.confirmation();

                // Admin sends MVN token to the faucet
                operation                       = await utils.tezos.contract.transfer({ to: mvnFaucetInstance.address, amount: maxAmountPerUser * 2, mumav: true});
                await operation.confirmation()

                // Final values
                const finalFaucetBalance     = await utils.tezos.tz.getBalance(mvnFaucetInstance.address);
                assert.strictEqual(finalFaucetBalance.toNumber(), initFaucetBalance.toNumber() + maxAmountPerUser * 2);

            } catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('admin (bob) should be able to update a token max amount in the faucet', async () => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, adminSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const maxAmountPerUser      = MVN(8000);
                const tokenAddress          = mvnTokenInstance.address;
                const tokenId               = 0;
                const initFaucetToken       = await mvnFaucetStorage.tokens.get({
                    0: tokenAddress,
                    1: tokenId
                });
                
                // Operation
                const operation             = await mvnFaucetInstance.methods.updateToken(maxAmountPerUser, tokenAddress, tokenId).send();
                await operation.confirmation();

                // Final values
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const finalFaucetToken      = await mvnFaucetStorage.tokens.get({
                    0: tokenAddress,
                    1: tokenId
                });

                // Assertions
                assert.notStrictEqual(initFaucetToken, undefined);
                assert.equal(finalFaucetToken.toNumber(), maxAmountPerUser);
                assert.notEqual(initFaucetToken.toNumber(), finalFaucetToken.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });
    })

    describe('%removeToken', function () {
        it('admin (bob) should be able to remove a token from the faucet', async () => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, adminSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const tokenAddress          = mvnTokenInstance.address;
                const tokenId               = 0;
                const initFaucetToken       = await mvnFaucetStorage.tokens.get({
                    0: tokenAddress,
                    1: tokenId
                });
                
                // Operation
                const operation             = await mvnFaucetInstance.methods.removeToken(tokenAddress, tokenId).send();
                await operation.confirmation();

                // Final values
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const finalFaucetToken      = await mvnFaucetStorage.tokens.get({
                    0: tokenAddress,
                    1: tokenId
                });

                // Assertions
                assert.notStrictEqual(initFaucetToken, undefined);
                assert.strictEqual(finalFaucetToken, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });
    });


    describe('%requestToken', function () {

        before('admin (bob) adds and sends token to the faucet', async () => {
            try{
                // Admin adds token to the faucet
                await helperFunctions.signerFactory(tezos, adminSk)
                const maxAmountPerUser      = MVN(6000);
                const tokenAddress          = mvnTokenInstance.address;
                const tokenId               = 0;

                // Operation
                var operation                   = await mvnFaucetInstance.methods.updateToken(maxAmountPerUser, tokenAddress, tokenId).send();
                await operation.confirmation();

                // Admin sends MVN token to the faucet
                const adminEntireMVNBalance     = await mvnTokenStorage.ledger.get(admin)
                operation                       = await mvnTokenInstance.methods.transfer([
                    {
                        from_: admin,
                        txs: [
                        {
                            to_: mvnFaucetInstance.address,
                            token_id: tokenId,
                            amount: adminEntireMVNBalance,
                        },
                        ],
                    },
                    ])
                .send()
                await operation.confirmation()

            } catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('user (eve) should be able to request token from the faucet for herself', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnTokenStorage             = await mvnTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetStartBalance    = await mvnTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userStartBalance      = await mvnTokenStorage.ledger.get(user);
                const tokenAddress          = mvnTokenInstance.address;
                const tokenId               = 0;
                const amount                = MVN(1000);

                // Operation
                const operation             = await mvnFaucetInstance.methods.requestToken(amount, tokenAddress, tokenId, user).send();
                await operation.confirmation();

                // Final values
                mvnTokenStorage             = await mvnTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetEndBalance      = await mvnTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userEndBalance        = await mvnTokenStorage.ledger.get(user);
                // Assertions
                assert.equal(faucetEndBalance.toNumber(), faucetStartBalance.toNumber() - MVN(1000));
                assert.equal(userEndBalance.toNumber(), userStartBalance.toNumber() + MVN(1000));

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('user (eve) should be able to request token from the faucet for another user', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnTokenStorage             = await mvnTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetStartBalance    = await mvnTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userStartBalance      = await mvnTokenStorage.ledger.get(secondUser);
                const tokenAddress          = mvnTokenInstance.address;
                const tokenId               = 0;
                const amount                = MVN(1000);

                // Operation
                const operation             = await mvnFaucetInstance.methods.requestToken(amount, tokenAddress, tokenId, secondUser).send();
                await operation.confirmation();

                // Final values
                mvnTokenStorage             = await mvnTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetEndBalance      = await mvnTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userEndBalance        = await mvnTokenStorage.ledger.get(secondUser);

                // Assertions
                assert.equal(faucetEndBalance.toNumber(), faucetStartBalance.toNumber() - MVN(1000));
                assert.equal(userEndBalance.toNumber(), userStartBalance.toNumber() + MVN(1000));

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('user (eve) should be able to request mvrk from the faucet for herself', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetStartBalance    = await utils.tezos.tz.getBalance(mvnFaucetInstance.address);
                const userStartBalance      = await utils.tezos.tz.getBalance(user);
                const tokenAddress          = zeroAddress;
                const tokenId               = 0;
                const amount                = 50000000;

                // Operation
                const operation             = await mvnFaucetInstance.methods.requestToken(amount, tokenAddress, tokenId, user).send();
                await operation.confirmation();

                // Final values
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetEndBalance      = await utils.tezos.tz.getBalance(mvnFaucetInstance.address);
                const userEndBalance        = await utils.tezos.tz.getBalance(user);

                // Assertions
                assert.equal(Math.trunc(faucetEndBalance.toNumber() / 1000000), Math.trunc(faucetStartBalance.toNumber() / 1000000) - Math.trunc(amount / 1000000));
                assert.equal(Math.trunc(userEndBalance.toNumber() / 1000000), Math.trunc(userStartBalance.toNumber() / 1000000) + Math.trunc(amount / 1000000));

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('user (eve) should be able to request mvrk from the faucet for another user', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetStartBalance    = await utils.tezos.tz.getBalance(mvnFaucetInstance.address);
                const userStartBalance      = await utils.tezos.tz.getBalance(secondUser);
                const tokenAddress          = zeroAddress;
                const tokenId               = 0;
                const amount                = 50000000

                // Operation
                const operation             = await mvnFaucetInstance.methods.requestToken(amount, tokenAddress, tokenId, secondUser).send();
                await operation.confirmation();

                // Final values
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetEndBalance      = await utils.tezos.tz.getBalance(mvnFaucetInstance.address);
                const userEndBalance        = await utils.tezos.tz.getBalance(secondUser);

                // Assertions
                assert.equal(faucetEndBalance.toNumber(), faucetStartBalance.toNumber() - amount);
                assert.equal(userEndBalance.toNumber(), userStartBalance.toNumber() + amount);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('user (eve) should not be able to request more token than the maximum allowed', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const tokenAddress          = mvnTokenInstance.address;
                const tokenId               = 0;
                const maxAmountPerUser      = await mvnFaucetStorage.tokens.get({
                    0: tokenAddress,
                    1: tokenId
                });
                const amount                = maxAmountPerUser.toNumber() + 1;

                // Operation
                await chai.expect(mvnFaucetInstance.methods.requestToken(amount, tokenAddress, tokenId, user).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('user (eve) should not be able to request from a token not registered on the faucet', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const tokenAddress          = usdtTokenInstance.address;
                const tokenId               = 0;
                const amount                = 1;
                const maxAmountPerUser      = await mvnFaucetStorage.tokens.get({
                    0: tokenAddress,
                    1: tokenId
                });

                // Operation
                await chai.expect(mvnFaucetInstance.methods.requestToken(amount, tokenAddress, tokenId, user).send()).to.be.rejected;

                // Assertions
                assert.strictEqual(maxAmountPerUser, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

    });
});