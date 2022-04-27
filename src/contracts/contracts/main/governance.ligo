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
    | SetGovernanceProxyAddress       of (address)
    | UpdateMetadata                  of updateMetadataType
    | UpdateConfig                    of governanceUpdateConfigParamsType
    | UpdateWhitelistContracts        of updateWhitelistContractsParams
    | UpdateGeneralContracts          of updateGeneralContractsParams
    | UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsParams
    
      // Governance Cycle Entrypoints
    | StartNextRound                  of bool
    | Propose                         of newProposalType
    | ProposalRoundVote               of proposalIdType
    | AddUpdateProposalData           of addUpdateProposalDataType
    | AddUpdatePaymentData            of addUpdatePaymentDataType
    | LockProposal                    of proposalIdType      
    | VotingRoundVote                 of (voteForProposalChoiceType)    
    | ExecuteProposal                 of (unit)
    | ProcessProposalPayment          of proposalIdType
    | DropProposal                    of proposalIdType

      // Financial Governance Entrypoints
    | RequestTokens                   of requestTokensType
    | RequestMint                     of requestMintType
    | SetContractBaker                of setContractBakerType
    | DropFinancialRequest            of (nat)
    | VoteForRequest                  of voteForRequestType

      // Satellite Governance Entrypoints
    // | SuspendSatellite                of suspendSatelliteType

      // Lambda Entrypoints
    | SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceStorage

// governance contract methods lambdas
type governanceUnpackLambdaFunctionType is (governanceLambdaActionType * governanceStorage) -> return



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

// temp
[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                        = 13n;
// [@inline] const error_EXECUTE_GOVERNANCE_PROPOSAL_ENTRYPOINT_NOT_FOUND      = 13n;
[@inline] const error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_NOT_FOUND        = 13n;
//

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
[@inline] const error_SET_BAKER_ENTRYPOINT_NOT_FOUND                        = 24n;
[@inline] const error_FINANCIAL_REQUEST_SNAPSHOT_NOT_FOUND                  = 25n;

[@inline] const error_LAMBDA_NOT_FOUND                                      = 26n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                               = 27n;

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
      | None           -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
  ];
  
  if (Tezos.sender = doormanAddress) then skip
  else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



function checkSenderIsDelegationContract(var s : governanceStorage) : unit is
block{

  const delegationAddress : address = case s.generalContracts["delegation"] of [
        Some(_address) -> _address
      | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
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
      | None           -> failwith(error_COUNCIL_CONTRACT_NOT_FOUND)
  ];
  
  if (Tezos.sender = councilAddress) then skip
  else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with unit



function checkSenderIsEmergencyGovernanceContract(var s : governanceStorage) : unit is
block{

  const emergencyGovernanceAddress : address = case s.generalContracts["emergencyGovernance"] of [
        Some(_address) -> _address
      | None           -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
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

// governance proxy lamba helper function to get setAdmin entrypoint
function getSetAdminEntrypoint(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%setAdmin",
      contractAddress) : option(contract(address))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
      ];



// governance proxy lamba helper function to get executeGovernanceProposal entrypoint
// function getExecuteGovernanceProposalEntrypoint(const contractAddress : address) : contract(bytes) is
// case (Tezos.get_entrypoint_opt(
//       "%executeGovernanceProposal",
//       contractAddress) : option(contract(bytes))) of [
//           Some(contr) -> contr
//         | None        -> (failwith(error_EXECUTE_GOVERNANCE_PROPOSAL_ENTRYPOINT_NOT_FOUND) : contract(bytes))
//       ];



// governance proxy lamba helper function to get executeGovernanceProposal entrypoint
function getExecuteGovernanceActionEntrypoint(const contractAddress : address) : contract(bytes) is
case (Tezos.get_entrypoint_opt(
      "%executeGovernanceAction",
      contractAddress) : option(contract(bytes))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_NOT_FOUND) : contract(bytes))
      ];



// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_TRANSFER_ENTRYPOINT_NOT_FOUND) : contract(transferActionType))
      ];



// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
case (Tezos.get_entrypoint_opt(
      "%mintMvkAndTransfer",
      contractAddress) : option(contract(mintMvkAndTransferType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_NOT_FOUND) : contract(mintMvkAndTransferType))
];



// helper function to set baker for treasury
function setTreasuryBaker(const contractAddress : address) : contract(setBakerType) is
case (Tezos.get_entrypoint_opt(
      "%setBaker",
      contractAddress) : option(contract(setBakerType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_SET_BAKER_ENTRYPOINT_NOT_FOUND) : contract(setBakerType))
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
// function sendOperationToGovernanceLambda(const _p : unit) : contract(executeActionType) is
//   case (Tezos.get_entrypoint_opt(
//       "%callGovernanceLambdaProxy",
//       Tezos.self_address) : option(contract(executeActionType))) of [
//           Some(contr) -> contr
//         | None -> (failwith(error_CALL_GOVERNANCE_LAMBDA_PROXY_ENTRYPOINT_NOT_FOUND) : contract(executeActionType))
//       ];  



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
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
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

(* View: get Proposal Record *)
// [@view] function getProposalRecordView(const proposalId: nat; var s : governanceStorage) : option(proposalRecordType) is
//   s.proposalLedger[proposalId]


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
function breakGlass(var s : governanceStorage) : return is 
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

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response




(*  setGovernanceProxyAddress entrypoint *)
function setGovernanceProxyAddress(const newGovernanceProxyAddress : address; var s : governanceStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernanceProxyAddress"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetGovernanceProxyAddress(newGovernanceProxyAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceStorage) : return is
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
function updateConfig(const updateConfigParams : governanceUpdateConfigParamsType; var s : governanceStorage) : return is 
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



// (*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: governanceStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: governanceStorage): return is
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



// (*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: governanceStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

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
function startNextRound(const executePastProposal: bool; var s : governanceStorage) : return is
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
function propose(const newProposal : newProposalType ; var s : governanceStorage) : return is 
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



// (* addUpdateProposalData entrypoint *)
function addUpdateProposalData(const proposalData : addUpdateProposalDataType; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddUpdateProposalData"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaAddUpdateProposalData(proposalData);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* addUpdatePaymentData entrypoint *)
function addUpdatePaymentData(const paymentData : addUpdatePaymentDataType; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddUpdatePaymentData"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaAddUpdatePaymentData(paymentData);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(* lockProposal entrypoint *)
function lockProposal(const proposalId : nat; var s : governanceStorage) : return is 
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
function proposalRoundVote(const proposalId : nat; var s : governanceStorage) : return is 
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
function votingRoundVote(const voteType : voteForProposalChoiceType; var s : governanceStorage) : return is 
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
function executeProposal(var s : governanceStorage) : return is 
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
function processProposalPayment(var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaProcessProposalPayment"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaExecuteProposal(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* dropProposal entrypoint *)
function dropProposal(const proposalId : proposalIdType; var s : governanceStorage) : return is 
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
// Financial Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(* requestTokens entrypoint *)
function requestTokens(const requestTokensParams : councilActionRequestTokensType; var s : governanceStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestTokens"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaRequestTokens(requestTokensParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(* requestMint entrypoint *)
function requestMint(const requestMintParams : councilActionRequestMintType; var s : governanceStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestMint"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaRequestMint(requestMintParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(* setContractBaker entrypoint *)
function setContractBaker(const setContractBakerParams : councilActionSetContractBakerType; var s : governanceStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetContractBaker"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetContractBaker(setContractBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(* dropFinancialRequest entrypoint *)
function dropFinancialRequest(const requestId : nat; var s : governanceStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropFinancialRequest"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaDropFinancialRequest(requestId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(* voteForRequest entrypoint *)
function voteForRequest(const voteForRequest : voteForRequestType; var s : governanceStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForRequest"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaVoteForRequest(voteForRequest);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
  
} with response

// ------------------------------------------------------------------------------
// Financial Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: governanceStorage): return is
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
function main (const action : governanceAction; const s : governanceStorage) : return is 

    case action of [

          // Break Glass Entrypoint
        | BreakGlass(_parameters)                     -> breakGlass(s)
        
          // Housekeeping Entrypoints
        | SetAdmin(parameters)                        -> setAdmin(parameters, s)
        | SetGovernanceProxyAddress(parameters)       -> setGovernanceProxyAddress(parameters, s)
        | UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        | UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)

          // Governance Cycle Entrypoints
        | StartNextRound(parameters)                  -> startNextRound(parameters, s)
        | Propose(parameters)                         -> propose(parameters, s)
        | ProposalRoundVote(parameters)               -> proposalRoundVote(parameters, s)
        | AddUpdateProposalData(parameters)           -> addUpdateProposalData(parameters, s)
        | AddUpdatePaymentData(parameters)            -> addUpdatePaymentData(parameters, s)
        | LockProposal(parameters)                    -> lockProposal(parameters, s)
        | VotingRoundVote(parameters)                 -> votingRoundVote(parameters, s)
        | ExecuteProposal(_parameters)                -> executeProposal(s)
        | ProcessProposalPayment(_parameters)         -> processProposalPayment(s)
        | DropProposal(parameters)                    -> dropProposal(parameters, s)

          // Financial Governance Entrypoints
        | RequestTokens(parameters)                   -> requestTokens(parameters, s)
        | RequestMint(parameters)                     -> requestMint(parameters, s)
        | SetContractBaker(parameters)                -> setContractBaker(parameters, s)
        | DropFinancialRequest(parameters)            -> dropFinancialRequest(parameters, s)
        | VoteForRequest(parameters)                  -> voteForRequest(parameters, s)

          // Satellite Governance Entrypoints
        // | SuspendSatellite(parameters)                   -> suspendSatellite(parameters, s)

          // Lambda Entrypoints
        | SetLambda(parameters)                       -> setLambda(parameters, s)

    ]