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

    }); // end test: Treasury Housekeeping tests

    describe('test: Treasury deposit tests', function() {

        it('test: any user (alice) can deposit tez into treasury', async () => {
            try{        
                
                // Alice transfers 20 XTZ to Treasury
                const depositAmount = 20;
                const depositAmountMutez = 20000000;
                
                await signerFactory(alice.sk)
                const aliceTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryAddress.address, amount: depositAmount});
                await aliceTransferTezToTreasuryOperation.confirmation();

                const treasuryTezBalance         = await utils.tezos.tz.getBalance(treasuryAddress.address);
                assert.equal(treasuryTezBalance, depositAmountMutez);

            } catch(e){
                console.log(e);
            } 
        });

        it('test: any user (alice) can deposit mock FA12 Tokens into treasury', async () => {
            try{        
                
                // Alice transfers 20 Mock FA12 Tokens to Treasury
                const depositAmount = 20000000;
        
                await signerFactory(alice.sk)
                const aliceTransferMockFa12ToTreasuryOperation = await mockFa12TokenInstance.methods.transfer(
                    alice.pkh, 
                    treasuryAddress.address, 
                    depositAmount
                    ).send();
                await aliceTransferMockFa12ToTreasuryOperation.confirmation();

                const updatedMockFa12TokenStorage       = await mockFa12TokenInstance.storage();
                const treasuryMockFa12TokenBalance      = await updatedMockFa12TokenStorage.ledger.get(treasuryAddress.address);

                assert.equal(treasuryMockFa12TokenBalance.balance, depositAmount);

            } catch(e){
                console.log(e);
            } 
        });

        it('test: any user (alice) can deposit mock FA2 Tokens into treasury', async () => {
            try{        
                
                // Alice transfers 20 Mock FA2 Tokens to Treasury
                const depositAmount = 20000000;
        
                await signerFactory(alice.sk)
                const aliceTransferMockFa2ToTreasuryOperation = await mockFa2TokenInstance.methods.transfer([
                        {
                            from_: alice.pkh,
                            txs: [
                                {
                                    to_: treasuryAddress.address,
                                    token_id: 0,
                                    amount: depositAmount
                                }
                            ]
                        }
                    ]).send();
                await aliceTransferMockFa2ToTreasuryOperation.confirmation();

                const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
                const treasuryMockFa2TokenBalance      = await updatedMockFa2TokenStorage.ledger.get(treasuryAddress.address);

                assert.equal(treasuryMockFa2TokenBalance, depositAmount);

            } catch(e){
                console.log(e);
            } 
        });

    }); // end test: Treasury deposit tests



    describe('test: Treasury transfer and mintMvkAndTransfer tests', function() {

        it('test: user (alice) cannot transfer tez from treasury', async () => {
            try{        
                
                const from_  = treasuryAddress.address;
                const to_    = alice.pkh;
                const amount = 10000000;
                const token  = "tez"

                await signerFactory(alice.sk);
                const failTransferTezOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     token
                );
                await chai.expect(failTransferTezOperation.send()).to.be.eventually.rejected;
                
            } catch(e){
                console.log(e);
            } 
        });

        it('test: user (alice) cannot transfer mock FA12 Tokens from treasury', async () => {
            try{        
                
                const from_      = treasuryAddress.address;
                const to_        = alice.pkh;
                const amount     = 10000000;
                const tokenType  = "fa12";
                const token      = mockFa12TokenAddress.address;

                await signerFactory(alice.sk);
                const failTransferMockFa12TokenOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     tokenType,
                     token
                );
                await chai.expect(failTransferMockFa12TokenOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.log(e);
            } 
        });

        it('test: user (alice) cannot transfer mock FA2 Tokens from treasury', async () => {
            try{        
                
                const from_      = treasuryAddress.address;
                const to_        = alice.pkh;
                const amount     = 10000000;
                const tokenType  = "fa2";
                const token      = mockFa12TokenAddress.address;
                const tokenId    = 0;

                await signerFactory(alice.sk);
                const failTransferMockFa2TokenOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     tokenType,
                     token,
                     tokenId
                );
                await chai.expect(failTransferMockFa2TokenOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.log(e);
            } 
        });

        it('test: user (alice) cannot access treasury mintMvkAndTransfer entrypoint', async () => {
            try{        
                
                const to_        = alice.pkh;
                const amount     = 10000000;

                await signerFactory(alice.sk);
                const failMintMvkAndTransferOperation = await treasuryInstance.methods.mintMvkAndTransfer(
                     to_,
                     amount,
                );
                await chai.expect(failMintMvkAndTransferOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.log(e);
            } 
        });

        it('test: admin (bob) cannot transfer tez from treasury', async () => {
            try{        
                
                const from_  = treasuryAddress.address;
                const to_    = bob.pkh;
                const amount = 10000000;
                const token  = "tez"

                await signerFactory(bob.sk);
                const failTransferTezOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     token
                );
                await chai.expect(failTransferTezOperation.send()).to.be.eventually.rejected;
                
            } catch(e){
                console.log(e);
            } 
        });

        it('test: admin (bob) cannot transfer mock FA12 Tokens from treasury', async () => {
            try{        
                
                const from_      = treasuryAddress.address;
                const to_        = bob.pkh;
                const amount     = 10000000;
                const tokenType  = "fa12";
                const token      = mockFa12TokenAddress.address;

                await signerFactory(bob.sk);
                const failTransferMockFa12TokenOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     tokenType,
                     token
                );
                await chai.expect(failTransferMockFa12TokenOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.log(e);
            } 
        });

        it('test: admin (bob) cannot transfer mock FA2 Tokens from treasury', async () => {
            try{        
                
                const from_      = treasuryAddress.address;
                const to_        = bob.pkh;
                const amount     = 10000000;
                const tokenType  = "fa2";
                const token      = mockFa12TokenAddress.address;
                const tokenId    = 0;

                await signerFactory(bob.sk);
                const failTransferMockFa2TokenOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     tokenType,
                     token,
                     tokenId
                );
                await chai.expect(failTransferMockFa2TokenOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.log(e);
            } 
        });

        it('test: admin (bob) cannot access treasury mintMvkAndTransfer entrypoint', async () => {
            try{        
                
                const to_        = bob.pkh;
                const amount     = 10000000;

                await signerFactory(bob.sk);
                const failMintMvkAndTransferOperation = await treasuryInstance.methods.mintMvkAndTransfer(
                     to_,
                     amount,
                );
                await chai.expect(failMintMvkAndTransferOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.log(e);
            } 
        });


        it('test: admin (bob) can update whitelist contract address map', async () => {
            try{        

                await signerFactory(bob.sk);
                const adminUpdateWhitelistContractsOperation = await treasuryInstance.methods.updateWhitelistContracts(
                     "admin",
                     bob.pkh
                ).send();
                await adminUpdateWhitelistContractsOperation.confirmation();

                const treasuryStorage            = await treasuryInstance.storage();
                const treasuryWhitelistContracts = await treasuryStorage.whitelistContracts.get("admin");
                assert.equal(treasuryWhitelistContracts, bob.pkh);

            } catch(e){
                console.log(e);
            } 
        });

        it('test: whitelisted addresses (bob) can transfer tez from treasury', async () => {
            try{        
                
                const from_  = treasuryAddress.address;
                const to_    = bob.pkh;
                const amount = 10000000;
                const token  = "tez"

                await signerFactory(bob.sk);
                const adminTransferTezOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     token
                ).send();
                await adminTransferTezOperation.confirmation();

                const finalTezBalance    = 10000000;
                const treasuryTezBalance = await utils.tezos.tz.getBalance(treasuryAddress.address);
                assert.equal(treasuryTezBalance, finalTezBalance);

            } catch(e){
                console.log(e);
            } 
        });

        it('test: whitelisted addresses (bob) can transfer mock FA12 Tokens from treasury', async () => {
            try{        
                
                const from_      = treasuryAddress.address;
                const to_        = bob.pkh;
                const amount     = 10000000;
                const tokenType  = "fa12";
                const token      = mockFa12TokenAddress.address;

                await signerFactory(bob.sk);
                const adminTransferMockFa12TokenOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     tokenType,
                     token
                ).send();
                await adminTransferMockFa12TokenOperation.confirmation();

                const finalMockFa12TokenBalance      = 10000000;
                const updatedMockFa12TokenStorage    = await mockFa12TokenInstance.storage();
                const treasuryMockFa12TokenBalance   = await updatedMockFa12TokenStorage.ledger.get(treasuryAddress.address);

                assert.equal(treasuryMockFa12TokenBalance.balance, finalMockFa12TokenBalance);

            } catch(e){
                console.log(e);
            } 
        });

        it('test: whitelisted addresses (bob) can transfer mock FA2 Tokens from treasury', async () => {
            try{        

                const from_      = treasuryAddress.address;
                const to_        = bob.pkh;
                const amount     = 10000000;
                const tokenType  = "fa2";
                const token      = mockFa2TokenAddress.address;
                const tokenId    = 0;

                await signerFactory(bob.sk);
                const adminTransferMockFa2TokenOperation = await treasuryInstance.methods.transfer(
                     from_,
                     to_,
                     amount,
                     tokenType,
                     token,
                     tokenId
                ).send();
                await adminTransferMockFa2TokenOperation.confirmation();

                const finalMockFa2TokenBalance      = 10000000;
                const updatedMockFa2TokenStorage    = await mockFa2TokenInstance.storage();
                const treasuryMockFa2TokenBalance   = await updatedMockFa2TokenStorage.ledger.get(treasuryAddress.address);

                assert.equal(treasuryMockFa2TokenBalance, finalMockFa2TokenBalance);

            } catch(e){
                console.log(e);
            } 
        });

        it('test: whitelisted addresses (bob) can access treasury mintMvkAndTransfer entrypoint', async () => {
            try{        
                
                const to_        = bob.pkh;
                const amount     = 10000000;

                const mvkTokenStorage           = await mvkTokenInstance.storage();
                const initialBobMvkTokenBalance = await mvkTokenStorage.ledger.get(bob.pkh);


                await signerFactory(bob.sk);
                const mintMvkAndTransferOperation = await treasuryInstance.methods.mintMvkAndTransfer(
                     to_,
                     amount,
                );
                await mintMvkAndTransferOperation.confirmation();

                const updatedMvkTokenStorage     = await mvkTokenInstance.storage();
                const updatedBobMvkTokenBalance  = await updatedMvkTokenStorage.ledger.get(bob.pkh);

                assert.equal(updatedBobMvkTokenBalance, initialBobMvkTokenBalance + amount);
                

            } catch(e){
                console.log(e);
            } 
        });

    }); // end test: Treasury transfer tests


});

