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

    let mvnFaucetStorage
    let mvnTokenStorage

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

        mvnFaucetStorage                        = await mvnFaucetInstance.storage();
        mvnTokenStorage                         = await mvnTokenInstance.storage();

        console.log('-- -- -- -- -- Faucet Tests -- -- -- --')
        console.log('MVN Faucet Contract deployed at:',         mvnFaucetInstance.address);
        console.log('MVN Token Contract deployed at:',          mvnTokenInstance.address);

    });



    describe('%requestMvn', function () {

        before('admin (bob) sends MVN token to the faucet', async () => {
            try{
                // Admin sends MVN token to the faucet
                await helperFunctions.signerFactory(tezos, adminSk)
                const adminEntireMVNBalance = await mvnTokenStorage.ledger.get(admin)
                const operation             = await mvnTokenInstance.methods.transfer([
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
                const userRequestStartTrace = await mvnFaucetStorage.requesters.get(user);

                // Operation
                const operation             = await mvnFaucetInstance.methods.requestMvn().send();
                await operation.confirmation();

                // Final values
                mvnTokenStorage             = await mvnTokenInstance.storage();
                mvnFaucetStorage            = await mvnFaucetInstance.storage();
                const faucetEndBalance      = await mvnTokenStorage.ledger.get(mvnFaucetInstance.address);
                const userEndBalance        = await mvnTokenStorage.ledger.get(user);
                const userRequestEndTrace   = await mvnFaucetStorage.requesters.get(user);

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
                const userRequestTrace      = await mvnFaucetStorage.requesters.get(user);

                // Operation
                await chai.expect(mvnFaucetInstance.methods.requestMvn().send()).to.be.rejected;

                // Assertions
                assert.notStrictEqual(userRequestTrace, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

    });

});