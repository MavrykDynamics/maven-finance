// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : governanceStorageType) : address is
    s.admin



(* View: get Governance Proxy address *)
[@view] function getGovernanceProxyAddress(const _ : unit; const s : governanceStorageType) : address is
    s.governanceProxyAddress



(* View: get config *)
[@view] function getConfig(const _ : unit; const s : governanceStorageType) : governanceConfigType is
    s.config



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : governanceStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : governanceStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get Whitelist developers *)
[@view] function getWhitelistDevelopers(const _ : unit; const s : governanceStorageType) : whitelistDevelopersType is
    s.whitelistDevelopers



(* View: get a proposal *)
[@view] function getProposalOpt(const proposalId : nat; const s : governanceStorageType) : option(proposalRecordType) is
    Big_map.find_opt(proposalId, s.proposalLedger)



(* View: get a proposal voter *)
[@view] function getProposalVoterOpt(const voterId : voterIdentifierType; const s : governanceStorageType) : option(voteType) is
    Big_map.find_opt(voterId, s.proposalVoters)



(* View: get a proposal reward *)
[@view] function getProposalRewardOpt(const proposalIdAndVoter : (actionIdType*address); const s : governanceStorageType) : option(unit) is
    Big_map.find_opt(proposalIdAndVoter, s.proposalRewards)



(* View: get a satellite snapshot *)
[@view] function getSnapshotOpt(const cycleAndsatelliteAddress : (nat*address); const s : governanceStorageType) : option(governanceSatelliteSnapshotRecordType) is
    Big_map.find_opt(cycleAndsatelliteAddress, s.snapshotLedger)



(* View: get a staked MVK total supply snapshot *)
[@view] function getStakedMvkSnapshotOpt(const cycleId : nat; const s : governanceStorageType) : option(nat) is
    Big_map.find_opt(cycleId, s.stakedMvkSnapshotLedger)



(* View: get current cycle info *)
[@view] function getCurrentCycleInfo(const _ : unit; const s : governanceStorageType) : currentCycleInfoType is
    s.currentCycleInfo



(* View: get all proposals id and smvk of the current proposal *)
[@view] function getCycleProposals(const _ : unit; const s : governanceStorageType) : map(actionIdType, nat) is
    s.cycleProposals



(* View: get all proposals proposed by a satellite on a given cycle *)
[@view] function getCycleProposerOpt(const cycleAndProposer : (nat*address); const s : governanceStorageType) : option(set(nat)) is
    Big_map.find_opt(cycleAndProposer, s.cycleProposers)



(* View: get the last vote of the voter on a given cycle *)
[@view] function getRoundVoteOpt(const cycleAndProposer : (nat*address); const s : governanceStorageType) : option(roundVoteType) is
    Big_map.find_opt(cycleAndProposer, s.roundVotes)



(* View: get next proposal id *)
[@view] function getNextProposalId(const _ : unit; const s : governanceStorageType) : nat is
    s.nextProposalId



(* View: get cycle counter *)
[@view] function getCycleCounter(const _ : unit; const s : governanceStorageType) : nat is
    s.cycleId



(* View: get current cycle highest voted proposal id *)
[@view] function getCycleHighestVotedProposalId(const _ : unit; const s : governanceStorageType) : nat is
    s.cycleHighestVotedProposalId



(* View: get timelock proposal id *)
[@view] function getTimelockProposalId(const _ : unit; const s : governanceStorageType) : nat is
    s.timelockProposalId



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; const s : governanceStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------