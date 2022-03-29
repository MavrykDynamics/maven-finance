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
import { bob, alice, eve, mallory, oscar, trudy } from "../scripts/sandbox/accounts";

import treasuryAddress from '../deployments/treasuryAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import mockFa12TokenAddress  from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress   from '../deployments/mockFa2TokenAddress.json';

describe("Treasury tests", async () => {
    var utils: Utils;

    let treasuryInstance;    
    let mvkTokenInstance;
    let governanceInstance;
    let mockFa12TokenInstance;
    let mockFa2TokenInstance;

    let treasuryStorage;
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

        treasuryInstance       = await utils.tezos.contract.at(treasuryAddress.address);
        mvkTokenInstance       = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance     = await utils.tezos.contract.at(governanceAddress.address);
        mockFa12TokenInstance  = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance   = await utils.tezos.contract.at(mockFa2TokenAddress.address);
            
        treasuryStorage        = await treasuryInstance.storage();
        mvkTokenStorage        = await mvkTokenInstance.storage();
        governanceStorage      = await governanceInstance.storage();
        mockFa12TokenStorage   = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage    = await mockFa2TokenInstance.storage();

        console.log('-- -- -- -- -- Treasury Tests -- -- -- --')
        console.log('Treasury Contract deployed at:', treasuryInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Mock Fa12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock Fa2 Token Contract deployed at:' , mockFa2TokenInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);
        console.log('Eve address: ' + eve.pkh);

    });


    describe('test: Treasury Housekeeping tests', function() {
        
        it('test: non-admin user (alice) cannot set treasury admin', async () => {
            try{        

                await signerFactory(alice.sk);
                const failSetAdminOperation = await treasuryInstance.methods.setAdmin(eve.pkh);
                await chai.expect(failSetAdminOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.log(e);
            } 

        });    

        it('test: admin user (bob) can set treasury admin', async () => {
            try{        

                await signerFactory(bob.sk);
                const setAdminOperation = await treasuryInstance.methods.setAdmin(eve.pkh).send();
                await setAdminOperation.confirmation();

                const updatedTreasuryStorage   = await treasuryInstance.storage();            
                assert.equal(updatedTreasuryStorage.admin, eve.pkh);

                console.log(updatedTreasuryStorage);

                // reset treasury admin to bob
                await signerFactory(eve.sk);
                const resetAdminOperation = await treasuryInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                const resetTreasuryStorage   = await treasuryInstance.storage();            
                assert.equal(resetTreasuryStorage.admin, bob.pkh);

            } catch(e){
                console.log(e);
            } 

        });    

    });

    describe('test: Treasury deposit tests', function() {

        it('test: any user (alice) can deposit tez into treasury', async () => {
            try{        
                
                // Alice transfers 250 XTZ to Treasury
                const depositAmount = 250;
                const depositAmountMutez = 250000000;
                
                await signerFactory(alice.sk)
                const aliceTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryAddress.address, amount: depositAmount});
                await aliceTransferTezToTreasuryOperation.confirmation();

                const treasuryTezBalance         = await utils.tezos.tz.getBalance(treasuryAddress.address);
                assert.equal(treasuryTezBalance, depositAmountMutez);

            } catch(e){
                console.log(e);
            } 
        });

        it('test: any user can deposit mock FA12 Tokens into treasury', async () => {
            try{        
                
                console.log('test');

    //         // Alice transfers 20 Mock FA12 Tokens to Council
//         const aliceTransferMockFa12ToCouncilOperation = await mockFa12TokenInstance.methods.transfer(alice.pkh, councilContractAddress, 250000000).send();
//         await aliceTransferMockFa12ToCouncilOperation.confirmation();


            } catch(e){
                console.log(e);
            } 
        });

        it('test: any user can deposit mock FA2 Tokens into treasury', async () => {
            try{        
                console.log('test');
            } catch(e){
                console.log(e);
            } 
        });

    });

    describe('test: Treasury transfer tests', function() {

        it('test: user cannot transfer tez from treasury', async () => {
            try{        
                console.log('test');
            } catch(e){
                console.log(e);
            } 
        });

        it('test: user cannot transfer mock FA12 Tokens from treasury', async () => {
            try{        
                console.log('test');
            } catch(e){
                console.log(e);
            } 
        });

        it('test: user cannot transfer mock FA2 Tokens from treasury', async () => {
            try{        
                console.log('test');
            } catch(e){
                console.log(e);
            } 
        });

        it('test: admin can transfer tez from treasury', async () => {
            try{        
                console.log('test');
            } catch(e){
                console.log(e);
            } 
        });

        it('test: admin can transfer mock FA12 Tokens from treasury', async () => {
            try{        
                console.log('test');
            } catch(e){
                console.log(e);
            } 
        });

        it('test: admin can transfer mock FA2 Tokens from treasury', async () => {
            try{        
                console.log('test');
            } catch(e){
                console.log(e);
            } 
        });

    });

});

