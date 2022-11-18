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

// Farm Types
#include "../partials/contractTypes/farmTypes.ligo"

// FarmFactory Types
#include "../partials/contractTypes/farmFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type createFarmFuncType is (option(key_hash) * tez * farmStorageType) -> (operation * address)
const createFarmFunc: createFarmFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/farm.tz"
        ;
          PAIR } |}
: createFarmFuncType)];

type farmFactoryAction is

        // Housekeeping Entrypoints
        SetAdmin                    of (address)
    |   SetGovernance               of (address)
    |   UpdateMetadata              of updateMetadataType
    |   UpdateConfig                of farmFactoryUpdateConfigParamsType
    |   UpdateWhitelistContracts    of updateWhitelistContractsType
    |   UpdateGeneralContracts      of updateGeneralContractsType
    |   MistakenTransfer            of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                    of (unit)
    |   UnpauseAll                  of (unit)
    |   TogglePauseEntrypoint       of farmFactoryTogglePauseEntrypointType

        // Farm Factory Entrypoints
    |   CreateFarm                  of createFarmType
    |   TrackFarm                   of (address)
    |   UntrackFarm                 of (address)

        // Lambda Entrypoints
    |   SetLambda                   of setLambdaType
    |   SetProductLambda            of setLambdaType


type return is list (operation) * farmFactoryStorageType
const noOperations: list (operation) = nil;

// farm factory contract methods lambdas
type farmFactoryUnpackLambdaFunctionType is (farmFactoryLambdaActionType * farmFactoryStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : farmFactoryStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
        


// Allowed Senders: Admin
function checkSenderIsAdmin(const s : farmFactoryStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Council Contract
function checkSenderIsCouncil(const s : farmFactoryStorageType) : unit is
block {

    const councilAddress : address = case s.whitelistContracts["council"] of [
            Some (_address) -> _address
        |   None            -> (failwith(error_COUNCIL_CONTRACT_NOT_FOUND) : address)
    ];

    if Tezos.get_sender() = councilAddress then skip
    else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with (unit)



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : farmFactoryStorageType) : unit is
block{

    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }

} with unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %createFarm entrypoint is not paused
function checkCreateFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.createFarmIsPaused then failwith(error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %trackFarm entrypoint is not paused
function checkTrackFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.trackFarmIsPaused then failwith(error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %untrackFarm entrypoint is not paused
function checkUntrackFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.untrackFarmIsPaused then failwith(error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get lambda bytes
function getLambdaBytes(const lambdaKey : string; const s : farmFactoryStorageType) : bytes is 
block {
    
    // get lambda bytes from lambda ledger
    const lambdaBytes : bytes = case s.lambdaLedger[lambdaKey] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

} with lambdaBytes



// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(farmFactoryUnpackLambdaFunctionType)) of [
            Some(f) -> f(farmFactoryLambdaAction, s)
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
// Lambdas
// ------------------------------------------------------------------------------

// Farm Factory Lambdas:
#include "../partials/contractLambdas/farmFactory/farmFactoryLambdas.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Farm Factory Views:
#include "../partials/contractViews/farmFactoryViews.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Farm Factory Entrypoints:
#include "../partials/contractEntrypoints/farmFactoryEntrypoints.ligo"


(* main entrypoint *)
function main (const action : farmFactoryAction; var s : farmFactoryStorageType) : return is
block{
    
    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with (

    case action of [
        
            // Housekeeping Entrypoints
            SetAdmin (parameters)                   -> setAdmin(parameters, s)
        |   SetGovernance (parameters)              -> setGovernance(parameters, s)
        |   UpdateMetadata (parameters)             -> updateMetadata(parameters, s)
        |   UpdateConfig (parameters)               -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts (parameters)   -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)     -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer (parameters)           -> mistakenTransfer(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                  -> pauseAll(s)
        |   UnpauseAll (_parameters)                -> unpauseAll(s)
        |   TogglePauseEntrypoint (parameters)      -> togglePauseEntrypoint(parameters, s)

            // Farm Factory Entrypoints
        |   CreateFarm (params)                     -> createFarm(params, s)
        |   TrackFarm (params)                      -> trackFarm(params, s)
        |   UntrackFarm (params)                    -> untrackFarm(params, s)

            // Lambda Entrypoints
        |   SetLambda (parameters)                  -> setLambda(parameters, s)
        |   SetProductLambda (parameters)           -> setProductLambda(parameters, s)
    ]
)
