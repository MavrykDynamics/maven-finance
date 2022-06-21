// ------------------------------------------------------------------------------
//
// Emergency Governance Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s); 

    case emergencyGovernanceLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);

    case emergencyGovernanceLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage) : return is
block {

    checkSenderIsAdmin(s); 

    case emergencyGovernanceLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda  *)
function lambdaUpdateConfig(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); 

  case emergencyGovernanceLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : emergencyUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : emergencyUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    ConfigVoteExpiryDays (_v)                     -> s.config.voteExpiryDays                  := updateConfigNewValue
                  | ConfigRequiredFeeMutez (_v)                   -> s.config.requiredFeeMutez                := updateConfigNewValue * 1mutez
                  | ConfigStakedMvkPercentRequired (_v)           -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.stakedMvkPercentageRequired     := updateConfigNewValue  
                  | ConfigMinStakedMvkForVoting (_v)              -> if updateConfigNewValue < 10_000_000n then failwith(error_CONFIG_VALUE_TOO_LOW) else s.config.minStakedMvkRequiredToVote      := updateConfigNewValue
                  | ConfigMinStakedMvkForTrigger (_v)             -> if updateConfigNewValue < 10_000_000n then failwith(error_CONFIG_VALUE_TOO_LOW) else s.config.minStakedMvkRequiredToTrigger   := updateConfigNewValue
                  | ConfigProposalTitleMaxLength (_v)             -> s.config.proposalTitleMaxLength          := updateConfigNewValue
                  | ConfigProposalDescMaxLength (_v)              -> s.config.proposalDescMaxLength           := updateConfigNewValue
                ];

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda  *)
function lambdaUpdateGeneralContracts(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s: emergencyGovernanceStorage): return is
block {

    checkSenderIsAdmin(s);

    case emergencyGovernanceLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage): return is
block {
    
    checkSenderIsAdmin(s);
    
    case emergencyGovernanceLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s: emergencyGovernanceStorage): return is
block {

    var operations : list(operation) := nil;

    case emergencyGovernanceLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    // Check if token is not MVK (it would break SMVK) before creating the transfer operation
                    const transferTokenOperation : operation = case transferParam.token of [
                        | Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
                        | Fa12(token) -> transferFa12Token(Tezos.self_address, transferParam.to_, transferParam.amount, token)
                        | Fa2(token)  -> transferFa2Token(Tezos.self_address, transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                    ];
                  } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Emergency Governance Lambdas Begin
// ------------------------------------------------------------------------------

(* triggerEmergencyControl lambda  *)
function lambdaTriggerEmergencyControl(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage) : return is 
block {

    // Steps Overview:
    // 1. check that there is no currently active emergency governance being voted on
    // 2. operation to MVK token contract to get total supply -> then update temp total supply and emergency governce record min MVK required

    var operations : list(operation) := nil;

    case emergencyGovernanceLambdaAction of [
        | LambdaTriggerEmergencyControl(triggerEmergencyControlParams) -> {

            const userAddress: address  = Tezos.sender;
                
            if s.currentEmergencyGovernanceId = 0n 
            then skip
            else failwith(error_EMERGENCY_GOVERNANCE_ALREADY_IN_THE_PROCESS);

            // check if tez sent is equal to the required fee
            if Tezos.amount =/= s.config.requiredFeeMutez 
            then failwith(error_TEZ_FEE_NOT_PAID) 
            else skip;
            
            const generalContractsOptViewTax : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "taxTreasury", s.governanceAddress);
            const treasuryAddress: address = case generalContractsOptViewTax of [
                Some (_optionContract) -> case _optionContract of [
                        Some (_contract)    -> _contract
                    |   None                -> failwith (error_TAX_TREASURY_CONTRACT_NOT_FOUND)
                    ]
            |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
            ];

            const treasuryContract: contract(unit) = Tezos.get_contract_with_error(treasuryAddress, "Error. Contract not found at given address");
            const transferFeeToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.amount);

            // check if user has sufficient staked MVK to trigger emergency control
            const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
            const doormanAddress: address = case generalContractsOptViewDoorman of [
                Some (_optionContract) -> case _optionContract of [
                        Some (_contract)    -> _contract
                    |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                    ]
            |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
            ];

            const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
            const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                Some (value) -> value
              | None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
            ];
            
            if stakedMvkBalance < s.config.minStakedMvkRequiredToTrigger 
            then failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED) 
            else skip;

            // fetch staked MVK supply and calculate min staked MVK required for break glass to be triggered
            const balanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
            const stakedMvkTotalSupply: nat = case balanceView of [
                Some (value) -> value
            | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
            ];

            var stakedMvkRequiredForBreakGlass : nat := abs(s.config.stakedMvkPercentageRequired * stakedMvkTotalSupply / 10000);

            const title        : string  =  triggerEmergencyControlParams.title;
            const description  : string  =  triggerEmergencyControlParams.description;

            // validate input
            if String.length(title) > s.config.proposalTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
            if String.length(description) > s.config.proposalDescMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

            const emptyVotersMap : voterMapType = map[];
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

                  startDateTime                    = Tezos.now;
                  startLevel                       = Tezos.level;             
                  executedDateTime                 = Tezos.now;
                  executedLevel                    = Tezos.level;
                  expirationDateTime               = Tezos.now + (86_400 * s.config.voteExpiryDays);
              ];

              s.emergencyGovernanceLedger[s.nextEmergencyGovernanceId] := newEmergencyGovernanceRecord;
              s.currentEmergencyGovernanceId := s.nextEmergencyGovernanceId;
              s.nextEmergencyGovernanceId := s.nextEmergencyGovernanceId + 1n;

              // add to operations
              operations := list[transferFeeToTreasuryOperation];               

            }
        | _ -> skip
    ];

} with (operations, s)



(* voteForEmergencyControl lambda  *)
function lambdaVoteForEmergencyControl(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage) : return is 
block {

    // Steps Overview:
    // 1. check that emergency governance exist in the emergency governance ledger, and is currently active, and can be voted on
    // 2. check that user has not already voted for the emergency governance
    // 3. check proposer's staked MVK balance (via proxy) and increment totalMvkVotes by the balance

    checkNoAmount(Unit);

    var operations : list(operation) := nil;

    case emergencyGovernanceLambdaAction of [
        | LambdaVoteForEmergencyControl(_parameters) -> {

                const userAddress: address  = Tezos.sender;
                
                if s.currentEmergencyGovernanceId = 0n then failwith(error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS)
                else skip;

                var _emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of [
                    | None            -> failwith(error_EMERGENCY_GOVERNANCE_NOT_FOUND)
                    | Some(_instance) -> _instance
                ];

                // Check is user already voted
                if not Map.mem(userAddress, _emergencyGovernance.voters) then skip else failwith(error_EMERGENCY_GOVERNANCE_VOTE_ALEADY_REGISTERED);

                const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptViewDoorman of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];
                
                // get user staked MVK Balance
                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
                const stakedMvkBalance: nat = case stakedMvkBalanceView of [
                      Some (value) -> value
                    | None         -> failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND)
                ];

                if stakedMvkBalance > s.config.minStakedMvkRequiredToVote then skip else failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED);

                if _emergencyGovernance.dropped = True then failwith(error_EMERGENCY_GOVERNANCE_DROPPED)
                else skip; 

                if _emergencyGovernance.executed = True then failwith(error_EMERGENCY_GOVERNANCE_EXECUTED)
                else skip; 

                const totalStakedMvkVotes : nat = _emergencyGovernance.totalStakedMvkVotes + stakedMvkBalance;

                _emergencyGovernance.voters[userAddress] := (stakedMvkBalance, Tezos.now);
                _emergencyGovernance.totalStakedMvkVotes := totalStakedMvkVotes;
                s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := _emergencyGovernance;

                // check if total votes has exceed threshold - if yes, trigger operation to break glass contract
                if totalStakedMvkVotes > _emergencyGovernance.stakedMvkRequiredForBreakGlass then block {

                    const generalContractsOptViewBreakGlass : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "breakGlass", s.governanceAddress);
                    const breakGlassContractAddress: address = case generalContractsOptViewBreakGlass of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_BREAK_GLASS_CONTRACT_NOT_FOUND)
                            ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                    ];
                    const governanceContractAddress : address = s.governanceAddress;

                    // trigger break glass in break glass contract - set glassbroken to true in breakglass contract to give council members access to protected entrypoints
                    const triggerBreakGlassOperation : operation = Tezos.transaction(
                        unit,
                        0tez, 
                        triggerBreakGlass(breakGlassContractAddress)
                    );

                    // trigger break glass in governance contract - send operations to pause all entrypoints and change contract admin to break glass address
                    const triggerGovernanceBreakGlassOperation : operation = Tezos.transaction(
                        unit,
                        0tez, 
                        triggerBreakGlass(governanceContractAddress)
                    );

                    // update emergency governance record
                    _emergencyGovernance.executed            := True;
                    _emergencyGovernance.executedDateTime    := Tezos.now;
                    _emergencyGovernance.executedLevel       := Tezos.level;
                    
                    // save emergency governance record
                    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId]  := _emergencyGovernance;

                    operations := list[triggerGovernanceBreakGlassOperation;triggerBreakGlassOperation];

                } else skip;

            }
        | _ -> skip
    ];

} with (operations, s)



 (* dropEmergencyGovernance lambda  *)
function lambdaDropEmergencyGovernance(const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorage) : return is 
block {

    // Steps Overview:
    // 1. check that emergency governance exist in the emergency governance ledger, and is currently active, and can be voted on
    // 2. check that satellite is proposer of emergency governance
    // 3. change emergency governance proposal to inactive and reset currentEmergencyGovernanceId
    
    checkNoAmount(Unit);

    case emergencyGovernanceLambdaAction of [
        | LambdaDropEmergencyGovernance(_parameters) -> {
                
                if s.currentEmergencyGovernanceId = 0n then failwith(error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS)
                else skip;

                var emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of [ 
                    | None            -> failwith(error_EMERGENCY_GOVERNANCE_NOT_FOUND)
                    | Some(_instance) -> _instance
                ];

                if emergencyGovernance.executed then failwith(error_EMERGENCY_GOVERNANCE_EXECUTED)
                else skip;

                if emergencyGovernance.proposerAddress =/= Tezos.sender then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                emergencyGovernance.dropped := True; 
                s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := emergencyGovernance;

                s.currentEmergencyGovernanceId := 0n; 

            }
        | _ -> skip
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
