// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

type proposalIdType is nat 

// record for satellites
type satelliteRecordType is record [
    status                : nat;        // active: 1; inactive: 0; 
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    
    registeredDateTime    : timestamp;  

    // bondSufficiency       : nat;        // bond sufficiency flag - set to 1 if satellite has enough bond; set to 0 if satellite has not enough bond (over-delegated) when checked on governance action    
]

// Stores all voter data during proposal round
type proposalRoundVoteType is (nat * timestamp)           // total voting power (MVK) * timestamp
type passVotersMapType is map (address, proposalRoundVoteType)

// Stores all voter data during voting round
type voteForProposalChoiceType is 
  Yay of unit
| Nay of unit
| Abstain of unit
type votingRoundVoteType is (nat * timestamp * voteForProposalChoiceType)       // 1 is Yay, 0 is Nay, 2 is abstain * total voting power (MVK) * timestamp
type votersMapType is map (address, votingRoundVoteType)

type newProposalType is [@layout:comb] record [
  title         : string;
  description   : string;
  invoice       : string; // IPFS file
  sourceCode    : string; 
]        
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
    sourceCode           : string;                  // link to github / repo

    successReward        : nat;                     // log of successful proposal reward for voters - may change over time
    executed             : bool;                    // true / false
    locked               : bool;                    // true / false
    
    passVoteCount        : nat;                     // proposal round: pass votes count - number of satellites
    passVoteMvkTotal     : nat;                     // proposal round pass vote total mvk from satellites who voted pass
    passVotersMap        : passVotersMapType;       // proposal round ledger

    minProposalRoundVotePercentage  : nat;          // min vote percentage of total MVK supply required to pass proposal round
    minProposalRoundVotesRequired   : nat;          // min staked MVK votes required for proposal round to pass

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

    cycle                    : nat;                 // log of cycle that proposal belongs to
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
    status                  : bool;                  // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                : bool;                  // false on creation; set to true when financial request is executed successfully
    
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

    minProposalRoundVotePercentage  : nat; // percentage of staked MVK votes required to pass proposal round
    minProposalRoundVotesRequired   : nat; // amount of staked MVK votes required to pass proposal round

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
| ConfigMinProposalRoundVotePct of unit
| ConfigMinProposalRoundVotesReq of unit
| ConfigMinQuorumPercentage of unit
| ConfigMinQuorumMvkTotal of unit
| ConfigVotingPowerRatio of unit
| ConfigProposalSubmissionFee of unit
| ConfigMinimumStakeReqPercentage of unit
| ConfigMaxProposalsPerDelegate of unit
| ConfigNewBlockTimeLevel of unit
| ConfigBlocksPerProposalRound of unit
| ConfigBlocksPerVotingRound of unit
| ConfigBlocksPerTimelockRound of unit
| ConfigFinancialReqApprovalPct of unit
| ConfigFinancialReqDurationDays of unit

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

type tezType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
  tokenContractAddress    : address;
  tokenId                 : nat;
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

type roundType       is
| Proposal                  of unit
| Voting                    of unit
| Timelock                  of unit

type storage is record [
    admin                       : address;
    mvkTokenAddress             : address;

    config                      : configType;

    whitelistContracts          : whitelistContractsType;      
    whitelistTokenContracts     : whitelistTokenContractsType;      
    generalContracts            : generalContractsType; 
    
    proposalLedger              : proposalLedgerType;
    snapshotLedger              : snapshotLedgerType;

    startLevel                  : nat;                // use Tezos.level as start level
    nextProposalId              : nat;                // counter of next proposal id
    cycleCounter                : nat;                // counter of current cycle 
    
    // current round state variables - will be flushed periodically
    currentRound                : roundType;          // proposal, voting, timelock
    currentBlocksPerProposalRound      : nat;  // to determine duration of proposal round
    currentBlocksPerVotingRound        : nat;  // to determine duration of voting round
    currentBlocksPerTimelockRound      : nat;  // timelock duration in blocks - 2 days e.g. 5760 blocks (one block is 30secs with granadanet) - 1 day is 2880 blocks
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

type requestTokensType is [@layout:comb] record [
    treasuryAddress       : address;  // treasury address
    tokenContractAddress  : address;  // token contract address
    tokenName             : string;   // token name should be in whitelist token contracts map in governance contract
    tokenAmount           : nat;      // token amount requested
    tokenType             : string;   
    tokenId               : nat;      // token amount requested
    purpose               : string;   // financial request purpose
]

type requestMintType is [@layout:comb] record [
    treasuryAddress       : address;  // treasury address
    tokenAmount           : nat;      // MVK token amount requested
    tokenType             : string;
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
    
    // Housekeeping
    | UpdateConfig of updateConfigParamsType
    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateWhitelistTokenContracts of updateWhitelistTokenContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams
    
    // Governance Helpers
    | SetSnapshotStakedMvkTotalSupply of (nat)  
    
    | StartNextRound of (unit)
    // | StartProposalRound of (unit)
    | Propose of newProposalType
    | ProposalRoundVote of proposalIdType
    | AddUpdateProposalData of addUpdateProposalDataType
    | LockProposal of proposalIdType  
    
    // | StartVotingRound of (unit)
    | VotingRoundVote of (voteForProposalChoiceType)
    
    // | StartTimelockRound of (unit)
    | ExecuteProposal of (unit)
    | DropProposal of (nat)

    // Governance Lambda
    | CallGovernanceLambdaProxy of executeActionType
    | SetupLambdaFunction of setupLambdaFunctionType

    // Financial Governance
    // | RequestTokens of requestTokensType
    // | RequestMint of requestMintType
    // | DropFinancialRequest of (nat)
    // | VoteForRequest of voteForRequestType

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
  const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  ];
  if (Tezos.sender = delegationAddress) then skip
  else failwith("Error. Only the Delegation Contract can call this entrypoint.");
} with unit

function checkSenderIsDoormanContract(var s : storage) : unit is
block{
  const doormanAddress : address = case s.generalContracts["doorman"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found.")
  ];
  if (Tezos.sender = doormanAddress) then skip
  else failwith("Error. Only the Doorman Contract can call this entrypoint.");
} with unit

function checkSenderIsMvkTokenContract(var s : storage) : unit is
block{
  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
  else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
} with unit

function checkSenderIsCouncilContract(var s : storage) : unit is
block{
  const councilAddress : address = case s.generalContracts["council"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Council Contract is not found.")
  ];
  if (Tezos.sender = councilAddress) then skip
  else failwith("Error. Only the Council Contract can call this entrypoint.");
} with unit

function checkSenderIsEmergencyGovernanceContract(var s : storage) : unit is
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

  case updateConfigAction of [
    ConfigSuccessReward (_v)              -> {
        // set boundary - do for the rest
        s.config.successReward              := updateConfigNewValue
      }
  | ConfigMinProposalRoundVotePct (_v)                -> s.config.minProposalRoundVotePercentage          := updateConfigNewValue
  | ConfigMinProposalRoundVotesReq (_v)               -> s.config.minProposalRoundVotesRequired           := updateConfigNewValue
  | ConfigMinQuorumPercentage (_v)                    -> s.config.minQuorumPercentage                     := updateConfigNewValue
  | ConfigMinQuorumMvkTotal (_v)                      -> s.config.minQuorumMvkTotal                       := updateConfigNewValue
  | ConfigVotingPowerRatio (_v)                       -> s.config.votingPowerRatio                        := updateConfigNewValue
  | ConfigProposalSubmissionFee (_v)                  -> s.config.proposalSubmissionFee                   := updateConfigNewValue
  | ConfigMinimumStakeReqPercentage (_v)              -> s.config.minimumStakeReqPercentage               := updateConfigNewValue
  | ConfigMaxProposalsPerDelegate (_v)                -> s.config.maxProposalsPerDelegate                 := updateConfigNewValue
  | ConfigNewBlockTimeLevel (_v)                      -> s.config.newBlockTimeLevel                       := updateConfigNewValue
  | ConfigBlocksPerProposalRound (_v)                 -> s.config.blocksPerProposalRound                  := updateConfigNewValue
  | ConfigBlocksPerVotingRound (_v)                   -> s.config.blocksPerVotingRound                    := updateConfigNewValue
  | ConfigBlocksPerTimelockRound (_v)                 -> s.config.blocksPerTimelockRound                  := updateConfigNewValue
  | ConfigFinancialReqApprovalPct (_v)                -> s.config.financialRequestApprovalPercentage      := updateConfigNewValue
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

    case s.snapshotLedger[satelliteAddress] of [
      None -> skip
    | Some(instance) -> satelliteSnapshotRecord := instance
    ];

  } with satelliteSnapshotRecord

// helper function to get startProposalRound entrypoint
function getStartProposalRoundEntrypoint(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%startProposalRound",
      contractAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith("StartProposalRound entrypoint in Governance Contract not found") : contract(unit))
  ];

// helper function to get startVotingRound entrypoint
function getStartVotingRoundEntrypoint(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%startVotingRound",
      contractAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith("StartVotingRound entrypoint in Governance Contract not found") : contract(unit))
  ];

// helper function to get startTimelockRound entrypoint
function getStartTimelockRoundEntrypoint(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%startTimelockRound",
      contractAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith("StartTimelockRound entrypoint in Governance Contract not found") : contract(unit))
  ];

// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferTokenType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. Transfer entrypoint in Treasury Contract not found") : contract(transferTokenType))
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
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

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

    const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Break Glass Contract is not found")
    ];

    var operations : list(operation) := nil;

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

// function startNextRound(var s : storage) : return is
// block {

//     // check if current round has ended
//     if s.currentRound = "timelock" and Tezos.level < s.currentRoundEndLevel 
//     then failwith("Error. New proposal round can only start after the current timelock round ends.") 
//     else skip;

//     if s.currentRound = "voting" and Tezos.level < s.currentRoundEndLevel 
//     then failwith("Error. Current voting round has not ended yet.") 
//     else skip;

//     if s.currentRound = "proposal" and Tezos.level < s.currentRoundEndLevel 
//     then failwith("Error. Current proposal round has not ended yet.") 
//     else skip;

//     // init operations
//     var operations : list(operation) := nil;

//     // current round is voting round
//     if s.currentRound = "voting" then block {

//       // fetch proposal
//       const votingRoundProposal : proposalRecordType = case s.proposalLedger[s.currentRoundHighestVotedProposalId] of [ 
//           Some(_proposalRecord) -> _proposalRecord
//         | None -> failwith("Error. Proposal not found.")
//       ];

//       if votingRoundProposal.upvoteMvkTotal < votingRoundProposal.minQuorumMvkTotal  then block {

//           // voting round proposal has sufficient upvotes
//           // start timelock round
//           const startTimelockRoundOperation : operation = Tezos.transaction(
//             unit, 
//             0tez, 
//             getStartTimelockRoundEntrypoint(Tezos.self_address)
//           );
//           operations := startTimelockRoundOperation # operations;

//       } else block {

//           // voting round proposal does not have sufficient upvotes
//           // start proposal round
//           const startProposalRoundOperation : operation = Tezos.transaction(
//             unit, 
//             0tez, 
//             getStartProposalRoundEntrypoint(Tezos.self_address)
//           );
//           operations := startProposalRoundOperation # operations;

//       };

//     } else skip;

//     // current round is proposal round
//     if s.currentRound = "proposal" then block {
      
//       // simple loop to get the proposal with the highest vote count in MVK 
//       var _highestVoteCounter     : nat := 0n;
//       var highestVotedProposalId  : nat := 0n;
//       for proposalId -> voteCount in map s.currentRoundProposals block {
//           if voteCount > _highestVoteCounter then block {
//               _highestVoteCounter := voteCount;
//               highestVotedProposalId := proposalId;
//           } else skip;
//       };

//       // check if there is a valid proposal 
//       if highestVotedProposalId =/= 0n then block {

//           // fetch proposal
//           const proposalRoundProposal : proposalRecordType = case s.proposalLedger[highestVotedProposalId] of [ 
//               Some(_proposalRecord) -> _proposalRecord
//             | None -> failwith("Error. Proposal not found.")
//           ];

//           if proposalRoundProposal.passVoteMvkTotal < proposalRoundProposal.minProposalRoundVotesRequired then block {

//             // highest voted proposal round proposal does not have enough pass votes to go on to voting round
//             // start another proposal round
//             const startProposalRoundOperation : operation = Tezos.transaction(
//               unit, 
//               0tez, 
//               getStartProposalRoundEntrypoint(Tezos.self_address)
//             );
//             operations := startProposalRoundOperation # operations; 

//           } else block {

//             // highest voted proposal round proposal has enough pass votes to go on to voting round
//             // start voting round
//             const startVotingRoundOperation : operation = Tezos.transaction(
//               unit, 
//               0tez, 
//               getStartVotingRoundEntrypoint(Tezos.self_address)
//             );
//             operations := startVotingRoundOperation # operations; 

//           }

//       } else block {

//         // no proposals
//         // start another proposal round
//         const startProposalRoundOperation : operation = Tezos.transaction(
//           unit, 
//           0tez, 
//           getStartProposalRoundEntrypoint(Tezos.self_address)
//         );
//         operations := startProposalRoundOperation # operations; 
//       };
      
//     } else skip;

//     // timelock round
//     // start another proposal round
//     const startProposalRoundOperation : operation = Tezos.transaction(
//       unit, 
//       0tez, 
//       getStartProposalRoundEntrypoint(Tezos.self_address)
//     );
//     operations := startProposalRoundOperation # operations; 

// } with (operations, s)

function setupProposalRound(var s: storage): storage is
  block {
    // reset state variables
    var emptyProposalMap  : map(nat, nat)     := map [];
    var emptyVotesMap     : map(address, nat) := map [];

    s.currentRound                         := (Proposal : roundType);
    s.currentBlocksPerProposalRound        := s.config.blocksPerProposalRound
    s.currentBlocksPerVotingRound          := s.config.blocksPerVotingRound
    s.currentBlocksPerTimelockRound        := s.config.blocksPerTimelockRound
    s.currentRoundStartLevel               := Tezos.level;
    s.currentRoundEndLevel                 := Tezos.level + s.config.blocksPerProposalRound;
    s.currentCycleEndLevel                 := Tezos.level + s.config.blocksPerProposalRound + s.config.blocksPerVotingRound + s.config.blocksPerTimelockRound;
    s.currentRoundProposals                := emptyProposalMap;    // flush proposals
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
    }
  } with (s)

function setupVotingRound(const highestVotedProposalId: nat; var s: storage): storage is
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

function setupTimelockRound(var s: storage): storage is
  block {
    // boundaries remain fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentRound               := (Timelock : roundType);
    s.currentRoundStartLevel     := s.currentRoundEndLevel + 1n;
    s.currentRoundEndLevel       := s.currentCycleEndLevel;

    // set timelockProposalId to currentRoundHighestVotedProposalId
    s.timelockProposalId         := s.currentRoundHighestVotedProposalId;
  } with (s)

function startNextRound(var s : storage) : return is
block {
  // Current round is not ended
  if Tezos.level < s.currentRoundEndLevel 
  then failwith("Error. The current round has not ended yet.") 
  else skip;

  // Get current variables
  const currentRoundHighestVotedProposal: option(proposalRecordType) = Big_map.find_opt(s.currentRoundHighestVotedProposalId, s.proposalLedger);
  // const timelockProposal: option(proposalRecordType) = Big_map.find_opt(s.timelockProposalId, s.proposalLedger);
  var _highestVoteCounter     : nat := 0n;
  var highestVotedProposalId  : nat := 0n;
  for proposalId -> voteCount in map s.currentRoundProposals block {
      if voteCount > _highestVoteCounter then block {
          _highestVoteCounter := voteCount;
          highestVotedProposalId := proposalId; 
      } else skip;
  };
  const proposalRoundProposal: option(proposalRecordType) = Big_map.find_opt(highestVotedProposalId, s.proposalLedger);

  // Switch depending on current round
  case s.currentRound of [
    Proposal -> case proposalRoundProposal of [
      Some (proposal) -> if highestVotedProposalId =/= 0n and proposal.passVoteMvkTotal >= proposal.minProposalRoundVotesRequired then
        // Start voting
        s := setupVotingRound(highestVotedProposalId, s)
      else
        // Start proposal
        s := setupProposalRound(s)
    | None -> failwith("Error. Highest voted proposal not found.")
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
    }
  ];
} with (noOperations, s)

// function startProposalRound(var s : storage) : return is
// block {
    
//     // Steps Overview:
//     // 1. verify sender is admin 
//     // 2. reset currentRoundHighestVotedProposalId
//     // 3. update currentRound, currentRoundStartLevel, currentRoundEndLevel
//     // 4. flush maps - currentRoundProposals, currentRoundVoters
//     // 5. take snapshot of satellite's MVK and update snapshotLedger
//     // 6. take snapshot of MVK total supply 

//     // sender can be anyone with staked MVK - at least 1

//     // current round is timelock round
//     if s.currentRound = "timelock" and Tezos.level < s.currentRoundEndLevel 
//     then failwith("Error. New proposal round can only start after the current timelock round ends.") 
//     else skip;

//     if s.currentRound = "voting" and Tezos.level < s.currentRoundEndLevel 
//     then failwith("Error. Current voting round has not ended yet.") 
//     else skip;

//     if s.currentRound = "proposal" and Tezos.level < s.currentRoundEndLevel 
//     then failwith("Error. Current proposal round has not ended yet.") 
//     else skip;

//     if s.currentRound = "voting" then block {

//       // fetch proposal
//       const votingRoundProposal : proposalRecordType = case s.proposalLedger[s.currentRoundHighestVotedProposalId] of [
//           Some(_proposalRecord) -> _proposalRecord
//         | None -> failwith("Error. Proposal not found.")
//       ];

//       if votingRoundProposal.upvoteMvkTotal < votingRoundProposal.minQuorumMvkTotal then skip else failwith("Error. Timelock round should be triggered next instead of Proposal Round.");

//     } else skip;

//     if s.currentRound = "proposal" then block {
      
//       // simple loop to get the proposal with the highest vote count in MVK 
//       var _highestVoteCounter     : nat := 0n;
//       var highestVotedProposalId  : nat := 0n;
//       for proposalId -> voteCount in map s.currentRoundProposals block {
//           if voteCount > _highestVoteCounter then block {
//               _highestVoteCounter := voteCount;
//               highestVotedProposalId := proposalId;
//           } else skip;
//       };

//       // check if there is a valid proposal 
//       if highestVotedProposalId =/= 0n then block {

//           // fetch proposal
//           const proposalRoundProposal : proposalRecordType = case s.proposalLedger[highestVotedProposalId] of [ 
//               Some(_proposalRecord) -> _proposalRecord
//             | None -> failwith("Error. Proposal not found.")
//           ];

//           if proposalRoundProposal.passVoteMvkTotal < proposalRoundProposal.minProposalRoundVotesRequired then skip else failwith("Error. Voting round should be triggered next instead of Proposal Round.");

//       } else skip;
      
//     } else skip;

//     // conditions fulfilled to start another proposal round

//     // init variables
//     var operations : list(operation) := nil;

//     // reset state variables
//     var emptyProposalMap  : map(nat, nat)     := map [];
//     var emptyVotesMap     : map(address, nat) := map [];

//     s.currentRound                         := "proposal";
//     s.currentRoundStartLevel               := Tezos.level;
//     s.currentRoundEndLevel                 := Tezos.level + s.config.blocksPerProposalRound;
//     s.currentCycleEndLevel                 := Tezos.level + s.config.blocksPerProposalRound + s.config.blocksPerVotingRound + s.config.blocksPerTimelockRound;
//     s.currentRoundProposals                := emptyProposalMap;    // flush proposals
//     s.currentRoundVotes                    := emptyVotesMap;       // flush voters
//     s.currentRoundHighestVotedProposalId   := 0n;                  // flush proposal id voted through - reset to 0 

//     const delegationAddress : address = case s.generalContracts["delegation"] of [
//       Some(_address) -> _address
//       | None -> failwith("Error. Delegation Contract is not found")
//     ];

//     // update snapshot MVK total supply
//     const mvkTotalSupplyView : option (nat) = Tezos.call_view ("getTotalSupply", unit, s.mvkTokenAddress);
//     s.snapshotMvkTotalSupply := case mvkTotalSupplyView of [
//       Some (value) -> value
//     | None -> (failwith ("Error. GetTotalSupply View not found in the MVK Token Contract") : nat)
//     ];

//     // Get active satellites from the delegation contract and loop through them
//     const activeSatellitesView : option (map(address,satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
//     const activeSatellites: map(address,satelliteRecordType) = case activeSatellitesView of [
//       Some (value) -> value
//     | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
//     ];

//     for satelliteAddress -> satellite in map activeSatellites block {

//       const mvkBalance: nat = satellite.stakedMvkBalance;
//       const totalDelegatedAmount: nat = satellite.totalDelegatedAmount;

//       // create or retrieve satellite snapshot from snapshotLedger in storage
//       var satelliteSnapshotRecord : snapshotRecordType := getSatelliteSnapshotRecord(satelliteAddress, s);

//       // calculate total voting power 
//       const maxTotalVotingPower = abs(mvkBalance * 10000 / s.config.votingPowerRatio);
//       const mvkBalanceAndTotalDelegatedAmount = mvkBalance + totalDelegatedAmount; 
//       var totalVotingPower : nat := 0n;
//       if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
//         else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

//       // update satellite snapshot record
//       satelliteSnapshotRecord.totalMvkBalance         := mvkBalance; 
//       satelliteSnapshotRecord.totalDelegatedAmount    := totalDelegatedAmount; 
//       satelliteSnapshotRecord.totalVotingPower        := totalVotingPower;
//       satelliteSnapshotRecord.currentCycleStartLevel  := s.currentRoundStartLevel; 
//       satelliteSnapshotRecord.currentCycleEndLevel    := s.currentCycleEndLevel; 

//       s.snapshotLedger[satelliteAddress] := satelliteSnapshotRecord;
//     } 

// } with (operations, s)

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

    if s.currentRound = (Proposal : roundType) then skip
        else failwith("Error. You can only make a proposal during a proposal round.");

    // if Tezos.level > s.currentRoundEndLevel then failwith("Current proposal round has ended.")
    //   else skip;

    // check if satellite exists in the active satellites map
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    ];
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", unit, delegationAddress);
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

    // add proposal id to current round proposals and initialise with zero positive votes in MVK 
    s.currentRoundProposals[s.nextProposalId] := 0n;

    // increment next proposal id
    s.nextProposalId := s.nextProposalId + 1n;

} with (noOperations, s)

(* AddUpdateProposalData Entrypoint *)
// type addUpdateProposalDataType is (nat * string * bytes) // proposal id, proposal metadata title or description, proposal metadata in bytes
function addUpdateProposalData(const proposalData : addUpdateProposalDataType; var s : storage) : return is 
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
    if proposalRecord.proposerAddress =/= Tezos.sender then failwith("Error. Only the proposer can add or update data.")
      else skip;

    // Add or update data to proposal
    proposalRecord.proposalMetadata[proposalTitle] := proposalBytes; 

    // save changes and update proposal ledger
    s.proposalLedger[proposalId] := proposalRecord;

} with (noOperations, s)


function lockProposal(const proposalId : nat; var s : storage) : return is 
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
function proposalRoundVote(const proposalId : nat; var s : storage) : return is 
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
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", unit, delegationAddress);
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

(* StartVotingRound Entrypoint *)
// function startVotingRound(var s : storage) : return is
// block {
    
//     // Steps Overview:
//     // 1. verify sender is admin
//     // 2. set current round from "proposal" to "voting", and reset current round start level and end level - current round duration should be equal to current cycle end level minus timelock duration
//     // 3a. get ids of current proposals, and select the proposal with highest vote
//     // 3b. if there is no proposal, restart proposal round

//     // init variables
//     var operations : list(operation) := nil;

//     // anyone can start voting round

//     // check rounds logic
//     if s.currentRound = "timelock" then failwith("Error. You cannot start a voting round from the timelock round.") else skip;
//     if s.currentRound = "voting" then failwith("Error. You are already in the voting round.") else skip;
//     if s.currentRound = "proposal" and Tezos.level < s.currentRoundEndLevel then failwith("Error. The proposal round has not ended yet.") else skip;

//     // simple loop to get the proposal with the highest vote count in MVK 
//     var _highestVoteCounter     : nat := 0n;
//     var highestVotedProposalId  : nat := 0n;
//     for proposalId -> voteCount in map s.currentRoundProposals block {
//         if voteCount > _highestVoteCounter then block {
//              _highestVoteCounter := voteCount;
//              highestVotedProposalId := proposalId;
//         } else skip;
//     };

//     // check if there is a valid proposal to be moved to the voting round
//     if highestVotedProposalId =/= 0n then block {

//         // fetch proposal
//         const proposal : proposalRecordType = case s.proposalLedger[highestVotedProposalId] of [ 
//             Some(_proposalRecord) -> _proposalRecord
//           | None -> failwith("Error. Proposal not found.")
//         ];

//         if proposal.passVoteMvkTotal < proposal.minProposalRoundVotesRequired then block {
            
//             // restart - another proposal round
//             const restartProposalRoundOperation : operation = restartProposalRoundOperation(Unit);
//             operations := restartProposalRoundOperation # operations;

//         } else block {

//           // boundaries fixed to the start and end of the cycle (calculated at start of proposal round)
//           s.currentRound               := "voting";
//           s.currentRoundStartLevel     := s.currentRoundEndLevel + 1n;
//           s.currentRoundEndLevel       := s.currentRoundEndLevel + s.config.blocksPerVotingRound;

//           s.timelockProposalId         := 0n;                  // flush proposal id in timelock - reset to 0

//           // set the current round highest voted proposal id
//           s.currentRoundHighestVotedProposalId := highestVotedProposalId;

//           // flush current round votes - to prepare for voting round
//           const emptyCurrentRoundVotes : map(address, nat) = map[];
//           s.currentRoundVotes := emptyCurrentRoundVotes;

//         }

//     } else block {

//         // restart - another proposal round
//         const restartProposalRoundOperation : operation = restartProposalRoundOperation(Unit);
//         operations := restartProposalRoundOperation # operations;
//     }

// } with (operations, s)

// (* VotingRoundVote Entrypoint *)
function votingRoundVote(const voteType : voteForProposalChoiceType; var s : storage) : return is 
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
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", unit, delegationAddress);
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

(* StartTimelockRound Entrypoint *)
// function startTimelockRound(var s : storage) : return is
// block {
    
//     // Steps Overview:
//     // 1. verify sender is admin
//     // 2. set current round from "voting" to "timelock", and set current round start level and end level 
//     // 3. set timelockProposalId to currentRoundHighestVotedProposalId
    
//     // init variables
//     var operations : list(operation) := nil;

//     // check rounds logic
//     if s.currentRound = "timelock" then failwith("Error. You are already in the timelock round.") else skip;
//     if s.currentRound = "proposal" then failwith("Error. You cannot start a timelock round from the proposal round.") else skip;
//     if s.currentRound = "voting" then block {

//         // fetch proposal from voting round
//         const proposal : proposalRecordType = case s.proposalLedger[s.currentRoundHighestVotedProposalId] of [ 
//             Some(_proposalRecord) -> _proposalRecord
//           | None -> failwith("Error. Proposal not found.")
//         ];

//         if proposal.upvoteMvkTotal < proposal.minQuorumMvkTotal then block {
            
//             // restart - another proposal round
//             const restartProposalRoundOperation : operation = restartProposalRoundOperation(Unit);
//             operations := restartProposalRoundOperation # operations;
            
//         } else block {

           

//         };

//     } else failwith("Error. Current round is not valid.");


// } with (operations, s)

(* ExecuteProposal Entrypoint *)
function executeProposal(var s : storage) : return is 
block {
    // Steps Overview: 
    // 1. verify that user is a satellite and can execute proposal
    // 2. verify that proposal can be executed
    // 3. execute proposal - list of operations to run

    // to be confirmed: who should execute the proposal? originator/admin/anyone? 
    // checkSenderIsSelf(Unit);
    checkSenderIsAdminOrSelf(s);

    // check that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
    if s.currentRound = (Timelock : roundType) or s.currentRound = (Voting : roundType) then failwith("Error. Proposal can only be executed after timelock period ends.")
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
function dropProposal(const proposalId : nat; var s : storage) : return is 
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
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", unit, delegationAddress);
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
    } else failwith("Error: You are not allowed to drop this proposal.")
    
} with (noOperations, s)

function requestSatelliteSnapshot(const satelliteSnapshot : requestSatelliteSnapshotType; var s : storage) : storage is 
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

function requestTokens(const requestTokensParams : requestTokensType; var s : storage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];

  const doormanAddress : address = case s.generalContracts["doorman"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Doorman Contract is not found")
  ];

  const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
  s.snapshotStakedMvkTotalSupply := case stakedMvkBalanceView of [
    Some (value) -> value
  | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
  ];

  const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

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

    // set snapshot of satellites for financial request
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    ];

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

function requestMint(const requestMintParams : requestMintType; var s : storage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];
  
  const mvkTokenAddress : address = s.mvkTokenAddress;

  const doormanAddress : address = case s.generalContracts["doorman"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Doorman Contract is not found")
  ];

  const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
  s.snapshotStakedMvkTotalSupply := case stakedMvkBalanceView of [
    Some (value) -> value
  | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
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
        tokenType            = requestMintParams.tokenType;
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

    // set snapshot of satellites for financial request
    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found")
    ];

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

function dropFinancialRequest(const requestId : nat; var s : storage) : return is 
block {

  checkSenderIsCouncilContract(s);

  var financialRequest : financialRequestRecordType := case s.financialRequestLedger[requestId] of [
    Some(_request) -> _request
    | None -> failwith("Error. Financial request not found. ")
  ];

  financialRequest.status := False;
  s.financialRequestLedger[requestId] := financialRequest;

} with (noOperations, s);

function voteForRequest(const voteForRequest : voteForRequestType; var s : storage) : return is 
block {
  
  // check if satellite exists in the active satellites map
  const delegationAddress : address = case s.generalContracts["delegation"] of [
    Some(_address) -> _address
    | None -> failwith("Error. Delegation Contract is not found")
  ];
  const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", unit, delegationAddress);
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

  const newVoteRecord : financialRequestVoteType     = record [
      vote             = voteType;
      totalVotingPower = totalVotingPower;
      timeVoted        = Tezos.now;
  ];

  _financialRequest.voters[Tezos.sender] := newVoteRecord;
  s.financialRequestLedger[financialRequestId] := _financialRequest;

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

            const transferTokenParams : transferTokenType = record [
              from_      = treasuryAddress;
              to_        = councilAddress;
              amt        = _financialRequest.tokenAmount;
              token      = _tokenTransferType;
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


function main (const action : governanceAction; const s : storage) : return is 
    case action of [
        | BreakGlass(_parameters) -> breakGlass(s)  
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        
        // Housekeeping
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
        
        // Governance Helpers
        | SetSnapshotStakedMvkTotalSupply(parameters) -> setSnapshotStakedMvkTotalSupply(parameters, s)
  
        | StartNextRound(_parameters) -> startNextRound(s)
        // | StartProposalRound(_parameters) -> startProposalRound(s)
        | Propose(parameters) -> propose(parameters, s)
        | ProposalRoundVote(parameters) -> proposalRoundVote(parameters, s)
        | AddUpdateProposalData(parameters) -> addUpdateProposalData(parameters, s)
        | LockProposal(parameters) -> lockProposal(parameters, s)

        // | StartVotingRound(_parameters) -> startVotingRound(s)        
        | VotingRoundVote(parameters) -> votingRoundVote(parameters, s)
        
        // | StartTimelockRound(_parameters) -> startTimelockRound(s)        
        | ExecuteProposal(_parameters) -> executeProposal(s)
        | DropProposal(parameters) -> dropProposal(parameters, s)

        // Governance Lambdas
        | CallGovernanceLambdaProxy(parameters) -> callGovernanceLambdaProxy(parameters, s)
        | SetupLambdaFunction(parameters) -> setupLambdaFunction(parameters, s)

        // Financial Governance
        // | RequestTokens(parameters) -> requestTokens(parameters, s)
        // | RequestMint(parameters) -> requestMint(parameters, s)
        // | DropFinancialRequest(parameters) -> dropFinancialRequest(parameters, s)
        // | VoteForRequest(parameters) -> voteForRequest(parameters, s)
    ]