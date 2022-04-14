
// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"
// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"
// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"
// Doorman types
#include "../partials/types/doormanTypes.ligo"
// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"
// Treasury types for farmClaim
#include "../partials/types/treasuryTypes.ligo"

const noOperations : list (operation) = nil;
type return is list (operation) * doormanStorage

type doormanAction is 
    SetAdmin                    of (address)
  | UpdateMetadata of (string * bytes)
  | UpdateMinMvkAmount          of (nat)
  | UpdateWhitelistContracts    of updateWhitelistContractsParams
  | UpdateGeneralContracts      of updateGeneralContractsParams

  | PauseAll                    of (unit)
  | UnpauseAll                  of (unit)
  | TogglePauseStake            of (unit)
  | TogglePauseUnstake          of (unit)
  | TogglePauseCompound         of (unit)

  | Stake                       of (nat)
  | Unstake                     of (nat)
  | Compound                    of (unit)
  | FarmClaim                   of farmClaimType

  // | CallLambda                  of doormanActionType
  | SetLambda                   of setLambdaType

// type doormanLambdaFunctionType is (doormanActionType * doormanStorage) -> return

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
    else failwith("Error. Only the administrator can call this entrypoint.");



function checkSenderIsMvkTokenContract(var s : doormanStorage) : unit is
block{
  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
    else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
} with unit



function checkSenderIsDelegationContract(var s : doormanStorage) : unit is
block{
  const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  ];
  if (Tezos.sender = delegationAddress) then skip
    else failwith("Error. Only the Delegation Contract can call this entrypoint.");
} with unit



function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

function checkStakeIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.stakeIsPaused then failwith("Stake entrypoint is paused.")
    else unit;



function checkUnstakeIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.unstakeIsPaused then failwith("Unstake entrypoint is paused.")
    else unit;



function checkCompoundIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.compoundIsPaused then failwith("Compound entrypoint is paused.")
    else unit;

// ------------------------------------------------------------------------------
// Break Glass Helper Functions End
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
  | None -> (failwith("onStakeChange entrypoint in Satellite Contract not found") : contract(updateSatelliteBalanceParams))
  ];



// helper function to get transfer entrypoint
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(transferType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      tokenAddress) : option(contract(transferType))) of [
    Some(contr) -> contr
  | None -> (failwith("transfer entrypoint in Token Contract not found") : contract(transferType))
  ];



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

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Compound Helper Functions Begin
// ------------------------------------------------------------------------------

(*  compoundUserRewards helper function *)
function compoundUserRewards(var s: doormanStorage): (option(operation) * doormanStorage) is 
  block{
    // Get User
    const user: address = Tezos.source;
    // Get the user's record, failed if it does not exists
    var userRecord: userStakeBalanceRecordType := case s.userStakeBalanceLedger[user] of [
        Some (_val) -> _val
      | None -> record[
          balance=0n;
          participationFeesPerShare=s.accumulatedFeesPerShare;
        ]
    ];
    var operation: option(operation) := None;
    // Check if the user has more than 0MVK staked. If he/she hasn't, he cannot earn rewards
    if userRecord.balance > 0n then {
      // Calculate what fees the user missed since his/her last claim
      const currentFeesPerShare: nat = abs(s.accumulatedFeesPerShare - userRecord.participationFeesPerShare);
      // Calculate the user reward based on his sMVK
      const userRewards: nat = (currentFeesPerShare * userRecord.balance) / fixedPointAccuracy;
      // Increase the user balance
      userRecord.balance := userRecord.balance + userRewards;
      s.unclaimedRewards := abs(s.unclaimedRewards - userRewards);
      // Find delegation address
      const delegationAddress : address = case s.generalContracts["delegation"] of [
          Some(_address) -> _address
          | None -> failwith("Error. Delegation Contract is not found.")
      ];
      // update satellite balance if user is delegated to a satellite
      operation := Some (
        Tezos.transaction(
          (Tezos.source),
          0tez,
          updateSatelliteBalance(delegationAddress)
        )
      );
    }
    else skip;
    // Set the user's participationFeesPerShare 
    userRecord.participationFeesPerShare := s.accumulatedFeesPerShare;
    // Update the doormanStorage
    s.userStakeBalanceLedger := Big_map.update(user, Some (userRecord), s.userStakeBalanceLedger);
  } with (operation, s)

// ------------------------------------------------------------------------------
// Compound Helper Functions End
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
    
    const lambdaBytes : bytes = case s.lambdaLedger["setAdminCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. setAdmin Lambda not found.")
    ];
    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * doormanStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith("Error. Unable to unpack Doorman setAdmin Lambda.")
    ];
    
} with (noOperations, res.1)

(*  update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : doormanStorage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
} with (noOperations, s)

(*  updateMinMvkAmount entrypoint *)
function updateMinMvkAmount(const newMinMvkAmount : nat; var s : doormanStorage) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["updateMinMvkAmountCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. updateMinMvkAmount Lambda not found.")
    ];
    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * doormanStorage) -> return )) of [
      | Some(f) -> f(newMinMvkAmount, s)
      | None    -> failwith("Error. Unable to unpack Doorman updateMinMvkAmount Lambda.")
    ];
} with (noOperations, res.1)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: doormanStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  } with (noOperations, s)



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: doormanStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)
// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["pauseAllCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. pauseAll Lambda not found.")
    ];
    const res : return = case (Bytes.unpack(lambdaBytes) : option((doormanStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack Doorman pauseAll Lambda.")
    ];
    
} with (noOperations, res.1)



(*  unpauseAll entrypoint *)
function unpauseAll(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["unpauseAllCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. unpauseAll Lambda not found.")
    ];
    const res : return = case (Bytes.unpack(lambdaBytes) : option((doormanStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack Doorman unpauseAll Lambda.")
    ];
} with (noOperations, res.1)



(*  togglePauseStake entrypoint *)
function togglePauseStake(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["togglePauseStakeCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. togglePauseStake Lambda not found.")
    ];
    const res : return = case (Bytes.unpack(lambdaBytes) : option((doormanStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack Doorman togglePauseStake Lambda.")
    ];
} with (noOperations, res.1)



(*  togglePauseUnstake entrypoint *)
function togglePauseUnstake(var s : doormanStorage) : return is
block {
    const lambdaBytes : bytes = case s.lambdaLedger["togglePauseUnstakeCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. togglePauseUnstake Lambda not found.")
    ];
    const res : return = case (Bytes.unpack(lambdaBytes) : option((doormanStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack Doorman togglePauseUnstake Lambda.")
    ];
} with (noOperations, res.1)



(*  togglePauseCompound entrypoint *)
function togglePauseCompound(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["togglePauseCompoundCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. togglePauseCompound Lambda not found.")
    ];
    const res : return = case (Bytes.unpack(lambdaBytes) : option((doormanStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack Doorman togglePauseCompound Lambda.")
    ];
} with (noOperations, res.1)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Stake/Unstake/Compound/FarmClaim Entrypoints Begin
// ------------------------------------------------------------------------------

(*  stake entrypoint *)
function stake(const stakeAmount : nat; var s : doormanStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["stakeCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. stake Lambda not found.")
    ];

    const res : return = case ( Bytes.unpack(lambdaBytes) : option( (nat * doormanStorage) -> return ) ) of [
      | Some(f) -> f(stakeAmount, s)
      | None    -> failwith("Error. Unable to unpack Doorman stake Lambda.")
    ];

} with (res.0, res.1)



(*  unstake entrypoint *)
function unstake(const unstakeAmount : nat; var s : doormanStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["unstakeCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. unstake Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * doormanStorage) -> return )) of [
      | Some(f) -> f(unstakeAmount, s)
      | None    -> failwith("Error. Unable to unpack Doorman unstake Lambda.")
    ];

} with (res.0, res.1)



(*  compound entrypoint *)
function compound(var s: doormanStorage): return is
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["compoundCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. compound Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((doormanStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith("Error. Unable to unpack Doorman compound Lambda.")
    ];

} with (res.0, res.1)



(* farmClaim entrypoint *)
function farmClaim(const farmClaim: farmClaimType; var s: doormanStorage): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["farmClaimCompiled"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. farmClaim Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmClaimType * doormanStorage) -> return )) of [
      | Some(f) -> f(farmClaim, s)
      | None    -> failwith("Error. Unable to unpack Doorman farmClaim Lambda.")
    ];

} with(res.0, res.1)

// ------------------------------------------------------------------------------
// Stake/Unstake/Compound/FarmClaim Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* callLambda entrypoint *)
// function callLambda(const doormanAction : doormanActionType; var s : governanceStorage) : return is
//   block {
    
//     checkSenderIsAdmin(s);

//     const lambdaName : nat = case doormanAction of [
        
//       | SetAdmin(_v)      -> "setAdmin"
      
//       | Stake(_v)         -> "stake"
//       | Unstake(_v)       -> "unstake"
//     ];
    
//     const lambdaBytes : bytes = case s.lambdaLedger[lambdaName] of [
//       | Some(_v) -> _v
//       | None     -> failwith("Error. Doorman Lambda not found.")
//     ];

//     // reference: type doormanLambdaFunctionType is (doormanActionType * doormanStorage) -> return
//     const res : return = case (Bytes.unpack(lambdaBytes) : option(doormanLambdaFunctionType)) of [
//       | Some(f) -> f(doormanAction, s)
//       | None    -> failwith("Error. Unable to unpack Doorman Lambda.")
//     ];
  
//   } with (res.0, s)



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


(* Main entrypoint *)
function main (const action : doormanAction; const s : doormanStorage) : return is
  block {
    
    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);
  } with(
    case action of [
      | SetAdmin(parameters)                  -> setAdmin(parameters, s)
      | UpdateMetadata(parameters)            -> updateMetadata(parameters.0, parameters.1, s)
      | UpdateMinMvkAmount(parameters)        -> updateMinMvkAmount(parameters, s)
      | UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
      | UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)

      | PauseAll(_parameters)                 -> pauseAll(s)
      | UnpauseAll(_parameters)               -> unpauseAll(s)
      | TogglePauseStake(_parameters)         -> togglePauseStake(s)
      | TogglePauseUnstake(_parameters)       -> togglePauseUnstake(s)
      | TogglePauseCompound(_parameters)      -> togglePauseCompound(s)

      | Stake(parameters)                     -> stake(parameters, s)  
      | Unstake(parameters)                   -> unstake(parameters, s)
      | Compound(_parameters)                 -> compound(s)
      | FarmClaim(parameters)                 -> farmClaim(parameters, s)

      // | CallLambda(parameters)                -> callLambda(parameters, s)
      | SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
    
  )
