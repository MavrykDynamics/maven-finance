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
|   SetGovernance               of (address)
|   UpdateMetadata              of updateMetadataType
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
|   Claim                       of address

    // Lambda Entrypoints
|   SetLambda                   of setLambdaType


type return is list (operation) * farmStorage
const noOperations : list (operation) = nil;

// farm contract methods lambdas
type farmUnpackLambdaFunctionType is (farmLambdaActionType * farmStorage) -> return



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



function getDepositorDeposit(const depositor: depositor; const s: farmStorage): option(depositorRecord) is
    Big_map.find_opt(depositor, s.depositors)



function checkSenderIsAdmin(const s: farmStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
  else unit



function checkSenderIsCouncilOrFarmFactory(const s: farmStorage): unit is
block {

    const councilAddress: address = case s.whitelistContracts["council"] of [
        Some (_address) -> _address
    |   None -> (failwith(error_COUNCIL_CONTRACT_NOT_FOUND): address)
    ];

    if Tezos.sender = councilAddress then skip
    else {
      const farmFactoryAddress: address = case s.whitelistContracts["farmFactory"] of [
              Some (_address) -> _address
          |   None -> (failwith(error_FARM_FACTORY_CONTRACT_NOT_FOUND): address)
      ];
      if Tezos.sender = farmFactoryAddress then skip
      else failwith(error_ONLY_FARM_FACTORY_OR_COUNCIL_CONTRACT_ALLOWED);
    }

} with(unit)



function checkSenderIsAllowed(const s: farmStorage): unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsGovernanceOrFactory(const s: farmStorage): unit is
block {

    // First check because a farm without a facory should still be accessible
    if Tezos.sender = s.admin or Tezos.sender = s.governanceAddress then skip
    else{
        const farmFactoryAddress: address = case s.whitelistContracts["farmFactory"] of [
                Some (_address) -> _address
            |   None -> (failwith(error_ONLY_ADMIN_OR_FARM_FACTORY_CONTRACT_ALLOWED): address)
        ];
        if Tezos.sender = farmFactoryAddress then skip else failwith(error_ONLY_ADMIN_OR_FARM_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)



function checkFarmIsInit(const s: farmStorage): unit is 
  if not s.init then failwith(error_FARM_NOT_INITIATED)
  else unit



function checkFarmIsOpen(const s: farmStorage): unit is 
  if not s.open then failwith(error_FARM_CLOSED)
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
    if s.breakGlassConfig.depositIsPaused then failwith(error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED)
    else unit;

function checkWithdrawIsNotPaused(var s : farmStorage) : unit is
    if s.breakGlassConfig.withdrawIsPaused then failwith(error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED)
    else unit;

function checkClaimIsNotPaused(var s : farmStorage) : unit is
    if s.breakGlassConfig.claimIsPaused then failwith(error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED)
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
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND): contract(oldTransferType))
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
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND): contract(newTransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))



function transferLP(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenStandard: lpStandard; const tokenContractAddress: address): operation is
    case tokenStandard of [
            Fa12 -> transferFa12Token(from_,to_,tokenAmount,tokenContractAddress)
        |   Fa2 -> transferFa2Token(from_,to_,tokenAmount,tokenId,tokenContractAddress)
    ]

    

function transferReward(const depositor: depositor; const tokenAmount: tokenBalance; const s: farmStorage): operation is
block{

    // Call farmClaim from the doorman contract
    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
    const doormanContractAddress: address = case generalContractsOptView of [
        Some (_optionContract) -> case _optionContract of [
                Some (_contract)    -> _contract
            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
            ]
    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    
    const doormanContract: contract(farmClaimType) =
    case (Tezos.get_entrypoint_opt("%farmClaim", doormanContractAddress): option(contract(farmClaimType))) of [
        Some (c) -> c
    |   None -> (failwith(error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND): contract(farmClaimType))
    ];

    const farmClaimParams: farmClaimType = (depositor, tokenAmount, s.config.forceRewardFromTransfer);

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
    s.accumulatedRewardsPerShare := s.accumulatedRewardsPerShare + ((reward * fixedPointAccuracy) / s.config.lpToken.tokenBalance);
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



function updateUnclaimedRewards(const depositor: depositor; var s: farmStorage): farmStorage is
block{

    // Check if sender as already a record
    var depositorRecord: depositorRecord :=
        case getDepositorDeposit(depositor, s) of [
            Some (r) -> r
        |   None -> (failwith(error_DEPOSITOR_NOT_FOUND): depositorRecord)
        ];

    // Compute depositor reward
    const accumulatedRewardsPerShareStart: tokenBalance = depositorRecord.participationRewardsPerShare;
    const accumulatedRewardsPerShareEnd: tokenBalance = s.accumulatedRewardsPerShare;
    if accumulatedRewardsPerShareStart > accumulatedRewardsPerShareEnd then failwith(error_CALCULATION_ERROR) else skip;
    const currentMVKPerShare = abs(accumulatedRewardsPerShareEnd - accumulatedRewardsPerShareStart);
    const depositorReward = (currentMVKPerShare * depositorRecord.balance) / fixedPointAccuracy;

    // Update paid and unpaid rewards in farmStorage
    if depositorReward > s.claimedRewards.unpaid then failwith(error_CALCULATION_ERROR) else skip;
    s.claimedRewards := record[
        unpaid=abs(s.claimedRewards.unpaid - depositorReward);
        paid=s.claimedRewards.paid + depositorReward;
    ];

    // Update user's unclaimed rewards and participationRewardsPerShare
    depositorRecord.unclaimedRewards := depositorRecord.unclaimedRewards + depositorReward;
    depositorRecord.participationRewardsPerShare := accumulatedRewardsPerShareEnd;
    s.depositors := Big_map.update(depositor, Some (depositorRecord), s.depositors);

} with(s)

// ------------------------------------------------------------------------------
// Farm Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(farmUnpackLambdaFunctionType)) of [
        Some(f) -> f(farmLambdaAction, s)
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

// Farm Lambdas:
#include "../partials/contractLambdas/farm/farmLambdas.ligo"

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
[@view] function getAdmin(const _: unit; var s : farmStorage) : address is
  s.admin



(* View: get name variable *)
[@view] function getName(const _: unit; var s : farmStorage) : string is
  s.name



(*  View: get config *)
[@view] function getConfig(const _: unit; const s: farmStorage) : farmConfigType is
  s.config



(*  View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; const s: farmStorage) : whitelistContractsType is
  s.whitelistContracts



(*  View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; const s: farmStorage) : generalContractsType is
  s.generalContracts



(*  View: get break glass config *)
[@view] function getBreakGlassConfig(const _: unit; const s: farmStorage) : farmBreakGlassConfigType is
  s.breakGlassConfig



(*  View: get last block update *)
[@view] function getLastBlockUpdate(const _: unit; const s: farmStorage) : nat is
  s.lastBlockUpdate



(*  View: get last block update *)
[@view] function getAccumulatedRewardsPerShare(const _: unit; const s: farmStorage) : nat is
  s.accumulatedRewardsPerShare



(*  View: get claimed rewards *)
[@view] function getClaimedRewards(const _: unit; const s: farmStorage) : claimedRewards is
  s.claimedRewards



(*  View: get depositor *)
[@view] function getDepositorOpt(const depositorAddress: depositor; const s: farmStorage) : option(depositorRecord) is
  Big_map.find_opt(depositorAddress, s.depositors)



(*  View: get open *)
[@view] function getOpen(const _: unit; const s: farmStorage) : bool is
  s.open



(*  View: get init *)
[@view] function getInit(const _: unit; const s: farmStorage) : bool is
  s.init



(*  View: get init block *)
[@view] function getInitBlock(const _: unit; const s: farmStorage) : nat is
  s.initBlock



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : farmStorage) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : farmStorage) : lambdaLedgerType is
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
function setAdmin(const newAdminAddress : address; var s : farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);

} with response



(*  updateMetadata Entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : farmUpdateConfigParamsType; var s : farmStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response

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

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUpdateBlocksPerMinute(blocksPerMinute);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(* initFarm Entrypoint *)
function initFarm (const initFarmParams: initFarmParamsType; var s: farmStorage) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaInitFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaInitFarm(initFarmParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(* closeFarm Entrypoint *)
function closeFarm (var s: farmStorage) : return is
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCloseFarm"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaCloseFarm(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response

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

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  togglePauseDeposit entrypoint *)
function togglePauseDeposit(var s : farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseDeposit"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaTogglePauseDeposit(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  togglePauseWithdraw entrypoint *)
function togglePauseWithdraw(var s : farmStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseWithdraw"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaTogglePauseWithdraw(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(*  togglePauseClaim entrypoint *)
function togglePauseClaim(var s : farmStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseClaim"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaTogglePauseClaim(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response

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

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaDeposit(tokenAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(* withdraw Entrypoint *)
function withdraw(const tokenAmount: tokenBalance; var s: farmStorage) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdraw"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaWithdraw(tokenAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response



(* Claim Entrypoint *)
function claim(const depositor: depositor; var s: farmStorage) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaClaim"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farm lambda action
    const farmLambdaAction : farmLambdaActionType = LambdaClaim(depositor);

    // init response
    const response : return = unpackLambda(lambdaBytes, farmLambdaAction, s);  

} with response

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
        |   SetGovernance (parameters)               -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)              -> updateMetadata(parameters, s)
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
        |   Claim (parameters)                       -> claim(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                    -> setLambda(parameters, s)
    ]
  )