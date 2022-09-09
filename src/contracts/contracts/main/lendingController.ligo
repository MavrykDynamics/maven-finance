// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Methods
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Doorman Types
#include "../partials/contractTypes/doormanTypes.ligo"

// Aggregator Types - for lastCompletedRoundPriceReturnType
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// ------------------------------------------------------------------------------

// helper function to create vault 
type createVaultFuncType is (option(key_hash) * tez * vaultStorageType) -> (operation * address)
const createVaultFunc : createVaultFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/vault.tz"
        ;
          PAIR } |}
: createVaultFuncType)];

type lendingControllerAction is 

    |   Default of unit
        
        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of lendingControllerUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsType

        // Break Glass Entrypoints
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of lendingControllerTogglePauseEntrypointType

        // Token Pool Entrypoints
    |   SetLoanToken                    of setLoanTokenActionType
    |   AddLiquidity                    of addLiquidityActionType
    |   RemoveLiquidity                 of removeLiquidityActionType 

        // Vault Entrypoints
    |   CallVaultEntrypoint             of callVaultEntrypointActionType
    |   UpdateCollateralToken           of updateCollateralTokenActionType
    // |   CreateVault                     of createVaultActionType
    // |   CloseVault                      of closeVaultActionType
    |   RegisterDeposit                 of registerDepositActionType
    |   RegisterWithdrawal              of registerWithdrawalActionType
    // |   MarkForLiquidation              of markForLiquidationActionType
    // |   LiquidateVault                  of liquidateVaultActionType
    // |   Borrow                          of borrowActionType
    // |   Repay                           of repayActionType

        // Vault Staked MVK Entrypoints   
    |   VaultDepositStakedMvk           of vaultDepositStakedMvkType   
    |   VaultWithdrawStakedMvk          of vaultWithdrawStakedMvkType   
    |   VaultLiquidateStakedMvk         of vaultLiquidateStakedMvkType   

        // Rewards Entrypoints
    |   ClaimRewards                    of claimRewardsType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType
    |   SetProductLambda                of setLambdaType

const noOperations : list (operation) = nil;
type return is list (operation) * lendingControllerStorageType


// lendingController contract methods lambdas
type lendingControllerUnpackLambdaFunctionType is (lendingControllerLambdaActionType * lendingControllerStorageType) -> return


// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const zeroAddress            : address  = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy     : nat      = 1_000_000_000_000_000_000_000_000_000n;   // 10^27     - // for use in division
// const tezFixedPointAccuracy  : nat      = 1_000_000_000_000_000_000n;           // 10^18    - // for use in division with tez
const tezFixedPointAccuracy  : nat      = 1_000_000_000_000_000_000_000_000_000n;           // 10^27    - // for use in division with tez

// for use in division from oracle where price decimals may vary
const fpa10e27 : nat = 1_000_000_000_000_000_000_000_000_000n;   // 10^27 
const fpa10e26 : nat = 1_000_000_000_000_000_000_000_000_00n;    // 10^26
const fpa10e25 : nat = 1_000_000_000_000_000_000_000_000_0n;     // 10^25
const fpa10e24 : nat = 1_000_000_000_000_000_000_000_000n;       // 10^24
const fpa10e23 : nat = 1_000_000_000_000_000_000_000_00n;        // 10^23
const fpa10e22 : nat = 1_000_000_000_000_000_000_000_0n;         // 10^22
const fpa10e21 : nat = 1_000_000_000_000_000_000_000n;           // 10^21

const fpa10e20 : nat = 1_000_000_000_000_000_000_00n;           // 10^20
const fpa10e19 : nat = 1_000_000_000_000_000_000_0n;            // 10^19
const fpa10e18 : nat = 1_000_000_000_000_000_000n;              // 10^18
const fpa10e17 : nat = 1_000_000_000_000_000_00n;               // 10^17
const fpa10e16 : nat = 1_000_000_000_000_000_0n;                // 10^16
const fpa10e15 : nat = 1_000_000_000_000_000n;                  // 10^15
const fpa10e14 : nat = 1_000_000_000_000_00n;                   // 10^14
const fpa10e13 : nat = 1_000_000_000_000_0n;                    // 10^13
const fpa10e12 : nat = 1_000_000_000_000n;                      // 10^12
const fpa10e11 : nat = 1_000_000_000_00n;                       // 10^11
const fpa10e10 : nat = 1_000_000_000_0n;                        // 10^10
const fpa10e9 : nat = 1_000_000_000n;                           // 10^9
const fpa10e8 : nat = 1_000_000_00n;                            // 10^8
const fpa10e7 : nat = 1_000_000_0n;                             // 10^7
const fpa10e6 : nat = 1_000_000n;                               // 10^6
const fpa10e5 : nat = 1_000_00n;                                // 10^5
const fpa10e4 : nat = 1_000_0n;                                 // 10^4
const fpa10e3 : nat = 1_000n;                                   // 10^3

// const minBlockTime              : nat   = Tezos.get_min_block_time();
// const blocksPerMinute           : nat   = 60n / minBlockTime;
// const blocksPerDay              : nat   = blocksPerMinute * 60n * 24n;                       // 2880 blocks per day -> if 2 blocks per minute 
// const blocksPerYear             : nat   = blocksPerDay * 365n;

const secondsInYear             : nat   = 31_536_000n;  // 365 days

const defaultTimestamp  : timestamp = ("2000-01-01T00:00:00Z" : timestamp);

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
function checkSenderIsAllowed(var s : lendingControllerStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(const s : lendingControllerStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);
// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Misc Helper Functions Begin
// ------------------------------------------------------------------------------

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;


// helper function to check no loan outstanding on vault
function checkZeroLoanOutstanding(const vault : vaultRecordType) : unit is
  if vault.loanOutstandingTotal = 0n then unit
  else failwith(error_LOAN_OUTSTANDING_IS_NOT_ZERO)

// ------------------------------------------------------------------------------
// Misc Helper Functions Begin
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// -----------------------------------------
// Lending Controller Token Pool Entrypoints
// -----------------------------------------

// helper function to check that the %setLoanToken entrypoint is not paused
function checkSetLoanTokenIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.setLoanTokenIsPaused then failwith(error_SET_LOAN_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %addLiquidity entrypoint is not paused
function checkAddLiquidityIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.addLiquidityIsPaused then failwith(error_ADD_LIQUIDITY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %removeLiquidity entrypoint is not paused
function checkRemoveLiquidityIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.removeLiquidityIsPaused then failwith(error_REMOVE_LIQUIDITY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;

// -----------------------------------------
// Lending Controller Vault Entrypoints
// -----------------------------------------

// helper function to check that the %updateCollateralToken entrypoint is not paused
function checkUpdateCollateralTokenIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.updateCollateralTokenIsPaused then failwith(error_UPDATE_COLLATERAL_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %createVault entrypoint is not paused
function checkCreateVaultIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.createVaultIsPaused then failwith(error_CREATE_VAULT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %closeVault entrypoint is not paused
function checkCloseVaultIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.closeVaultIsPaused then failwith(error_CLOSE_VAULT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %registerDeposit entrypoint is not paused
function checkRegisterDepositIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.registerDepositIsPaused then failwith(error_REGISTER_DEPOSIT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %registerWithdrawal entrypoint is not paused
function checkRegisterWithdrawalIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.registerWithdrawalIsPaused then failwith(error_REGISTER_WITHDRAWAL_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %markForLiquidation entrypoint is not paused
function checkMarkForLiquidationIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.markForLiquidationIsPaused then failwith(error_MARK_FOR_LIQUIDATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %liquidateVault entrypoint is not paused
function checkLiquidateVaultIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.liquidateVaultIsPaused then failwith(error_LIQUIDATE_VAULT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %borrow entrypoint is not paused
function checkBorrowIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.borrowIsPaused then failwith(error_BORROW_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %repay entrypoint is not paused
function checkRepayIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.repayIsPaused then failwith(error_REPAY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;

// -----------------------------------------
// Lending Controller Vault Staked MVK Entrypoints
// -----------------------------------------

// helper function to check that the %vaultDepositStakedMvk entrypoint is not paused
function checkVaultDepositStakedMvkIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.vaultDepositStakedMvkIsPaused then failwith(error_VAULT_DEPOSIT_STAKED_MVK_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %vaultWithdrawStakedMvk entrypoint is not paused
function checkVaultWithdrawStakedMvkIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused then failwith(error_VAULT_WITHDRAW_STAKED_MVK_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %vaultLiquidateStakedMvk entrypoint is not paused
function checkVaultLiquidateStakedMvkIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused then failwith(error_VAULT_LIQUIDATE_STAKED_MVK_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;

// -----------------------------------------
// Lending Controller Reward Entrypoints
// -----------------------------------------

// helper function to check that the %claimRewards entrypoint is not paused
function checkClaimRewardsIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.claimRewardsIsPaused then failwith(error_CLAIM_REWARDS_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get %withdraw entrypoint in a Vault Contract
function getVaultWithdrawEntrypoint(const vaultAddress : address) : contract(withdrawType) is
    case (Tezos.get_entrypoint_opt(
        "%withdraw",
        vaultAddress) : option(contract(withdrawType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_WITHDRAW_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND) : contract(withdrawType))
        ]



// helper function to get %delegateTez entrypoint in a Vault Contract
function getVaultDelegateTezEntrypoint(const vaultAddress : address) : contract(delegateTezToBakerType) is
    case (Tezos.get_entrypoint_opt(
        "%delegateTezToBaker",
        vaultAddress) : option(contract(delegateTezToBakerType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DELEGATE_TEZ_TO_BAKER_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND) : contract(delegateTezToBakerType))
        ]



// helper function to get %onVaultDepositStakedMvk entrypoint in Doorman Contract
function getOnVaultDepositStakedMvkEntrypoint(const contractAddress : address) : contract(onVaultDepositStakedMvkType) is
    case (Tezos.get_entrypoint_opt(
        "%onVaultDepositStakedMvk",
        contractAddress) : option(contract(onVaultDepositStakedMvkType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_VAULT_DEPOSIT_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(onVaultDepositStakedMvkType))
        ]



// helper function to get %onVaultWithdrawStakedMvk entrypoint from doorman contract
function getOnVaultWithdrawStakedMvkEntrypoint(const contractAddress : address) : contract(onVaultWithdrawStakedMvkType) is
    case (Tezos.get_entrypoint_opt(
        "%onVaultWithdrawStakedMvk",
        contractAddress) : option(contract(onVaultWithdrawStakedMvkType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_VAULT_WITHDRAW_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(onVaultWithdrawStakedMvkType))
        ]



// helper function to get %onVaultLiquidateStakedMvk entrypoint from Doorman Contract
function getOnVaultLiquidateStakedMvkEntrypoint(const contractAddress : address) : contract(onVaultLiquidateStakedMvkType) is
    case (Tezos.get_entrypoint_opt(
        "%onVaultLiquidateStakedMvk",
        contractAddress) : option(contract(onVaultLiquidateStakedMvkType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_VAULT_LIQUIDATE_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(onVaultLiquidateStakedMvkType))
        ]



// helper function to send %onClaimRewards operation in Token Pool Reward Contract
function getOnClaimRewardsEntrypointInTokenPoolRewardContract(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%onClaimRewards",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_CLAIM_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to get %transfer entrypoint in a FA2 Token Contract
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(fa2TransferType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        tokenAddress) : option(contract(fa2TransferType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(fa2TransferType))
        ];



// helper function to get %updateRewards entrypoint in Token Pool Contract
function getUpdateRewardsEntrypointInTokenPoolRewardContract(const contractAddress : address) : contract(updateRewardsActionType) is
    case (Tezos.get_entrypoint_opt(
        "%updateRewards",
        contractAddress) : option(contract(updateRewardsActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UPDATE_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(updateRewardsActionType))
        ];



// helper function to get mintOrBurn entrypoint from LP Token contract
function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
    case (Tezos.get_entrypoint_opt(
        "%mintOrBurn",
        tokenContractAddress) : option(contract(mintOrBurnParamsType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. MintOrBurn entrypoint in LP Token contract not found") : contract(mintOrBurnParamsType))
        ]



// helper function to get burn entrypoint from LP Token contract
function getLpTokenBurnEntrypoint(const tokenContractAddress : address) : contract(burnParamsType) is
    case (Tezos.get_entrypoint_opt(
        "%burn",
        tokenContractAddress) : option(contract(burnParamsType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. Burn entrypoint in LP Token contract not found") : contract(burnParamsType))
        ]

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Contract Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check collateral token exists
function checkCollateralTokenExists(const tokenName : string; const s : lendingControllerStorageType) : unit is 
block {
    const collateralTokenExists : unit = case s.collateralTokenLedger[tokenName] of [
            Some(_record) -> unit 
        |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ];
} with collateralTokenExists



// helper function to get user staked mvk balance from Doorman contract
function getUserStakedMvkBalanceFromDoorman(const userAddress : address; const s : lendingControllerStorageType) : nat is 
block {

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // get staked MVK balance of user from Doorman contract
    const getStakedBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
    const userStakedMvkBalance : nat = case getStakedBalanceView of [
            Some (_value) -> _value
        |   None          -> failwith (error_USER_STAKE_RECORD_NOT_FOUND)
    ];

} with userStakedMvkBalance



function mintOrBurnLpToken(const target : address; const quantity : int; const lpTokenAddress : address) : operation is 
block {

    const mintOrBurnParams : mintOrBurnParamsType = record [
        quantity = quantity;
        target   = target;
    ];

} with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(lpTokenAddress) ) )



function burnLpToken(const target : address; const amount : nat; const lpTokenAddress : address) : operation is 
block {

    const burnParams : burnParamsType = (target, amount)


} with (Tezos.transaction(burnParams, 0mutez, getLpTokenBurnEntrypoint(lpTokenAddress) ) )




// helper function to create new loan token record
function createLoanTokenRecord(const setLoanTokenParams : setLoanTokenActionType) : loanTokenRecordType is 
block {

    // init variables for convenience
    const tokenName                             : string        = setLoanTokenParams.tokenName;
    const tokenType                             : tokenType     = setLoanTokenParams.tokenType;
    const tokenDecimals                         : nat           = setLoanTokenParams.tokenDecimals;

    const lpTokenContractAddress                : address       = setLoanTokenParams.lpTokenContractAddress;
    const lpTokenId                             : nat           = setLoanTokenParams.lpTokenId;
    const reserveRatio                          : nat           = setLoanTokenParams.reserveRatio;

    const optimalUtilisationRate                : nat           = setLoanTokenParams.optimalUtilisationRate;
    const baseInterestRate                      : nat           = setLoanTokenParams.baseInterestRate;
    const maxInterestRate                       : nat           = setLoanTokenParams.maxInterestRate;
    const interestRateBelowOptimalUtilisation   : nat           = setLoanTokenParams.interestRateBelowOptimalUtilisation;
    const interestRateAboveOptimalUtilisation   : nat           = setLoanTokenParams.interestRateAboveOptimalUtilisation;

    const newLoanTokenRecord : loanTokenRecordType = record [
                    
        tokenName                           = tokenName;
        tokenType                           = tokenType;
        tokenDecimals                       = tokenDecimals;

        lpTokensTotal                       = 0n;
        lpTokenContractAddress              = lpTokenContractAddress;
        lpTokenId                           = lpTokenId;

        reserveRatio                        = reserveRatio;
        tokenPoolTotal                      = 0n;
        totalBorrowed                       = 0n;
        totalRemaining                      = 0n;

        utilisationRate                     = 1n;
        optimalUtilisationRate              = optimalUtilisationRate;
        baseInterestRate                    = baseInterestRate;
        maxInterestRate                     = maxInterestRate;
        interestRateBelowOptimalUtilisation = interestRateBelowOptimalUtilisation;
        interestRateAboveOptimalUtilisation = interestRateAboveOptimalUtilisation;

        currentInterestRate                 = baseInterestRate;
        lastUpdatedBlockLevel               = Tezos.get_level();
        accumulatedRewardsPerShare          = fixedPointAccuracy;
        borrowIndex                         = fixedPointAccuracy;

    ];

} with newLoanTokenRecord



// helper function to create new vault record
function createVaultRecord(const vaultAddress : address; const collateralBalanceLedger : collateralBalanceLedgerType; const loanTokenName : string; const decimals : nat; const tokenBorrowIndex : nat) : vaultRecordType is 
block {

    const vaultRecord : vaultRecordType = record [
                        
        address                     = vaultAddress;
        collateralBalanceLedger     = collateralBalanceLedger;
        loanToken                   = loanTokenName;

        loanOutstandingTotal        = 0n;
        loanPrincipalTotal          = 0n;
        loanInterestTotal           = 0n;
        loanDecimals                = decimals;
        borrowIndex                 = tokenBorrowIndex;

        lastUpdatedBlockLevel       = Tezos.get_level();
        lastUpdatedTimestamp        = Tezos.get_now();

        markedForLiquidationTimestamp = defaultTimestamp;
    ];
    
} with vaultRecord



function checkInCollateralTokenLedger(const collateralTokenRecord : collateralTokenRecordType; const s : lendingControllerStorageType) : bool is 
block {
  
  var inCollateralTokenLedgerBool : bool := False;
  for _key -> value in map s.collateralTokenLedger block {
    if collateralTokenRecord = value then inCollateralTokenLedgerBool := True
    else skip;
  }  

} with inCollateralTokenLedgerBool



// helper function to get vault
function getVault(const vaultId : nat; const vaultOwner : address; const s : lendingControllerStorageType) : vaultRecordType is 
block {

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

    var vault : vaultRecordType := case s.vaults[vaultHandle] of [
            Some(_vault) -> _vault
        |   None -> failwith(error_VAULT_CONTRACT_NOT_FOUND)
    ];

} with vault



// helper function to get vault by vaultHandle
function getVaultByHandle(const handle : vaultHandleType; const s : lendingControllerStorageType) : vaultRecordType is 
block {
    var vault : vaultRecordType := case s.vaults[handle] of [
            Some(_vault) -> _vault
        |   None -> failwith(error_VAULT_CONTRACT_NOT_FOUND)
    ];
} with vault



// helper function for transfers related to token pool (from/to)
function tokenPoolTransfer(const from_ : address; const to_ : address; const amount : nat; const token : tokenType) : operation is
block {

    const tokenPoolTransferOperation : operation = case token of [
        
        |   Tez(_tez) -> {

                const transferTezOperation : operation = transferTez( (Tezos.get_contract_with_error(to_, "Error. Unable to send tez.") : contract(unit)), amount * 1mutez );
            
            } with transferTezOperation

        |   Fa12(_token) -> {

                checkNoAmount(Unit);

                const transferFa12Operation : operation = transferFa12Token(
                    from_,                      // from_
                    to_,                        // to_
                    amount,                     // token amount
                    _token                      // token contract address
                );

            } with transferFa12Operation

        |   Fa2(_token) -> {

                checkNoAmount(Unit);

                const transferFa2Operation : operation = transferFa2Token(
                    from_,                          // from_
                    to_,                            // to_
                    amount,                         // token amount
                    _token.tokenId,                 // token id
                    _token.tokenContractAddress     // token contract address
                );

            } with transferFa2Operation
    ];

} with tokenPoolTransferOperation






// helper function withdraw from vault
function withdrawFromVaultOperation(const to_ : address; const amount : nat; const token : tokenType; const vaultAddress : address) : operation is
block {

    const withdrawFromVaultOperation : operation = case token of [
        
        |   Tez(_tez) -> {

                const withdrawTezOperationParams : withdrawType = record [
                    to_      = to_; 
                    amount   = amount;
                    token    = Tez(_tez);
                ];
                
                const withdrawTezOperation : operation = Tezos.transaction(
                    withdrawTezOperationParams,
                    0mutez,
                    getVaultWithdrawEntrypoint(vaultAddress)
                );
            
            } with withdrawTezOperation

        |   Fa12(_token) -> {

                const withdrawFa12OperationParams : withdrawType = record [
                    to_      = to_; 
                    amount   = amount;
                    token    = Fa12(_token);
                ];

                const withdrawFa12Operation : operation = Tezos.transaction(
                    withdrawFa12OperationParams,
                    0mutez,
                    getVaultWithdrawEntrypoint(vaultAddress)
                );

            } with withdrawFa12Operation

        |   Fa2(_token) -> {

                const withdrawFa2OperationParams : withdrawType = record [
                    to_      = to_; 
                    amount   = amount;
                    token    = Fa2(_token);
                ];

                const withdrawFa2Operation : operation = Tezos.transaction(
                    withdrawFa2OperationParams,
                    0mutez,
                    getVaultWithdrawEntrypoint(vaultAddress)
                );

            } with withdrawFa2Operation
    ];

} with withdrawFromVaultOperation





// helper function to rebase token decimals
function rebaseTokenValue(const tokenValueRaw : nat; const rebaseDecimals : nat) : nat is 
block {

    var tokenValueRebased : nat := tokenValueRaw;

    if rebaseDecimals = 1n then 
        tokenValueRebased := tokenValueRebased * 10n
    else if rebaseDecimals = 2n then 
        tokenValueRebased := tokenValueRebased * 100n 
    else if rebaseDecimals = 3n then 
        tokenValueRebased := tokenValueRebased * 1000n 
    else if rebaseDecimals = 4n then 
        tokenValueRebased := tokenValueRebased * fpa10e4  // e.g. fixed point accuracy (10^4 or 1e4)
    else if rebaseDecimals = 5n then 
        tokenValueRebased := tokenValueRebased * fpa10e5
    else if rebaseDecimals = 6n then 
        tokenValueRebased := tokenValueRebased * fpa10e6
    else if rebaseDecimals = 7n then 
        tokenValueRebased := tokenValueRebased * fpa10e7
    else if rebaseDecimals = 8n then 
        tokenValueRebased := tokenValueRebased * fpa10e8
    else if rebaseDecimals = 9n then 
        tokenValueRebased := tokenValueRebased * fpa10e9
    else if rebaseDecimals = 10n then 
        tokenValueRebased := tokenValueRebased * fpa10e10
    else if rebaseDecimals = 11n then 
        tokenValueRebased := tokenValueRebased * fpa10e11
    else if rebaseDecimals = 12n then 
        tokenValueRebased := tokenValueRebased * fpa10e12
    else if rebaseDecimals = 13n then 
        tokenValueRebased := tokenValueRebased * fpa10e13
    else if rebaseDecimals = 14n then 
        tokenValueRebased := tokenValueRebased * fpa10e14
    else if rebaseDecimals = 15n then 
        tokenValueRebased := tokenValueRebased * fpa10e15
    else if rebaseDecimals = 16n then 
        tokenValueRebased := tokenValueRebased * fpa10e16
    else if rebaseDecimals = 17n then 
        tokenValueRebased := tokenValueRebased * fpa10e17
    else if rebaseDecimals = 18n then 
        tokenValueRebased := tokenValueRebased * fpa10e18
    else if rebaseDecimals = 19n then 
        tokenValueRebased := tokenValueRebased * fpa10e19
    else if rebaseDecimals = 20n then 
        tokenValueRebased := tokenValueRebased * fpa10e20
    else if rebaseDecimals = 21n then 
        tokenValueRebased := tokenValueRebased * fpa10e21
    else if rebaseDecimals = 22n then 
        tokenValueRebased := tokenValueRebased * fpa10e22
    else if rebaseDecimals = 23n then 
        tokenValueRebased := tokenValueRebased * fpa10e23
    else if rebaseDecimals = 24n then 
        tokenValueRebased := tokenValueRebased * fpa10e24
    else if rebaseDecimals = 25n then 
        tokenValueRebased := tokenValueRebased * fpa10e25
    else if rebaseDecimals = 26n then 
        tokenValueRebased := tokenValueRebased * fpa10e26
    else failwith(error_REBASE_DECIMALS_OUT_OF_BOUNDS);    

} with tokenValueRebased



// helper function to get token last completed round price from oracle
function getTokenLastCompletedRoundPriceFromOracle(const oracleAddress : address) : lastCompletedRoundPriceReturnType is 
block {

    // get last completed round price of token from Oracle view
    const getTokenLastCompletedRoundPriceView : option (lastCompletedRoundPriceReturnType) = Tezos.call_view ("getLastCompletedRoundPrice", unit, oracleAddress);
    const tokenLastCompletedRoundPrice : lastCompletedRoundPriceReturnType = case getTokenLastCompletedRoundPriceView of [
            Some (_value) -> _value
        |   None          -> failwith (error_LAST_COMPLETED_ROUND_PRICE_NOT_FOUND)
    ];

} with tokenLastCompletedRoundPrice



// helper function to calculate token value rebased (to max decimals 1e32)
function calculateCollateralTokenValueRebased(const tokenName : string; const tokenBalance : nat; const s : lendingControllerStorageType) : nat is 
block {

    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation; // default 32 decimals i.e. 1e32

    const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ];

    // get last completed round price of token from Oracle view
    const collateralTokenLastCompletedRoundPrice : lastCompletedRoundPriceReturnType = getTokenLastCompletedRoundPriceFromOracle(collateralTokenRecord.oracleAddress);
    
    const tokenDecimals    : nat  = collateralTokenRecord.tokenDecimals; 
    const priceDecimals    : nat  = collateralTokenLastCompletedRoundPrice.decimals;
    const tokenPrice       : nat  = collateralTokenLastCompletedRoundPrice.price;            

    // calculate required number of decimals to rebase each token to the same unit for comparison
    // assuming most token decimals are 6, and most price decimals from oracle is 8 - (upper limit of 32 decimals)
    if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
    const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

    // calculate raw value of collateral balance
    const tokenValueRaw : nat = tokenBalance * tokenPrice;

    // rebase token value to 1e32 (or 10^32)
    const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);                

} with tokenValueRebased




// helper function to calculate vault's collateral value rebased (to max decimals 1e32)
function calculateVaultCollateralValueRebased(const collateralBalanceLedger : collateralBalanceLedgerType; const s : lendingControllerStorageType) : nat is
block {

    var vaultCollateralValueRebased  : nat := 0n;

    for tokenName -> tokenBalance in map collateralBalanceLedger block {

        // get collateral token value based on oracle/aggregator's price and rebase to 1e32 (or 10^32) for comparison
        const tokenValueRebased : nat = calculateCollateralTokenValueRebased(tokenName, tokenBalance, s);
        
        // increment vault collateral value (decimals: 1e32 or 10^32)
        vaultCollateralValueRebased := vaultCollateralValueRebased + tokenValueRebased;      

    };

} with vaultCollateralValueRebased




// helper function to check if vault is under collaterized
function isUnderCollaterized(const vault : vaultRecordType; var s : lendingControllerStorageType) : bool is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    const loanOutstandingTotal       : nat  = vault.loanOutstandingTotal;    
    const loanDecimals               : nat  = vault.loanDecimals;
    const collateralRatio            : nat  = s.config.collateralRatio;  // default 3000n: i.e. 3x - 2.25x - 2250
    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation;

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.collateralBalanceLedger, s);

    // calculate loan outstanding rebase decimals (difference from max decimals 1e32)
    const loanOutstandingRebaseDecimals : nat = abs(maxDecimalsForCalculation - loanDecimals);

    // calculate loan outstanding rebased (1e32 or 10^32)
    // todo: rebase EUR, Tez, to USD 
    const loanOutstandingRebased : nat = rebaseTokenValue(loanOutstandingTotal, loanOutstandingRebaseDecimals);  

    // check is vault is under collaterized based on collateral ratio
    const isUnderCollaterized : bool = vaultCollateralValueRebased < (collateralRatio * loanOutstandingRebased) / 1000n;
    
} with isUnderCollaterized



// helper function to check if vault is liquidatable
function isLiquidatable(const vault : vaultRecordType; var s : lendingControllerStorageType) : bool is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    const loanOutstandingTotal       : nat  = vault.loanOutstandingTotal;    
    const loanDecimals               : nat  = vault.loanDecimals;
    const liquidationRatio           : nat  = s.config.liquidationRatio;  // default 3000n: i.e. 3x - 2.25x - 2250
    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation;

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.collateralBalanceLedger, s);

    // calculate loan outstanding rebase decimals (difference from max decimals 1e32)
    const loanOutstandingRebaseDecimals : nat = abs(maxDecimalsForCalculation - loanDecimals);

    // calculate loan outstanding rebased (1e32 or 10^32)
    // todo: rebase EUR, Tez, to USD 
    const loanOutstandingRebased : nat = rebaseTokenValue(loanOutstandingTotal, loanOutstandingRebaseDecimals);  

    // check is vault is liquidatable based on liquidation ratio
    const isLiquidatable : bool = vaultCollateralValueRebased < (liquidationRatio * loanOutstandingRebased) / 1000n;
    
} with isLiquidatable

// ------------------------------------------------------------------------------
// Contract Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Rewards Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to create or update user rewards
function createOrUpdateUserRewards(const userAddress : address; const loanTokenRecord : loanTokenRecordType; var s : lendingControllerStorageType) : lendingControllerStorageType is
block{

    // Steps Overview:
    // 1. Make big map key - (userAddress, loanTokenName)
    // 2. Get loan token accumulated rewards per share
    // 3. Get or create user's rewards record
    // 4. Get user depositor balance for token (i.e. liquidity provided for token)
    // 5. Calculate new unclaimed rewards
    //      - calculate rewards ratio: difference between token's accumulatedRewardsPerShare and user's current rewardsPerShare
    //      - user's new rewards is equal to his deposited liquitity amount multiplied by rewards ratio
    // 6. Update user's rewards record 
    //      - set rewardsPerShare to token's accumulatedRewardsPerShare
    //      - increment user's unpaid rewards by the calculated rewards

    // Make big map key - (userAddress, loanTokenName)
    const userAddressLoanTokenKey : (address * string) = (userAddress, loanTokenRecord.tokenName);

    // Get loan token accumulated rewards per share
    const loanTokenAccumulatedRewardsPerShare : nat = loanTokenRecord.accumulatedRewardsPerShare;            

    // Get or create user's rewards record
    var userRewardsRecord : rewardsRecordType := case Big_map.find_opt(userAddressLoanTokenKey, s.rewardsLedger) of [
            Some (_record) -> _record
        |   None           -> record [
                unpaid          = 0n;
                paid            = 0n;
                rewardsPerShare = loanTokenAccumulatedRewardsPerShare;
            ]
    ];
    const userRewardsPerShare : nat = userRewardsRecord.rewardsPerShare;            

    // Get user depositor balance for token (i.e. liquidity provided for token)
    const tokenPoolDepositorBalance : nat = case Big_map.find_opt(userAddressLoanTokenKey, s.tokenPoolDepositorLedger) of [
            Some(_record) -> _record
        |   None          -> 0n
    ];

    // Calculate new unclaimed rewards
    // - calculate rewards ratio: difference between token's accumulatedRewardsPerShare and user's current rewardsPerShare
    // - user's new rewards is equal to his deposited liquitity amount multiplied by rewards ratio

    var accruedRewards : nat := 0n;
    if userRewardsPerShare < loanTokenAccumulatedRewardsPerShare then {
        
        const rewardsRatioDifference : nat = abs(loanTokenAccumulatedRewardsPerShare - userRewardsPerShare);
        accruedRewards := (tokenPoolDepositorBalance * rewardsRatioDifference) / fixedPointAccuracy;

    } else skip;

    // Update user's rewards record 
    // - set rewardsPerShare to token's accumulatedRewardsPerShare
    // - increment user's unpaid rewards by the calculated rewards

    userRewardsRecord.rewardsPerShare          := loanTokenAccumulatedRewardsPerShare;
    userRewardsRecord.unpaid                   := userRewardsRecord.unpaid + accruedRewards;
    s.rewardsLedger[userAddressLoanTokenKey]   := userRewardsRecord;

} with (s)

// ------------------------------------------------------------------------------
// Rewards Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to calculate compounded interest
function calculateCompoundedInterest(const interestRate : nat; const lastUpdatedBlockLevel : nat; var s : lendingControllerStorageType) : nat is
block{

    (* From AAVE:
    *
    * To avoid expensive exponentiation, the calculation is performed using a binomial approximation:
    *
    *  (1+x)^n = 1+n*x+[n/2*(n-1)]*x^2+[n/6*(n-1)*(n-2)*x^3...
    *
    *  The approximation slightly underpays liquidity providers and undercharges borrowers, with the advantage of great
    *  gas cost reductions. The whitepaper contains reference to the approximation and a table showing the margin of
    *  error per different time periods
    *
    *)

    var exp : nat := abs(Tezos.get_level() - lastUpdatedBlockLevel); // exponent
    exp := exp * Tezos.get_min_block_time(); // number of seconds
    
    const interestRateOverSecondsInYear : nat = ((interestRate * fixedPointAccuracy) / secondsInYear) / fixedPointAccuracy; // 1e27 * 1e27 / const / 1e27 -> 1e27

    s.tempMap["calculateCompoundedInterest - exp"] := exp;
    s.tempMap["calculateCompoundedInterest - interestRateOverSecondsInYear"] := interestRateOverSecondsInYear;

    var compoundedInterest : nat := 0n;

    if exp > 0n then {

        const expMinusOne : nat = abs(exp - 1n);
        const expMinusTwo : nat = if exp > 2n then abs(exp - 2n) else 0n;

        const basePowerTwo : nat = ((interestRateOverSecondsInYear * interestRateOverSecondsInYear) / fixedPointAccuracy) / (secondsInYear * secondsInYear); 
        const basePowerThree : nat = ((basePowerTwo * interestRateOverSecondsInYear) / fixedPointAccuracy) / secondsInYear;

        const secondTerm : nat = (exp * expMinusOne * basePowerTwo) / 2n;
        const thirdTerm : nat = (exp * expMinusOne * expMinusTwo * basePowerThree) / 6n;

        compoundedInterest := fixedPointAccuracy + (interestRateOverSecondsInYear * exp) + secondTerm + thirdTerm;

        s.tempMap["calculateCompoundedInterest - secondTerm"] := secondTerm;
        s.tempMap["calculateCompoundedInterest - thirdTerm"] := thirdTerm;

    } else skip;

    s.tempMap["calculateCompoundedInterest - compoundedInterest"] := compoundedInterest;
   
} with (compoundedInterest)



// helper function to get normalized debt
// function getNormalizedDebt(const tokenName : string; var s : lendingControllerStorageType) : nat is
// block{

//     (** From AAVE: 
//     * 
//     * @notice Returns the ongoing normalized variable debt for the reserve.
//     * @dev A value of 1e27 means there is no debt. As time passes, the debt is accrued
//     * @dev A value of 2*1e27 means that for each unit of debt, one unit worth of interest has been accumulated
//     * @param reserve The reserve object
//     * @return The normalized variable debt, expressed in ray
//     **)

//     // Get token record
//     var tokenRecord : loanTokenRecordType := case Map.find_opt(tokenName, s.loanTokenLedger) of [
//             Some (_tokenRecord) -> _tokenRecord
//         |   None                -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
//     ];

//     const lastUpdatedBlockLevel : nat = tokenRecord.lastUpdatedBlockLevel; 

//     // init variables
//     var accumulatedRewardsPerShare : nat := tokenRecord.accumulatedRewardsPerShare;

//     if Tezos.get_level() = lastUpdatedBlockLevel then skip else {

//         const lastUpdatedBlockLevel : nat = tokenRecord.lastUpdatedBlockLevel;
//         const currentInterestRate : nat = tokenRecord.currentInterestRate;

//         const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel, s);
//         accumulatedRewardsPerShare := (accumulatedRewardsPerShare * compoundedInterest) / fixedPointAccuracy;

//         s.tempMap["compoundedInterest"] := compoundedInterest;
//         s.tempMap["accumulatedRewardsPerShare"] := accumulatedRewardsPerShare;

//     };

//     tokenRecord.accumulatedRewardsPerShare := accumulatedRewardsPerShare;
//     s.loanTokenLedger[tokenName] := tokenRecord;

// } with (accumulatedRewardsPerShare)



// helper function to update token state
// - updates last updated block level and borrow index
function updateLoanTokenState(var loanTokenRecord : loanTokenRecordType; var s : lendingControllerStorageType) : loanTokenRecordType is
block{
    
    const tokenPoolTotal            : nat    = loanTokenRecord.tokenPoolTotal;             // 1e6
    const totalBorrowed             : nat    = loanTokenRecord.totalBorrowed;              // 1e6
    const optimalUtilisationRate    : nat    = loanTokenRecord.optimalUtilisationRate;     // 1e27
    const lastUpdatedBlockLevel     : nat    = loanTokenRecord.lastUpdatedBlockLevel;

    const baseInterestRate                      : nat = loanTokenRecord.baseInterestRate;                    // r0 - 1e27
    const interestRateBelowOptimalUtilisation   : nat = loanTokenRecord.interestRateBelowOptimalUtilisation; // r1 - 1e27
    const interestRateAboveOptimalUtilisation   : nat = loanTokenRecord.interestRateAboveOptimalUtilisation; // r2 - 1e27

    var borrowIndex                 : nat := loanTokenRecord.borrowIndex;
    var currentInterestRate         : nat := loanTokenRecord.currentInterestRate;

    // calculate utilisation rate - total debt borrowed / token pool total
    const utilisationRate : nat = (totalBorrowed * fixedPointAccuracy) / tokenPoolTotal;  // utilisation rate, or ratio of debt to total amount -> (1e6 * 1e27 / 1e6) -> 1e27

    // if total borrowed is greater than 0
    if totalBorrowed > 0n then {

        if utilisationRate > optimalUtilisationRate then {

            // utilisation rate is above optimal rate

            const firstTerm : nat = baseInterestRate;                       // 1e27
            const secondTerm : nat = interestRateBelowOptimalUtilisation;   // 1e27
            
            const utilisationRateLessOptimalRate : nat = abs(utilisationRate - optimalUtilisationRate);       // 1e27 (from above)
            const coefficientDenominator : nat = abs(fixedPointAccuracy - optimalUtilisationRate);            // 1e27 - 1e27 -> 1e27
            const thirdTerm : nat = (((utilisationRateLessOptimalRate * fixedPointAccuracy) / coefficientDenominator) * interestRateAboveOptimalUtilisation) / fixedPointAccuracy; // ( ((1e27 * 1e27) / 1e27) * 1e27) / 1e27 -> 1e27

            currentInterestRate := firstTerm + secondTerm + thirdTerm;

        } else {

            // utilisation rate is below optimal rate

            const firstTerm : nat = baseInterestRate; // 1e27

            const secondTermCoefficient : nat = (utilisationRate * fixedPointAccuracy) / optimalUtilisationRate;            // 1e27 * 1e27 / 1e27 -> 1e27
            const secondTerm : nat = (secondTermCoefficient * interestRateBelowOptimalUtilisation) / fixedPointAccuracy;    // 1e27 * 1e27 / 1e27 -> 1e27

            currentInterestRate := firstTerm + secondTerm; 

        };

        s.tempMap["updateInterestRate - utilisationRate"]       := utilisationRate;
        s.tempMap["updateInterestRate - currentInterestRate"]   := currentInterestRate;

    } else skip;
    

    if Tezos.get_level() > lastUpdatedBlockLevel then {

        const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel, s); // 1e27 
        borrowIndex := (borrowIndex * compoundedInterest) / fixedPointAccuracy; // 1e27 x 1e27 / 1e27 -> 1e27

        s.tempMap["updateLoanTokenState - compoundedInterest"] := compoundedInterest;
        s.tempMap["updateLoanTokenState - borrowIndex"]        := borrowIndex;

    } else skip;

    loanTokenRecord.lastUpdatedBlockLevel   := Tezos.get_level();
    loanTokenRecord.borrowIndex             := borrowIndex;
    loanTokenRecord.utilisationRate         := utilisationRate;
    loanTokenRecord.currentInterestRate     := currentInterestRate;

} with loanTokenRecord



// accrue interest to vault
function accrueInterestToVault(const currentLoanOutstandingTotal : nat; const vaultBorrowIndex : nat; const tokenBorrowIndex : nat) : nat is 
block {

    // init new loan outstanding total
    var newLoanOutstandingTotal : nat := currentLoanOutstandingTotal;

    if currentLoanOutstandingTotal > 0n then block {

        if vaultBorrowIndex =/= 0n
        then newLoanOutstandingTotal := (currentLoanOutstandingTotal * tokenBorrowIndex) / vaultBorrowIndex  // 1e6 * 1e27 / 1e27 -> 1e6
        else skip;

    } else skip;

} with newLoanOutstandingTotal

// ------------------------------------------------------------------------------
// Token Pool Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Vault Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

(* updateCollateralToken  *)
// function updateCollateralToken(const updateCollateralTokenParams : updateCollateralTokenActionType; var s: lendingControllerStorageType) : return is
// block {

//     checkSenderIsAdmin(s);                       // check that sender is admin 
//     checkUpdateCollateralTokenIsNotPaused(s);    // check that %updateCollateralToken entrypoint is not paused (e.g. if glass broken)
                
//     const tokenName             : string       = updateCollateralTokenParams.tokenName;
//     const tokenContractAddress  : address      = updateCollateralTokenParams.tokenContractAddress;
//     const tokenType             : tokenType    = updateCollateralTokenParams.tokenType;
//     const tokenDecimals         : nat          = updateCollateralTokenParams.tokenDecimals;
//     const oracleType            : string       = updateCollateralTokenParams.oracleType;
//     var oracleAddress           : address     := updateCollateralTokenParams.oracleAddress;

//     if oracleType = "cfmm" then block {
//         oracleAddress := zeroAddress;
//     } else skip;
    
//     const collateralTokenRecord : collateralTokenRecordType = record [
//         tokenName            = tokenName;
//         tokenContractAddress = tokenContractAddress;
//         tokenType            = tokenType;
//         tokenDecimals        = tokenDecimals;

//         oracleType           = oracleType;
//         oracleAddress        = oracleAddress;
//     ];

//     const existingToken: option(collateralTokenRecordType) = 
//     if checkInCollateralTokenLedger(collateralTokenRecord, s) then (None : option(collateralTokenRecordType)) else Some (collateralTokenRecord);

//     const updatedCollateralTokenLedger : collateralTokenLedgerType = 
//         Map.update(
//             tokenName, 
//             existingToken,
//             s.collateralTokenLedger
//         );

//     s.collateralTokenLedger := updatedCollateralTokenLedger

// } with (noOperations, s)



(* createVault lambda *)
function createVault(const createVaultParams : createVaultActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkCreateVaultIsNotPaused(s);    // check that %createVault entrypoint is not paused (e.g. if glass broken)
            
    // init loan token name
    const vaultLoanTokenName : string = createVaultParams.loanTokenName; // USDT, EURL 
    const vaultOwner : address = Tezos.get_sender();

    // Get loan token type
    const loanTokenRecord : loanTokenRecordType = case s.loanTokenLedger[vaultLoanTokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

    // Get borrow index of token
    const tokenBorrowIndex : nat = loanTokenRecord.borrowIndex;

    // get vault counter
    const newVaultId : vaultIdType = s.vaultCounter;
    
    // make vault handle
    const handle : vaultHandleType = record [
        id     = newVaultId;
        owner  = vaultOwner;
    ];

    // check if vault already exists
    if Big_map.mem(handle, s.vaults) then failwith(error_VAULT_ALREADY_EXISTS) else skip;

    // Prepare Vault Metadata
    const vaultMetadata: metadataType = Big_map.literal (list [
        ("", Bytes.pack("tezos-storage:data"));
        ("data", createVaultParams.metadata);
    ]); 

    const vaultLambdaLedger : lambdaLedgerType = s.vaultLambdaLedger;

    // params for vault with tez storage origination
    const originateVaultStorage : vaultStorageType = record [
        admin                       = s.admin;
        metadata                    = vaultMetadata;
        governanceAddress           = s.governanceAddress;
        
        handle                      = handle;
        depositors                  = createVaultParams.depositors;

        lambdaLedger                = vaultLambdaLedger;
    ];

    // originate vault func
    const vaultOrigination : (operation * address) = createVaultFunc(
        (None : option(key_hash)), 
        Tezos.get_amount(),
        originateVaultStorage
    );

    // add vaultWithTezOrigination operation to operations list
    operations := vaultOrigination.0 # operations; 

    // set collateral balance if tez is sent
    var collateralBalanceLedgerMap : collateralBalanceLedgerType := map[];
    if mutezToNatural(Tezos.get_amount()) > 0n then block {
        collateralBalanceLedgerMap["tez"] := mutezToNatural(Tezos.get_amount())
    } else skip;

    // create vault record
    const vault : vaultRecordType = createVaultRecord(
        vaultOrigination.1,             // vault address
        collateralBalanceLedgerMap,     // collateral balance ledger
        loanTokenRecord.tokenName,      // loan token name
        loanTokenRecord.tokenDecimals,  // loan token decimals
        tokenBorrowIndex                // token borrow index
    );
    
    // update controller storage with new vault
    s.vaults := Big_map.update(handle, Some(vault), s.vaults);

    // add new vault to owner's vault set
    var ownerVaultSet : ownerVaultSetType := case s.ownerLedger[vaultOwner] of [
            Some (_set) -> _set
        |   None        -> set []
    ];
    s.ownerLedger[vaultOwner] := Set.add(newVaultId, ownerVaultSet);

    // increment vault counter 
    s.vaultCounter            := s.vaultCounter + 1n;

} with (operations, s)



(* closeVault lambda *)
function closeVault(const closeVaultParams : closeVaultActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkCloseVaultIsNotPaused(s);    // check that %closeVault entrypoint is not paused (e.g. if glass broken)

    // only the vault owner can close his own vault

    // init parameters 
    const vaultId     : vaultIdType      = closeVaultParams.vaultId;
    const vaultOwner  : vaultOwnerType   = Tezos.get_sender();

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

    // Get vault if exists
    var vault : vaultRecordType := getVault(vaultId, vaultOwner, s);

    const vaultAddress : address = vault.address;

    // check that vault has zero loan oustanding
    checkZeroLoanOutstanding(vault);

    // get tokens and token balances and initiate transfer back to the vault owner
    for tokenName -> tokenBalance in map vault.collateralBalanceLedger block {
        
        if tokenName = "tez" then block {

            const transferTezOperation : operation = transferTez( (Tezos.get_contract_with_error(vaultOwner, "Error. Unable to send tez.") : contract(unit)), tokenBalance * 1mutez );
            operations := transferTezOperation # operations;

            vault.collateralBalanceLedger[tokenName]  := 0n;
            
        } else block {

            const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                    Some(_record) -> _record
                |   None -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
            ];

            if collateralTokenRecord.tokenName = "sMVK" then block {

                // for special case of sMVK

                // Get Doorman Address from the General Contracts map on the Governance Contract
                const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

                // create operation to doorman to withdraw all staked MVK from vault to user
                const onVaultWithdrawStakedMvkParams : onVaultWithdrawStakedMvkType = record [
                    vaultOwner      = vaultOwner;
                    vaultAddress    = vaultAddress;
                    withdrawAmount  = tokenBalance;
                ];

                const vaultWithdrawAllStakedMvkOperation : operation = Tezos.transaction(
                    onVaultWithdrawStakedMvkParams,
                    0tez,
                    getOnVaultWithdrawStakedMvkEntrypoint(doormanAddress)
                );

                operations := vaultWithdrawAllStakedMvkOperation # operations;

            } else block {

                // for other collateral token types besides sMVK
                const withdrawTokenOperation : operation = withdrawFromVaultOperation(
                    vaultOwner,                         // to_
                    tokenBalance,                       // token amount to be withdrawn
                    collateralTokenRecord.tokenType,    // token type (i.e. tez, fa12, fa2) 
                    vaultAddress                        // vault address
                );
                operations := withdrawTokenOperation # operations;

            };

            // save and update balance for collateral token to zero
            vault.collateralBalanceLedger[tokenName]  := 0n;

        }; // end if/else check for tez/token

    }; // end loop for withdraw operations of tez/tokens in vault collateral 


    // remove vault from stroage
    var ownerVaultSet : ownerVaultSetType := case s.ownerLedger[vaultOwner] of [
            Some (_set) -> _set
        |   None        -> failwith(error_OWNER_VAULT_SET_DOES_NOT_EXIST)
    ];

    s.ownerLedger[vaultOwner] := Set.remove(vaultId, ownerVaultSet);
    remove vaultHandle from map s.vaults;

} with (operations, s)



(* markForLiquidation lambda *)
function markForLiquidation(const markForLiquidationParams : markForLiquidationActionType; var s : lendingControllerStorageType) : return is
block {

    var operations : list(operation) := nil;
    checkMarkForLiquidationIsNotPaused(s);    // check that %markForLiquidation entrypoint is not paused (e.g. if glass broken)

    // anyone can mark a vault for liquidation

    // init parameters 
    const vaultId     : vaultIdType      = markForLiquidationParams.vaultId;
    const vaultOwner  : vaultOwnerType   = markForLiquidationParams.vaultOwner;

    const currentTimestamp        : timestamp   = Tezos.get_now();
    const liquidationDelayInMins  : int         = int(s.config.liquidationDelayInMins);

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

    // Get vault if exists
    var vault : vaultRecordType := getVault(vaultId, vaultOwner, s);
    
    // get vault liquidation timestamps
    const vaultMarkedForLiquidationTimestamp  : timestamp = vault.markedForLiquidationTimestamp;
    const timeWhenVaultCanBeLiquidated        : timestamp = vaultMarkedForLiquidationTimestamp + liquidationDelayInMins;

    // check if vault is liquidatable
    if isLiquidatable(vault, s) 
    then skip 
    else failwith(error_VAULT_IS_NOT_LIQUIDATABLE);

    // check if vault has already been marked for liquidation, if not set markedForLiquidation timestamp
    if currentTimestamp < timeWhenVaultCanBeLiquidated 
    then failwith(error_VAULT_HAS_ALREADY_BEEN_MARKED_FOR_LIQUIDATION)
    else vault.markedForLiquidationTimestamp := currentTimestamp;

    // update vault storage
    s.vaults[vaultHandle] := vault;

} with (operations, s)



(* liquidateVault lambda *)
function liquidateVault(const liquidateVaultParams : liquidateVaultActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkLiquidateVaultIsNotPaused(s);    // check that %liquidateVault entrypoint is not paused (e.g. if glass broken)
            
    // init variables                 
    const vaultId           : nat       = liquidateVaultParams.vaultId;
    const vaultOwner        : address   = liquidateVaultParams.vaultOwner;
    const amount            : nat       = liquidateVaultParams.amount;
    const liquidator        : address   = Tezos.get_sender();
    const currentTimestamp  : timestamp = Tezos.get_now();

    // config variables
    const liquidationFeePercent         : nat  = s.config.liquidationFeePercent;       // liquidation fee - penalty fee paid by vault owner to liquidator
    const adminLiquidationFeePercent    : nat  = s.config.adminLiquidationFeePercent;  // admin liquidation fee - penalty fee paid by vault owner to treasury
    const maxDecimalsForCalculation     : nat  = s.config.maxDecimalsForCalculation;
    const liquidationDelayInMins        : int  = int(s.config.liquidationDelayInMins);

    // calculate final amounts to be liquidated
    const liquidationIncentive          : nat = ((liquidationFeePercent * amount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;
    const liquidatorAmountAndIncentive  : nat = amount + liquidationIncentive;
    const adminLiquidationFee           : nat = ((adminLiquidationFeePercent * amount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

    // Get Treasury Address and Token Pool Reward Address from the General Contracts map on the Governance Contract
    const treasuryAddress           : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);
    const tokenPoolRewardAddress    : address = getContractAddressFromGovernanceContract("tokenPoolReward", s.governanceAddress, error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND);

    // ------------------------------------------------------------------
    // Get Vault record and parameters
    // ------------------------------------------------------------------

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

    // get vault record
    var vault : vaultRecordType := getVault(vaultId, vaultOwner, s);

    // init vault parameters
    const vaultLoanTokenName            : string  = vault.loanToken; // USDT, EURL, some other crypto coin
    const currentLoanOutstandingTotal   : nat     = vault.loanOutstandingTotal;
    const initialLoanPrincipalTotal     : nat     = vault.loanPrincipalTotal;
    var vaultBorrowIndex                : nat    := vault.borrowIndex;

    // get vault liquidation timestamps
    const vaultMarkedForLiquidationTimestamp  : timestamp = vault.markedForLiquidationTimestamp;
    const timeWhenVaultCanBeLiquidated        : timestamp = vaultMarkedForLiquidationTimestamp + liquidationDelayInMins;

    // ------------------------------------------------------------------
    // Check collaterization and update interest rates
    // ------------------------------------------------------------------

    // check if vault is liquidatable
    if isLiquidatable(vault, s) 
    then skip 
    else failwith(error_VAULT_IS_NOT_LIQUIDATABLE);

    // check if sufficient time has passed since vault was marked for liquidation
    if currentTimestamp < timeWhenVaultCanBeLiquidated
    then failwith(error_VAULT_IS_NOT_READY_TO_BE_LIQUIDATED)
    else skip;

    // Get loan token type
    var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

    // ------------------------------------------------------------------
    // Update Vault interest
    // ------------------------------------------------------------------

    const totalBorrowed          : nat   = loanTokenRecord.totalBorrowed;
    const totalRemaining         : nat   = loanTokenRecord.totalRemaining;
    const tokenBorrowIndex       : nat   = loanTokenRecord.borrowIndex;

    // Init new total amounts
    var newLoanOutstandingTotal  : nat  := currentLoanOutstandingTotal;
    var newLoanPrincipalTotal    : nat  := vault.loanPrincipalTotal;
    var newLoanInterestTotal     : nat  := vault.loanInterestTotal;

    // calculate interest
    newLoanOutstandingTotal := accrueInterestToVault(
        currentLoanOutstandingTotal,
        vaultBorrowIndex,
        tokenBorrowIndex
    );

    if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
    newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);
    
    // ------------------------------------------------------------------
    // Liquidation Process
    // ------------------------------------------------------------------

    // get max vault liquidation amount
    const vaultMaxLiquidationAmount : nat = (newLoanOutstandingTotal * s.config.maxVaultLiquidationPercent) / 10000n;

    // check if there is sufficient loanOutstanding, and calculate remaining loan after liquidation
    if amount > vaultMaxLiquidationAmount then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_VAULT_LOAN_OUTSTANDING_TOTAL) else skip;

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.collateralBalanceLedger, s);
    
    // // loop tokens in vault collateral balance ledger to be liquidated
    for tokenName -> tokenBalance in map vault.collateralBalanceLedger block {

        // skip if token balance is 0n
        if tokenBalance = 0n then skip else block {

            const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                    Some(_record) -> _record
                |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
            ];

            // get last completed round price of token from Oracle view
            const collateralTokenLastCompletedRoundPrice : lastCompletedRoundPriceReturnType = getTokenLastCompletedRoundPriceFromOracle(collateralTokenRecord.oracleAddress);
            
            const tokenDecimals    : nat  = collateralTokenRecord.tokenDecimals; 
            const priceDecimals    : nat  = collateralTokenLastCompletedRoundPrice.decimals;
            const tokenPrice       : nat  = collateralTokenLastCompletedRoundPrice.price;            

            // calculate required number of decimals to rebase each token to the same unit for comparison                        
            if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
            const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

            // calculate raw value of collateral balance
            const tokenValueRaw : nat = tokenBalance * tokenPrice;

            // rebase token value to 1e32 (or 10^32)
            const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);     

            // get proportion of collateral token balance against total vault's collateral value
            const tokenProportion : nat = (tokenValueRebased * fixedPointAccuracy) / vaultCollateralValueRebased;

            // ------------------------------------------------------------------
            // Liquidator's Amount
            // ------------------------------------------------------------------

            // get balance to be extracted from token and sent to liquidator
            const liquidatorTokenProportionalValue : nat = tokenProportion * liquidatorAmountAndIncentive;

            // get quantity of tokens to be liquidated
            const liquidatorTokenQuantityTotal : nat = (liquidatorTokenProportionalValue / tokenPrice) / fixedPointAccuracy;

            // calculate new collateral balance
            if liquidatorTokenQuantityTotal > tokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
            var newTokenCollateralBalance : nat := abs(tokenBalance - liquidatorTokenQuantityTotal);

            // send tokens from vault to liquidator
            const sendTokensFromVaultToLiquidatorOperation : operation = withdrawFromVaultOperation(
                liquidator,                         // to_
                liquidatorTokenQuantityTotal,       // token amount to be withdrawn
                collateralTokenRecord.tokenType,    // token type (i.e. tez, fa12, fa2) 
                vault.address                       // vault address
            );
            operations := sendTokensFromVaultToLiquidatorOperation # operations;

            // ------------------------------------------------------------------
            // Treasury's Amount
            // ------------------------------------------------------------------

            // get balance to be extracted from token and sent to liquidator
            const treasuryTokenProportionalValue : nat = tokenProportion * adminLiquidationFee;

            // get quantity of tokens to be liquidated
            const treasuryTokenQuantityTotal : nat = (treasuryTokenProportionalValue / tokenPrice) / fixedPointAccuracy;

            // calculate new collateral balance
            if treasuryTokenQuantityTotal > tokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
            newTokenCollateralBalance := abs(tokenBalance - treasuryTokenQuantityTotal);

            // send tokens from vault to treasury
            const sendTokensFromVaultToTreasuryOperation : operation = withdrawFromVaultOperation(
                treasuryAddress,                    // to_
                treasuryTokenQuantityTotal,         // token amount to be withdrawn
                collateralTokenRecord.tokenType,    // token type (i.e. tez, fa12, fa2) 
                vault.address                       // vault address
            );
            operations := sendTokensFromVaultToTreasuryOperation # operations;

            // ------------------------------------------------------------------
            // Update collateral balance
            // ------------------------------------------------------------------

            // save and update new balance for collateral token
            vault.collateralBalanceLedger[tokenName]  := newTokenCollateralBalance;

        };

    };


    // ------------------------------------------------------------------
    // Update Interest Records
    // ------------------------------------------------------------------

    var totalInterestPaid       : nat := 0n;
    var totalPrincipalRepaid    : nat := 0n;                

    if amount > newLoanInterestTotal then {
        
        // final repayment amount covers interest and principal

        // calculate remainder amount
        const principalReductionAmount : nat = abs(amount - newLoanInterestTotal);

        // set total interest paid and reset loan interest to zero
        totalInterestPaid := newLoanInterestTotal;
        newLoanInterestTotal := 0n;

        // calculate final loan principal
        if principalReductionAmount > initialLoanPrincipalTotal then failwith(error_PRINCIPAL_REDUCTION_MISCALCULATION) else skip;
        newLoanPrincipalTotal := abs(initialLoanPrincipalTotal - principalReductionAmount);

        // set total principal repaid amount
        totalPrincipalRepaid := principalReductionAmount;

        // calculate final loan outstanding total
        if amount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
        newLoanOutstandingTotal := abs(newLoanOutstandingTotal - amount);

    } else {

        // final repayment amount covers interest only

        // set total interest paid
        totalInterestPaid := amount;

        // calculate final loan interest
        if amount > newLoanInterestTotal then failwith(error_LOAN_INTEREST_MISCALCULATION) else skip;
        newLoanInterestTotal := abs(newLoanInterestTotal - amount);

        // calculate final loan outstanding total
        if amount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
        newLoanOutstandingTotal := abs(newLoanOutstandingTotal - amount);

    };

    // Calculate share of interest that goes to the Treasury 
    const interestTreasuryShare : nat = ((totalInterestPaid * s.config.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

    // Calculate share of interest that goes to the Reward Pool 
    if interestTreasuryShare > totalInterestPaid then failwith(error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID) else skip;
    const interestRewardPool : nat = abs(totalInterestPaid - interestTreasuryShare);

    // ------------------------------------------------------------------
    // Process Fee Transfers
    // ------------------------------------------------------------------

    // Send interest payment from Lending Controller Token Pool to treasury
    const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
        Tezos.get_self_address(),    // from_    
        treasuryAddress,             // to_
        interestTreasuryShare,       // amount
        loanTokenRecord.tokenType    // token type
    );

    // Send interest as rewards from Lending Controller Token Pool to Token Pool Rewards Contract
    const sendInterestRewardToTokenPoolRewardContractOperation : operation = tokenPoolTransfer(
        Tezos.get_self_address(),       // from_
        tokenPoolRewardAddress,         // to_
        interestRewardPool,             // amount
        loanTokenRecord.tokenType       // token type
    );

    // Update rewards in Token Pool Contract
    const updateRewardsParams : updateRewardsActionType = record [
        tokenName = vaultLoanTokenName;
        amount    = interestRewardPool;
    ];

    const updateRewardsInTokenPoolRewardContractOperation : operation = Tezos.transaction(
        updateRewardsParams,
        0mutez,
        getUpdateRewardsEntrypointInTokenPoolRewardContract(tokenPoolRewardAddress)
    );

    operations := list[
        sendInterestToTreasuryOperation;
        sendInterestRewardToTokenPoolRewardContractOperation;
        updateRewardsInTokenPoolRewardContractOperation;
    ];


    // ------------------------------------------------------------------
    // Process Repayment
    // ------------------------------------------------------------------            


    var newTokenPoolTotal   : nat  := 0n;
    var newTotalBorrowed    : nat  := 0n;
    var newTotalRemaining   : nat  := 0n;
    
    // process repayment of principal if total principal repaid quantity is greater than 0
    if totalPrincipalRepaid > 0n then {

        // calculate new totalBorrowed and totalRemaining
        if totalPrincipalRepaid > totalBorrowed then failwith(error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT) else skip;
        newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
        newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
        newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

        // transfer prinicpal repayment amount from liquidator to token pool
        const transferRepaymentAmountToTokenPoolOperation : operation = tokenPoolTransfer(
            liquidator,                 // from_
            Tezos.get_self_address(),   // to_
            totalPrincipalRepaid,       // amount
            loanTokenRecord.tokenType   // token type
        );

        operations := transferRepaymentAmountToTokenPoolOperation # operations;

    } else skip;

    // ------------------------------------------------------------------
    // Update Storage
    // ------------------------------------------------------------------

    // update token storage
    loanTokenRecord.tokenPoolTotal          := newTokenPoolTotal;
    loanTokenRecord.totalBorrowed           := newTotalBorrowed;
    loanTokenRecord.totalRemaining          := newTotalRemaining;

    // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
    loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);
    
    s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

    // update vault storage
    vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
    vault.loanPrincipalTotal        := newLoanPrincipalTotal;
    vault.loanInterestTotal         := newLoanInterestTotal;
    vault.borrowIndex               := tokenBorrowIndex;
    vault.lastUpdatedBlockLevel     := Tezos.get_level();
    vault.lastUpdatedTimestamp      := Tezos.get_now();
    s.vaults[vaultHandle]           := vault;                

} with (operations, s)



(* registerDeposit lambda *)
// function registerDeposit(const registerDepositParams : registerDepositActionType; var s : lendingControllerStorageType) : return is
// block {
    
//     checkRegisterDepositIsNotPaused(s);    // check that %registerDeposit entrypoint is not paused (e.g. if glass broken)
            
//     // init variables for convenience
//     const vaultHandle     : vaultHandleType   = registerDepositParams.handle;
//     const depositAmount   : nat               = registerDepositParams.amount;
//     const tokenName       : string            = registerDepositParams.tokenName;
//     const initiator       : address           = Tezos.get_sender(); // vault address that initiated deposit

//     // get vault
//     var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

//     // check if initiator matches vault address
//     if vault.address =/= initiator then failwith(error_SENDER_MUST_BE_VAULT_ADDRESS) else skip;

//     // ------------------------------------------------------------------
//     // Update Loan Token state and get token borrow index
//     // ------------------------------------------------------------------

//     // Get current vault borrow index, and vault loan token name
//     var vaultBorrowIndex      : nat := vault.borrowIndex;
//     const vaultLoanTokenName  : string = vault.loanToken; // USDT, EURL, some other crypto coin

//     // Get loan token type
//     var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
//             Some(_record) -> _record
//         |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
//     ];

//     // Get loan token parameters
//     const tokenBorrowIndex  : nat = loanTokenRecord.borrowIndex;

//     // ------------------------------------------------------------------
//     // Accrue interest to vault oustanding
//     // ------------------------------------------------------------------

//     // Get current user loan outstanding and init new total variables
//     const currentLoanOutstandingTotal  : nat = vault.loanOutstandingTotal;
//     const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;

//     var newLoanOutstandingTotal        : nat := currentLoanOutstandingTotal;
//     var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;
//     var newLoanInterestTotal           : nat := vault.loanInterestTotal;

//     // calculate interest
//     newLoanOutstandingTotal := accrueInterestToVault(
//         currentLoanOutstandingTotal,
//         vaultBorrowIndex,
//         tokenBorrowIndex
//     );

//     if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
//     newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

//     // ------------------------------------------------------------------
//     // Register token deposit in vault collateral balance ledger
//     // ------------------------------------------------------------------
    
//     // check if token is tez or exists in collateral token ledger
//     if tokenName = "tez" then skip else {
//         checkCollateralTokenExists(tokenName, s)    
//     };

//     // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
//     var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
//             Some(_balance) -> _balance
//         |   None           -> 0n
//     ];

//     // calculate new collateral balance
//     const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

//     // ------------------------------------------------------------------
//     // Update storage
//     // ------------------------------------------------------------------

//     vault.loanOutstandingTotal                := newLoanOutstandingTotal;
//     vault.loanPrincipalTotal                  := newLoanPrincipalTotal;
//     vault.loanInterestTotal                   := newLoanInterestTotal;
//     vault.borrowIndex                         := tokenBorrowIndex;
//     vault.lastUpdatedBlockLevel               := Tezos.get_level();
//     vault.lastUpdatedTimestamp                := Tezos.get_now();
//     vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
//     s.vaults[vaultHandle]                     := vault;

//     // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
//     if loanTokenRecord.tokenPoolTotal > 0n then {
//         loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);
//     } else skip;
//     s.loanTokenLedger[vaultLoanTokenName]     := loanTokenRecord;


// } with (noOperations, s)



(* registerWithdrawal lambda *)
// function registerWithdrawal(const registerWithdrawalParams : registerWithdrawalActionType; var s : lendingControllerStorageType) : return is
// block {
    
//     checkRegisterWithdrawalIsNotPaused(s);    // check that %registerWithdrawal entrypoint is not paused (e.g. if glass broken)
                
//     // init variables for convenience
//     const vaultHandle         : vaultHandleType   = registerWithdrawalParams.handle;
//     const withdrawalAmount    : nat               = registerWithdrawalParams.amount;
//     const tokenName           : string            = registerWithdrawalParams.tokenName;
//     const initiator           : address           = Tezos.get_sender(); // vault address that initiated withdrawal

//     // get vault
//     var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

//     // check if initiator matches vault address
//     if vault.address =/= initiator then failwith(error_SENDER_MUST_BE_VAULT_ADDRESS) else skip;
    
//     // ------------------------------------------------------------------
//     // Update Loan Token state and get token borrow index
//     // ------------------------------------------------------------------

//     // Get current vault borrow index, and vault loan token name
//     var vaultBorrowIndex      : nat := vault.borrowIndex;
//     const vaultLoanTokenName  : string = vault.loanToken; // USDT, EURL, some other crypto coin

//     // Get loan token type
//     var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
//             Some(_record) -> _record
//         |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
//     ];

//     // Get loan token parameters
//     const tokenBorrowIndex  : nat = loanTokenRecord.borrowIndex;

//     // ------------------------------------------------------------------
//     // Accrue interest to vault oustanding
//     // ------------------------------------------------------------------

//     // Get current user loan outstanding and init new total variables
//     const currentLoanOutstandingTotal  : nat = vault.loanOutstandingTotal;
//     const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;

//     var newLoanOutstandingTotal        : nat := currentLoanOutstandingTotal;
//     var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;
//     var newLoanInterestTotal           : nat := vault.loanInterestTotal;

//     // calculate interest
//     newLoanOutstandingTotal := accrueInterestToVault(
//         currentLoanOutstandingTotal,
//         vaultBorrowIndex,
//         tokenBorrowIndex
//     );

//     if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
//     newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

//     // check if vault is undercollaterized, if not then send withdraw operation
//     if isUnderCollaterized(vault, s) 
//     then failwith(error_CANNOT_WITHDRAW_AS_VAULT_IS_UNDERCOLLATERIZED) 
//     else skip;

//     // ------------------------------------------------------------------
//     // Register token withdrawal in vault collateral balance ledger
//     // ------------------------------------------------------------------

//     // if tez is to be withdrawn, check that Tezos amount should be the same as withdraw amount
//     if tokenName = "tez" then block {
//         if mutezToNatural(Tezos.get_amount()) =/= withdrawalAmount then failwith(error_TEZOS_SENT_IS_NOT_EQUAL_TO_WITHDRAW_AMOUNT) else skip;
//     } else skip;

//     // get token collateral balance in vault, fail if none found
//     var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
//             Some(_balance) -> _balance
//         |   None -> failwith(error_INSUFFICIENT_COLLATERAL_TOKEN_BALANCE_IN_VAULT)
//     ];

//     // calculate new vault balance
//     if withdrawalAmount > vaultTokenCollateralBalance then failwith(error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
//     const newCollateralBalance : nat  = abs(vaultTokenCollateralBalance - withdrawalAmount);
    
//     // ------------------------------------------------------------------
//     // Update storage
//     // ------------------------------------------------------------------

//     vault.loanOutstandingTotal                := newLoanOutstandingTotal;
//     vault.loanPrincipalTotal                  := newLoanPrincipalTotal;
//     vault.loanInterestTotal                   := newLoanInterestTotal;
//     vault.borrowIndex                         := tokenBorrowIndex;
//     vault.lastUpdatedBlockLevel               := Tezos.get_level();
//     vault.lastUpdatedTimestamp                := Tezos.get_now();
//     vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
//     s.vaults[vaultHandle]                     := vault;

//     // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
//     if loanTokenRecord.tokenPoolTotal > 0n then {
//         loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);
//     } else skip;
//     s.loanTokenLedger[vaultLoanTokenName]     := loanTokenRecord;

// } with (noOperations, s)



(* borrow lambda *)
function borrow(const borrowParams : borrowActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation):= nil;
    checkBorrowIsNotPaused(s);    // check that %borrow entrypoint is not paused (e.g. if glass broken)
                
    // Init variables for convenience
    const vaultId            : nat                     = borrowParams.vaultId; 
    const initialLoanAmount  : nat                     = borrowParams.quantity;
    const initiator          : initiatorAddressType    = Tezos.get_sender();

    // Get Treasury Address and Token Pool Reward Address from the General Contracts map on the Governance Contract
    const treasuryAddress: address        = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);
    const tokenPoolRewardAddress: address = getContractAddressFromGovernanceContract("tokenPoolReward", s.governanceAddress, error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND);

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = initiator;
    ];

    // Get vault if exists and vault loan token name
    var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
    const vaultLoanTokenName : string = vault.loanToken; // USDT, EURL, some other crypto coin

    // Get loan token type
    var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

    // Get loan token parameters
    const reserveRatio      : nat         = loanTokenRecord.reserveRatio;
    const tokenPoolTotal    : nat         = loanTokenRecord.tokenPoolTotal;
    const totalBorrowed     : nat         = loanTokenRecord.totalBorrowed;
    const totalRemaining    : nat         = loanTokenRecord.totalRemaining;
    const loanTokenType     : tokenType   = loanTokenRecord.tokenType;
    const tokenBorrowIndex  : nat         = loanTokenRecord.borrowIndex;

    // ------------------------------------------------------------------
    // Calculate Service Loan Fees
    // ------------------------------------------------------------------
    
    // Charge a minimum loan fee if user is borrowing
    const minimumLoanFee : nat = ((initialLoanAmount * s.config.minimumLoanFeePercent * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

    // Calculate share of fees that goes to the Treasury 
    const minimumLoanFeeToTreasury : nat = ((minimumLoanFee * s.config.minimumLoanFeeTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

    // Calculate share of fees that goes to the Reward Pool 
    if minimumLoanFeeToTreasury > minimumLoanFee then failwith(error_MINIMUM_LOAN_FEE_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_MINIMUM_LOAN_FEE) else skip;
    const minimumLoanFeeRewardPool : nat = abs(minimumLoanFee - minimumLoanFeeToTreasury);

    // ------------------------------------------------------------------
    // Get current user borrow index
    // ------------------------------------------------------------------

    // Get user's vault borrow index
    var vaultBorrowIndex : nat := vault.borrowIndex;

    // Get current user loan outstanding
    const currentLoanOutstandingTotal : nat = vault.loanOutstandingTotal;
    const initialLoanPrincipalTotal   : nat = vault.loanPrincipalTotal;
    
    // Init new total amounts
    var newLoanOutstandingTotal     : nat := currentLoanOutstandingTotal;
    var newLoanPrincipalTotal       : nat := vault.loanPrincipalTotal;
    var newLoanInterestTotal        : nat := vault.loanInterestTotal;

    // ------------------------------------------------------------------
    // Calculate fees on past loan outstanding
    // ------------------------------------------------------------------

    // calculate interest
    newLoanOutstandingTotal := accrueInterestToVault(
        currentLoanOutstandingTotal,
        vaultBorrowIndex,
        tokenBorrowIndex
    );

    if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
    newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

    // ------------------------------------------------------------------
    // Calculate Final Borrow Amount
    // ------------------------------------------------------------------

    var finalLoanAmount : nat := initialLoanAmount;

    // reduce finalLoanAmount by minimum loan fee
    if minimumLoanFee > finalLoanAmount then failwith(error_LOAN_FEE_CANNOT_BE_GREATER_THAN_BORROWED_AMOUNT) else skip;
    finalLoanAmount := abs(finalLoanAmount - minimumLoanFee);

    // calculate new loan outstanding
    newLoanOutstandingTotal := newLoanOutstandingTotal + initialLoanAmount;

    // increment new principal total
    newLoanPrincipalTotal := newLoanPrincipalTotal + initialLoanAmount;

    // ------------------------------------------------------------------
    // Token Pool Calculations
    // ------------------------------------------------------------------

    // calculate required reserve amount for token in token pool
    const requiredTokenPoolReserves = (tokenPoolTotal * fixedPointAccuracy * reserveRatio) / (10000n * fixedPointAccuracy);

    // calculate new totalBorrowed 
    const newTotalBorrowed   : nat = totalBorrowed + initialLoanAmount;
    
    // calculate new total remaining
    if initialLoanAmount > totalRemaining then failwith(error_INSUFFICIENT_TOKENS_IN_TOKEN_POOL_TO_BE_BORROWED) else skip;
    const newTotalRemaining  : nat = abs(totalRemaining - initialLoanAmount);

    // check that new total remaining is greater than required token pool reserves
    if newTotalRemaining > requiredTokenPoolReserves then skip else failwith(error_TOKEN_POOL_RESERVES_RATIO_NOT_MET);

    // ------------------------------------------------------------------
    // Process Transfers (loan, fees, and rewards)
    // ------------------------------------------------------------------

    const transferLoanToBorrowerOperation : operation = tokenPoolTransfer(
        Tezos.get_self_address(),   // from_
        initiator,                  // to_
        finalLoanAmount,            // amount
        loanTokenType               // token type
    );

    const transferFeesToTreasuryOperation : operation = tokenPoolTransfer(
        Tezos.get_self_address(),   // from_
        treasuryAddress,            // to_
        minimumLoanFeeToTreasury,   // amount
        loanTokenType               // token type
    );

    const transferFeesToTokenPoolRewardOperation : operation = tokenPoolTransfer(
        Tezos.get_self_address(),   // from_
        tokenPoolRewardAddress,     // to_
        minimumLoanFeeRewardPool,   // amount
        loanTokenType               // token type
    );

    operations := list[
        transferLoanToBorrowerOperation; 
        transferFeesToTreasuryOperation;
        transferFeesToTokenPoolRewardOperation;
    ];

    // ------------------------------------------------------------------
    // Update Storage
    // ------------------------------------------------------------------
    
    // update token storage
    loanTokenRecord.tokenPoolTotal         := newTotalBorrowed + newTotalRemaining;
    loanTokenRecord.totalBorrowed          := newTotalBorrowed;
    loanTokenRecord.totalRemaining         := newTotalRemaining;

    // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
    loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);

    s.loanTokenLedger[vaultLoanTokenName]  := loanTokenRecord;

    // update vault storage
    vault.loanOutstandingTotal             := newLoanOutstandingTotal;
    vault.loanPrincipalTotal               := newLoanPrincipalTotal;
    vault.loanInterestTotal                := newLoanInterestTotal;
    vault.borrowIndex                      := tokenBorrowIndex;
    vault.lastUpdatedBlockLevel            := Tezos.get_level();
    vault.lastUpdatedTimestamp             := Tezos.get_now();

    // update vault
    s.vaults[vaultHandle] := vault;

    // check if vault is undercollaterized again after loan; if it is not, then allow user to borrow
    if isUnderCollaterized(vault, s) 
    then failwith(error_VAULT_IS_UNDERCOLLATERIZED)
    else skip;

} with (operations, s)



(* repay lambda *)
function repay(const repayParams : repayActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkRepayIsNotPaused(s);    // check that %repay entrypoint is not paused (e.g. if glass broken)

    // Init variables for convenience
    const vaultId                   : nat                     = repayParams.vaultId; 
    const initialRepaymentAmount    : nat                     = repayParams.quantity;
    const initiator                 : initiatorAddressType    = Tezos.get_sender();
    var finalRepaymentAmount        : nat                    := initialRepaymentAmount;

    // Get Treasury Address and Token Pool Reward Address  from the General Contracts map on the Governance Contract
    const treasuryAddress : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);
    const tokenPoolRewardAddress : address = getContractAddressFromGovernanceContract("tokenPoolReward", s.governanceAddress, error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND);

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = initiator;
    ];

    // Get vault if exists and vault loan token name
    var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
    const vaultLoanTokenName : string = vault.loanToken; // USDT, EURL, some other crypto coin

    // Get loan token type
    var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

    // Get loan token parameters
    const tokenPoolTotal    : nat         = loanTokenRecord.tokenPoolTotal;
    const totalBorrowed     : nat         = loanTokenRecord.totalBorrowed;
    const totalRemaining    : nat         = loanTokenRecord.totalRemaining;
    const tokenBorrowIndex  : nat         = loanTokenRecord.borrowIndex;
    const loanTokenType     : tokenType   = loanTokenRecord.tokenType;

    // ------------------------------------------------------------------
    // Get current user borrow index
    // ------------------------------------------------------------------

    // Get user's vault borrow index
    var vaultBorrowIndex : nat := vault.borrowIndex;

    // Get current user loan outstanding
    const currentLoanOutstandingTotal   : nat = vault.loanOutstandingTotal;
    const initialLoanPrincipalTotal     : nat = vault.loanPrincipalTotal;
    
    // Init new total amounts
    var newLoanOutstandingTotal     : nat := currentLoanOutstandingTotal;
    var newLoanPrincipalTotal       : nat := vault.loanPrincipalTotal;
    var newLoanInterestTotal        : nat := vault.loanInterestTotal;
    
    // ------------------------------------------------------------------
    // Calculate fees on past loan outstanding
    // ------------------------------------------------------------------

    newLoanOutstandingTotal := accrueInterestToVault(
        currentLoanOutstandingTotal,
        vaultBorrowIndex,
        tokenBorrowIndex
    );

    if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
    newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);


    // ------------------------------------------------------------------
    // Calculate Principal / Interest Repayments
    // ------------------------------------------------------------------

    var totalInterestPaid       : nat := 0n;
    var totalPrincipalRepaid    : nat := 0n;

    if finalRepaymentAmount > newLoanInterestTotal then {
        
        // final repayment amount covers interest and principal

        // calculate remainder amount
        const principalReductionAmount : nat = abs(finalRepaymentAmount - newLoanInterestTotal);

        // set total interest paid and reset loan interest to zero
        totalInterestPaid := newLoanInterestTotal;
        newLoanInterestTotal := 0n;

        // calculate final loan principal
        if principalReductionAmount > initialLoanPrincipalTotal then failwith(error_PRINCIPAL_REDUCTION_MISCALCULATION) else skip;
        newLoanPrincipalTotal := abs(initialLoanPrincipalTotal - principalReductionAmount);

        // set total principal repaid amount
        totalPrincipalRepaid := principalReductionAmount;

        // calculate final loan outstanding total
        if finalRepaymentAmount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
        newLoanOutstandingTotal := abs(newLoanOutstandingTotal - finalRepaymentAmount);

    } else {

        // final repayment amount covers interest only

        // set total interest paid
        totalInterestPaid := finalRepaymentAmount;

        // calculate final loan interest
        if finalRepaymentAmount > newLoanInterestTotal then failwith(error_LOAN_INTEREST_MISCALCULATION) else skip;
        newLoanInterestTotal := abs(newLoanInterestTotal - finalRepaymentAmount);

        // calculate final loan outstanding total
        if finalRepaymentAmount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
        newLoanOutstandingTotal := abs(newLoanOutstandingTotal - finalRepaymentAmount);

    };

    // Calculate share of interest that goes to the Treasury 
    const interestTreasuryShare : nat = ((totalInterestPaid * s.config.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

    // Calculate share of interest that goes to the Reward Pool 
    if interestTreasuryShare > totalInterestPaid then failwith(error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID) else skip;
    const interestRewardPool : nat = abs(totalInterestPaid - interestTreasuryShare);

    // ------------------------------------------------------------------
    // Process Interest Repayment - Fee Transfers
    // ------------------------------------------------------------------

    // Send interest payment to treasury
    const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
        Tezos.get_self_address(),    // from_
        treasuryAddress,             // to_
        interestTreasuryShare,       // amount
        loanTokenType                // token type
    );

    // Send interest as rewards to Token Pool Rewards Contract
    const sendInterestRewardToTokenPoolRewardContractOperation : operation = tokenPoolTransfer(
        Tezos.get_self_address(),    // from_   
        tokenPoolRewardAddress,      // to_
        interestRewardPool,          // amount
        loanTokenType                // token type
    );

    operations := list[
        sendInterestToTreasuryOperation;
        sendInterestRewardToTokenPoolRewardContractOperation;
    ];

    // ------------------------------------------------------------------
    // Process Principal Repayment
    // ------------------------------------------------------------------            

    var newTokenPoolTotal   : nat  := tokenPoolTotal;
    var newTotalBorrowed    : nat  := totalBorrowed;
    var newTotalRemaining   : nat  := totalRemaining;
    
    // process repayment of principal if total principal repaid quantity is greater than 0
    if totalPrincipalRepaid > 0n then {

        // calculate new totalBorrowed and totalRemaining
        if totalPrincipalRepaid > totalBorrowed then failwith(error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT) else skip;
        newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
        newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
        newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

        // transfer prinicpal repayment amount from repayer to token pool
        const transferRepaymentAmountToTokenPoolOperation : operation = tokenPoolTransfer(
            initiator,                  // from_
            Tezos.get_self_address(),   // to_
            totalPrincipalRepaid,       // amount
            loanTokenType               // token type
        );

        operations := transferRepaymentAmountToTokenPoolOperation # operations;

    } else skip;

    // ------------------------------------------------------------------
    // Update Storage
    // ------------------------------------------------------------------

    // update token storage
    loanTokenRecord.tokenPoolTotal          := newTokenPoolTotal;
    loanTokenRecord.totalBorrowed           := newTotalBorrowed;
    loanTokenRecord.totalRemaining          := newTotalRemaining;

    // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
    loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);

    s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

    // update vault storage
    vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
    vault.loanPrincipalTotal        := newLoanPrincipalTotal;
    vault.loanInterestTotal         := newLoanInterestTotal;
    vault.borrowIndex               := tokenBorrowIndex;
    vault.lastUpdatedBlockLevel     := Tezos.get_level();
    vault.lastUpdatedTimestamp      := Tezos.get_now();

    // update vault
    s.vaults[vaultHandle] := vault;

} with (operations, s)

// ------------------------------------------------------------------------------
// Vault Entrypoint Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(lendingControllerUnpackLambdaFunctionType)) of [
            Some(f) -> f(lendingControllerLambdaAction, s)
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
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Vault Controller Lambdas :
#include "../partials/contractLambdas/lendingController/lendingControllerLambdas.ligo"

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

(* View: get token in collateral token ledger *)
[@view] function getColTokenRecordByNameOpt(const tokenName : string; const s : lendingControllerStorageType) : option(collateralTokenRecordType) is
    Map.find_opt(tokenName, s.collateralTokenLedger)



(* View: get token by token contract address in collateral token ledger *)
[@view] function getColTokenRecordByAddressOpt(const tokenContractAddress : address; const s : lendingControllerStorageType) : option(collateralTokenRecordType) is
block {

    var tokenName : string := "empty";
    for _key -> value in map s.collateralTokenLedger block {
        if value.tokenContractAddress = tokenContractAddress then tokenName := _key else skip;
    };

    const collateralTokenRecord : option(collateralTokenRecordType) = Map.find_opt(tokenName, s.collateralTokenLedger)

} with collateralTokenRecord



(* View: get loan token *)
[@view] function getLoanTokenRecord(const tokenName : string; const s : lendingControllerStorageType) : option(loanTokenRecordType) is
    Map.find_opt(tokenName, s.loanTokenLedger)




(* View: get owned vaults by user *)
[@view] function getOwnedVaultsByUserOpt(const ownerAddress : address; const s : lendingControllerStorageType) : option(ownerVaultSetType) is
    Big_map.find_opt(ownerAddress, s.ownerLedger)



(* View: get vault by handle *)
[@view] function getVaultOpt(const vaultHandle : vaultHandleType; const s : lendingControllerStorageType) : option(vaultRecordType) is
    Big_map.find_opt(vaultHandle, s.vaults)



(* View: get contract address - e.g. find delegation address to pass to vault for delegating MVK to satellite  *)
[@view] function getContractAddressOpt(const contractName : string; const s : lendingControllerStorageType) : option(address) is
    Map.find_opt(contractName, s.generalContracts)


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

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : lendingControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
    
    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : lendingControllerStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : lendingControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : lendingControllerUpdateConfigParamsType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : lendingControllerStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : lendingControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : lendingControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : lendingControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : lendingControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : lendingControllerTogglePauseEntrypointType; const s : lendingControllerStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLoanToken entrypoint *)
function setLoanToken(const setLoanTokenParams : setLoanTokenActionType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetLoanToken"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetLoanToken(setLoanTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* addLiquidity entrypoint *)
function addLiquidity(const addLiquidityParams : addLiquidityActionType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddLiquidity"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaAddLiquidity(addLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* removeLiquidity entrypoint *)
function removeLiquidity(const removeLiquidityParams : removeLiquidityActionType ; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveLiquidity"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRemoveLiquidity(removeLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Token Pool Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Entrypoints Begin
// ------------------------------------------------------------------------------

(* callVaultEntrypoint entrypoint *)
function callVaultEntrypoint(const callVaultEntrypointParams : callVaultEntrypointActionType ; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCallVaultEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaCallVaultEntrypoint(callVaultEntrypointParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response




(* updateCollateralToken entrypoint *)
function updateCollateralToken(const updateCollateralTokenParams : updateCollateralTokenActionType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCollateralToken"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateCollateralToken(updateCollateralTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



// (* createVault entrypoint *)
// function createVault(const createVaultParams : createVaultActionType; var s : lendingControllerStorageType) : return is 
// block {

//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateVault"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init vault controller lambda action
//     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaCreateVault(createVaultParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
// } with response






(* closeVault entrypoint *)
// function closeVault(const closeVaultParams : closeVaultActionType; var s : lendingControllerStorageType) : return is 
// block {
    
//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaCloseVault"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init vault controller lambda action
//     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaCloseVault(closeVaultParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
// } with response



// (* registerDeposit entrypoint *)
function registerDeposit(const registerDepositParams : registerDepositActionType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRegisterDeposit"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRegisterDeposit(registerDepositParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response




// (* registerWithdrawal entrypoint *)
function registerWithdrawal(const registerWithdrawalParams : registerWithdrawalActionType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRegisterWithdrawal"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRegisterWithdrawal(registerWithdrawalParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



// (* markForLiquidation entrypoint *)
// function markForLiquidation(const markForLiquidationParams : markForLiquidationActionType; var s : lendingControllerStorageType) : return is 
// block {
    
//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaMarkForLiquidation"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init vault controller lambda action
//     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaMarkForLiquidation(markForLiquidationParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
// } with response



// (* liquidateVault entrypoint *)
// function liquidateVault(const liquidateVaultParams : liquidateVaultActionType; var s : lendingControllerStorageType) : return is 
// block {
    
//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaLiquidateVault"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init vault controller lambda action
//     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaLiquidateVault(liquidateVaultParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
// } with response



// (* borrow entrypoint *)
// function borrow(const borrowParams : borrowActionType; var s : lendingControllerStorageType) : return is 
// block {
    
//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaBorrow"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init vault controller lambda action
//     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaBorrow(borrowParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

// } with response



// (* repay entrypoint *)
// function repay(const repayParams : repayActionType; var s : lendingControllerStorageType) : return is 
// block {
    
//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaRepay"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init vault controller lambda action
//     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRepay(repayParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

// } with response

// ------------------------------------------------------------------------------
// Vault Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Staked MVK Entrypoints Begin
// ------------------------------------------------------------------------------

(* vaultDepositStakedMvk entrypoint *)
function vaultDepositStakedMvk(const vaultDepositStakedMvkParams : vaultDepositStakedMvkType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDepositStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



// (* vaultWithdrawStakedMvk entrypoint *)
function vaultWithdrawStakedMvk(const vaultWithdrawStakedMvkParams : vaultWithdrawStakedMvkType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultWithdrawStakedMvk(vaultWithdrawStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



// (* vaultLiquidateStakedMvk entrypoint *)
function vaultLiquidateStakedMvk(const vaultLiquidateStakedMvkParams : vaultLiquidateStakedMvkType; var s : lendingControllerStorageType) : return is 
block {


    const lambdaBytes : bytes = case s.lambdaLedger["lambdaLiquidateStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultLiquidateStakedMvk(vaultLiquidateStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Vault Staked MVK Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Rewards Entrypoints Begin
// ------------------------------------------------------------------------------

(* claimRewards entrypoint *)
function claimRewards(const claimRewardsParams : claimRewardsType; var s : lendingControllerStorageType) : return is 
block {


    const lambdaBytes : bytes = case s.lambdaLedger["lambdaClaimRewards"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaClaimRewards(claimRewardsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Rewards Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : lendingControllerStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)



(* setProductLambda entrypoint *)
function setProductLambda(const setLambdaParams : setLambdaType; var s : lendingControllerStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.vaultLambdaLedger[lambdaName] := lambdaBytes;

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
function main (const action : lendingControllerAction; const s : lendingControllerStorageType) : return is 
    case action of [

        |   Default(_params)                              -> ((nil : list(operation)), s)
        
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                          -> setAdmin(parameters, s) 
        |   SetGovernance(parameters)                     -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)             -> togglePauseEntrypoint(parameters, s)

            // Token Pool Entrypoints
        |   SetLoanToken(parameters)                      -> setLoanToken(parameters, s)
        |   AddLiquidity(parameters)                      -> addLiquidity(parameters, s)
        |   RemoveLiquidity(parameters)                   -> removeLiquidity(parameters, s)
        
            // Vault Entrypoints
        |   CallVaultEntrypoint (parameters)              -> callVaultEntrypoint (parameters, s)
        |   UpdateCollateralToken(parameters)             -> updateCollateralToken(parameters, s)
        // |   CreateVault(parameters)                       -> createVault(parameters, s)
        // |   CloseVault(parameters)                        -> closeVault(parameters, s)
        |   RegisterDeposit(parameters)                   -> registerDeposit(parameters, s)
        |   RegisterWithdrawal(parameters)                -> registerWithdrawal(parameters, s)
        // |   MarkForLiquidation(parameters)                -> markForLiquidation(parameters, s)
        // |   LiquidateVault(parameters)                    -> liquidateVault(parameters, s)
        // |   Borrow(parameters)                            -> borrow(parameters, s)
        // |   Repay(parameters)                             -> repay(parameters, s)

            // Vault Staked MVK Entrypoints   
        |   VaultDepositStakedMvk(parameters)             -> vaultDepositStakedMvk(parameters, s)
        |   VaultWithdrawStakedMvk(parameters)            -> vaultWithdrawStakedMvk(parameters, s)
        |   VaultLiquidateStakedMvk(parameters)           -> vaultLiquidateStakedMvk(parameters, s)

            // Rewards Entrypoints
        |   ClaimRewards(parameters)                      -> claimRewards(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)    
        |   SetProductLambda(parameters)                  -> setProductLambda(parameters, s)    

    ]