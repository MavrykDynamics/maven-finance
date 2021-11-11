const delegation = artifacts.require('delegation');
const vMvkToken = artifacts.require('vMvkToken');

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

        delegationStorage = await delegationInstance.storage();
        vMvkStorage       = await vMvkTokenInstance.storage();

        console.log('-- -- -- -- -- Deployments -- -- -- --')   
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('vMVK Contract deployed at:', vMvkTokenInstance.address);        
    });


    it('alice can register as a satellite', async () => {
        try{        

            const registerAsDelegatorOperation = await delegationInstance.methods.registerAsSatellite(Tezos.unit).send();
            await registerAsDelegatorOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            
            const afterDelegationLedgerAlice  = await afterDelegationStorage.satelliteLedger.get(alice.pkh);

            console.log(afterDelegationLedgerAlice);

        } catch(e){
            console.log(e);
        } 
    });

//     it(`should not allow transfers from an address that did not sign the transaction`, async () => {
//         try {        
//             const failTransferOperation = await mvkTokenInstance.methods.transfer(bob.pkh, alice.pkh, 1000000n);
//             await chai.expect(failTransferOperation.send()).to.be.eventually.rejected;
//         } catch (e) {
//             console.log(e);
//             // assert.equal(e.message, constants.contractErrors.notEnoughAllowance)
//         }
//     });

//     it(`should not transfer tokens from Alice to Bob when Alice's balance is insufficient`, async () => {
//         try {
//             const failTransferInsufficientOperation = await mvkTokenInstance.methods.transfer(alice.pkh, bob.pkh, 100000000000n);
//             await chai.expect(failTransferInsufficientOperation.send()).to.be.eventually.rejected;
//         } catch (e) {
//             console.log(e);
//             // assert.equal(e.message, constants.contractErrors.notEnoughBalance)
//         }
//     });

//     it(`should not allow anyone to burn tokens`, async () => {
//         try {
//             const failBurnTokenOperation = await mvkTokenInstance.methods.burn(alice.pkh, 1000000n);
//             await chai.expect(failBurnTokenOperation.send()).to.be.eventually.rejected;
//         } catch (e) {
//             assert.equal(e.message, constants.contractErrors.notAuthorized)
//         }
//     });

//     it(`should not allow anyone to mint tokens`, async () => {
//         try {
//             const failMintTokenOperation = await mvkTokenInstance.methods.mint(alice.pkh, 1000000n);
//             await chai.expect(failMintTokenOperation.send()).to.be.eventually.rejected;
//         } catch (e) {
//             console.log(e);
//             // assert.equal(e.message, constants.contractErrors.notAuthorized)
//         }
//     });

    // it(`should allow doorman to burn tokens`, async () => {
    //     try {
    //         await mvkTokenInstance.burn(alice.pkh, 1);
    //     } catch (e) {
    //         assert.equal(e.message, constants.contractErrors.notAuthorized)
    //     }
    // });

});
