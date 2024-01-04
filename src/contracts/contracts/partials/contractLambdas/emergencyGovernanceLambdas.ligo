// ------------------------------------------------------------------------------
//
// Emergency Governance Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case emergencyGovernanceLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case emergencyGovernanceLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case emergencyGovernanceLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda  *)
function lambdaUpdateConfig(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is 
block {

  verifyNoAmountSent(Unit);   // entrypoint should not receive any tez amount  
  verifySenderIsAdmin(s.admin); // verify that sender is admin

  case emergencyGovernanceLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : emergencyUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : emergencyUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                        ConfigDurationInMinutes (_v)                  -> s.config.durationInMinutes               := updateConfigNewValue
                    |   ConfigRequiredFeeMutez (_v)                   -> s.config.requiredFeeMutez                := updateConfigNewValue * 1mumav
                    |   ConfigStakedMvnPercentRequired (_v)           -> if updateConfigNewValue > 10_000n     then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.stakedMvnPercentageRequired     := updateConfigNewValue  
                    |   ConfigMinStakedMvnForVoting (_v)              -> if updateConfigNewValue < 10_000_000n then failwith(error_CONFIG_VALUE_TOO_LOW)  else s.config.minStakedMvnRequiredToVote      := updateConfigNewValue
                    |   ConfigMinStakedMvnToTrigger (_v)              -> if updateConfigNewValue < 10_000_000n then failwith(error_CONFIG_VALUE_TOO_LOW)  else s.config.minStakedMvnRequiredToTrigger   := updateConfigNewValue
                    |   ConfigProposalTitleMaxLength (_v)             -> s.config.proposalTitleMaxLength          := updateConfigNewValue
                    |   ConfigProposalDescMaxLength (_v)              -> s.config.proposalDescMaxLength           := updateConfigNewValue
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case emergencyGovernanceLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda  *)
function lambdaUpdateGeneralContracts(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s: emergencyGovernanceStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case emergencyGovernanceLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case emergencyGovernanceLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify if the sender is admin or the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations (transferOperationFold in transferHelpers)
                operations := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Emergency Governance Lambdas Begin
// ------------------------------------------------------------------------------

(* triggerEmergencyControl lambda  *)
function lambdaTriggerEmergencyControl(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that there is no currently active emergency governance being voted on
    // 2. Check if tez sent is equal to the required fee
    // 3. Transfer required fee to the Tax Treasury
    //    - Get Tax Treasury Contract Address from the General Contracts Map on the Governance Contract
    // 4. Check if user has sufficient staked MVN to trigger emergency control
    //    - Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    //    - Get user's staked MVN balance from the Doorman Contract
    // 5. Get Total Staked MVN supply and calculate min staked MVN required for break glass to be triggered
    //    - N.B. Total Staked MVN Supply is equivalent to the Doorman Contract's balance on the MVN Token Contract
    // 6. Validate inputs of emergency control (name and description should not exceed max length)
    // 7. Create new emergency governance record
    // 8. Update storage (counters and new emergency governance)

    var operations : list(operation) := nil;

    case emergencyGovernanceLambdaAction of [
        |   LambdaTriggerEmergencyControl(triggerEmergencyControlParams) -> {

                const userAddress: address  = Mavryk.get_sender();
                    
                // Verify that there is no currently active emergency governance
                verifyNoActiveEmergencyGovernance(s);

                // Verify that tez sent is equal to the required fee
                verifyCorrectFee(s);

                // Transfer fee to Treasury
                const transferFeeToTreasuryOperation : operation = transferFeeToTreasuryOperation(s);

                // Get user's staked MVN balance from the Doorman Contract
                const stakedMvnBalance : nat = getUserStakedMvnBalance(userAddress, s);
                
                // Verify that user has sufficient staked MVN to trigger emergency control
                verifySufficientBalanceToTrigger(stakedMvnBalance, s);

                // Get staked MVN total supply 
                const stakedMvnTotalSupply : nat = getStakedMvnTotalSupply(s);

                // Calculate min staked MVN required for break glass to be triggered
                var stakedMvnRequiredForBreakGlass : nat := abs(s.config.stakedMvnPercentageRequired * stakedMvnTotalSupply / 10000);

                // Init emergency control parameters
                const title        : string  =  triggerEmergencyControlParams.title;
                const description  : string  =  triggerEmergencyControlParams.description;

                // Validate inputs - does not exceed max length
                validateStringLength(title          , s.config.proposalTitleMaxLength  , error_WRONG_INPUT_PROVIDED);
                validateStringLength(description    , s.config.proposalDescMaxLength   , error_WRONG_INPUT_PROVIDED);

                // Create new emergency governance record
                const newEmergencyGovernanceRecord : emergencyGovernanceRecordType = createEmergencyGovernance(
                    userAddress,
                    title,
                    description,
                    stakedMvnRequiredForBreakGlass,
                    s    
                );

                // Update storage (counters and new emergency governance)
                s.emergencyGovernanceLedger[s.nextEmergencyGovernanceId] := newEmergencyGovernanceRecord;
                
                s.currentEmergencyGovernanceId  := s.nextEmergencyGovernanceId;
                s.nextEmergencyGovernanceId     := s.nextEmergencyGovernanceId + 1n;

                // add to operations
                operations := list[transferFeeToTreasuryOperation];               

            }
        |   _ -> skip
    ];

} with (operations, s)



(* voteForEmergencyControl lambda  *)
function lambdaVoteForEmergencyControl(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that there is an active emergency governance
    // 2. Get current Emergency Governance Record 
    //    - Check that emergency governance has not been dropped
    //    - Check that emergency governance has not been executed
    // 3. Check if user has already voted for this Emergency Governance
    // 4. Check if user has min required staked MVN to vote for emergency governance
    //    - Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    //    - Get user's staked MVN balance from the Doorman Contract
    // 5. Update emergency governance record with new votes
    //    - Increment emergency governance total staked MVN votes with user's staked MVN balance amount
    // 6. Check if total votes has exceed threshold - if yes, trigger operation to break glass contract
    //    - Get Break Glass Contract Address from the General Contracts Map on the Governance Contract
    //    - Trigger break glass in Break Glass contract - set glassbroken boolean to true in Break Glass contract to give council members access to protected entrypoints
    //    - Trigger break glass in Governance contract  - set Governance Contract admin to Break Glass Contract address
    // 7. Update storage - emergency governance record

    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  

    var operations : list(operation) := nil;

    case emergencyGovernanceLambdaAction of [
        |   LambdaVoteForEmergencyControl(_parameters) -> {

                const userAddress: address  = Mavryk.get_sender();
                
                // Verify that there is an active emergency governance
                verifyOngoingActiveEmergencyGovernance(s);

                // Get current Emergency Governance Record
                var _emergencyGovernance : emergencyGovernanceRecordType := getCurrentEmergencyGovernance(s);

                // Verify that emergency governance has not been executed
                verifyEmergencyGovernanceNotExecuted(_emergencyGovernance);

                // Verify that user has not voted for the current Emergency Governance
                verifyUserHasNotVoted(userAddress, s.currentEmergencyGovernanceId, s);

                // Get user's staked MVN balance from the Doorman Contract
                const stakedMvnBalance : nat = getUserStakedMvnBalance(userAddress, s);

                // Verify that user has min required staked MVN to vote for emergency governance
                verifySufficientBalanceToVote(stakedMvnBalance, s);

                // Increment emergency governance total staked MVN votes with user's staked MVN balance amount
                const totalStakedMvnVotes : nat = _emergencyGovernance.totalStakedMvnVotes + stakedMvnBalance;

                // Update emergency governance record with new votes
                _emergencyGovernance.totalStakedMvnVotes := totalStakedMvnVotes;
                s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := _emergencyGovernance;
                s.emergencyGovernanceVoters := Big_map.add((s.currentEmergencyGovernanceId, userAddress), (stakedMvnBalance, Mavryk.get_now()), s.emergencyGovernanceVoters);

                // Check if total votes has exceed threshold - if yes, trigger operation to break glass contract
                if totalStakedMvnVotes > _emergencyGovernance.stakedMvnRequiredForBreakGlass then block {

                    // Trigger break glass operation in the break glass and governance contract
                    const triggerBreakGlassOperation            : operation = triggerBreakGlassOperation(s);
                    const triggerGovernanceBreakGlassOperation  : operation = triggerGovernanceBreakGlassOperation(s);

                    // Update emergency governance record
                    _emergencyGovernance.executed            := True;
                    _emergencyGovernance.executedDateTime    := Some(Mavryk.get_now());
                    _emergencyGovernance.executedLevel       := Some(Mavryk.get_level());
                    
                    // Save emergency governance record
                    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := _emergencyGovernance;

                    operations := list[triggerGovernanceBreakGlassOperation;triggerBreakGlassOperation];

                    // Reset currentEmergencyGovernanceId to 0
                    s.currentEmergencyGovernanceId           := 0n;

                } else skip;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Emergency Governance Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Emergency Governance Lambdas End
//
// ------------------------------------------------------------------------------
