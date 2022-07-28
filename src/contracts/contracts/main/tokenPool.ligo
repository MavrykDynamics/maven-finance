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

// Token Pool Types
#include "../partials/contractTypes/tokenPoolTypes.ligo"

// ------------------------------------------------------------------------------


type tokenPoolAction is 

        // Housekeeping Entrypoints    
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of vaultControllerUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsParams
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsParams

        // BreakGlass Entrypoints   
    |   PauseAll                        of (unit)
    |   UnpauseAll                      of (unit)
    |   TogglePauseEntrypoint           of tokenPoolTogglePauseEntrypointType

        // Token Pool Entrypoints
    |   AddLiquidity                    of addLiquidityActionType
    |   RemoveLiquidity                 of removeLiquidityActionType 

        // Lending Entrypoints
    |   OnBorrow                        of onBorrowActionType
    |   OnRepay                         of onRepayActionType

        // Misc Entrypoints
    |   Transfer                        of transferActionType

const noOperations : list (operation) = nil;
type return is list (operation) * tokenPoolStorageType


// tokenPool contract methods lambdas
type tokenPoolUnpackLambdaFunctionType is (tokenPoolLambdaActionType * tokenPoolStorageTypeType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const zeroAddress           : address   = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);
const fixedPointAccuracy    : nat       = 1_000_000_000_000_000_000_000_000n // 10^24 - // for use in division
const constFee              : nat       = 9995n;  // 0.05% fee
const constFeeDenom         : nat       = 10000n;
const fpa10e9 : nat = 1_000_000_000n;                    // 10^9

const minBlockTime              : nat   = Tezos.min_block_time();
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

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : tokenPoolStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Vault Controller Contract
function checkSenderIsVaultControllerContract(var s : tokenPoolStorageTypeType) : unit is
block{

    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "vaultController", s.governanceAddress);
    const vaultControllerAddress : address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_VAULT_CONTROLLER_CONTRACT_NOT_FOUND)
            ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    if (Tezos.get_sender() = vaultControllerAddress) then skip
    else failwith(error_ONLY_VAULT_CONTROLLER_CONTRACT_ALLOWED);

} with unit



// helper function to get mintOrBurn entrypoint from LQT contract
function getLpTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnParamsType) is
    case (Tezos.get_entrypoint_opt(
        "%mintOrBurn",
        tokenContractAddress) : option(contract(mintOrBurnParamsType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. MintOrBurn entrypoint in LP Token contract not found") : contract(mintOrBurnParamsType))
        ]



// helper function to send %transfer operation in Token Pool Reward Contract
function getTransferEntrypointInTokenPoolRewardContract(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



function mintOrBurnLpToken(const target : address; const quantity : int; const lpTokenAddress : address; var s : tokenPoolStorageType) : operation is 
block {

    const mintOrBurnParams : mintOrBurnParamsType = record [
        quantity = quantity;
        target   = target;
    ];

} with (Tezos.transaction(mintOrBurnParams, 0mutez, getLpTokenMintOrBurnEntrypoint(lpTokenAddress) ) )



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Rewards Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update rewards
function updateRewards(const userAddress : address; const tokenName : string; var s : tokenPoolStorageType) : tokenPoolStorageType is
block{

        // Steps Overview:

        // Check if user is recorded in the Rewards Ledger
        if Big_map.mem(userAddress, s.rewardsLedger) then {

            // Get user's rewards record
            var userRewardsRecord : rewardsRecordType := case Big_map.find_opt(userAddress, s.rewardsLedger) of [
                    Some (_record) -> _record
                |   None           -> failwith(error_TOKEN_POOL_REWARDS_RECORD_NOT_FOUND)
            ];
            var userRewardsPerShare : nat := userRewardsRecord.rewardsPerShare;            

            // Get user depositor record for token (i.e. liquidity provided for token)
            const depositorKey : (address * string) = (userAddress * tokenName);
            var depositorAmount : nat := case Big_map.find_opt(depositorKey, s.depositorLedger) of [
                    Some(_record) -> _record
                |   None          -> failwith(error_DEPOSITOR_RECORD_NOT_FOUND)
            ];

            // Get token record
            const tokenRecord : tokenRecordType  = case Big_map.find_opt(tokenName, s.tokenLedger) of [
                    Some (_tokenRecord) -> _tokenRecord
                |   None                -> failwith(error_TOKEN_RECORD_NOT_FOUND)
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
            s.rewardsLedger[userAddress]            := userRewardsRecord;

        } else skip;

} with (s)

// ------------------------------------------------------------------------------
// Rewards Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Token Pool Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to calculate compounded interest
function calculateCompoundedInterest(const interestRate : nat; const lastUpdatedBlockLevel : nat; var s : tokenPoolStorageType) : tokenPoolStorageType is
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

    const exp : nat = abs(Tezos.get_levels() - lastUpdatedBlockLevel);

    if exp =/= 0n then {

        const expMinusOne : nat = abs(exp - 1n);
        const expMinusTwo : nat = if exp > 2n then abs(exp - 2n) else 0n;

        const basePowerTwo : nat = (interestRate * fixedPointAccuracy) / (blocksPerYear * blocksPerYear);
        const basePowerThree : nat = (basePowerTwo * interestRate) / blocksPerYear

    } else skip;
   
   const secondTerm : nat = (exp * expMinusOne * basePowerTwo) / 2n;
   const thirdTerm : nat = (exp * expMinusOne * expMinusTwo * basePowerThree) / 6n;

   const compoundedInterest : nat = (((interestRate * exp * fixedPointAccuracy) / blocksPerYear) + secondTerm + thirdTerm) / fixedPointAccuracy;

} with (compoundedInterest)



// helper function to get normalized debt
function getNormalizedDebt(const tokenName : string; var s : tokenPoolStorageType) : tokenPoolStorageType is
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
    var tokenRecord : tokenRecordType := case Big_map.find_opt(tokenName, s.tokenLedger) of [
            Some (_tokenRecord) -> _tokenRecord
        |   None                -> failwith(error_TOKEN_RECORD_NOT_FOUND)
    ];

    // init variables
    var accumulatedRewardsPerShare : nat := tokenRecord.accumulatedRewardsPerShare;

    if Tezos.get_levels() == lastUpdatedBlockLevel then skip else {

        const lastUpdatedBlockLevel : nat = tokenRecord.lastUpdatedBlockLevel;
        const currentInterestRate : nat = tokenRecord.currentInterestRate;

        const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel);
        accumulatedRewardsPerShare := (accumulatedRewardsPerShare * compoundedInterest) / fixedPointAccuracy;

    };

    tokenRecord.accumulatedRewardsPerShare := accumulatedRewardsPerShare;
    s.tokenLedger[tokenName] := tokenRecord;

} with (accumulatedRewardsPerShare)



// helper function to update token state
function updateTokenState(const tokenName : string; var s : tokenPoolStorageType) : tokenPoolStorageType is
block{

    // get token record
    var tokenRecord : tokenRecordType := case Big_map.find_opt(tokenName, s.tokenLedger) of [
            Some (_tokenRecord) -> _tokenRecord
        |   None                -> failwith(error_TOKEN_RECORD_NOT_FOUND)
    ];

    // init variables
    var accumulatedRewardsPerShare : nat := tokenRecord.accumulatedRewardsPerShare;

    if Tezos.get_levels() == lastUpdatedBlockLevel then skip else {

        const lastUpdatedBlockLevel : nat = tokenRecord.lastUpdatedBlockLevel;
        const currentInterestRate : nat = tokenRecord.currentInterestRate;

        const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel);
        accumulatedRewardsPerShare := (accumulatedRewardsPerShare * compoundedInterest) / fixedPointAccuracy;

    };

    tokenRecord.accumulatedRewardsPerShare := accumulatedRewardsPerShare;
    s.tokenLedger[tokenName] := tokenRecord;


} with (accumulatedRewardsPerShare)



// helper function to calculateInterestRate
function calculateInterestRate(const tokenName : string; var s : tokenPoolStorageType) : tokenPoolStorageType is
block {

    // get token record
    var tokenRecord : tokenRecordType := case Big_map.find_opt(tokenName, s.tokenLedger) of [
            Some (_tokenRecord) -> _tokenRecord
        |   None                -> failwith(error_TOKEN_RECORD_NOT_FOUND)
    ];

    // init params
    const tokenPoolTotal            : nat = tokenRecord.tokenPoolTotal;
    const totalBorrowed             : nat = tokenRecord.totalBorrowed;
    const totalRemaining            : nat = tokenRecord.totalRemaining;
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
        s.tokenLedger[tokenName] := tokenRecord;

    } else skip;
    
} with (s)


// ------------------------------------------------------------------------------
// Token Pool Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageTypeType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(tokenPoolUnpackLambdaFunctionType)) of [
            Some(f) -> f(tokenPoolLambdaAction, s)
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
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get stablecoin token in token ledger *)
[@view] function viewGetTokenRecordByName(const tokenName : string; var s : tokenPoolStorageType) : option(tokenRecordType) is
    Big_map.find_opt(tokenName, s.tokenLedger)



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
function setAdmin(const newAdminAddress : address; var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaSetAdmin(setAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : tokenPoolStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : tokenPoolStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);  

} with response


// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : tokenPoolStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : tokenPoolTogglePauseEntrypointType; const s : tokenPoolStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Entrypoints Begin
// ------------------------------------------------------------------------------

(* addLiquidity entrypoint *)
function addLiquidity(const addLiquidityParams : addLiquidityActionType ; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddLiquidity"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaAddLiquidity(addLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response




(* removeLiquidity entrypoint *)
function removeLiquidity(const removeLiquidityParams : removeLiquidityActionType; var s : tokenPoolStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveLiquidity"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaRemoveLiquidity(removeLiquidityParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Token Pool Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lending Entrypoints Begin
// ------------------------------------------------------------------------------

(* onBorrow entrypoint *)
function onBorrow(const onBorrowParams : onBorrowActionType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnBorrow"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaOnBorrow(onBorrowParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response



(* onRepay entrypoint *)
function onRepay(const onRepayParams : onRepayActionType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnRepay"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaOnRepay(onRepayParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Lending Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Rewards Entrypoints Begin
// ------------------------------------------------------------------------------

(* claimRewards entrypoint *)
function claimRewards(const claimRewardsParams : claimRewardsActionType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaClaimRewards"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaClaimRewards(claimRewardsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response



(* updateRewards entrypoint *)
function updateRewards(const updateRewardsParams : updateRewardsActionType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateRewards"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaUpdateRewards(updateRewardsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Rewards Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Misc Entrypoints Begin
// ------------------------------------------------------------------------------

(* transfer entrypoint *)
function transfer(const transferParams : transferActionType; var s : tokenPoolStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init token pool lambda action
    const tokenPoolLambdaAction : tokenPoolLambdaActionType = LambdaTransfer(transferParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, tokenPoolLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Misc Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : tokenPoolAction; const s : tokenPoolStorageType) : return is 

    case action of [

            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                        -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                   -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)

            // Token Pool Entrypoints
        |   AddLiquidity(parameters)                    -> addLiquidity(parameters, s)
        |   RemoveLiquidity(parameters)                 -> removeLiquidity(parameters, s)

            // Lending Entrypoints
        |   OnBorrow(parameters)                        -> onBorrow(parameters, s)
        |   OnRepay(parameters)                         -> onRepay(parameters, s)

            // Rewards Entrypoints
        |   ClaimRewards(parameters)                    -> claimRewards(parameters, s)
        |   UpdateRewards(parameters)                   -> updateRewards(parameters, s)

            // Misc Entrypoints
        |   Transfer(parameters)                        -> transfer(parameters, s)
           
    ]