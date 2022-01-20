const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const assert = require("chai").assert;
const { createHash } = require("crypto")
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve } from "../scripts/sandbox/accounts";

import farmAddress from '../deployments/farmAddress.json';
import lpAddress from '../deployments/lpTokenAddress.json';
import mvkAddress from '../deployments/mvkTokenAddress.json';

describe("Farm", async () => {
    var utils: Utils;

    let farmInstance;
    let farmStorage;

    let mvkTokenInstance;
    let mvkTokenStorage;

    let lpTokenInstance;
    let lpTokenStorage;

    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        utils = new Utils();
        await utils.init(alice.sk);
        
        farmInstance   = await utils.tezos.contract.at(farmAddress.address);
        farmStorage    = await farmInstance.storage();
        mvkTokenInstance = await utils.tezos.contract.at(mvkAddress.address);
        mvkTokenStorage    = await mvkTokenInstance.storage();
        lpTokenInstance = await utils.tezos.contract.at(lpAddress.address);
        lpTokenStorage    = await lpTokenInstance.storage();

        // Bob (reserve contract) gives operator permission to the farm contract
        await signerFactory(eve.sk);
        const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner: eve.pkh,
                    operator: farmAddress.address,
                    token_id: 0
                }
            }
        ]).send()
        await updateOperatorsOperation.confirmation();
    });

    beforeEach("storage", async () => {
        farmStorage = await farmInstance.storage();
        mvkTokenStorage = await mvkTokenInstance.storage();
        lpTokenStorage = await lpTokenInstance.storage();

        await signerFactory(alice.sk)
    })

    describe('%initFarm', function() {
        it('Initialize a farm with 100 rewards per block and a total duration of 12 000 blocks', async () => {
            try{
                const operation = await farmInstance.methods.initFarm(100,12000).send();
                await operation.confirmation()
            }catch(e){
                console.log(e)
            }
        })
    });

    describe('%deposit', function() {
        // it('Alice deposits 2LP Tokens', async () => {
        //     try{
        //         // Amount of LP to deposit
        //         const amountToDeposit = 2;

        //         var aliceLPLedger = await lpTokenStorage.ledger.get(alice.pkh);
        //         var aliceLPBalance = aliceLPLedger!==undefined ? aliceLPLedger.balance : 0;
        //         var farmLPLedger = await lpTokenStorage.ledger.get(farmAddress.address);
        //         var farmLPBalance = farmLPLedger!==undefined ? farmLPLedger.balance : 0;
        //         var aliveMVKBalance = await mvkTokenStorage.ledger.get(alice.pkh);
        //         var reserveMVKBalance = await mvkTokenStorage.ledger.get(eve.pkh);

        //         console.log("Initial Storage")
        //         console.log("Alice LP Balance: ", parseInt(aliceLPBalance))
        //         console.log("Farm LP Balance: ", parseInt(farmLPBalance))
        //         console.log("Alice MVK Balance: ", parseInt(aliveMVKBalance))
        //         console.log("Reserve MVK Balance: ", parseInt(reserveMVKBalance))
                
        //         // Create a batch transaction for depositing with an allowance at the start of it
        //         const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,amountToDeposit).send();
        //         await approveOperation.confirmation(); 
        //         const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
        //         await depositOperation.confirmation();

        //         console.log("New farm Storage")
            
        //         farmStorage = await farmInstance.storage();
        //         lpTokenStorage = await lpTokenInstance.storage();
        //         mvkTokenStorage    = await mvkTokenInstance.storage();
            
        //         aliceLPLedger = await lpTokenStorage.ledger.get(alice.pkh);
        //         aliceLPBalance = aliceLPLedger!==undefined ? aliceLPLedger.balance : 0;
        //         farmLPLedger = await lpTokenStorage.ledger.get(farmAddress.address);
        //         farmLPBalance = farmLPLedger!==undefined ? farmLPLedger.balance : 0;
        //         aliveMVKBalance = await mvkTokenStorage.ledger.get(alice.pkh);
        //         reserveMVKBalance = await mvkTokenStorage.ledger.get(eve.pkh);

        //         const blockLevel = await farmStorage.lastBlockUpdate;
            
        //         console.log("Alice LP Balance: ", parseInt(aliceLPBalance))
        //         console.log("Farm LP Balance: ", parseInt(farmLPBalance))
        //         console.log("Alice MVK Balance: ", parseInt(aliveMVKBalance))
        //         console.log("Reserve MVK Balance: ", parseInt(reserveMVKBalance))
        //         console.log("Block Level ", parseInt(blockLevel))
        //     } catch(e){
        //         console.log(e);
        //     } 
        // });

        // it('Bob deposits 4LP Tokens', async () => {
        //     try{
        //         await signerFactory(bob.sk)

        //         // Amount of LP to deposit
        //         const amountToDeposit = 4;

        //         var bobLPLedger = await lpTokenStorage.ledger.get(bob.pkh);
        //         var bobLPBalance = bobLPLedger!==undefined ? bobLPLedger.balance : 0;
        //         var farmLPLedger = await lpTokenStorage.ledger.get(farmAddress.address);
        //         var farmLPBalance = farmLPLedger!==undefined ? farmLPLedger.balance : 0;
        //         var bobMVKBalance = await mvkTokenStorage.ledger.get(bob.pkh);
        //         var reserveMVKBalance = await mvkTokenStorage.ledger.get(eve.pkh);

        //         console.log("Initial Storage")
        //         console.log("Bob LP Balance: ", parseInt(bobLPBalance))
        //         console.log("Farm LP Balance: ", parseInt(farmLPBalance))
        //         console.log("Bob MVK Balance: ", parseInt(bobMVKBalance))
        //         console.log("Reserve MVK Balance: ", parseInt(reserveMVKBalance))

        //         // Create a batch transaction for depositing with an allowance at the start of it
        //         const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,amountToDeposit).send();
        //         await approveOperation.confirmation(); 
        //         const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
        //         await depositOperation.confirmation();

        //         console.log("New farm Storage")
            
        //         farmStorage = await farmInstance.storage();
        //         lpTokenStorage = await lpTokenInstance.storage();
        //         mvkTokenStorage    = await mvkTokenInstance.storage();
            
        //         bobLPLedger = await lpTokenStorage.ledger.get(bob.pkh);
        //         bobLPBalance = bobLPLedger!==undefined ? bobLPLedger.balance : 0;
        //         farmLPLedger = await lpTokenStorage.ledger.get(farmAddress.address);
        //         farmLPBalance = farmLPLedger!==undefined ? farmLPLedger.balance : 0;
        //         bobMVKBalance = await mvkTokenStorage.ledger.get(bob.pkh);
        //         reserveMVKBalance = await mvkTokenStorage.ledger.get(eve.pkh);

        //         const blockLevel = await farmStorage.lastBlockUpdate;
            
        //         console.log("Bob LP Balance: ", parseInt(bobLPBalance))
        //         console.log("Farm LP Balance: ", parseInt(farmLPBalance))
        //         console.log("Bob MVK Balance: ", parseInt(bobMVKBalance))
        //         console.log("Reserve MVK Balance: ", parseInt(reserveMVKBalance))
        //         console.log("Block Level ", parseInt(blockLevel))
        //     } catch(e){
        //         console.log(e);
        //     } 
        // });
    })

    // describe('%withdraw', function() {
    //     it('Alice withdraws 2LP Tokens', async () => {
    //         try{

    //             var aliceLPLedger = await lpTokenStorage.ledger.get(alice.pkh);
    //             var aliceLPBalance = aliceLPLedger!==undefined ? aliceLPLedger.balance : 0;
    //             var farmLPLedger = await lpTokenStorage.ledger.get(farmAddress.address);
    //             var farmLPBalance = farmLPLedger!==undefined ? farmLPLedger.balance : 0;
    //             var aliveMVKBalance = await mvkTokenStorage.ledger.get(alice.pkh);

    //             console.log("Initial Storage")
    //             console.log("Alice LP Balance: ", parseInt(aliceLPBalance))
    //             console.log("Farm LP Balance: ", parseInt(farmLPBalance))
    //             console.log("Alice MVK Balance: ", parseInt(aliveMVKBalance))
    //             const withdrawOperation = await farmInstance.methods.withdraw(2).send();
    //             await withdrawOperation.confirmation();

    //             console.log("New farm Storage")
    //             farmStorage = await farmInstance.storage();
    //             lpTokenStorage = await lpTokenInstance.storage();
    //             mvkTokenStorage    = await mvkTokenInstance.storage();
    //             aliceLPLedger = await lpTokenStorage.ledger.get(alice.pkh);
    //             aliceLPBalance = aliceLPLedger!==undefined ? aliceLPLedger.balance : 0;
    //             farmLPLedger = await lpTokenStorage.ledger.get(farmAddress.address);
    //             farmLPBalance = farmLPLedger!==undefined ? farmLPLedger.balance : 0;
    //             aliveMVKBalance = await mvkTokenStorage.ledger.get(alice.pkh);
    //             console.log("Alice LP Balance: ", parseInt(aliceLPBalance))
    //             console.log("Farm LP Balance: ", parseInt(farmLPBalance))
    //             console.log("Alice MVK Balance: ", parseInt(aliveMVKBalance))
    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });
    // });

    describe('%claim', function() {
        it('Alice claims her rewards', async () => {
            try{
                var aliveMVKBalance = await mvkTokenStorage.ledger.get(alice.pkh);
                var reserveMVKBalance = await mvkTokenStorage.ledger.get(eve.pkh);
                console.log("Initial Storage")
                console.log("Alice MVK Balance: ", parseInt(aliveMVKBalance))
                console.log("Reserve MVK Balance: ", parseInt(reserveMVKBalance))

                const claimOperation = await farmInstance.methods.claim().send();
                await claimOperation.confirmation();

                console.log("New Storage")
                mvkTokenStorage = await mvkTokenInstance.storage();
                farmStorage = await farmInstance.storage();
                var aliveNewMVKBalance = await mvkTokenStorage.ledger.get(alice.pkh);
                reserveMVKBalance = await mvkTokenStorage.ledger.get(eve.pkh);
                const claimedReward = aliveNewMVKBalance - aliveMVKBalance
                const blockLevel = await farmStorage.lastBlockUpdate;
                
                console.log("Alice MVK Balance: ", parseInt(aliveNewMVKBalance))
                console.log("Alice claimed rewards: ", claimedReward)
                console.log("Reserve MVK Balance: ", parseInt(reserveMVKBalance))
                console.log("Block Level ", parseInt(blockLevel))
            } catch(e){
                console.log(e);
            } 
        });

        it('Bob claims his rewards', async () => {
            try{
                await signerFactory(bob.sk);

                var bobMVKBalance = await mvkTokenStorage.ledger.get(bob.pkh);
                var reserveMVKBalance = await mvkTokenStorage.ledger.get(eve.pkh);
                console.log("Initial Storage")
                console.log("Bob MVK Balance: ", parseInt(bobMVKBalance))
                console.log("Reserve MVK Balance: ", parseInt(reserveMVKBalance))

                const claimOperation = await farmInstance.methods.claim().send();
                await claimOperation.confirmation();

                console.log("New Storage")
                mvkTokenStorage = await mvkTokenInstance.storage();
                farmStorage = await farmInstance.storage();
                var bobNewMVKBalance = await mvkTokenStorage.ledger.get(bob.pkh);
                reserveMVKBalance = await mvkTokenStorage.ledger.get(eve.pkh);
                const claimedReward = bobNewMVKBalance - bobMVKBalance
                const blockLevel = await farmStorage.lastBlockUpdate;
                
                console.log("Bob MVK Balance: ", parseInt(bobNewMVKBalance))
                console.log("Bob claimed rewards: ", claimedReward)
                console.log("Reserve MVK Balance: ", parseInt(reserveMVKBalance))
                console.log("Block Level ", parseInt(blockLevel))
            } catch(e){
                console.log(e);
            } 
        });
    });
});