// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Farm types
#include "../partials/types/farmTypes.ligo"

// ------------------------------------------------------------------------------

type farmAction is

    // Housekeeping Entrypoints
    SetAdmin                    of (address)
|   UpdateMetadata              of (string * bytes)
|   UpdateConfig                of farmUpdateConfigParamsType
|   UpdateWhitelistContracts    of updateWhitelistContractsParams
|   UpdateGeneralContracts      of updateGeneralContractsParams

    // Farm Admin Entrypoints
|   UpdateBlocksPerMinute       of (nat)
|   InitFarm                    of initFarmParamsType
|   CloseFarm                   of (unit)

    // Pause / Break Glass Entrypoints
|   PauseAll                    of (unit)
|   UnpauseAll                  of (unit)
|   TogglePauseDeposit          of (unit)
|   TogglePauseWithdraw         of (unit)
|   TogglePauseClaim            of (unit)

    // Farm Entrypoints
|   Deposit                     of nat
|   Withdraw                    of nat
|   Claim                       of unit

    // Lambda Entrypoints
|   SetLambda                   of setLambdaType


type return is list (operation) * farmStorage
const noOperations : list (operation) = nil;


// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const fixedPointAccuracy: nat = 1_000_000_000_000_000_000_000_000n; // 10^24

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

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                             = 0n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                                          = 1n;
[@inline] const error_ONLY_ADMIN_OR_FACTORY_CONTRACT_ALLOWED                                 = 2n;
[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                                             = 3n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                      = 4n;

[@inline] const error_FARM_NOT_INITIATED                                                     = 5n;
[@inline] const error_FARM_IS_CLOSED                                                         = 6n;
[@inline] const error_DEPOSIT_ENTRYPOINT_IS_PAUSED                                           = 7n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IS_PAUSED                                          = 8n;
[@inline] const error_CLAIM_ENTRYPOINT_IS_PAUSED                                             = 9n;
[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND_IN_GENERAL_CONTRACTS                        = 10n;
[@inline] const error_FARM_CLAIM_ENTRYPOINT_NOT_FOUND_IN_DOORMAN_CONTRACT                    = 11n;
[@inline] const error_DELEGATOR_NOT_FOUND                                                    = 12n;
[@inline] const error_DELEGATOR_REWARD_DEBT_IS_HIGHER_THAN_ACCUMULATED_MVK_PER_SHARE         = 13n;
[@inline] const error_DELEGATOR_REWARD_IS_HIGHER_THAN_TOTAL_UNPAID_REWARD                    = 14n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_LP_FA12_CONTRACT_NOT_FOUND                      = 15n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_LP_FA2_CONTRACT_NOT_FOUND                       = 16n;

[@inline] const error_LAMBDA_NOT_FOUND                                                       = 17n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                = 18n;

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

function getDelegatorDeposit(const delegator: delegator; const s: farmStorage): option(delegatorRecord) is
    Big_map.find_opt(delegator, s.delegators)



function checkSenderIsAdmin(const s: farmStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
  else unit



function checkSenderOrSourceIsCouncil(const s: farmStorage): unit is
block {

    const councilAddress: address = case s.whitelistContracts["council"] of [
        Some (_address) -> _address
    |   None -> (failwith(error_COUNCIL_CONTRACT_NOT_FOUND): address)
    ];

    if Tezos.source = councilAddress or Tezos.sender = councilAddress then skip
    else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with(unit)



function checkSenderIsAllowed(const s: farmStorage): unit is
block {

    // First check because a farm without a facory should still be accessible
    if Tezos.sender = s.admin then skip
    else{
        const farmFactoryAddress: address = case s.whitelistContracts["farmFactory"] of [
                Some (_address) -> _address
            |   None -> (failwith(error_ONLY_ADMIN_OR_FACTORY_CONTRACT_ALLOWED): address)
        ];
        if Tezos.sender = farmFactoryAddress then skip else failwith(error_ONLY_ADMIN_OR_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)



function checkFarmIsInit(const s: farmStorage): unit is 
  if not s.init then failwith(error_FARM_NOT_INITIATED)
  else unit



function checkFarmIsOpen(const s: farmStorage): unit is 
  if not s.open then failwith(error_FARM_IS_CLOSED)
  else unit



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

function checkDepositIsNotPaused(var s : farmStorage) : unit is
    if s.breakGlassConfig.depositIsPaused then failwith(error_DEPOSIT_ENTRYPOINT_IS_PAUSED)
    else unit;

function checkWithdrawIsNotPaused(var s : farmStorage) : unit is
    if s.breakGlassConfig.withdrawIsPaused then failwith(error_WITHDRAW_ENTRYPOINT_IS_PAUSED)
    else unit;

function checkClaimIsNotPaused(var s : farmStorage) : unit is
    if s.breakGlassConfig.claimIsPaused then failwith(error_CLAIM_ENTRYPOINT_IS_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenContractAddress: address): operation is
block{

    const transferParams: oldTransferType = (from_,(to_,tokenAmount));

    const tokenContract: contract(oldTransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(oldTransferType))) of [
                Some (c) -> c
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_LP_FA12_CONTRACT_NOT_FOUND): contract(oldTransferType))
        ];

} with (Tezos.transaction(transferParams, 0tez, tokenContract))



function transferFa2Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenContractAddress: address): operation is
block{
    const transferParams: newTransferType = list[
            record[
                from_=from_;
                txs=list[
                    record[
                        to_=to_;
                        token_id=tokenId;
                        amount=tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(newTransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(newTransferType))) of [
                Some (c) -> c
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_LP_FA2_CONTRACT_NOT_FOUND): contract(newTransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))



function transferLP(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenStandard: lpStandard; const tokenContractAddress: address): operation is
    case tokenStandard of [
            Fa12 -> transferFa12Token(from_,to_,tokenAmount,tokenContractAddress)
        |   Fa2 -> transferFa2Token(from_,to_,tokenAmount,tokenId,tokenContractAddress)
    ]

    

function transferReward(const delegator: delegator; const tokenAmount: tokenBalance; const s: farmStorage): operation is
block{

    // Call farmClaim from the doorman contract
    const doormanContractAddress: address = case Big_map.find_opt("doorman", s.generalContracts) of [
        Some (a) -> a
    |   None -> (failwith(error_DOORMAN_CONTRACT_NOT_FOUND_IN_GENERAL_CONTRACTS): address)
    ];
    
    const doormanContract: contract(farmClaimType) =
    case (Tezos.get_entrypoint_opt("%farmClaim", doormanContractAddress): option(contract(farmClaimType))) of [
        Some (c) -> c
    |   None -> (failwith(error_FARM_CLAIM_ENTRYPOINT_NOT_FOUND_IN_DOORMAN_CONTRACT): contract(farmClaimType))
    ];

    const farmClaimParams: farmClaimType = (delegator, tokenAmount, s.config.forceRewardFromTransfer);

} with (Tezos.transaction(farmClaimParams, 0tez, doormanContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Helper Functions Begin
// ------------------------------------------------------------------------------

function updateBlock(var s: farmStorage): farmStorage is
block{
    
    // Close farm is totalBlocks duration has been exceeded
    const lastBlock: nat = s.config.plannedRewards.totalBlocks + s.initBlock;
    s.open := Tezos.level <= lastBlock or s.config.infinite;

    // Update lastBlockUpdate in farmStorage
    s.lastBlockUpdate := Tezos.level;

} with(s)



function updateFarmParameters(var s: farmStorage): farmStorage is
block{

    // Compute the potential reward of this block
    const multiplier: nat = abs(Tezos.level - s.lastBlockUpdate);
    const suspectedReward: tokenBalance = multiplier * s.config.plannedRewards.currentRewardPerBlock;

    // This check is necessary in case the farm unpaid reward was not updated for a long time
    // and the outstandingReward grew to such a big number that it exceeds the planned rewards.
    // In that case only the difference between planned and claimed rewards is paid out to empty
    // the account.
    const totalClaimedRewards: tokenBalance = s.claimedRewards.paid + s.claimedRewards.unpaid;
    const totalFarmRewards: tokenBalance = suspectedReward + totalClaimedRewards;
    const totalPlannedRewards: tokenBalance = s.config.plannedRewards.totalRewards;
    const reward: tokenBalance = case totalFarmRewards > totalPlannedRewards and not s.config.infinite of [
        True -> abs(totalPlannedRewards - totalClaimedRewards)
    |   False -> suspectedReward
    ];
        
    // Updates the farmStorage
    s.claimedRewards.unpaid := s.claimedRewards.unpaid + reward;
    s.accumulatedMVKPerShare := s.accumulatedMVKPerShare + ((reward * fixedPointAccuracy) / s.config.lpToken.tokenBalance);
    s := updateBlock(s);

} with(s)



function updateFarm(var s: farmStorage): farmStorage is
block{
    s := case s.config.lpToken.tokenBalance = 0n of [
        True -> updateBlock(s)
    |   False -> case s.lastBlockUpdate = Tezos.level or not s.open of [
            True -> s
        |   False -> updateFarmParameters(s)
        ]
    ];
} with(s)



function updateUnclaimedRewards(var s: farmStorage): farmStorage is
block{

    // Get delegator
    const delegator: delegator = Tezos.sender;

    // Check if sender as already a record
    var delegatorRecord: delegatorRecord :=
        case getDelegatorDeposit(delegator, s) of [
            Some (r) -> r
        |   None -> (failwith(error_DELEGATOR_NOT_FOUND): delegatorRecord)
        ];

    // Compute delegator reward
    const accumulatedMVKPerShareStart: tokenBalance = delegatorRecord.participationMVKPerShare;
    const accumulatedMVKPerShareEnd: tokenBalance = s.accumulatedMVKPerShare;
    if accumulatedMVKPerShareStart > accumulatedMVKPerShareEnd then failwith(error_DELEGATOR_REWARD_DEBT_IS_HIGHER_THAN_ACCUMULATED_MVK_PER_SHARE) else skip;
    const currentMVKPerShare = abs(accumulatedMVKPerShareEnd - accumulatedMVKPerShareStart);
    const delegatorReward = (currentMVKPerShare * delegatorRecord.balance) / fixedPointAccuracy;

    // Update paid and unpaid rewards in farmStorage
    if delegatorReward > s.claimedRewards.unpaid then failwith(error_DELEGATOR_REWARD_IS_HIGHER_THAN_TOTAL_UNPAID_REWARD) else skip;
    s.claimedRewards := record[
        unpaid=abs(s.claimedRewards.unpaid - delegatorReward);
        paid=s.claimedRewards.paid + delegatorReward;
    ];

    // Update user's unclaimed rewards and participationMVKPerShare
    delegatorRecord.unclaimedRewards := delegatorRecord.unclaimedRewards + delegatorReward;
    delegatorRecord.participationMVKPerShare := accumulatedMVKPerShareEnd;
    s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

} with(s)

// ------------------------------------------------------------------------------
// Farm Helper Functions End
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

// Farm Lambdas:
#include "../partials/contractLambdas/farm/farmLambdas.ligo"

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
function setAdmin(const newAdminAddress : address; var s : farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * farmStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateMetadata Entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((string * bytes * farmStorage) -> return )) of [
      | Some(f) -> f(metadataKey, metadataHash, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : farmUpdateConfigParamsType; var s : farmStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmUpdateConfigParamsType * farmStorage) -> return )) of [
      | Some(f) -> f(updateConfigParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateWhitelistContractsParams * farmStorage) -> return )) of [
      | Some(f) -> f(updateWhitelistContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateGeneralContractsParams * farmStorage) -> return )) of [
      | Some(f) -> f(updateGeneralContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Admin Entrypoints End
// ------------------------------------------------------------------------------

(*  updateBlocksPerMinute Entrypoint *)
function updateBlocksPerMinute(const blocksPerMinute: nat; var s: farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateBlocksPerMinute"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * farmStorage) -> return )) of [
      | Some(f) -> f(blocksPerMinute, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* initFarm Entrypoint *)
function initFarm (const initFarmParams: initFarmParamsType; var s: farmStorage) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaInitFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((initFarmParamsType * farmStorage) -> return )) of [
      | Some(f) -> f(initFarmParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* closeFarm Entrypoint *)
function closeFarm (var s: farmStorage) : return is
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCloseFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Farm Admin Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint *)
function pauseAll(var s: farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  unpauseAll entrypoint *)
function unpauseAll(var s : farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  togglePauseDeposit entrypoint *)
function togglePauseDeposit(var s : farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseDeposit"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  togglePauseWithdraw entrypoint *)
function togglePauseWithdraw(var s : farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseWithdraw"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(*  togglePauseClaim entrypoint *)
function togglePauseClaim(var s : farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseClaim"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Entrypoints Begin
// ------------------------------------------------------------------------------

(* deposit Entrypoint *)
function deposit(const tokenAmount: tokenBalance; var s: farmStorage) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDeposit"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((tokenBalance * farmStorage) -> return )) of [
      | Some(f) -> f(tokenAmount, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with(res.0, res.1)



(* withdraw Entrypoint *)
function withdraw(const tokenAmount: tokenBalance; var s: farmStorage) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdraw"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((tokenBalance * farmStorage) -> return )) of [
      | Some(f) -> f(tokenAmount, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with(res.0, res.1)



(* Claim Entrypoint *)
function claim(var s: farmStorage) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaClaim"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((farmStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with(res.0, res.1)

// ------------------------------------------------------------------------------
// Farm Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: farmStorage): return is
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
function main (const action: farmAction; var s: farmStorage): return is
  block{
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

  } with(

    case action of [

            // Housekeeping Entrypoints
            SetAdmin (parameters)                    -> setAdmin(parameters, s)
        |   UpdateMetadata (parameters)              -> updateMetadata(parameters.0, parameters.1, s)
        |   UpdateConfig (parameters)                -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)    -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)      -> updateGeneralContracts(parameters, s)

            // Farm Admin Entrypoints
        |   UpdateBlocksPerMinute (parameters)       -> updateBlocksPerMinute(parameters, s)
        |   InitFarm (parameters)                    -> initFarm(parameters, s)
        |   CloseFarm (_parameters)                  -> closeFarm(s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                   -> pauseAll(s)
        |   UnpauseAll (_parameters)                 -> unpauseAll(s)
        |   TogglePauseDeposit (_parameters)         -> togglePauseDeposit(s)
        |   TogglePauseWithdraw (_parameters)        -> togglePauseWithdraw(s)
        |   TogglePauseClaim (_parameters)           -> togglePauseClaim(s)

            // Farm Entrypoints
        |   Deposit (parameters)                     -> deposit(parameters, s)
        |   Withdraw (parameters)                    -> withdraw(parameters, s)
        |   Claim (_parameters)                      -> claim(s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                    -> setLambda(parameters, s)
    ]
  )