// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Aggregator Types - for lastCompletedRoundPriceReturnType
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Doorman Types
// #include "../partials/contractTypes/doormanTypes.ligo"

// Vault Types
// #include "../partials/contractTypes/vaultTypes.ligo"

// Token Pool Types
// #include "../partials/contractTypes/tokenPoolTypes.ligo"

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
    |   UpdateCollateralTokenLedger     of updateCollateralTokenLedgerActionType

        // Break Glass Entrypoints
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of lendingControllerTogglePauseEntrypointType

        // Token Pool Entrypoints
    |   SetLoanToken                    of setLoanTokenActionType
    |   AddLiquidity                    of addLiquidityActionType
    |   RemoveLiquidity                 of removeLiquidityActionType 

        // Vault Entrypoints
    |   CreateVault                     of createVaultActionType
    |   CloseVault                      of closeVaultActionType
    |   WithdrawFromVault               of withdrawFromVaultActionType
    |   RegisterDeposit                 of registerDepositType
    |   LiquidateVault                  of liquidateVaultActionType
    |   Borrow                          of borrowActionType
    |   Repay                           of repayActionType

        // Vault Staked MVK Entrypoints   
    |   VaultDepositStakedMvk           of vaultDepositStakedMvkType   
    |   VaultWithdrawStakedMvk          of vaultWithdrawStakedMvkType   
    |   VaultLiquidateStakedMvk         of vaultLiquidateStakedMvkType   

        // Lambda Entrypoints
    |   SetLambda                         of setLambdaType

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
const fixedPointAccuracy     : nat      = 1_000_000_000_000_000_000_000_000n;   // 10^24     - // for use in division
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

const fpa10e15 : nat = 1_000_000_000_000_000n;           // 10^15
const fpa10e14 : nat = 1_000_000_000_000_00n;            // 10^14
const fpa10e13 : nat = 1_000_000_000_000_0n;             // 10^13
const fpa10e12 : nat = 1_000_000_000_000n;               // 10^12
const fpa10e11 : nat = 1_000_000_000_00n;                // 10^11
const fpa10e10 : nat = 1_000_000_000_0n;                 // 10^10
const fpa10e9 : nat = 1_000_000_000n;                    // 10^9
const fpa10e8 : nat = 1_000_000_00n;                     // 10^8
const fpa10e7 : nat = 1_000_000_0n;                      // 10^7
const fpa10e6 : nat = 1_000_000n;                        // 10^6
const fpa10e5 : nat = 1_000_00n;                         // 10^5
const fpa10e4 : nat = 1_000_0n;                          // 10^4
const fpa10e3 : nat = 1_000n;                            // 10^3

const minBlockTime              : nat   = Tezos.get_min_block_time();
const blocksPerMinute           : nat   = 60n / minBlockTime;
const blocksPerDay              : nat   = blocksPerMinute * 60n * 24n;                       // 2880 blocks per day -> if 2 blocks per minute 
const blocksPerYear             : nat   = blocksPerDay * 365n;

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
  else failwith("Error. Loan Outstanding is not zero.")

// ------------------------------------------------------------------------------
// Misc Helper Functions Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get %vaultWithdraw entrypoint in a Vault Contract
function getVaultWithdrawEntrypoint(const vaultAddress : address) : contract(vaultWithdrawType) is
    case (Tezos.get_entrypoint_opt(
        "%vaultWithdraw",
        vaultAddress) : option(contract(vaultWithdrawType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. VaultWithdraw entrypoint in vault not found") : contract(vaultWithdrawType))
        ]



// helper function to get %vaultDelegateTez entrypoint in a Vault Contract
function getVaultDelegateTezEntrypoint(const vaultAddress : address) : contract(vaultDelegateTezToBakerType) is
    case (Tezos.get_entrypoint_opt(
        "%vaultDelegateTezToBaker",
        vaultAddress) : option(contract(vaultDelegateTezToBakerType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. vaultDelegateTezToBaker entrypoint in vault not found") : contract(vaultDelegateTezToBakerType))
        ]



// helper function to get %vaultDepositStakedMvk entrypoint in Doorman Contract
function getVaultDepositStakedMvkEntrypoint(const contractAddress : address) : contract(vaultDepositStakedMvkType) is
    case (Tezos.get_entrypoint_opt(
        "%vaultDepositStakedMvk",
        contractAddress) : option(contract(vaultDepositStakedMvkType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. vaultDepositStakedMvk entrypoint in contract not found") : contract(vaultDepositStakedMvkType))
        ]



// helper function to get vaultWithdrawStakedMvk entrypoint from doorman contract
function getVaultWithdrawStakedMvkEntrypoint(const contractAddress : address) : contract(vaultWithdrawStakedMvkType) is
    case (Tezos.get_entrypoint_opt(
        "%vaultWithdrawStakedMvk",
        contractAddress) : option(contract(vaultWithdrawStakedMvkType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. vaultWithdrawStakedMvk entrypoint in contract not found") : contract(vaultWithdrawStakedMvkType))
        ]



// helper function to get %vaultLiquidateStakedMvk entrypoint from Doorman Contract
function getVaultLiquidateStakedMvkEntrypoint(const contractAddress : address) : contract(vaultLiquidateStakedMvkType) is
    case (Tezos.get_entrypoint_opt(
        "%vaultLiquidateStakedMvk",
        contractAddress) : option(contract(vaultLiquidateStakedMvkType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. vaultLiquidateStakedMvk entrypoint in contract not found") : contract(vaultLiquidateStakedMvkType))
        ]


// helper function to send %transfer operation in Token Pool Contract
function getTransferEntrypointInTokenPoolContract(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to get %transfer entrypoint in a FA2 Token Contract
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(fa2TransferType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        tokenAddress) : option(contract(fa2TransferType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(fa2TransferType))
        ];



// helper function to get %borrowCallback entrypoint in Vault Controller Contract
function getBorrowCallbackEntrypointInlendingControllerContract(const contractAddress : address) : contract(vaultCallbackActionType) is
    case (Tezos.get_entrypoint_opt(
        "%borrowCallback",
        contractAddress) : option(contract(vaultCallbackActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_BORROW_CALLBACK_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(vaultCallbackActionType))
        ];




// helper function to get %repayCallback entrypoint in Vault Controller Contract
function getRepayCallbackEntrypointInlendingControllerContract(const contractAddress : address) : contract(vaultCallbackActionType) is
    case (Tezos.get_entrypoint_opt(
        "%repayCallback",
        contractAddress) : option(contract(vaultCallbackActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REPAY_CALLBACK_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(vaultCallbackActionType))
        ];



// helper function to get %updateTokenPoolCallback entrypoint in Token Pool Contract
// function getUpdateTokenPoolCallbackEntrypoint(const contractAddress : address) : contract(updateTokenPoolCallbackActionType) is
//     case (Tezos.get_entrypoint_opt(
//         "%updateTokenPoolCallback",
//         contractAddress) : option(contract(updateTokenPoolCallbackActionType))) of [
//                 Some(contr) -> contr
//             |   None -> (failwith(error_ON_BORROW_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(updateTokenPoolCallbackActionType))
//         ];


// helper function to get %onBorrow entrypoint in Token Pool Contract
// function getOnBorrowEntrypointInTokenPoolContract(const contractAddress : address) : contract(onBorrowActionType) is
//     case (Tezos.get_entrypoint_opt(
//         "%onBorrow",
//         contractAddress) : option(contract(onBorrowActionType))) of [
//                 Some(contr) -> contr
//             |   None -> (failwith(error_ON_BORROW_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(onBorrowActionType))
//         ];



// helper function to get %onRepay entrypoint in Token Pool Contract
// function getOnRepayEntrypointInTokenPoolContract(const contractAddress : address) : contract(onRepayActionType) is
//     case (Tezos.get_entrypoint_opt(
//         "%onRepay",
//         contractAddress) : option(contract(onRepayActionType))) of [
//                 Some(contr) -> contr
//             |   None -> (failwith(error_ON_REPAY_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(onRepayActionType))
//         ];



// helper function to get %updateRewards entrypoint in Token Pool Contract
function getUpdateRewardsEntrypointInTokenPoolRewardContract(const contractAddress : address) : contract(updateRewardsActionType) is
    case (Tezos.get_entrypoint_opt(
        "%updateRewards",
        contractAddress) : option(contract(updateRewardsActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UPDATE_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(updateRewardsActionType))
        ];



// helper function to get mintOrBurn entrypoint from LQT contract
function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
    case (Tezos.get_entrypoint_opt(
        "%mintOrBurn",
        tokenContractAddress) : option(contract(mintOrBurnParamsType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. MintOrBurn entrypoint in LP Token contract not found") : contract(mintOrBurnParamsType))
        ]

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Contract Helper Functions Begin
// ------------------------------------------------------------------------------

function mintOrBurnLpToken(const target : address; const quantity : int; const lpTokenAddress : address) : operation is 
block {

    const mintOrBurnParams : mintOrBurnParamsType = record [
        quantity = quantity;
        target   = target;
    ];

} with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(lpTokenAddress) ) )




function checkInCollateralTokenLedger(const collateralTokenRecord : collateralTokenRecordType; var s : lendingControllerStorageType) : bool is 
block {
  
  var inCollateralTokenLedgerBool : bool := False;
  for _key -> value in map s.collateralTokenLedger block {
    if collateralTokenRecord = value then inCollateralTokenLedgerBool := True
    else skip;
  }  

} with inCollateralTokenLedgerBool



// helper function to get vault
function getVault(const handle : vaultHandleType; var s : lendingControllerStorageType) : vaultRecordType is 
block {
    var vault : vaultRecordType := case s.vaults[handle] of [
            Some(_vault) -> _vault
        |   None -> failwith("Error. Vault not found.")
    ];
} with vault



// helper function to check if vault is under collaterized
function isUnderCollaterized(const vault : vaultRecordType; var s : lendingControllerStorageType) : bool is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    var vaultCollateralValueInUsd   : nat  := 0n;
    const loanOutstandingTotal      : nat  = vault.loanOutstandingTotal;    
    const liquidationRatio          : nat  = s.config.liquidationRatio;  // default 3000n: i.e. 3x - 2.25x - 2250

    for tokenName -> tokenBalance in map vault.collateralBalanceLedger block {
        
        const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                Some(_record) -> _record
            | None -> failwith("Error. Token does not exist in collateral token record.")
        ];

        // get last completed round price of token from Oracle view
        const getTokenLastCompletedRoundPriceView : option (option(lastCompletedRoundPriceReturnType)) = Tezos.call_view ("lastCompletedRoundPrice", unit, collateralTokenRecord.oracleAddress);
        const getTokenLastCompletedRoundPriceOpt: option(lastCompletedRoundPriceReturnType) = case getTokenLastCompletedRoundPriceView of [
                Some (_value) -> _value
            | None -> failwith ("Error. lastCompletedRoundPrice View not found in the Oracle Contract.")
        ];
        const tokenLastCompletedRoundPrice: lastCompletedRoundPriceReturnType = case getTokenLastCompletedRoundPriceOpt of [
                Some (_value) -> _value
            | None -> failwith ("Error. lastCompletedRoundPrice not found.")
        ];

        // todo: check decimals and percentOracleResponse
        // todo: ensure exponent is standardized
        // denomination in USD 
        
        const tokenDecimals    : nat  = collateralTokenRecord.decimals; 
        const priceDecimals    : nat  = tokenLastCompletedRoundPrice.decimals;

        // calculate required number of decimals to rebase each token to the same unit for comparison
        // assuming most token decimals are 6, and most price decimals from oracle is 8 - set upper limit of 24 (e.g. 12 decimals each)
        if tokenDecimals + priceDecimals > 24n then failwith("Error. Too many decimals for token * price.") else skip;
        const rebaseDecimals   : nat  = abs(24n - (tokenDecimals + priceDecimals));

        const tokenPrice       : nat  = tokenLastCompletedRoundPrice.price;            

        // calculate value of collateral balance
        var tokenValueInUsd : nat := tokenBalance * tokenPrice;

        if rebaseDecimals = 1n then 
            tokenValueInUsd := tokenValueInUsd * 10n
        else if rebaseDecimals = 2n then 
            tokenValueInUsd := tokenValueInUsd * 100n 
        else if rebaseDecimals = 3n then 
            tokenValueInUsd := tokenValueInUsd * 1000n 
        else if rebaseDecimals = 4n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e4 
        else if rebaseDecimals = 5n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e5
        else if rebaseDecimals = 6n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e6
        else if rebaseDecimals = 7n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e7
        else if rebaseDecimals = 8n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e8
        else if rebaseDecimals = 9n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e9
        else if rebaseDecimals = 10n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e10
        else if rebaseDecimals = 11n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e11
        else if rebaseDecimals = 12n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e12
        else if rebaseDecimals = 13n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e13
        else if rebaseDecimals = 14n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e14
        else if rebaseDecimals = 15n then 
            tokenValueInUsd := tokenValueInUsd * fpa10e15
        else skip;
            
        // increment vault collateral value - value should have a base decimal of 1e24
        vaultCollateralValueInUsd := vaultCollateralValueInUsd + tokenValueInUsd;

    };

    // loanOutstanding will be 1e9 (token decimals), so multiply by 1e15 to have a base of 1e24
    const loanOutstandingRebased : nat = loanOutstandingTotal * fpa10e15; 

    // check is vault is under collaterized based on liquidation ratio
    const isUnderCollaterized : bool = vaultCollateralValueInUsd < (liquidationRatio * loanOutstandingRebased) / 1000n;
    
    // old code
    // const isUnderCollaterized : bool  = (15n * vault.collateralBalance) < (Bitwise.shift_right (vault.loanOutstanding * s.target, 44n)); 

} with isUnderCollaterized

// ------------------------------------------------------------------------------
// Contract Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Rewards Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update rewards
function updateRewards(const userAddress : address; const tokenName : string; var s : lendingControllerStorageType) : lendingControllerStorageType is
block{

        // Steps Overview:

        // Check if user is recorded in the Rewards Ledger
        if Big_map.mem((userAddress, tokenName), s.rewardsLedger) then {

            // Get user's rewards record
            var userRewardsRecord : rewardsRecordType := case Big_map.find_opt((userAddress, tokenName), s.rewardsLedger) of [
                    Some (_record) -> _record
                |   None           -> failwith(error_TOKEN_POOL_REWARDS_RECORD_NOT_FOUND)
            ];
            var userRewardsPerShare : nat := userRewardsRecord.rewardsPerShare;            

            // Get user depositor record for token (i.e. liquidity provided for token)
            const depositorKey : (address * string) = (userAddress, tokenName);
            var depositorAmount : nat := case Big_map.find_opt(depositorKey, s.depositorLedger) of [
                    Some(_record) -> _record
                |   None          -> failwith(error_DEPOSITOR_RECORD_NOT_FOUND)
            ];

            // Get token record
            const tokenRecord : loanTokenRecordType  = case Big_map.find_opt(tokenName, s.loanTokenLedger) of [
                    Some (_tokenRecord) -> _tokenRecord
                |   None                -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
            ];

            const tokenAccumulatedRewardsPerShare : nat = tokenRecord.accumulatedRewardsPerShare;            

            // Calculate new unclaimed rewards
            // - calculate rewards ratio: difference between token's accumulatedRewardsPerShare and user's current rewardsPerShare
            // - user's new rewards is equal to his deposited liquitity amount multiplied by rewards ratio
            
            const rewardsRatioDifference : nat  = abs(tokenAccumulatedRewardsPerShare - userRewardsPerShare);
            const newRewards : nat              = (depositorAmount * rewardsRatioDifference) / fixedPointAccuracy;

            // Update user's rewards record 
            // - set rewardsPerShare to token's accumulatedRewardsPerShare
            // - increment user's unpaid rewards by the calculated rewards

            userRewardsRecord.rewardsPerShare       := tokenAccumulatedRewardsPerShare;
            userRewardsRecord.unpaid                := userRewardsRecord.unpaid + newRewards;
            s.rewardsLedger[(userAddress, tokenName)]            := userRewardsRecord;

        } else skip;

} with (s)

// ------------------------------------------------------------------------------
// Rewards Helper Functions End
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
    *  (1+x)^n = 1+n*x+[n/2*(n-1)]*x^2+[n/6*(n-1)*(n-2)*x^3...
    *
    * The approximation slightly underpays liquidity providers and undercharges borrowers, with the advantage of great
    * gas cost reductions. The whitepaper contains reference to the approximation and a table showing the margin of
    * error per different time periods
    *)

    const exp : nat = abs(Tezos.get_level() - lastUpdatedBlockLevel);

    var compoundedInterest : nat := 0n;

    if exp =/= 0n then {

        const expMinusOne : nat = abs(exp - 1n);
        const expMinusTwo : nat = if exp > 2n then abs(exp - 2n) else 0n;

        const basePowerTwo : nat = (interestRate * fixedPointAccuracy) / (blocksPerYear * blocksPerYear);
        const basePowerThree : nat = (basePowerTwo * interestRate) / blocksPerYear;

        const secondTerm : nat = (exp * expMinusOne * basePowerTwo) / 2n;
        const thirdTerm : nat = (exp * expMinusOne * expMinusTwo * basePowerThree) / 6n;

        compoundedInterest := (((interestRate * exp * fixedPointAccuracy) / blocksPerYear) + secondTerm + thirdTerm) / fixedPointAccuracy;

    } else skip;
   
} with (compoundedInterest)



// helper function to get normalized debt
function getNormalizedDebt(const tokenName : string; var s : lendingControllerStorageType) : nat is
block{

    (** From AAVE: 
    * 
    * @notice Returns the ongoing normalized variable debt for the reserve.
    * @dev A value of 1e27 means there is no debt. As time passes, the debt is accrued
    * @dev A value of 2*1e27 means that for each unit of debt, one unit worth of interest has been accumulated
    * @param reserve The reserve object
    * @return The normalized variable debt, expressed in ray
    **)

    // Get token record
    var tokenRecord : loanTokenRecordType := case Big_map.find_opt(tokenName, s.loanTokenLedger) of [
            Some (_tokenRecord) -> _tokenRecord
        |   None                -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

    const lastUpdatedBlockLevel : nat = tokenRecord.lastUpdatedBlockLevel; 

    // init variables
    var accumulatedRewardsPerShare : nat := tokenRecord.accumulatedRewardsPerShare;

    if Tezos.get_level() = lastUpdatedBlockLevel then skip else {

        const lastUpdatedBlockLevel : nat = tokenRecord.lastUpdatedBlockLevel;
        const currentInterestRate : nat = tokenRecord.currentInterestRate;

        const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel);
        accumulatedRewardsPerShare := (accumulatedRewardsPerShare * compoundedInterest) / fixedPointAccuracy;

    };

    tokenRecord.accumulatedRewardsPerShare := accumulatedRewardsPerShare;
    s.loanTokenLedger[tokenName] := tokenRecord;

} with (accumulatedRewardsPerShare)



// helper function to update token state
function updateTokenState(const tokenName : string; var s : lendingControllerStorageType) : lendingControllerStorageType is
block{

    // get token record
    var tokenRecord : loanTokenRecordType := case Big_map.find_opt(tokenName, s.loanTokenLedger) of [
            Some (_tokenRecord) -> _tokenRecord
        |   None                -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

    const lastUpdatedBlockLevel : nat = tokenRecord.lastUpdatedBlockLevel;

    // init variables
    var borrowIndex : nat := tokenRecord.borrowIndex;

    if Tezos.get_level() = lastUpdatedBlockLevel then skip else {

        const lastUpdatedBlockLevel  : nat = tokenRecord.lastUpdatedBlockLevel;
        const currentInterestRate    : nat = tokenRecord.currentInterestRate;

        const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel);
        borrowIndex := (borrowIndex * compoundedInterest) / fixedPointAccuracy;

    };

    tokenRecord.borrowIndex := borrowIndex;
    s.loanTokenLedger[tokenName] := tokenRecord;

} with (s)



// helper function to updateInterestRate
function updateInterestRate(const tokenName : string; var s : lendingControllerStorageType) : lendingControllerStorageType is
block {

    // get token record
    var tokenRecord : loanTokenRecordType := case Big_map.find_opt(tokenName, s.loanTokenLedger) of [
            Some (_tokenRecord) -> _tokenRecord
        |   None                -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

    // init params
    const tokenPoolTotal            : nat = tokenRecord.tokenPoolTotal;
    const totalBorrowed             : nat = tokenRecord.totalBorrowed;
    // const totalRemaining            : nat = tokenRecord.totalRemaining;
    const optimalUtilisationRate    : nat = tokenRecord.optimalUtilisationRate;

    const baseInterestRate                      : nat = tokenRecord.baseInterestRate;                    // r0
    const interestRateBelowOptimalUtilisation   : nat = tokenRecord.interestRateBelowOptimalUtilisation; // r1
    const interestRateAboveOptimalUtilisation   : nat = tokenRecord.interestRateAboveOptimalUtilisation; // r2

    var currentInterestRate         : nat := tokenRecord.currentInterestRate;

    // if total borrowed is greater than 0
    if totalBorrowed =/= 0n then {

        // calculate utilisation rate - total debt borrowed / token pool total
        const utilisationRate : nat = (totalBorrowed * fixedPointAccuracy) / tokenPoolTotal;  /// utilisation rate, or ratio of debt to total amount

        if utilisationRate > optimalUtilisationRate then {

            // utilisation rate is above optimal rate

            const firstTerm : nat = baseInterestRate;
            const secondTerm : nat = interestRateBelowOptimalUtilisation;
            
            const utilisationRateSubOptimalRate : nat = abs(utilisationRate - optimalUtilisationRate);
            const coefficientDenominator : nat = abs(fpa10e9 - optimalUtilisationRate); // possible change: using interest rate to 1e9
            const thirdTerm : nat = (((utilisationRateSubOptimalRate * fixedPointAccuracy) / coefficientDenominator) / fixedPointAccuracy) * interestRateAboveOptimalUtilisation;

            currentInterestRate := firstTerm + secondTerm + thirdTerm;

        } else {

            // utilisation rate is below optimal rate

            const firstTerm : nat = baseInterestRate;

            const secondTermCoefficient : nat = ((utilisationRate * fixedPointAccuracy) / optimalUtilisationRate) / fixedPointAccuracy;
            const secondTerm : nat = secondTermCoefficient * interestRateBelowOptimalUtilisation;

            currentInterestRate := firstTerm + secondTerm;

        };

        // update storage
        tokenRecord.currentInterestRate := currentInterestRate;
        s.loanTokenLedger[tokenName] := tokenRecord;

    } else skip;
    
} with (s)


// ------------------------------------------------------------------------------
// Token Pool Helper Functions End
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
[@view] function viewGetTokenRecordByName(const tokenName : string; var s : lendingControllerStorageType) : option(collateralTokenRecordType) is
    Map.find_opt(tokenName, s.collateralTokenLedger)



(* View: get token by token contract address in collateral token ledger *)
[@view] function viewGetTokenRecordByAddress(const tokenContractAddress : address; var s : lendingControllerStorageType) : option(collateralTokenRecordType) is
block {

  var tokenName : string := "empty";
  
  for _key -> value in map s.collateralTokenLedger block {
    if tokenContractAddress = value.tokenContractAddress then block {
        tokenName := _key;
    } else skip;
  };

  const collateralTokenRecord : option(collateralTokenRecordType) = Map.find_opt(tokenName, s.collateralTokenLedger)

} with collateralTokenRecord



(* View: get owned vaults by user *)
[@view] function getOwnedVaultsByUserOpt(const ownerAddress : address; var s : lendingControllerStorageType) : option(ownerVaultSetType) is
    Big_map.find_opt(ownerAddress, s.ownerLedger)



(* View: get vault by handle *)
[@view] function getVaultOpt(const vaultHandle : vaultHandleType; var s : lendingControllerStorageType) : option(vaultRecordType) is
    Big_map.find_opt(vaultHandle, s.vaults)



(* View: get contract address - e.g. find delegation address to pass to vault for delegating MVK to satellite  *)
[@view] function getContractAddressOpt(const contractName : string; var s : lendingControllerStorageType) : option(address) is
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



(* UpdateCollateralTokenLedger Entrypoint *)
function updateCollateralTokenLedger(const updateCollateralTokenLedgerParams: updateCollateralTokenLedgerActionType; var s : lendingControllerStorageType) : return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCollateralTokenLedger"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaUpdateCollateralTokens(updateCollateralTokenLedgerParams);

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

(* createVault entrypoint *)
function createVault(const createVaultParams : createVaultActionType ; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaCreateVault(createVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



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




(* withdrawFromVault entrypoint *)
function withdrawFromVault(const withdrawFromVaultParams : withdrawFromVaultActionType; var s : lendingControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawFromVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaWithdrawFromVault(withdrawFromVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response




(* registerDeposit entrypoint *)
function registerDeposit(const registerDepositParams : registerDepositType; var s : lendingControllerStorageType) : return is 
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

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDepositStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const lendingControllerLambdaAction : lendingControllerLambdaActionType = LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, lendingControllerLambdaAction, s);  
    
} with response



(* vaultWithdrawStakedMvk entrypoint *)
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



(* vaultLiquidateStakedMvk entrypoint *)
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
        |   UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)
        |   UpdateCollateralTokenLedger(parameters)       -> updateCollateralTokenLedger(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)             -> togglePauseEntrypoint(parameters, s)

            // Token Pool Entrypoints
        |   SetLoanToken(parameters)                      -> setLoanToken(parameters, s)
        |   AddLiquidity(parameters)                      -> addLiquidity(parameters, s)
        |   RemoveLiquidity(parameters)                   -> removeLiquidity(parameters, s)
        
            // Vault Entrypoints
        |   CreateVault(parameters)                       -> createVault(parameters, s)
        |   CloseVault(parameters)                        -> closeVault(parameters, s)
        |   RegisterDeposit(parameters)                   -> registerDeposit(parameters, s)
        |   WithdrawFromVault(parameters)                 -> withdrawFromVault(parameters, s)
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