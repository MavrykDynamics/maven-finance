// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// Transfer Types: transferDestinationType
#include "../partials/transferTypes.ligo"

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

// Delegation types for compound
#include "../partials/types/delegationTypes.ligo"

// ------------------------------------------------------------------------------

type doormanAction is 

    // Housekeeping Entrypoints
    SetAdmin                    of (address)
  | SetGovernance               of (address)
  | UpdateMetadata              of updateMetadataType
  | UpdateConfig                of doormanUpdateConfigParamsType
  | UpdateWhitelistContracts    of updateWhitelistContractsParams
  | UpdateGeneralContracts      of updateGeneralContractsParams
  | MistakenTransfer            of transferActionType
  | MigrateFunds                of (address)

    // Pause / Break Glass Entrypoints
  | PauseAll                    of (unit)
  | UnpauseAll                  of (unit)
  | TogglePauseStake            of (unit)
  | TogglePauseUnstake          of (unit)
  | TogglePauseCompound         of (unit)
  | TogglePauseFarmClaim        of (unit)

    // Doorman Entrypoints
  | Stake                       of (nat)
  | Unstake                     of (nat)
  | Compound                    of (address)
  | FarmClaim                   of farmClaimType
    
    // Vault Entrypoints - callable only by USDM Token Controller
  | VaultDepositStakedMvk       of vaultDepositStakedMvkType
  | VaultWithdrawStakedMvk      of vaultWithdrawStakedMvkType
  | VaultLiquidateStakedMvk     of vaultLiquidateStakedMvkType

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

function checkSenderIsAllowed(var s : doormanStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



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
  const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
  const delegationAddress: address = case generalContractsOptView of [
      Some (_optionContract) -> case _optionContract of [
              Some (_contract)    -> _contract
          |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
          ]
  |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = delegationAddress) then skip
    else failwith(error_ONLY_DELEGATION_CONTRACT_ALLOWED);
} with unit



function checkSenderIsAdminOrGovernanceSatelliteContract(var s : doormanStorage) : unit is
block{
  if Tezos.sender = s.admin then skip
  else {
    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceSatellite", s.governanceAddress);
    const governanceSatelliteAddress: address = case generalContractsOptView of [
        Some (_optionContract) -> case _optionContract of [
                Some (_contract)    -> _contract
            |   None                -> failwith (error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND)
            ]
    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    if Tezos.sender = governanceSatelliteAddress then skip
      else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
  }
} with unit



function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"



// Treasury Transfer: transferTez, transferFa12Token, transferFa2Token
#include "../partials/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

function checkStakeIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.stakeIsPaused then failwith(error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



function checkUnstakeIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.unstakeIsPaused then failwith(error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



function checkCompoundIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.compoundIsPaused then failwith(error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



function checkFarmClaimIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.farmClaimIsPaused then failwith(error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
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
  | None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(transferType))
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
function compoundUserRewards(const userAddress: address; var s: doormanStorage) : doormanStorage is 
block{ 
    
    // Get the user's record
    var userRecord: userStakeBalanceRecordType := case s.userStakeBalanceLedger[userAddress] of [
        Some (_val) -> _val
      | None -> record[
          balance                       = 0n;
          participationFeesPerShare     = s.accumulatedFeesPerShare;
          totalExitFeeRewardsClaimed    = 0n;
          totalSatelliteRewardsClaimed  = 0n;
          totalFarmRewardsClaimed       = 0n;
        ]
    ];

    // Check if the user has more than 0MVK staked. If he/she hasn't, he cannot earn rewards
    if userRecord.balance > 0n then {

      // Get delegation contract
      const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
      const delegationAddress: address = case generalContractsOptView of [
          Some (_optionContract) -> case _optionContract of [
                  Some (_contract)    -> _contract
              |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
              ]
      |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
      ];
      
      // -- Satellite rewards -- //
      // Get the user satelliteRewards record
      const satelliteRewardsOptView : option (option(satelliteRewards)) = Tezos.call_view ("getSatelliteRewardsOpt", userAddress, delegationAddress);
      const userHasSatelliteRewards: bool = case satelliteRewardsOptView of [
        Some (_v) -> True
      | None -> False
      ];

      // If user never delegated or registered as a satellite, it does not calculates its rewards
      var satelliteUnpaidRewards: nat := 0n;
      if userHasSatelliteRewards then
      block{
        const satelliteRewardsOpt: option(satelliteRewards) = case satelliteRewardsOptView of [
          Some (value) -> value
        | None -> failwith (error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
        ];

        satelliteUnpaidRewards := case satelliteRewardsOpt of [
          Some (_rewards) -> block{
            const getUserReferenceRewardOptView : option (option(satelliteRewards)) = Tezos.call_view ("getSatelliteRewardsOpt", _rewards.satelliteReferenceAddress, delegationAddress);
            const getUserReferenceRewardOpt: option(satelliteRewards) = case getUserReferenceRewardOptView of [
              Some (value) -> value
            | None -> failwith (error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
            ];
            
            // Calculate the user unclaimed rewards
            const satelliteReward: nat  = case getUserReferenceRewardOpt of [
              Some (_referenceRewards) -> block{
                const satelliteRewardsRatio: nat  = abs(_referenceRewards.satelliteAccumulatedRewardsPerShare - _rewards.participationRewardsPerShare);
                const satelliteRewards: nat       = userRecord.balance * satelliteRewardsRatio;
              } with (_rewards.unpaid + satelliteRewards / fixedPointAccuracy)
            | None -> failwith(error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND)
            ];
          } with (satelliteReward)
        | None -> 0n
        ];
      }
      else skip;


      // -- Exit fee rewards -- //
      // Calculate what fees the user missed since his/her last claim
      const currentFeesPerShare: nat = abs(s.accumulatedFeesPerShare - userRecord.participationFeesPerShare);
      // Calculate the user reward based on his sMVK
      const exitFeeRewards: nat = (currentFeesPerShare * userRecord.balance) / fixedPointAccuracy;

      
      // Increase the user balance
      userRecord.totalExitFeeRewardsClaimed   := userRecord.totalExitFeeRewardsClaimed + exitFeeRewards;
      userRecord.totalSatelliteRewardsClaimed := userRecord.totalSatelliteRewardsClaimed + satelliteUnpaidRewards;
      userRecord.balance                      := userRecord.balance + exitFeeRewards + satelliteUnpaidRewards;
      s.unclaimedRewards                      := abs(s.unclaimedRewards - exitFeeRewards);
    }
    else skip;
    // Set the user's participationFeesPerShare 
    userRecord.participationFeesPerShare := s.accumulatedFeesPerShare;
    // Update the doormanStorage
    s.userStakeBalanceLedger[userAddress]  := userRecord;

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

(* View: get admin variable *)
[@view] function getAdmin(const _: unit; var s : doormanStorage) : address is
  s.admin



(*  View: get config *)
[@view] function getConfig(const _: unit; const s: doormanStorage) : doormanConfigType is
  s.config



(*  View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; const s: doormanStorage) : whitelistContractsType is
  s.whitelistContracts



(*  View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; const s: doormanStorage) : generalContractsType is
  s.generalContracts



(*  View: get break glass config *)
[@view] function getBreakGlassConfig(const _: unit; const s: doormanStorage) : doormanBreakGlassConfigType is
  s.breakGlassConfig



(* View: get userStakeBalance *)
[@view] function getUserStakeBalanceOpt(const userAddress : address; var s : doormanStorage) : option(userStakeBalanceRecordType) is
  Big_map.find_opt(userAddress, s.userStakeBalanceLedger)



(*  View: unclaimedRewards *)
[@view] function getUnclaimedRewards(const _: unit; const s: doormanStorage) : nat is
  s.unclaimedRewards



(*  View: accumulatedFeesPerShare *)
[@view] function getAccumulatedFeesPerShare(const _: unit; const s: doormanStorage) : nat is
  s.accumulatedFeesPerShare



(* View: stakedBalance *)
[@view] function getStakedBalance(const userAddress : address; var s : doormanStorage) : nat is
  case s.userStakeBalanceLedger[userAddress] of [
    Some (_val) -> _val.balance
  | None -> 0n
]



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : doormanStorage) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : doormanStorage) : lambdaLedgerType is
  s.lambdaLedger

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



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

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



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : doormanUpdateConfigParamsType; var s : doormanStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateConfig(updateConfigParams);

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



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: doormanStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  migrateFunds entrypoint *)
function migrateFunds(const destinationAddress: address; var s: doormanStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMigrateFunds"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaMigrateFunds(destinationAddress);

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



(*  togglePauseFarmClaim entrypoint *)
function togglePauseFarmClaim(var s : doormanStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseFarmClaim"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaTogglePauseFarmClaim(unit);

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
function compound(const userAddress: address; var s: doormanStorage): return is
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCompound"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaCompound(userAddress);

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



(* vaultDepositStakedMvk entrypoint *)
function vaultDepositStakedMvk(const vaultDepositStakedMvkParams: vaultDepositStakedMvkType; var s: doormanStorage): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultDepositStakedMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* vaultWithdrawStakedMvk entrypoint *)
function vaultWithdrawStakedMvk(const vaultWithdrawStakedMvkParams: vaultWithdrawStakedMvkType; var s: doormanStorage): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultWithdrawStakedMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaVaultWithdrawStakedMvk(vaultWithdrawStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* vaultLiquidateStakedMvk entrypoint *)
function vaultLiquidateStakedMvk(const vaultLiquidateStakedMvkParams: vaultLiquidateStakedMvkType; var s: doormanStorage): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultLiquidateStakedMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaVaultLiquidateStakedMvk(vaultLiquidateStakedMvkParams);

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
        SetAdmin(parameters)                  -> setAdmin(parameters, s)
      | SetGovernance(parameters)             -> setGovernance(parameters, s)
      | UpdateMetadata(parameters)            -> updateMetadata(parameters, s)
      | UpdateConfig(parameters)              -> updateConfig(parameters, s)
      | UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
      | UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
      | MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
      | MigrateFunds(parameters)              -> migrateFunds(parameters, s)

        // Pause / Break Glass Entrypoints
      | PauseAll(_parameters)                 -> pauseAll(s)
      | UnpauseAll(_parameters)               -> unpauseAll(s)
      | TogglePauseStake(_parameters)         -> togglePauseStake(s)
      | TogglePauseUnstake(_parameters)       -> togglePauseUnstake(s)
      | TogglePauseCompound(_parameters)      -> togglePauseCompound(s)
      | TogglePauseFarmClaim(_parameters)     -> togglePauseFarmClaim(s)

        // Doorman Entrypoints
      | Stake(parameters)                     -> stake(parameters, s)  
      | Unstake(parameters)                   -> unstake(parameters, s)
      | Compound(parameters)                  -> compound(parameters, s)
      | FarmClaim(parameters)                 -> farmClaim(parameters, s)

        // Vault Entrypoints - callable only by USDM Token Controller
      | VaultDepositStakedMvk(parameters)     -> vaultDepositStakedMvk(parameters, s)
      | VaultWithdrawStakedMvk(parameters)    -> vaultWithdrawStakedMvk(parameters, s)
      | VaultLiquidateStakedMvk(parameters)   -> vaultLiquidateStakedMvk(parameters, s)

        // Lambda Entrypoints
      | SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
    
  )
