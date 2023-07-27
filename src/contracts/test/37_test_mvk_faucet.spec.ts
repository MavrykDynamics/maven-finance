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

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("MVK Faucet tests", async () => {

    var utils: Utils
    var tezos;

    let mvkFaucetInstance
    let mvkTokenInstance

    let mvkFaucetStorage
    let mvkTokenStorage

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos
        
        mvkFaucetInstance                       = await utils.tezos.contract.at(contractDeployments.mvkFaucet.address);
        mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);

        mvkFaucetStorage                        = await mvkFaucetInstance.storage();
        mvkTokenStorage                         = await mvkTokenInstance.storage();

        console.log('-- -- -- -- -- Vault Tests -- -- -- --')
        console.log('MVK Faucet Contract deployed at:',         mvkFaucetInstance.address);
        console.log('MVK Token Contract deployed at:',          mvkTokenInstance.address);

    });



    describe('%requestMvk', function () {

        before('%requestMvk', async () => {
            try{
                // Admin sends MVK token to the faucet
                await helperFunctions.signerFactory(tezos, bob.sk)
                const adminEntireMVKBalance = await mvkTokenStorage.ledger.get(bob.pkh)
                const operation             = await mvkTokenInstance.methods.transfer([
                    {
                        from_: bob.pkh,
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

        it('User should be able to request 1000MVK from the faucet', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, eve.sk)
                mvkTokenStorage             = await mvkTokenInstance.storage();
                mvkFaucetStorage            = await mvkFaucetInstance.storage();
                const faucetStartBalance    = await mvkTokenStorage.ledger.get(mvkFaucetInstance.address);
                const userStartBalance      = await mvkTokenStorage.ledger.get(eve.pkh);
                const userRequestStartTrace = await mvkFaucetStorage.requesters.get(eve.pkh);

                // Operation
                const operation             = await mvkFaucetInstance.methods.requestMvk().send();
                await operation.confirmation();

                // Final values
                mvkTokenStorage             = await mvkTokenInstance.storage();
                mvkFaucetStorage            = await mvkFaucetInstance.storage();
                const faucetEndBalance      = await mvkTokenStorage.ledger.get(mvkFaucetInstance.address);
                const userEndBalance        = await mvkTokenStorage.ledger.get(eve.pkh);
                const userRequestEndTrace   = await mvkFaucetStorage.requesters.get(eve.pkh);

                // Assertions
                assert.equal(faucetEndBalance.toNumber(), faucetStartBalance.toNumber() - MVK(1000));
                assert.equal(userEndBalance.toNumber(), userStartBalance.toNumber() + MVK(1000));
                assert.strictEqual(userRequestStartTrace, undefined);
                assert.notStrictEqual(userRequestEndTrace, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('User should not be able to request MVK twice', async () => {

            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, eve.sk)
                mvkFaucetStorage            = await mvkFaucetInstance.storage();
                const userRequestTrace      = await mvkFaucetStorage.requesters.get(eve.pkh);

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