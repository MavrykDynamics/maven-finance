// import assert from "assert";
// import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";
// import { Utils } from './helpers/Utils';
// import { InMemorySigner } from '@taquito/signer';
// import { ClientAggregator } from './helpers/clientAggregatorHelper';
// import BigNumber from 'bignumber.js';
// import { clientAggregatorStorage } from '../storage/clientAggregatorStorage'
// import aggregatorAddress from '../deployments/aggregatorAddress.json';

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');

// chai.use(chaiAsPromised);   
// chai.should();


// describe('clientAggregator', () => {
//   let clientAggregator;
//   let clientAggregatorAddress;
//   var utils: Utils;

//   const signerFactory = async (pk) => {
//     await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//     return utils.tezos;
//   };

//   before("setup", async () => {
//     console.log('-- -- -- -- -- Client Aggregator Tests -- -- -- --')
//     utils = new Utils();
//     await utils.init(bob.sk);
//     const clientAggregatorOrigination = await ClientAggregator.originate(utils.tezos, clientAggregatorStorage);
//     assert.notDeepEqual(clientAggregatorOrigination.contract.address,undefined);
//     clientAggregatorAddress= clientAggregatorOrigination.contract.address;
//     clientAggregator = await utils.tezos.contract.at(clientAggregatorAddress);
//   });

//   describe('getData', () => {
//     it('should fail whencall ther aggregator - wrong aggregatorAddress', async () => {
//       await signerFactory(bob.sk);

//       const op = clientAggregator.methods.default(clientAggregatorAddress);
//       await chai.expect(op.send()).to.be.rejectedWith();
//   });

//     it('should call ther aggregator and get the last data', async () => {
//         await signerFactory(bob.sk);

//         const storage_before = await clientAggregator.storage();

//         const op = clientAggregator.methods.default(aggregatorAddress.address);
//         const tx = await op.send();
//         await tx.confirmation();

//         const storage_after = await clientAggregator.storage();
//         assert.notDeepEqual(storage_after.lastUpdatedAt,storage_before.lastUpdatedAt);
//     });
//   });
// });
