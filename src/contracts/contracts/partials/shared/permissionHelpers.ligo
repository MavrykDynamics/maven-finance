// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------

#include "../contractTypes/delegationTypes.ligo"

// ------------------------------------------------------------------------------
// Satellite check Helpers
// ------------------------------------------------------------------------------

// helper function to check that satellite is not suspended or banned
function checkSatelliteStatus(const satelliteAddress : address; const delegationAddress : address; const checkForSuspended : bool; const checkForBanned : bool) : unit is
block{

    // Get Satellite Record and check status from on-chain view %getSatelliteOpt on Delegation Contract
    case (Mavryk.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress) : option (option(satelliteRecordType))) of [
            Some (_satelliteRecordOpt) -> case _satelliteRecordOpt of [
                    Some (_satellite) -> if checkForSuspended and _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if checkForBanned and _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                |   None              -> failwith(error_ONLY_SATELLITE_ALLOWED)
            ]
        |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

} with (unit)