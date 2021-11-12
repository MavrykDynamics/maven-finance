const delegation = artifacts.require('delegation');
const vMvkToken = artifacts.require('vMvkToken');
const sMvkToken = artifacts.require('sMvkToken');

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

const { MichelsonMap } = require("@taquito/michelson-encoder");
const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");

/**
 * For testing on a babylonnet (testnet), instead of the sandbox network,
 * make sure to replace the keys for alice/bob accordingly.
 */
const { alice, bob } = require('../scripts/sandbox/accounts');
const truffleConfig  = require("../truffle-config.js");

contract('delegate', accounts => {
    let delegationStorage;
    let delegationInstance;

    const signerFactory = async (pk) => {
        await Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return Tezos;
      };

    before(async () => {

        Tezos.setProvider({
            rpc: `${truffleConfig.networks.development.host}:${truffleConfig.networks.development.port}`            
        })

        // default: set alice (admin) as originator of transactions
        await signerFactory(alice.sk);

        delegationInstance = await delegation.deployed();
        delegationInstance = await Tezos.contract.at(delegationInstance.address);

        vMvkTokenInstance = await vMvkToken.deployed();        
        vMvkTokenInstance = await Tezos.contract.at(vMvkTokenInstance.address);

        sMvkTokenInstance = await sMvkToken.deployed();        
        sMvkTokenInstance = await Tezos.contract.at(sMvkTokenInstance.address);

        delegationStorage = await delegationInstance.storage();
        vMvkStorage       = await vMvkTokenInstance.storage();
        sMvkStorage       = await sMvkTokenInstance.storage();

        console.log('-- -- -- -- -- Deployments -- -- -- --')   
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('vMVK Contract deployed at:', vMvkTokenInstance.address);        
        console.log('sMVK Contract deployed at:', sMvkTokenInstance.address);        
    });


    it('alice can register as a satellite', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            
            const beforeDelegationLedgerAlice  = await beforeDelegationStorage.satelliteLedger.get(alice.pkh);
            const beforeVMvkLedgerAlice        = await beforeVMvkStorage.ledger.get(alice.pkh);
            const beforeSMvkLedgerAlice        = await beforeSMvkStorage.ledger.get(alice.pkh);

            // console.log(beforeDelegationLedgerAlice);
            // console.log(beforeVMvkLedgerAlice.balance);
            // console.log(beforeSMvkLedgerAlice.balance);

            const registerAsDelegatorOperation = await delegationInstance.methods.registerAsSatellite(Tezos.unit).send();
            await registerAsDelegatorOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegationLedgerAlice  = await afterDelegationStorage.satelliteLedger.get(alice.pkh);
            const afterVMvkLedgerAlice        = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterSMvkLedgerAlice        = await afterSMvkStorage.ledger.get(alice.pkh);

            // console.log(afterDelegationLedgerAlice);
            // console.log(afterVMvkLedgerAlice.balance);
            // console.log(afterSMvkLedgerAlice.balance);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice cannot register twice as a satellite', async () => {
        try{        
            
            const failRegisterAsDelegatorOperation = await delegationInstance.methods.registerAsSatellite(Tezos.unit);    
            await chai.expect(failRegisterAsDelegatorOperation.send()).to.be.eventually.rejected;

        } catch(e){
            console.log(e);
        } 
    });

    it('alice can decrease her satellite bond', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            
            const beforeDelegationLedgerAlice  = await beforeDelegationStorage.satelliteLedger.get(alice.pkh);
            const beforeVMvkLedgerAlice        = await beforeVMvkStorage.ledger.get(alice.pkh);
            const beforeSMvkLedgerAlice        = await beforeSMvkStorage.ledger.get(alice.pkh);

            // console.log(beforeDelegationLedgerAlice);
            // console.log(beforeVMvkLedgerAlice.balance);
            // console.log(beforeSMvkLedgerAlice.balance);

            const decreaseSatelliteBondOperation = await delegationInstance.methods.decreaseSatelliteBond(100000000).send();
            await decreaseSatelliteBondOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegationLedgerAlice  = await afterDelegationStorage.satelliteLedger.get(alice.pkh);
            const afterVMvkLedgerAlice        = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterSMvkLedgerAlice        = await afterSMvkStorage.ledger.get(alice.pkh);

            // console.log(afterDelegationLedgerAlice);
            // console.log(afterVMvkLedgerAlice.balance);
            // console.log(afterSMvkLedgerAlice.balance);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice cannot decrease her satellite bond below minimum bond requirements', async () => {
        try{        
            const failDecreaseSatelliteBondOperation = await delegationInstance.methods.decreaseSatelliteBond(200000000);    
            await chai.expect(failDecreaseSatelliteBondOperation.send()).to.be.eventually.rejected;
        } catch(e){
            console.log(e);
        } 
    });

    it('alice can increase her satellite bond', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            
            const beforeDelegationLedgerAlice  = await beforeDelegationStorage.satelliteLedger.get(alice.pkh);
            const beforeVMvkLedgerAlice        = await beforeVMvkStorage.ledger.get(alice.pkh);
            const beforeSMvkLedgerAlice        = await beforeSMvkStorage.ledger.get(alice.pkh);

            // console.log(beforeDelegationLedgerAlice);
            // console.log(beforeVMvkLedgerAlice.balance);
            // console.log(beforeSMvkLedgerAlice.balance);

            const increaseSatelliteBondOperation = await delegationInstance.methods.increaseSatelliteBond(100000000).send();
            await increaseSatelliteBondOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegationLedgerAlice  = await afterDelegationStorage.satelliteLedger.get(alice.pkh);
            const afterVMvkLedgerAlice        = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterSMvkLedgerAlice        = await afterSMvkStorage.ledger.get(alice.pkh);

            // console.log(afterDelegationLedgerAlice);
            // console.log(afterVMvkLedgerAlice.balance);
            // console.log(afterSMvkLedgerAlice.balance);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice can unregister as a satellite', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            
            const beforeDelegationLedgerAlice  = await beforeDelegationStorage.satelliteLedger.get(alice.pkh);
            const beforeVMvkLedgerAlice        = await beforeVMvkStorage.ledger.get(alice.pkh);
            const beforeSMvkLedgerAlice        = await beforeSMvkStorage.ledger.get(alice.pkh);

            // console.log(beforeDelegationLedgerAlice);
            // console.log(beforeVMvkLedgerAlice);
            // console.log(beforeSMvkLedgerAlice);

            const unregisterAsDelegatorOperation = await delegationInstance.methods.unregisterAsSatellite(Tezos.unit).send();
            await unregisterAsDelegatorOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegationLedgerAlice  = await afterDelegationStorage.satelliteLedger.get(alice.pkh);
            const afterVMvkLedgerAlice        = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterSMvkLedgerAlice        = await afterSMvkStorage.ledger.get(alice.pkh);

            // console.log(afterDelegationLedgerAlice);
            // console.log(afterVMvkLedgerAlice);
            // console.log(afterSMvkLedgerAlice);

        } catch(e){
            console.log(e);
        } 
    });

});
