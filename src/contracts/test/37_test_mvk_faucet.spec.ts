import assert from "assert";

import { MVK, Utils } from "./helpers/Utils";

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
import { getStorageMapValue } from "./helpers/helperFunctions";

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("MVK Faucet tests", async () => {

    var utils: Utils
    var tezos;

    let user
    let userSk

    let admin
    let adminSk

    let mvkFaucetInstance
    let mvkTokenInstance

    let mvkFaucetStorage
    let mvkTokenStorage

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin   = bob.pkh;
        adminSk = bob.sk;

        user    = eve.pkh;
        userSk  = eve.sk;
        
        mvkFaucetInstance                       = await utils.tezos.contract.at(contractDeployments.mvkFaucet.address);
        mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);

        mvkFaucetStorage                        = await mvkFaucetInstance.storage();
        mvkTokenStorage                         = await mvkTokenInstance.storage();

        console.log('-- -- -- -- -- Faucet Tests -- -- -- --')
        console.log('MVK Faucet Contract deployed at:',         mvkFaucetInstance.address);
        console.log('MVK Token Contract deployed at:',          mvkTokenInstance.address);

    });



    describe('%requestMvk', function () {

        before('admin (bob) sends MVK token to the faucet', async () => {
            try{
                // Admin sends MVK token to the faucet
                await helperFunctions.signerFactory(tezos, adminSk)
                const adminEntireMVKBalance = await getStorageMapValue(mvkTokenStorage, 'ledger', admin)
                const operation             = await mvkTokenInstance.methods.transfer([
                    {
                        from_: admin,
                        txs: [
                        {
                            to_: mvkFaucetInstance.address,
                            token_id: 0,
                            amount: adminEntireMVKBalance,
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

        it('user (eve) should be able to request 1000MVK from the faucet', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvkTokenStorage             = await mvkTokenInstance.storage();
                mvkFaucetStorage            = await mvkFaucetInstance.storage();
                const faucetStartBalance    = await getStorageMapValue(mvkTokenStorage, 'ledger', mvkFaucetInstance.address);
                const userStartBalance      = await getStorageMapValue(mvkTokenStorage, 'ledger', user);
                const userRequestStartTrace = await getStorageMapValue(mvkFaucetStorage, 'requesters', user);

                // Operation
                const operation             = await mvkFaucetInstance.methods.requestMvk().send();
                await operation.confirmation();

                // Final values
                mvkTokenStorage             = await mvkTokenInstance.storage();
                mvkFaucetStorage            = await mvkFaucetInstance.storage();
                const faucetEndBalance      = await getStorageMapValue(mvkTokenStorage, 'ledger', mvkFaucetInstance.address);
                const userEndBalance        = await getStorageMapValue(mvkTokenStorage, 'ledger', user);
                const userRequestEndTrace   = await getStorageMapValue(mvkFaucetStorage, 'requesters', user);

                // Assertions
                assert.equal(faucetEndBalance.toNumber(), faucetStartBalance.toNumber() - MVK(1000));
                assert.equal(userEndBalance.toNumber(), userStartBalance.toNumber() + MVK(1000));
                assert.strictEqual(userRequestStartTrace, undefined);
                assert.notStrictEqual(userRequestEndTrace, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('user (eve) should not be able to request MVK twice', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, userSk)
                mvkFaucetStorage            = await mvkFaucetInstance.storage();
                const userRequestTrace      = await getStorageMapValue(mvkFaucetStorage, 'requesters', user);

                // Operation
                await chai.expect(mvkFaucetInstance.methods.requestMvk().send()).to.be.rejected;

                // Assertions
                assert.notStrictEqual(userRequestTrace, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

    });

});