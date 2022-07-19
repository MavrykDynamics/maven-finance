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

// MvkToken Types
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury Types
#include "../partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Types
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type treasuryAction is 

    |   Default                        of unit

        // Housekeeping Entrypoints
    |   SetAdmin                       of (address)
    |   SetGovernance                  of (address)
    |   SetBaker                       of option(key_hash)
    |   SetName                        of (string)
    |   UpdateMetadata                 of updateMetadataType
    |   UpdateWhitelistContracts       of updateWhitelistContractsType
    |   UpdateGeneralContracts         of updateGeneralContractsType
    |   UpdateWhitelistTokenContracts  of updateWhitelistTokenContractsType

        // Pause / Break Glass Entrypoints
    |   PauseAll                       of (unit)
    |   UnpauseAll                     of (unit)
    |   TogglePauseEntrypoint          of treasuryTogglePauseEntrypointType

        // Treasury Entrypoints
    |   Transfer                       of transferActionType
    |   MintMvkAndTransfer             of mintMvkAndTransferType

        // Staking Entrypoints
    |   UpdateMvkOperators             of updateOperatorsType
    |   StakeMvk                       of (nat)
    |   UnstakeMvk                     of (nat)

        // Lambda Entrypoints
    |   SetLambda                      of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * treasuryStorageType

// treasury contract methods lambdas
type treasuryUnpackLambdaFunctionType is (treasuryLambdaActionType * treasuryStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Contract
function checkSenderIsAllowed(const s : treasuryStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders : Admin
function checkSenderIsAdmin(var s : treasuryStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders : Admin, Governance Financial Contract
function checkSenderIsAdminOrGovernanceFinancial(const s : treasuryStorageType) : unit is
block{

    const governanceFinancialAddress : address = case s.whitelistContracts["governanceFinancial"] of [
            Some (_address) -> _address
        |   None            -> (failwith(error_ONLY_ADMIN_OR_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED) : address)
    ];
    
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = governanceFinancialAddress) then skip
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);

} with(unit)



// Allowed Senders : Admin, Governance Contract, Treasury Factory Contract
function checkSenderIsGovernanceOrFactory(const s : treasuryStorageType) : unit is
block {
    
    if Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress
    then skip
    else{

        const treasuryFactoryAddress : address = case s.whitelistContracts["treasuryFactory"] of [
                Some (_address) -> _address
            |   None            -> (failwith(error_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : address)
        ];

        if Tezos.get_sender() = treasuryFactoryAddress then skip else failwith(error_ONLY_ADMIN_OR_TREASURY_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)



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

// helper function to check that the %transfer entrypoint is not paused
function checkTransferIsNotPaused(var s : treasuryStorageType) : unit is
    if s.breakGlassConfig.transferIsPaused then failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %mintMvkAndTransfer entrypoint is not paused
function checkMintMvkAndTransferIsNotPaused(var s : treasuryStorageType) : unit is
    if s.breakGlassConfig.mintMvkAndTransferIsPaused then failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %stakeMvk entrypoint is not paused
function checkStakeMvkIsNotPaused(var s : treasuryStorageType) : unit is
    if s.breakGlassConfig.stakeMvkIsPaused then failwith(error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %unstakeMvk entrypoint is not paused
function checkUnstakeMvkIsNotPaused(var s : treasuryStorageType) : unit is
    if s.breakGlassConfig.unstakeMvkIsPaused then failwith(error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get mint entrypoint from specified token contract address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintType) is
    case (Tezos.get_entrypoint_opt(
        "%mint",
        token_address) : option(contract(mintType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_MINT_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(mintType))
        ];



// Helper function to mint mvk/smvk tokens 
function mintTokens(
    const to_ : address;
    const amount_ : nat;
    const tokenAddress : address) : operation is
    Tezos.transaction(
        (to_, amount_),
        0tez,
        getMintEntrypointFromTokenAddress(tokenAddress)
    );

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(treasuryUnpackLambdaFunctionType)) of [
            Some(f) -> f(treasuryLambdaAction, s)
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

// Treasury Lambdas :
#include "../partials/contractLambdas/treasury/treasuryLambdas.ligo"

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

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : treasuryStorageType) : address is
    s.admin



(* View: get name variable *)
[@view] function getName(const _ : unit; var s : treasuryStorageType) : string is
    s.name



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; var s : treasuryStorageType) : treasuryBreakGlassConfigType is
    s.breakGlassConfig



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : treasuryStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _ : unit; var s : treasuryStorageType) : whitelistTokenContractsType is
    s.whitelistTokenContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : treasuryStorageType) : generalContractsType is
    s.generalContracts



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : treasuryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : treasuryStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Entrypoints Begin
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
function setAdmin(const newAdminAddress : address; var s : treasuryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : treasuryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);

} with response



(* setBaker entrypoint *)
function setBaker(const keyHash : option(key_hash); var s : treasuryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetBaker"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetBaker(keyHash);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* setName entrypoint - update the metadata at a given key *)
function setName(const updatedName : string; var s : treasuryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetName"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaSetName(updatedName);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : treasuryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : treasuryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : treasuryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : treasuryStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : treasuryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : treasuryStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: treasuryTogglePauseEntrypointType; const s : treasuryStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Entrypoints Begin
// ------------------------------------------------------------------------------

(* transfer entrypoint *)
function transfer(const transferTokenParams : transferActionType; var s : treasuryStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaTransfer(transferTokenParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* mintMvkAndTransfer entrypoint *)
function mintMvkAndTransfer(const mintMvkAndTransferParams : mintMvkAndTransferType ; var s : treasuryStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMintMvkAndTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaMintMvkAndTransfer(mintMvkAndTransferParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* updateMvkOperators entrypoint *)
function updateMvkOperators(const updateOperatorsParams : updateOperatorsType ; var s : treasuryStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMvkOperators"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUpdateMvkOperators(updateOperatorsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* stakeMvk entrypoint *)
function stakeMvk(const stakeAmount : nat ; var s : treasuryStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaStakeMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaStakeMvk(stakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response



(* unstakeMvk entrypoint *)
function unstakeMvk(const unstakeAmount : nat ; var s : treasuryStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnstakeMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init treasury lambda action
    const treasuryLambdaAction : treasuryLambdaActionType = LambdaUnstakeMvk(unstakeAmount);

    // init response
    const response : return = unpackLambda(lambdaBytes, treasuryLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Treasury Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : treasuryStorageType) : return is
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
function main (const action : treasuryAction; const s : treasuryStorageType) : return is 
    
    case action of [

        |   Default(_params)                              -> ((nil : list(operation)), s)
        
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                          -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                     -> setGovernance(parameters, s)
        |   SetBaker(parameters)                          -> setBaker(parameters, s)
        |   SetName(parameters)                           -> setName(parameters, s)
        |   UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters)     -> updateWhitelistTokenContracts(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)             -> togglePauseEntrypoint(parameters, s)
        
            // Treasury Entrypoints
        |   Transfer(parameters)                          -> transfer(parameters, s)
        |   MintMvkAndTransfer(parameters)                -> mintMvkAndTransfer(parameters, s)

            // Staking Entrypoints
        |   UpdateMvkOperators(parameters)                -> updateMvkOperators(parameters, s)
        |   StakeMvk(parameters)                          -> stakeMvk(parameters, s)
        |   UnstakeMvk(parameters)                        -> unstakeMvk(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)
    ]
