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

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

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
    |   VaultDepositStakedMvk           of vaultDepositStakedMvkActionType   
    |   VaultWithdrawStakedMvk          of vaultWithdrawStakedMvkActionType   

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
// const tezFixedPointAccuracy  : nat      = 1_000_000_000_000_000_000n;            // 10^18    - // for use in division with tez
const tezFixedPointAccuracy  : nat      = 1_000_000_000_000_000_000_000_000_000n;   // 10^27    - // for use in division with tez

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

const secondsInYear             : nat   = 31_536_000n;  // 365 days

const defaultTimestamp  : timestamp = ("2000-01-01T00:00:00Z" : timestamp);

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin *)
[@view] function getAdmin(const _ : unit; var s : lendingControllerStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : lendingControllerStorageType) : lendingControllerConfigType is
    s.config



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; var s : lendingControllerStorageType) : lendingControllerBreakGlassConfigType is
    s.breakGlassConfig



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : lendingControllerStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : lendingControllerStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : lendingControllerStorageType) : generalContractsType is
    s.generalContracts



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



(* View: get loan token record *)
[@view] function getLoanTokenRecordOpt(const tokenName : string; const s : lendingControllerStorageType) : option(loanTokenRecordType) is
    Map.find_opt(tokenName, s.loanTokenLedger)



(* View: get loan token ledger *)
[@view] function getLoanTokenLedger(const _ : unit; const s : lendingControllerStorageType) : loanTokenLedgerType is 
    s.loanTokenLedger



(* View: get owned vaults by user *)
[@view] function getOwnedVaultsByUserOpt(const ownerAddress : address; const s : lendingControllerStorageType) : option(ownerVaultSetType) is
    Big_map.find_opt(ownerAddress, s.ownerLedger)



(* View: get vault by handle *)
[@view] function getVaultOpt(const vaultHandle : vaultHandleType; const s : lendingControllerStorageType) : option(vaultRecordType) is
    Big_map.find_opt(vaultHandle, s.vaults)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : lendingControllerStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : lendingControllerStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
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
// Lending Controller Admin Entrypoints
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

// helper function to check that the %setCollateralToken entrypoint is not paused
function checkSetCollateralTokenIsNotPaused(var s : lendingControllerStorageType) : unit is
    if s.breakGlassConfig.setCollateralTokenIsPaused then failwith(error_SET_COLLATERAL_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED)
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



// helper function to get %onLiquidate entrypoint in a Vault Contract
function getVaultOnLiquidateEntrypoint(const vaultAddress : address) : contract(onLiquidateType) is
    case (Tezos.get_entrypoint_opt(
        "%onLiquidate",
        vaultAddress) : option(contract(onLiquidateType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_LIQUIDATE_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND) : contract(onLiquidateType))
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
        


// helper function to get mintOrBurn entrypoint from LP Token contract (FA2 Token Standard)
function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnType) is
    case (Tezos.get_entrypoint_opt(
        "%mintOrBurn",
        tokenContractAddress) : option(contract(mintOrBurnType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_MINT_OR_BURN_ENTRYPOINT_IN_LP_TOKEN_NOT_FOUND) : contract(mintOrBurnType))
        ]

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Contract Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get user staked mvk balance from Doorman contract
function getUserStakedMvkBalanceFromDoorman(const userAddress : address; const s : lendingControllerStorageType) : nat is 
block {

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // get staked MVK balance of user from Doorman contract
    const getStakedBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
    const userStakedMvkBalance : nat = case getStakedBalanceView of [
            Some (_value) -> _value
        |   None          -> failwith(error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND)
    ];

} with userStakedMvkBalance



// helper function to get user staked mvk balance from staking contract (e.g. Doorman)
function getBalanceFromStakingContract(const userAddress : address; const contractAddress : address; const s : lendingControllerStorageType) : nat is 
block {

    // get staked MVK balance of user from Doorman contract
    const getStakedBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, contractAddress);
    const userStakedMvkBalance : nat = case getStakedBalanceView of [
            Some (_value) -> _value
        |   None          -> failwith(error_GET_STAKED_BALANCE_VIEW_IN_CONTRACT_NOT_FOUND)
    ];

} with userStakedMvkBalance



// helper function to get target user balance from scaled token contract (e.g. mToken)
function getBalanceFromScaledTokenContract(const userAddress : address; const tokenContractAddress : address) : nat is 
block {

    // get balance of user from scaled token contract
    const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (userAddress, 0), tokenContractAddress);
    const scaledBalance : nat = case getBalanceView of [
            Some (_balance) -> _balance
        |   None            -> 0n
    ];

} with scaledBalance



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
function createLoanTokenRecord(const createLoanTokenParams : createLoanTokenActionType) : loanTokenRecordType is 
block {

    // init variables for convenience
    const tokenName                             : string        = createLoanTokenParams.tokenName;
    const tokenType                             : tokenType     = createLoanTokenParams.tokenType;
    const tokenDecimals                         : nat           = createLoanTokenParams.tokenDecimals;

    const oracleAddress                         : address       = createLoanTokenParams.oracleAddress;

    const lpTokenContractAddress                : address       = createLoanTokenParams.lpTokenContractAddress;
    const lpTokenId                             : nat           = createLoanTokenParams.lpTokenId;
    const reserveRatio                          : nat           = createLoanTokenParams.reserveRatio;

    const optimalUtilisationRate                : nat           = createLoanTokenParams.optimalUtilisationRate;
    const baseInterestRate                      : nat           = createLoanTokenParams.baseInterestRate;
    const maxInterestRate                       : nat           = createLoanTokenParams.maxInterestRate;
    const interestRateBelowOptimalUtilisation   : nat           = createLoanTokenParams.interestRateBelowOptimalUtilisation;
    const interestRateAboveOptimalUtilisation   : nat           = createLoanTokenParams.interestRateAboveOptimalUtilisation;

    const minRepaymentAmount                    : nat           = createLoanTokenParams.minRepaymentAmount;

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

    const isScaledToken         : bool         = createCollateralTokenParams.isScaledToken;

    // To extend functionality beyond sMVK to other staked tokens in future
    // const isStakedToken         : bool         = createCollateralTokenParams.isStakedToken;
    // const stakingContractAddress   : option(address)         = createCollateralTokenParams.stakingContractAddress;
    
    const newCollateralTokenRecord : collateralTokenRecordType = record [
        tokenName            = tokenName;
        tokenContractAddress = tokenContractAddress;
        tokenDecimals        = tokenDecimals;

        oracleAddress        = oracleAddress;
        protected            = protected;
        isScaledToken        = isScaledToken;

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
        liquidationEndLevel         = 0n;
    ];
    
} with vaultRecord



// helper function to get collateral token record reference through on-chain views
function getCollateralTokenReference(const collateralTokenName : string; const s : lendingControllerStorageType) : collateralTokenRecordType is
block {

    const collateralTokenRecordOpt : option(collateralTokenRecordType) = getColTokenRecordByNameOpt(collateralTokenName, s);
    const collateralTokenRecord : collateralTokenRecordType = case collateralTokenRecordOpt of [
            Some(_record) -> _record
        |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ]

} with collateralTokenRecord



// helper function to get collateral token record 
function getCollateralTokenRecord(const collateralTokenName : string; const s : lendingControllerStorageType) : collateralTokenRecordType is
block {

    const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[collateralTokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ];

} with collateralTokenRecord



// helper function to check collateral token exists
function checkCollateralTokenExists(const collateralTokenName : string; const s : lendingControllerStorageType) : unit is 
block {

    const collateralTokenRecordOpt : option(collateralTokenRecordType) = getColTokenRecordByNameOpt(collateralTokenName, s);
    const collateralTokenExists : unit = case collateralTokenRecordOpt of [
            Some(_record) -> unit
        |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ]

} with collateralTokenExists



// helper function to get loan token record reference through on-chain views
function getLoanTokenReference(const loanTokenName : string; const s : lendingControllerStorageType) : loanTokenRecordType is
block {

    const loanTokenRecordOpt : option(loanTokenRecordType) = getLoanTokenRecordOpt(loanTokenName, s);
    const loanTokenRecord : loanTokenRecordType = case loanTokenRecordOpt of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

} with loanTokenRecord



// helper function to get loan token record 
function getLoanTokenRecord(const loanTokenName : string; const s : lendingControllerStorageType) : loanTokenRecordType is
block {

    const loanTokenRecord : loanTokenRecordType = case s.loanTokenLedger[loanTokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

} with loanTokenRecord



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



// helper function withdraw from vault - call %withdraw in a specified Vault Contract
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



// helper function withdraw staked mvk from vault through the Doorman Contract - call %onWithdrawStakedMvk in Doorman Contract
function onWithdrawStakedMvkFromVaultOperation(const vaultOwner : address; const vaultAddress : address; const withdrawAmount : nat; const s : lendingControllerStorageType) : operation is
block {

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Create operation to Doorman contract to withdraw staked MVK from vault to user
    const onVaultWithdrawStakedMvkParams : onVaultWithdrawStakedMvkType = record [
        vaultOwner      = vaultOwner;
        vaultAddress    = vaultAddress;
        withdrawAmount  = withdrawAmount;
    ];

    const vaultWithdrawStakedMvkOperation : operation = Tezos.transaction(
        onVaultWithdrawStakedMvkParams,
        0tez,
        getOnVaultWithdrawStakedMvkEntrypoint(doormanAddress)
    );

} with vaultWithdrawStakedMvkOperation



// helper function deposit staked mvk to vault through the Doorman Contract - call %onDepositStakedMvk in Doorman Contract
function onDepositStakedMvkToVaultOperation(const vaultOwner : address; const vaultAddress : address; const depositAmount : nat; const s : lendingControllerStorageType) : operation is
block {

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Create operation to Doorman contract to deposit staked MVK from user to vault
    const onVaultDepositStakedMvkParams : onVaultDepositStakedMvkType = record [
        vaultOwner      = vaultOwner;
        vaultAddress    = vaultAddress;
        depositAmount   = depositAmount;
    ];

    const vaultDepositStakedMvkOperation : operation = Tezos.transaction(
        onVaultDepositStakedMvkParams,
        0tez,
        getOnVaultDepositStakedMvkEntrypoint(doormanAddress)
    );

} with vaultDepositStakedMvkOperation



// helper function liquidate staked mvk to vault through the Doorman Contract - call %onLiquidateStakedMvk in Doorman Contract
function onLiquidateStakedMvkFromVaultOperation(const vaultAddress : address; const liquidator : address; const liquidatedAmount : nat; const s : lendingControllerStorageType) : operation is
block {

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Create operation to Doorman contract to liquidate staked MVK from vault to liquidator
    const onVaultLiquidateStakedMvkParams : onVaultLiquidateStakedMvkType = record [
        vaultAddress        = vaultAddress;
        liquidator          = liquidator;
        liquidatedAmount    = liquidatedAmount;
    ];

    const vaultLiquidateStakedMvkOperation : operation = Tezos.transaction(
        onVaultLiquidateStakedMvkParams,
        0tez,
        getOnVaultLiquidateStakedMvkEntrypoint(doormanAddress)
    );

} with vaultLiquidateStakedMvkOperation



// helper function liquidate collateral from vault - call %onLiquidate in a specified Vault Contract
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

    if rebaseDecimals = 0n then 
        skip
    else if rebaseDecimals = 1n then 
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



// helper function to get token last completed data from aggregator
function getTokenLastCompletedDataFromAggregator(const aggregatorAddress : address) : lastCompletedDataReturnType is 
block {

    // get last completed round price of token from Oracle view
    const getTokenLastCompletedDataView : option (lastCompletedDataReturnType) = Tezos.call_view ("getlastCompletedData", unit, aggregatorAddress);
    const tokenLastCompletedData : lastCompletedDataReturnType = case getTokenLastCompletedDataView of [
            Some (_value) -> _value
        |   None          -> failwith (error_GET_LAST_COMPLETED_DATA_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND)
    ];

} with tokenLastCompletedData



// helper function to calculate collateral token value rebased (to max decimals 1e32)
function calculateCollateralTokenValueRebased(const collateralTokenName : string; const tokenBalance : nat; const s : lendingControllerStorageType) : nat is 
block {

    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation; // default 32 decimals i.e. 1e32

    // get collateral token reference using on-chain views
    const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(collateralTokenName, s);

    // get last completed round price of token from Aggregator view
    const collateralTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(collateralTokenRecord.oracleAddress);
    
    const tokenDecimals    : nat  = collateralTokenRecord.tokenDecimals; 
    const priceDecimals    : nat  = collateralTokenLastCompletedData.decimals;
    const tokenPrice       : nat  = collateralTokenLastCompletedData.data;            

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
function calculateLoanTokenValueRebased(const loanTokenName : string; const tokenBalance : nat; const s : lendingControllerStorageType) : nat is 
block {

    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation; // default 32 decimals i.e. 1e32

    // get loan token record reference using on-chain views
    const loanTokenRecord : loanTokenRecordType = getLoanTokenReference(loanTokenName, s);

    // get last completed round price of token from Oracle view
    const loanTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(loanTokenRecord.oracleAddress);
    
    const tokenDecimals    : nat  = loanTokenRecord.tokenDecimals; 
    const priceDecimals    : nat  = loanTokenLastCompletedData.decimals;
    const tokenPrice       : nat  = loanTokenLastCompletedData.data;            

    // calculate required number of decimals to rebase each token to the same unit for comparison
    // assuming most token decimals are 6, and most price decimals from oracle is 8 - (upper limit of 32 decimals)
    if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
    const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

    // calculate raw value of collateral balance
    const tokenValueRaw : nat = tokenBalance * tokenPrice;

    // rebase token value to 1e32 (or 10^32)
    const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);                

} with tokenValueRebased



// helper function to calculate loan token value (without rebasing)
function calculateLoanTokenValue(const loanTokenName : string; const tokenBalance : nat; const s : lendingControllerStorageType) : nat is 
block {

    // get loan token record reference using on-chain views
    const loanTokenRecord : loanTokenRecordType = getLoanTokenReference(loanTokenName, s);

    // get last completed round price of token from Oracle view
    const loanTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(loanTokenRecord.oracleAddress);
    const tokenPrice       : nat  = loanTokenLastCompletedData.data;            

    // calculate raw value of collateral balance
    const tokenValueRaw : nat = tokenBalance * tokenPrice;

} with tokenValueRaw



// helper function for simple multiplication of token amount by price
function multiplyTokenAmountByPrice(const tokenAmount : nat; const tokenPrice : nat) : nat is tokenAmount * tokenPrice



// helper function to calculate vault's collateral value rebased (to max decimals 1e32)
function calculateVaultCollateralValueRebased(const vaultAddress : address; const collateralBalanceLedger : collateralBalanceLedgerType; const s : lendingControllerStorageType) : nat is
block {

    var vaultCollateralValueRebased  : nat := 0n;

    for collateralTokenName -> collateralTokenBalance in map collateralBalanceLedger block {

        // init final token balance
        var finalTokenBalance  : nat := collateralTokenBalance;

        // get collateral token reference using on-chain views
        const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(collateralTokenName, s);

        // check if collateral token is sMVK or a scaled token (e.g. mToken) - get balance from doorman contract and token contract address respectively
        if collateralTokenName = "smvk" then {

            finalTokenBalance := getUserStakedMvkBalanceFromDoorman(vaultAddress, s);

        } else if collateralTokenRecord.isScaledToken then {

            // get updated scaled token balance (e.g. mToken)
            finalTokenBalance := getBalanceFromScaledTokenContract(vaultAddress, collateralTokenRecord.tokenContractAddress);
        
        } else skip;

        // get collateral token value based on oracle/aggregator's price and rebase to 1e32 (or 10^32) for comparison
        const tokenValueRebased : nat = calculateCollateralTokenValueRebased(collateralTokenName, finalTokenBalance, s);

        // increment vault collateral value (decimals: 1e32 or 10^32)
        vaultCollateralValueRebased := vaultCollateralValueRebased + tokenValueRebased;      

    };

} with vaultCollateralValueRebased



// helper function to check if vault is under collaterized
function isUnderCollaterized(const vault : vaultRecordType; var s : lendingControllerStorageType) : bool is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    const loanOutstandingTotal       : nat    = vault.loanOutstandingTotal;    
    const loanTokenName              : string = vault.loanToken;
    const collateralRatio            : nat    = s.config.collateralRatio;  // default 3000n: i.e. 3x - 2.25x - 2250

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.address, vault.collateralBalanceLedger, s);

    // calculate loan outstanding value rebased
    const loanOutstandingRebased : nat = calculateLoanTokenValueRebased(loanTokenName, loanOutstandingTotal, s);

    // check is vault is under collaterized based on collateral ratio
    const isUnderCollaterized : bool = vaultCollateralValueRebased < (collateralRatio * loanOutstandingRebased) / 1000n;
    
} with isUnderCollaterized



// helper function to check if vault is liquidatable
function isLiquidatable(const vault : vaultRecordType; var s : lendingControllerStorageType) : bool is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    const loanOutstandingTotal       : nat    = vault.loanOutstandingTotal;    
    const loanTokenName              : string = vault.loanToken;
    const liquidationRatio           : nat    = s.config.liquidationRatio;  // default 3000n: i.e. 3x - 2.25x - 2250

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.address, vault.collateralBalanceLedger, s);

    // calculate loan outstanding value rebased
    const loanOutstandingRebased : nat = calculateLoanTokenValueRebased(loanTokenName, loanOutstandingTotal, s);

    // check is vault is liquidatable based on liquidation ratio
    const isLiquidatable : bool = vaultCollateralValueRebased < (liquidationRatio * loanOutstandingRebased) / 1000n;
    
} with isLiquidatable

// ------------------------------------------------------------------------------
// Contract Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to calculate compounded interest
function calculateCompoundedInterest(const interestRate : nat; const lastUpdatedBlockLevel : nat) : nat is
block{

    (* From AAVE:
    *
    * To avoid expensive exponentiation, the calculation is performed using a binomial approximation:
    *
    *  (1+x)^n = 1+n*x + [n/2*(n-1)]*x^2 + [n/6*(n-1)*(n-2)*x^3 ...
    *
    *  The approximation slightly underpays liquidity providers and undercharges borrowers, with the advantage of great
    *  gas cost reductions. The whitepaper contains reference to the approximation and a table showing the margin of
    *  error per different time periods
    *
    *)

    var exp : nat := abs(Tezos.get_level() - lastUpdatedBlockLevel); // exponent
    exp := exp * Tezos.get_min_block_time(); // number of seconds
    
    const interestRateOverSecondsInYear : nat = ((interestRate * fixedPointAccuracy) / secondsInYear) / fixedPointAccuracy; // 1e27 * 1e27 / const / 1e27 -> 1e27

    var compoundedInterest : nat := 0n;

    if exp > 0n then {

        const expMinusOne : nat = abs(exp - 1n);
        const expMinusTwo : nat = if exp > 2n then abs(exp - 2n) else 0n;

        const basePowerTwo : nat = ((interestRateOverSecondsInYear * interestRateOverSecondsInYear) / fixedPointAccuracy) / (secondsInYear * secondsInYear); 
        const basePowerThree : nat = ((basePowerTwo * interestRateOverSecondsInYear) / fixedPointAccuracy) / secondsInYear;

        const secondTerm : nat = (exp * expMinusOne * basePowerTwo) / 2n;
        const thirdTerm : nat = (exp * expMinusOne * expMinusTwo * basePowerThree) / 6n;

        compoundedInterest := fixedPointAccuracy + (interestRateOverSecondsInYear * exp) + secondTerm + thirdTerm;

    } else skip;
   
} with (compoundedInterest)



// helper function to update token state
// - updates last updated block level and borrow index
function updateLoanTokenState(var loanTokenRecord : loanTokenRecordType) : loanTokenRecordType is
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

    if tokenPoolTotal > 0n then {
        // calculate utilisation rate - total debt borrowed / token pool total
        const utilisationRate : nat = (totalBorrowed * fixedPointAccuracy) / tokenPoolTotal;  // utilisation rate, or ratio of debt to total amount -> (1e6 * 1e27 / 1e6) -> 1e27

        // if total borrowed is greater than 0
        if totalBorrowed > 0n then {

            // Calculations based on AAVE's variable borrow rate calculation: https://github.com/aave/aave-protocol/blob/master/docs/Aave_Protocol_Whitepaper_v1_0.pdf

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

        } else skip;
        

        if Tezos.get_level() > lastUpdatedBlockLevel then {

            const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel); // 1e27 
            borrowIndex := (borrowIndex * compoundedInterest) / fixedPointAccuracy; // 1e27 x 1e27 / 1e27 -> 1e27

        } else skip;

        loanTokenRecord.lastUpdatedBlockLevel   := Tezos.get_level();
        loanTokenRecord.borrowIndex             := borrowIndex;
        loanTokenRecord.utilisationRate         := utilisationRate;
        loanTokenRecord.currentInterestRate     := currentInterestRate;
    } else skip;

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
// Liquidate Vault Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check correct duration has passed after being marked for liquidation
function checkMarkedVaultLiquidationDuration(const vault : vaultRecordType; const s : lendingControllerStorageType) : unit is
block {

    // Init variables and get level when vault can be liquidated
    const blocksPerMinute                : nat  = 60n / Tezos.get_min_block_time();
    const liquidationDelayInMins         : nat  = s.config.liquidationDelayInMins;
    const liquidationDelayInBlockLevel   : nat  = liquidationDelayInMins * blocksPerMinute; 
    const levelWhenVaultCanBeLiquidated  : nat  = vault.markedForLiquidationLevel + liquidationDelayInBlockLevel;

    // Check if sufficient time has passed since vault was marked for liquidation
    if Tezos.get_level() < levelWhenVaultCanBeLiquidated
    then failwith(error_VAULT_IS_NOT_READY_TO_BE_LIQUIDATED)
    else skip;

} with (unit)



// helper function to check that vault is still within window of opportunity for liquidation to occur
function checkVaultInLiquidationWindow(const vault : vaultRecordType) : unit is
block {

    // Get level when vault can no longer be liquidated 
    const vaultLiquidationEndLevel : nat = vault.liquidationEndLevel;

    // Check if current block level has exceeded vault liquidation end level
    if Tezos.get_level() > vaultLiquidationEndLevel
    then failwith(error_VAULT_NEEDS_TO_BE_MARKED_FOR_LIQUIDATION_AGAIN)
    else skip;

} with (unit)



// helper function to calculate the ratio used in the collateral token amount receive calculation
function calculateCollateralPriceAdjustmentRatio(const loanToken : (nat*nat); const collateralToken : (nat*nat)) : nat is
block {

    // Init variables
    const loanTokenDecimals                     : nat = loanToken.0;
    const loanTokenPriceDecimals                : nat = loanToken.1;
    const tokenDecimals                         : nat = collateralToken.0;
    const priceDecimals                         : nat = collateralToken.1;

    // calculate exponents
    const tokenDecimalsMultiplyExponent         : nat = if tokenDecimals > loanTokenDecimals then abs(tokenDecimals - loanTokenDecimals) else 0n;
    const tokenDecimalsDivideExponent           : nat = if tokenDecimals < loanTokenDecimals then abs(loanTokenDecimals - tokenDecimals) else 0n;
    
    const priceTokenDecimalsMultiplyExponent    : nat = if priceDecimals > loanTokenPriceDecimals then abs(priceDecimals - loanTokenPriceDecimals) else 0n;
    const priceTokenDecimalsDivideExponent      : nat = if priceDecimals < loanTokenPriceDecimals then abs(loanTokenPriceDecimals - priceDecimals) else 0n;

    // multiple exponents by 10^exp
    // e.g. if tokenDecimalsMultiplyExponent is 3, then tokenDecimalsMultiplyDifference = 1 * 1000 = 1000;
    const tokenDecimalsMultiplyDifference       : nat = rebaseTokenValue(1n, tokenDecimalsMultiplyExponent);
    const tokenDecimalsDivideDifference         : nat = rebaseTokenValue(1n, tokenDecimalsDivideExponent);
    
    const priceTokenDecimalsMultiplyDifference  : nat = rebaseTokenValue(1n, priceTokenDecimalsMultiplyExponent);
    const priceTokenDecimalsDivideDifference    : nat = rebaseTokenValue(1n, priceTokenDecimalsDivideExponent);
    
    // ratio used in liquidator and treasury token amount calculation
    const collateralTokenPriceAdjustmentRatio   : nat = (tokenDecimalsMultiplyDifference * priceTokenDecimalsMultiplyDifference) / (tokenDecimalsDivideDifference * priceTokenDecimalsDivideDifference);

} with (collateralTokenPriceAdjustmentRatio)



// helper function to calculate the collateral token proportion received during a liquidation
function calculateCollateralTokenProportion(const collateralToken : collateralTokenRecordType; const collateralTokenLastCompletedData : lastCompletedDataReturnType; const collateralTokenBalance : nat; const vaultCollateralValueRebased : nat; const s : lendingControllerStorageType) : nat is
block {

    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation; // default 32 decimals i.e. 1e32
    
    const tokenDecimals             : nat  = collateralToken.tokenDecimals; 
    const priceDecimals             : nat  = collateralTokenLastCompletedData.decimals;
    const tokenPrice                : nat  = collateralTokenLastCompletedData.data;

    // Calculate required number of decimals to rebase each token to the same unit for comparison                        
    if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
    const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

    // Calculate raw value of collateral balance
    const tokenValueRaw : nat = collateralTokenBalance * tokenPrice;

    // rebase token value to 1e32 (or 10^32)
    const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);

    // get proportion of collateral token balance against total vault's collateral value
    const tokenProportion : nat = (tokenValueRebased * fixedPointAccuracy) / vaultCollateralValueRebased;

} with (tokenProportion)



// helper function to calculate the collateral token amount received during a liquidation
function calculateCollateralAmountReceived(const loanTokenPrice : nat; const tokenPrice : nat; const tokenProportion : nat; const collateralTokenPriceAdjustmentRatio : nat; const liquidationFeeAmount : nat) : nat is
block {

    // get value to be extracted and sent to liquidator (1e27 * token decimals e.g. 1e6 => 1e33)
    const tokenProportionalAmount           : nat = tokenProportion * liquidationFeeAmount;

    // multiply amount by loan token price - with on chain view to get loan token price from aggregator
    const tokenProportionalValue            : nat = multiplyTokenAmountByPrice(tokenProportionalAmount, loanTokenPrice);

    // adjust value by token decimals difference - no change if all decimals are the same (e.g. value * 1 * 1 / (1 * 1) )
    const tokenProportionalValueAdjusted    : nat = tokenProportionalValue * collateralTokenPriceAdjustmentRatio;

    // get quantity of tokens to be liquidated (final decimals should equal collateral token decimals)
    const tokenQuantityTotal                : nat = (tokenProportionalValueAdjusted / tokenPrice) / fixedPointAccuracy;

} with (tokenQuantityTotal)



// helper function to process transfer operations for the one collateral token
function processLiquidationCollateralTransferOperations(const collateralToken : collateralTokenRecordType; const vaultAddress : address; const liquidator : (address*nat); const treasury : (address*nat); var operations : list(operation); const s : lendingControllerStorageType) : list(operation) is
block {

    // Init variables
    const collateralTokenName   : string      = collateralToken.tokenName;
    const collateralTokenType   : tokenType   = collateralToken.tokenType;
    const liquidatorAddress     : address     = liquidator.0;
    const liquidatorTokenAmount : nat         = liquidator.1;
    const treasuryAddress       : address     = treasury.0;
    const treasuryTokenAmount   : nat         = treasury.1;

    // Transfer operations
    if collateralTokenName = "smvk" then {

        // use %onVaultLiquidateStakedMvk entrypoint in Doorman Contract to transfer staked MVK balances

        // send staked mvk from vault to liquidator
        const sendStakedMvkFromVaultToLiquidatorOperation : operation = onLiquidateStakedMvkFromVaultOperation(
            vaultAddress,                       // vault address
            liquidatorAddress,                  // liquidator              
            liquidatorTokenAmount,              // liquidated amount
            s                                   // storage
        );                

        operations := sendStakedMvkFromVaultToLiquidatorOperation # operations;

        // send staked mvk from vault to treasury
        const sendStakedMvkFromVaultToTreasuryOperation : operation = onLiquidateStakedMvkFromVaultOperation(
            vaultAddress,                       // vault address
            treasuryAddress,                    // liquidator              
            treasuryTokenAmount,                // liquidated amount
            s                                   // storage
        );                

        operations := sendStakedMvkFromVaultToTreasuryOperation # operations;

    } else {

        // use standard token transfer operations

        // send tokens from vault to liquidator
        const sendTokensFromVaultToLiquidatorOperation : operation = liquidateFromVaultOperation(
            liquidatorAddress,                  // receiver (i.e. to_)
            collateralTokenName,                // token name
            liquidatorTokenAmount,              // token amount to be withdrawn
            collateralTokenType,                // token type (i.e. tez, fa12, fa2) 
            vaultAddress                        // vault address
        );
        operations := sendTokensFromVaultToLiquidatorOperation # operations;

        // send tokens from vault to treasury
        const sendTokensFromVaultToTreasuryOperation : operation = liquidateFromVaultOperation(
            treasuryAddress,                    // receiver (i.e. to_)
            collateralTokenName,                // token name
            treasuryTokenAmount,                // token amount to be withdrawn
            collateralTokenType,                // token type (i.e. tez, fa12, fa2) 
            vaultAddress                        // vault address
        );
        operations := sendTokensFromVaultToTreasuryOperation # operations;

    };

} with(operations)



// helper function to calculate the ratio used in the collateral token amount receive calculation
function processCollateralTokenLiquidation(const liquidatorAddress : address; const treasuryAddress : address; const loanTokenDecimals : nat; const loanTokenLastCompletedData : lastCompletedDataReturnType; const vaultAddress : address; const vaultCollateralValueRebased; const collateralTokenName : string; const collateralTokenBalance : nat; const liquidationAmount : nat; var operations : list(operation); const s : lendingControllerStorageType) : list(operation) * nat is
block {

    // get collateral token record through on-chain view
    const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(collateralTokenName, s);

    // get last completed data of token from Aggregator view
    const collateralTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(collateralTokenRecord.oracleAddress);

    // init variables
    const loanTokenPrice            : nat = loanTokenLastCompletedData.data;
    const loanTokenPriceDecimals    : nat = loanTokenLastCompletedData.decimals;
    const tokenDecimals             : nat = collateralTokenRecord.tokenDecimals;
    const tokenPrice                : nat = collateralTokenLastCompletedData.data;
    const priceDecimals             : nat = collateralTokenLastCompletedData.decimals;

    // if token is sMVK, get latest balance from Doorman Contract through on-chain views
    // - may differ from token balance if rewards have been claimed 
    // - requires a call to %compound on doorman contract to compound rewards for the vault and get the latest balance
    var   collateralTokenBalance    : nat := 
        // get vault staked balance from doorman contract (includes unclaimed exit fee rewards, does not include satellite rewards)
        // - for better accuracy, there should be a frontend call to compound rewards for the vault first
        if collateralTokenName = "smvk" then getUserStakedMvkBalanceFromDoorman(vaultAddress, s)
        // get updated scaled token balance (e.g. mToken)
        else if collateralTokenRecord.isScaledToken then getBalanceFromScaledTokenContract(vaultAddress, collateralTokenRecord.tokenContractAddress)
        else collateralTokenBalance;

    // get proportion of collateral token balance against total vault's collateral value
    const tokenProportion : nat = calculateCollateralTokenProportion(collateralTokenRecord, collateralTokenLastCompletedData, collateralTokenBalance, vaultCollateralValueRebased, s);

    // ------------------------------------------------------------------
    // Rebase decimals for calculation
    //  - account for exponent (decimal) differences between collateral and loan token decimals
    //  - account for exponent (decimal) differences between collateral price and loan token price decimals from aggregators
    // ------------------------------------------------------------------

    // ratio used in liquidator and treasury token amount calculation
    const collateralTokenPriceAdjustmentRatio   : nat = calculateCollateralPriceAdjustmentRatio(
        (loanTokenDecimals, loanTokenPriceDecimals),
        (tokenDecimals, priceDecimals)
    );

    // ------------------------------------------------------------------
    // Calculate Liquidator's Amount 
    // ------------------------------------------------------------------

    const liquidationFeePercent         : nat   = s.config.liquidationFeePercent;       // liquidation fee - penalty fee paid by vault owner to liquidator 
    const liquidationIncentive          : nat   = ((liquidationFeePercent * liquidationAmount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;
    const liquidatorAmountAndIncentive  : nat   = liquidationAmount + liquidationIncentive;
    const liquidatorTokenQuantityTotal : nat    = calculateCollateralAmountReceived(
        loanTokenPrice,
        tokenPrice,
        tokenProportion,
        collateralTokenPriceAdjustmentRatio,
        liquidatorAmountAndIncentive
    ); 
    
    // Calculate new collateral balance
    if liquidatorTokenQuantityTotal > collateralTokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
    var newCollateralTokenBalance : nat := abs(collateralTokenBalance - liquidatorTokenQuantityTotal);

    // ------------------------------------------------------------------
    // Calculate Treasury's Amount 
    // ------------------------------------------------------------------

    // calculate final amounts to be liquidated
    const adminLiquidationFeePercent    : nat   = s.config.adminLiquidationFeePercent;  // admin liquidation fee - penalty fee paid by vault owner to treasury
    const adminLiquidationFee           : nat   = ((adminLiquidationFeePercent * liquidationAmount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;
    const treasuryTokenQuantityTotal    : nat   = calculateCollateralAmountReceived(
        loanTokenPrice,
        tokenPrice,
        tokenProportion,
        collateralTokenPriceAdjustmentRatio,
        adminLiquidationFee
    ); 

    // Calculate new collateral balance
    if treasuryTokenQuantityTotal > newCollateralTokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
    newCollateralTokenBalance := abs(newCollateralTokenBalance - treasuryTokenQuantityTotal);

    // ------------------------------------------------------------------
    // Process liquidation transfer of collateral token
    // ------------------------------------------------------------------
    
    operations  := processLiquidationCollateralTransferOperations(
        collateralTokenRecord,
        vaultAddress,
        (liquidatorAddress, liquidatorTokenQuantityTotal),
        (treasuryAddress, treasuryTokenQuantityTotal),
        operations,
        s
    );

} with (operations, newCollateralTokenBalance)

// ------------------------------------------------------------------------------
// Liquidate Vault Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Helper Functions Begin
// ------------------------------------------------------------------------------

function updateVaultState(const vaultHandle : vaultHandleType; var s : lendingControllerStorageType) : (vaultRecordType*loanTokenRecordType) is
block {

    // get vault
    var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

    // ------------------------------------------------------------------
    // Update Loan Token state and get token borrow index
    // ------------------------------------------------------------------

    // Get current vault borrow index, and vault loan token name
    var vaultBorrowIndex      : nat := vault.borrowIndex;
    const vaultLoanTokenName  : string = vault.loanToken; // USDT, EURL, some other crypto coin

    // Get loan token record
    var loanTokenRecord : loanTokenRecordType := getLoanTokenRecord(vaultLoanTokenName, s);
                
    // Update Loan Token State: Latest utilisation rate, current interest rate, compounded interest and borrow index
    loanTokenRecord := updateLoanTokenState(loanTokenRecord);
    
    // Get loan token parameters
    const tokenBorrowIndex  : nat = loanTokenRecord.borrowIndex;

    // ------------------------------------------------------------------
    // Accrue interest to vault oustanding
    // ------------------------------------------------------------------

    // Get current user loan outstanding and init new total variables
    const currentLoanOutstandingTotal  : nat = vault.loanOutstandingTotal;
    const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;
    var newLoanOutstandingTotal        : nat := currentLoanOutstandingTotal;
    var newLoanInterestTotal           : nat := vault.loanInterestTotal;

    // Calculate interest
    newLoanOutstandingTotal := accrueInterestToVault(
        currentLoanOutstandingTotal,
        vaultBorrowIndex,
        tokenBorrowIndex
    );

    if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
    newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

    // ------------------------------------------------------------------
    // Update storage
    // ------------------------------------------------------------------

    vault.loanOutstandingTotal                := newLoanOutstandingTotal;
    vault.loanInterestTotal                   := newLoanInterestTotal;
    vault.borrowIndex                         := tokenBorrowIndex;
    vault.lastUpdatedBlockLevel               := Tezos.get_level();
    vault.lastUpdatedTimestamp                := Tezos.get_now();

} with(vault, loanTokenRecord)

// ------------------------------------------------------------------------------
// Vault Helper Functions Begin
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
// function updateMetadata(const updateMetadataParams : updateMetadataType; var s : lendingControllerStorageType) : return is
// block {

//     const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
//         |   Some(_v) -> _v
//         |   None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // init vault controller lambda action
//     const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

//     // init response
//     const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);

// } with response



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
function closeVault(const closeVaultParams : closeVaultActionType; var s : lendingControllerStorageType) : return is 
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
function vaultDepositStakedMvk(const vaultDepositStakedMvkParams : vaultDepositStakedMvkActionType; var s : lendingControllerStorageType) : return is 
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
function vaultWithdrawStakedMvk(const vaultWithdrawStakedMvkParams : vaultWithdrawStakedMvkActionType; var s : lendingControllerStorageType) : return is 
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

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)    

    ]