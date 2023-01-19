const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
import { BigNumber } from 'bignumber.js'
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';

import * as sharedTestHelper from "./helpers/sharedTestHelpers"

describe("Execute Lambda tests", async () => {

    var utils : Utils;
    let rpc;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    const almostEqual = (actual, expected, delta) => {
        let greaterLimit  = expected + expected * delta
        let lowerLimit    = expected - expected * delta
        return actual <= greaterLimit && actual >= lowerLimit
    }

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        rpc = utils.tezos.rpc;
        
        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();

        console.log('-- -- -- -- -- Execute Lambda Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);

    });

    beforeEach('storage', async () => {
        await signerFactory(bob.sk)
    })

    describe("%setAdmin", async () => {
        it("admin should be able to call %setAdmin through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();
                const initialAdmin = doormanStorage.admin;

                // console.log(doormanInstance.methods);
                // const contractParameterSchema = doormanInstance.parameterSchema.ExtractSchema();
                // console.log(JSON.stringify(contractParameterSchema,null,2));

                // const lambdaParams = doormanInstance.methods.dataPackingHelper(
                //     "govSetAdmin", eve.pkh
                // ).toTransferParams();
                // const packedDataValue = lambdaParams.parameter.value;
                // const packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                const lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaSetAdmin", eve.pkh
                ).toTransferParams();
                const packedDataValue = lambdaParams.parameter.value;
                const packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                const setAdminOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await setAdminOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const finalAdmin = doormanStorage.admin;

                console.log(initialAdmin);
                console.log(finalAdmin);


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


    })

    

});
