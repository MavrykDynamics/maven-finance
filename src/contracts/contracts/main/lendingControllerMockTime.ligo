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

// Mavryk FA2 Token Types 
#include "../partials/contractTypes/mavrykFa2TokenTypes.ligo"

// Doorman Types
#include "../partials/contractTypes/doormanTypes.ligo"

// Aggregator Types - for lastCompletedRoundPriceReturnType
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Vault Types
#include "../partials/contractTypes/vaultTypes.ligo"

// Lending Controller Mock Time Types
#include "../partials/contractTypes/lendingControllerMockTimeTypes.ligo"

// Token Pool Reward Types 
#include "../partials/contractTypes/tokenPoolRewardTypes.ligo"

// ------------------------------------------------------------------------------

type lendingControllerAction is 

    |   Default of unit
        
        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateConfig                    of lendingControllerUpdateConfigParamsType
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsType

        // Break Glass Entrypoints
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of lendingControllerTogglePauseEntrypointType

        // Admin Entrypoints
    |   SetLoanToken                    of setLoanTokenActionType
    |   SetCollateralToken              of setCollateralTokenActionType
    |   RegisterVaultCreation           of registerVaultCreationActionType
    
        // Token Pool Entrypoints
    |   AddLiquidity                    of addLiquidityActionType
    |   RemoveLiquidity                 of removeLiquidityActionType 

        // Vault Entrypoints
    |   CloseVault                      of closeVaultActionType
    |   RegisterDeposit                 of registerDepositActionType
    |   RegisterWithdrawal              of registerWithdrawalActionType
    |   MarkForLiquidation              of markForLiquidationActionType
    |   LiquidateVault                  of liquidateVaultActionType
    |   Borrow                          of borrowActionType
    |   Repay                           of repayActionType

        // Vault Staked MVK Entrypoints   
    // |   CallVaultStakedMvkAction        of callVaultStakedMvkActionType  
    |   VaultDepositStakedMvk           of vaultDepositStakedMvkType   
    |   VaultWithdrawStakedMvk          of vaultWithdrawStakedMvkType   
    |   VaultLiquidateStakedMvk         of vaultLiquidateStakedMvkType   

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType

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

const minBlockTime              : nat   = Tezos.get_min_block_time();
const blocksPerMinute           : nat   = 60n / minBlockTime;
const blocksPerDay              : nat   = blocksPerMinute * 60n * 24n;                       // 2880 blocks per day -> if 2 blocks per minute 
const blocksPerYear             : nat   = blocksPerDay * 365n;

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
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.tester or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(const s : lendingControllerStorageType) : unit is
    if Tezos.get_sender() = s.admin or Tezos.get_sender() = s.tester then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED)



// Allowed Senders: Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



// Allowed Senders: Vault Factory Contract
function checkSenderIsVaultFactoryContract(var s : lendingControllerStorageType) : unit is
block{

    // Get Vault Factory Address from the General Contracts map on the Governance Contract
    const vaultFactoryAddress: address = getContractAddressFromGovernanceContract("vaultFactory", s.governanceAddress, error_VAULT_FACTORY_CONTRACT_NOT_FOUND);

    if (Tezos.get_sender() = vaultFactoryAddress) then skip
    else failwith(error_ONLY_VAULT_FACTORY_CONTRACT_ALLOWED);

} with unit



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



// helper function to check that the %updatLoanToken entrypoint is not paused
function checkUpdateLoanTokenIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.updateLoanTokenIsPaused then failwith(error_UPDATE_LOAN_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
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



// helper function to check that the %registerVaultCreation entrypoint is not paused
function checkRegisterVaultCreationIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.registerVaultCreationIsPaused then failwith(error_REGISTER_VAULT_CREATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
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

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get %vaultWithdraw entrypoint in a Vault Contract
function getVaultWithdrawEntrypoint(const vaultAddress : address) : contract(withdrawType) is
    case (Tezos.get_entrypoint_opt(
        "%withdraw",
        vaultAddress) : option(contract(withdrawType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_WITHDRAW_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND) : contract(withdrawType))
        ]



// helper function to get %onLiquidate entrypoint in a Vault Contract
function getVaultOnLiquidateEntrypoint(const vaultAddress : address) : contract(onLiquidateType) is
    case (Tezos.get_entrypoint_opt(
        "%onLiquidate",
        vaultAddress) : option(contract(onLiquidateType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_LIQUIDATE_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND) : contract(onLiquidateType))
        ]



// helper function to get %vaultDelegateTez entrypoint in a Vault Contract
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



// helper function to get %transfer entrypoint in a FA2 Token Contract
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(fa2TransferType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        tokenAddress) : option(contract(fa2TransferType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(fa2TransferType))
        ];



// helper function to get mintOrBurn entrypoint from LP Token contract
function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnType) is
    case (Tezos.get_entrypoint_opt(
        "%mintOrBurn",
        tokenContractAddress) : option(contract(mintOrBurnType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_MINT_OR_BURN_ENTRYPOINT_IN_LP_TOKEN_NOT_FOUND) : contract(mintOrBurnType))
        ]



// helper function to get updateRewards entrypoint from Token Pool Reward contract
function getUpdateRewardsEntrypointInTokenPoolRewardContract(const tokenPoolRewardAddress : address) : contract(updateRewardsActionType) is
    case (Tezos.get_entrypoint_opt(
        "%updateRewards",
        tokenPoolRewardAddress) : option(contract(updateRewardsActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UPDATE_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND) : contract(updateRewardsActionType))
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



// helper function to mint or burn LP Token
function mintOrBurnLpToken(const target : address; const quantity : int; const lpTokenAddress : address) : operation is 
block {

    const mintOrBurnParams : mintOrBurnType = record [
        quantity = quantity;
        tokenId  = 0n;          
        target   = target;
    ];

} with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(lpTokenAddress) ) )



// helper function to create new loan token record
function createLoanTokenRecord(const setLoanTokenParams : setLoanTokenActionType) : loanTokenRecordType is 
block {

    // init variables for convenience
    const tokenName                             : string        = setLoanTokenParams.tokenName;
    const tokenType                             : tokenType     = setLoanTokenParams.tokenType;
    const tokenDecimals                         : nat           = setLoanTokenParams.tokenDecimals;

    const oracleAddress                         : address        = setLoanTokenParams.oracleAddress;

    const lpTokenContractAddress                : address       = setLoanTokenParams.lpTokenContractAddress;
    const lpTokenId                             : nat           = setLoanTokenParams.lpTokenId;
    const reserveRatio                          : nat           = setLoanTokenParams.reserveRatio;

    const optimalUtilisationRate                : nat           = setLoanTokenParams.optimalUtilisationRate;
    const baseInterestRate                      : nat           = setLoanTokenParams.baseInterestRate;
    const maxInterestRate                       : nat           = setLoanTokenParams.maxInterestRate;
    const interestRateBelowOptimalUtilisation   : nat           = setLoanTokenParams.interestRateBelowOptimalUtilisation;
    const interestRateAboveOptimalUtilisation   : nat           = setLoanTokenParams.interestRateAboveOptimalUtilisation;

    const minRepaymentAmount                    : nat           = setLoanTokenParams.minRepaymentAmount;

    const newLoanTokenRecord : loanTokenRecordType = record [
                    
        tokenName                           = tokenName;
        tokenType                           = tokenType;
        tokenDecimals                       = tokenDecimals;

        oracleAddress                       = oracleAddress;

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

        minRepaymentAmount                  = minRepaymentAmount;
        isPaused                            = False;

    ];

} with newLoanTokenRecord



// helper function to create new collateral token record
function createCollateralTokenRecord(const createCollateralTokenParams : createCollateralTokenActionType) : collateralTokenRecordType is 
block {

    // init variables for convenience

    const tokenName             : string       = createCollateralTokenParams.tokenName;
    const tokenContractAddress  : address      = createCollateralTokenParams.tokenContractAddress;
    const tokenType             : tokenType    = createCollateralTokenParams.tokenType;
    const tokenDecimals         : nat          = createCollateralTokenParams.tokenDecimals;
    const oracleAddress         : address      = createCollateralTokenParams.oracleAddress;
    const protected             : bool         = createCollateralTokenParams.protected;
    
    const newCollateralTokenRecord : collateralTokenRecordType = record [
        tokenName            = tokenName;
        tokenContractAddress = tokenContractAddress;
        tokenDecimals        = tokenDecimals;

        oracleAddress        = oracleAddress;
        protected            = protected;

        tokenType            = tokenType;
    ];

} with newCollateralTokenRecord



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

        markedForLiquidationLevel   = 0n;
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
function withdrawFromVaultOperation(const tokenName : string; const amount : nat; const token : tokenType; const vaultAddress : address) : operation is
block {

    const withdrawFromVaultOperation : operation = case token of [
        
        |   Tez(_tez) -> {

                const withdrawTezOperationParams : withdrawType = record [
                    amount     = amount;
                    tokenName  = tokenName;
                ];
                
                const withdrawTezOperation : operation = Tezos.transaction(
                    withdrawTezOperationParams,
                    0mutez,
                    getVaultWithdrawEntrypoint(vaultAddress)
                );
            
            } with withdrawTezOperation

        |   Fa12(_token) -> {

                const withdrawFa12OperationParams : withdrawType = record [
                    amount     = amount;
                    tokenName  = tokenName;
                ];

                const withdrawFa12Operation : operation = Tezos.transaction(
                    withdrawFa12OperationParams,
                    0mutez,
                    getVaultWithdrawEntrypoint(vaultAddress)
                );

            } with withdrawFa12Operation

        |   Fa2(_token) -> {

                const withdrawFa2OperationParams : withdrawType = record [
                    amount     = amount;
                    tokenName  = tokenName;
                ];

                const withdrawFa2Operation : operation = Tezos.transaction(
                    withdrawFa2OperationParams,
                    0mutez,
                    getVaultWithdrawEntrypoint(vaultAddress)
                );

            } with withdrawFa2Operation
    ];

} with withdrawFromVaultOperation



// helper function liquidate from vault
function liquidateFromVaultOperation(const receiver : address; const tokenName : string; const amount : nat; const token : tokenType; const vaultAddress : address) : operation is
block {

    const liquidateFromVaultOperation : operation = case token of [
        
        |   Tez(_tez) -> {

                const liquidateTezOperationParams : onLiquidateType = record [                    
                    receiver   = receiver;
                    amount     = amount;
                    tokenName  = tokenName;
                ];
                
                const liquidateTezOperation : operation = Tezos.transaction(
                    liquidateTezOperationParams,
                    0mutez,
                    getVaultOnLiquidateEntrypoint(vaultAddress)
                );
            
            } with liquidateTezOperation

        |   Fa12(_token) -> {

                const liquidateFa12OperationParams : onLiquidateType = record [
                    receiver   = receiver;
                    amount     = amount;
                    tokenName  = tokenName;
                ];

                const liquidateFa12Operation : operation = Tezos.transaction(
                    liquidateFa12OperationParams,
                    0mutez,
                    getVaultOnLiquidateEntrypoint(vaultAddress)
                );

            } with liquidateFa12Operation

        |   Fa2(_token) -> {

                const liquidateFa2OperationParams : onLiquidateType = record [
                    receiver   = receiver;
                    amount     = amount;
                    tokenName  = tokenName;
                ];

                const liquidateFa2Operation : operation = Tezos.transaction(
                    liquidateFa2OperationParams,
                    0mutez,
                    getVaultOnLiquidateEntrypoint(vaultAddress)
                );

            } with liquidateFa2Operation
    ];

} with liquidateFromVaultOperation



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
        tokenValueRebased := tokenValueRebased * fpa10e4  
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



// helper function to calculate loan token value rebased (to max decimals 1e32)
function calculateLoanTokenValueRebased(const tokenName : string; const tokenBalance : nat; const s : lendingControllerStorageType) : nat is 
block {

    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation; // default 32 decimals i.e. 1e32

    const loanTokenRecord : loanTokenRecordType = case s.loanTokenLedger[tokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

    // get last completed round price of token from Oracle view
    const loanTokenLastCompletedRoundPrice : lastCompletedRoundPriceReturnType = getTokenLastCompletedRoundPriceFromOracle(loanTokenRecord.oracleAddress);
    
    const tokenDecimals    : nat  = loanTokenRecord.tokenDecimals; 
    const priceDecimals    : nat  = loanTokenLastCompletedRoundPrice.decimals;
    const tokenPrice       : nat  = loanTokenLastCompletedRoundPrice.price;            

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
function isUnderCollaterized(const vault : vaultRecordType; var s : lendingControllerStorageType) : (bool * lendingControllerStorageType) is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    const loanOutstandingTotal       : nat    = vault.loanOutstandingTotal;    
    const loanTokenName              : string = vault.loanToken;
    const collateralRatio            : nat    = s.config.collateralRatio;  // default 3000n: i.e. 3x - 2.25x - 2250

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.collateralBalanceLedger, s);

    s.tempMap["isUnderCollaterized - vaultCollateralValueRebased"] := vaultCollateralValueRebased;

    // calculate loan outstanding value rebased
    const loanOutstandingRebased : nat = calculateLoanTokenValueRebased(loanTokenName, loanOutstandingTotal, s);

    s.tempMap["isUnderCollaterized - loanOutstandingRebased"] := loanOutstandingRebased;

    // check is vault is under collaterized based on collateral ratio
    const isUnderCollaterized : bool = vaultCollateralValueRebased < (collateralRatio * loanOutstandingRebased) / 1000n;

    s.tempMap["isUnderCollaterized - isUnderCollaterized"] := if isUnderCollaterized then 1n else 0n;
    
} with (isUnderCollaterized, s)



// helper function to check if vault is liquidatable
function isLiquidatable(const vault : vaultRecordType; var s : lendingControllerStorageType) : (bool * lendingControllerStorageType) is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    const loanOutstandingTotal       : nat    = vault.loanOutstandingTotal;    
    const loanTokenName              : string = vault.loanToken;
    const liquidationRatio           : nat    = s.config.liquidationRatio;  // default 3000n: i.e. 3x - 2.25x - 2250

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.collateralBalanceLedger, s);

    s.tempMap["isLiquidatable - vaultCollateralValueRebased"] := vaultCollateralValueRebased;

    // calculate loan outstanding value rebased
    const loanOutstandingRebased : nat = calculateLoanTokenValueRebased(loanTokenName, loanOutstandingTotal, s);

    s.tempMap["isLiquidatable - loanOutstandingRebased"] := loanOutstandingRebased;
    s.tempMap["isLiquidatable - liquidationPoint"] := (liquidationRatio * loanOutstandingRebased) / 1000n;

    // check is vault is liquidatable based on liquidation ratio
    const isLiquidatable : bool = vaultCollateralValueRebased < (liquidationRatio * loanOutstandingRebased) / 1000n;

    s.tempMap["isLiquidatable - isLiquidatable"] := if isLiquidatable then 1n else 0n;
    
} with (isLiquidatable, s)

// ------------------------------------------------------------------------------
// Contract Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Rewards Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to create update rewards operation
function updateRewardsOperation(const userAddress : address; const loanTokenName : string; const depositorBalance : nat; const s : lendingControllerStorageType) : operation is 
block {

    // Get Token Pool Reward Address from the General Contracts map on the Governance Contract
    const tokenPoolRewardAddress: address = getContractAddressFromGovernanceContract("tokenPoolReward", s.governanceAddress, error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND);

    // update rewards params
    const updateRewardsParams : updateRewardsActionType = record [
        loanTokenName     = loanTokenName;
        userAddress       = userAddress;
        depositorBalance  = depositorBalance;
    ];

    const updateRewardsOperation : operation = Tezos.transaction(
        updateRewardsParams,
        0mutez,
        getUpdateRewardsEntrypointInTokenPoolRewardContract(tokenPoolRewardAddress)
    );

} with updateRewardsOperation

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

    // mock level for time tests (instead of using Tezos.get_level())
    const mockLevel : nat    = s.config.mockLevel;

    var exp : nat := abs(mockLevel - lastUpdatedBlockLevel); // exponent
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



// helper function to update token state
// - updates last updated block level and borrow index
function updateLoanTokenState(var loanTokenRecord : loanTokenRecordType; var s : lendingControllerStorageType) : (loanTokenRecordType * lendingControllerStorageType) is
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

    // mock level for time tests (instead of using Tezos.get_level())
    const mockLevel                 : nat    = s.config.mockLevel;

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
    

    if mockLevel > lastUpdatedBlockLevel or Tezos.get_level() > lastUpdatedBlockLevel then {

        const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel, s); // 1e27 
        borrowIndex := (borrowIndex * compoundedInterest) / fixedPointAccuracy; // 1e27 x 1e27 / 1e27 -> 1e27

        s.tempMap["updateLoanTokenState - compoundedInterest"] := compoundedInterest;
        s.tempMap["updateLoanTokenState - borrowIndex"]        := borrowIndex;

    } else skip;

    loanTokenRecord.lastUpdatedBlockLevel   := mockLevel + Tezos.get_level();
    loanTokenRecord.borrowIndex             := borrowIndex;
    loanTokenRecord.utilisationRate         := utilisationRate;
    loanTokenRecord.currentInterestRate     := currentInterestRate;

} with (loanTokenRecord, s)



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

(* vaultDepositStakedMvk  *)
function vaultDepositStakedMvk(const vaultDepositStakedMvkParams : vaultDepositStakedMvkActionType; var s: lendingControllerStorageType) : return is
block {

    var operations : list(operation) := nil;
    checkVaultDepositStakedMvkIsNotPaused(s);    // check that %vaultDepositStakedMvk entrypoint is not paused (e.g. if glass broken)
    
    // init variables for convenience
    const vaultId         : vaultIdType       = vaultDepositStakedMvkParams.vaultId;
    const depositAmount   : nat               = vaultDepositStakedMvkParams.depositAmount;
    const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
    const tokenName       : string            = "sMVK";

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // check if token (sMVK) exists in collateral token ledger
    checkCollateralTokenExists(tokenName, s);

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

    // Get vault if exists
    var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

    const onVaultDepositStakedMvkParams : onVaultDepositStakedMvkType = record [
        vaultOwner    = vaultOwner;
        vaultAddress  = vault.address;
        depositAmount = depositAmount;
    ];

    // create operation to doorman to update balance of staked MVK from user to vault
    const vaultDepositStakedMvkOperation : operation = Tezos.transaction(
        onVaultDepositStakedMvkParams,
        0tez,
        getOnVaultDepositStakedMvkEntrypoint(doormanAddress)
    );
    operations := vaultDepositStakedMvkOperation # operations;
    
    // Get current vault staked MVK balance from Doorman contract
    const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

    // calculate new collateral balance
    const newCollateralBalance : nat = currentVaultStakedMvkBalance + depositAmount;

    // save and update new balance for collateral token
    vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
    s.vaults[vaultHandle]                     := vault;

} with (operations, s)



(* vaultWithdrawStakedMvk  *)
function vaultWithdrawStakedMvk(const vaultWithdrawStakedMvkParams : vaultWithdrawStakedMvkActionType; var s: lendingControllerStorageType) : return is
block {

    var operations : list(operation) := nil;
    checkVaultWithdrawStakedMvkIsNotPaused(s);    // check that %vaultWithdrawStakedMvk entrypoint is not paused (e.g. if glass broken)
    
    // init variables for convenience
    const vaultId         : vaultIdType       = vaultWithdrawStakedMvkParams.vaultId;
    const withdrawAmount  : nat               = vaultWithdrawStakedMvkParams.withdrawAmount;
    const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
    const tokenName       : string            = "sMVK";

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // check if token (sMVK) exists in collateral token ledger
    checkCollateralTokenExists(tokenName, s);

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

    // Get vault if exists
    var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

    // Get current vault staked MVK balance from Doorman contract
    const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

    // calculate new collateral balance
    if withdrawAmount > currentVaultStakedMvkBalance then failwith(error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
    const newCollateralBalance : nat = abs(currentVaultStakedMvkBalance - withdrawAmount);

    const onVaultWithdrawStakedMvkParams : onVaultWithdrawStakedMvkType = record [
        vaultOwner     = vaultOwner;
        vaultAddress   = vault.address;
        withdrawAmount = withdrawAmount;
    ];

    // create operation to doorman to update balance of staked MVK from user to vault
    const onVaultWithdrawStakedMvkOperation : operation = Tezos.transaction(
        onVaultWithdrawStakedMvkParams,
        0tez,
        getOnVaultWithdrawStakedMvkEntrypoint(doormanAddress)
    );
    operations := onVaultWithdrawStakedMvkOperation # operations;
    
    // save and update new balance for collateral token
    vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
    s.vaults[vaultHandle]                     := vault;

} with (operations, s)



(* vaultLiquidateStakedMvk  *)
function vaultLiquidateStakedMvk(const vaultLiquidateStakedMvkParams : vaultLiquidateStakedMvkActionType; var s: lendingControllerStorageType) : return is
block {

    checkSenderIsSelf(unit);
    var operations : list(operation) := nil;
    checkVaultLiquidateStakedMvkIsNotPaused(s);    // check that %vaultLiquidateStakedMvk entrypoint is not paused (e.g. if glass broken)
    
    // init variables for convenience
    const vaultId           : vaultIdType       = vaultLiquidateStakedMvkParams.vaultId;
    const vaultOwner        : vaultOwnerType    = vaultLiquidateStakedMvkParams.vaultOwner;
    const liquidator        : address            = vaultLiquidateStakedMvkParams.liquidator;
    const liquidatedAmount  : nat               = vaultLiquidateStakedMvkParams.liquidatedAmount;
    const tokenName         : string            = "sMVK";

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // check if token (sMVK) exists in collateral token ledger
    checkCollateralTokenExists(tokenName, s);

    // Make vault handle
    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

    // Get vault if exists
    var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
    
    // Get current vault staked MVK balance from Doorman contract
    const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

    // calculate new collateral balance
    if liquidatedAmount > currentVaultStakedMvkBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
    const newCollateralBalance : nat = abs(currentVaultStakedMvkBalance - liquidatedAmount);

    const onVaultLiquidateStakedMvkParams : onVaultLiquidateStakedMvkType = record [
        vaultOwner       = vaultOwner;
        vaultAddress     = vault.address;
        liquidator       = liquidator;
        liquidatedAmount = liquidatedAmount;
    ];

    // create operation to doorman to update balance of staked MVK from user to vault
    const onVaultLiquidateStakedMvkOperation : operation = Tezos.transaction(
        onVaultLiquidateStakedMvkParams,
        0tez,
        getOnVaultLiquidateStakedMvkEntrypoint(doormanAddress)
    );
    operations := onVaultLiquidateStakedMvkOperation # operations;
    
    // save and update new balance for collateral token in liquidated vault
    vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
    s.vaults[vaultHandle]                     := vault;

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
#include "../partials/contractLambdas/lendingControllerMockTime/lendingControllerMockTimeLambdas.ligo"

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

// Some views commented out to reduce contract size of lendingControllerMockTime (which is slightly larger than lendingController)

(* View: get admin *)
// [@view] function getAdmin(const _ : unit; var s : lendingControllerStorageType) : address is
//     s.admin



(* View: get config *)
// [@view] function getConfig(const _ : unit; var s : lendingControllerStorageType) : lendingControllerConfigType is
//     s.config



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; var s : lendingControllerStorageType) : lendingControllerBreakGlassConfigType is
    s.breakGlassConfig



(* View: get Governance address *)
// [@view] function getGovernanceAddress(const _ : unit; var s : lendingControllerStorageType) : address is
//     s.governanceAddress



// (* View: get whitelist contracts *)
// [@view] function getWhitelistContracts(const _ : unit; var s : lendingControllerStorageType) : whitelistContractsType is
//     s.whitelistContracts



// (* View: get general contracts *)
// [@view] function getGeneralContracts(const _ : unit; var s : lendingControllerStorageType) : generalContractsType is
//     s.generalContracts



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
[@view] function getLoanTokenRecordOpt(const tokenName : string; const s : lendingControllerStorageType) : option(loanTokenRecordType) is
    Map.find_opt(tokenName, s.loanTokenLedger)



(* View: get loan token ledger *)
[@view] function getLoanTokenLedger(const _ : unit; const s : lendingControllerStorageType) : loanTokenLedgerType is 
    s.loanTokenLedger



(* View: get owned vaults by user *)
// [@view] function getOwnedVaultsByUserOpt(const ownerAddress : address; const s : lendingControllerStorageType) : option(ownerVaultSetType) is
//     Big_map.find_opt(ownerAddress, s.ownerLedger)



(* View: get vault by handle *)
[@view] function getVaultOpt(const vaultHandle : vaultHandleType; const s : lendingControllerStorageType) : option(vaultRecordType) is
    Big_map.find_opt(vaultHandle, s.vaults)



(* View: get token pool depositor balance *)
[@view] function getTokenPoolDepositorBalanceOpt(const userTokenNameKey : (address * string); const s : lendingControllerStorageType) : option(nat) is
    Big_map.find_opt(userTokenNameKey, s.tokenPoolDepositorLedger)


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
// Admin Entrypoints Begin
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



(* setCollateralToken entrypoint *)
function setCollateralToken(const setCollateralTokenParams : setCollateralTokenActionType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetCollateralToken"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaSetCollateralToken(setCollateralTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* registerVaultCreation entrypoint *)
function registerVaultCreation(const registerVaultCreationParams : registerVaultCreationActionType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRegisterVaultCreation"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRegisterVaultCreation(registerVaultCreationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Admin Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Entrypoints Begin
// ------------------------------------------------------------------------------

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

(* closeVault entrypoint *)
function closeVault(const closeVaultParams : closeVaultActionType ; var s : lendingControllerStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCloseVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaCloseVault(closeVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* registerDeposit entrypoint *)
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




(* registerWithdrawal entrypoint *)
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



(* markForLiquidation entrypoint *)
function markForLiquidation(const markForLiquidationParams : markForLiquidationActionType; var s : lendingControllerStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMarkForLiquidation"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaMarkForLiquidation(markForLiquidationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* liquidateVault entrypoint *)
function liquidateVault(const liquidateVaultParams : liquidateVaultActionType; var s : lendingControllerStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaLiquidateVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaLiquidateVault(liquidateVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* borrow entrypoint *)
function borrow(const borrowParams : borrowActionType; var s : lendingControllerStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBorrow"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaBorrow(borrowParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response



(* repay entrypoint *)
function repay(const repayParams : repayActionType; var s : lendingControllerStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRepay"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaRepay(repayParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Vault Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Staked MVK Entrypoints Begin
// ------------------------------------------------------------------------------

(* vaultDepositStakedMvk entrypoint *)
function vaultDepositStakedMvk(const vaultDepositStakedMvkParams : vaultDepositStakedMvkType; var s : lendingControllerStorageType) : return is 
block {
 
     const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultDepositStakedMvk"] of [
         |   Some(_v) -> _v
         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
     ];
 
     // init lending controller lambda action
     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams);
 
     // init response
     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



// (* vaultWithdrawStakedMvk entrypoint *)
function vaultWithdrawStakedMvk(const vaultWithdrawStakedMvkParams : vaultWithdrawStakedMvkType; var s : lendingControllerStorageType) : return is 
block {

     const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultWithdrawStakedMvk"] of [
         |   Some(_v) -> _v
         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
     ];

     // init lending controller lambda action
     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultWithdrawStakedMvk(vaultWithdrawStakedMvkParams);
 
     // init response
     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



// (* vaultLiquidateStakedMvk entrypoint *)
function vaultLiquidateStakedMvk(const vaultLiquidateStakedMvkParams : vaultLiquidateStakedMvkType; var s : lendingControllerStorageType) : return is 
block {


     const lambdaBytes : bytes = case s.lambdaLedger["lambdaVaultLiquidateStakedMvk"] of [
         |   Some(_v) -> _v
         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
     ];

     // init lending controller lambda action
     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultLiquidateStakedMvk(vaultLiquidateStakedMvkParams);

     // init response
     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Vault Staked MVK Entrypoints End
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
        |   UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)             -> togglePauseEntrypoint(parameters, s)

            // Admin Entrypoints
        |   SetLoanToken(parameters)                      -> setLoanToken(parameters, s)
        |   SetCollateralToken(parameters)                -> setCollateralToken(parameters, s)
        |   RegisterVaultCreation(parameters)             -> registerVaultCreation(parameters, s)

            // Token Pool Entrypoints
        |   AddLiquidity(parameters)                      -> addLiquidity(parameters, s)
        |   RemoveLiquidity(parameters)                   -> removeLiquidity(parameters, s)
        
            // Vault Entrypoints
        |   CloseVault(parameters)                        -> closeVault(parameters, s)
        |   RegisterDeposit(parameters)                   -> registerDeposit(parameters, s)
        |   RegisterWithdrawal(parameters)                -> registerWithdrawal(parameters, s)
        |   MarkForLiquidation(parameters)                -> markForLiquidation(parameters, s)
        |   LiquidateVault(parameters)                    -> liquidateVault(parameters, s)
        |   Borrow(parameters)                            -> borrow(parameters, s)
        |   Repay(parameters)                             -> repay(parameters, s)

            // Vault Staked MVK Entrypoints 
        |   VaultDepositStakedMvk(parameters)             -> vaultDepositStakedMvk(parameters, s)
        |   VaultWithdrawStakedMvk(parameters)            -> vaultWithdrawStakedMvk(parameters, s)
        |   VaultLiquidateStakedMvk(parameters)           -> vaultLiquidateStakedMvk(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)    

    ]