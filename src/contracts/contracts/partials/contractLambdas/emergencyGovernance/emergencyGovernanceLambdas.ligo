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
    
    checkNoAmount(Unit);      // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);  // check that sender is admin or the Governance Contract address

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
    
    checkNoAmount(Unit);     // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

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

    checkSenderIsAdmin(s); // check that sender is admin 

    case emergencyGovernanceLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda  *)
function lambdaUpdateConfig(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin 

  case emergencyGovernanceLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : emergencyUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : emergencyUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                        ConfigVoteExpiryDays (_v)                     -> s.config.voteExpiryDays                  := updateConfigNewValue
                    |   ConfigRequiredFeeMutez (_v)                   -> s.config.requiredFeeMutez                := updateConfigNewValue * 1mutez
                    |   ConfigStakedMvkPercentRequired (_v)           -> if updateConfigNewValue > 10_000n     then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.stakedMvkPercentageRequired     := updateConfigNewValue  
                    |   ConfigMinStakedMvkForVoting (_v)              -> if updateConfigNewValue < 10_000_000n then failwith(error_CONFIG_VALUE_TOO_LOW)  else s.config.minStakedMvkRequiredToVote      := updateConfigNewValue
                    |   ConfigMinStakedMvkForTrigger (_v)             -> if updateConfigNewValue < 10_000_000n then failwith(error_CONFIG_VALUE_TOO_LOW)  else s.config.minStakedMvkRequiredToTrigger   := updateConfigNewValue
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
    
    checkSenderIsAdmin(s); // check that sender is admin 
    
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

    checkSenderIsAdmin(s); // check that sender is admin 

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

                // Check if the sender is admin or the Governance Satellite Contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)) : list(operation) is
                    block{
                        const transferTokenOperation : operation = case transferParam.token of [
                            |   Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address") : contract(unit)), transferParam.amount * 1mutez)
                            |   Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                            |   Fa2(token)  -> transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                        ];
                    } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
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
    // 4. Check if user has sufficient staked MVK to trigger emergency control
    //    - Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    //    - Get user's staked MVK balance from the Doorman Contract
    // 5. Get Total Staked MVK supply and calculate min staked MVK required for break glass to be triggered
    //    - N.B. Total Staked MVK Supply is equivalent to the Doorman Contract's balance on the MVK Token Contract
    // 6. Validate inputs of emergency control (name and description should not exceed max length)
    // 7. Create new emergency governance record
    // 8. Update storage (counters and new emergency governance)

    var operations : list(operation) := nil;

    case emergencyGovernanceLambdaAction of [
        |   LambdaTriggerEmergencyControl(triggerEmergencyControlParams) -> {

                const userAddress: address  = Tezos.get_sender();
                    
                // check that there is no currently active emergency governance being voted on
                if s.currentEmergencyGovernanceId = 0n 
                then skip
                else failwith(error_EMERGENCY_GOVERNANCE_ALREADY_IN_THE_PROCESS);

                // check if tez sent is equal to the required fee
                if Tezos.get_amount() =/= s.config.requiredFeeMutez 
                then failwith(error_TEZ_FEE_NOT_PAID) 
                else skip;
            
                // Get Tax Treasury Contract Address from the General Contracts Map on the Governance Contract
                const treasuryAddress: address = getContractAddressFromGovernanceContract("taxTreasury", s.governanceAddress, error_TAX_TREASURY_CONTRACT_NOT_FOUND);

                // Transfer fee to Treasury
                const treasuryContract: contract(unit) = Tezos.get_contract_with_error(treasuryAddress, "Error. Contract not found at given address");
                const transferFeeToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.get_amount());

                // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

                // Get user's staked MVK balance from the Doorman Contract
                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                ];
                
                // Check if user has sufficient staked MVK to trigger emergency control
                if stakedMvkBalance < s.config.minStakedMvkRequiredToTrigger 
                then failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED) 
                else skip;

                // Get Total Staked MVK supply 
                // - N.B. Total Staked MVK Supply is equivalent to the Doorman Contract's balance on the MVK Token Contract
                const balanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const stakedMvkTotalSupply: nat = case balanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate min staked MVK required for break glass to be triggered
                var stakedMvkRequiredForBreakGlass : nat := abs(s.config.stakedMvkPercentageRequired * stakedMvkTotalSupply / 10000);

                // Init emergency control parameters
                const title        : string  =  triggerEmergencyControlParams.title;
                const description  : string  =  triggerEmergencyControlParams.description;

                // Validate inputs - does not exceed max length
                if String.length(title)       > s.config.proposalTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(description) > s.config.proposalDescMaxLength  then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Init empty voters map
                const emptyVotersMap : voterMapType = map[];

                // Create new emergency governance record
                var newEmergencyGovernanceRecord : emergencyGovernanceRecordType := record [
                    proposerAddress                  = userAddress;
                    executed                         = False;
                    dropped                          = False;

                    title                            = title;
                    description                      = description; 
                    voters                           = emptyVotersMap;
                    totalStakedMvkVotes              = 0n;
                    stakedMvkPercentageRequired      = s.config.stakedMvkPercentageRequired;  // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
                    stakedMvkRequiredForBreakGlass   = stakedMvkRequiredForBreakGlass;

                    startDateTime                    = Tezos.get_now();
                    startLevel                       = Tezos.get_level();             
                    executedDateTime                 = zeroTimestamp;
                    executedLevel                    = 0n;
                    expirationDateTime               = Tezos.get_now() + (86_400 * s.config.voteExpiryDays);
                ];

                // Update storage (counters and new emergency governance)
                s.emergencyGovernanceLedger[s.nextEmergencyGovernanceId] := newEmergencyGovernanceRecord;
                s.currentEmergencyGovernanceId := s.nextEmergencyGovernanceId;
                s.nextEmergencyGovernanceId := s.nextEmergencyGovernanceId + 1n;

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
    // 4. Check if user has min required staked MVK to vote for emergency governance
    //    - Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    //    - Get user's staked MVK balance from the Doorman Contract
    // 5. Update emergency governance record with new votes
    //    - Increment emergency governance total staked MVK votes with user's staked MVK balance amount
    // 6. Check if total votes has exceed threshold - if yes, trigger operation to break glass contract
    //    - Get Break Glass Contract Address from the General Contracts Map on the Governance Contract
    //    - Trigger break glass in Break Glass contract - set glassbroken boolean to true in Break Glass contract to give council members access to protected entrypoints
    //    - Trigger break glass in Governance contract  - set Governance Contract admin to Break Glass Contract address
    // 7. Update storage - emergency governance record

    checkNoAmount(Unit); // entrypoint should not receive any tez amount  

    var operations : list(operation) := nil;

    case emergencyGovernanceLambdaAction of [
        |   LambdaVoteForEmergencyControl(_parameters) -> {

                const userAddress: address  = Tezos.get_sender();
                
                // Check that there is an active emergency governance
                if s.currentEmergencyGovernanceId = 0n then failwith(error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS)
                else skip;

                // Get current Emergency Governance Record
                var _emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of [
                    |   None            -> failwith(error_EMERGENCY_GOVERNANCE_NOT_FOUND)
                    |   Some(_instance) -> _instance
                ];

                // Check that emergency governance has not been dropped
                if _emergencyGovernance.dropped = True then failwith(error_EMERGENCY_GOVERNANCE_DROPPED)
                else skip; 

                // Check that emergency governance has not been executed
                if _emergencyGovernance.executed = True then failwith(error_EMERGENCY_GOVERNANCE_EXECUTED)
                else skip; 

                // Check if user has already voted for this Emergency Governance
                if not Map.mem(userAddress, _emergencyGovernance.voters) then skip else failwith(error_EMERGENCY_GOVERNANCE_VOTE_ALEADY_REGISTERED);

                // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);
                
                // Get user's staked MVK balance from the Doorman Contract
                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND)
                ];

                // Check if user has min required staked MVK to vote for emergency governance
                if stakedMvkBalance > s.config.minStakedMvkRequiredToVote then skip else failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED);

                // Increment emergency governance total staked MVK votes with user's staked MVK balance amount
                const totalStakedMvkVotes : nat = _emergencyGovernance.totalStakedMvkVotes + stakedMvkBalance;

                // Update emergency governance record with new votes
                _emergencyGovernance.voters[userAddress] := (stakedMvkBalance, Tezos.get_now());
                _emergencyGovernance.totalStakedMvkVotes := totalStakedMvkVotes;
                s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := _emergencyGovernance;

                // Check if total votes has exceed threshold - if yes, trigger operation to break glass contract
                if totalStakedMvkVotes > _emergencyGovernance.stakedMvkRequiredForBreakGlass then block {

                    // Get Break Glass Contract Address from the General Contracts Map on the Governance Contract
                    const breakGlassContractAddress : address = getContractAddressFromGovernanceContract("breakGlass", s.governanceAddress, error_BREAK_GLASS_CONTRACT_NOT_FOUND);
                    const governanceAddress : address = s.governanceAddress;

                    // Trigger break glass in Break Glass contract - set glassbroken boolean to true in Break Glass contract to give council members access to protected entrypoints
                    const triggerBreakGlassOperation : operation = Tezos.transaction(
                        unit,
                        0tez, 
                        triggerBreakGlass(breakGlassContractAddress)
                    );

                    // Trigger break glass in Governance contract - set Governance Contract admin to Break Glass Contract address
                    const triggerGovernanceBreakGlassOperation : operation = Tezos.transaction(
                        unit,
                        0tez, 
                        triggerBreakGlass(governanceAddress)
                    );

                    // Update emergency governance record
                    _emergencyGovernance.executed            := True;
                    _emergencyGovernance.executedDateTime    := Tezos.get_now();
                    _emergencyGovernance.executedLevel       := Tezos.get_level();
                    
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



 (* dropEmergencyGovernance lambda  *)
function lambdaDropEmergencyGovernance(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that there is an active emergency governance
    // 2. Get current Emergency Governance Record 
    //    - Check that emergency governance has not been executed
    // 3. Check that sender is the proposer of the emergency governance
    // 4. Update Emergency Governance Record dropped boolean to true and update storage
    // 5. Reset currentEmergencyGovernanceId to 0

    checkNoAmount(Unit); // entrypoint should not receive any tez amount  

    case emergencyGovernanceLambdaAction of [
        |   LambdaDropEmergencyGovernance(_parameters) -> {
                
                // Check that there is an active emergency governance
                if s.currentEmergencyGovernanceId = 0n then failwith(error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS)
                else skip;

                // Get current Emergency Governance Record
                var emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of [ 
                    |   None            -> failwith(error_EMERGENCY_GOVERNANCE_NOT_FOUND)
                    |   Some(_instance) -> _instance
                ];

                // Check that emergency governance has not been executed
                if emergencyGovernance.executed then failwith(error_EMERGENCY_GOVERNANCE_EXECUTED)
                else skip;

                // Check that sender is the proposer of the emergency governance
                if emergencyGovernance.proposerAddress =/= Tezos.get_sender() then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // Update Emergency Governance Record dropped boolean to true and update storage
                emergencyGovernance.dropped := True; 
                s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := emergencyGovernance;

                // Reset currentEmergencyGovernanceId to 0
                s.currentEmergencyGovernanceId := 0n; 

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Emergency Governance Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Emergency Governance Lambdas End
//
// ------------------------------------------------------------------------------
