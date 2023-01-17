// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Doorman types
#include "../partials/contractTypes/doormanTypes.ligo"

// MvkToken types for transfer
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury types for farmClaim
#include "../partials/contractTypes/treasuryTypes.ligo"

// Delegation types for compound
#include "../partials/contractTypes/delegationTypes.ligo"

// ------------------------------------------------------------------------------

type doormanAction is 

        // Housekeeping Entrypoints
        SetAdmin                    of (address)
    |   SetGovernance               of (address)
    |   UpdateMetadata              of updateMetadataType
    |   UpdateConfig                of doormanUpdateConfigParamsType
    |   UpdateWhitelistContracts    of updateWhitelistContractsType
    |   UpdateGeneralContracts      of updateGeneralContractsType
    |   MistakenTransfer            of transferActionType
    |   MigrateFunds                of (address)

        // Pause / Break Glass Entrypoints
    |   PauseAll                    of (unit)
    |   UnpauseAll                  of (unit)
    |   TogglePauseEntrypoint      of doormanTogglePauseEntrypointType

        // Doorman Entrypoints
    |   Stake                       of (nat)
    |   Unstake                     of (nat)
    |   Compound                    of (address)
    |   FarmClaim                   of farmClaimType

        // Vault Entrypoints - callable only by USDM Token Controller
    |   OnVaultDepositStakedMvk       of onVaultDepositStakedMvkType
    |   OnVaultWithdrawStakedMvk      of onVaultWithdrawStakedMvkType
    |   OnVaultLiquidateStakedMvk     of onVaultLiquidateStakedMvkType

        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * doormanStorageType

// doorman contract methods lambdas
type doormanUnpackLambdaFunctionType is (doormanLambdaActionType * doormanStorageType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const fixedPointAccuracy : nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36

// ------------------------------------------------------------------------------
//
// Constants End
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

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : doormanStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : doormanStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: MVK Token Address
function checkSenderIsMvkTokenContract(var s : doormanStorageType) : unit is
block{

  const mvkTokenAddress : address = s.mvkTokenAddress;
  
  if (Tezos.get_sender() = mvkTokenAddress) then skip
  else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Delegation Contract
function checkSenderIsDelegationContract(var s : doormanStorageType) : unit is
block{

    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    if (Tezos.get_sender() = delegationAddress) then skip
    else failwith(error_ONLY_DELEGATION_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : doormanStorageType) : unit is
block{
        
    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);

    }

} with unit



// Allowed Senders: Lending Controller Contract
function checkSenderIsLendingControllerContract(var s : doormanStorageType) : unit is
block{

    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
    if (Tezos.get_sender() = lendingControllerAddress) then skip
    else failwith(error_ONLY_LENDING_CONTROLLER_CONTRACT_ALLOWED);

} with unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %stake entrypoint is not paused
function checkStakeIsNotPaused(var s : doormanStorageType) : unit is
    if s.breakGlassConfig.stakeIsPaused then failwith(error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %unstake entrypoint is not paused
function checkUnstakeIsNotPaused(var s : doormanStorageType) : unit is
    if s.breakGlassConfig.unstakeIsPaused then failwith(error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %compound entrypoint is not paused
function checkCompoundIsNotPaused(var s : doormanStorageType) : unit is
    if s.breakGlassConfig.compoundIsPaused then failwith(error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %farmClaim entrypoint is not paused
function checkFarmClaimIsNotPaused(var s : doormanStorageType) : unit is
    if s.breakGlassConfig.farmClaimIsPaused then failwith(error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %onVaultDepositStakedMvk entrypoint is not paused
function checkOnVaultDepositStakedMvkIsNotPaused(var s : doormanStorageType) : unit is
    if s.breakGlassConfig.onVaultDepositStakedMvkIsPaused then failwith(error_ON_VAULT_DEPOSIT_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %onVaultWithdrawStakedMvk entrypoint is not paused
function checkOnVaultWithdrawStakedMvkIsNotPaused(var s : doormanStorageType) : unit is
    if s.breakGlassConfig.onVaultWithdrawStakedMvkIsPaused then failwith(error_ON_VAULT_WITHDRAW_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %onVaultLiquidateStakedMvk entrypoint is not paused
function checkOnVaultLiquidateStakedMvkIsNotPaused(var s : doormanStorageType) : unit is
    if s.breakGlassConfig.onVaultLiquidateStakedMvkIsPaused then failwith(error_ON_VAULT_LIQUIDATE_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %onStakeChange entrypoint in the Delegation Contract
function delegationOnStakeChange(const delegationAddress : address) : contract(delegationOnStakeChangeType) is
    case (Tezos.get_entrypoint_opt(
        "%onStakeChange",
        delegationAddress) : option(contract(delegationOnStakeChangeType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_STAKE_CHANGE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(delegationOnStakeChangeType))
        ];



// helper function to get transfer entrypoint
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(fa2TransferType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        tokenAddress) : option(contract(fa2TransferType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(fa2TransferType))
        ];





// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
    case (Tezos.get_entrypoint_opt(
        "%mintMvkAndTransfer",
        contractAddress) : option(contract(mintMvkAndTransferType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvkAndTransferType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Compound Helper Functions Begin
// ------------------------------------------------------------------------------

(*  compoundUserRewards helper function *)
function compoundUserRewards(const userAddress : address; var s : doormanStorageType) : doormanStorageType is 
block{ 
    
    // Get the user's record
    var userRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[userAddress] of [
            Some (_val) -> _val
        |   None -> record[
                balance                       = 0n;
                participationFeesPerShare     = s.accumulatedFeesPerShare;
                totalExitFeeRewardsClaimed    = 0n;
                totalSatelliteRewardsClaimed  = 0n;
                totalFarmRewardsClaimed       = 0n;
            ]
    ];

    // Check if the user has more than 0 staked MVK. If he/she hasn't, he cannot earn rewards
    if userRecord.balance > 0n then {

        // Get Delegation Contract address from the General Contracts Map on the Governance Contract
        const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);
      
        // -- Satellite rewards -- //
        
        // Call the %getSatelliteRewardsOpt view on the Delegation Contract
        const satelliteRewardsOptView : option (option(satelliteRewardsType)) = Tezos.call_view ("getSatelliteRewardsOpt", userAddress, delegationAddress);

        // Check if user has any satellite rewards
        const userHasSatelliteRewards : bool = case satelliteRewardsOptView of [
                Some (_v) -> True
            |   None      -> False
        ];

        // If user has never delegated or registered as a satellite, no reward is calculated
        var satelliteUnpaidRewards : nat := 0n;
        if userHasSatelliteRewards then
        block{

            // Get the user satelliteRewards record from the %getSatelliteRewardsOpt view above
            const satelliteRewardsOpt : option(satelliteRewardsType) = case satelliteRewardsOptView of [
                    Some (value) -> value
                |   None         -> failwith (error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
            ];

            satelliteUnpaidRewards := case satelliteRewardsOpt of [
                    Some (_rewards) -> block{

                        // Get the rewards record of the satellite that user is delegated to (satelliteReferenceAddress)
                        const getUserReferenceRewardOptView : option (option(satelliteRewardsType)) = Tezos.call_view ("getSatelliteRewardsOpt", _rewards.satelliteReferenceAddress, delegationAddress);
                        const getUserReferenceRewardOpt : option(satelliteRewardsType) = case getUserReferenceRewardOptView of [
                                Some (value) -> value
                            |   None         -> failwith (error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                        ];
                        
                        // Calculate the user unclaimed rewards - i.e. satelliteRewardsRatio * user balance
                        const satelliteReward : nat  = case getUserReferenceRewardOpt of [
                                Some (_referenceRewards) -> block{
                                    
                                    const satelliteRewardsRatio  : nat  = abs(_referenceRewards.satelliteAccumulatedRewardsPerShare - _rewards.participationRewardsPerShare);
                                    const satelliteRewards       : nat  = userRecord.balance * satelliteRewardsRatio;

                                } with (_rewards.unpaid + satelliteRewards / fixedPointAccuracy)
                            |   None -> failwith(error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND)
                        ];

                    } with (satelliteReward)
                |   None -> 0n
            ];
        }
        else skip;


        // -- Exit fee rewards -- //
        // Calculate what exit fees the user missed since his/her last claim
        const currentFeesPerShare : nat = abs(s.accumulatedFeesPerShare - userRecord.participationFeesPerShare);

        // Calculate the user reward based on his staked MVK balance
        const exitFeeRewards : nat = (currentFeesPerShare * userRecord.balance) / fixedPointAccuracy;

        // Update the user balance
        userRecord.totalExitFeeRewardsClaimed    := userRecord.totalExitFeeRewardsClaimed + exitFeeRewards;
        userRecord.totalSatelliteRewardsClaimed  := userRecord.totalSatelliteRewardsClaimed + satelliteUnpaidRewards;
        userRecord.balance                       := userRecord.balance + exitFeeRewards + satelliteUnpaidRewards;
        s.unclaimedRewards                       := abs(s.unclaimedRewards - exitFeeRewards);

    }
    else skip;

    // Set the user's participationFeesPerShare to the current accumulatedFeesPerShare
    userRecord.participationFeesPerShare   := s.accumulatedFeesPerShare;
    
    // Update storage: user stake balance ledger
    s.userStakeBalanceLedger[userAddress]  := userRecord;

} with (s)

// ------------------------------------------------------------------------------
// Compound Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(doormanUnpackLambdaFunctionType)) of [
            Some(f) -> f(doormanLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
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
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------

// Doorman Lambdas:
#include "../partials/contractLambdas/doorman/doormanLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Helpers End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : doormanStorageType) : address is
    s.admin



(*  View: get config *)
[@view] function getConfig(const _ : unit; const s : doormanStorageType) : doormanConfigType is
    s.config



(*  View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; const s : doormanStorageType) : whitelistContractsType is
    s.whitelistContracts



(*  View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; const s : doormanStorageType) : generalContractsType is
    s.generalContracts



(*  View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; const s : doormanStorageType) : doormanBreakGlassConfigType is
    s.breakGlassConfig



(* View: get userStakeBalance *)
[@view] function getUserStakeBalanceOpt(const userAddress : address; const s : doormanStorageType) : option(userStakeBalanceRecordType) is
    Big_map.find_opt(userAddress, s.userStakeBalanceLedger)



(*  View: unclaimedRewards *)
[@view] function getUnclaimedRewards(const _ : unit; const s : doormanStorageType) : nat is
    s.unclaimedRewards



(*  View: accumulatedFeesPerShare *)
[@view] function getAccumulatedFeesPerShare(const _ : unit; const s : doormanStorageType) : nat is
    s.accumulatedFeesPerShare



(* View: stakedBalance *)
[@view] function getStakedBalance(const userAddress : address; const s : doormanStorageType) : nat is
block {

    const userStakeRecord : userStakeBalanceRecordType = case s.userStakeBalanceLedger[userAddress] of [
            Some (_record) -> _record
        |   None           -> record[
                balance                        = 0n;
                totalExitFeeRewardsClaimed     = 0n;
                totalSatelliteRewardsClaimed   = 0n;
                totalFarmRewardsClaimed        = 0n;
                participationFeesPerShare      = s.accumulatedFeesPerShare;
            ]
    ];

    // get user balance and current participation fees per share
    const userBalance : nat = userStakeRecord.balance;
    const userParticipationFeesPerShare : nat = userStakeRecord.participationFeesPerShare;

    // calculate user rewards increment 
    const currentFeesPerShare : nat = abs(s.accumulatedFeesPerShare - userParticipationFeesPerShare);
    const additionalRewards : nat = (currentFeesPerShare * userBalance) / fixedPointAccuracy;

    // calculate user total staked balance
    const userTotalStakedBalance : nat = userBalance + additionalRewards;

} with userTotalStakedBalance
    



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : doormanStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; const s : doormanStorageType) : lambdaLedgerType is
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
function setAdmin(const newAdminAddress : address; var s : doormanStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : doormanStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);

} with response



(*  updateMetadata entrypoint: update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : doormanStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : doormanUpdateConfigParamsType; var s : doormanStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : doormanStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : doormanStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : doormanStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  migrateFunds entrypoint *)
function migrateFunds(const destinationAddress : address; var s : doormanStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMigrateFunds"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function pauseAll(var s : doormanStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  
    
} with response



(*  unpauseAll entrypoint *)
function unpauseAll(var s : doormanStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : doormanTogglePauseEntrypointType; const s : doormanStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

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
function stake(const stakeAmount : nat; var s : doormanStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaStake"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaStake(stakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  unstake entrypoint *)
function unstake(const unstakeAmount : nat; var s : doormanStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnstake"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaUnstake(unstakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(*  compound entrypoint *)
function compound(const userAddress : address; var s : doormanStorageType) : return is
block{
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCompound"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaCompound(userAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* farmClaim entrypoint *)
function farmClaim(const farmClaim : farmClaimType; var s : doormanStorageType) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaFarmClaim"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaFarmClaim(farmClaim);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* onVaultDepositStakedMvk entrypoint *)
function onVaultDepositStakedMvk(const onVaultDepositStakedMvkParams : onVaultDepositStakedMvkType; var s: doormanStorageType): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnVaultDepositStakedMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaOnVaultDepositStakedMvk(onVaultDepositStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* onVaultWithdrawStakedMvk entrypoint *)
function onVaultWithdrawStakedMvk(const onVaultWithdrawStakedMvkParams : onVaultWithdrawStakedMvkType; var s: doormanStorageType): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnVaultWithdrawStakedMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaOnVaultWithdrawStakedMvk(onVaultWithdrawStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, doormanLambdaAction, s);  

} with response



(* onVaultLiquidateStakedMvk entrypoint *)
function onVaultLiquidateStakedMvk(const onVaultLiquidateStakedMvkParams : onVaultLiquidateStakedMvkType; var s: doormanStorageType): return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnVaultLiquidateStakedMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init doorman lambda action
    const doormanLambdaAction : doormanLambdaActionType = LambdaOnVaultLiquidateStakedMvk(onVaultLiquidateStakedMvkParams);

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
function setLambda(const setLambdaParams : setLambdaType; var s : doormanStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : doormanAction; const s : doormanStorageType) : return is
block {
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with(

    case action of [

            // Housekeeping Entrypoints
            SetAdmin(parameters)                  -> setAdmin(parameters, s)
        |   SetGovernance(parameters)             -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)            -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)              -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)  -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)    -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)          -> mistakenTransfer(parameters, s)
        |   MigrateFunds(parameters)              -> migrateFunds(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                 -> pauseAll(s)
        |   UnpauseAll(_parameters)               -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)     -> togglePauseEntrypoint(parameters, s)

            // Doorman Entrypoints
        |   Stake(parameters)                     -> stake(parameters, s)  
        |   Unstake(parameters)                   -> unstake(parameters, s)
        |   Compound(parameters)                  -> compound(parameters, s)
        |   FarmClaim(parameters)                 -> farmClaim(parameters, s)

            // Vault Entrypoints - callable only by Lending Controller
        |   OnVaultDepositStakedMvk(parameters)     -> onVaultDepositStakedMvk(parameters, s)
        |   OnVaultWithdrawStakedMvk(parameters)    -> onVaultWithdrawStakedMvk(parameters, s)
        |   OnVaultLiquidateStakedMvk(parameters)   -> onVaultLiquidateStakedMvk(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                 -> setLambda(parameters, s)
    ]
    
)
