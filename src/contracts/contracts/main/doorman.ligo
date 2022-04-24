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

// Doorman types
#include "../partials/types/doormanTypes.ligo"

// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"

// Treasury types for farmClaim
#include "../partials/types/treasuryTypes.ligo"

// ------------------------------------------------------------------------------

type doormanAction is 

    // Housekeeping Entrypoints
    SetAdmin                    of (address)
  | UpdateMetadata              of updateMetadataType
  | UpdateMinMvkAmount          of (nat)
  | UpdateWhitelistContracts    of updateWhitelistContractsParams
  | UpdateGeneralContracts      of updateGeneralContractsParams

    // Pause / Break Glass Entrypoints
  | PauseAll                    of (unit)
  | UnpauseAll                  of (unit)
  | TogglePauseStake            of (unit)
  | TogglePauseUnstake          of (unit)
  | TogglePauseCompound         of (unit)

    // Doorman Entrypoints
  | Stake                       of (nat)
  | Unstake                     of (nat)
  | Compound                    of (unit)
  | FarmClaim                   of farmClaimType

    // Lambda Entrypoints
  | SetLambda                   of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * doormanStorage

// doorman contract methods lambdas
type doormanUnpackLambdaFunctionType is (doormanLambdaActionType * doormanStorage) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const fixedPointAccuracy: nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36

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

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                          = 0n;
[@inline] const error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED                                     = 1n;
[@inline] const error_ONLY_DELEGATION_CONTRACT_ALLOWED                                    = 2n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                   = 3n;
[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                       = 4n;

[@inline] const error_STAKE_ENTRYPOINT_IS_PAUSED                                          = 5n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IS_PAUSED                                        = 6n;
[@inline] const error_COMPOUND_ENTRYPOINT_IS_PAUSED                                       = 7n;
[@inline] const error_ON_STAKE_CHANGE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND         = 8n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND                     = 9n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                  = 10n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND     = 11n;

[@inline] const error_LAMBDA_NOT_FOUND                                                    = 12n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                             = 13n;

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

function checkSenderIsAdmin(var s : doormanStorage) : unit is
  if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsMvkTokenContract(var s : doormanStorage) : unit is
block{
  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
    else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);
} with unit



function checkSenderIsDelegationContract(var s : doormanStorage) : unit is
block{
  const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = delegationAddress) then skip
    else failwith(error_ONLY_DELEGATION_CONTRACT_ALLOWED);
} with unit



function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

function checkStakeIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.stakeIsPaused then failwith(error_STAKE_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkUnstakeIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.unstakeIsPaused then failwith(error_UNSTAKE_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkCompoundIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.compoundIsPaused then failwith(error_COMPOUND_ENTRYPOINT_IS_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update satellite's balance
function updateSatelliteBalance(const delegationAddress : address) : contract(updateSatelliteBalanceParams) is
  case (Tezos.get_entrypoint_opt(
      "%onStakeChange",
      delegationAddress) : option(contract(updateSatelliteBalanceParams))) of [
    Some(contr) -> contr
  | None -> (failwith(error_ON_STAKE_CHANGE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(updateSatelliteBalanceParams))
];



// helper function to get transfer entrypoint
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(transferType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      tokenAddress) : option(contract(transferType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND) : contract(transferType))
];



// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
  ];



// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
  case (Tezos.get_entrypoint_opt(
      "%mintMvkAndTransfer",
      contractAddress) : option(contract(mintMvkAndTransferType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvkAndTransferType))
];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Compound Helper Functions Begin
// ------------------------------------------------------------------------------

(*  compoundUserRewards helper function *)
function compoundUserRewards(var s: doormanStorage) : doormanStorage is 
block{

    // Get User
    const user: address = Tezos.source;

    // Get the user's record, failed if it does not exists
    var userRecord: userStakeBalanceRecordType := case s.userStakeBalanceLedger[user] of [
        Some (_val) -> _val
      | None -> record[
          balance                        = 0n;
          totalExitFeeRewardsClaimed     = 0n;
          totalSatelliteRewardsClaimed   = 0n;
          participationFeesPerShare      = s.accumulatedFeesPerShare;
        ]
    ];
    // Check if the user has more than 0 MVK staked. If he/she hasn't, he cannot earn rewards
    if userRecord.balance > 0n then {
      
      // Calculate what fees the user missed since his/her last claim
      const currentFeesPerShare: nat = abs(s.accumulatedFeesPerShare - userRecord.participationFeesPerShare);

      // Calculate the user reward based on his sMVK
      const userRewards: nat = (currentFeesPerShare * userRecord.balance) / fixedPointAccuracy;
      
      // Increase the user balance
      userRecord.balance := userRecord.balance + userRewards;

      // Increase the user total
      userRecord.totalExitFeeRewardsClaimed := userRecord.totalExitFeeRewardsClaimed + userRewards;
      
      s.unclaimedRewards := abs(s.unclaimedRewards - userRewards);
    }
    else skip;
    
    // Set the user's participationFeesPerShare 
    userRecord.participationFeesPerShare := s.accumulatedFeesPerShare;
    
    // Update the doormanStorage
    s.userStakeBalanceLedger := Big_map.update(user, Some (userRecord), s.userStakeBalanceLedger);

} with (s)

// ------------------------------------------------------------------------------
// Compound Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(doormanUnpackLambdaFunctionType)) of [
        Some(f) -> f(doormanLambdaAction, s)
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

// Doorman Lambdas:
#include "../partials/contractLambdas/doorman/doormanLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(*  View: getTotalStakedSupply *)
[@view] function getTotalStakedSupply(const _: unit; const s: doormanStorage) : nat is
  s.stakedMvkTotalSupply



(* View: getStakedBalance *)
[@view] function getStakedBalance (const userAddress : address; var s : doormanStorage) : nat is
  case s.userStakeBalanceLedger[userAddress] of [
    Some (_val) -> _val.balance
  | None -> 0n
]

// ------------------------------------------------------------------------------
//
// Views End
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
function setAdmin(const newAdminAddress : address; var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  
    
} with response



(*  updateMetadata entrypoint: update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  updateMinMvkAmount entrypoint *)
function updateMinMvkAmount(const newMinMvkAmount : nat; var s : doormanStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMinMvkAmount"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateMinMvkAmount(newMinMvkAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: doormanStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: doormanStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  
    
} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  togglePauseStake entrypoint *)
function togglePauseStake(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseStake"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaTogglePauseStake(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  togglePauseUnstake entrypoint *)
function togglePauseUnstake(var s : doormanStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUnstake"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
    
    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaTogglePauseUnstake(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  togglePauseCompound entrypoint *)
function togglePauseCompound(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseCompound"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaTogglePauseCompound(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Doorman Entrypoints Begin
// ------------------------------------------------------------------------------

(*  stake entrypoint *)
function stake(const stakeAmount : nat; var s : doormanStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaStake"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaStake(stakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  unstake entrypoint *)
function unstake(const unstakeAmount : nat; var s : doormanStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnstake"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUnstake(unstakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  compound entrypoint *)
function compound(var s: doormanStorage): return is
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCompound"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaCompound(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* farmClaim entrypoint *)
function farmClaim(const farmClaim: farmClaimType; var s: doormanStorage): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaFarmClaim"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaFarmClaim(farmClaim);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Doorman Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: doormanStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
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
function main (const action : doormanAction; const s : doormanStorage) : return is
  block {
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

  } with(

    case action of [

        // Housekeeping Entrypoints
      | SetAdmin(parameters)                  -> setAdmin(parameters, s)
      | UpdateMetadata(parameters)            -> updateMetadata(parameters, s)
      | UpdateMinMvkAmount(parameters)        -> updateMinMvkAmount(parameters, s)
      | UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
      | UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)

        // Pause / Break Glass Entrypoints
      | PauseAll(_parameters)                 -> pauseAll(s)
      | UnpauseAll(_parameters)               -> unpauseAll(s)
      | TogglePauseStake(_parameters)         -> togglePauseStake(s)
      | TogglePauseUnstake(_parameters)       -> togglePauseUnstake(s)
      | TogglePauseCompound(_parameters)      -> togglePauseCompound(s)

        // Doorman Entrypoints
      | Stake(parameters)                     -> stake(parameters, s)  
      | Unstake(parameters)                   -> unstake(parameters, s)
      | Compound(_parameters)                 -> compound(s)
      | FarmClaim(parameters)                 -> farmClaim(parameters, s)

        // Lambda Entrypoints
      | SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
    
  )
