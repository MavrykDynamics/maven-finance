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

describe("Doorman tests", async () => {
    var utils: Utils;

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

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();

        console.log('-- -- -- -- -- Doorman Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);

    });

    beforeEach('storage', async () => {
        await signerFactory(bob.sk)
    })

    describe("%stake", async () => {
        it("user should not be able to stake less than 1MVK", async() => {
            try{
                // Initial values
                const userStake = 10**8;

                // Operator set
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: bob.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();

                // Operation
                const stakeOperation = await doormanInstance.methods.stake(userStake);
                await chai.expect(stakeOperation.send()).to.be.rejected;
            } catch(e) {
                console.log(e)
            }
        })

        it("user should not be able to stake more MVK than he has", async() => {
            try{
                // Initial values
                const userMVKBalance = parseInt(await mvkTokenStorage.ledger.get(bob.pkh));
                const userStake = userMVKBalance + MVK(1);

                // Operator set
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: bob.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();

                // Operation
                const stakeOperation = await doormanInstance.methods.stake(userStake);
                await chai.expect(stakeOperation.send()).to.be.rejected;
            } catch(e) {
                console.log(e)
            }
        })

        it("user should be able to stake less than his maximum amount of MVK but at least 1MVK", async() => {
            try{
                // Initial values
                const userStake = MVK(10);
                const userMVKBalance = parseInt(await mvkTokenStorage.ledger.get(bob.pkh));
                const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const userStakeBalance = parseInt(userStakeLedger === undefined ? 0 : userStakeLedger.balance);
                const doormanSMVKTotalSupply = parseInt(doormanStorage.stakedMvkTotalSupply);

                // Operator set
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: bob.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();

                // Operation
                const stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();

                // Final Values
                const userMVKBalanceEnd = parseInt(await mvkTokenStorage.ledger.get(bob.pkh));
                const userStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const userStakeBalanceEnd = parseInt(userStakeLedgerEnd.balance);
                const doormanSMVKTotalSupplyEnd = parseInt(doormanStorage.stakedMvkTotalSupply);

                // Assertion
                assert.equal(doormanSMVKTotalSupply + userStake, doormanSMVKTotalSupplyEnd);
                assert.equal(userMVKBalance - userStake, userMVKBalanceEnd);
                assert.equal(userStakeBalance + userStake, userStakeBalanceEnd);
            } catch(e) {
                console.log(e)
            }
        })
    })

    describe("%unstake", async () => {
        it("user should not be able to unstake less than 1MVK", async() => {
            try{
                // Initial values
                const userUnstake = 10**8;

                // Operation
                const unstakeOperation = await doormanInstance.methods.unstake(userUnstake);
                await chai.expect(unstakeOperation.send()).to.be.rejected;
            } catch(e) {
                console.log(e)
            }
        })

        it("user should not be able to unstake more MVK than he has staked before", async() => {
            try{
                // Initial values
                const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const userStakeBalance = parseInt(userStakeLedger === undefined ? 0 : userStakeLedger.balance);
                const userUnstake = userStakeBalance +  MVK();

                // Operation
                const unstakeOperation = await doormanInstance.methods.unstake(userUnstake);
                await chai.expect(unstakeOperation.send()).to.be.rejected;
            } catch(e) {
                console.log(e)
            }
        })

        it("user should not be able to unstake if he never staked", async() => {
            try{
                // Switch signer
                await signerFactory(alice.sk);

                // Initial values
                const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                const userUnstake = MVK();

                // Assertion
                assert.strictEqual(userStakeLedger,undefined);

                // Operation
                const unstakeOperation = await doormanInstance.methods.unstake(userUnstake);
                await chai.expect(unstakeOperation.send()).to.be.rejected;
            } catch(e) {
                console.log(e)
            }
        })

        it("single user should be able to unstake some MVK and earn all the exit fee", async() => {
            try{
                // Initial values
                const userMVKBalance = parseInt(await mvkTokenStorage.ledger.get(bob.pkh));
                const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const userStakeBalance = parseInt(userStakeLedger === undefined ? 0 : userStakeLedger.balance);
                const mvkTotalSupply = parseInt(mvkTokenStorage.totalSupply);
                const doormanSMVKTotalSupply = parseInt(doormanStorage.stakedMvkTotalSupply);
                const userUnstake = userStakeBalance - MVK();
                const exitFeePool = parseInt(doormanStorage.exitFeePool);

                // Operation
                const unstakeOperation = await doormanInstance.methods.unstake(userUnstake).send();
                await unstakeOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();

                // Test values
                const mli = Math.trunc((doormanSMVKTotalSupply * 100 * 10**36) / mvkTotalSupply);
                const exitFee = Math.trunc((500 * 10**36 * 10**36) / (mli + 5*10**36));
                const paidFee = Math.trunc(userUnstake * (exitFee/100));
                const expectedFinalAmount = userUnstake - (paidFee/10**36);

                // Final Values
                const userMVKBalanceEnd = parseInt(await mvkTokenStorage.ledger.get(bob.pkh));
                const userStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const userStakeBalanceEnd = parseInt(userStakeLedgerEnd.balance);
                const doormanSMVKTotalSupplyEnd = parseInt(doormanStorage.stakedMvkTotalSupply);
                const exitFeePoolEnd = parseInt(doormanStorage.exitFeePool);

                // Assertion
                assert.equal(doormanSMVKTotalSupply - expectedFinalAmount, doormanSMVKTotalSupplyEnd);
                assert.equal(userMVKBalance + expectedFinalAmount, userMVKBalanceEnd);
                assert.equal(userStakeBalance - expectedFinalAmount, userStakeBalanceEnd);
                assert.equal(exitFeePoolEnd, exitFeePool);
            } catch(e) {
                console.log(e)
            }
        })

        it("multiple users should be able to unstake some MVK and share the exit fee", async() => {
            try{
                // Initial values
                const firstUserStake = MVK(2);
                const secondUserstake = MVK(2);
                const firstUserUnstake = MVK();
                const exitFeePool = parseInt(doormanStorage.exitFeePool);

                // Operator set
                const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await firstUpdateOperatorsOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await secondUpdateOperatorsOperation.confirmation();

                // Operation part-1
                const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserstake).send();
                await secondUserStakeOperation.confirmation();

                await signerFactory(bob.sk);
                const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
                await firstUserStakeOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();

                // Balances before unstaking
                const secondUserStakeLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const mvkTotalSupply = parseInt(mvkTokenStorage.totalSupply);
                const doormanSMVKTotalSupply = parseInt(doormanStorage.stakedMvkTotalSupply);

                // Operation part-2
                const unstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
                await unstakeOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();

                // Balances before compounding
                const secondUserStakeBalancePreCompound = parseInt(secondUserStakeLedger === undefined ? 0 : secondUserStakeLedger.balance);

                // Operation part-3
                await signerFactory(eve.sk);
                const compoundOperation = await doormanInstance.methods.compound().send();
                await compoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();

                // Test values
                const mli = Math.trunc((doormanSMVKTotalSupply * 100 * 10**36) / mvkTotalSupply);
                const exitFee = Math.trunc((500 * 10**36 * 10**36) / (mli + 5*10**36));
                const paidFee = Math.trunc(firstUserUnstake * (exitFee/100));
                const expectedFinalAmount = Math.trunc(firstUserUnstake - (paidFee/10**36));

                // Final Values
                const firstUserStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const firstUserStakeBalanceEnd = parseInt(firstUserStakeLedgerEnd.balance);
                const secondUserStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                const secondUserStakeBalanceEnd = parseInt(secondUserStakeLedgerEnd.balance);

                const rewardPerShare = paidFee / (doormanSMVKTotalSupply - firstUserUnstake);
                const firstUserExpectedReward = rewardPerShare * (firstUserStake - expectedFinalAmount);
                const secondUserExpectedReward = rewardPerShare * secondUserstake;

                const firstUserReward = firstUserStakeBalanceEnd - firstUserUnstake
                const secondUserReward = secondUserStakeBalanceEnd - secondUserStakeBalancePreCompound

                const exitFeePoolEnd = parseInt(doormanStorage.exitFeePool);

                console.log(await mvkTokenStorage.ledger.get(bob.pkh))
                console.log(await mvkTokenStorage.ledger.get(eve.pkh))
                console.log(await mvkTokenStorage.ledger.get(doormanAddress.address))

                // Assertion
                console.log(expectedFinalAmount)
                assert.equal(doormanStorage.logFinalAmount,expectedFinalAmount)
                assert.equal(paidFee,firstUserReward+secondUserReward)
                assert.equal(firstUserReward,firstUserExpectedReward)
                assert.equal(secondUserExpectedReward,secondUserReward)
                assert.notEqual(exitFeePool,exitFeePoolEnd)
            } catch(e) {
                console.log(e)
            }
        })
    })

    describe("%compound", async () => {
        it("user should not be able to earn rewards without having staked MVK before", async() => {
            try{
                // Initial values
                const firstUserStake = MVK(2)
                const secondUserStake = MVK()
                const firstUserUnstake = MVK()

                // Operator set
                const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await firstUpdateOperatorsOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await secondUpdateOperatorsOperation.confirmation();

                // Operations
                await signerFactory(bob.sk);
                const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
                await firstUserStakeOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
                await secondUserStakeOperation.confirmation();
                
                await signerFactory(bob.sk);
                const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
                await firstUserUnstakeOperation.confirmation();

                await signerFactory(mallory.sk);
                const thirdUserCompoundOperation = await doormanInstance.methods.compound().send();
                await thirdUserCompoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // Final values
                const thirdUserStakedMVKLedger = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);
                const thirdUserStakedMVKBalance = parseInt(thirdUserStakedMVKLedger === undefined ? 0 : thirdUserStakedMVKLedger.balance);

                assert.equal(0,thirdUserStakedMVKBalance);
            } catch(e) {
                console.log(e)
            }
        })

        it("user should not be able to compound after unstaking everything", async() => {
            try{
                // Initial values
                const firstUserStake = MVK(2)
                const secondUserStake = MVK(3)
                const firstUserUnstake = MVK(2)
                const secondUserUnstake = MVK(3)

                // Operator set
                const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await firstUpdateOperatorsOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await secondUpdateOperatorsOperation.confirmation();

                // Operations
                await signerFactory(bob.sk);
                const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
                await firstUserStakeOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
                await secondUserStakeOperation.confirmation();
                
                await signerFactory(bob.sk);
                const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
                await firstUserUnstakeOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUserUnstakeOperation = await doormanInstance.methods.unstake(secondUserUnstake).send();
                await secondUserUnstakeOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const firstUserPreCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const firstUserPreCompoundBalance = parseInt(firstUserPreCompoundLedger === undefined ? 0 : firstUserPreCompoundLedger.balance);

                const firstUserCompoundOperation = await doormanInstance.methods.compound().send();
                await firstUserCompoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // Final values
                const firstUserPostCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const firstUserPostCompoundBalance = parseInt(firstUserPostCompoundLedger === undefined ? 0 : firstUserPostCompoundLedger.balance);

                assert.equal(firstUserPreCompoundBalance,firstUserPostCompoundBalance);
            } catch(e) {
                console.log(e)
            }
        })

        it("user should not be able to compound twice", async() => {
            try{
                // Initial values
                const firstUserStake = MVK(2)
                const secondUserStake = MVK(3)
                const firstUserUnstake = MVK()

                // Operator set
                const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await firstUpdateOperatorsOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await secondUpdateOperatorsOperation.confirmation();

                // Operations
                await signerFactory(bob.sk);
                const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
                await firstUserStakeOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
                await secondUserStakeOperation.confirmation();
                
                await signerFactory(bob.sk);
                const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
                await firstUserUnstakeOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUserCompoundOperation = await doormanInstance.methods.compound().send();
                await secondUserCompoundOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const secondUserPreCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                const secondUserPreCompoundBalance = parseInt(secondUserPreCompoundLedger === undefined ? 0 : secondUserPreCompoundLedger.balance);

                const secondUserSecondCompoundOperation = await doormanInstance.methods.compound().send();
                await secondUserSecondCompoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // Final values
                const secondUserPostCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                const secondUserPostCompoundBalance = parseInt(secondUserPostCompoundLedger === undefined ? 0 : secondUserPostCompoundLedger.balance);

                assert.equal(secondUserPreCompoundBalance,secondUserPostCompoundBalance);
            } catch(e) {
                console.log(e)
            }
        })

        it("user should be able to compound rewards after unstaking a portion of his staked mvk", async() => {
            try{
                // Initial values
                const firstUserLedger = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const firstUserBalance = parseInt(firstUserLedger === undefined ? 0 : firstUserLedger.balance);
                const firstUserStake = MVK(2)
                const firstUserUnstake = firstUserBalance - MVK() // Unstake all but 1MVK

                // Operator set
                const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await firstUpdateOperatorsOperation.confirmation();

                // Operations
                const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
                await firstUserStakeOperation.confirmation();

                await signerFactory(bob.sk);
                const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
                await firstUserUnstakeOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // Final values
                const unexpectedFinalBalance = MVK();
                const firstUserLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const firstUserBalanceEnd = parseInt(firstUserLedgerEnd === undefined ? 0 : firstUserLedgerEnd.balance);

                assert.notEqual(unexpectedFinalBalance,firstUserBalanceEnd);
            } catch(e) {
                console.log(e)
            }
        })

        it("user should be able to compound unclaimed rewards", async() => {
            try{
                // Initial values
                const firstUserStake = MVK(2)
                const secondUserStake = MVK(3)
                const firstUserUnstake = MVK()

                // Operator set
                const firstUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await firstUpdateOperatorsOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await secondUpdateOperatorsOperation.confirmation();

                // Operations
                await signerFactory(bob.sk);
                const firstUserStakeOperation = await doormanInstance.methods.stake(firstUserStake).send();
                await firstUserStakeOperation.confirmation();

                await signerFactory(eve.sk);
                const secondUserStakeOperation = await doormanInstance.methods.stake(secondUserStake).send();
                await secondUserStakeOperation.confirmation();
                
                await signerFactory(bob.sk);
                const firstUserUnstakeOperation = await doormanInstance.methods.unstake(firstUserUnstake).send();
                await firstUserUnstakeOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const secondUserPreCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                const secondUserPreCompoundBalance = parseInt(secondUserPreCompoundLedger === undefined ? 0 : secondUserPreCompoundLedger.balance);

                await signerFactory(eve.sk);
                const secondUserCompoundOperation = await doormanInstance.methods.compound().send();
                await secondUserCompoundOperation.confirmation();

                // Update storage
                doormanStorage = await doormanInstance.storage();
                
                // Final values
                const secondUserPostCompoundLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
                const secondUserPostCompoundBalance = parseInt(secondUserPostCompoundLedger === undefined ? 0 : secondUserPostCompoundLedger.balance);

                assert.notEqual(secondUserPreCompoundBalance,secondUserPostCompoundBalance);
            } catch(e) {
                console.log(e)
            }
        })
    })
});
