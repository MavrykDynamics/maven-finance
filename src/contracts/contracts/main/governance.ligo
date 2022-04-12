// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"

// Delegation Type for updateConfig
#include "../partials/types/delegationTypes.ligo"

// Treasury Type for mint and transfers
#include "../partials/types/treasuryTypes.ligo"

// Council Type for financial requests
#include "../partials/types/councilTypes.ligo"

// Governance Type
#include "../partials/types/governanceTypes.ligo"

type governanceAction is 
    | BreakGlass of (unit)
    | SetAdmin of (address)
    
    // Housekeeping
    | UpdateConfig of governanceUpdateConfigParamsType
    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateWhitelistTokenContracts of updateWhitelistTokenContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams
    
    // | StartNextRound of bool
    | Propose of newProposalType
    | ProposalRoundVote of proposalIdType
    | AddUpdateProposalData of addUpdateProposalDataType
    | LockProposal of proposalIdType  
    
    | VotingRoundVote of (voteForProposalChoiceType)
    
    | ExecuteProposal of (unit)
    // | DropProposal of (nat)

    // Governance Lambda
    | CallGovernanceLambdaProxy of executeActionType
    | SetupLambdaFunction of setupLambdaFunctionType

    // Financial Governance
    | RequestTokens of councilActionRequestTokensType
    | RequestMint of councilActionRequestMintType
    | DropFinancialRequest of (nat)
    | VoteForRequest of voteForRequestType

const noOperations : list (operation) = nil;
const maxRoundDuration: nat = 20_160n; // One week with blockTime = 30sec
type return is list (operation) * governanceStorage
type governanceLambdaFunctionType is (executeActionType * governanceStorage) -> return

// admin helper functions begin --
function checkSenderIsAdmin(var s : governanceStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Error. Only the administrator can call this entrypoint.");

function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith("Error. Only the governance contract can call this entrypoint.");

function checkSenderIsAdminOrSelf(var s : governanceStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = Tezos.self_address) then unit
    else failwith("Error. Only the administrator or governance contract can call this entrypoint.");

function checkSenderIsDelegationContract(var s : governanceStorage) : unit is
block{
  const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  ];
  if (Tezos.sender = delegationAddress) then skip
  else failwith("Error. Only the Delegation Contract can call this entrypoint.");
} with unit

function checkSenderIsDoormanContract(var s : governanceStorage) : unit is
block{
  const doormanAddress : address = case s.generalContracts["doorman"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found.")
  ];
  if (Tezos.sender = doormanAddress) then skip
  else failwith("Error. Only the Doorman Contract can call this entrypoint.");
} with unit

function checkSenderIsMvkTokenContract(var s : governanceStorage) : unit is
block{
  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
  else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
} with unit

function checkSenderIsCouncilContract(var s : governanceStorage) : unit is
block{
  const councilAddress : address = case s.generalContracts["council"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Council Contract is not found.")
  ];
  if (Tezos.sender = councilAddress) then skip
  else failwith("Error. Only the Council Contract can call this entrypoint.");
} with unit

function checkSenderIsEmergencyGovernanceContract(var s : governanceStorage) : unit is
block{
  const emergencyGovernanceAddress : address = case s.generalContracts["emergencyGovernance"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Emergency Governance Contract is not found.")
  ];
  if (Tezos.sender = emergencyGovernanceAddress) then skip
  else failwith("Error. Only the Emergency Governance Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("Error. This entrypoint should not receive any tez.");

function restartProposalRoundOperation(const _p : unit) : operation is 
block {
  // restart - another proposal round
  const restartProposalRoundEntrypoint: contract(unit) =
    case (Tezos.get_entrypoint_opt("%startProposalRound", Tezos.self_address) : option(contract(unit))) of [
      Some(contr) -> contr
    | None -> (failwith("Error. StartProposalRound entrypoint not found in Governance contract."): contract(unit))
  ];

  const restartProposalRoundOperation : operation = Tezos.transaction(
      unit, 
      0tez, 
      restartProposalRoundEntrypoint
  );
} with restartProposalRoundOperation

// admin helper functions end --

// helper functions begin: --

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: governanceStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  } with (noOperations, s)

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: governanceStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)

// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: governanceStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
  } with (noOperations, s)

// Governance Lambda Methods: callGovernanceLambda, setupLambdaFunction
#include "../partials/governance/governanceLambdaMethods.ligo"

// Governance Lambdas: e.g. updateGovernanceConfig, updateDelegationConfig
#include "../partials/governance/governanceLambdas.ligo"

function updateConfig(const updateConfigParams : governanceUpdateConfigParamsType; var s : governanceStorage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdminOrSelf(s); // check that sender is admin

  const updateConfigAction    : governanceUpdateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : governanceUpdateConfigNewValueType           = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of [
    ConfigSuccessReward (_v)              -> {
        // set boundary - do for the rest
        s.config.successReward              := updateConfigNewValue
      }
  | ConfigMinProposalRoundVotePct (_v)                -> if updateConfigNewValue > 10_000n then failwith("Error. This config value cannot exceed 100%") else s.config.minProposalRoundVotePercentage := updateConfigNewValue
  | ConfigMinProposalRoundVotesReq (_v)               -> s.config.minProposalRoundVotesRequired           := updateConfigNewValue
  | ConfigMinQuorumPercentage (_v)                    -> if updateConfigNewValue > 10_000n then failwith("Error. This config value cannot exceed 100%") else s.config.minQuorumPercentage                     := updateConfigNewValue
  | ConfigMinQuorumMvkTotal (_v)                      -> s.config.minQuorumMvkTotal                       := updateConfigNewValue
  | ConfigVotingPowerRatio (_v)                       -> if updateConfigNewValue > 10_000n then failwith("Error. This config value cannot exceed 100%") else s.config.votingPowerRatio                        := updateConfigNewValue
  | ConfigProposalSubmissionFee (_v)                  -> s.config.proposalSubmissionFee                   := updateConfigNewValue
  | ConfigMinimumStakeReqPercentage (_v)              -> if updateConfigNewValue > 10_000n then failwith("Error. This config value cannot exceed 100%") else s.config.minimumStakeReqPercentage               := updateConfigNewValue
  | ConfigMaxProposalsPerDelegate (_v)                -> s.config.maxProposalsPerDelegate                 := updateConfigNewValue
  | ConfigBlocksPerProposalRound (_v)                 -> if updateConfigNewValue > (Tezos.level + maxRoundDuration) then failwith("Error. The duration of this round cannot exceed the maximum round duration") else s.config.blocksPerProposalRound                  := updateConfigNewValue
  | ConfigBlocksPerVotingRound (_v)                   -> if updateConfigNewValue > (Tezos.level + maxRoundDuration) then failwith("Error. The duration of this round cannot exceed the maximum round duration") else s.config.blocksPerVotingRound                    := updateConfigNewValue
  | ConfigBlocksPerTimelockRound (_v)                 -> if updateConfigNewValue > (Tezos.level + maxRoundDuration) then failwith("Error. The duration of this round cannot exceed the maximum round duration") else s.config.blocksPerTimelockRound                  := updateConfigNewValue
  | ConfigFinancialReqApprovalPct (_v)                -> if updateConfigNewValue > 10_000n then failwith("Error. This config value cannot exceed 100%") else s.config.financialRequestApprovalPercentage      := updateConfigNewValue
  | ConfigFinancialReqDurationDays (_v)               -> s.config.financialRequestDurationInDays          := updateConfigNewValue
  ];

} with (noOperations, s)


// helper function to send operation to governance lambda
function sendOperationToGovernanceLambda(const _p : unit) : contract(executeActionType) is
  case (Tezos.get_entrypoint_opt(
      "%callGovernanceLambdaProxy",
      Tezos.self_address) : option(contract(executeActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("callGovernanceLambdaProxy entrypoint in Governance Contract not found") : contract(executeActionType))
  ];

// helper function to get satellite snapshot 
function getSatelliteSnapshotRecord (const satelliteAddress : address; const s : governanceStorage) : snapshotRecordType is
  block {
    var satelliteSnapshotRecord : snapshotRecordType :=
      record [
        totalMvkBalance         = 0n;                            // log of satellite's total mvk balance for this cycle
        totalDelegatedAmount    = 0n;                            // log of satellite's total delegated amount 
        totalVotingPower        = 0n;                            // calculated total voting power based on votingPowerRatio (i.e. self bond percentage)   
        currentCycleStartLevel  = s.currentRoundStartLevel;      // log of current cycle's starting block level
        currentCycleEndLevel    = s.currentCycleEndLevel         // log of when cycle (proposal + voting) will end
      ];

    case s.snapshotLedger[satelliteAddress] of [
      None -> skip
    | Some(instance) -> satelliteSnapshotRecord := instance
    ];

  } with satelliteSnapshotRecord

// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. Transfer entrypoint in Treasury Contract not found") : contract(transferActionType))
  ];

// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
  case (Tezos.get_entrypoint_opt(
      "%mintMvkAndTransfer",
      contractAddress) : option(contract(mintMvkAndTransferType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. MintMvkAndTransfer entrypoint in Treasury Contract not found") : contract(mintMvkAndTransferType))
  ];

  function setProposalRecordVote(const voteType : voteForProposalChoiceType; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is
  block {

        case voteType of [
          Yay -> block {
            _proposal.upvoteCount := _proposal.upvoteCount + 1n;    
            _proposal.upvoteMvkTotal := _proposal.upvoteMvkTotal + totalVotingPower;
            _proposal.quorumMvkTotal := _proposal.quorumMvkTotal + totalVotingPower;
          }
        | Nay -> block {
            _proposal.downvoteCount := _proposal.downvoteCount + 1n;    
            _proposal.downvoteMvkTotal := _proposal.downvoteMvkTotal + totalVotingPower;
        }
        | Abstain -> block {
          _proposal.abstainCount := _proposal.abstainCount + 1n;    
          _proposal.abstainMvkTotal := _proposal.abstainMvkTotal + totalVotingPower;
        }
        ];

        _proposal.quorumCount := _proposal.quorumCount + 1n;

  } with _proposal

  function unsetProposalRecordVote(const voteType : voteForProposalChoiceType; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is 
  block {
        case voteType of [
          Yay -> block {
            var upvoteCount     : nat := 0n;
            var upvoteMvkTotal  : nat := 0n;
            var quorumMvkTotal  : nat := 0n;

            if _proposal.upvoteCount < 1n then upvoteCount := 0n
              else upvoteCount := abs(_proposal.upvoteCount - 1n);

            if _proposal.upvoteMvkTotal < totalVotingPower then upvoteMvkTotal := 0n
              else upvoteMvkTotal := abs(_proposal.upvoteMvkTotal - totalVotingPower);

            if _proposal.quorumMvkTotal < totalVotingPower then quorumMvkTotal := 0n
              else quorumMvkTotal := abs(_proposal.quorumMvkTotal - totalVotingPower);              

            _proposal.upvoteCount    := upvoteCount;
            _proposal.upvoteMvkTotal := upvoteMvkTotal;
            _proposal.quorumMvkTotal := quorumMvkTotal;
          }
        | Nay -> block {
            var downvoteCount     : nat := 0n;
            var downvoteMvkTotal  : nat := 0n;

            if _proposal.downvoteCount < 1n then downvoteCount := 0n
              else downvoteCount := abs(_proposal.downvoteCount - 1n);

            if _proposal.downvoteMvkTotal < totalVotingPower then downvoteMvkTotal := 0n
              else downvoteMvkTotal := abs(_proposal.downvoteMvkTotal - totalVotingPower);

            _proposal.downvoteCount     := downvoteCount;
            _proposal.downvoteMvkTotal  := downvoteMvkTotal;
        }
        | Abstain -> block {
            var abstainCount : nat := 0n;
            var abstainMvkTotal : nat := 0n;

            if _proposal.abstainCount < 1n then abstainCount := 0n
              else abstainCount := abs(_proposal.abstainCount - 1n);

            if _proposal.abstainMvkTotal < totalVotingPower then abstainMvkTotal := 0n
              else abstainMvkTotal := abs(_proposal.abstainMvkTotal - totalVotingPower);

            _proposal.abstainCount      := abstainCount;
            _proposal.abstainMvkTotal   := abstainMvkTotal;
        }
        ];
  } with _proposal

// housekeeping functions begin: --

(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : governanceStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)

// housekeeping functions end: --

function breakGlass(var s : governanceStorage) : return is 
block {
    // Steps Overview:
    // 1. set admin to breakglass address in major contracts (doorman, delegation etc)
    // 2. send pause all operations to main contracts

    // check that sender is from emergency governance contract 
    checkSenderIsEmergencyGovernanceContract(s);

    const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Break Glass Contract is not found")
    ];

    var operations : list(operation) := nil;

    // Set self admin to breakGlass
    s.admin := _breakGlassAddress;

    for _contractName -> contractAddress in map s.generalContracts block {
        
        // 1. first, trigger pauseAll entrypoint in contract 
        // 2. second, trigger setAdmin entrypoint in contract to change admin to break glass contract

        case (Tezos.get_entrypoint_opt("%setAdmin", contractAddress) : option(contract(address))) of [
          Some(contr) -> operations := Tezos.transaction(_breakGlassAddress, 0tez, contr) # operations
        | None -> skip
        ];
        
        case (Tezos.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
          Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
        | None -> skip
        ];
    } 
    
} with (operations, s)

function setupProposalRound(var s: governanceStorage): governanceStorage is
  block {
    // reset state variables
    var emptyProposalMap  : map(nat, nat)           := map [];
    var emptyVotesMap     : map(address, nat)       := map [];
    var emptyProposerMap  : map(address, set(nat))  := map [];

    s.currentRound                         := (Proposal : roundType);
    s.currentBlocksPerProposalRound        := s.config.blocksPerProposalRound;
    s.currentBlocksPerVotingRound          := s.config.blocksPerVotingRound;
    s.currentBlocksPerTimelockRound        := s.config.blocksPerTimelockRound;
    s.currentRoundStartLevel               := Tezos.level;
    s.currentRoundEndLevel                 := Tezos.level + s.config.blocksPerProposalRound;
    s.currentCycleEndLevel                 := Tezos.level + s.config.blocksPerProposalRound + s.config.blocksPerVotingRound + s.config.blocksPerTimelockRound;
    s.currentRoundProposals                := emptyProposalMap;    // flush proposals
    s.currentRoundProposers                := emptyProposerMap;    // flush proposals
    s.currentRoundVotes                    := emptyVotesMap;       // flush voters
    s.currentRoundHighestVotedProposalId   := 0n;                  // flush proposal id voted through - reset to 0 

    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    ];

    // update snapshot MVK total supply
    const mvkTotalSupplyView : option (nat) = Tezos.call_view ("getTotalSupply", unit, s.mvkTokenAddress);
    s.snapshotMvkTotalSupply := case mvkTotalSupplyView of [
      Some (value) -> value
    | None -> (failwith ("Error. GetTotalSupply View not found in the MVK Token Contract") : nat)
    ];

    // Get active satellites from the delegation contract and loop through them
    const activeSatellitesView : option (map(address,satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
    const activeSatellites: map(address,satelliteRecordType) = case activeSatellitesView of [
      Some (value) -> value
    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
    ];

    for satelliteAddress -> satellite in map activeSatellites block {

      const mvkBalance: nat = satellite.stakedMvkBalance;
      const totalDelegatedAmount: nat = satellite.totalDelegatedAmount;

      // create or retrieve satellite snapshot from snapshotLedger in governanceStorage
      var satelliteSnapshotRecord : snapshotRecordType := getSatelliteSnapshotRecord(satelliteAddress, s);

      // calculate total voting power 
      const maxTotalVotingPower = abs(mvkBalance * 10000 / s.config.votingPowerRatio);
      const mvkBalanceAndTotalDelegatedAmount = mvkBalance + totalDelegatedAmount; 
      var totalVotingPower : nat := 0n;
      if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
        else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

      // update satellite snapshot record
      satelliteSnapshotRecord.totalMvkBalance         := mvkBalance; 
      satelliteSnapshotRecord.totalDelegatedAmount    := totalDelegatedAmount; 
      satelliteSnapshotRecord.totalVotingPower        := totalVotingPower;
      satelliteSnapshotRecord.currentCycleStartLevel  := s.currentRoundStartLevel; 
      satelliteSnapshotRecord.currentCycleEndLevel    := s.currentCycleEndLevel; 

      s.snapshotLedger[satelliteAddress] := satelliteSnapshotRecord;
    }
  } with (s)

function setupVotingRound(const highestVotedProposalId: nat; var s: governanceStorage): governanceStorage is
  block {
    // boundaries fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentRound               := (Voting : roundType);
    s.currentRoundStartLevel     := s.currentRoundEndLevel + 1n;
    s.currentRoundEndLevel       := s.currentRoundEndLevel + s.currentBlocksPerVotingRound;

    s.timelockProposalId         := 0n;                  // flush proposal id in timelock - reset to 0

    // set the current round highest voted proposal id
    s.currentRoundHighestVotedProposalId := highestVotedProposalId;

    // flush current round votes - to prepare for voting round
    const emptyCurrentRoundVotes : map(address, nat) = map[];
    s.currentRoundVotes := emptyCurrentRoundVotes;
  } with (s)

function setupTimelockRound(var s: governanceStorage): governanceStorage is
  block {
    // boundaries remain fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentRound               := (Timelock : roundType);
    s.currentRoundStartLevel     := s.currentRoundEndLevel + 1n;
    s.currentRoundEndLevel       := s.currentCycleEndLevel;

    // set timelockProposalId to currentRoundHighestVotedProposalId
    s.timelockProposalId         := s.currentRoundHighestVotedProposalId;
  } with (s)

function startNextRound(const executePastProposal: bool; var s : governanceStorage) : return is
block {
  // Current round is not ended
  if Tezos.level < s.currentRoundEndLevel
  then failwith("Error. The current round has not ended yet.") 
  else skip;

  // Get current variables
  const currentRoundHighestVotedProposal: option(proposalRecordType) = Big_map.find_opt(s.currentRoundHighestVotedProposalId, s.proposalLedger);
  var _highestVoteCounter     : nat := 0n;
  var highestVotedProposalId  : nat := 0n;
  for proposalId -> voteCount in map s.currentRoundProposals block {
      if voteCount > _highestVoteCounter then block {
          _highestVoteCounter := voteCount;
          highestVotedProposalId := proposalId; 
      } else skip;
  };
  const proposalRoundProposal: option(proposalRecordType) = Big_map.find_opt(highestVotedProposalId, s.proposalLedger);

  // Execute past proposal if parameter set to true
  var operations: list(operation) := nil;

  // Switch depending on current round
  case s.currentRound of [
    Proposal -> case proposalRoundProposal of [
      Some (proposal) -> if highestVotedProposalId =/= 0n and proposal.passVoteMvkTotal >= proposal.minProposalRoundVotesRequired then
        // Start voting
        s := setupVotingRound(highestVotedProposalId, s)
      else
        // Start proposal
        s := setupProposalRound(s)
    | None -> s := setupProposalRound(s) //failwith("Error. Highest voted proposal not found.")
    ]
  | Voting -> case currentRoundHighestVotedProposal of [
      Some (proposal) -> block{
        if proposal.upvoteMvkTotal < proposal.minQuorumMvkTotal then {
          // Start proposal
          s := setupProposalRound(s);
        } else block {
          // Start timelock
          s := setupTimelockRound(s);
        };
      }
    | None -> failwith("Error. Current proposal not found.")
    ]
  | Timelock -> block {
      // Start proposal
      s := setupProposalRound(s);
      if s.timelockProposalId =/= 0n and executePastProposal then operations := Tezos.transaction((unit), 0tez, (Tezos.self("%executeProposal"): contract(unit))) # operations else skip;
    }
  ];
} with (operations, s)

(* Propose Entrypoint *)
function propose(const newProposal : newProposalType ; var s : governanceStorage) : return is 
block {
    // Steps Overview:
    // 1. verify that the current round is a governance proposal round
    // 2. verify that current block level has not exceeded round's end level 
    // 3. verify that user is a satellite, has sufficient staked MVK to propose (data taken from snapshot of all active satellite holdings at start of governance round)
    // 4. todo: check that proposer has sent enough tez to cover the submission fee
    // 5. submit (save) proposal - note: proposer does not automatically vote pass for his proposal
    // 6. add proposal id to current round proposals map

    if s.currentRound = (Proposal : roundType) then skip
        else failwith("Error. You can only make a proposal during a proposal round.");

    // if Tezos.level > s.currentRoundEndLevel then failwith("Current proposal round has ended.")
    //   else skip;

    // check if satellite exists in the active satellites map
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    ];
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
    case satelliteOptView of [
      Some (value) -> case value of [
          Some (_satellite) -> skip
        | None -> failwith("Error. You need to be a satellite to make a governance proposal.")
      ]
    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
    ];

    const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of [
        None -> failwith("Error. Snapshot of your holdings not taken. Please wait for the next governance round.")
        | Some(snapshot) -> snapshot
    ];

    // minimumStakeReqPercentage - 5% -> 500 | snapshotMvkTotalSupply - mu 
    const minimumMvkRequiredForProposalSubmission = s.config.minimumStakeReqPercentage * s.snapshotMvkTotalSupply / 10_000;

    if satelliteSnapshot.totalMvkBalance < abs(minimumMvkRequiredForProposalSubmission) then failwith("You do not have the minimum MVK required to submit a proposal.")
      else skip; 

    const emptyPassVotersMap  : passVotersMapType     = map [];
    const emptyVotersMap      : votersMapType         = map [];
    const proposalMetadata    : proposalMetadataType  = map [];

    var proposerProposals   : set(nat)             := case s.currentRoundProposers[Tezos.sender] of [
      Some (_proposals) -> _proposals
    | None -> Set.empty
    ];

    if Set.cardinal(proposerProposals) < s.config.maxProposalsPerDelegate then skip
      else failwith("Error. You cannot propose during this cycle anymore");

    var newProposalRecord : proposalRecordType := record [
        proposerAddress         = Tezos.sender;
        proposalMetadata        = proposalMetadata;

        status                  = "ACTIVE";                        // status: "ACTIVE", "DROPPED"
        title                   = newProposal.title;               // title
        description             = newProposal.description;         // description
        invoice                 = newProposal.invoice;             // ipfs hash of invoice file
        sourceCode              = newProposal.sourceCode;

        successReward           = s.config.successReward;          // log of successful proposal reward for voters - may change over time
        executed                = False;                           // boolean: executed set to true if proposal is executed
        locked                  = False;                           // boolean: locked set to true after proposer has included necessary metadata and proceed to lock proposal
        
        passVoteCount           = 0n;                              // proposal round: pass votes count (to proceed to voting round)
        passVoteMvkTotal        = 0n;                              // proposal round pass vote total mvk from satellites who voted pass
        passVotersMap           = emptyPassVotersMap;              // proposal round ledger

        minProposalRoundVotePercentage  = s.config.minProposalRoundVotePercentage;   // min vote percentage of total MVK supply required to pass proposal round
        minProposalRoundVotesRequired   = s.config.minProposalRoundVotesRequired;    // min staked MVK votes required for proposal round to pass

        upvoteCount             = 0n;                              // voting round: upvotes count
        upvoteMvkTotal          = 0n;                              // voting round: upvotes MVK total 
        downvoteCount           = 0n;                              // voting round: downvotes count
        downvoteMvkTotal        = 0n;                              // voting round: downvotes MVK total 
        abstainCount            = 0n;                              // voting round: abstain count
        abstainMvkTotal         = 0n;                              // voting round: abstain MVK total 
        voters                  = emptyVotersMap;                  // voting round ledger

        minQuorumPercentage     = s.config.minQuorumPercentage;    // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
        minQuorumMvkTotal       = s.config.minQuorumMvkTotal;      // log of min quorum in MVK - capture state at this point     
        quorumCount             = 0n;                              // log of turnout for voting round - number of satellites who voted
        quorumMvkTotal          = 0n;                              // log of total positive votes in MVK  
        startDateTime           = Tezos.now;                       // log of when the proposal was proposed

        cycle                   = s.cycleCounter;
        currentCycleStartLevel  = s.currentRoundStartLevel;        // log current round/cycle start level
        currentCycleEndLevel    = s.currentCycleEndLevel;          // log current cycle end level
    ];

    // save proposal to proposalLedger
    s.proposalLedger[s.nextProposalId] := newProposalRecord;

    // save proposer proposals
    proposerProposals                     := Set.add(s.nextProposalId, proposerProposals);
    s.currentRoundProposers[Tezos.sender] := proposerProposals;

    // Add data on creation
    var operations: list(operation) := nil;
    case newProposal.metadata of [
      Some (_metadataMap) -> block{
        for name -> data in map _metadataMap block {
          const addUpdateProposalData : contract(addUpdateProposalDataType) = Tezos.self("%addUpdateProposalData");
          operations := Tezos.transaction(
            (s.nextProposalId, name, data),
            0tez, 
            addUpdateProposalData
          ) # operations;
        }
      }
    | None -> skip
    ];

    // add proposal id to current round proposals and initialise with zero positive votes in MVK 
    s.currentRoundProposals[s.nextProposalId] := 0n;

    // increment next proposal id
    s.nextProposalId := s.nextProposalId + 1n;

} with (operations, s)

(* AddUpdateProposalData Entrypoint *)
// type addUpdateProposalDataType is (nat * string * bytes) // proposal id, proposal metadata title or description, proposal metadata in bytes
function addUpdateProposalData(const proposalData : addUpdateProposalDataType; var s : governanceStorage) : return is 
block {

    if s.currentRound = (Proposal : roundType) then skip
        else failwith("Error. You can only add or update proposal data during a proposal round.");

    const proposalId     : nat     = proposalData.0;
    const proposalTitle  : string  = proposalData.1;
    const proposalBytes  : bytes   = proposalData.2;

    var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of [ 
        Some(_record) -> _record
      | None -> failwith("Error. Proposal not found.")
    ];

    // check that proposal is not locked
    if proposalRecord.locked = True then failwith("Error. Proposal is locked.")
      else skip;

    // check that sender is the creator of the proposal 
    if proposalRecord.proposerAddress =/= Tezos.source then failwith("Error. Only the proposer can add or update data.")
      else skip;

    // Add or update data to proposal
    proposalRecord.proposalMetadata[proposalTitle] := proposalBytes; 

    // save changes and update proposal ledger
    s.proposalLedger[proposalId] := proposalRecord;

} with (noOperations, s)


function lockProposal(const proposalId : nat; var s : governanceStorage) : return is 
block {

  if s.currentRound = (Proposal : roundType) then skip
      else failwith("Error. You can only lock a proposal during a proposal round.");

  var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of [ 
      Some(_record) -> _record
    | None -> failwith("Error. Proposal not found.")
  ];

  // check that sender is the creator of the proposal 
  if proposalRecord.proposerAddress =/= Tezos.sender then failwith("Error. Only the proposer can add or update data.")
    else skip;

  // check that proposal is not locked
  if proposalRecord.locked = True then failwith("Error. Proposal is already locked.")
      else skip;

  proposalRecord.locked        := True; 
  s.proposalLedger[proposalId] := proposalRecord;

} with (noOperations, s)

(* ProposalRoundVote Entrypoint *)
function proposalRoundVote(const proposalId : nat; var s : governanceStorage) : return is 
block {
    // Steps Overview:
    // 1. verify that current round is a proposal round
    // 2. verify that user is an active satellite and is allowed to vote (address is a satellite)
    // 3. verify that proposal is active and has not been dropped
    // 4. verify that snapshot of satellite has been taken
    // 5. verify that proposal exists
    // 6a. if satellite has not voted in the current round, submit satellite's vote for proposal and update vote counts
    // 6b. if satellite has voted for another proposal in the current round, submit satellite's vote for new proposal and remove satellite's vote from previously voted proposal

    if s.currentRound = (Proposal : roundType) then skip
      else failwith("You can only make a proposal during a proposal round.");
    
    // check if satellite exists in the active satellites map
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    ];
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
    case satelliteOptView of [
      Some (value) -> case value of [
          Some (_satellite) -> skip
        | None -> failwith("Error. You need to be a satellite to vote for a governance proposal.")
      ]
    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
    ];

    const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of [
        None -> failwith("Error. Snapshot of your holdings not taken. Please wait for the next governance round.")
        | Some(snapshot) -> snapshot
    ];

    // check if proposal exists in the current round's proposals
    const checkProposalExistsFlag : bool = Map.mem(proposalId, s.currentRoundProposals);
    if checkProposalExistsFlag = False then failwith("Error: Proposal not found.")
      else skip;

    var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
        Some(_proposal) -> _proposal
        | None -> failwith("Error: Proposal not found")
    ];

    // verify that proposal is active and has not been dropped
    if _proposal.status = "DROPPED" then failwith("Proposal has been dropped")
      else skip;

    // check that proposal is locked
    if _proposal.locked = False then failwith("Error. Proposal needs to be locked before it can be voted on.")
      else skip;

    const checkIfSatelliteHasVotedFlag : bool = Map.mem(Tezos.sender, s.currentRoundVotes);
    if checkIfSatelliteHasVotedFlag = False then block {
       
        // satellite has not voted for other proposals

        const newPassVoteMvkTotal : nat = _proposal.passVoteMvkTotal + satelliteSnapshot.totalVotingPower;

        _proposal.passVoteCount               := _proposal.passVoteCount + 1n;    
        _proposal.passVoteMvkTotal            := newPassVoteMvkTotal;
        _proposal.passVotersMap[Tezos.sender] := (satelliteSnapshot.totalVotingPower, Tezos.now);
        
        // update proposal with new vote
        s.proposalLedger[proposalId] := _proposal;

        // update current round votes with satellite's address -> proposal id
        s.currentRoundVotes[Tezos.sender] := proposalId;

        // increment proposal with satellite snapshot's total voting power
        s.currentRoundProposals[proposalId] := newPassVoteMvkTotal;

    } else block {
        
        // satellite has voted for another proposal

        const newPassVoteMvkTotal : nat = _proposal.passVoteMvkTotal + satelliteSnapshot.totalVotingPower;

        _proposal.passVoteCount               := _proposal.passVoteCount + 1n;
        _proposal.passVoteMvkTotal            := newPassVoteMvkTotal;
        _proposal.passVotersMap[Tezos.sender] := (satelliteSnapshot.totalVotingPower, Tezos.now);

        // update previous prospoal begin -----------------
        const previousVotedProposalId : nat = case s.currentRoundVotes[Tezos.sender] of [
            Some(_id) -> _id
            | None -> failwith("Error: Previously voted proposal not found.")
        ];

        var _previousProposal : proposalRecordType := case s.proposalLedger[previousVotedProposalId] of [
            Some(_previousProposal) -> _previousProposal
            | None -> failwith("Error: Previous proposal not found")
        ];

        var previousProposalPassVoteCount : nat := _previousProposal.passVoteCount;
        _previousProposal.passVoteCount := abs(previousProposalPassVoteCount - 1n) ;

        // decrement previously voted on proposal by amount of satellite's total voting power - conditionals to check that min will never go below 0
        var previousProposalPassVoteMvkTotal : nat := _previousProposal.passVoteMvkTotal;
        if satelliteSnapshot.totalVotingPower > previousProposalPassVoteMvkTotal then previousProposalPassVoteMvkTotal := 0n 
          else previousProposalPassVoteMvkTotal := abs(previousProposalPassVoteMvkTotal - satelliteSnapshot.totalVotingPower); 
        _previousProposal.passVoteMvkTotal := previousProposalPassVoteMvkTotal;

        // remove user from previous proposal that he voted on, decrement previously voted proposal by satellite snapshot's total voting power
        remove Tezos.sender from map _previousProposal.passVotersMap;        
        s.currentRoundProposals[previousVotedProposalId] := previousProposalPassVoteMvkTotal;
        // -------- update previous prospoal end ---------
    
        // update proposal with new vote, increment proposal with satellite snapshot's total voting power
        s.proposalLedger[proposalId] := _proposal;
        s.proposalLedger[previousVotedProposalId] := _previousProposal;

        // increment proposal with satellite snapshot's total voting power
        s.currentRoundProposals[proposalId] := newPassVoteMvkTotal;

        // update current round votes with satellite's address -> new proposal id
        s.currentRoundVotes[Tezos.sender] := proposalId;    
    } 

} with (noOperations, s)

// (* VotingRoundVote Entrypoint *)
function votingRoundVote(const voteType : voteForProposalChoiceType; var s : governanceStorage) : return is 
block {
    // Steps Overview:
    // 1. verify that round is a voting round
    // 2. verify that user is a satellite, and is allowed to vote for the current voting round with his snapshot taken
    // 3. verify that proposal exists, proposal is active and has not been dropped
    // 4. submit satellite's vote for proposal and update vote counts
    
    if s.currentRound = (Voting : roundType) then skip
        else failwith("Error. You can only vote during the voting round.");

    if s.currentRoundHighestVotedProposalId = 0n then failwith("Error: No proposal to vote for. Please wait for the next proposal round to begin.")
      else skip; 

    // if Tezos.level > s.currentRoundEndLevel then failwith("Current voting round has ended.")
    //   else skip;

    // check if satellite exists in the active satellites map
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    ];
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
    case satelliteOptView of [
      Some (value) -> case value of [
          Some (_satellite) -> skip
        | None -> failwith("Error. You need to be a satellite to vote for a governance proposal.")
      ]
    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
    ];

    const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of [
        None -> failwith("Error. Snapshot of your holdings not taken. Please wait for the next governance round.")
        | Some(snapshot) -> snapshot
    ];

    // check if proposal exists in the current round's proposals
    const checkProposalExistsFlag : bool = Map.mem(s.currentRoundHighestVotedProposalId, s.currentRoundProposals);
    if checkProposalExistsFlag = False then failwith("Error: Proposal not found in the current round.")
      else skip;

    var _proposal : proposalRecordType := case s.proposalLedger[s.currentRoundHighestVotedProposalId] of [
        None -> failwith("Error: Proposal not found in the proposal ledger.")
        | Some(_proposal) -> _proposal        
    ];

    // verify that proposal is active and has not been dropped
    if _proposal.status = "DROPPED" then failwith("Error: Proposal has been dropped.")
      else skip;

    // note: currentRoundVotes change in the use of nat from proposal round (from proposal id to vote type)
    //  i.e. (satelliteAddress, voteType - Yay | Nay | Abstain)
    const checkIfSatelliteHasVotedFlag : bool = Map.mem(Tezos.sender, s.currentRoundVotes);
    if checkIfSatelliteHasVotedFlag = False then block {
        // satellite has not voted - add new vote
        
        _proposal.voters[Tezos.sender] := (satelliteSnapshot.totalVotingPower, Tezos.now, voteType);

        // set proposal record based on vote type 
        var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);
        
        // update proposal with new vote changes
        s.proposalLedger[s.currentRoundHighestVotedProposalId] := _proposal;

    } else block {
        // satellite has already voted - change of vote
        
        // get previous vote
        var previousVote : (nat * timestamp * voteForProposalChoiceType) := case _proposal.voters[Tezos.sender] of [ 
            | None -> failwith("Error: Previous vote not found.")
            | Some(_previousVote) -> _previousVote
        ];

        const previousVoteType = previousVote.2;

        // check if new vote is the same as old vote
        if previousVoteType = voteType then failwith ("Error: Your vote has already been recorded.")
          else skip;

        // save new vote
        _proposal.voters[Tezos.sender] := (satelliteSnapshot.totalVotingPower, Tezos.now, voteType);

        // set proposal record based on vote type 
        var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);

        // unset previous vote in proposal record
        var _proposal : proposalRecordType := unsetProposalRecordVote(previousVoteType, satelliteSnapshot.totalVotingPower, _proposal);
        
        // update proposal with new vote changes
        s.proposalLedger[s.currentRoundHighestVotedProposalId] := _proposal;
        
    }

} with (noOperations, s)

(* ExecuteProposal Entrypoint *)
function executeProposal(var s : governanceStorage) : return is 
block {
    // Steps Overview: 
    // 1. verify that user is a satellite and can execute proposal
    // 2. verify that proposal can be executed
    // 3. execute proposal - list of operations to run

    // check that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
    if (s.currentRound = (Timelock : roundType) and Tezos.sender =/= Tezos.self_address) or s.currentRound = (Voting : roundType) then failwith("Error. Proposal can only be executed after timelock period ends if executed manually.")
      else skip;

    // check that there is a highest voted proposal in the current round
    if s.timelockProposalId = 0n then failwith("Error: No proposal to execute. Please wait for the next proposal round to begin.")
      else skip;

    var proposal : proposalRecordType := case s.proposalLedger[s.timelockProposalId] of [
        Some(_record) -> _record
      | None -> failwith("Error. Proposal not found.")
    ];

    if proposal.executed = True then failwith("Error. Proposal has already been executed")
      else skip;

    // verify that proposal is active and has not been dropped
    if proposal.status = "DROPPED" then failwith("Error: Proposal has been dropped.")
      else skip;

    // check that there is at least one proposal metadata to execute
    if Map.size(proposal.proposalMetadata) = 0n then failwith("Error. No data to execute.")
      else skip;

    var operations : list(operation) := nil;

    // update proposal executed boolean to True
    proposal.executed            := True;
    s.proposalLedger[s.timelockProposalId] := proposal;    

    // loop metadata for execution
    for _title -> metadataBytes in map proposal.proposalMetadata block {

      const executeAction : executeActionType = case (Bytes.unpack(metadataBytes) : option(executeActionType)) of [
        | Some(_action) -> _action
        | None    -> failwith("Error. Unable to unpack proposal metadata.")
      ];

      const sendActionToGovernanceLambdaOperation : operation = Tezos.transaction(
        executeAction,
        0tez,
        sendOperationToGovernanceLambda(unit)
      );

      operations := sendActionToGovernanceLambdaOperation # operations;
    
    }     

} with (operations, s)

(* DropProposal Entrypoint *)
function dropProposal(const proposalId : nat; var s : governanceStorage) : return is 
block {
    // Steps Overview: 
    // 1. verify that proposal is in the current round / cycle
    // 2. verify that satellite made the proposal
    // 3. change status of proposal to inactive

    // check if satellite exists in the active satellites map
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    ];
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
    case satelliteOptView of [
      Some (value) -> case value of [
          Some (_satellite) -> skip
        | None -> failwith("Error. You need to be a satellite to drop a governance proposal.")
      ]
    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
    ];

    // check if proposal exists in the current round's proposals
    const checkProposalExistsFlag : bool = Map.mem(proposalId, s.currentRoundProposals);
    if checkProposalExistsFlag = False then failwith("Error: Proposal not found in the current round.")
      else skip;

    var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
        None -> failwith("Error: Proposal not found in the proposal ledger.")
        | Some(_proposal) -> _proposal        
    ];

    // verify that proposal has not been dropped already
    if _proposal.status = "DROPPED" then failwith("Error: Proposal has already been dropped.")
      else skip;

    if _proposal.proposerAddress = Tezos.sender then block {
        _proposal.status               := "DROPPED";
        s.proposalLedger[proposalId]   := _proposal;

        // If timelock or voting round, restart the cycle
        if s.currentRound = (Voting : roundType) or s.currentRound = (Timelock : roundType) 
          then s := setupProposalRound(s) else skip;
    } else failwith("Error: You are not allowed to drop this proposal.")
    
} with (noOperations, s)

function requestSatelliteSnapshot(const satelliteSnapshot : requestSatelliteSnapshotType; var s : governanceStorage) : governanceStorage is 
block {
    // init variables
    const financialRequestId    : nat     = satelliteSnapshot.requestId;
    const satelliteAddress      : address = satelliteSnapshot.satelliteAddress;
    const stakedMvkBalance      : nat     = satelliteSnapshot.stakedMvkBalance; 
    const totalDelegatedAmount  : nat     = satelliteSnapshot.totalDelegatedAmount; 

    const maxTotalVotingPower = abs(stakedMvkBalance * 10000 / s.config.votingPowerRatio);
    const mvkBalanceAndTotalDelegatedAmount = stakedMvkBalance + totalDelegatedAmount; 
    var totalVotingPower : nat := 0n;
    if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
      else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

    var satelliteSnapshotRecord : financialRequestSnapshotRecordType := record [
        totalMvkBalance         = stakedMvkBalance; 
        totalDelegatedAmount    = totalDelegatedAmount; 
        totalVotingPower        = totalVotingPower;
      ];
    
    var financialRequestSnapshot : financialRequestSnapshotMapType := case s.financialRequestSnapshotLedger[financialRequestId] of [ 
        None -> failwith("Error. Financial request snapshot not found.")
      | Some(snapshot) -> snapshot
    ];

    // update financal request snapshot map with record of satellite's total voting power
    financialRequestSnapshot[satelliteAddress]           := satelliteSnapshotRecord;

    // update financial request snapshot ledger bigmap with updated satellite's details
    s.financialRequestSnapshotLedger[financialRequestId] := financialRequestSnapshot;

} with (s)

function requestTokens(const requestTokensParams : councilActionRequestTokensType; var s : governanceStorage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];

  const doormanAddress : address = case s.generalContracts["doorman"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Doorman Contract is not found")
  ];
  const delegationAddress : address = case s.generalContracts["delegation"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Delegation Contract is not found")
  ];

  const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getTotalStakedSupply", unit, doormanAddress);
  s.snapshotStakedMvkTotalSupply := case stakedMvkBalanceView of [
    Some (value) -> value
  | None -> (failwith ("Error. GetTotalStakedSupply View not found in the Doorman Contract") : nat)
  ];

  const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

  if requestTokensParams.tokenType = "FA12" or requestTokensParams.tokenType = "FA2" or requestTokensParams.tokenType = "TEZ" then skip
    else failwith("Error. Provided tokenType is invalid. Can only be TEZ/FA12/FA2");

  var newFinancialRequest : financialRequestRecordType := record [
    requesterAddress     = Tezos.sender;
    requestType          = "TRANSFER";
    status               = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
    executed             = False;

    treasuryAddress      = requestTokensParams.treasuryAddress;
    tokenContractAddress = requestTokensParams.tokenContractAddress;
    tokenAmount          = requestTokensParams.tokenAmount;
    tokenName            = requestTokensParams.tokenName; 
    tokenType            = requestTokensParams.tokenType;
    tokenId              = requestTokensParams.tokenId;
    requestPurpose       = requestTokensParams.purpose; 
    voters               = emptyFinancialRequestVotersMap;

    approveVoteTotal     = 0n;
    disapproveVoteTotal  = 0n;

    snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
    stakedMvkPercentageForApproval     = s.config.financialRequestApprovalPercentage; 
    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

    requestedDateTime    = Tezos.now;               // log of when the request was submitted
    expiryDateTime       = Tezos.now + (86_400 * s.config.financialRequestDurationInDays);
    ];

    const financialRequestId : nat = s.financialRequestCounter;

    // save request to financial request ledger
    s.financialRequestLedger[financialRequestId] := newFinancialRequest;

    // create snapshot in financialRequestSnapshotLedger (to be filled with satellite's )
    const emptyFinancialRequestSnapshotMap  : financialRequestSnapshotMapType     = map [];
    s.financialRequestSnapshotLedger[financialRequestId] := emptyFinancialRequestSnapshotMap;

    // increment financial request counter
    s.financialRequestCounter := financialRequestId + 1n;

    // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
    const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
    const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
      Some (value) -> value
    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
    ];

    for satelliteAddress -> satellite in map activeSatellites block {
      
        const satelliteSnapshot : requestSatelliteSnapshotType = record [
          satelliteAddress      = satelliteAddress;
          requestId             = financialRequestId;
          stakedMvkBalance      = satellite.stakedMvkBalance;
          totalDelegatedAmount  = satellite.totalDelegatedAmount;
        ];

        s := requestSatelliteSnapshot(satelliteSnapshot,s);
    };

} with (noOperations, s)

function requestMint(const requestMintParams : councilActionRequestMintType; var s : governanceStorage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];
  
  const mvkTokenAddress : address = s.mvkTokenAddress;

  const doormanAddress : address = case s.generalContracts["doorman"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Doorman Contract is not found")
  ];
  const delegationAddress : address = case s.generalContracts["delegation"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Delegation Contract is not found")
  ];

  const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getTotalStakedSupply", unit, doormanAddress);
  s.snapshotStakedMvkTotalSupply := case stakedMvkBalanceView of [
    Some (value) -> value
  | None -> (failwith ("Error. GetTotalStakedSupply View not found in the Doorman Contract") : nat)
  ];

  const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

  var newFinancialRequest : financialRequestRecordType := record [

        requesterAddress     = Tezos.sender;
        requestType          = "MINT";
        status               = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
        executed             = False;

        treasuryAddress      = requestMintParams.treasuryAddress;
        tokenContractAddress = mvkTokenAddress;
        tokenAmount          = requestMintParams.tokenAmount;
        tokenName            = "MVK"; 
        tokenType            = "FA2";
        tokenId              = 0n;
        requestPurpose       = requestMintParams.purpose;
        voters               = emptyFinancialRequestVotersMap;

        approveVoteTotal     = 0n;
        disapproveVoteTotal  = 0n;

        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
        stakedMvkPercentageForApproval     = s.config.financialRequestApprovalPercentage; 
        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

        requestedDateTime    = Tezos.now;               // log of when the request was submitted
        expiryDateTime       = Tezos.now + (86_400 * s.config.financialRequestDurationInDays);
    ];

    const financialRequestId : nat = s.financialRequestCounter;

    // save request to financial request ledger
    s.financialRequestLedger[financialRequestId] := newFinancialRequest;

    // increment financial request counter
    s.financialRequestCounter := financialRequestId + 1n;

    // create snapshot in financialRequestSnapshotLedger (to be filled with satellite's )
    const emptyFinancialRequestSnapshotMap  : financialRequestSnapshotMapType     = map [];
    s.financialRequestSnapshotLedger[financialRequestId] := emptyFinancialRequestSnapshotMap;

    // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
    const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
    const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
      Some (value) -> value
    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
    ];

    for satelliteAddress -> satellite in map activeSatellites block {
        const satelliteSnapshot : requestSatelliteSnapshotType = record [
          satelliteAddress      = satelliteAddress;
          requestId             = financialRequestId;
          stakedMvkBalance      = satellite.stakedMvkBalance;
          totalDelegatedAmount  = satellite.totalDelegatedAmount;
        ];

        s := requestSatelliteSnapshot(satelliteSnapshot,s);
    }; 

} with (noOperations, s)

function dropFinancialRequest(const requestId : nat; var s : governanceStorage) : return is 
block {

  checkSenderIsCouncilContract(s);

  var financialRequest : financialRequestRecordType := case s.financialRequestLedger[requestId] of [
    Some(_request) -> _request
    | None -> failwith("Error. Financial request not found. ")
  ];

  if financialRequest.executed then failwith("Error. This financial request has already been executed, it cannot be dropped") else skip;

  if Tezos.now > financialRequest.expiryDateTime then failwith("Error. Financial request has expired") else skip;

  financialRequest.status := False;
  s.financialRequestLedger[requestId] := financialRequest;

} with (noOperations, s);

function voteForRequest(const voteForRequest : voteForRequestType; var s : governanceStorage) : return is 
block {
  
  // check if satellite exists in the active satellites map
  const delegationAddress : address = case s.generalContracts["delegation"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Delegation Contract is not found")
  ];
  const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
  case satelliteOptView of [
    Some (value) -> case value of [
        Some (_satellite) -> skip
      | None -> failwith("Error. You need to be a satellite to vote for a request.")
    ]
  | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
  ];

  const financialRequestId : nat = voteForRequest.requestId;

  var _financialRequest : financialRequestRecordType := case s.financialRequestLedger[financialRequestId] of [
    Some(_request) -> _request
    | None -> failwith("Error. Financial request not found. ")
  ];

  if _financialRequest.status    = False then failwith("Error. Financial request has been dropped.")          else skip;
  if _financialRequest.executed  = True  then failwith("Error. Financial request has already been executed.") else skip;

  if Tezos.now > _financialRequest.expiryDateTime then failwith("Error. Financial request has expired") else skip;

  var operations : list(operation) := nil;

  const financialRequestSnapshot : financialRequestSnapshotMapType = case s.financialRequestSnapshotLedger[financialRequestId] of [
    Some(_snapshot) -> _snapshot
    | None -> failwith("Error. Financial request snapshot not found.")
  ]; 

  const satelliteSnapshotRecord : financialRequestSnapshotRecordType = case financialRequestSnapshot[Tezos.sender] of [ 
    Some(_record) -> _record
    | None -> failwith("Error. Satellite not found in financial request snapshot.")
  ];

  // Save and update satellite's vote record
  const voteType         : voteForRequestChoiceType  = voteForRequest.vote;
  const totalVotingPower : nat                       = satelliteSnapshotRecord.totalVotingPower;

  // Remove previous vote if user already voted
  case _financialRequest.voters[Tezos.sender] of [
    Some (_voteRecord) -> case _voteRecord.vote of [
      Approve(_v) -> if _voteRecord.totalVotingPower > _financialRequest.approveVoteTotal then failwith("Error. Calculation error when changing a vote") else
        _financialRequest.approveVoteTotal := abs(_financialRequest.approveVoteTotal - _voteRecord.totalVotingPower)
    | Disapprove(_v) ->  if _voteRecord.totalVotingPower > _financialRequest.disapproveVoteTotal then failwith("Error. Calculation error when changing a vote") else
        _financialRequest.disapproveVoteTotal := abs(_financialRequest.disapproveVoteTotal - _voteRecord.totalVotingPower)
    ]
  | None -> skip
  ];

  const newVoteRecord : financialRequestVoteType     = record [
      vote             = voteType;
      totalVotingPower = totalVotingPower;
      timeVoted        = Tezos.now;
  ];

  _financialRequest.voters[Tezos.sender] := newVoteRecord;

  // Satellite cast vote and send request to Treasury if enough votes have been gathered
  case voteType of [
    Approve(_v) -> block {

        const newApproveVoteTotal : nat = _financialRequest.approveVoteTotal + totalVotingPower;

        _financialRequest.approveVoteTotal           := newApproveVoteTotal;
        s.financialRequestLedger[financialRequestId] := _financialRequest;

        // send request to treasury if total approved votes exceed staked MVK required for approval
        if newApproveVoteTotal > _financialRequest.stakedMvkRequiredForApproval then block {

          const treasuryAddress : address = _financialRequest.treasuryAddress;

          const councilAddress : address = case s.generalContracts["council"] of [
            Some(_address) -> _address
            | None -> failwith("Error. Council Contract is not found")
          ];

          if _financialRequest.requestType = "TRANSFER" then block {

            // ---- set token type ----
            var _tokenTransferType : tokenType := Tez;

            if  _financialRequest.tokenType = "FA12" then block {
              _tokenTransferType := Fa12(_financialRequest.tokenContractAddress); 
            } else skip;

            if  _financialRequest.tokenType = "FA2" then block {
              _tokenTransferType := Fa2(record [
                tokenContractAddress  = _financialRequest.tokenContractAddress;
                tokenId               = _financialRequest.tokenId;
              ]); 
            } else skip;
            // --- --- ---

            const transferTokenParams : transferActionType = list[
              record [
                to_        = councilAddress;
                token      = _tokenTransferType;
                amount     = _financialRequest.tokenAmount;
              ]
            ];

            const treasuryTransferOperation : operation = Tezos.transaction(
              transferTokenParams, 
              0tez, 
              sendTransferOperationToTreasury(treasuryAddress)
            );

            operations := treasuryTransferOperation # operations;

          } else skip;

          if _financialRequest.requestType = "MINT" then block {
              
            const mintMvkAndTransferTokenParams : mintMvkAndTransferType = record [
              to_  = councilAddress;
              amt  = _financialRequest.tokenAmount;
            ];

            const treasuryMintMvkAndTransferOperation : operation = Tezos.transaction(
              mintMvkAndTransferTokenParams, 
              0tez, 
              sendMintMvkAndTransferOperationToTreasury(treasuryAddress)
            );

            operations := treasuryMintMvkAndTransferOperation # operations;

          } else skip;

          _financialRequest.executed := True;
          s.financialRequestLedger[financialRequestId] := _financialRequest;

        } else skip;

    }
  | Disapprove(_v) -> block {
      const newDisapproveVoteTotal : nat            = _financialRequest.disapproveVoteTotal + totalVotingPower;
      _financialRequest.disapproveVoteTotal        := newDisapproveVoteTotal;
      s.financialRequestLedger[financialRequestId] := _financialRequest;
    }
  ];
  
} with (operations, s)


function main (const action : governanceAction; const s : governanceStorage) : return is 
    case action of [
        | BreakGlass(_parameters) -> breakGlass(s)  
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        
        // Housekeeping
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

        // | StartNextRound(parameters) -> startNextRound(parameters, s)
        | Propose(parameters) -> propose(parameters, s)
        | ProposalRoundVote(parameters) -> proposalRoundVote(parameters, s)
        | AddUpdateProposalData(parameters) -> addUpdateProposalData(parameters, s)
        | LockProposal(parameters) -> lockProposal(parameters, s)

        | VotingRoundVote(parameters) -> votingRoundVote(parameters, s)
        
        | ExecuteProposal(_parameters) -> executeProposal(s)
        // | DropProposal(parameters) -> dropProposal(parameters, s)

        // Governance Lambdas
        | CallGovernanceLambdaProxy(parameters) -> callGovernanceLambdaProxy(parameters, s)
        | SetupLambdaFunction(parameters) -> setupLambdaFunction(parameters, s)

        // Financial Governance
        | RequestTokens(parameters) -> requestTokens(parameters, s)
        | RequestMint(parameters) -> requestMint(parameters, s)
        | DropFinancialRequest(parameters) -> dropFinancialRequest(parameters, s)
        | VoteForRequest(parameters) -> voteForRequest(parameters, s)
    ]