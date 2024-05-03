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

import { bob, eve } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("MVN Faucet tests", async () => {

    var utils: Utils
    var tezos;

    let user
    let userSk

    let admin
    let adminSk

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



    describe('%requestMvn', function () {

        before('admin (bob) sends token to the faucet', async () => {
            try{
                // Admin sends MVN token to the faucet
                await helperFunctions.signerFactory(tezos, adminSk)
                const adminEntireMVNBalance     = await mvnTokenStorage.ledger.get(admin)
                var operation                   = await mvnTokenInstance.methods.transfer([
                    {
                        from_: admin,
                        txs: [
                        {
                            to_: mvnFaucetInstance.address,
                            token_id: 0,
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

        it('user (eve) should be able to request 1000MVN from the faucet', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnTokenStorage             = await mvnTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetStartBalance    = await mvnTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userStartBalance      = await mvnTokenStorage.ledger.get(user);
                const userRequestStartTrace = await mvnFaucetStorage.requesters.get({
                    0: user,
                    1: {
                        mvn: null
                    }
                });

                // Operation
                const operation             = await mvnFaucetInstance.methods.requestMvn().send();
                await operation.confirmation();

                // Final values
                mvnTokenStorage             = await mvnTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetEndBalance      = await mvnTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userEndBalance        = await mvnTokenStorage.ledger.get(user);
                const userRequestEndTrace   = await mvnFaucetStorage.requesters.get({
                    0: user,
                    1: {
                        mvn: null
                    }
                });

                // Assertions
                assert.equal(faucetEndBalance.toNumber(), faucetStartBalance.toNumber() - MVN(1000));
                assert.equal(userEndBalance.toNumber(), userStartBalance.toNumber() + MVN(1000));
                assert.strictEqual(userRequestStartTrace, undefined);
                assert.notStrictEqual(userRequestEndTrace, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('user (eve) should not be able to request MVN twice', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const userRequestTrace      = await mvnFaucetStorage.requesters.get({
                    0: user,
                    1: {
                        mvn: null
                    }
                });

                // Operation
                await chai.expect(mvnFaucetInstance.methods.requestMvn().send()).to.be.rejected;

                // Assertions
                assert.notStrictEqual(userRequestTrace, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

    });

    describe('%requestFakeUsdt', function () {

        before('admin (bob) sends token to the faucet', async () => {
            try{
                // Admin sends MVN token to the faucet
                await helperFunctions.signerFactory(tezos, adminSk)
                const adminEntireUSDtBalance    = await usdtTokenStorage.ledger.get(admin)
                var operation                 = await usdtTokenInstance.methods.transfer([
                    {
                        from_: admin,
                        txs: [
                        {
                            to_: mvnFaucetInstance.address,
                            token_id: 0,
                            amount: adminEntireUSDtBalance,
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

        it('user (eve) should be able to request 1000USDt from the faucet', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                usdtTokenStorage            = await usdtTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetStartBalance    = await usdtTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userStartBalance      = await usdtTokenStorage.ledger.get(user);
                const userRequestStartTrace = await mvnFaucetStorage.requesters.get({
                    0: user,
                    1: {
                        fakeUsdt: null
                    }
                });

                // Operation
                const operation             = await mvnFaucetInstance.methods.requestFakeUsdt().send();
                await operation.confirmation();

                // Final values
                usdtTokenStorage            = await usdtTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetEndBalance      = await usdtTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userEndBalance        = await usdtTokenStorage.ledger.get(user);
                const userRequestEndTrace   = await mvnFaucetStorage.requesters.get({
                    0: user,
                    1: {
                        fakeUsdt: null
                    }
                });

                // Assertions
                assert.equal(faucetEndBalance.toNumber(), faucetStartBalance.toNumber() - 1000000000);
                assert.equal(userEndBalance.toNumber(), userStartBalance.toNumber() + 1000000000);
                assert.strictEqual(userRequestStartTrace, undefined);
                assert.notStrictEqual(userRequestEndTrace, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('user (eve) should not be able to request MVN twice', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const userRequestTrace      = await mvnFaucetStorage.requesters.get({
                    0: user,
                    1: {
                        fakeUsdt: null
                    }
                });

                // Operation
                await chai.expect(mvnFaucetInstance.methods.requestFakeUsdt().send()).to.be.rejected;

                // Assertions
                assert.notStrictEqual(userRequestTrace, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

    });

});