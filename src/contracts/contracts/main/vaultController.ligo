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
#include "../partials/contractTypes/doormanTypes.ligo"

// Vault Types
#include "../partials/contractTypes/vaultNewTypes.ligo"

// Token Pool Types
#include "../partials/contractTypes/tokenPoolTypes.ligo"

// Vault Controller Types
#include "../partials/contractTypes/vaultControllerTypes.ligo"

// ------------------------------------------------------------------------------

// helper function to create vault 
type createVaultFuncType is (option(key_hash) * tez * vaultStorage) -> (operation * address)
const createVaultFunc : createVaultFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/u_vault.tz"
        ;
          PAIR } |}
: createVaultFuncType)];

type vaultControllerAction is 

    |   Default of unit
        
        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of vaultControllerUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsParams
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsParams
    |   UpdateCollateralTokenLedger     of updateCollateralTokenLedgerActionType

        // Break Glass Entrypoints
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of vaultControllerTogglePauseEntrypointType

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

const noOperations : list (operation) = nil;
type return is list (operation) * vaultControllerStorage


// vaultController contract methods lambdas
type vaultControllerUnpackLambdaFunctionType is (vaultControllerLambdaActionType * vaultControllerStorageType) -> return


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

// Allowed Senders: Admin
function checkSenderIsAdmin(const s : vaultControllerStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);

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
function checkZeroLoanOutstanding(const vault : vaultType) : unit is
  if vault.loanOutstanding = 0n then unit
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


// helper function to send transfer operation to Token Pool
function getTransferEntrypointInTokenPoolContract(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to get transfer entrypoint
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(fa2TransferType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        tokenAddress) : option(contract(fa2TransferType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(fa2TransferType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Contract Helper Functions Begin
// ------------------------------------------------------------------------------

function checkInCollateralTokenLedger(const collateralTokenRecord : collateralTokenRecordType; var s : vaultControllerStorage) : bool is 
block {
  
  var inCollateralTokenLedgerBool : bool := False;
  for _key -> value in map s.collateralTokenLedger block {
    if collateralTokenRecord = value then inCollateralTokenLedgerBool := True
    else skip;
  }  

} with inCollateralTokenLedgerBool



// helper function to get vault
function getVault(const handle : vaultHandleType; var s : vaultControllerStorage) : vaultType is 
block {
    var vault : vaultType := case s.vaults[handle] of [
            Some(_vault) -> _vault
        |   None -> failwith("Error. Vault not found.")
    ];
} with vault



// helper function to check if vault is under collaterized
function isUnderCollaterized(const vault : vaultType; var s : vaultControllerStorage) : bool is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    var vaultCollateralValueInUsd   : nat  := 0n;
    const loanOutstanding           : nat  = vault.loanOutstanding;    
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
    const loanOutstandingRebased : nat = loanOutstanding * fpa10e15; 

    // check is vault is under collaterized based on liquidation ratio
    const isUnderCollaterized : bool = vaultCollateralValueInUsd < (liquidationRatio * loanOutstandingRebased) / 1000n;
    
    // old code
    // const isUnderCollaterized : bool  = (15n * vault.collateralBalance) < (Bitwise.shift_right (vault.loanOutstanding * s.target, 44n)); 

} with isUnderCollaterized

// ------------------------------------------------------------------------------
// Contract Helper Functions End
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
#include "../partials/contractLambdas/vaultController/vaultControllerLambdas.ligo"

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
[@view] function viewGetTokenRecordByName(const tokenName : string; var s : vaultControllerStorage) : option(collateralTokenRecordType) is
    Map.find_opt(tokenName, s.collateralTokenLedger)



(* View: get token by token contract address in collateral token ledger *)
[@view] function viewGetTokenRecordByAddress(const tokenContractAddress : address; var s : vaultControllerStorage) : option(collateralTokenRecordType) is
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
[@view] function getOwnedVaultsByUserOpt(const ownerAddress : address; var s : vaultControllerStorage) : option(ownerVaultSetType) is
    Big_map.find_opt(ownerAddress, s.ownerLedger)



(* View: get vault by handle *)
[@view] function getVaultOpt(const vaultHandle : vaultHandleType; var s : vaultControllerStorage) : option(vaultType) is
    Big_map.find_opt(vaultHandle, s.vaults)



(* View: get contract address - e.g. find delegation address to pass to vault for delegating MVK to satellite  *)
[@view] function getContractAddressOpt(const contractName : string; var s : vaultControllerStorage) : option(address) is
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
function setAdmin(const newAdminAddress : address; var s : vaultControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
    
    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : vaultControllerStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : vaultControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : vaultControllerStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : vaultControllerStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : vaultControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : vaultControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  

} with response



(* UpdateCollateralTokenLedger Entrypoint *)
function updateCollateralTokenLedger(const updateCollateralTokenLedgerParams: updateCollateralTokenLedgerActionType; var s : vaultControllerStorage) : return is 
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCollateralTokenLedger"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaUpdateCollateralTokens(updateCollateralTokenLedgerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  

} with response


// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : vaultControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : vaultControllerStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : delegationTogglePauseEntrypointType; const s : vaultControllerStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Entrypoints Begin
// ------------------------------------------------------------------------------

(* createVault entrypoint *)
function createVault(const createVaultParams : createVaultActionType ; var s : vaultControllerStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCreateVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaCreateVault(createVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  
    
} with response



(* closeVault entrypoint *)
function closeVault(const closeVaultParams : closeVaultActionType ; var s : vaultControllerStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCloseVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaCloseVault(closeVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  
    
} with response




(* withdrawFromVault entrypoint *)
function withdrawFromVault(const withdrawFromVaultParams : withdrawFromVaultActionType; var s : vaultControllerStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawFromVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaWithdrawVault(withdrawFromVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  
    
} with response




(* registerDeposit entrypoint *)
function registerDeposit(const registerDepositParams : registerDepositType; var s : vaultControllerStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRegisterDeposit"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaRegisterDeposit(registerDepositParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  
    
} with response




(* liquidateVault entrypoint *)
function liquidateVault(const liquidateVaultParams : liquidateVaultActionType; var s : vaultControllerStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaLiquidateVault"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaLiquidateVault(liquidateVaultParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  
    
} with response



(* borrow entrypoint *)
function borrow(const borrowParams : borrowActionType; var s : vaultControllerStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBorrow"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaBorrow(borrowParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  

} with response



(* repay entrypoint *)
function repay(const repayParams : repayActionType; var s : vaultControllerStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRepay"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaRepay(repayParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Vault Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Staked MVK Entrypoints Begin
// ------------------------------------------------------------------------------

(* vaultDepositStakedMvk entrypoint *)
function vaultDepositStakedMvk(const vaultDepositStakedMvkParams : vaultDepositStakedMvkType; var s : vaultControllerStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDepositStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaDepositStakedMvk(vaultDepositStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  
    
} with response



(* vaultWithdrawStakedMvk entrypoint *)
function vaultWithdrawStakedMvk(const vaultWithdrawStakedMvkParams : vaultWithdrawStakedMvkType; var s : vaultControllerStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaWithdrawStakedMvk(vaultWithdrawStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  
    
} with response



(* vaultLiquidateStakedMvk entrypoint *)
function vaultLiquidateStakedMvk(const vaultLiquidateStakedMvkParams : vaultLiquidateStakedMvkType; var s : vaultControllerStorage) : return is 
block {


    const lambdaBytes : bytes = case s.lambdaLedger["lambdaLiquidateStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init vault controller lambda action
    const vaultControllerLambdaAction : vaultControllerLambdaActionType = LambdaLiquidateStakedMvk(vaultLiquidateStakedMvkParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, vaultControllerLambdaAction, s);  
    
} with response

// ------------------------------------------------------------------------------
// Vault Staked MVK Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : vaultControllerAction; const s : vaultControllerStorage) : return is 
    case action of [

        |   Default(_params) -> ((nil : list(operation)), s)
        
            // Housekeeping Entrypoints
            SetAdmin(parameters)                          -> setAdmin(parameters, s) 
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

    ]