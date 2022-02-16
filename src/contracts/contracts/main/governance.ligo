// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

type proposalIdType is nat 

// Stores all voter data during proposal round
type proposalRoundVoteType is (nat * timestamp)           // total voting power (MVK) * timestamp
type passVotersMapType is map (address, proposalRoundVoteType)

// Stores all voter data during voting round
type votingRoundVoteType is (nat * nat * timestamp)       // 1 is Yay, 0 is Nay, 2 is abstain * total voting power (MVK) * timestamp
type votersMapType is map (address, votingRoundVoteType)

type newProposalType is (string * string * string)        // title, description, invoice ipfs - add more if needed
type proposalMetadataType is map (string, bytes)   

// action title: change governance config successReward to 100000 MVK, params in bytes
// action title: change delegation config xxx to xxx , params in bytes

type proposalRecordType is [@layout:comb] record [
    
    proposerAddress      : address;
    proposalMetadata     : proposalMetadataType;

    status               : string;                  // status - "ACTIVE", "DROPPED"
    title                : string;                  // title
    description          : string;                  // description
    invoice              : string;                  // ipfs hash of invoice file
    successReward        : nat;                     // log of successful proposal reward for voters - may change over time
    executed             : bool;                    // true / false
    locked               : bool;                    // true / false
    
    passVoteCount        : nat;                     // proposal round: pass votes count - number of satellites
    passVoteMvkTotal     : nat;                     // proposal round pass vote total mvk from satellites who voted pass
    passVotersMap        : passVotersMapType;       // proposal round ledger

    upvoteCount          : nat;                     // voting round: upvotes count - number of satellites
    upvoteMvkTotal       : nat;                     // voting round: upvotes MVK total
    downvoteCount        : nat;                     // voting round: downvotes count - number of satellites
    downvoteMvkTotal     : nat;                     // voting round: downvotes MVK total
    abstainCount         : nat;                     // voting round: abstain count - number of satellites
    abstainMvkTotal      : nat;                     // voting round: abstain MVK total
    voters               : votersMapType;           // voting round ledger

    minQuorumPercentage  : nat;                     // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
    minQuorumMvkTotal    : nat;                     // log of min quorum in MVK - capture state at this point
    quorumCount          : nat;                     // log of turnout for voting round - number of satellites who voted
    quorumMvkTotal       : nat;                     // log of total positive votes in MVK 
    startDateTime        : timestamp;               // log of when the proposal was proposed

    currentCycleStartLevel   : nat;                 // log of current cycle starting block level
    currentCycleEndLevel     : nat;                 // log of current cycle end block level
]
type proposalLedgerType is big_map (nat, proposalRecordType);

type requestIdType is nat; 
// Stores all voter data for financial requests
type financialRequestVoteChoiceType is 
  Approve of unit
| Disapprove of unit
type financialRequestVoteType is [@layout:comb] record [
  vote              : financialRequestVoteChoiceType;
  totalVotingPower  : nat; 
  timeVoted         : timestamp;
] 
type financialRequestVotersMapType is map (address, financialRequestVoteType)

type financialRequestRecordType is [@layout:comb] record [

    requesterAddress        : address;
    requestType             : string;                // "MINT" or "TRANSFER"
    status                  : bool;                  // True - ACTIVE / False - DROPPED  
    ready                   : bool;                  // false on creation; set to true once snapshot of staked MVK total supply has been taken
    executed                : bool;                  // false on creation; set to true when financial request is executed successfully
    expired                 : bool;                  // false on creation

    treasuryAddress         : address;
    tokenContractAddress    : address; 
    tokenAmount             : nat;
    tokenName               : string; 
    tokenType               : string;
    tokenId                 : nat;
    requestPurpose          : string;

    voters                  : financialRequestVotersMapType; 
    approveVoteTotal        : nat;
    disapproveVoteTotal     : nat;

    snapshotStakedMvkTotalSupply       : nat;
    stakedMvkPercentageForApproval     : nat; 
    stakedMvkRequiredForApproval       : nat; 

    requestedDateTime       : timestamp;               // log of when the request was submitted
    expiryDateTime          : timestamp;               
]
type financialRequestLedgerType is big_map (nat, financialRequestRecordType);

type financialRequestSnapshotRecordType is [@layout:comb] record [
    totalMvkBalance           : nat;      // log of satellite's total mvk balance for this cycle
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
]
type financialRequestSnapshotMapType is map (address, financialRequestSnapshotRecordType)
type financialRequestSnapshotLedgerType is big_map (requestIdType, financialRequestSnapshotMapType);
type requestSatelliteSnapshotType is  [@layout:comb] record [
    satelliteAddress      : address;
    requestId             : nat; 
    stakedMvkBalance      : nat; 
    totalDelegatedAmount  : nat; 
]
type getSatelliteRequestSnapshotType is [@layout:comb] record [
  satelliteAddress  : address;
  requestId         : nat; 
  callbackContract  : contract(requestSatelliteSnapshotType);
]

// snapshot will be valid for current cycle only (proposal + voting rounds)
type snapshotRecordType is [@layout:comb] record [
    totalMvkBalance           : nat;      // log of satellite's total mvk balance for this cycle
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
    currentCycleStartLevel    : nat;      // log of current cycle starting block level
    currentCycleEndLevel      : nat;      // log of when cycle (proposal + voting) will end
]
type snapshotLedgerType is big_map (address, snapshotRecordType);

type configType is [@layout:comb] record [
    
    successReward               : nat;  // incentive reward for successful proposal
    minQuorumPercentage         : nat;  // minimum quorum percentage to be achieved (in MVK)
    minQuorumMvkTotal           : nat;  // minimum quorum in MVK
    
    votingPowerRatio            : nat;  // votingPowerRatio (e.g. 10% -> 10_000) - percentage to determine satellie's max voting power and if satellite is overdelegated (requires more staked MVK to be staked) or underdelegated - similar to self-bond percentage in tezos
    proposalSubmissionFee       : nat;  // e.g. 10 tez per submitted proposal
    minimumStakeReqPercentage   : nat;  // minimum amount of MVK required in percentage of total staked MVK supply (e.g. 0.01%)
    maxProposalsPerDelegate     : nat;  // number of active proposals delegate can have at any given time
    
    newBlockTimeLevel           : nat;  // block level where new blocksPerMinute takes effect -> if none, use blocksPerMinute (old); if exists, check block levels, then use newBlocksPerMinute if current block level exceeds block level, if not use old blocksPerMinute
    newBlocksPerMinute          : nat;  // new blocks per minute 
    blocksPerMinute             : nat;  // to account for eventual changes in blocks per minute (and blocks per day / time) - todo: change to allow decimal
    
    blocksPerProposalRound      : nat;  // to determine duration of proposal round
    blocksPerVotingRound        : nat;  // to determine duration of voting round
    blocksPerTimelockRound      : nat;  // timelock duration in blocks - 2 days e.g. 5760 blocks (one block is 30secs with granadanet) - 1 day is 2880 blocks

    financialRequestApprovalPercentage  : nat;  // threshold for financial request to be approved: 67% of total staked MVK supply
    financialRequestDurationInDays      : nat;  // duration of final request before expiry
    
]

// update config types
type updateConfigNewValueType is nat
type updateGovernanceConfigActionType is 
  ConfigSuccessReward of unit
| ConfigMinQuorumPercentage of unit
| ConfigMinQuorumMvkTotal of unit
| ConfigVotingPowerRatio of unit
| ConfigProposalSubmissionFee of unit
| ConfigMinimumStakeReqPercentage of unit
| ConfigMaxProposalsPerDelegate of unit
| ConfigNewBlockTimeLevel of unit
| ConfigNewBlocksPerMinute of unit
| ConfigBlocksPerMinute of unit
| ConfigBlocksPerProposalRound of unit
| ConfigBlocksPerVotingRound of unit
| ConfigBlocksPerTimelockRound of unit

type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: updateConfigNewValueType; 
  updateConfigAction: updateGovernanceConfigActionType;
]

type updateDelegationConfigActionType is 
  ConfigMinimumStakedMvkBalance of unit
| ConfigDelegationRatio of unit
| ConfigMaxSatellites of unit

// execute action variant types - start test with 2 variant action types
// type updateGovernanceConfigType is (nat * updateGovernanceConfigActionType); // unit: type updateConfigParamsType is (updateConfigActionType * updateConfigNewValueType)
type updateGovernanceConfigType is [@layout:comb] record [
  updateConfigNewValue: nat;
  updateConfigAction: updateGovernanceConfigActionType
]

// type updateDelegationConfigType is (nat * updateDelegationConfigActionType);
type updateDelegationConfigType is [@layout:comb] record [
  updateConfigNewValue: nat;
  updateConfigAction: updateDelegationConfigActionType
]

type setupLambdaFunctionType is [@layout:comb] record [
  id          : nat;
  func_bytes  : bytes;
]
type updateLambdaFunctionType is setupLambdaFunctionType
type governanceLambdaLedgerType is big_map(nat, bytes)


type executeActionParamsType is 
  UpdateLambdaFunction of updateLambdaFunctionType
| UpdateGovernanceConfig of updateGovernanceConfigType
| UpdateDelegationConfig of updateDelegationConfigType
type executeActionType is (executeActionParamsType)

type activeSatellitesMapType is map(address, timestamp) // satellite address, timestamp of when satellite was added to the active satellites map

type tezType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
  token                   : address;
  id                      : nat;
]
type tokenType       is
| Tez                     of tezType         // unit
| Fa12                    of fa12TokenType   // address
| Fa2                     of fa2TokenType    // record [ token : address; id : nat; ]

type transferTokenType is [@layout:comb] record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]
type mintTokenType is (address * nat)
type mintMvkAndTransferType is [@layout:comb] record [
    to_             : address;
    amt             : nat;
]

type storage is record [
    admin                       : address;
    config                      : configType;

    whitelistContracts          : whitelistContractsType;      
    whitelistTokenContracts     : whitelistTokenContractsType;      
    generalContracts            : generalContractsType; 
    
    proposalLedger              : proposalLedgerType;
    snapshotLedger              : snapshotLedgerType;
    activeSatellitesMap         : activeSatellitesMapType; // set of satellite addresses - for running loops - not intended to be extremely large, so satellite entry requirements have to be considered

    startLevel                  : nat;                // use Tezos.level as start level
    nextProposalId              : nat;                // counter of next proposal id
    
    // current round state variables - will be flushed periodically
    currentRound                : string;             // proposal, voting, timelock
    currentRoundStartLevel      : nat;                // current round starting block level
    currentRoundEndLevel        : nat;                // current round ending block level
    currentCycleEndLevel        : nat;                // current cycle (proposal + voting) ending block level 
    currentRoundProposals       : map(nat, nat);      // proposal id, total positive votes in MVK
    currentRoundVotes           : map(address, nat);  // proposal round: (satelliteAddress, proposal id) | voting round: (satelliteAddress, voteType)

    currentRoundHighestVotedProposalId  : nat;        // set to 0 if there is no proposal currently, if not set to proposal id
    timelockProposalId                  : nat;        // set to 0 if there is proposal in timelock, if not set to proposal id

    snapshotMvkTotalSupply         : nat;             // snapshot of total MVK supply - for quorum calculation use
    snapshotStakedMvkTotalSupply   : nat;             // snapshot of total staked MVK supply - for financial request decision making 

    financialRequestLedger             : financialRequestLedgerType;
    financialRequestSnapshotLedger     : financialRequestSnapshotLedgerType;
    financialRequestCounter            : nat;

    governanceLambdaLedger      : governanceLambdaLedgerType;

    tempFlag : nat;     // test variable - currently used to show block levels per transaction
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage
type governanceLambdaFunctionType is (executeActionType * storage) -> return

type addUpdateProposalDataType is (nat * string * bytes) // proposal id, proposal metadata title or description, proposal metadata in bytes

// type requestTokenType is 
//   Tez of unit
// | FA12 of unit
// | FA2 of unit
// | NoToken of unit

type requestTokensType is [@layout:comb] record [
    treasuryAddress       : address;  // treasury address
    tokenContractAddress  : address;  // token contract address
    tokenName             : string;   // token name should be in whitelist token contracts map in governance contract
    tokenAmount           : nat;      // token amount requested
    tokenType             : string;   
    // tokenType             : requestTokenType; 
    tokenId               : nat;      // token amount requested
    purpose               : string;   // financial request purpose
]

type requestMintType is [@layout:comb] record [
    treasuryAddress       : address;  // treasury address
    tokenAmount           : nat;      // MVK token amount requested
    tokenType             : string;
    // tokenType             : requestTokenType; 
    tokenId               : nat;      // token amount requested
    purpose               : string;   // financial request purpose
]


type voteForRequestChoiceType is 
  Approve of unit
| Disapprove of unit
type voteForRequestType is [@layout:comb] record [
    requestId        : nat;
    vote             : voteForRequestChoiceType;
]

type governanceAction is 
    | BreakGlass of (unit)
    | SetAdmin of (address)
    | UpdateConfig of updateConfigParamsType

    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateWhitelistTokenContracts of updateWhitelistTokenContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams
    | UpdateActiveSatellitesMap of (unit * address)
    | SetSnapshotMvkTotalSupply of (nat)  
    | SetSnapshotStakedMvkTotalSupply of (nat)  
    | SetSatelliteVotingPowerSnapshot of (address * nat * nat)
    
    | StartProposalRound of (unit)
    | Propose of newProposalType
    | ProposalRoundVote of proposalIdType
    | AddUpdateProposalData of addUpdateProposalDataType
    | LockProposal of proposalIdType  
    
    // | StartVotingRound of (unit)
    // | VotingRoundVote of (nat * nat)
    
    // | StartTimelockRound of (unit)
    // | ExecuteProposal of (nat)
    // | DropProposal of (nat)

    | CallGovernanceLambdaProxy of executeActionType
    | SetupLambdaFunction of setupLambdaFunctionType

    | RequestTokens of requestTokensType
    | RequestMint of requestMintType
    | DropFinancialRequest of (nat)
    | RequestStakedMvkSnapshot of (nat)
    | RequestSatelliteSnapshot of requestSatelliteSnapshotType
    | VoteForRequest of voteForRequestType

// admin helper functions begin --
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Error. Only the administrator can call this entrypoint.");

function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith("Error. Only the governance contract can call this entrypoint.");

function checkSenderIsAdminOrSelf(var s : storage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = Tezos.self_address) then unit
    else failwith("Error. Only the administrator or governance contract can call this entrypoint.");

function checkSenderIsDelegationContract(var s : storage) : unit is
block{
  const delegationAddress : address = case s.generalContracts["delegation"] of
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  end;
  if (Tezos.sender = delegationAddress) then skip
  else failwith("Error. Only the Delegation Contract can call this entrypoint.");
} with unit

function checkSenderIsDoormanContract(var s : storage) : unit is
block{
  const doormanAddress : address = case s.generalContracts["doorman"] of
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found.")
  end;
  if (Tezos.sender = doormanAddress) then skip
  else failwith("Error. Only the Doorman Contract can call this entrypoint.");
} with unit

function checkSenderIsMvkTokenContract(var s : storage) : unit is
block{
  const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
      Some(_address) -> _address
      | None -> failwith("Error. MVK Token Contract is not found.")
  end;
  if (Tezos.sender = mvkTokenAddress) then skip
  else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
} with unit

function checkSenderIsCouncilContract(var s : storage) : unit is
block{
  const councilAddress : address = case s.generalContracts["council"] of
      Some(_address) -> _address
      | None -> failwith("Error. Council Contract is not found.")
  end;
  if (Tezos.sender = councilAddress) then skip
  else failwith("Error. Only the Council Contract can call this entrypoint.");
} with unit

function checkSenderIsEmergencyGovernanceContract(var s : storage) : unit is
block{
  const emergencyGovernanceAddress : address = case s.generalContracts["emergencyGovernance"] of
      Some(_address) -> _address
      | None -> failwith("Error. Emergency Governance Contract is not found.")
  end;
  if (Tezos.sender = emergencyGovernanceAddress) then skip
  else failwith("Error. Only the Emergency Governance Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("Error. This entrypoint should not receive any tez.");
// admin helper functions end --

// helper functions begin: --

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

// Governance Lambda Methods: callGovernanceLambda, setupLambdaFunction
#include "../partials/governance/governanceLambdaMethods.ligo"

// Governance Lambdas: e.g. updateGovernanceConfig, updateDelegationConfig
#include "../partials/governance/governanceLambdas.ligo"

function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdminOrSelf(s); // check that sender is admin

  const updateConfigAction    : updateGovernanceConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType           = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of
    ConfigSuccessReward (_v)              -> {
        // set boundary - do for the rest
        s.config.successReward              := updateConfigNewValue
      }
  | ConfigMinQuorumPercentage (_v)        -> s.config.minQuorumPercentage        := updateConfigNewValue
  | ConfigMinQuorumMvkTotal (_v)          -> s.config.minQuorumMvkTotal          := updateConfigNewValue
  | ConfigVotingPowerRatio (_v)           -> s.config.votingPowerRatio           := updateConfigNewValue
  | ConfigProposalSubmissionFee (_v)      -> s.config.proposalSubmissionFee      := updateConfigNewValue
  | ConfigMinimumStakeReqPercentage (_v)  -> s.config.minimumStakeReqPercentage  := updateConfigNewValue
  | ConfigMaxProposalsPerDelegate (_v)    -> s.config.maxProposalsPerDelegate    := updateConfigNewValue
  | ConfigNewBlockTimeLevel (_v)          -> s.config.newBlockTimeLevel          := updateConfigNewValue
  | ConfigNewBlocksPerMinute (_v)         -> s.config.newBlocksPerMinute         := updateConfigNewValue
  | ConfigBlocksPerMinute (_v)            -> s.config.blocksPerMinute            := updateConfigNewValue
  | ConfigBlocksPerProposalRound (_v)     -> s.config.blocksPerProposalRound     := updateConfigNewValue
  | ConfigBlocksPerVotingRound (_v)       -> s.config.blocksPerVotingRound       := updateConfigNewValue
  | ConfigBlocksPerTimelockRound (_v)     -> s.config.blocksPerTimelockRound     := updateConfigNewValue
  end;

} with (noOperations, s)


// helper function to send operation to governance lambda
function sendOperationToGovernanceLambda(const _p : unit) : contract(executeActionType) is
  case (Tezos.get_entrypoint_opt(
      "%callGovernanceLambdaProxy",
      Tezos.self_address) : option(contract(executeActionType))) of
    Some(contr) -> contr
  | None -> (failwith("callGovernanceLambdaProxy entrypoint in Governance Contract not found") : contract(executeActionType))
  end;

// helper function to fetch satellite's balance and total delegated amount from delegation contract
function fetchSatelliteBalanceAndTotalDelegatedAmount(const contractAddress : address) : contract(address * contract(address * nat * nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getSatelliteVotingPower",
      contractAddress) : option(contract(address * contract(address * nat * nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetSatelliteVotingPower entrypoint in Delegation Contract not found") : contract(address * contract(address * nat * nat)))
  end;

// helper function for financial requests to fetch satellite's total voting power from delegation contract
function financialRequestFetchSatelliteTotalVotingPower(const contractAddress : address) : contract(getSatelliteRequestSnapshotType) is
  case (Tezos.get_entrypoint_opt(
      "%getSatelliteRequestSnapshot",
      contractAddress) : option(contract(getSatelliteRequestSnapshotType))) of
    Some(contr) -> contr
  | None -> (failwith("GetSatelliteRequestSnapshot entrypoint in Delegation Contract not found") : contract(getSatelliteRequestSnapshotType))
  end;


// helper function to get satellite snapshot 
function getSatelliteSnapshotRecord (const satelliteAddress : address; const s : storage) : snapshotRecordType is
  block {
    var satelliteSnapshotRecord : snapshotRecordType :=
      record [
        totalMvkBalance         = 0n;                            // log of satellite's total mvk balance for this cycle
        totalDelegatedAmount    = 0n;                            // log of satellite's total delegated amount 
        totalVotingPower        = 0n;                            // calculated total voting power based on votingPowerRatio (i.e. self bond percentage)   
        currentCycleStartLevel  = s.currentRoundStartLevel;      // log of current cycle's starting block level
        currentCycleEndLevel    = s.currentCycleEndLevel         // log of when cycle (proposal + voting) will end
      ];

    case s.snapshotLedger[satelliteAddress] of
      None -> skip
    | Some(instance) -> satelliteSnapshotRecord := instance
    end;

  } with satelliteSnapshotRecord

// helper function to get MVK total supply (from mvk token contract)
function getMvkTotalSupply(const tokenAddress : address) : contract(contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalSupply",
      tokenAddress) : option(contract(contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalSupply entrypoint in MVK Token Contract not found") : contract(contract(nat)))
  end;

// helper function to get staked MVK total supply (from doorman contract)
function getStakedMvkTotalSupply(const contractAddress : address) : contract(contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalStakedSupply",
      contractAddress) : option(contract(contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalStakedSupply entrypoint in Doorman Contract not found") : contract(contract(nat)))
  end;

// helper function to get staked MVK balance of user (from doorman contract)
function getStakedMvkBalance(const contractAddress : address) : contract(address * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getStakedBalance",
      contractAddress) : option(contract(address * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetStakedBalance entrypoint in Doorman Contract not found") : contract(address * contract(nat)))
  end;

// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. Transfer entrypoint in Treasury Contract not found") : contract(transferTokenType))
  end;

// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
  case (Tezos.get_entrypoint_opt(
      "%mintMvkAndTransfer",
      contractAddress) : option(contract(mintMvkAndTransferType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. MintMvkAndTransfer entrypoint in Treasury Contract not found") : contract(mintMvkAndTransferType))
  end;

  function setProposalRecordVote(const voteType : nat; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is
  block {

        if voteType = 1n then block {
            _proposal.upvoteCount := _proposal.upvoteCount + 1n;    
            _proposal.upvoteMvkTotal := _proposal.upvoteMvkTotal + totalVotingPower;
            _proposal.quorumMvkTotal := _proposal.quorumMvkTotal + totalVotingPower;
        } else skip;

        if voteType = 0n then block {
            _proposal.downvoteCount := _proposal.downvoteCount + 1n;    
            _proposal.downvoteMvkTotal := _proposal.downvoteMvkTotal + totalVotingPower;
        } else skip;

        if voteType = 2n then block {
            _proposal.abstainCount := _proposal.abstainCount + 1n;    
            _proposal.abstainMvkTotal := _proposal.abstainMvkTotal + totalVotingPower;
        } else skip;

        _proposal.quorumCount := _proposal.quorumCount + 1n;

  } with _proposal

  function unsetProposalRecordVote(const voteType : nat; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is 
  block {
        
        if voteType = 1n then block {
            
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

        } else skip;

        if voteType = 0n then block {

            var downvoteCount     : nat := 0n;
            var downvoteMvkTotal  : nat := 0n;

            if _proposal.downvoteCount < 1n then downvoteCount := 0n
              else downvoteCount := abs(_proposal.downvoteCount - 1n);

            if _proposal.downvoteMvkTotal < totalVotingPower then downvoteMvkTotal := 0n
              else downvoteMvkTotal := abs(_proposal.downvoteMvkTotal - totalVotingPower);

            _proposal.downvoteCount     := downvoteCount;
            _proposal.downvoteMvkTotal  := downvoteMvkTotal;

        } else skip;

        if voteType = 2n then block {

            var abstainCount : nat := 0n;
            var abstainMvkTotal : nat := 0n;

            if _proposal.abstainCount < 1n then abstainCount := 0n
              else abstainCount := abs(_proposal.abstainCount - 1n);

            if _proposal.abstainMvkTotal < totalVotingPower then abstainMvkTotal := 0n
              else abstainMvkTotal := abs(_proposal.abstainMvkTotal - totalVotingPower);

            _proposal.abstainCount      := abstainCount;
            _proposal.abstainMvkTotal   := abstainMvkTotal;

        } else skip;

  } with _proposal

// break glass helper function to pause all entrypoints in contract 
function pauseAllEntrypointsInContract(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%pauseAll",
      contractAddress) : option(contract(unit))) of
    Some(contr) -> contr
  | None -> (failwith("pauseAll entrypoint in Contract Address not found") : contract(unit))
  end;

// break glass helper function to set admin entrypoints in contract 
function setAdminInContract(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%setAdmin",
      contractAddress) : option(contract(address))) of
    Some(contr) -> contr
  | None -> (failwith("setAdmin entrypoint in Contract Address not found") : contract(address))
  end;
// helper functions end: --

// housekeeping functions begin: --

(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)

// set temp MVK total supply, and quorum
function setSnapshotMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    
    checkNoAmount(Unit);                    // should not receive any tez amount
    checkSenderIsMvkTokenContract(s);       // check this call is comming from the mvk Token contract

    s.snapshotMvkTotalSupply := totalSupply;

    // var minQuorumPercentage : nat := s.config.minQuorumPercentage; // e.g. 5% -> 5000

    // var minQuorumMvkTotal : nat := abs(minQuorumPercentage * totalSupply / 100_000);

    // s.config.minQuorumMvkTotal := minQuorumMvkTotal;

} with (noOperations, s)

// set temp staked MVK total supply
function setSnapshotStakedMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    
    checkNoAmount(Unit);                    // should not receive any tez amount
    checkSenderIsDoormanContract(s);        // check this call is coming from the Doorman contract

    s.snapshotStakedMvkTotalSupply := totalSupply;

} with (noOperations, s)

// housekeeping functions end: --

function breakGlass(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. set admin to breakglass address in major contracts (doorman, delegation etc)
    // 2. send pause all operations to main contracts

    // check that sender is from emergency governance contract 
    checkSenderIsEmergencyGovernanceContract(s);

    const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of
      Some(_address) -> _address
      | None -> failwith("Error. Break Glass Contract is not found")
    end;


    var operations : list(operation) := nil;
    for _contractName -> contractAddress in map s.generalContracts block {
        const pauseAllEntrypointsInContractOperation : operation = Tezos.transaction(
            unit, 
            0tez, 
            pauseAllEntrypointsInContract(contractAddress)
        );
        operations := pauseAllEntrypointsInContractOperation # operations;

        const setContractAdminToBreakGlassOperation : operation = Tezos.transaction(
            _breakGlassAddress, 
            0tez, 
            setAdminInContract(contractAddress)
        );
        operations := setContractAdminToBreakGlassOperation # operations;
    } 
    
} with (operations, s)

function updateActiveSatellitesMap(const satelliteAddress : address; var s : storage) is 
block {

  // failwith("test that updateActiveSatellitesMap is called by delegation upon new satellite registration");
    // s.tempFlag := satelliteAddress;
    checkNoAmount(Unit);                      // should not receive any tez amount
    checkSenderIsDelegationContract(s);       // check this call is comming from the Delegation contract

    // check if satellite exists in the active satellites map 
    const activeSatelliteExistsFlag : bool = Map.mem(satelliteAddress, s.activeSatellitesMap);

    // toggle addition/removal of satellite when this entrypoint is called from the delegation contract - registerAsSatellite / unregisterAsSatellite
    if activeSatelliteExistsFlag = False then block{
        s.activeSatellitesMap[satelliteAddress] := Tezos.now;
    } else block {
        remove satelliteAddress from map s.activeSatellitesMap;      
    }

} with (noOperations, s)

function setSatelliteVotingPowerSnapshot(const satelliteAddress : address; const mvkBalance : nat; const totalDelegatedAmount : nat; var s : storage) : return is 
block {

    checkNoAmount(Unit);                // should not receive any tez amount      
    checkSenderIsDelegationContract(s); // check sender is Delegation Contract

    // create or retrieve satellite snapshot from snapshotLedger in storage
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

} with (noOperations, s)


function startProposalRound(var s : storage) : return is
block {
    
    // Steps Overview:
    // 1. verify sender is admin 
    // 2. reset currentRoundHighestVotedProposalId
    // 3. update currentRound, currentRoundStartLevel, currentRoundEndLevel
    // 4. flush maps - currentRoundProposals, currentRoundVoters
    // 5. take snapshot of satellite's MVK and update snapshotLedger
    // 6. take snapshot of MVK total supply 

    // check that sender is admin
    checkSenderIsAdminOrSelf(s);
    s.tempFlag := Tezos.level;

    var operations : list(operation) := nil;

    // reset state variables
    var emptyProposalMap  : map(nat, nat)     := map [];
    var emptyVotesMap     : map(address, nat) := map [];

    s.currentRound                         := "proposal";
    s.currentRoundStartLevel               := Tezos.level;
    s.currentRoundEndLevel                 := Tezos.level + s.config.blocksPerProposalRound;
    s.currentCycleEndLevel                 := Tezos.level + s.config.blocksPerProposalRound + s.config.blocksPerVotingRound + s.config.blocksPerTimelockRound;
    s.currentRoundProposals                := emptyProposalMap;    // flush proposals
    s.currentRoundVotes                    := emptyVotesMap;       // flush voters
    s.currentRoundHighestVotedProposalId   := 0n;                  // flush proposal id voted through - reset to 0 

    const delegationAddress : address = case s.generalContracts["delegation"] of
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    end;

    const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
      Some(_address) -> _address
      | None -> failwith("Error. MVK Token Contract is not found")
    end;

    // update snapshot MVK total supply
    const setSnapshotMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setSnapshotMvkTotalSupply");    
    const updateMvkTotalSupplyOperation : operation = Tezos.transaction(
         (setSnapshotMvkTotalSupplyCallback),
         0tez, 
         getMvkTotalSupply(mvkTokenAddress)
         );

    operations := updateMvkTotalSupplyOperation # operations;

    // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
    for satellite -> _timestamp in map s.activeSatellitesMap block {
        const setSatelliteVotingPowerSnapshotCallback : contract(address * nat * nat) = Tezos.self("%setSatelliteVotingPowerSnapshot");
        const fetchSatelliteBalanceAndTotalDelegatedAmountOperation : operation = Tezos.transaction(
            (satellite, setSatelliteVotingPowerSnapshotCallback), 
            0tez, 
            fetchSatelliteBalanceAndTotalDelegatedAmount(delegationAddress)
        );
        operations := fetchSatelliteBalanceAndTotalDelegatedAmountOperation # operations;
    } 

} with (operations, s)

(* Propose Entrypoint *)
function propose(const newProposal : newProposalType ; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. verify that the current round is a governance proposal round
    // 2. verify that current block level has not exceeded round's end level 
    // 3. verify that user is a satellite, has sufficient staked MVK to propose (data taken from snapshot of all active satellite holdings at start of governance round)
    // 4. todo: check that proposer has sent enough tez to cover the submission fee
    // 5. submit (save) proposal - note: proposer does not automatically vote pass for his proposal
    // 6. add proposal id to current round proposals map
    s.tempFlag := Tezos.level;

    if s.currentRound = "proposal" then skip
        else failwith("Error. You can only make a proposal during a proposal round.");

    // if Tezos.level > s.currentRoundEndLevel then failwith("Current proposal round has ended.")
    //   else skip;

    // check if satellite exists in the active satellites map
    const activeSatelliteExistsFlag : bool = Map.mem(Tezos.sender, s.activeSatellitesMap);
    if activeSatelliteExistsFlag = False then failwith("Error. You need to be a satellite to make a governance proposal.")
      else skip;

    const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of
        None -> failwith("Error. Snapshot of your holdings not taken. Please wait for the next governance round.")
        | Some(snapshot) -> snapshot
    end;

    // minimumStakeReqPercentage - 5% -> 500 | snapshotMvkTotalSupply - mu 
    const minimumMvkRequiredForProposalSubmission = s.config.minimumStakeReqPercentage * s.snapshotMvkTotalSupply / 10_000;

    if satelliteSnapshot.totalMvkBalance < abs(minimumMvkRequiredForProposalSubmission) then failwith("You do not have the minimum MVK required to submit a proposal.")
      else skip; 

    const emptyPassVotersMap  : passVotersMapType     = map [];
    const emptyVotersMap      : votersMapType         = map [];
    const proposalMetadata    : proposalMetadataType  = map [];

    var newProposalRecord : proposalRecordType := record [
        proposerAddress         = Tezos.sender;
        proposalMetadata        = proposalMetadata;

        status                  = "ACTIVE";                        // status: "ACTIVE", "DROPPED"
        title                   = newProposal.0;                   // title
        description             = newProposal.1;                   // description
        invoice                 = newProposal.2;                   // ipfs hash of invoice file
        successReward           = s.config.successReward;          // log of successful proposal reward for voters - may change over time
        executed                = False;                           // boolean: executed set to true if proposal is executed
        locked                  = False;                           // boolean: locked set to true after proposer has included necessary metadata and proceed to lock proposal
        
        passVoteCount           = 0n;                              // proposal round: pass votes count (to proceed to voting round)
        passVoteMvkTotal        = 0n;                              // proposal round pass vote total mvk from satellites who voted pass
        passVotersMap           = emptyPassVotersMap;              // proposal round ledger

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

        currentCycleStartLevel  = s.currentRoundStartLevel;        // log current round/cycle start level
        currentCycleEndLevel    = s.currentCycleEndLevel;          // log current cycle end level
    ];

    // save proposal to proposalLedger
    s.proposalLedger[s.nextProposalId] := newProposalRecord;

    // add proposal id to current round proposals and initialise with zero positive votes in MVK 
    s.currentRoundProposals[s.nextProposalId] := 0n;

    // increment next proposal id
    s.nextProposalId := s.nextProposalId + 1n;

} with (noOperations, s)

(* AddUpdateProposalData Entrypoint *)
// type addUpdateProposalDataType is (nat * string * bytes) // proposal id, proposal metadata title or description, proposal metadata in bytes
function addUpdateProposalData(const proposalData : addUpdateProposalDataType; var s : storage) : return is 
block {

    if s.currentRound = "proposal" then skip
        else failwith("Error. You can only add or update proposal data during a proposal round.");

    const proposalId     : nat     = proposalData.0;
    const proposalTitle  : string  = proposalData.1;
    const proposalBytes  : bytes   = proposalData.2;

    var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of 
        Some(_record) -> _record
      | None -> failwith("Error. Proposal not found.")
    end;

    // check that proposal is not locked
    if proposalRecord.locked = True then failwith("Error. Proposal is locked.")
      else skip;

    // check that sender is the creator of the proposal 
    if proposalRecord.proposerAddress =/= Tezos.sender then failwith("Error. Only the proposer can add or update data.")
      else skip;

    // Add or update data to proposal
    proposalRecord.proposalMetadata[proposalTitle] := proposalBytes; 

    // save changes and update proposal ledger
    s.proposalLedger[proposalId] := proposalRecord;

} with (noOperations, s)


function lockProposal(const proposalId : nat; var s : storage) : return is 
block {

  if s.currentRound = "proposal" then skip
      else failwith("Error. You can only lock a proposal during a proposal round.");

  var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of 
      Some(_record) -> _record
    | None -> failwith("Error. Proposal not found.")
  end;

  // check that proposal is not locked
  if proposalRecord.locked = True then failwith("Error. Proposal is already locked.")
      else skip;

  proposalRecord.locked        := True; 
  s.proposalLedger[proposalId] := proposalRecord;

} with (noOperations, s)

(* ProposalRoundVote Entrypoint *)
function proposalRoundVote(const proposalId : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. verify that current round is a proposal round
    // 2. verify that user is an active satellite and is allowed to vote (address is in activeSatellitesMap)
    // 3. verify that proposal is active and has not been dropped
    // 4. verify that snapshot of satellite has been taken
    // 5. verify that proposal exists
    // 6a. if satellite has not voted in the current round, submit satellite's vote for proposal and update vote counts
    // 6b. if satellite has voted for another proposal in the current round, submit satellite's vote for new proposal and remove satellite's vote from previously voted proposal

    s.tempFlag := Tezos.level;

    if s.currentRound = "proposal" then skip
      else failwith("You can only make a proposal during a proposal round.");

    // check if satellite exists in the active satellites map
    // const activeSatelliteExistsFlag : bool = Map.mem(Tezos.sender, s.activeSatellitesMap);
    // if activeSatelliteExistsFlag = False then failwith("You need to be a satellite to vote for a governance proposal.")
    //   else skip;

    const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of
        None -> failwith("Error. Snapshot of your holdings not taken. Please wait for the next governance round.")
        | Some(snapshot) -> snapshot
    end;

    // check if proposal exists in the current round's proposals
    const checkProposalExistsFlag : bool = Map.mem(proposalId, s.currentRoundProposals);
    if checkProposalExistsFlag = False then failwith("Error: Proposal not found.")
      else skip;

    var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of
        Some(_proposal) -> _proposal
        | None -> failwith("Error: Proposal not found")
    end;

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
        const previousVotedProposalId : nat = case s.currentRoundVotes[Tezos.sender] of
            Some(_id) -> _id
            | None -> failwith("Error: Previously voted proposal not found.")
        end;

        var _previousProposal : proposalRecordType := case s.proposalLedger[previousVotedProposalId] of
            Some(_previousProposal) -> _previousProposal
            | None -> failwith("Error: Previous proposal not found")
        end;

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

        // increment proposal with satellite snapshot's total voting power
        s.currentRoundProposals[proposalId] := newPassVoteMvkTotal;

        // update current round votes with satellite's address -> new proposal id
        s.currentRoundVotes[Tezos.sender] := proposalId;    
    } 

} with (noOperations, s)

(* StartVotingRound Entrypoint *)
// function startVotingRound(var s : storage) : return is
// block {
    
//     // Steps Overview:
//     // 1. verify sender is admin
//     // 2. set current round from "proposal" to "voting", and reset current round start level and end level - current round duration should be equal to current cycle end level minus timelock duration
//     // 3a. get ids of current proposals, and select the proposal with highest vote
//     // 3b. if there is no proposal, restart proposal round
    
//     checkSenderIsAdmin(s);

//     s.tempFlag := Tezos.level;

//     // voting round can be triggered at any time by admin,  but boundaries will still remain fixed to the start and end of the cycle (calculated at start of proposal round)
//     s.currentRound               := "voting";
//     s.currentRoundStartLevel     := s.currentRoundEndLevel + 1n;
//     s.currentRoundEndLevel       := s.currentRoundEndLevel + s.config.blocksPerVotingRound;

//     s.timelockProposalId         := 0n;                  // flush proposal id in timelock - reset to 0

//     // simple loop to get the proposal with the highest vote count in MVK 
//     var _highestVoteCounter : nat := 0n;
//     var highestVotedProposalId : nat := 0n;
//     for proposalId -> voteCount in map s.currentRoundProposals block {
//         if voteCount > _highestVoteCounter then block {
//              _highestVoteCounter := voteCount;
//              highestVotedProposalId := proposalId;
//         } else skip;
//     };

//     var operations : list(operation) := nil;

//     if highestVotedProposalId =/= 0n then block {

//         // set the current round highest voted proposal id
//         s.currentRoundHighestVotedProposalId := highestVotedProposalId;

//         // flush current round votes - to prepare for voting round
//         var emptyCurrentRoundVotes : map(address, nat) := map[];
//         s.currentRoundVotes := emptyCurrentRoundVotes;

//     } else block {
//         // restart - another proposal round
//         const restartProposalRoundEntrypoint : contract(unit) = Tezos.self("%startProposalRound");
//         const restartProposalRoundOperation : operation = Tezos.transaction(
//             unit, 
//             0tez, 
//             restartProposalRoundEntrypoint
//         );
//         operations := restartProposalRoundOperation # operations;
//     }

// } with (operations, s)

// (* VotingRoundVote Entrypoint *)
// function votingRoundVote(const proposalId : nat; const voteType : nat; var s : storage) : return is 
// block {
//     // Steps Overview:
//     // 1. verify that round is a voting round
//     // 2. verify that user is a satellite, and is allowed to vote for the current voting round with his snapshot taken
//     // 3. verify that proposal exists, proposal is active and has not been dropped
//     // 4. verify that vote type is a valid type - i.e. set of 1n, 0n, 2n - Yay, Nay, Abstain 
//     // 5. submit satellite's vote for proposal and update vote counts
    
//     s.tempFlag := Tezos.level;

//     if s.currentRound = "voting" then skip
//         else failwith("Error. You can only vote during the voting round.");

//     if s.currentRoundHighestVotedProposalId = 0n then failwith("Error: No proposal to vote for. Please wait for the next proposal round to begin.")
//       else skip; 

//     // if Tezos.level > s.currentRoundEndLevel then failwith("Current voting round has ended.")
//     //   else skip;

//     // check if satellite exists in the active satellites map
//     const activeSatelliteExistsFlag : bool = Map.mem(Tezos.sender, s.activeSatellitesMap);
//     if activeSatelliteExistsFlag = False then failwith("You need to be a satellite to vote for a governance proposal.")
//       else skip;

//     const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of
//         None -> failwith("Error. Snapshot of your holdings not taken. Please wait for the next governance round.")
//         | Some(snapshot) -> snapshot
//     end;

//     // check if proposal exists in the current round's proposals
//     const checkProposalExistsFlag : bool = Map.mem(proposalId, s.currentRoundProposals);
//     if checkProposalExistsFlag = False then failwith("Error: Proposal not found in the current round.")
//       else skip;

//     var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of
//         None -> failwith("Error: Proposal not found in the proposal ledger.")
//         | Some(_proposal) -> _proposal        
//     end;

//     // verify that proposal is active and has not been dropped
//     if _proposal.status = "DROPPED" then failwith("Error: Proposal has been dropped.")
//       else skip;

//     // verify that vote type is valid
//     const voteTypeSet : set (nat) = set [1n; 0n; 2n];
//     const validVoteType : bool = voteTypeSet contains voteType;
//     if validVoteType = False then failwith("Error: Vote type is not valid.")
//       else skip;

//     // note: currentRoundVotes change in the use of nat from proposal round (from proposal id to vote type)
//     //  i.e. (satelliteAddress, voteType - 1n/0n/2n) - 1n: Yay | 0n: Nay | 2n: Abstain
//     const checkIfSatelliteHasVotedFlag : bool = Map.mem(Tezos.sender, s.currentRoundVotes);
//     if checkIfSatelliteHasVotedFlag = False then block {
//         // satellite has not voted - add new vote
        
//         _proposal.voters[Tezos.sender] := (voteType, satelliteSnapshot.totalVotingPower, Tezos.now);

//         // set proposal record based on vote type 
//         var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);
        
//         // update proposal with new vote changes
//         s.proposalLedger[proposalId] := _proposal;

//     } else block {
//         // satellite has already voted - change of vote
        
//         // get previous vote
//         var previousVote : (nat * nat * timestamp) := case _proposal.voters[Tezos.sender] of 
//             | None -> failwith("Error: Previous vote not found.")
//             | Some(_previousVote) -> _previousVote
//         end;

//         const previousVoteType = previousVote.0;

//         // check if new vote is the same as old vote
//         if previousVoteType = voteType then failwith ("Error: Your vote has already been recorded.")
//           else skip;

//         // save new vote
//         _proposal.voters[Tezos.sender] := (voteType, satelliteSnapshot.totalVotingPower, Tezos.now);

//         // set proposal record based on vote type 
//         var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);

//         // unset previous vote in proposal record
//         var _proposal : proposalRecordType := unsetProposalRecordVote(previousVoteType, satelliteSnapshot.totalVotingPower, _proposal);
        
//         // update proposal with new vote changes
//         s.proposalLedger[proposalId] := _proposal;
        
//     }

// } with (noOperations, s)

(* StartTimelockRound Entrypoint *)
// function startTimelockRound(var s : storage) : return is
// block {
    
//     // Steps Overview:
//     // 1. verify sender is admin
//     // 2. set current round from "voting" to "timelock", and set current round start level and end level 
//     // 3. set timelockProposalId to currentRoundHighestVotedProposalId
    
//     checkSenderIsAdmin(s);

//     // timelock round can be triggered at any time by admin, but boundaries will still remain fixed to the start and end of the cycle (calculated at start of proposal round)
//     s.currentRound               := "timelock";
//     s.currentRoundStartLevel     := s.currentRoundEndLevel + 1n;
//     s.currentRoundEndLevel       := s.currentCycleEndLevel;

//     // set timelockProposalId to currentRoundHighestVotedProposalId
//     s.timelockProposalId         := s.currentRoundHighestVotedProposalId; 

// } with (noOperations, s)

(* ExecuteProposal Entrypoint *)
// function executeProposal(const proposalId : nat; var s : storage) : return is 
// block {
//     // Steps Overview: 
//     // 1. verify that user is a satellite and can execute proposal
//     // 2. verify that proposal can be executed
//     // 3. execute proposal - list of operations to run

//     // to be confirmed: who should execute the proposal? originator/admin/anyone? 
//     // checkSenderIsSelf(Unit);
//     checkSenderIsAdminOrSelf(s);

//     // check that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
//     if s.currentRound = "timelock" or s.currentRound = "voting" then failwith("Error. Proposal can only be executed after timelock period ends.");
//         else skip;

//     // check that there is a highest voted proposal in the current round
//     if s.timelockProposalId = 0n then failwith("Error: No proposal to execute. Please wait for the next proposal round to begin.")
//       else skip; 

//     // check that proposal to be executed is the timelock proposal
//     if s.timelockProposalId =/= proposalId then failwith("Error: This proposal is not the highest voted proposal and cannot be executed.")
//       else skip; 

//     var proposal : proposalRecordType := case s.proposalLedger[proposalId] of
//         Some(_record) -> _record
//       | None -> failwith("Error. Proposal not found.")
//     end;

//     if proposal.executed = True then failwith("Error. Proposal has already been executed")
//       else skip;

//     // check that there is at least one proposal metadata to execute
//     if Map.size(proposal.proposalMetadata) = 0n then failwith("Error. No data to execute.")
//       else skip;

//     var operations : list(operation) := nil;

//     // update proposal executed boolean to True
//     proposal.executed            := True;
//     s.proposalLedger[proposalId] := proposal;    

//     // loop metadata for execution
//     for _title -> metadataBytes in map proposal.proposalMetadata block {

//       const executeAction : executeActionType = case (Bytes.unpack(metadataBytes) : option(executeActionType)) of
//         | Some(_action) -> _action
//         | None    -> failwith("Error. Unable to unpack proposal metadata.")
//       end;

//       const sendActionToGovernanceLambdaOperation : operation = Tezos.transaction(
//         executeAction,
//         0tez,
//         sendOperationToGovernanceLambda(unit)
//       );

//       operations := sendActionToGovernanceLambdaOperation # operations;
    
//     }     

// } with (operations, s)

// function dropProposal(const proposalId : nat; var s : storage) : return is 
// block {
//     // Steps Overview: 
//     // 1. verify that proposal is in the current round / cycle
//     // 2. verify that satellite made the proposal
//     // 3. change status of proposal to inactive

//     // check if satellite exists in the active satellites map
//     const activeSatelliteExistsFlag : bool = Map.mem(Tezos.sender, s.activeSatellitesMap);
//     if activeSatelliteExistsFlag = False then failwith("You need to be a satellite to make a governance action.")
//       else skip;

//     // check if proposal exists in the current round's proposals
//     const checkProposalExistsFlag : bool = Map.mem(proposalId, s.currentRoundProposals);
//     if checkProposalExistsFlag = False then failwith("Error: Proposal not found in the current round.")
//       else skip;

//     var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of
//         None -> failwith("Error: Proposal not found in the proposal ledger.")
//         | Some(_proposal) -> _proposal        
//     end;

//     // verify that proposal has not been dropped already
//     if _proposal.status = "DROPPED" then failwith("Error: Proposal has already been dropped.")
//       else skip;

//     if _proposal.proposerAddress = Tezos.sender then block {
//         _proposal.status               := "DROPPED";
//         s.proposalLedger[proposalId]   := _proposal;
//     } else failwith("Error: You are not allowed to drop this proposal.")
    
// } with (noOperations, s)


function requestTokens(const requestTokensParams : requestTokensType; var s : storage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];

  var newFinancialRequest : financialRequestRecordType := record [

        requesterAddress     = Tezos.sender;
        requestType          = "TRANSFER";
        status               = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
        ready                = False;
        executed             = False;
        expired              = False;      

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

        snapshotStakedMvkTotalSupply       = 0n;
        stakedMvkPercentageForApproval     = s.config.financialRequestApprovalPercentage; 
        stakedMvkRequiredForApproval       = 0n; 

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

    var operations : list(operation) := nil;

    const doormanAddress : address = case s.generalContracts["doorman"] of
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found")
    end;

    // --- update snapshot staked MVK total supply begin ----
    const requestSnapshotCompleteEntrypoint: contract(nat) =
      case (Tezos.get_entrypoint_opt("%requestStakedMvkSnapshot", Tezos.self_address) : option(contract(nat))) of
        Some(contr) -> contr
      | None -> (failwith("Error. RequestStakedMvkSnapshot entrypoint not found in Governance contract."): contract(nat))
      end;
    const requestSnapshotCompleteOperation: operation = Tezos.transaction(financialRequestId, 0tez, requestSnapshotCompleteEntrypoint);
    operations := requestSnapshotCompleteOperation # operations;

    const setSnapshotStakedMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setSnapshotStakedMvkTotalSupply");    
    const updateSnapshotStakedMvkTotalSupplyOperation : operation = Tezos.transaction(
         (setSnapshotStakedMvkTotalSupplyCallback),
         0tez, 
         getStakedMvkTotalSupply(doormanAddress)
         );
    operations := updateSnapshotStakedMvkTotalSupplyOperation # operations;
    // --- update snapshot staked MVK total supply end ----

    // set snapshot of satellites for financial request
    const delegationAddress : address = case s.generalContracts["delegation"] of
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    end;

    // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
    for satellite -> _timestamp in map s.activeSatellitesMap block {
        const setSatelliteVotingPowerSnapshotCallback : contract(requestSatelliteSnapshotType) = Tezos.self("%requestSatelliteSnapshot");
        const operationParams : getSatelliteRequestSnapshotType = record [
          satelliteAddress = satellite;
          requestId        = financialRequestId;
          callbackContract = setSatelliteVotingPowerSnapshotCallback;
        ];

        const financialRequestFetchSatelliteTotalVotingPowerOperation : operation = Tezos.transaction(
            operationParams, 
            0tez, 
            financialRequestFetchSatelliteTotalVotingPower(delegationAddress)
        );

        operations := financialRequestFetchSatelliteTotalVotingPowerOperation # operations;
    };

} with (operations, s)

function requestMint(const requestMintParams : requestMintType; var s : storage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];
  
  const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
    Some(_address) -> _address
    | None -> failwith("Error. MVK Token Contract is not found")
  end;

  var newFinancialRequest : financialRequestRecordType := record [

        requesterAddress     = Tezos.sender;
        requestType          = "MINT";
        status               = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
        ready                = False;
        executed             = False;
        expired              = False;      

        treasuryAddress      = requestMintParams.treasuryAddress;
        tokenContractAddress = mvkTokenAddress;
        tokenAmount          = requestMintParams.tokenAmount;
        tokenName            = "MVK"; 
        tokenType            = requestMintParams.tokenType;
        tokenId              = requestMintParams.tokenId;
        requestPurpose       = requestMintParams.purpose;
        voters               = emptyFinancialRequestVotersMap;

        approveVoteTotal     = 0n;
        disapproveVoteTotal  = 0n;

        snapshotStakedMvkTotalSupply       = 0n;
        stakedMvkPercentageForApproval     = s.config.financialRequestApprovalPercentage; 
        stakedMvkRequiredForApproval       = 0n; 

        requestedDateTime    = Tezos.now;               // log of when the request was submitted
        expiryDateTime       = Tezos.now + (86_400 * s.config.financialRequestDurationInDays);
    ];

    const financialRequestId : nat = s.financialRequestCounter;

    // save request to financial request ledger
    s.financialRequestLedger[financialRequestId] := newFinancialRequest;

    // increment financial request counter
    s.financialRequestCounter := financialRequestId + 1n;

    var operations : list(operation) := nil;

    const doormanAddress : address = case s.generalContracts["doorman"] of
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found")
    end;

    // create snapshot in financialRequestSnapshotLedger (to be filled with satellite's )
    const emptyFinancialRequestSnapshotMap  : financialRequestSnapshotMapType     = map [];
    s.financialRequestSnapshotLedger[financialRequestId] := emptyFinancialRequestSnapshotMap;

    // --- update snapshot staked MVK total supply begin ----
    const requestSnapshotCompleteEntrypoint: contract(nat) =
      case (Tezos.get_entrypoint_opt("%requestStakedMvkSnapshot", Tezos.self_address) : option(contract(nat))) of
        Some(contr) -> contr
      | None -> (failwith("Error. RequestStakedMvkSnapshot entrypoint not found in Governance contract."): contract(nat))
      end;
    const requestSnapshotCompleteOperation: operation = Tezos.transaction(financialRequestId, 0tez, requestSnapshotCompleteEntrypoint);
    operations := requestSnapshotCompleteOperation # operations;

    const setSnapshotStakedMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setSnapshotStakedMvkTotalSupply");    
    const updateSnapshotStakedMvkTotalSupplyOperation : operation = Tezos.transaction(
         (setSnapshotStakedMvkTotalSupplyCallback),
         0tez, 
         getStakedMvkTotalSupply(doormanAddress)
         );
    operations := updateSnapshotStakedMvkTotalSupplyOperation # operations;
    // --- update snapshot staked MVK total supply end ----

    // set snapshot of satellites for financial request
    const delegationAddress : address = case s.generalContracts["delegation"] of
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    end;

    // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
    for satellite -> _timestamp in map s.activeSatellitesMap block {
        const setSatelliteVotingPowerSnapshotCallback : contract(requestSatelliteSnapshotType) = Tezos.self("%requestSatelliteSnapshot");
        const operationParams : getSatelliteRequestSnapshotType = record [
          satelliteAddress = satellite;
          requestId        = financialRequestId;
          callbackContract = setSatelliteVotingPowerSnapshotCallback;
        ];

        const financialRequestFetchSatelliteTotalVotingPowerOperation : operation = Tezos.transaction(
            operationParams, 
            0tez, 
            financialRequestFetchSatelliteTotalVotingPower(delegationAddress)
        );

        operations := financialRequestFetchSatelliteTotalVotingPowerOperation # operations;
    }; 

} with (operations, s)

function requestStakedMvkSnapshot(const requestId : nat; var s : storage) : return is 
block {
  
  checkSenderIsAdminOrSelf(s);

  var financialRequest : financialRequestRecordType := case s.financialRequestLedger[requestId] of
    Some(_request) -> _request
    | None -> failwith("Error. Financial request not found. ")
  end;

  const snapshotStakedMvkTotalSupply    : nat = s.snapshotStakedMvkTotalSupply;
  const stakedMvkPercentageForApproval  : nat = financialRequest.stakedMvkPercentageForApproval; // 2 decimals - 51% to 5100

  // update financial request staked mvk required for approved based on latest snapshot, and set ready to True
  financialRequest.snapshotStakedMvkTotalSupply     := snapshotStakedMvkTotalSupply;
  financialRequest.stakedMvkRequiredForApproval     := abs((snapshotStakedMvkTotalSupply * stakedMvkPercentageForApproval) / 10000);
  financialRequest.ready                            := True;

  // save financial request
  s.financialRequestLedger[requestId] := financialRequest;

} with (noOperations, s)

function requestSatelliteSnapshot(const satelliteSnapshot : requestSatelliteSnapshotType; var s : storage) : return is 
block {

    checkNoAmount(Unit);                // should not receive any tez amount      
    checkSenderIsDelegationContract(s); // check sender is Delegation Contract

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
    
    var financialRequestSnapshot : financialRequestSnapshotMapType := case s.financialRequestSnapshotLedger[financialRequestId] of 
        None -> failwith("Error. Financial request snapshot not found.")
      | Some(snapshot) -> snapshot
    end;

    // update financal request snapshot map with record of satellite's total voting power
    financialRequestSnapshot[satelliteAddress]           := satelliteSnapshotRecord;

    // update financial request snapshot ledger bigmap with updated satellite's details
    s.financialRequestSnapshotLedger[financialRequestId] := financialRequestSnapshot;

} with (noOperations, s)

function dropFinancialRequest(const requestId : nat; var s : storage) : return is 
block {

  checkSenderIsCouncilContract(s);

  var financialRequest : financialRequestRecordType := case s.financialRequestLedger[requestId] of
    Some(_request) -> _request
    | None -> failwith("Error. Financial request not found. ")
  end;

  financialRequest.status := False;
  s.financialRequestLedger[requestId] := financialRequest;

} with (noOperations, s);

function voteForRequest(const voteForRequest : voteForRequestType; var s : storage) : return is 
block {
  
  // check if satellite exists in the active satellites map
  const activeSatelliteExistsFlag : bool = Map.mem(Tezos.sender, s.activeSatellitesMap);
  if activeSatelliteExistsFlag = False then failwith("Error. You need to be a satellite to vote for a financial request.")
    else skip;

  const financialRequestId : nat = voteForRequest.requestId;

  var _financialRequest : financialRequestRecordType := case s.financialRequestLedger[financialRequestId] of
    Some(_request) -> _request
    | None -> failwith("Error. Financial request not found. ")
  end;

  if _financialRequest.status    = False then failwith("Error. Financial request has been dropped.")          else skip;
  if _financialRequest.ready     = False then failwith("Error. Financial request is not ready yet.")          else skip;
  if _financialRequest.executed  = True  then failwith("Error. Financial request has already been executed.") else skip;

  if Tezos.now > _financialRequest.expiryDateTime then block {
    _financialRequest.expired := True;
    s.financialRequestLedger[financialRequestId] := _financialRequest;
    failwith("Error. Financial request has expired");
  } else skip;

  var operations : list(operation) := nil;

  const financialRequestSnapshot : financialRequestSnapshotMapType = case s.financialRequestSnapshotLedger[financialRequestId] of
    Some(_snapshot) -> _snapshot
    | None -> failwith("Error. Financial request snapshot not found.")
  end; 

  const satelliteSnapshotRecord : financialRequestSnapshotRecordType = case financialRequestSnapshot[Tezos.sender] of 
    Some(_record) -> _record
    | None -> failwith("Error. Satellite not found in financial request snapshot.")
  end;

  // Save and update satellite's vote record
  const voteType         : voteForRequestChoiceType  = voteForRequest.vote;
  const totalVotingPower : nat                       = satelliteSnapshotRecord.totalVotingPower;

  const newVoteRecord : financialRequestVoteType     = record [
      vote             = voteType;
      totalVotingPower = totalVotingPower;
      timeVoted        = Tezos.now;
  ];

  _financialRequest.voters[Tezos.sender] := newVoteRecord;
  s.financialRequestLedger[financialRequestId] := _financialRequest;

  // Satellite cast vote and send request to Treasury if enough votes have been gathered
  case voteType of
    Approve(_v) -> block {

        const newApproveVoteTotal : nat = _financialRequest.approveVoteTotal + totalVotingPower;

        _financialRequest.approveVoteTotal           := newApproveVoteTotal;
        s.financialRequestLedger[financialRequestId] := _financialRequest;

        // send request to treasury if total approved votes exceed staked MVK required for approval
        if newApproveVoteTotal > _financialRequest.stakedMvkRequiredForApproval then block {

          const treasuryAddress : address = _financialRequest.treasuryAddress;

          const councilAddress : address = case s.generalContracts["council"] of
            Some(_address) -> _address
            | None -> failwith("Error. Council Contract is not found")
          end;

          if _financialRequest.requestType = "TRANSFER" then block {

            // ---- set token type ----
            // var _tokenType : tokenType := Tez;

            // if  _financialRequest.tokenType = "XTZ" then block {
            //   var _tokenType : tokenType := Tez; 
            // } else skip;

            // if  _financialRequest.tokenType = "FA12" then block {
            //   var _tokenType : tokenType := Fa12(_financialRequest.tokenContractAddress); 
            // } else skip;

            // if  _financialRequest.tokenType = "FA2" then block {
            //   var _tokenType : tokenType := Fa2(record [
            //     token = _financialRequest.tokenContractAddress;
            //     id    = _financialRequest.tokenId;
            //   ]); 
            // } else skip;
            // --- --- ---

            // const _tokenType : requestTokenType = case _financialRequest.token_type_param of 
            //    Tez(_v)  -> unit
            //   | FA12(_v) -> _financialRequest.tokenContractAddress
            //   | FA2(_v)  -> record [
            //       token = _financialRequest.tokenContractAddress;
            //       id    = _financialRequest.tokenId;
            //     ]
            //   | NoToken(_v) -> failwith("Error. Not a token")
            // end;

             var _tokenType : tokenType := Fa2(record [
                token = _financialRequest.tokenContractAddress;
                id    = _financialRequest.tokenId;
              ]); 

            const transferTokenParams : transferTokenType = record [
              from_      = treasuryAddress;
              to_        = councilAddress;
              amt        = _financialRequest.tokenAmount;
              token      = _tokenType;
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
  end;
  
} with (operations, s)


function main (const action : governanceAction; const s : storage) : return is 
    case action of
        | BreakGlass(_parameters) -> breakGlass(s)  
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        | UpdateConfig(parameters) -> updateConfig(parameters, s)

        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
        | UpdateActiveSatellitesMap(parameters) -> updateActiveSatellitesMap(parameters.1, s)
        | SetSnapshotMvkTotalSupply(parameters) -> setSnapshotMvkTotalSupply(parameters, s)
        | SetSnapshotStakedMvkTotalSupply(parameters) -> setSnapshotStakedMvkTotalSupply(parameters, s)
        | SetSatelliteVotingPowerSnapshot(parameters) -> setSatelliteVotingPowerSnapshot(parameters.0, parameters.1, parameters.2, s)        
  
        | StartProposalRound(_parameters) -> startProposalRound(s)
        | Propose(parameters) -> propose((parameters.0, parameters.1, parameters.2), s)
        | ProposalRoundVote(parameters) -> proposalRoundVote(parameters, s)
        | AddUpdateProposalData(parameters) -> addUpdateProposalData(parameters, s)
        | LockProposal(parameters) -> lockProposal(parameters, s)

        // | StartVotingRound(_parameters) -> startVotingRound(s)        
        // | VotingRoundVote(parameters) -> votingRoundVote(parameters.0, parameters.1, s)
        
        // | StartTimelockRound(_parameters) -> startTimelockRound(s)        
        // | ExecuteProposal(parameters) -> executeProposal(parameters, s)
        // | DropProposal(parameters) -> dropProposal(parameters, s)

        | CallGovernanceLambdaProxy(parameters) -> callGovernanceLambdaProxy(parameters, s)
        | SetupLambdaFunction(parameters) -> setupLambdaFunction(parameters, s)

        | RequestTokens(parameters) -> requestTokens(parameters, s)
        | RequestMint(parameters) -> requestMint(parameters, s)
        | DropFinancialRequest(parameters) -> dropFinancialRequest(parameters, s)
        | RequestStakedMvkSnapshot(parameters) -> requestStakedMvkSnapshot(parameters, s)
        | RequestSatelliteSnapshot(parameters) -> requestSatelliteSnapshot(parameters, s)
        | VoteForRequest(parameters) -> voteForRequest(parameters, s)

    end