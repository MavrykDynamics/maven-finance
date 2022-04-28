type counterIdType is nat
type metadataType is big_map (string, bytes)
type lambdaLedgerType is big_map(string, bytes)

type governanceSatelliteConfigType is [@layout:comb] record [
    
    governanceSatelliteApprovalPercentage  : nat;  // threshold for satellite governance to be approved: 67% of total staked MVK supply
    governanceSatelliteDurationInDays      : nat;  // duration of satellite governance before expiry

    governancePurposeMaxLength             : nat;
]

type governanceSatelliteVoteChoiceType is 
  Approve of unit
| Disapprove of unit

type governanceSatelliteVoteType is [@layout:comb] record [
  vote              : governanceSatelliteVoteChoiceType;
  totalVotingPower  : nat; 
  timeVoted         : timestamp;
] 

type governanceSatelliteVotersMapType is map (address, governanceSatelliteVoteType)

type governanceSatelliteRecordType is [@layout:comb] record [
    initiator                          : address;
    status                             : bool;                  // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                           : bool;                  // false on creation; set to true when financial request is executed successfully
    
    governanceType                     : string;                // "MINT" or "TRANSFER"
    governancePurpose                  : string;
    voters                             : governanceSatelliteVotersMapType; 

    approveVoteTotal                   : nat;
    disapproveVoteTotal                : nat;

    snapshotStakedMvkTotalSupply       : nat;
    stakedMvkPercentageForApproval     : nat; 
    stakedMvkRequiredForApproval       : nat; 

    requestedDateTime                  : timestamp;           // log of when the request was submitted
    expiryDateTime                     : timestamp;               
]
type governanceSatelliteLedgerType is big_map (nat, governanceSatelliteRecordType);

type governanceSatelliteSnapshotRecordType is [@layout:comb] record [
    totalMvkBalance           : nat;      // log of satellite's total mvk balance for this counter
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
]
type governanceSatelliteSnapshotMapType is map (address, governanceSatelliteSnapshotRecordType)
type governanceSatelliteSnapshotLedgerType is big_map (counterIdType, governanceSatelliteSnapshotMapType);

type governanceSatelliteLambdaActionType is 

  // Satellite Governance
| LambdaSuspendSatellite              of (address)
| LambdaUnsuspendSatellite            of (address)
| LambdaBanSatellite                  of (address)
| LambdaUnbanSatellite                of (address)

  // Satellite Oracle Governance
| LambdaRemoveAllSatelliteOracles     of (address)
| LambdaAddOracleToAggregator         of (nat)
| LambdaRemoveOracleInAggregator      of (nat)

  // Governance Actions
| LambdaVoteForAction                 of (nat)
| LambdaDropAction                    of (nat)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceSatelliteStorage is record [
    admin                                   : address;
    metadata                                : metadataType;
    config                                  : governanceSatelliteConfigType;

    mvkTokenAddress                         : address;
    governanceProxyAddress                  : address; 
    
    // governance satellite storage 
    governanceSatelliteLedger               : governanceSatelliteLedgerType;
    governanceSatelliteSnapshotLedger       : governanceSatelliteSnapshotLedgerType;
    governanceSatelliteCounter              : nat;

    // lambda storage
    lambdaLedger                            : lambdaLedgerType;             // governance satellite contract lambdas 
]

type governanceSatelliteAction is 
    
      // Satellite Governance
    | SuspendSatellite              of (address)
    | UnsuspendSatellite            of (address)
    | BanSatellite                  of (address)
    | UnbanSatellite                of (address)

      // Satellite Oracle Governance
    | RemoveAllSatelliteOracles     of (address)
    | AddOracleToAggregator         of (nat)
    | RemoveOracleInAggregator      of (nat)

      // Governance Actions
    | VoteForAction                 of (nat)
    | DropAction                    of (nat)

const noOperations : list (operation) = nil;
type return is list (operation) * governanceSatelliteStorage

// governance satellite contract methods lambdas
type governanceSatelliteUnpackLambdaFunctionType is (governanceSatelliteLambdaActionType * governanceSatelliteStorage) -> return




// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                             = 0n;
[@inline] const error_ONLY_SATELLITE_ALLOWED                                 = 1n;

[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                      = 3n;
[@inline] const error_NOT_ENOUGH_TEZ_RECEIVED                                = 4n;

[@inline] const error_GET_SATELLITE_OPT_VIEW_NOT_FOUND                       = 13n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND        = 14n;

[@inline] const error_LAMBDA_NOT_FOUND                                       = 15n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                = 16n;

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

function checkSenderIsAdmin(const s: governanceSatelliteStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);


// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceSatelliteUnpackLambdaFunctionType)) of [
        Some(f) -> f(governanceSatelliteLambdaAction, s)
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
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Governance Satellite Lambdas:
#include "../partials/contractLambdas/governanceSatellite/governanceSatelliteLambdas.ligo"

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
// Satellite Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  suspendSatellite entrypoint  *)
function suspendSatellite(const satelliteAddress : address ; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSuspendSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSuspendSatellite(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  unsuspendSatellite entrypoint  *)
function unsuspendSatellite(const satelliteAddress : address ; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnsuspendSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUnsuspendSatellite(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  banSatellite entrypoint  *)
function banSatellite(const satelliteAddress : address; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBanSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaBanSatellite(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  unbanSatellite entrypoint  *)
function unbanSatellite(const satelliteAddress : address; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnbanSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUnbanSatellite(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Satellite Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Oracle Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  removeAllSatelliteOracles entrypoint  *)
function removeAllSatelliteOracles(const satelliteAddress : address; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveAllSatelliteOracles"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRemoveAllSatelliteOracles(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  addOracleToAggregator entrypoint  *)
function addOracleToAggregator(const _parameters : nat; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddOracleToAggregator"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaAddOracleToAggregator(_parameters);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);
    
} with response



(*  removeOracleInAggregator entrypoint  *)
function removeOracleInAggregator(const _parameters : nat; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveOracleInAggregator"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRemoveOracleInAggregator(_parameters);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Satellite Oracle Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  voteForAction entrypoint  *)
function voteForAction(const governanceActionCounter : nat; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaVoteForAction(governanceActionCounter);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  dropAction entrypoint  *)
function dropAction(const governanceActionCounter : nat; var s : governanceSatelliteStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaDropAction(governanceActionCounter);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Governance Actions Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : governanceSatelliteAction; const s : governanceSatelliteStorage) : return is 
    case action of [
        
          // Satellite Governance 
        | SuspendSatellite(parameters)              -> suspendSatellite(parameters, s)
        | UnsuspendSatellite(parameters)            -> unsuspendSatellite(parameters, s)
        | BanSatellite(parameters)                  -> banSatellite(parameters, s)
        | UnbanSatellite(parameters)                -> unbanSatellite(parameters, s)

          // Satellite Oracle Governance
        | RemoveAllSatelliteOracles(parameters)     ->removeAllSatelliteOracles(parameters, s)
        | AddOracleToAggregator(parameters)         -> addOracleToAggregator(parameters, s)
        | RemoveOracleInAggregator(parameters)      -> removeOracleInAggregator(parameters, s)

          // Governance Actions
        | VoteForAction(parameters)                 -> voteForAction(parameters, s)
        | DropAction(parameters)                    -> dropAction(parameters, s)

    ]