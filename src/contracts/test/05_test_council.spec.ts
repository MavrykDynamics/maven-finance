// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

// import vestingAddress from '../deployments/vestingAddress.json';
// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import councilAddress from '../deployments/councilAddress.json';

// describe("Council tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;
//     let vestingInstance;
//     let councilInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
//     let vestingStorage;
//     let councilStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(alice.sk);
        
//         vestingInstance    = await utils.tezos.contract.at(vestingAddress.address);
//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
//         councilInstance    = await utils.tezos.contract.at(councilAddress.address);
            
//         vestingStorage    = await vestingInstance.storage();
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         governanceStorage = await governanceInstance.storage();
//         councilStorage    = await councilInstance.storage();

//         console.log('-- -- -- -- -- Council Tests -- -- -- --')
//         console.log('Vesting Contract deployed at:', vestingInstance.address);
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Council Contract deployed at:', councilInstance.address);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Eve address: ' + eve.pkh);


//         // Setup funds in Council for transfer later
//         // ------------------------------------------------------------------

//         // Mallory transfers 250 XTZ to Council
//         await signerFactory(mallory.sk)
//         const malloryTransferTezToCouncilOperation = await utils.tezos.contract.transfer({ to: councilAddress.address, amount: 100});
//         await malloryTransferTezToCouncilOperation.confirmation();

//     });

//     it('council can add a new council member', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Council can add a new council member") 
//             console.log("---") // break

//              // init constants
//             const actionId                  = 1;
//             const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
//             // Council Members: Alice, Bob, Eve

//             // params: new council member address
//             const newCouncilMemberAddress   = mallory.pkh;

//             const councilStorage            = await councilInstance.storage();
//             const initialCouncilMemberCount = councilStorage.councilMembers.length;
            
//             // check that there are 3 initial council members
//             assert.equal(initialCouncilMemberCount, 3);
            
//             // Council add new council member
//             await signerFactory(alice.sk)
//             const councilAddNewCouncilMemberOperation = await councilInstance.methods.councilActionAddMember(
//                 newCouncilMemberAddress
//                 ).send();
//             await councilAddNewCouncilMemberOperation.confirmation();

//             // assert that new addMember action has been created with PENDING status
//             const updatedCouncilStorage    = await councilInstance.storage();
//             const councilActionAddMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
//             // check details of council action
//             assert.equal(councilActionAddMember.actionType,       "addCouncilMember");
//             assert.equal(councilActionAddMember.address_param_1,  newCouncilMemberAddress);
//             assert.equal(councilActionAddMember.address_param_2,  zeroAddress);
//             assert.equal(councilActionAddMember.address_param_3,  zeroAddress);
//             assert.equal(councilActionAddMember.nat_param_1,      0);
//             assert.equal(councilActionAddMember.nat_param_2,      0);
//             assert.equal(councilActionAddMember.nat_param_3,      0);
//             assert.equal(councilActionAddMember.string_param_1,   "EMPTY");
//             assert.equal(councilActionAddMember.string_param_2,   "EMPTY");
//             assert.equal(councilActionAddMember.string_param_3,   "EMPTY");
//             assert.equal(councilActionAddMember.executed,         false);
//             assert.equal(councilActionAddMember.status,           "PENDING");
//             assert.equal(councilActionAddMember.signersCount,     1);
//             assert.equal(councilActionAddMember.signers[0],       alice.pkh);

//             // Council member 2 (bob) signs addMember action
//             await signerFactory(bob.sk);
//             const bobSignsAddMemberOperation = await councilInstance.methods.signAction(actionId).send();
//             await bobSignsAddMemberOperation.confirmation();

//             // Council member 3 (eve) signs addMember action
//             await signerFactory(eve.sk);
//             const eveSignsAddMemberOperation = await councilInstance.methods.signAction(actionId).send();
//             await eveSignsAddMemberOperation.confirmation();

//             // get updated storage
//             const completedCouncilStorage          = await councilInstance.storage();
//             const councilActionsAddMemberSigned    = await completedCouncilStorage.councilActionsLedger.get(actionId);
//             const newCouncilMemberCount            = completedCouncilStorage.councilMembers.length;

//             // check that council action is approved and has been executed
//             assert.equal(councilActionsAddMemberSigned.signersCount,  3);
//             assert.equal(councilActionsAddMemberSigned.executed,      true);
//             assert.equal(councilActionsAddMemberSigned.status,        "EXECUTED");

//             // check that there are now 4 council members
//             assert.equal(newCouncilMemberCount, 4);

//         } catch(e){
//             console.log(e);
//         } 

//     });    

//     it('council can remove a council member, and new council member can sign actions', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Council can remove a council member, and new council member can sign actions") 
//             console.log("---") // break

//             // init constants
//             const actionId                  = 2;
//             const zeroAddress               = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
//             // Council Members: Alice, Bob, Eve, Mallory

//             // params: remove council member address
//             const removedCouncilMemberAddress      = bob.pkh;

//             const councilStorage            = await councilInstance.storage();
//             const initialCouncilMemberCount = councilStorage.councilMembers.length;
            
//             // check that there are 4 council members
//             assert.equal(initialCouncilMemberCount, 4);

//             // Council remove council member
//             await signerFactory(alice.sk)
//             const councilRemoveCouncilMemberOperation = await councilInstance.methods.councilActionRemoveMember(
//                 removedCouncilMemberAddress
//                 ).send();
//             await councilRemoveCouncilMemberOperation.confirmation();

//             // assert that new removeMember action has been created with PENDING status
//             const updatedCouncilStorage    = await councilInstance.storage();
//             const councilActionRemoveMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
//             // check details of council action
//             assert.equal(councilActionRemoveMember.actionType,       "removeCouncilMember");
//             assert.equal(councilActionRemoveMember.address_param_1,  removedCouncilMemberAddress);
//             assert.equal(councilActionRemoveMember.address_param_2,  zeroAddress);
//             assert.equal(councilActionRemoveMember.address_param_3,  zeroAddress);
//             assert.equal(councilActionRemoveMember.nat_param_1,      0);
//             assert.equal(councilActionRemoveMember.nat_param_2,      0);
//             assert.equal(councilActionRemoveMember.nat_param_3,      0);
//             assert.equal(councilActionRemoveMember.string_param_1,   "EMPTY");
//             assert.equal(councilActionRemoveMember.string_param_2,   "EMPTY");
//             assert.equal(councilActionRemoveMember.string_param_3,   "EMPTY");
//             assert.equal(councilActionRemoveMember.executed,         false);
//             assert.equal(councilActionRemoveMember.status,           "PENDING");
//             assert.equal(councilActionRemoveMember.signersCount,     1);
//             assert.equal(councilActionRemoveMember.signers[0],       alice.pkh);

//             // Council member 2 (mallory) signs removeMember action
//             await signerFactory(mallory.sk);
//             const mallorySignsRemoveMemberOperation = await councilInstance.methods.signAction(actionId).send();
//             await mallorySignsRemoveMemberOperation.confirmation();

//             // Council member 3 (eve) signs removeMember action
//             await signerFactory(eve.sk);
//             const eveSignsRemoveMemberOperation = await councilInstance.methods.signAction(actionId).send();
//             await eveSignsRemoveMemberOperation.confirmation();

//             // get updated storage
//             const completedCouncilStorage           = await councilInstance.storage();
//             const councilActionsRemoveMemberSigned  = await completedCouncilStorage.councilActionsLedger.get(actionId);
//             const newCouncilMemberCount             = completedCouncilStorage.councilMembers.length;

//             // check that council action is approved and has been executed
//             assert.equal(councilActionsRemoveMemberSigned.signersCount,  3);
//             assert.equal(councilActionsRemoveMemberSigned.executed,      true);
//             assert.equal(councilActionsRemoveMemberSigned.status,        "EXECUTED");

//             // check that there are now 3 council members
//             assert.equal(newCouncilMemberCount, 3);

//         } catch(e){
//             console.log(e);
//         } 

//     });    

// });