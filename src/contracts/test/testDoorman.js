const doorman = artifacts.require('doorman');
const mvkToken = artifacts.require('mvkToken');
const vMvkToken = artifacts.require('vMvkToken');

const { doorman_storage } = require('../migrations/1_deploy_doorman.js');
const { mvk_storage } = require('../migrations/2_deploy_mvk_token.js');
const { vMvk_storage } = require('../migrations/3_deploy_vmvk_token.js');

const constants = require('../helpers/constants.js');
/**
 * For testing on a babylonnet (testnet), instead of the sandbox network,
 * make sure to replace the keys for alice/bob accordingly.
 */
const { alice, bob } = require('../scripts/sandbox/accounts');

contract('doorman', accounts => {
    let storage;
    let doormanInstance;
    let mvkTokenInstance;
    let vMvkTokenInstance;

    before(async () => {
        doormanInstance = await doorman.deployed();
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        doormanStorage = await doormanInstance.storage();

        mvkTokenInstance = await mvkToken.deployed();
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        mvkStorage = await mvkTokenInstance.storage();

        vMvkTokenInstance = await vMvkToken.deployed();
        console.log('vMVK Token Contract deployed at:', vMvkTokenInstance.address);
        vMvkStorage = await vMvkTokenInstance.storage();
    });

    it(`set mvk contract address`, async () => {
        try{
            
            // will use own mvkTokenAddress generated from previous tests
            console.log('before (mvk contract address): '+ doormanStorage.mvkTokenAddress);
            const dummyMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";

            const setMvkTokenAddress = await doormanInstance.setMvkTokenAddress(dummyMvkTokenAddress);
            const afterDoormanStorage = await doormanInstance.storage();

            console.log('after (mvk contract address): '+ afterDoormanStorage.mvkTokenAddress);
            assert.equal(afterDoormanStorage.mvkTokenAddress, dummyMvkTokenAddress);

            // set back to original token address
            await doormanInstance.setMvkTokenAddress(mvkTokenInstance.address);        
            const resetDoormanStorage = await doormanInstance.storage();
            console.log('reset (mvk contract address): '+ resetDoormanStorage.mvkTokenAddress);

        } catch (e){
            console.log(e);
        }
    });

    it(`set vMvk contract address`, async () => {
        try{
            
            // will use own mvkTokenAddress generated from previous tests
            console.log('before (vMvk contract address): '+ doormanStorage.mvkTokenAddress);
            const dummyVMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";

            const setVMvkTokenAddress = await doormanInstance.setVMvkTokenAddress(dummyVMvkTokenAddress);
            const afterDoormanStorage = await doormanInstance.storage();

            console.log('after (vMvk contract address): '+ afterDoormanStorage.vMvkTokenAddress);
            assert.equal(afterDoormanStorage.vMvkTokenAddress, dummyVMvkTokenAddress);

            // set back to original token address
            await doormanInstance.setVMvkTokenAddress(vMvkTokenInstance.address);        
            const resetDoormanStorage = await doormanInstance.storage();
            console.log('reset (vMvk contract address): '+ resetDoormanStorage.vMvkTokenAddress);

        } catch (e){
            console.log(e);
        }
    });

    it(`set admin to bob`, async () => {
        try{
            
            console.log('before Admin (alice address): '+ doormanStorage.admin); // return alice.pkh        
        
            const setAdminAddress = await doormanInstance.setAdmin(bob.pkh);
            const afterDoormanStorage = await doormanInstance.storage();

            console.log('after Admin (bob address): '+ afterDoormanStorage.admin); // return bob.pkh        
            assert.equal(afterDoormanStorage.admin, bob.pkh);

        } catch (e){
            console.log(e);
        }
    });



});