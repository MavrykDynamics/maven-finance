const doorman = artifacts.require('doorman');

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
    let mvkTokenInstance;

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


});