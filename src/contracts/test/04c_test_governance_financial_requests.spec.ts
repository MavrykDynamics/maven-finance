const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import treasuryAddress from '../deployments/treasuryAddress.json';
import mockFa12TokenAddress from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress from '../deployments/mockFa2TokenAddress.json';

import { config } from "yargs";

describe("Governance tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let councilInstance;
    let treasuryInstance;
    let mockFa12TokenInstance;
    let mockFa2TokenInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let councilStorage;
    let treasuryStorage;
    let mockFa12TokenStorage;
    let mockFa2TokenStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    const proposalId = 1;

    before("setup", async () => {

        utils = new Utils();
        await utils.init(alice.sk);
        
        doormanInstance        = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance     = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance       = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance     = await utils.tezos.contract.at(governanceAddress.address);
        councilInstance        = await utils.tezos.contract.at(councilAddress.address);
        treasuryInstance       = await utils.tezos.contract.at(treasuryAddress.address);
        mockFa12TokenInstance  = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance   = await utils.tezos.contract.at(mockFa2TokenAddress.address);
            
        doormanStorage         = await doormanInstance.storage();
        delegationStorage      = await delegationInstance.storage();
        mvkTokenStorage        = await mvkTokenInstance.storage();
        governanceStorage      = await governanceInstance.storage();
        councilStorage         = await councilInstance.storage();
        treasuryStorage        = await treasuryInstance.storage();
        mockFa12TokenStorage   = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage    = await mockFa2TokenInstance.storage();

        console.log('-- -- -- -- -- Governance Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Council Contract deployed at:', councilInstance.address);
        console.log('Treasury Contract deployed at:', treasuryInstance.address);
        console.log('Mock Fa12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock Fa2 Token Contract deployed at:' , mockFa2TokenInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: '   + bob.pkh);
        console.log('Eve address: '   + eve.pkh);

    });

    it('council sends request to mint MVK', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Council sends request to mint MVK") 
            console.log("---") // break

            // request mint params
            const tokenAmount = 1000000000; // 1000 MVK
            const treasury    = treasuryAddress.address;
            const tokenType   = "FA2";
            const tokenId     = 0;
            const purpose     = "Test Council Request Mint 1000 MVK";

            // Council member (alice) requests for MVK to be minted
            const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(treasury, tokenAmount, tokenType, tokenId, purpose).send();
            await councilRequestsMintOperation.confirmation();

            // get new storage and assert tests
            console.log("--- --- ---")
            const newCouncilStorage = await councilInstance.storage();
            const councilActionsLedger = await newCouncilStorage.councilActionsLedger.get(0);
            console.log(newCouncilStorage);
            console.log(councilActionsLedger);

            const governanceParameterSchema = governanceInstance.parameterSchema.ExtractSchema();
            console.log(JSON.stringify(governanceParameterSchema,null,2));

            const councilParameterSchema = councilInstance.parameterSchema.ExtractSchema();
            console.log(JSON.stringify(councilParameterSchema,null,2));
            
        } catch(e){
            console.log(e);
        } 
    });

    


});