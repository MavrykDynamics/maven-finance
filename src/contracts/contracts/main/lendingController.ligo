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
    |   UpdateCollateralToken           of updateCollateralTokenActionType
    |   CreateVault                     of createVaultActionType
    |   CloseVault                      of closeVaultActionType
    |   RegisterDeposit                 of registerDepositActionType
    |   RegisterWithdrawal              of registerWithdrawalActionType
    |   LiquidateVault                  of liquidateVaultActionType
    |   Borrow                          of borrowActionType
    |   Repay                           of repayActionType

        // Vault Staked MVK Entrypoints   
    |   VaultDepositStakedMvk           of vaultDepositStakedMvkType   
    |   VaultWithdrawStakedMvk          of vaultWithdrawStakedMvkType   
    |   VaultLiquidateStakedMvk         of vaultLiquidateStakedMvkType   

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
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get %vaultWithdraw entrypoint in a Vault Contract
function getVaultWithdrawEntrypoint(const vaultAddress : address) : contract(vaultWithdrawType) is
    case (Tezos.get_entrypoint_opt(
        "%vaultWithdraw",
        vaultAddress) : option(contract(vaultWithdrawType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_VAULT_WITHDRAW_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND) : contract(vaultWithdrawType))
        ]



// helper function to get %vaultDelegateTez entrypoint in a Vault Contract
function getVaultDelegateTezEntrypoint(const vaultAddress : address) : contract(vaultDelegateTezToBakerType) is
    case (Tezos.get_entrypoint_opt(
        "%vaultDelegateTezToBaker",
        vaultAddress) : option(contract(vaultDelegateTezToBakerType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_VAULT_DELEGATE_TEZ_TO_BAKER_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND) : contract(vaultDelegateTezToBakerType))
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
    const decimals                              : nat           = setLoanTokenParams.decimals;

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
        decimals                            = decimals;

        lpTokensTotal                       = 0n;
        lpTokenContractAddress              = lpTokenContractAddress;
        lpTokenId                           = lpTokenId;

        reserveRatio                        = reserveRatio;
        tokenPoolTotal                      = 0n;
        totalBorrowed                       = 0n;
        totalRemaining                      = 0n;

        utilisationRate                     = 0n;
        optimalUtilisationRate              = optimalUtilisationRate;
        baseInterestRate                    = baseInterestRate;
        maxInterestRate                     = maxInterestRate;
        interestRateBelowOptimalUtilisation = interestRateBelowOptimalUtilisation;
        interestRateAboveOptimalUtilisation = interestRateAboveOptimalUtilisation;

        currentInterestRate                 = 0n;
        lastUpdatedBlockLevel               = Tezos.get_level();
        accumulatedRewardsPerShare          = 0n;
        borrowIndex                         = 0n;

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
    ];
    
} with vaultRecord



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



// helper function for transfers related to token pool (from/to)
function tokenPoolTransfer(const from_ : address; const to_ : address; const amount : nat; const token : tokenType) : operation is
block {

    const tokenPoolTransferOperation : operation = case token of [
        
        |   Tez(_tez) -> {

                const transferTezOperation : operation = transferTez( (Tezos.get_contract_with_error(Tezos.get_self_address(), "Error. Unable to send tez.") : contract(unit)), amount * 1mutez );
            
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

                const withdrawTezOperationParams : vaultWithdrawType = record [
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

                const withdrawFa12OperationParams : vaultWithdrawType = record [
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

                const withdrawFa2OperationParams : vaultWithdrawType = record [
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
    
    const tokenDecimals    : nat  = collateralTokenRecord.decimals; 
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
    const liquidationRatio           : nat  = s.config.liquidationRatio;  // default 3000n: i.e. 3x - 2.25x - 2250
    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation;

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.collateralBalanceLedger, s);

    // calculate loan outstanding rebase decimals (difference from max decimals 1e32)
    const loanOutstandingRebaseDecimals : nat = abs(maxDecimalsForCalculation - loanDecimals);

    // calculate loan outstanding rebased (1e32 or 10^32)
    // todo: rebase EUR, Tez, to USD 
    const loanOutstandingRebased : nat = rebaseTokenValue(loanOutstandingTotal, loanOutstandingRebaseDecimals);  

    // check is vault is under collaterized based on liquidation ratio
    const isUnderCollaterized : bool = vaultCollateralValueRebased < (liquidationRatio * loanOutstandingRebased) / 1000n;
    
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
    *  The approximation slightly underpays liquidity providers and undercharges borrowers, with the advantage of great
    *  gas cost reductions. The whitepaper contains reference to the approximation and a table showing the margin of
    *  error per different time periods
    *
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
[@view] function getColTokenRecordByNameOpt(const tokenName : string; var s : lendingControllerStorageType) : option(collateralTokenRecordType) is
    Map.find_opt(tokenName, s.collateralTokenLedger)



(* View: get token by token contract address in collateral token ledger *)
[@view] function getColTokenRecordByAddressOpt(const tokenContractAddress : address; var s : lendingControllerStorageType) : option(collateralTokenRecordType) is
block {

    var tokenName : string := "empty";
    for _key -> value in map s.collateralTokenLedger block {
        
        // case value.tokenType of [
        //     |   Tez(_tez)    -> tokenName := "tez"
        //     |   Fa12(_token) -> if tokenContractAddress = _token then tokenName := _key else skip
        //     |   Fa2(_token)  -> if tokenContractAddress = _token.tokenContractAddress then tokenName := _key else skip
        // ];
        
        // if value.tokenContractAddress = tokenContractAddress then tokenName := _key else skip;
        
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

(* updateCollateralToken entrypoint *)
function updateCollateralToken(const updateCollateralTokenParams : updateCollateralTokenActionType ; var s : lendingControllerStorageType) : return is 
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
        |   UpdateCollateralToken(parameters)             -> updateCollateralToken(parameters, s)
        |   CreateVault(parameters)                       -> createVault(parameters, s)
        |   CloseVault(parameters)                        -> closeVault(parameters, s)
        |   RegisterDeposit(parameters)                   -> registerDeposit(parameters, s)
        |   RegisterWithdrawal(parameters)                -> registerWithdrawal(parameters, s)
        |   LiquidateVault(parameters)                    -> liquidateVault(parameters, s)
        |   Borrow(parameters)                            -> borrow(parameters, s)
        |   Repay(parameters)                             -> repay(parameters, s)

            // Vault Staked MVK Entrypoints   
        |   VaultDepositStakedMvk(parameters)             -> vaultDepositStakedMvk(parameters, s)
        |   VaultWithdrawStakedMvk(parameters)            -> vaultWithdrawStakedMvk(parameters, s)
        |   VaultLiquidateStakedMvk(parameters)           -> vaultLiquidateStakedMvk(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)    
        |   SetProductLambda(parameters)                  -> setProductLambda(parameters, s)    

    ]