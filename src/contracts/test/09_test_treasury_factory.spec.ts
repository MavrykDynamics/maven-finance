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
import { bob, alice, eve, mallory, oscar, trudy, isaac, david } from "../scripts/sandbox/accounts";

import treasuryAddress from '../deployments/treasuryAddress.json';
import treasuryFactoryAddress from '../deployments/treasuryFactoryAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import mockFa12TokenAddress  from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress   from '../deployments/mockFa2TokenAddress.json';
import delegationAddress   from '../deployments/delegationAddress.json';

describe("Treasury Factory tests", async () => {
    var utils: Utils;

    let treasuryInstance;
    let treasuryFactoryInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let mockFa12TokenInstance;
    let mockFa2TokenInstance;

    let treasuryStorage;
    let treasuryFactoryStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let mockFa12TokenStorage;
    let mockFa2TokenStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        console.log(treasuryAddress);
        console.log(treasuryAddress.address);

        treasuryInstance        = await utils.tezos.contract.at(treasuryAddress.address);
        treasuryFactoryInstance = await utils.tezos.contract.at(treasuryFactoryAddress.address);
        mvkTokenInstance        = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance      = await utils.tezos.contract.at(governanceAddress.address);
        mockFa12TokenInstance   = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance    = await utils.tezos.contract.at(mockFa2TokenAddress.address);

        treasuryStorage         = await treasuryInstance.storage();
        treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
        mvkTokenStorage         = await mvkTokenInstance.storage();
        governanceStorage       = await governanceInstance.storage();
        mockFa12TokenStorage    = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage     = await mockFa2TokenInstance.storage();

        console.log('-- -- -- -- -- Treasury Tests -- -- -- --')
        console.log('Treasury Contract deployed at:', treasuryInstance.address);
        console.log('Treasury Factory Contract deployed at:', treasuryFactoryInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Mock Fa12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock Fa2 Token Contract deployed at:' , mockFa2TokenInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);
        console.log('Eve address: ' + eve.pkh);
        
    });
});
