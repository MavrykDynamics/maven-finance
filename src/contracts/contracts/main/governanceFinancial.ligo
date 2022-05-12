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

// Governance Financial Type
#include "../partials/types/governanceFinancialTypes.ligo"

// ------------------------------------------------------------------------------

type governanceFinancialAction is 

      // Housekeeping Entrypoints
    | SetAdmin                        of (address)
    | SetGovernance                   of (address)
    | UpdateMetadata                  of updateMetadataType
    | UpdateConfig                    of governanceFinancialUpdateConfigParamsType
    | UpdateGeneralContracts          of updateGeneralContractsParams
    | UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsParams

      // Financial Governance Entrypoints
    | RequestTokens                   of requestTokensType
    | RequestMint                     of requestMintType
    | SetContractBaker                of setContractBakerType
    | DropFinancialRequest            of (nat)
    | VoteForRequest                  of voteForRequestType

      // Lambda Entrypoints
    | SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceFinancialStorage

// governance contract methods lambdas
type governanceUnpackLambdaFunctionType is (governanceFinancialLambdaActionType * governanceFinancialStorage) -> return



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

// Error Codes
#include "../partials/errors.ligo"

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

function checkSenderIsAllowed(var s : governanceFinancialStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
        


function checkSenderIsAdmin(var s : governanceFinancialStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



function checkSenderIsDoormanContract(var s : governanceFinancialStorage) : unit is
block{

  const doormanAddress : address = case s.generalContracts["doorman"] of [
        Some(_address) -> _address
      | None           -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
  ];
  
  if (Tezos.sender = doormanAddress) then skip
  else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



function checkSenderIsDelegationContract(var s : governanceFinancialStorage) : unit is
block{

  const delegationAddress : address = case s.generalContracts["delegation"] of [
        Some(_address) -> _address
      | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
  ];

  if (Tezos.sender = delegationAddress) then skip
  else failwith(error_ONLY_DELEGATION_CONTRACT_ALLOWED);

} with unit



function checkSenderIsMvkTokenContract(var s : governanceFinancialStorage) : unit is
block{

  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
  else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);

} with unit



function checkSenderIsCouncilContract(var s : governanceFinancialStorage) : unit is
block{

  const councilAddress : address = case s.generalContracts["council"] of [
        Some(_address) -> _address
      | None           -> failwith(error_COUNCIL_CONTRACT_NOT_FOUND)
  ];
  
  if (Tezos.sender = councilAddress) then skip
  else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with unit



function checkSenderIsEmergencyGovernanceContract(var s : governanceFinancialStorage) : unit is
block{

  const emergencyGovernanceAddress : address = case s.generalContracts["emergencyGovernance"] of [
        Some(_address) -> _address
      | None           -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];

  if (Tezos.sender = emergencyGovernanceAddress) then skip
  else failwith(error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

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



// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
case (Tezos.get_entrypoint_opt(
      "%mintMvkAndTransfer",
      contractAddress) : option(contract(mintMvkAndTransferType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvkAndTransferType))
];



// helper function to set baker for treasury
function setTreasuryBaker(const contractAddress : address) : contract(setBakerType) is
case (Tezos.get_entrypoint_opt(
      "%setBaker",
      contractAddress) : option(contract(setBakerType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_SET_BAKER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(setBakerType))
];



function transferTez(const to_ : contract(unit); const amt : tez) : operation is Tezos.transaction(unit, amt, to_)

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Helper Functions Begin
// ------------------------------------------------------------------------------

function requestSatelliteSnapshot(const satelliteSnapshot : requestSatelliteSnapshotType; var s : governanceFinancialStorage) : governanceFinancialStorage is 
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

// ------------------------------------------------------------------------------
// Governance Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceUnpackLambdaFunctionType)) of [
        Some(f) -> f(governanceFinancialLambdaAction, s)
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

(* View: get config *)
[@view] function getConfig(const _: unit; var s : governanceFinancialStorage) : governanceFinancialConfigType is
  s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _: unit; var s : governanceFinancialStorage) : address is
  s.governanceAddress



(* View: get Whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _: unit; var s : governanceFinancialStorage) : whitelistTokenContractsType is
  s.whitelistTokenContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : governanceFinancialStorage) : generalContractsType is
  s.generalContracts



(* View: get a financial request *)
[@view] function getFinancialRequestOpt(const requestId: nat; var s : governanceFinancialStorage) : option(financialRequestRecordType) is
  Big_map.find_opt(requestId, s.financialRequestLedger)



(* View: get a financial request snapshot *)
[@view] function getFinancialRequestSnapshotOpt(const requestId: nat; var s : governanceFinancialStorage) : option(financialRequestSnapshotMapType) is
  Big_map.find_opt(requestId, s.financialRequestSnapshotLedger)




(* View: get financial request counter *)
[@view] function getFinancialRequestCounter(const _: unit; var s : governanceFinancialStorage) : nat is
  s.financialRequestCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : governanceFinancialStorage) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : governanceFinancialStorage) : lambdaLedgerType is
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

// Governance Financial Contract Lambdas:
#include "../partials/contractLambdas/governanceFinancial/governanceFinancialLambdas.ligo"

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
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceFinancialStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response




(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceProxyAddress : address; var s : governanceFinancialStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetGovernance(newGovernanceProxyAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



// (* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceFinancialStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



// (*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : governanceFinancialUpdateConfigParamsType; var s : governanceFinancialStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);
    
} with response



// (*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: governanceFinancialStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



// (*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: governanceFinancialStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Financial Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(* requestTokens entrypoint *)
function requestTokens(const requestTokensParams : councilActionRequestTokensType; var s : governanceFinancialStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestTokens"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaRequestTokens(requestTokensParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* requestMint entrypoint *)
function requestMint(const requestMintParams : councilActionRequestMintType; var s : governanceFinancialStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestMint"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaRequestMint(requestMintParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* setContractBaker entrypoint *)
function setContractBaker(const setContractBakerParams : councilActionSetContractBakerType; var s : governanceFinancialStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetContractBaker"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetContractBaker(setContractBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* dropFinancialRequest entrypoint *)
function dropFinancialRequest(const requestId : nat; var s : governanceFinancialStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropFinancialRequest"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaDropFinancialRequest(requestId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* voteForRequest entrypoint *)
function voteForRequest(const voteForRequest : voteForRequestType; var s : governanceFinancialStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForRequest"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaVoteForRequest(voteForRequest);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);
  
} with response

// ------------------------------------------------------------------------------
// Financial Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: governanceFinancialStorage): return is
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
function main (const action : governanceFinancialAction; const s : governanceFinancialStorage) : return is 

    case action of [
          // Housekeeping Entrypoints
        | SetAdmin(parameters)                        -> setAdmin(parameters, s)
        | SetGovernance(parameters)                   -> setGovernance(parameters, s)
        | UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        | UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        | UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        | UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)

          // Financial Governance Entrypoints
        | RequestTokens(parameters)                   -> requestTokens(parameters, s)
        | RequestMint(parameters)                     -> requestMint(parameters, s)
        | SetContractBaker(parameters)                -> setContractBaker(parameters, s)
        | DropFinancialRequest(parameters)            -> dropFinancialRequest(parameters, s)
        | VoteForRequest(parameters)                  -> voteForRequest(parameters, s)

          // Lambda Entrypoints
        | SetLambda(parameters)                       -> setLambda(parameters, s)

    ]