// ------------------------------------------------------------------------------
//
// Satellite Governance Lambdas Begin
//
// ------------------------------------------------------------------------------

(*  suspendSatellite lambda *)
function lambdaSuspendSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaSuspendSatellite(_satelliteAddress) -> {

                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  unsuspendSatellite lambda *)
function lambdaUnsuspendSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaUnsuspendSatellite(_satelliteAddress) -> {

                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  banSatellite lambda *)
function lambdaBanSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaBanSatellite(_satelliteAddress) -> {
                
                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  unbanSatellite lambda *)
function lambdaUnbanSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaUnbanSatellite(_satelliteAddress) -> {
                
                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  removeAllSatelliteOracles lambda *)
function lambdaRemoveAllSatelliteOracles(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaRemoveAllSatelliteOracles(_satelliteAddress) -> {
                
                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  addOracleToAggregator lambda *)
function lambdaAddOracleToAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaAddOracleToAggregator(_satelliteAddress) -> {
                
                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  removeOracleInAggregator lambda *)
function lambdaRemoveOracleInAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaRemoveOracleInAggregator(_satelliteAddress) -> {
                
                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  voteForAction lambda *)
function lambdaVoteForAction(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaVoteForAction(_governanceActionCounter) -> {
                
                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  dropAction lambda *)
function lambdaDropAction(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaDropAction(_governanceActionCounter) -> {
                
                skip

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
//
// Satellite Governance Lambdas End
//
// ------------------------------------------------------------------------------
