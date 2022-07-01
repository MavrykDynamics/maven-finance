// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Type
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Type
#include "../partials/contractTypes/governanceTypes.ligo"

// ------------------------------------------------------------------------------

type governanceAction is 

      // Break Glass Entrypoint
      BreakGlass                      of (unit)
    | PropagateBreakGlass             of (unit)

      // Housekeeping Entrypoints
    | SetAdmin                        of (address)
    | SetGovernanceProxy              of (address)
    | UpdateMetadata                  of updateMetadataType
    | UpdateConfig                    of governanceUpdateConfigParamsType
    | UpdateGeneralContracts          of updateGeneralContractsType
    | UpdateWhitelistContracts        of updateWhitelistContractsType
    | UpdateWhitelistDevelopers       of (address)
    | MistakenTransfer                of transferActionType
    | SetContractAdmin                of setContractAdminType
    | SetContractGovernance           of setContractGovernanceType
    
      // Governance Cycle Entrypoints
    | StartNextRound                  of bool
    | Propose                         of newProposalType
    | ProposalRoundVote               of actionIdType
    | UpdateProposalData              of updateProposalDataType
    | UpdatePaymentData               of updatePaymentDataType
    | LockProposal                    of actionIdType      
    | VotingRoundVote                 of (votingRoundVoteType)    
    | ExecuteProposal                 of (unit)
    | ProcessProposalPayment          of actionIdType
    | ProcessProposalSingleData       of (unit)
    | DropProposal                    of actionIdType

      // Lambda Entrypoints
    | SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceStorageType

// governance contract methods lambdas
type governanceUnpackLambdaFunctionType is (governanceLambdaActionType * governanceStorageType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const maxRoundDuration : nat = 20_160n; // One week with blockTime = 30sec

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------



function checkSenderIsAdmin(var s : governanceStorageType) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsWhitelistedOrAdmin(var s : governanceStorageType) : unit is
    if (Tezos.sender = s.admin) or checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_WHITELISTED_ADDRESSES_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



function checkSenderIsDoormanContract(var s : governanceStorageType) : unit is
block{

  const doormanAddress : address = case s.generalContracts["doorman"] of [
        Some(_address) -> _address
      | None           -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
  ];
  
  if (Tezos.sender = doormanAddress) then skip
  else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



function checkSenderIsDelegationContract(var s : governanceStorageType) : unit is
block{

  const delegationAddress : address = case s.generalContracts["delegation"] of [
        Some(_address) -> _address
      | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
  ];

  if (Tezos.sender = delegationAddress) then skip
  else failwith(error_ONLY_DELEGATION_CONTRACT_ALLOWED);

} with unit



function checkSenderIsMvkTokenContract(var s : governanceStorageType) : unit is
block{

  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
  else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);

} with unit



function checkSenderIsCouncilContract(var s : governanceStorageType) : unit is
block{

  const councilAddress : address = case s.generalContracts["council"] of [
        Some(_address) -> _address
      | None           -> failwith(error_COUNCIL_CONTRACT_NOT_FOUND)
  ];
  
  if (Tezos.sender = councilAddress) then skip
  else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with unit



function checkSenderIsEmergencyGovernanceContract(var s : governanceStorageType) : unit is
block{

  const emergencyGovernanceAddress : address = case s.generalContracts["emergencyGovernance"] of [
        Some(_address) -> _address
      | None           -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];

  if (Tezos.sender = emergencyGovernanceAddress) then skip
  else failwith(error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



function checkSenderIsAdminOrGovernanceSatelliteContract(var s : governanceStorageType) : unit is
block{
  if Tezos.sender = s.admin then skip
  else {
    const governanceSatelliteAddress: address = case s.generalContracts["governanceSatellite"] of [
          Some (_contract)    -> _contract
        | None                -> failwith (error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND)
    ];
    if Tezos.sender = governanceSatelliteAddress then skip
      else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
  }
} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Satellite Status Helper Functions
// ------------------------------------------------------------------------------

function checkSatelliteIsNotSuspendedOrBanned(const satelliteAddress: address; var s : governanceStorageType) : unit is
  block{
    const delegationAddress : address = case s.generalContracts["delegation"] of [
          Some(_address) -> _address
        | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
    ];
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
    case satelliteOptView of [
      Some (value) -> case value of [
          Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
        | None              -> failwith(error_ONLY_SATELLITE_ALLOWED)
      ]

    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)

    ];
  } with (unit)

// ------------------------------------------------------------------------------
// Satellite Status Helper Functions
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// governance proxy lamba helper function to get setAdmin entrypoint
function getSetAdminEntrypoint(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%setAdmin",
      contractAddress) : option(contract(address))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_IN_CONTRACT_NOT_FOUND) : contract(address))
      ];



// governance proxy lamba helper function to get setGovernance entrypoint
function getSetGovernanceEntrypoint(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%setGovernance",
      contractAddress) : option(contract(address))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_GOVERNANCE_ENTRYPOINT_IN_CONTRACT_NOT_FOUND) : contract(address))
      ];


      
// governance proxy lamba helper function to get executeGovernanceProposal entrypoint
function getExecuteGovernanceActionEntrypoint(const contractAddress : address) : contract(bytes) is
case (Tezos.get_entrypoint_opt(
      "%executeGovernanceAction",
      contractAddress) : option(contract(bytes))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND) : contract(bytes))
      ];



// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
      ];



function getExecuteProposalEntrypoint(const contractAddress : address) : contract(unit) is
case (Tezos.get_entrypoint_opt(
      "%executeProposal",
      contractAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith(error_EXECUTE_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(unit))
];



function getUpdateProposalDataEntrypoint(const contractAddress : address) : contract(updateProposalDataType) is
case (Tezos.get_entrypoint_opt(
      "%updateProposalData",
      contractAddress) : option(contract(updateProposalDataType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updateProposalDataType))
];



function getUpdatePaymentDataEntrypoint(const contractAddress : address) : contract(updatePaymentDataType) is
case (Tezos.get_entrypoint_opt(
      "%updatePaymentData",
      contractAddress) : option(contract(updatePaymentDataType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_ADD_UPDATE_PAYMENT_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updatePaymentDataType))
];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get satellite snapshot 
function getSatelliteSnapshotRecord (const satelliteAddress : address; const s : governanceStorageType) : governanceSatelliteSnapshotRecordType is
block {

    var satelliteSnapshotRecord : governanceSatelliteSnapshotRecordType :=
      record [
        totalStakedMvkBalance   = 0n;                            // log of satellite's total mvk balance for this cycle
        totalDelegatedAmount    = 0n;                            // log of satellite's total delegated amount 
        totalVotingPower        = 0n;                            // calculated total voting power based on votingPowerRatio (i.e. self bond percentage)   
        cycle                   = s.cycleCounter;               // log of current cycle
      ];

    case s.snapshotLedger[satelliteAddress] of [
        None -> skip
      | Some(instance) -> satelliteSnapshotRecord := instance
    ];

} with satelliteSnapshotRecord



function setProposalRecordVote(const voteType : voteType; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is
block {

    case voteType of [

        Yay -> block {
            _proposal.yayVoteCount            := _proposal.yayVoteCount + 1n;    
            _proposal.yayVoteStakedMvkTotal   := _proposal.yayVoteStakedMvkTotal + totalVotingPower;
          }

      | Nay -> block {
            _proposal.nayVoteCount            := _proposal.nayVoteCount + 1n;    
            _proposal.nayVoteStakedMvkTotal   := _proposal.nayVoteStakedMvkTotal + totalVotingPower;
          }

      | Pass -> block {
            _proposal.passVoteCount           := _proposal.passVoteCount + 1n;    
            _proposal.passVoteStakedMvkTotal  := _proposal.passVoteStakedMvkTotal + totalVotingPower;
          }
      
    ];

    _proposal.quorumStakedMvkTotal    := _proposal.quorumStakedMvkTotal + totalVotingPower;
    _proposal.quorumCount             := _proposal.quorumCount + 1n;

} with _proposal



function unsetProposalRecordVote(const voteType : voteType; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is 
block {
    
    case voteType of [

        Yay -> block {

          var yayVoteCount            : nat := 0n;
          var yayVoteStakedMvkTotal   : nat := 0n;

          if _proposal.yayVoteCount < 1n then yayVoteCount := 0n
            else yayVoteCount := abs(_proposal.yayVoteCount - 1n);

          if _proposal.yayVoteStakedMvkTotal < totalVotingPower then yayVoteStakedMvkTotal := 0n
            else yayVoteStakedMvkTotal := abs(_proposal.yayVoteStakedMvkTotal - totalVotingPower);          

          _proposal.yayVoteCount          := yayVoteCount;
          _proposal.yayVoteStakedMvkTotal := yayVoteStakedMvkTotal;

        }

      | Nay -> block {

          var nayVoteCount            : nat := 0n;
          var nayVoteStakedMvkTotal   : nat := 0n;

          if _proposal.nayVoteCount < 1n then nayVoteCount := 0n
            else nayVoteCount := abs(_proposal.nayVoteCount - 1n);

          if _proposal.nayVoteStakedMvkTotal < totalVotingPower then nayVoteStakedMvkTotal := 0n
            else nayVoteStakedMvkTotal := abs(_proposal.nayVoteStakedMvkTotal - totalVotingPower);

          _proposal.nayVoteCount            := nayVoteCount;
          _proposal.nayVoteStakedMvkTotal   := nayVoteStakedMvkTotal;

      }

      | Pass -> block {

          var passVoteCount : nat := 0n;
          var passVoteStakedMvkTotal  : nat := 0n;

          if _proposal.passVoteCount < 1n then passVoteCount := 0n
            else passVoteCount := abs(_proposal.passVoteCount - 1n);

          if _proposal.passVoteStakedMvkTotal < totalVotingPower then passVoteStakedMvkTotal := 0n
            else passVoteStakedMvkTotal := abs(_proposal.passVoteStakedMvkTotal - totalVotingPower);

          _proposal.passVoteCount           := passVoteCount;
          _proposal.passVoteStakedMvkTotal  := passVoteStakedMvkTotal;

      }
      
    ];

    var quorumCount             : nat := 0n;
    var quorumStakedMvkTotal    : nat := 0n;

    if _proposal.quorumCount < 1n then quorumCount := 0n
      else quorumCount := abs(_proposal.quorumCount - 1n);

    if _proposal.quorumStakedMvkTotal < totalVotingPower then quorumStakedMvkTotal := 0n
      else quorumStakedMvkTotal := abs(_proposal.quorumStakedMvkTotal - totalVotingPower);          

    _proposal.quorumCount           := quorumCount;
    _proposal.quorumStakedMvkTotal  := quorumStakedMvkTotal;  

} with _proposal



// helper function to setup new proposal round
function sendRewardsToVoters(var s: governanceStorageType): operation is
  block{
    // Get all voting satellite
    const highestVotedProposalId: nat   = s.cycleHighestVotedProposalId;
    const proposal: proposalRecordType  = case Big_map.find_opt(highestVotedProposalId, s.proposalLedger) of [
      Some (_record) -> _record
    | None -> failwith(error_HIGHEST_VOTED_PROPOSAL_NOT_FOUND)
    ];
    const voters: votersMapType         = proposal.voters;
    
    // Get voters
    var votersAddresses: set(address)   := (Set.empty: set(address));
    function getVotersAddresses(const voters: set(address); const voter: address * votingRoundRecordType): set(address) is
      Set.add(voter.0, voters);
    var votersAddresses := Map.fold(getVotersAddresses, voters, votersAddresses);

    // Get rewards
    const roundReward: nat  = s.currentCycleInfo.cycleTotalVotersReward;

    // Send rewards to all satellites
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
    ];
    const distributeRewardsEntrypoint: contract(set(address) * nat) =
      case (Tezos.get_entrypoint_opt("%distributeReward", delegationAddress) : option(contract(set(address) * nat))) of [
        Some(contr) -> contr
      | None -> (failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED): contract(set(address) * nat))
    ];
    const distributeOperation: operation = Tezos.transaction((votersAddresses, roundReward), 0tez, distributeRewardsEntrypoint);
  } with(distributeOperation)



function sendRewardToProposer(var s: governanceStorageType): operation is
  block{
    // Get all voting satellite
    const timelockProposalId: nat   = s.timelockProposalId;
    const proposal: proposalRecordType  = case Big_map.find_opt(timelockProposalId, s.proposalLedger) of [
      Some (_record) -> _record
    | None -> failwith(error_TIMELOCK_PROPOSAL_NOT_FOUND)
    ];
    const proposerAddress: address         = proposal.proposerAddress;
    
    // Get rewards
    const proposerReward: nat  = proposal.successReward;

    // Send rewards to the proposer
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
    ];
    const distributeRewardsEntrypoint: contract(set(address) * nat) =
      case (Tezos.get_entrypoint_opt("%distributeReward", delegationAddress) : option(contract(set(address) * nat))) of [
        Some(contr) -> contr
      | None -> (failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED): contract(set(address) * nat))
    ];
    const distributeOperation: operation = Tezos.transaction((set[proposerAddress], proposerReward), 0tez, distributeRewardsEntrypoint);
  } with(distributeOperation)



function setupProposalRound(var s: governanceStorageType): governanceStorageType is
block {

    // reset state variables
    const emptyProposalMap  : map(nat, nat)           = map [];
    const emptyVotesMap     : map(address, nat)       = map [];
    const emptyProposerMap  : map(address, set(nat))  = map [];
    const emptySnapshotMap  : snapshotLedgerType      = map [];

    // Get SMVK Total Supply
    const doormanAddress : address   = case s.generalContracts["doorman"] of [
        Some(_address) -> _address
      | None -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
    ];
    const balanceView : option (nat)    = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
    const smvkTotalSupply: nat = case balanceView of [
        Some (value) -> value
      | None -> failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND)
    ];
    const minQuorumStakedMvkTotal: nat  = (smvkTotalSupply * s.config.minQuorumPercentage) / 10000n ;

    // Setup current round info
    s.currentCycleInfo.round                         := (Proposal : roundType);
    s.currentCycleInfo.blocksPerProposalRound        := s.config.blocksPerProposalRound;
    s.currentCycleInfo.blocksPerVotingRound          := s.config.blocksPerVotingRound;
    s.currentCycleInfo.blocksPerTimelockRound        := s.config.blocksPerTimelockRound;
    s.currentCycleInfo.roundStartLevel               := Tezos.level;
    s.currentCycleInfo.roundEndLevel                 := Tezos.level + s.config.blocksPerProposalRound;
    s.currentCycleInfo.cycleEndLevel                 := Tezos.level + s.config.blocksPerProposalRound + s.config.blocksPerVotingRound + s.config.blocksPerTimelockRound;
    s.currentCycleInfo.cycleTotalVotersReward        := s.config.cycleVotersReward;
    s.currentCycleInfo.minQuorumStakedMvkTotal       := minQuorumStakedMvkTotal;
    s.currentCycleInfo.roundProposals                := emptyProposalMap;    // flush proposals
    s.currentCycleInfo.roundProposers                := emptyProposerMap;    // flush proposals
    s.currentCycleInfo.roundVotes                    := emptyVotesMap;       // flush voters
    s.cycleHighestVotedProposalId                    := 0n;                  // flush proposal id voted through - reset to 0 

    // Empty the satellite snapshot ledger
    s.snapshotLedger    := emptySnapshotMap;

    // Increase the cycle counter
    s.cycleCounter      := s.cycleCounter + 1n;

    const delegationAddress : address = case s.generalContracts["delegation"] of [
        Some(_address) -> _address
      | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    // get voting power ratio
    const configView: option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
    const votingPowerRatio: nat                     = case configView of [
            Some (_optionConfig) -> _optionConfig.delegationRatio
        |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    // Get active satellites from the delegation contract and loop through them
    const activeSatellitesView : option (map(address,satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
    const activeSatellites: map(address,satelliteRecordType) = case activeSatellitesView of [
        Some (value) -> value
      | None -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    for satelliteAddress -> satellite in map activeSatellites block {

      const mvkBalance: nat = satellite.stakedMvkBalance;
      const totalDelegatedAmount: nat = satellite.totalDelegatedAmount;

      // create or retrieve satellite snapshot from snapshotLedger in governanceStorageType
      var satelliteSnapshotRecord : governanceSatelliteSnapshotRecordType := getSatelliteSnapshotRecord(satelliteAddress, s);

      // calculate total voting power
      var maxTotalVotingPower: nat := mvkBalance * 10000n / votingPowerRatio;
      if votingPowerRatio = 0n then maxTotalVotingPower := mvkBalance * 10000n else skip;
      const mvkBalanceAndTotalDelegatedAmount = mvkBalance + totalDelegatedAmount; 
      var totalVotingPower : nat := 0n;
      if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
      else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

      // update satellite snapshot record
      satelliteSnapshotRecord.totalStakedMvkBalance   := mvkBalance; 
      satelliteSnapshotRecord.totalDelegatedAmount    := totalDelegatedAmount; 
      satelliteSnapshotRecord.totalVotingPower        := totalVotingPower;
      satelliteSnapshotRecord.cycle                   := s.cycleCounter; 

      s.snapshotLedger[satelliteAddress] := satelliteSnapshotRecord;
    }

} with (s)



// helper function to setup new voting round
function setupVotingRound(const highestVotedProposalId: nat; var s: governanceStorageType): governanceStorageType is
block {

    // boundaries fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentCycleInfo.round               := (Voting : roundType);
    s.currentCycleInfo.roundStartLevel     := s.currentCycleInfo.roundEndLevel + 1n;
    s.currentCycleInfo.roundEndLevel       := s.currentCycleInfo.roundEndLevel + s.currentCycleInfo.blocksPerVotingRound;

    s.timelockProposalId         := 0n;                  // flush proposal id in timelock - reset to 0

    // set the current round highest voted proposal id
    s.cycleHighestVotedProposalId := highestVotedProposalId;

    // flush current round votes - to prepare for voting round
    const emptyCurrentRoundVotes : map(address, nat) = map[];
    s.currentCycleInfo.roundVotes := emptyCurrentRoundVotes;

} with (s)



// helper function to setup new timelock round
function setupTimelockRound(var s: governanceStorageType): governanceStorageType is
block {

    // boundaries remain fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentCycleInfo.round               := (Timelock : roundType);
    s.currentCycleInfo.roundStartLevel     := s.currentCycleInfo.roundEndLevel + 1n;
    s.currentCycleInfo.roundEndLevel       := s.currentCycleInfo.cycleEndLevel;

    // set timelockProposalId to cycleHighestVotedProposalId
    s.timelockProposalId         := s.cycleHighestVotedProposalId;
    
} with (s)

// ------------------------------------------------------------------------------
// Governance Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceUnpackLambdaFunctionType)) of [
        Some(f) -> f(governanceLambdaAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _: unit; var s : governanceStorageType) : address is
  s.admin



(* View: get config *)
[@view] function getConfig(const _: unit; var s : governanceStorageType) : governanceConfigType is
  s.config



(* View: get Governance Proxy address *)
[@view] function getGovernanceProxyAddress(const _: unit; var s : governanceStorageType) : address is
  s.governanceProxyAddress



(* View: get general contracts *)
[@view] function getGeneralContractOpt(const contractName: string; var s : governanceStorageType) : option(address) is
  Map.find_opt(contractName, s.generalContracts)



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : governanceStorageType) : generalContractsType is
  s.generalContracts



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; const s: governanceStorageType): whitelistContractsType is 
    s.whitelistContracts



(* View: get Whitelist developers *)
[@view] function getWhitelistDevelopers(const _: unit; var s : governanceStorageType) : whitelistDevelopersType is
  s.whitelistDevelopers



(* View: get a proposal *)
[@view] function getProposalOpt(const proposalId: nat; var s : governanceStorageType) : option(proposalRecordType) is
  Big_map.find_opt(proposalId, s.proposalLedger)



(* View: get a satellite snapshot *)
[@view] function getSnapshotOpt(const satelliteAddress: address; var s : governanceStorageType) : option(governanceSatelliteSnapshotRecordType) is
  Map.find_opt(satelliteAddress, s.snapshotLedger)



(* View: get a satellite snapshot ledger *)
[@view] function getSnapshotLedger(const _: unit; var s : governanceStorageType) : snapshotLedgerType is
  s.snapshotLedger



(* View: get current cycle info *)
[@view] function getCurrentCycleInfo(const _: unit; var s : governanceStorageType) : currentCycleInfoType is
  s.currentCycleInfo



(* View: get next proposal id *)
[@view] function getNextProposalId(const _: unit; var s : governanceStorageType) : nat is
  s.nextProposalId



(* View: get cycle counter *)
[@view] function getCycleCounter(const _: unit; var s : governanceStorageType) : nat is
  s.cycleCounter



(* View: get current cycle highest voted proposal id *)
[@view] function getCycleHighestVotedProposalId(const _: unit; var s : governanceStorageType) : nat is
  s.cycleHighestVotedProposalId



(* View: get timelock proposal id *)
[@view] function getTimelockProposalId(const _: unit; var s : governanceStorageType) : nat is
  s.timelockProposalId



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : governanceStorageType) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : governanceStorageType) : lambdaLedgerType is
  s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Governance Contract Lambdas:
#include "../partials/contractLambdas/governance/governanceLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Entrypoint Begin
// ------------------------------------------------------------------------------

(*  breakGlass entrypoint *)
function breakGlass(var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBreakGlass"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response



(*  propagateBreakGlass entrypoint *)
function propagateBreakGlass(var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPropagateBreakGlass"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaPropagateBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response




(*  setGovernanceProxy entrypoint *)
function setGovernanceProxy(const newGovernanceProxyAddress : address; var s : governanceStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernanceProxy"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetGovernanceProxy(newGovernanceProxyAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : governanceUpdateConfigParamsType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response



// (*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: governanceStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: governanceStorageType): return is
block {
        
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);  

} with response



// (*  updateWhitelistDevelopers entrypoint *)
function updateWhitelistDevelopers(const developer: address; var s: governanceStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistDevelopers"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateWhitelistDevelopers(developer);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: governanceStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);  

} with response



// (*  setContractAdmin entrypoint *)
function setContractAdmin(const setContractAdminParams: setContractAdminType; var s: governanceStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetContractAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetContractAdmin(setContractAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (*  setContractGovernance entrypoint *)
function setContractGovernance(const setContractGovernanceParams: setContractGovernanceType; var s: governanceStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetContractGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetContractGovernance(setContractGovernanceParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Cycle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  startNextRound entrypoint *)
function startNextRound(const executePastProposal: bool; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaStartNextRound"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaStartNextRound(executePastProposal);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* propose entrypoint *)
function propose(const newProposal : newProposalType ; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPropose"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaPropose(newProposal);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* updateProposalData entrypoint *)
function updateProposalData(const proposalData : updateProposalDataType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateProposalData"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateProposalData(proposalData);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response


// (* updatePaymentData entrypoint *)
function updatePaymentData(const paymentData : updatePaymentDataType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdatePaymentData"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdatePaymentData(paymentData);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(* lockProposal entrypoint *)
function lockProposal(const proposalId : nat; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaLockProposal"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaLockProposal(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* proposalRoundVote entrypoint *)
function proposalRoundVote(const proposalId : nat; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaProposalRoundVote"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProposalRoundVote(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* votingRoundVote entrypoint *)
function votingRoundVote(const voteType : votingRoundVoteType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVotingRoundVote"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaVotingRoundVote(voteType);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* executeProposal entrypoint *)
function executeProposal(var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaExecuteProposal"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaExecuteProposal(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* processProposalPayment entrypoint *)
function processProposalPayment(const proposalID: actionIdType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaProcessProposalPayment"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProcessProposalPayment(proposalID);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* processProposalSingleData entrypoint *)
function processProposalSingleData(var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaProcessProposalSingleData"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProcessProposalSingleData(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* dropProposal entrypoint *)
function dropProposal(const proposalId : actionIdType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropProposal"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaDropProposal(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Governance Cycle Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: governanceStorageType): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------

(* main entrypoint *)
function main (const action : governanceAction; const s : governanceStorageType) : return is 

    case action of [

          // Break Glass Entrypoint
        | BreakGlass(_parameters)                     -> breakGlass(s)
        | PropagateBreakGlass(_parameters)            -> propagateBreakGlass(s)
        
          // Housekeeping Entrypoints
        | SetAdmin(parameters)                        -> setAdmin(parameters, s)
        | SetGovernanceProxy(parameters)              -> setGovernanceProxy(parameters, s)
        | UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        | UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        | UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        | UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        | UpdateWhitelistDevelopers(parameters)       -> updateWhitelistDevelopers(parameters, s)
        | MistakenTransfer(parameters)                -> mistakenTransfer(parameters, s)
        | SetContractAdmin(parameters)                -> setContractAdmin(parameters, s)
        | SetContractGovernance(parameters)           -> setContractGovernance(parameters, s)

          // Governance Cycle Entrypoints
        | StartNextRound(parameters)                  -> startNextRound(parameters, s)
        | Propose(parameters)                         -> propose(parameters, s)
        | ProposalRoundVote(parameters)               -> proposalRoundVote(parameters, s)
        | UpdateProposalData(parameters)              -> updateProposalData(parameters, s)
        | UpdatePaymentData(parameters)               -> updatePaymentData(parameters, s)
        | LockProposal(parameters)                    -> lockProposal(parameters, s)
        | VotingRoundVote(parameters)                 -> votingRoundVote(parameters, s)
        | ExecuteProposal(_parameters)                -> executeProposal(s)
        | ProcessProposalPayment(parameters)          -> processProposalPayment(parameters, s)
        | ProcessProposalSingleData(_parameters)      -> processProposalSingleData(s)
        | DropProposal(parameters)                    -> dropProposal(parameters, s)

          // Lambda Entrypoints
        | SetLambda(parameters)                       -> setLambda(parameters, s)

    ]