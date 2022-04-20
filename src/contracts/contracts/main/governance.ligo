// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------

type governanceAction is 

      // Break Glass Entrypoint
    | BreakGlass                      of (unit)

      // Housekeeping Entrypoints
    | SetAdmin                        of (address)
    | UpdateMetadata                  of (string * bytes)
    | UpdateConfig                    of governanceUpdateConfigParamsType
    | UpdateWhitelistContracts        of updateWhitelistContractsParams
    | UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsParams
    | UpdateGeneralContracts          of updateGeneralContractsParams
    
      // Governance Cycle Entrypoints
    // | StartNextRound                  of bool
    // | Propose                         of newProposalType
    // | ProposalRoundVote               of proposalIdType
    | AddUpdateProposalData           of addUpdateProposalDataType
    | AddUpdatePaymentData            of addUpdatePaymentDataType
    | LockProposal                    of proposalIdType      
    | VotingRoundVote                 of (voteForProposalChoiceType)    
    | ExecuteProposal                 of (unit)
    | DropProposal                    of (nat)

      // Financial Governance Entrypoints
    // | RequestTokens                   of requestTokensType
    // | RequestMint                     of requestMintType
    // | DropFinancialRequest            of (nat)
    // | VoteForRequest                  of voteForRequestType

      // Lambda Entrypoints
    | CallGovernanceLambdaProxy       of executeActionType
    | SetProxyLambda                  of setProxyLambdaType
    | SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceStorage
type governanceLambdaFunctionType is (executeActionType * governanceStorage) -> return



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
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                            = 0n;
[@inline] const error_ONLY_SELF_ALLOWED                                     = 1n;
[@inline] const error_ONLY_ADMIN_OR_SELF_ALLOWED                            = 2n;
[@inline] const error_ONLY_DOORMAN_CONTRACT_ALLOWED                         = 3n;
[@inline] const error_ONLY_DELEGATION_CONTRACT_ALLOWED                      = 4n;
[@inline] const error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED                       = 5n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                         = 6n;
[@inline] const error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED            = 7n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                     = 8n;

[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                            = 9n;
[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                         = 10n;
[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                            = 11n;
[@inline] const error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND               = 12n;

[@inline] const error_TRANSFER_ENTRYPOINT_NOT_FOUND                         = 13n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_NOT_FOUND            = 14n;
[@inline] const error_START_PROPOSAL_ROUND_ENTRYPOINT_NOT_FOUND             = 15n;
[@inline] const error_EXECUTE_PROPOSAL_ENTRYPOINT_NOT_FOUND                 = 16n;
[@inline] const error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_NOT_FOUND         = 17n;
[@inline] const error_ADD_UPDATE_PAYMENT_DATA_ENTRYPOINT_NOT_FOUND          = 18n;
[@inline] const error_CALL_GOVERNANCE_LAMBDA_PROXY_ENTRYPOINT_NOT_FOUND     = 19n;

[@inline] const error_VIEW_GET_TOTAL_SUPPLY_NOT_FOUND                       = 20n;
[@inline] const error_VIEW_GET_ACTIVE_SATELLITES_NOT_FOUND                  = 21n;
[@inline] const error_TRANSFER_ENTRYPOINT_NOT_FOUND                         = 22n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_NOT_FOUND            = 23n;
[@inline] const error_FINANCIAL_REQUEST_SNAPSHOT_NOT_FOUND                  = 24n;

[@inline] const error_LAMBDA_NOT_FOUND                                      = 25n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                               = 26n;

// ------------------------------------------------------------------------------
//
// Error Codes End
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

function checkSenderIsAdmin(var s : governanceStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkSenderIsAdminOrSelf(var s : governanceStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_ADMIN_OR_SELF_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



function checkSenderIsDoormanContract(var s : governanceStorage) : unit is
block{

  const doormanAddress : address = case s.generalContracts["doorman"] of [
      Some(_address) -> _address
      | None -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
  ];
  
  if (Tezos.sender = doormanAddress) then skip
  else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



function checkSenderIsDelegationContract(var s : governanceStorage) : unit is
block{

  const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
  ];

  if (Tezos.sender = delegationAddress) then skip
  else failwith(error_ONLY_DELEGATION_CONTRACT_ALLOWED);

} with unit



function checkSenderIsMvkTokenContract(var s : governanceStorage) : unit is
block{

  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
  else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);

} with unit



function checkSenderIsCouncilContract(var s : governanceStorage) : unit is
block{

  const councilAddress : address = case s.generalContracts["council"] of [
      Some(_address) -> _address
      | None -> failwith(error_COUNCIL_CONTRACT_NOT_FOUND)
  ];
  
  if (Tezos.sender = councilAddress) then skip
  else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with unit



function checkSenderIsEmergencyGovernanceContract(var s : governanceStorage) : unit is
block{

  const emergencyGovernanceAddress : address = case s.generalContracts["emergencyGovernance"] of [
      Some(_address) -> _address
      | None -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];

  if (Tezos.sender = emergencyGovernanceAddress) then skip
  else failwith(error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"



// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_TRANSFER_ENTRYPOINT_NOT_FOUND) : contract(transferActionType))
];



// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
case (Tezos.get_entrypoint_opt(
      "%mintMvkAndTransfer",
      contractAddress) : option(contract(mintMvkAndTransferType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_NOT_FOUND) : contract(mintMvkAndTransferType))
];



function getExecuteProposalEntrypoint(const contractAddress : address) : contract(unit) is
case (Tezos.get_entrypoint_opt(
      "%executeProposal",
      contractAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith(error_EXECUTE_PROPOSAL_ENTRYPOINT_NOT_FOUND) : contract(unit))
];



function getAddUpdateProposalDataEntrypoint(const contractAddress : address) : contract(addUpdateProposalDataType) is
case (Tezos.get_entrypoint_opt(
      "%addUpdateProposalData",
      contractAddress) : option(contract(addUpdateProposalDataType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_NOT_FOUND) : contract(addUpdateProposalDataType))
];



function getAddUpdatePaymentDataEntrypoint(const contractAddress : address) : contract(addUpdatePaymentDataType) is
case (Tezos.get_entrypoint_opt(
      "%addUpdatePaymentData",
      contractAddress) : option(contract(addUpdatePaymentDataType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_ADD_UPDATE_PAYMENT_DATA_ENTRYPOINT_NOT_FOUND) : contract(addUpdatePaymentDataType))
];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Helper Functions Begin
// ------------------------------------------------------------------------------

function restartProposalRoundOperation(const _p : unit) : operation is 
block {

  // restart - another proposal round
  const restartProposalRoundEntrypoint: contract(unit) =
    case (Tezos.get_entrypoint_opt("%startProposalRound", Tezos.self_address) : option(contract(unit))) of [
      Some(contr) -> contr
    | None -> (failwith(error_START_PROPOSAL_ROUND_ENTRYPOINT_NOT_FOUND): contract(unit))
  ];

  const restartProposalRoundOperation : operation = Tezos.transaction(
      unit, 
      0tez, 
      restartProposalRoundEntrypoint
  );

} with restartProposalRoundOperation



// helper function to send operation to governance lambda
function sendOperationToGovernanceLambda(const _p : unit) : contract(executeActionType) is
  case (Tezos.get_entrypoint_opt(
      "%callGovernanceLambdaProxy",
      Tezos.self_address) : option(contract(executeActionType))) of [
          Some(contr) -> contr
        | None -> (failwith(error_CALL_GOVERNANCE_LAMBDA_PROXY_ENTRYPOINT_NOT_FOUND) : contract(executeActionType))
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
        None -> failwith(error_FINANCIAL_REQUEST_SNAPSHOT_NOT_FOUND)
      | Some(snapshot) -> snapshot
    ];

    // update financal request snapshot map with record of satellite's total voting power
    financialRequestSnapshot[satelliteAddress]           := satelliteSnapshotRecord;

    // update financial request snapshot ledger bigmap with updated satellite's details
    s.financialRequestSnapshotLedger[financialRequestId] := financialRequestSnapshot;

} with (s)



function setProposalRecordVote(const voteType : voteForProposalChoiceType; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is
block {

    case voteType of [

        Yay -> block {
            _proposal.upvoteCount       := _proposal.upvoteCount + 1n;    
            _proposal.upvoteMvkTotal    := _proposal.upvoteMvkTotal + totalVotingPower;
            _proposal.quorumMvkTotal    := _proposal.quorumMvkTotal + totalVotingPower;
          }

      | Nay -> block {
            _proposal.downvoteCount     := _proposal.downvoteCount + 1n;    
            _proposal.downvoteMvkTotal  := _proposal.downvoteMvkTotal + totalVotingPower;
          }

      | Abstain -> block {
            _proposal.abstainCount        := _proposal.abstainCount + 1n;    
            _proposal.abstainMvkTotal     := _proposal.abstainMvkTotal + totalVotingPower;
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

          var abstainCount     : nat := 0n;
          var abstainMvkTotal  : nat := 0n;

          if _proposal.abstainCount < 1n then abstainCount := 0n
            else abstainCount := abs(_proposal.abstainCount - 1n);

          if _proposal.abstainMvkTotal < totalVotingPower then abstainMvkTotal := 0n
            else abstainMvkTotal := abs(_proposal.abstainMvkTotal - totalVotingPower);

          _proposal.abstainCount      := abstainCount;
          _proposal.abstainMvkTotal   := abstainMvkTotal;

      }
      
    ];

} with _proposal



// helper function to setup new proposal round
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
      | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    // update snapshot MVK total supply
    const mvkTotalSupplyView : option (nat) = Tezos.call_view ("getTotalSupply", unit, s.mvkTokenAddress);
    s.snapshotMvkTotalSupply := case mvkTotalSupplyView of [
        Some (value) -> value
      | None -> (failwith (error_VIEW_GET_TOTAL_SUPPLY_NOT_FOUND) : nat)
    ];

    // Get active satellites from the delegation contract and loop through them
    const activeSatellitesView : option (map(address,satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
    const activeSatellites: map(address,satelliteRecordType) = case activeSatellitesView of [
        Some (value) -> value
      | None -> failwith (error_VIEW_GET_ACTIVE_SATELLITES_NOT_FOUND)
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



// helper function to setup new voting round
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



// helper function to setup new timelock round
function setupTimelockRound(var s: governanceStorage): governanceStorage is
block {

    // boundaries remain fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentRound               := (Timelock : roundType);
    s.currentRoundStartLevel     := s.currentRoundEndLevel + 1n;
    s.currentRoundEndLevel       := s.currentCycleEndLevel;

    // set timelockProposalId to currentRoundHighestVotedProposalId
    s.timelockProposalId         := s.currentRoundHighestVotedProposalId;
    
} with (s)

// ------------------------------------------------------------------------------
// Governance Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
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
function breakGlass(var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBreakGlass"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((governanceStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
    
} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * governanceStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : governanceStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((string * bytes * governanceStorage) -> return )) of [
      | Some(f) -> f(metadataKey, metadataHash, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : governanceUpdateConfigParamsType; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((governanceUpdateConfigParamsType * governanceStorage) -> return )) of [
      | Some(f) -> f(updateConfigParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: governanceStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateWhitelistContractsParams * governanceStorage) -> return )) of [
      | Some(f) -> f(updateWhitelistContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: governanceStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateGeneralContractsParams * governanceStorage) -> return )) of [
      | Some(f) -> f(updateGeneralContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: governanceStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateWhitelistTokenContractsParams * governanceStorage) -> return )) of [
      | Some(f) -> f(updateWhitelistTokenContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Cycle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  startNextRound entrypoint *)
function startNextRound(const executePastProposal: bool; var s : governanceStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaStartNextRound"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((bool * governanceStorage) -> return )) of [
      | Some(f) -> f(executePastProposal, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* propose entrypoint *)
function propose(const newProposal : newProposalType ; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPropose"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((newProposalType * governanceStorage) -> return )) of [
      | Some(f) -> f(newProposal, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* addUpdateProposalData entrypoint *)
function addUpdateProposalData(const proposalData : addUpdateProposalDataType; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddUpdateProposalData"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((addUpdateProposalDataType * governanceStorage) -> return )) of [
      | Some(f) -> f(proposalData, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* addUpdatePaymentData entrypoint *)
function addUpdatePaymentData(const paymentData : addUpdatePaymentDataType; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddUpdatePaymentData"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((addUpdatePaymentDataType * governanceStorage) -> return )) of [
      | Some(f) -> f(paymentData, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* lockProposal entrypoint *)
function lockProposal(const proposalId : nat; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaLockProposal"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * governanceStorage) -> return )) of [
      | Some(f) -> f(proposalId, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* proposalRoundVote entrypoint *)
function proposalRoundVote(const proposalId : nat; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaProposalRoundVote"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * governanceStorage) -> return )) of [
      | Some(f) -> f(proposalId, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* votingRoundVote entrypoint *)
function votingRoundVote(const voteType : voteForProposalChoiceType; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVotingRoundVote"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((voteForProposalChoiceType * governanceStorage) -> return )) of [
      | Some(f) -> f(voteType, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* executeProposal entrypoint *)
function executeProposal(var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaExecuteProposal"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((governanceStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* dropProposal entrypoint *)
function dropProposal(const proposalId : nat; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropProposal"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * governanceStorage) -> return )) of [
      | Some(f) -> f(proposalId, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
    
} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Governance Cycle Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Financial Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(* requestTokens entrypoint *)
function requestTokens(const requestTokensParams : councilActionRequestTokensType; var s : governanceStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestTokens"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilActionRequestTokensType * governanceStorage) -> return )) of [
      | Some(f) -> f(requestTokensParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* requestMint entrypoint *)
function requestMint(const requestMintParams : councilActionRequestMintType; var s : governanceStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestMint"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilActionRequestMintType * governanceStorage) -> return )) of [
      | Some(f) -> f(requestMintParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* dropFinancialRequest entrypoint *)
function dropFinancialRequest(const requestId : nat; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropFinancialRequest"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * governanceStorage) -> return )) of [
      | Some(f) -> f(requestId, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1);



(* voteForRequest entrypoint *)
function voteForRequest(const voteForRequest : voteForRequestType; var s : governanceStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForRequest"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((voteForRequestType * governanceStorage) -> return )) of [
      | Some(f) -> f(voteForRequest, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
  
} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Financial Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* callGovernanceLambda entrypoint *)
function callGovernanceLambdaProxy(const executeAction : executeActionType; var s : governanceStorage) : return is
block {
    
    checkSenderIsAdminOrSelf(s);

    const governanceLambdaBytes : bytes = case s.proxyLambdaLedger[0n] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // reference: type governanceLambdaFunctionType is (executeActionType * governanceStorage) -> return
    const res : return = case (Bytes.unpack(governanceLambdaBytes) : option(governanceLambdaFunctionType)) of [
        Some(f) -> f(executeAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
  
} with (res.0, res.1)



(* setProxyLambda entrypoint *)
function setProxyLambda(const setProxyLambdaParams : setProxyLambdaType; var s : governanceStorage) : return is
block {

    checkSenderIsAdminOrSelf(s);

    // init parameters
    const id          : nat   = setProxyLambdaParams.id;
    const func_bytes  : bytes = setProxyLambdaParams.func_bytes;

    // set lambda in proxyLambdaLedger - allow override of lambdas
    s.proxyLambdaLedger[id] := func_bytes;

} with ((nil : list(operation)), s)



(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: governanceStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)



// Governance Proxy Lambdas (i.e. External Contracts - updateGovernanceConfig, updateDelegationConfig ...)
#include "../partials/governance/governanceProxyLambdas.ligo"


// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------

(* main entrypoint *)
function main (const action : governanceAction; const s : governanceStorage) : return is 

    case action of [

          // Break Glass Entrypoint
        | BreakGlass(_parameters)                     -> breakGlass(s)
        
          // Housekeeping Entrypoints
        | SetAdmin(parameters)                        -> setAdmin(parameters, s)
        | UpdateMetadata(parameters)                  -> updateMetadata(parameters.0, parameters.1, s)
        | UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)

          // Governance Cycle Entrypoints
        // | StartNextRound(parameters)                  -> startNextRound(parameters, s)
        // | Propose(parameters)                         -> propose(parameters, s)
        // | ProposalRoundVote(parameters)               -> proposalRoundVote(parameters, s)
        | AddUpdateProposalData(parameters)           -> addUpdateProposalData(parameters, s)
        | AddUpdatePaymentData(parameters)            -> addUpdatePaymentData(parameters, s)
        | LockProposal(parameters)                    -> lockProposal(parameters, s)
        | VotingRoundVote(parameters)                 -> votingRoundVote(parameters, s)
        | ExecuteProposal(_parameters)                -> executeProposal(s)
        | DropProposal(parameters)                    -> dropProposal(parameters, s)

          // Financial Governance Entrypoints
        // | RequestTokens(parameters)                   -> requestTokens(parameters, s)
        // | RequestMint(parameters)                     -> requestMint(parameters, s)
        // | DropFinancialRequest(parameters)            -> dropFinancialRequest(parameters, s)
        // | VoteForRequest(parameters)                  -> voteForRequest(parameters, s)

          // Lambda Entrypoints
        | CallGovernanceLambdaProxy(parameters)       -> callGovernanceLambdaProxy(parameters, s)
        | SetProxyLambda(parameters)                  -> setProxyLambda(parameters, s)
        | SetLambda(parameters)                       -> setLambda(parameters, s)

    ]