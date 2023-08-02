import assert from "assert";
import { Utils } from "./helpers/Utils";

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

import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";
import { 
    signerFactory, 
    updateOperators,
    fa2Transfer,
    mistakenTransferFa2Token,
    mistakenTransferFa12Token
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Mistaken transfers tests", async () => {
    
    var utils: Utils;
    let tezos 

    let admin 
    let adminSk 

    let mavrykFa12TokenAddress
    let mavrykFa2TokenAddress
    let mvkTokenAddress
    let tokenId = 0

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;
    let mTokenInstance;
    let treasuryInstance;
    let treasuryFactoryInstance;
    let farmInstance;
    let lpTokenInstance;
    let breakGlassInstance;
    let emergencyGovernanceInstance;
    let farmFactoryInstance;
    let vaultFactoryInstance;
    let governanceInstance;
    let governanceFinancialInstance;
    let governanceProxyInstance;
    let vestingInstance;
    let aggregatorInstance;
    let aggregatorFactoryInstance;
    let governanceSatelliteInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;
    let mTokenStorage;
    let treasuryStorage;
    let treasuryFactoryStorage;
    let farmStorage;
    let lpTokenStorage;
    let breakGlassStorage;
    let emergencyGovernanceStorage;
    let farmFactoryStorage;
    let vaultFactoryStorage;
    let governanceStorage;
    let governanceFinancialStorage;
    let governanceProxyStorage;
    let vestingStorage;
    let aggregatorStorage;
    let aggregatorFactoryStorage;
    let governanceSatelliteStorage;

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin   = bob.pkh;
        adminSk = bob.sk;
        
        mavrykFa12TokenAddress          = contractDeployments.mavrykFa12Token.address;
        mavrykFa2TokenAddress           = contractDeployments.mavrykFa2Token.address;
        mvkTokenAddress                 = contractDeployments.mvkToken.address;

        doormanInstance                 = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress);
        mavrykFa12TokenInstance         = await utils.tezos.contract.at(mavrykFa12TokenAddress);
        mavrykFa2TokenInstance          = await utils.tezos.contract.at(mavrykFa2TokenAddress);
        treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
        treasuryFactoryInstance         = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
        farmInstance                    = await utils.tezos.contract.at(contractDeployments.farm.address);
        lpTokenInstance                 = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
        breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
        emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
        farmFactoryInstance             = await utils.tezos.contract.at(contractDeployments.farmFactory.address);
        governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
        governanceFinancialInstance     = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
        governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
        vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
        aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
        aggregatorFactoryInstance       = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
        vaultFactoryInstance            = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);
        governanceSatelliteInstance     = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
        mTokenInstance                  = await utils.tezos.contract.at(contractDeployments.mTokenUsdt.address);
            
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvkTokenStorage                 = await mvkTokenInstance.storage();
        mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
        mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
        treasuryStorage                 = await treasuryInstance.storage();
        treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
        farmStorage                     = await farmInstance.storage();
        lpTokenStorage                  = await lpTokenInstance.storage();
        breakGlassStorage               = await breakGlassInstance.storage();
        emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
        farmFactoryStorage              = await farmFactoryInstance.storage();
        governanceStorage               = await governanceInstance.storage();
        governanceFinancialStorage      = await governanceFinancialInstance.storage();
        governanceProxyStorage          = await governanceProxyInstance.storage();
        vestingStorage                  = await vestingInstance.storage();
        aggregatorStorage               = await aggregatorInstance.storage();
        aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
        governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
        vaultFactoryStorage             = await vaultFactoryInstance.storage();
        mTokenStorage                   = await mTokenInstance.storage();

    });

    beforeEach('storage', async () => {
        await signerFactory(tezos, adminSk)
    })

    describe("DOORMAN", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the doorman by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.doorman.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initContractBalance   = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.doorman.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.doorman.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midContractBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(doormanInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.doorman.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endContractBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midContractBalance, initContractBalance + tokenAmount)
                assert.equal(endContractBalance, initContractBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Governance Satellite should not be able to transfer MVK Tokens sent to the doorman by mistake", async() => {
            try{

                // Initial values
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.doorman.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = mistakenTransferFa2Token(doormanInstance, bob.pkh, mvkTokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.doorman.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(doormanInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("FARM", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to a farm by mistake", async() => {
            try{

                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                var contractAccount         = await mavrykFa2TokenStorage.ledger.get(contractDeployments.farm.address)
                var userAccount             = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,             // contract instance
                    bob.pkh,                            // from_
                    contractDeployments.farm.address,   // to_
                    tokenId,                            // token id
                    tokenAmount                         // token amount
                );
                await transferOperation.confirmation();

                // Mid values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.farm.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa2Token(farmInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.farm.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Governance Satellite should not be able to transfer LP Token sent to the farm by mistake", async() => {
            try{

                // Initial values
                const tokenAmount           = 2;

                // Mistake Operation
                const transferOperation     = await lpTokenInstance.methods.transfer(bob.pkh, contractDeployments.farm.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = mistakenTransferFa12Token(farmInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.farm.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(farmInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("DELEGATION", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the delegation by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.delegation.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.delegation.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.delegation.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(delegationInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.delegation.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.delegation.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = await mistakenTransferFa12Token(delegationInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("BREAK GLASS", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the breakGlass by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.breakGlass.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.breakGlass.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.breakGlass.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(breakGlassInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.breakGlass.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.breakGlass.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(breakGlassInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("EMERGENCY GOVERNANCE", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the emergencyGovernance by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.emergencyGovernance.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.emergencyGovernance.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.emergencyGovernance.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(emergencyGovernanceInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.emergencyGovernance.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.emergencyGovernance.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(emergencyGovernanceInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("FARM FACTORY", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the farmFactory by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.farmFactory.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.farmFactory.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.farmFactory.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(farmFactoryInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.farmFactory.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.farmFactory.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(farmFactoryInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("GOVERNANCE", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the governance by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governance.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.governance.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governance.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(governanceInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governance.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.governance.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(governanceInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("GOVERNANCE FINANCIAL", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the governanceFinancial by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governanceFinancial.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.governanceFinancial.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governanceFinancial.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(governanceFinancialInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governanceFinancial.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.governanceFinancial.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(governanceFinancialInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("GOVERNANCE PROXY", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the governanceProxy by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governanceProxy.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.governanceProxy.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governanceProxy.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(governanceProxyInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.governanceProxy.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.governanceProxy.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(governanceProxyInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("MVK TOKEN", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the mvkToken by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.mvkToken.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.mvkToken.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.mvkToken.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(mvkTokenInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.mvkToken.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.mvkToken.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(mvkTokenInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("TREASURY FACTORY", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the treasuryFactory by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.treasuryFactory.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.treasuryFactory.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.treasuryFactory.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(treasuryFactoryInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.treasuryFactory.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.treasuryFactory.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(treasuryFactoryInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("VAULT FACTORY", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the vaultFactory by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.vaultFactory.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.vaultFactory.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.vaultFactory.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(vaultFactoryInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.vaultFactory.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.vaultFactory.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(vaultFactoryInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })


    describe("VESTING", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the vesting by mistake", async() => {
            try{

                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                var contractAccount         = await mavrykFa12TokenStorage.ledger.get(contractDeployments.vesting.address)
                var userAccount             = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.balance.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.vesting.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.vesting.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa12Token(vestingInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                contractAccount             = await mavrykFa12TokenStorage.ledger.get(contractDeployments.vesting.address)
                userAccount                 = await mavrykFa12TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.balance.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mavrykFa12TokenInstance.methods.transfer(bob.pkh, contractDeployments.vesting.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa12Token(vestingInstance, bob.pkh, mavrykFa12TokenAddress, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("AGGREGATOR", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to an aggregator by mistake", async() => {
            try{

                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                var contractAccount         = await mavrykFa2TokenStorage.ledger.get(contractDeployments.aggregator.address)
                var userAccount             = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                   // contract instance
                    bob.pkh,                                  // from_
                    contractDeployments.aggregator.address,   // to_
                    tokenId,                                  // token id
                    tokenAmount                               // token amount
                );
                await transferOperation.confirmation();

                // Mid values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.aggregator.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa2Token(aggregatorInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa2TokenStorage        = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.aggregator.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa2TokenStorage        = await mavrykFa2TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                 // contract instance
                    bob.pkh,                                // from_
                    contractDeployments.aggregator.address, // to_
                    tokenId,                                // token id
                    tokenAmount                             // token amount
                );
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa2Token(aggregatorInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("AGGREGATOR FACTORY", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the aggregator factory by mistake", async() => {
            try{

                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                var contractAccount         = await mavrykFa2TokenStorage.ledger.get(contractDeployments.aggregatorFactory.address)
                var userAccount             = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                         // contract instance
                    bob.pkh,                                        // from_
                    contractDeployments.aggregatorFactory.address,  // to_
                    tokenId,                                        // token id
                    tokenAmount                                     // token amount
                );
                await transferOperation.confirmation();

                // Mid values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.aggregatorFactory.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa2Token(aggregatorFactoryInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.aggregatorFactory.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                             // contract instance
                    bob.pkh,                                            // from_
                    contractDeployments.aggregatorFactory.address,    // to_
                    tokenId,                                            // token id
                    tokenAmount                                         // token amount
                );
                await transferOperation.confirmation();

                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa2Token(aggregatorFactoryInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

    describe("GOVERNANCE SATELLITE", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to the governance satellite by mistake", async() => {
            try{

                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                var contractAccount         = await mavrykFa2TokenStorage.ledger.get(contractDeployments.governanceSatellite.address)
                var userAccount             = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                             // contract instance
                    bob.pkh,                                            // from_
                    contractDeployments.governanceSatellite.address,    // to_
                    tokenId,                                            // token id
                    tokenAmount                                         // token amount
                );
                await transferOperation.confirmation();

                // Mid values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.governanceSatellite.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa2Token(governanceSatelliteInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.governanceSatellite.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                             // contract instance
                    bob.pkh,                                            // from_
                    contractDeployments.governanceSatellite.address,    // to_
                    tokenId,                                            // token id
                    tokenAmount                                         // token amount
                );
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa2Token(governanceSatelliteInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    });

    describe("MAVRYK FA12 TOKEN", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to a mavryk fa12 token by mistake", async() => {
            try{

                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                var contractAccount         = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mavrykFa12Token.address)
                var userAccount             = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                         // contract instance
                    bob.pkh,                                        // from_
                    contractDeployments.mavrykFa12Token.address,    // to_
                    tokenId,                                        // token id
                    tokenAmount                                     // token amount
                );
                await transferOperation.confirmation();

                // Mid values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mavrykFa12Token.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa2Token(mavrykFa12TokenInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mavrykFa12Token.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                         // contract instance
                    bob.pkh,                                        // from_
                    contractDeployments.mavrykFa12Token.address,    // to_
                    tokenId,                                        // token id
                    tokenAmount                                     // token amount
                );
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa2Token(mavrykFa12TokenInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    });

    describe("MAVRYK FA2 TOKEN", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to a mavryk fa12 token by mistake", async() => {
            try{

                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                var contractAccount         = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mavrykFa2Token.address)
                var userAccount             = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                         // contract instance
                    bob.pkh,                                        // from_
                    contractDeployments.mavrykFa2Token.address,     // to_
                    tokenId,                                        // token id
                    tokenAmount                                     // token amount
                );
                await transferOperation.confirmation();

                // Mid values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mavrykFa2Token.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa2Token(mavrykFa2TokenInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mavrykFa2Token.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                         // contract instance
                    bob.pkh,                                        // from_
                    contractDeployments.mavrykFa2Token.address,     // to_
                    tokenId,                                        // token id
                    tokenAmount                                     // token amount
                );
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa2Token(mavrykFa2TokenInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    });

    describe("MTOKEN", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(tezos, adminSk)
        })

        it("Governance Satellite should be able to transfer Tokens sent to mToken contract by mistake", async() => {
            try{

                // Initial values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                var contractAccount         = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mTokenUsdt.address)
                var userAccount             = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const initAccountBalance    = contractAccount ? contractAccount.toNumber() : 0;
                const initUserBalance       = userAccount ? userAccount.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                   // contract instance
                    bob.pkh,                                  // from_
                    contractDeployments.mTokenUsdt.address,   // to_
                    tokenId,                                  // token id
                    tokenAmount                               // token amount
                );
                await transferOperation.confirmation();

                // Mid values
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mTokenUsdt.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                
                // Mistaken Transfer Operation
                const mistakenTransferOperation = await mistakenTransferFa2Token(mTokenInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                // Final values
                mavrykFa2TokenStorage        = await mavrykFa2TokenInstance.storage()
                contractAccount             = await mavrykFa2TokenStorage.ledger.get(contractDeployments.mTokenUsdt.address)
                userAccount                 = await mavrykFa2TokenStorage.ledger.get(bob.pkh)
                const endAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;
                const endUserBalance        = userAccount ? userAccount.toNumber() : 0;

                // Assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("Non Governance Satellite should not be able to call this entrypoint", async() => {
            try{
                
                // Initial values
                mavrykFa2TokenStorage        = await mavrykFa2TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation    = await fa2Transfer(
                    mavrykFa2TokenInstance,                 // contract instance
                    bob.pkh,                                // from_
                    contractDeployments.mTokenUsdt.address, // to_
                    tokenId,                                // token id
                    tokenAmount                             // token amount
                );
                await transferOperation.confirmation();
                
                // Mistaken Transfer Operation
                await signerFactory(tezos, alice.sk)
                const mistakenTransferOperation = mistakenTransferFa2Token(mTokenInstance, bob.pkh, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    });

});
