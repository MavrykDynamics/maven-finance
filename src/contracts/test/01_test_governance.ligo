#include "../contracts/main/governance.ligo"
#include "../contracts/main/mvkToken.ligo"
#include "./00_test_setup.ligo"

const _ = logContract("GOVERNANCE");

// setAdmin
const _ = logEntrypoint("%setAdmin");
const testSetAdmin00 = {
    Test.set_source(alice);
    const (taddr, _, _) = Test.originate(main, storages.0, 0tez);
    const initStorage = Test.get_storage(taddr);
    const governanceContract = Test.to_contract(taddr);

    logTest("Admin should be able to call this entrypoint and update the contract administrator with a new address");
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(governanceContract, SetAdmin(eve), 0tez)): (string * nat)));
    const newStorage = Test.get_storage(taddr);
    Test.log((("          old admin:",initStorage.admin): (string * address)));
    Test.log((("          new admin:",newStorage.admin): (string * address)));
} with assert(newStorage.admin = eve);

const testSetAdmin01 = {
    Test.set_source(alice);
    const (taddr, _, _) = Test.originate(main, storages.0, 0tez);
    const storage = Test.get_storage(taddr);
    const governanceContract = Test.to_contract(taddr);

    logTest("Non-admin should not be able to call this entrypoint");
    Test.set_source(bob);
    case Test.transfer_to_contract(governanceContract, SetAdmin(eve), 0tez) of [
        Fail (Rejected (actual,_)) -> skip
    |   Fail (Other) -> failwith("contract failed for an unknown reason")
    |   Success (_gas) -> failwith("contract did not failed but was expected to fail")
    ];
    const newStorage = Test.get_storage(taddr);
} with assert(newStorage.admin = alice);

// startNextRound
const _ = logEntrypoint("%startNextRound");
const testStartNextRound00 = {
    Test.set_source(alice);
    const (taddr, _, _) = Test.originate(main, storages.0, 0tez);
    const initStorage = Test.get_storage(taddr);
    const governanceContract = Test.to_contract(taddr);
    const (addr, _, _) = Test.originate_from_file("contracts/main/delegation.ligo", "main", (nil: list(string)), Test.compile_value(storages.1), 0tez);    
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(governanceContract, UpdateGeneralContracts("delegation", addr), 0tez)): (string * nat)));
    
    // Test
    logTest("User should be able to start the proposal round if no round has been initiated yet");
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(governanceContract, StartNextRound(unit), 0tez)): (string * nat)));
    
    // Get updated storage
    const newStorage = Test.get_storage(taddr);

    // Assertions
    assert(newStorage.currentCycleInfo.round = (Proposal: roundType));
    assert(Map.size(newStorage.currentCycleInfo.roundProposals) = 0n);
    assert(Map.size(newStorage.currentCycleInfo.roundVotes) = 0n);
    assert(newStorage.cycleHighestVotedProposalId = 0n);
    assert(newStorage.currentCycleInfo.cycleEndLevel = newStorage.currentCycleInfo.roundStartLevel + newStorage.currentCycleInfo.blocksPerProposalRound + newStorage.currentCycleInfo.blocksPerVotingRound + newStorage.currentCycleInfo.blocksPerTimelockRound);
    assert(newStorage.currentCycleInfo.roundEndLevel = newStorage.currentCycleInfo.roundStartLevel + newStorage.currentCycleInfo.blocksPerProposalRound);
} with (unit);

const testStartNextRound01 = {
    Test.set_source(alice);
    const (taddr, _, _) = Test.originate(main, storages.0, 0tez);
    const initStorage = Test.get_storage(taddr);
    const governanceContract = Test.to_contract(taddr);
    
    const (addr, _, _) = Test.originate_from_file("contracts/main/delegation.ligo", "main", (nil: list(string)), Test.compile_value(storages.1), 0tez);    
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(governanceContract, UpdateGeneralContracts("delegation", addr), 0tez)): (string * nat)));
    
    logTest("User should not be able to call the entrypoint if the current round has not ended");
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(governanceContract, StartNextRound(unit), 0tez)): (string * nat)));
    const newStorage = Test.get_storage(taddr);
    case Test.transfer_to_contract(governanceContract, StartNextRound(unit), 0tez) of [
        Fail (Rejected (actual,_)) -> skip
    |   Fail (Other) -> failwith("contract failed for an unknown reason")
    |   Success (_gas) -> failwith("contract did not failed but was expected to fail")
    ];
} with assert(newStorage.currentCycleInfo.round = (Proposal: roundType));

const testStartNextRound02 = {
    Test.set_source(alice);
    const (taddr, _, _) = Test.originate(main, storages.0, 0tez);
    const initStorage = Test.get_storage(taddr);
    const governanceContract = Test.to_contract(taddr);
    const mvkTokenTypedAddress = Test.cast_address(initStorage.mvkTokenAddress);
    const mvkTokenContract = Test.to_contract(mvkTokenTypedAddress);

    // Test.log(mvkContractStorage);
    
    // Update Operators on MVK Token Contract
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(mvkTokenContract, Update_operators(list[]), 0tez)): (string * nat)));

    // Set Delegation address
    const (addr, _, _) = Test.originate_from_file("contracts/main/delegation.ligo", "main", (nil: list(string)), Test.compile_value(storages.1), 0tez);    
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(governanceContract, UpdateGeneralContracts("delegation", addr), 0tez)): (string * nat)));

    // Start proposal round
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(governanceContract, StartNextRound(unit), 0tez)): (string * nat)));

    // Start voting round
    const midStorage = Test.get_storage(taddr);
    const blocksPerProposalRound: nat   = midStorage.currentCycleInfo.blocksPerProposalRound * 2n;
    passTime(blocksPerProposalRound * blockTime);
    Test.log(blocksPerProposalRound * blockTime);

    logTest("User should be able to switch from the proposal round to the voting round ");
    Test.log((("          gas cost:",Test.transfer_to_contract_exn(governanceContract, StartNextRound(unit), 0tez)): (string * nat)));
    const newStorage = Test.get_storage(taddr);
    case Test.transfer_to_contract(governanceContract, StartNextRound(unit), 0tez) of [
        Fail (Rejected (actual,_)) -> skip
    |   Fail (Other) -> failwith("contract failed for an unknown reason")
    |   Success (_gas) -> failwith("contract did not failed but was expected to fail")
    ];
    Test.log(newStorage);
} with (unit);