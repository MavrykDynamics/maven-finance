const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory, oscar } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';

describe("Delegation tests", async () => {
    var utils: Utils;
    var tezos;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();

        console.log('-- -- -- -- -- Delegation Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);
        console.log('Eve address: ' + eve.pkh);

        tezos = doormanInstance.tezos;

    });

    describe("%distributeRewards", async () => {
        before("Set admin to whitelist and init satellite and delegators", async () => {
            // Set Whitelist
            await signerFactory(bob.sk)
            const satelliteName           = "New Satellite (Bob)";
            const satelliteDescription    = "New Satellite Description (Bob)";
            const satelliteImage          = "https://placeholder.com/300";
            const satelliteFee            = "1000"; // 10% fee
            const updateWhitelistOperation  = await delegationInstance.methods.updateWhitelistContracts("bob", bob.pkh).send();
            await updateWhitelistOperation.confirmation();

            // Init satellite
            var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner    : bob.pkh,
                    operator : doormanAddress.address,
                    token_id : 0,
                },
            }])
            .send()
            await updateOperatorsOperation.confirmation();

            var stakeOperation = await doormanInstance.methods.stake(MVK(10)).send();
            await stakeOperation.confirmation();

            const registerAsSatelliteOperation = await delegationInstance.methods
                .registerAsSatellite(
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteFee
                ).send();
            await registerAsSatelliteOperation.confirmation();

            // Operation
            await signerFactory(alice.sk);
            updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner    : alice.pkh,
                    operator : doormanAddress.address,
                    token_id : 0,
                },
            }])
            .send()
            await updateOperatorsOperation.confirmation();

            var stakeOperation = await doormanInstance.methods.stake(MVK(10)).send();
            await stakeOperation.confirmation();

            var delegationOperation   = await delegationInstance.methods.delegateToSatellite(bob.pkh).send();
            await delegationOperation.confirmation();
            
            // Operation
            await signerFactory(eve.sk);
            updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner    : eve.pkh,
                    operator : doormanAddress.address,
                    token_id : 0,
                },
            }])
            .send()
            await updateOperatorsOperation.confirmation();

            stakeOperation = await doormanInstance.methods.stake(MVK(20)).send();
            await stakeOperation.confirmation();

            delegationOperation   = await delegationInstance.methods.delegateToSatellite(bob.pkh).send();
            await delegationOperation.confirmation();

            await signerFactory(bob.sk)
        });
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        it('Reward distribution tests #1', async () => {
            try{
                // Initial Values
                delegationStorage = await delegationInstance.storage();

                // Distribute Operation
                const distributeOperation = await delegationInstance.methods.distributeRewards([bob.pkh],MVK(50)).send();
                await distributeOperation.confirmation();
                delegationStorage = await delegationInstance.storage();
                var satelliteRecord = await delegationStorage.satelliteLedger.get(bob.pkh)
                console.log("PRE-CLAIM SATELLITE: ", satelliteRecord)

                // Claim operations
                var claimOperation = await delegationInstance.methods.claimRewards().send();
                await claimOperation.confirmation()
                delegationStorage = await delegationInstance.storage();
                var satelliteRecord = await delegationStorage.satelliteLedger.get(bob.pkh)
                console.log("POST-CLAIM SATELLITE: ", satelliteRecord)

                await signerFactory(alice.sk);
                claimOperation = await delegationInstance.methods.claimRewards().send();
                await claimOperation.confirmation()
                delegationStorage = await delegationInstance.storage();
                var delegateRecord = await delegationStorage.delegateLedger.get(alice.pkh)
                console.log("POST-CLAIM ALICE: ", delegateRecord)

                await signerFactory(eve.sk);
                claimOperation = await delegationInstance.methods.claimRewards().send();
                await claimOperation.confirmation()
                delegationStorage = await delegationInstance.storage();
                var delegateRecord = await delegationStorage.delegateLedger.get(eve.pkh)
                console.log("POST-CLAIM EVE: ", delegateRecord)
            } catch(e){
                console.log(e);
            }
        });
    });
});