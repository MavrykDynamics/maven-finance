const mvkToken = artifacts.require('mvkToken');

const { doorman_storage } = require('../migrations/1_deploy_doorman.js');
const { mvk_storage } = require('../migrations/2_deploy_mvk_token.js');
const { vmvk_storage } = require('../migrations/3_deploy_vmvk_token.js');

const constants = require('../helpers/constants.js');
/**
 * For testing on a babylonnet (testnet), instead of the sandbox network,
 * make sure to replace the keys for alice/bob accordingly.
 */
const { alice, bob } = require('../scripts/sandbox/accounts');
