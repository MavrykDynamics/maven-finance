// ------------------------------------------------------------------------------
//
// Governance Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Lambda Begin
// ------------------------------------------------------------------------------

(*  breakGlass lambda *)
function lambdaBreakGlass(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that sender is from the Emergency Governance Gontract 
    // 2. Get Break Glass Contract address from the general contracts map
    // 3. Set Governance Contract admin to the Break Glass Contract


    checkSenderIsEmergencyGovernanceContract(s); // Check that sender is from the Emergency Governance Gontract 

    case governanceLambdaAction of [
        |   LambdaBreakGlass(_parameters) -> {
                
                // Get Break Glass Contract address from the general contracts map
                const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
                        Some(_address) -> _address
                    |   None           -> failwith(error_BREAK_GLASS_CONTRACT_NOT_FOUND)
                ];

                // Set Governance Contract admin to the Break Glass Contract
                s.admin := _breakGlassAddress;

            }
        |    _ -> skip
    ];
    
} with (noOperations, s)



(*  propagateBreakGlass lambda *)
function lambdaPropagateBreakGlass(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that sender is admin (if glass has been broken, admin should be the Break Glass Contract)
    // 2. Get Break Glass Contract address from the general contracts map
    // 3. Check if glass is broken on the Break Glass Contract
    // 4. Loop to propagate break glass in all general contracts 
    //      -   First, trigger pauseAll entrypoint in contract 
    //      -   Second, trigger setAdmin entrypoint in contract to change admin to Break Glass Contract


    checkSenderIsAdmin(s); // Check that sender is admin (if glass has been broken, admin should be the Break Glass Contract)

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaPropagateBreakGlass(_parameters) -> {
                
                // Get Break Glass Contract address from the general contracts map
                const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
                        Some(_address) -> _address
                    |   None           -> failwith(error_BREAK_GLASS_CONTRACT_NOT_FOUND)
                ];

                // Check if glass is broken on the Break Glass Contract
                const glassBrokenView : option (bool) = Tezos.call_view ("getGlassBroken", unit, _breakGlassAddress);
                const glassBroken : bool = case glassBrokenView of [
                        Some (_glassBroken) -> _glassBroken
                    |   None                -> failwith (error_GET_GLASS_BROKEN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND)
                ];

                if glassBroken then skip else failwith(error_GLASS_NOT_BROKEN);

                // Loop to propagate break glass in all general contracts
                for _contractName -> contractAddress in map s.generalContracts block {
                    
                    // 1. First, trigger pauseAll entrypoint in contract 
                    // 2. Second, trigger setAdmin entrypoint in contract to change admin to Break Glass Contract

                    case (Tezos.get_entrypoint_opt("%setAdmin", contractAddress) : option(contract(address))) of [
                            Some(contr) -> operations := Tezos.transaction(_breakGlassAddress, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                    
                    case (Tezos.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                } 

            }
        |   _ -> skip
    ];
    
} with (operations, s)

// ------------------------------------------------------------------------------
// Break Glass Lambda End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin 
    // 2. Check that no tez is sent to the entrypoint
    // 3. Validation check for new admin address
    //      -   Check if the new admin address is a whitelisted developer or the current Governance Proxy Contract address
    //      -   Check if the new admin address is the Break Glass Contract
    // 4. Set new admin address
    

    checkNoAmount(Unit);    // check that no tez is sent to the entrypoint
    checkSenderIsAdmin(s);  // check that sender is admin (i.e. Governance Proxy Contract address)
    
    case governanceLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {

                // Check if the new admin address is a whitelisted developer or the current Governance Proxy Contract address
                if not Set.mem(newAdminAddress, s.whitelistDevelopers) and newAdminAddress =/= s.governanceProxyAddress then {

                    // Check if the new admin address is the Break Glass contract
                    const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
                            Some(_address) -> _address
                        |   None           -> failwith(error_BREAK_GLASS_CONTRACT_NOT_FOUND)
                    ];

                    if newAdminAddress = _breakGlassAddress then skip
                    else failwith(error_ONLY_BREAK_GLASS_CONTRACT_OR_DEVELOPERS_OR_PROXY_CONTRACT_ALLOWED)
                }
                else skip;
                
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernanceProxy lambda *)
function lambdaSetGovernanceProxy(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin 
    // 2. Check that no tez is sent to the entrypoint
    // 3. Set new Governance Proxy Contract address
    

    checkNoAmount(Unit);    // check that no tez is sent to the entrypoint
    checkSenderIsAdmin(s);  // check that sender is admin
    
    case governanceLambdaAction of [
        |   LambdaSetGovernanceProxy(newGovernanceProxyAddress) -> {
                s.governanceProxyAddress := newGovernanceProxyAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)


(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin 
    // 2. Check that no tez is sent to the entrypoint
    // 3. Set new contract metadata
    

    checkNoAmount(Unit);    // check that no tez is sent to the entrypoint
    checkSenderIsAdmin(s);  // check that sender is admin 

    case governanceLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that sender is admin 
    // 2. Check that no tez is sent to the entrypoint
    // 3. Update config with new input (validate if necessary)


    checkNoAmount(Unit);   // check that no tez is sent to the entrypoint
    checkSenderIsAdmin(s); // check that sender is admin

    case governanceLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : governanceUpdateConfigActionType     = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceUpdateConfigNewValueType   = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                        ConfigSuccessReward (_v)                          -> s.config.successReward                           := updateConfigNewValue
                    |   ConfigCycleVotersReward (_v)                      -> s.config.cycleVotersReward                       := updateConfigNewValue
                    |   ConfigMinProposalRoundVotePct (_v)                -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minProposalRoundVotePercentage := updateConfigNewValue
                    |   ConfigMinProposalRoundVotesReq (_v)               -> s.config.minProposalRoundVotesRequired           := updateConfigNewValue
                    |   ConfigMinQuorumPercentage (_v)                    -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minQuorumPercentage            := updateConfigNewValue
                    |   ConfigMinYayVotePercentage (_v)                   -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minYayVotePercentage           := updateConfigNewValue
                    |   ConfigProposeFeeMutez (_v)                        -> s.config.proposalSubmissionFeeMutez              := updateConfigNewValue * 1mutez                    
                    |   ConfigMaxProposalsPerSatellite (_v)               -> s.config.maxProposalsPerSatellite                := updateConfigNewValue
                    |   ConfigBlocksPerProposalRound (_v)                 -> if updateConfigNewValue > (Tezos.get_level() + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerProposalRound     := updateConfigNewValue
                    |   ConfigBlocksPerVotingRound (_v)                   -> if updateConfigNewValue > (Tezos.get_level() + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerVotingRound       := updateConfigNewValue
                    |   ConfigBlocksPerTimelockRound (_v)                 -> if updateConfigNewValue > (Tezos.get_level() + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerTimelockRound     := updateConfigNewValue
                    |   ConfigProposalDatTitleMaxLength (_v)              -> s.config.proposalDataTitleMaxLength              := updateConfigNewValue
                    |   ConfigProposalTitleMaxLength (_v)                 -> s.config.proposalTitleMaxLength                  := updateConfigNewValue
                    |   ConfigProposalDescMaxLength (_v)                  -> s.config.proposalDescriptionMaxLength            := updateConfigNewValue
                    |   ConfigProposalInvoiceMaxLength (_v)               -> s.config.proposalInvoiceMaxLength                := updateConfigNewValue
                    |   ConfigProposalCodeMaxLength (_v)                  -> s.config.proposalSourceCodeMaxLength             := updateConfigNewValue
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin or whitelisted (e.g. Factory contracts)
    // 2. Check that no tez is sent to the entrypoint
    // 3. Update general contracts map

    
    checkSenderIsWhitelistedOrAdmin(s); // check that sender is admin or whitelisted (e.g. Factory contracts)
    checkNoAmount(Unit);                // check that no tez is sent to the entrypoint
    
    case governanceLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin 
    // 2. Check that no tez is sent to the entrypoint
    // 3. Update whitelist contracts map

    
    checkSenderIsAdmin(s);  // check that sender is admin
    checkNoAmount(Unit);    // check that no tez is sent to the entrypoint
    
    case governanceLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistDevelopersContracts lambda *)
function lambdaUpdateWhitelistDevelopers(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin 
    // 2. Check that no tez is sent to the entrypoint
    // 3. Remove developer address if it is already present in the whitelist developers set, otherwise add developer address
    //      -   Check that there will always be at least one whitelisted developer address present


    checkSenderIsAdmin(s);  // check that sender is admin
    checkNoAmount(Unit);    // check that no tez is sent to the entrypoint

    case governanceLambdaAction of [
        |   LambdaUpdateWhitelistDevelopers(developer) -> 

            if Set.mem(developer, s.whitelistDevelopers) then 
                
                if Set.cardinal(s.whitelistDevelopers) > 1n then 
                    s.whitelistDevelopers := Set.remove(developer, s.whitelistDevelopers)
                else failwith(error_NOT_ENOUGH_WHITELISTED_DEVELOPERS)

            else

                s.whitelistDevelopers := Set.add(developer, s.whitelistDevelopers)

        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent


    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is admin or the Governance Satellite Contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam : transferDestinationType; const operationList: list(operation)) : list(operation) is
                    block{

                        const transferTokenOperation : operation = case transferParam.token of [
                            |   Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address") : contract(unit)), transferParam.amount * 1mutez)
                            |   Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                            |   Fa2(token)  -> transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                        ];

                    } with (transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(*  setContractAdmin lambda *)
function lambdaSetContractAdmin(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin 
    // 2. Check that no tez is sent to the entrypoint
    // 3. Create operation to set new admin of contract

    checkSenderIsAdmin(s);  // check that sender is admin
    checkNoAmount(Unit);    // check that no tez is sent to the entrypoint    

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaSetContractAdmin(setContractAdminParams) ->
                
                // Create operation to set new admin of contract
                operations := Tezos.transaction(
                    (setContractAdminParams.newContractAdmin), 
                    0tez, 
                    getSetAdminEntrypoint(setContractAdminParams.targetContractAddress)
                ) # operations

        |   _ -> skip
    ];

} with (operations, s)



(*  setContractGovernance lambda *)
function lambdaSetContractGovernance(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin 
    // 2. Check that no tez is sent to the entrypoint
    // 3. Create operation to set new Governance Address of contract

    checkSenderIsAdmin(s);  // check that sender is admin
    checkNoAmount(Unit);    // check that no tez is sent to the entrypoint    

    // Operations list
    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaSetContractGovernance(setContractGovernanceParams) ->
                
                // Set new Governance address in contract
                operations := Tezos.transaction(
                    (setContractGovernanceParams.newContractGovernance), 
                    0tez, 
                    getSetGovernanceEntrypoint(setContractGovernanceParams.targetContractAddress)
                ) # operations

        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Cycle Lambdas Begin
// ------------------------------------------------------------------------------

(*  updateSatelliteSnapshot lambda *)
function lambdaUpdateSatelliteSnapshot(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaUpdateSatelliteSnapshot(updateSatelliteSnapshotParams) -> {

                // Check sender is in the whitelist contracts or is the admin
                checkSenderIsWhitelistedOrAdmin(s);
                
                // Update the storage with the new snapshot
                s   := updateSatelliteSnapshotRecord(updateSatelliteSnapshotParams, s);

            }
        |   _ -> skip
    ];  

} with (operations, s)



(*  startNextRound lambda *)
function lambdaStartNextRound(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that current round has not ended
    // 2. Find the highest voted proposal and its respective vote count in the round proposals map
    //      -   Get the proposal record of the highest voted proposal
    // 3. Evaluate conditions to start next round given the current round
    //      -   Current Round is a Proposal Round 
    //          -   Get the highest voted proposal (if any) and check condition if it has reached the minProposalRoundVotesRequired to move on to the Voting Round
    //          -   If conditions are fulfilled, start voting round with highest voted proposal from proposal round
    //          -   If conditions are not fulfilled, start a new proposal round
    //      -   Current Round is a Voting Round 
    //          -   Send governance rewards to all satellite voters (if there is at least one)
    //          -   Calculate YAY votes required for proposal to be successful and move on to the Timelock round
    //          -   Calculate if quorum and vote conditions fulfilled for proposal to be successful
    //              -   N.B. Quorum votes is the equivalent to total number of votes (YAY, NAY, PASS)
    //              -   Success conditions: Quorum threshold reached, YAY votes threshold reached, YAY votes greater than NAY votes
    //          -   If conditions are fulfilled, start timelock round 
    //          -   If conditions are not fulfilled, start a new proposal round
    //      -   Current Round is a Timelock Round 
    //          -   Start a new proposal round
    //          -   Execute timelocked proposal if boolean input is True
    //          -   If proposal is too large for execution (e.g. gas cost exceed limits), set boolean to False 
    //              and execute proposal manually through the %processProposalSingleData entrypoint


    // Check that current round has not ended
    if Tezos.get_level() < s.currentCycleInfo.roundEndLevel
    then failwith(error_CURRENT_ROUND_NOT_FINISHED) 
    else skip;

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaStartNextRound(executePastProposal) -> {
                
                // Get current round variables
                const currentRoundHighestVotedProposal: option(proposalRecordType) = Big_map.find_opt(s.cycleHighestVotedProposalId, s.proposalLedger);

                // calculate difference in block levels that have passed - how many cycles have passed


                // Evaluate conditions to start next round given the current round
                case s.currentCycleInfo.round of [

                        Proposal -> case currentRoundHighestVotedProposal of [
                                
                                // Current Round is a Proposal Round 
                                //  -   Get the highest voted proposal (if any) and check conditions if it has reached the minProposalRoundVotesRequired to move on to the Voting Round
                                //  -   If conditions are fulfilled, start voting round with highest voted proposal from proposal round
                                //  -   If conditions are not fulfilled, start a new proposal round

                                Some (proposal) -> if s.cycleHighestVotedProposalId =/= 0n and proposal.proposalVoteStakedMvkTotal >= proposal.minProposalRoundVotesRequired 
                                    
                                    then

                                        // Start voting round with highest voted proposal from proposal round
                                        s := setupVotingRound(s)

                                    else

                                        // Conditions not fulfilled - Restart a new proposal round
                                        s := setupProposalRound(s)

                            |   None -> s := setupProposalRound(s)
                        ]
                    
                    |   Voting -> case currentRoundHighestVotedProposal of [

                            // Current Round is a Voting Round 
                            //  -   Send governance rewards to all satellite voters (if there is at least one)
                            //  -   Calculate YAY votes required for proposal to be successful and move on to the Timelock round
                            //  -   Calculate if quorum and vote conditions fulfilled for proposal to be successful
                            //          -   N.B. Quorum votes is the equivalent to total number of votes (YAY, NAY, PASS)
                            //          -   Success conditions: Quorum threshold reached, YAY votes threshold reached, YAY votes greater than NAY votes
                            //  -   If conditions are fulfilled, start timelock round 
                            //  -   If conditions are not fulfilled, start a new proposal round
                        
                            Some (proposal) -> block{

                                // Enable the claim for the satellite who voted
                                var highestVotedProposal                        := proposal;
                                highestVotedProposal.rewardClaimReady           := True;
                                s.proposalLedger[s.cycleHighestVotedProposalId] := highestVotedProposal;

                                // Calculate YAY votes required for proposal to be successful and move on to the Timelock round
                                const yayVotesRequired: nat = (proposal.quorumStakedMvkTotal * proposal.minYayVotePercentage) / 10000n;

                                // Calculate if quorum and vote conditions fulfilled for proposal to be successful
                                if proposal.quorumStakedMvkTotal < proposal.minQuorumStakedMvkTotal or proposal.yayVoteStakedMvkTotal < yayVotesRequired or proposal.yayVoteStakedMvkTotal < proposal.nayVoteStakedMvkTotal then {
                                
                                    // Conditions not fulfilled - restart a new proposal round
                                    s := setupProposalRound(s);

                                } else block {

                                    // Conditions fulfilled - start timelock round
                                    s := setupTimelockRound(s);
                                };
                            }

                        |   None -> failwith(error_HIGHEST_VOTED_PROPOSAL_NOT_FOUND)
                    ]

                    |   Timelock -> block {

                            // Current Round is a Timelock Round 
                            //  -   Mark the timelock proposal as ready to execute
                            //  -   Execute timelocked proposal if boolean input is True
                            //          - If proposal is too large for execution (e.g. gas cost exceed limits), set boolean to False 
                            //            and execute proposal manually through the %processProposalSingleData entrypoint
                            //  -   Start a new proposal round

                            // Execute timelocked proposal if boolean input is True
                            if s.timelockProposalId =/= 0n then {
                                // Mark the proposal as ready to execute even if it's not executed during this cycle
                                var proposalToExecute                           := case Big_map.find_opt(s.timelockProposalId, s.proposalLedger) of [
                                        Some (_proposal)    -> _proposal
                                    |   None                -> failwith(error_PROPOSAL_NOT_FOUND)
                                ];
                                proposalToExecute.executionReady                := True;
                                s.proposalLedger[s.timelockProposalId]          := proposalToExecute;

                                // Execute the timelock proposal if the boolean was set to true
                                if executePastProposal then operations := Tezos.transaction((s.timelockProposalId), 0tez, getExecuteProposalEntrypoint(Tezos.get_self_address())) # operations 
                                else skip;
                            } else skip;

                            // Start proposal round 
                            s := setupProposalRound(s);
                        }
                ];

            }
        |   _ -> skip
    ];  

} with (operations, s)



(* propose lambda *)
function lambdaPropose(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that the current round is a Proposal round
    // 2. Satellite Permissions Check
    //      -   Check that satellite exists and is not suspended or banned
    //      -   Check that satellite snapshot exists (taken when proposal round was started)
    // 3. Process Proposal Submission Fee
    //      -   Check if Tez sent is equal to the required proposal submission fee
    //      -   Get Tax Treasury from General Contracts map
    //      -   Create operation to transfer submission fee to treasury
    // 4. Validation Checks
    //      -   Validate inputs (max length not exceeded)
    //      -   Get Delegation Contract from General Contracts Map
    //      -   Get Delegation Contract Config
    //      -   Get minimumStakedMvkBalance from Delegation Contract Config
    //      -   Check if satellite has sufficient staked MVK to make a proposal 
    // 5. Create New Proposal
    //      -   Get total number of proposals from satellite for current cycle
    //      -   Check that satellite's total number of proposals does not exceed the maximum set in config (spam check)
    //      -   Create new proposal record
    // 6. Update Storage
    //      -   Save proposal to proposalLedger
    //      -   Add new proposal to satellite's proposals set
    // 7. Add Proposal Metadata and Payment Metadata 
    //      -   Create operations to add proposal metadata
    //      -   Create operations to add proposal payment metadata
    // 8. Add proposal id to current round proposals and initialise with zero positive votes in MVK 
    // 9. Increment next proposal id


    // Check that the current round is a Proposal round
    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaPropose(newProposal) -> {

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Check that satellite exists and is not suspended or banned
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                        Some (_contractAddress) -> _contractAddress
                    |   None                    -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                checkSatelliteStatus(Tezos.get_sender(), delegationAddress, True, True);

                // Check that satellite snapshot exists (taken when proposal round was started)
                s   := checkSatelliteSnapshot(Tezos.get_sender(), s);
                const satelliteSnapshot : governanceSatelliteSnapshotRecordType = case s.snapshotLedger[(s.cycleId,Tezos.get_sender())] of [
                        None           -> failwith(error_SNAPSHOT_NOT_FOUND)
                    |   Some(snapshot) -> snapshot
                ];

                // ------------------------------------------------------------------
                // Process Proposal Submission Fee
                // ------------------------------------------------------------------

                // check if tez sent is equal to the required fee
                if Tezos.get_amount() =/= s.config.proposalSubmissionFeeMutez 
                then failwith(error_TEZ_FEE_NOT_PAID) 
                else skip;

                // Get Tax Treasury from General Contracts map
                const treasuryAddress : address = case s.generalContracts["taxTreasury"] of [
                        Some(_address) -> _address
                    |   None           -> failwith(error_PROPOSE_TAX_TREASURY_CONTRACT_NOT_FOUND)
                ];

                // Create operation to transfer submission fee to treasury
                const treasuryContract : contract(unit) = Tezos.get_contract_with_error(treasuryAddress, "Error. Contract not found at given address");
                const transferFeeToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.get_amount());
                
                operations  := transferFeeToTreasuryOperation # operations;
                
                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------
                
                // Validate inputs (max length not exceeded)
                if String.length(newProposal.title)         > s.config.proposalTitleMaxLength       then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newProposal.description)   > s.config.proposalDescriptionMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newProposal.invoice)       > s.config.proposalInvoiceMaxLength     then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newProposal.sourceCode)    > s.config.proposalSourceCodeMaxLength  then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Get Delegation Contract from General Contracts Map
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                        Some(_address) -> _address
                    |   None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract Config
                const delegationConfigView : option (delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationConfig : delegationConfigType                = case delegationConfigView of [
                        Some (_config) -> _config
                    |   None           -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Get minimumStakedMvkBalance from Delegation Contract Config
                const minimumMvkRequiredForProposalSubmission = delegationConfig.minimumStakedMvkBalance;

                // Check if satellite has sufficient staked MVK to make a proposal 
                if satelliteSnapshot.totalStakedMvkBalance < minimumMvkRequiredForProposalSubmission then failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip; 

                // ------------------------------------------------------------------
                // Create new proposal
                // ------------------------------------------------------------------

                // init new proposal params
                const proposalId                : nat                                     = s.nextProposalId;
                const emptyVotersSet            : set(address)                            = set [];
                const proposalData              : map(nat, option(proposalDataType))      = map [];
                const paymentData               : map(nat, option(paymentDataType))       = map [];

                // Get total number of proposals from satellite for current cycle
                var satelliteProposals : set(nat) := case s.cycleProposers[(s.cycleId,Tezos.get_sender())] of [
                        Some (_proposals) -> _proposals
                    |   None              -> Set.empty
                ];

                // Check that satellite's total number of proposals does not exceed the maximum set in config (spam check)
                if s.config.maxProposalsPerSatellite > Set.cardinal(satelliteProposals) then skip
                else failwith(error_MAX_PROPOSAL_REACHED);

                // Create new proposal record
                var newProposalRecord : proposalRecordType := record [

                    proposerAddress                     = Tezos.get_sender();
                    proposalData                        = proposalData;
                    proposalDataExecutionCounter        = 0n;
                    paymentData                         = paymentData;

                    status                              = "ACTIVE";                                     // status : "ACTIVE", "DROPPED"
                    title                               = newProposal.title;                            // title
                    description                         = newProposal.description;                      // description
                    invoice                             = newProposal.invoice;                          // ipfs hash of invoice file
                    sourceCode                          = newProposal.sourceCode;                       // source code repo url

                    successReward                       = s.config.successReward;                       // log of successful proposal reward for voters - may change over time
                    totalVotersReward                   = s.currentCycleInfo.cycleTotalVotersReward;    // log of the cycle total rewards for voters
                    executed                            = False;                                        // boolean: executed set to true if proposal is executed
                    paymentProcessed                    = False;                                        // boolean: set to true if proposal payment has been processed 
                    locked                              = False;                                        // boolean: locked set to true after proposer has included necessary metadata and proceed to lock proposal
                    rewardClaimReady                    = False;                                        // boolean: set to true if the voters are able to claim the rewards
                    executionReady                      = False;                                        // boolean: set to true if the proposal can be executed

                    proposalVoteCount                   = 0n;                                           // proposal round: pass votes count (to proceed to voting round)
                    proposalVoteStakedMvkTotal          = 0n;                                           // proposal round pass vote total mvk from satellites who voted pass

                    minProposalRoundVotePercentage      = s.config.minProposalRoundVotePercentage;      // min vote percentage of total MVK supply required to pass proposal round
                    minProposalRoundVotesRequired       = s.config.minProposalRoundVotesRequired;       // min staked MVK votes required for proposal round to pass

                    yayVoteCount                        = 0n;                                           // voting round: yay count
                    yayVoteStakedMvkTotal               = 0n;                                           // voting round: yay MVK total 
                    nayVoteCount                        = 0n;                                           // voting round: nay count
                    nayVoteStakedMvkTotal               = 0n;                                           // voting round: nay MVK total 
                    passVoteCount                       = 0n;                                           // voting round: pass count
                    passVoteStakedMvkTotal              = 0n;                                           // voting round: pass MVK total 
                    voters                              = emptyVotersSet;                               // voting round ledger

                    minQuorumPercentage                 = s.config.minQuorumPercentage;                 // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
                    minQuorumStakedMvkTotal             = s.currentCycleInfo.minQuorumStakedMvkTotal;   // log of min quorum in MVK
                    minYayVotePercentage                = s.config.minYayVotePercentage;                // log of min yay votes percentage - capture state at this point
                    quorumCount                         = 0n;                                           // log of turnout for voting round - number of satellites who voted
                    quorumStakedMvkTotal                = 0n;                                           // log of total positive votes in MVK  
                    startDateTime                       = Tezos.get_now();                                    // log of when the proposal was proposed

                    cycle                               = s.cycleId;
                    currentCycleStartLevel              = s.currentCycleInfo.roundStartLevel;           // log current round/cycle start level
                    currentCycleEndLevel                = s.currentCycleInfo.cycleEndLevel;             // log current cycle end level

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Save proposal to proposalLedger
                s.proposalLedger[proposalId]                            := newProposalRecord;

                // Add new proposal to satellite's proposals set
                satelliteProposals                                      := Set.add(proposalId, satelliteProposals);
                s.cycleProposers[(s.cycleId,Tezos.get_sender())]        := satelliteProposals;

                // ------------------------------------------------------------------
                // Add Proposal Metadata and Payment Metadata 
                // ------------------------------------------------------------------
                // N.B. Metadata is bytecode of changes/operations that Satellite is proposing to be executed

                // Check if there are proposal or payment data
                const proposalHasProposalData : bool    = case newProposal.proposalData of [
                        Some (_data)    -> True
                    |   None            -> False
                ];
                const proposalHasPaymentData : bool     = case newProposal.paymentData of [
                        Some (_data)    -> True
                    |   None            -> False
                ];

                // Create operations to add proposal and payment data
                if proposalHasProposalData or proposalHasPaymentData then block {
                    
                    // Init params
                    const updateProposalDataParams : updateProposalType = record[
                        proposalId      = proposalId;
                        proposalData    = newProposal.proposalData;
                        paymentData     = newProposal.paymentData;
                    ];

                    // Create operation
                    operations  := Tezos.transaction(
                        updateProposalDataParams,
                        0tez, 
                        getUpdateProposalDataEntrypoint(Tezos.get_self_address())
                    ) # operations;

                } else skip;

                // Add proposal id to current round proposals and initialise with zero positive votes in MVK 
                s.cycleProposals    := Map.add(proposalId, 0n, s.cycleProposals);

                // Increment next proposal id
                s.nextProposalId    := proposalId + 1n;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* updateProposalData lambda *)
function lambdaUpdateProposalData(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that the current round is a Proposal round
    // 2. Satellite Permissions Check
    //      -   Check that satellite exists and is not suspended or banned
    // 3. Validation Checks
    //      -   Validate inputs (max length not exceeded)
    //      -   Check that proposal is not locked
    //      -   Check that sender is the creator of the proposal 
    // 4. Create new proposal metadata
    //      -   Calculate the index on where the metadata should be added in the map (index -> proposalData)
    //      -   Entries should have unique names in the proposal. The data will be added to the map if its name is unique 
    // 5. If the data is unique, it will be added to the proposal metadata map
    // 6. Save changes and update proposal ledger


    // Check that the current round is a Proposal round
    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        |   LambdaUpdateProposalData(updateProposalDataParams) -> {

                // init params
                const proposalId    : nat                               = updateProposalDataParams.proposalId;
                const proposalData  : option(updateProposalDataType)    = updateProposalDataParams.proposalData;
                const paymentData   : option(updatePaymentDataType)     = updateProposalDataParams.paymentData;

                // Get proposal record
                var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of [ 
                        Some(_record) -> _record
                    |   None          -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------
                
                // Retrieve title max length from config
                const proposalDataTitleMaxLength : nat  = s.config.proposalDataTitleMaxLength;

                // Check that proposal is not locked
                if proposalRecord.locked = True then failwith(error_PROPOSAL_LOCKED)
                else skip;

                // Check that sender is the creator of the proposal 
                if proposalRecord.proposerAddress =/= Tezos.get_sender() and Tezos.get_self_address() =/= Tezos.get_sender() then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Check if satellite exists and is not suspended or banned
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                        Some (_contractAddress) -> _contractAddress
                    |   None                    -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                checkSatelliteStatus(proposalRecord.proposerAddress, delegationAddress, True, True);

                // ------------------------------------------------------------------
                // Update proposal data
                // ------------------------------------------------------------------

                proposalRecord.proposalData := case proposalData of [
                        Some (_proposalData)    -> List.fold(
                                function(const proposalData : proposalDataMapType; const updateProposalData : updateProposalDataVariantType) : proposalDataMapType is
                                    case updateProposalData of [
                                            AddOrSetProposalData (data) -> if String.length(data.title) > proposalDataTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else addOrSetProposalData(data, proposalData)
                                        |   RemoveProposalData (data)   -> removeProposalData(data, proposalData)
                                    ],
                                _proposalData,
                                proposalRecord.proposalData
                            )
                    |   None                    -> proposalRecord.proposalData
                ];

                // ------------------------------------------------------------------
                // Update payment data
                // ------------------------------------------------------------------

                proposalRecord.paymentData := case paymentData of [
                        Some (_paymentData)    -> List.fold(
                                function(const paymentData : proposalPaymentDataMapType; const updatePaymentData : updatePaymentDataVariantType) : proposalPaymentDataMapType is
                                    case updatePaymentData of [
                                            AddOrSetPaymentData (data) -> if String.length(data.title) > proposalDataTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else addOrSetPaymentData(data, paymentData)
                                        |   RemovePaymentData (data)   -> removePaymentData(data, paymentData)
                                    ],
                                _paymentData,
                                proposalRecord.paymentData
                            )
                    |   None                    -> proposalRecord.paymentData
                ];

                // Save changes and update proposal ledger
                s.proposalLedger[proposalId] := proposalRecord;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* lockProposal lambda *)
function lambdaLockProposal(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that the current round is a Proposal round
    // 2. Get proposal record
    // 3. Validation Checks
    //      -   Check that satellite exists and is not suspended or banned
    //      -   Check that sender is the creator of the proposal 
    //      -   Check that proposal is not locked
    // 4. Lock proposal and update proposal ledger


    // Check that the current round is a Proposal round
    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        |   LambdaLockProposal(proposalId) -> {
                
                // Get proposal record
                var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of [ 
                        Some(_record) -> _record
                    |   None          -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // Check if satellite exists and is not suspended or banned
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                        Some (_contractAddress) -> _contractAddress
                    |   None                    -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                checkSatelliteStatus(proposalRecord.proposerAddress, delegationAddress, True, True);

                // Check that sender is the creator of the proposal 
                if proposalRecord.proposerAddress =/= Tezos.get_sender() then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // Check that proposal is not locked
                if proposalRecord.locked = True then failwith(error_PROPOSAL_LOCKED)
                else skip;

                // Lock proposal and update proposal ledger
                proposalRecord.locked        := True; 
                s.proposalLedger[proposalId] := proposalRecord;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* proposalRoundVote lambda *)
function lambdaProposalRoundVote(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that the current round is a Proposal round
    // 2. Satellite Permissions Check
    //      -   Check that satellite exists and is not suspended or banned
    // 3. Validation Checks
    //      -   Check that proposal exists in the current round's proposals
    //      -   Check that proposal has not been dropped
    //      -   Check that proposal is locked
    // 4. Compute votes
    //      -   If satellite has not voted for other proposals
    //          -   Update proposal with satellite's vote
    //      -   If satellite has voted for other proposals
    //          -   Recalculate votes for previous proposal voted on 
    //          -   Update proposal with satellite's vote


    // Check that the current round is a Proposal round
    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        |   LambdaProposalRoundVote(proposalId) -> {
                
                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Check that satellite exists and is not suspended or banned
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                        Some (_contractAddress) -> _contractAddress
                    |   None                    -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                checkSatelliteStatus(Tezos.get_sender(), delegationAddress, True, True);

                // Check that satellite snapshot exists (taken when proposal round was started)
                s   := checkSatelliteSnapshot(Tezos.get_sender(), s);
                const satelliteSnapshot : governanceSatelliteSnapshotRecordType = case s.snapshotLedger[(s.cycleId,Tezos.get_sender())] of [
                        None           -> failwith(error_SNAPSHOT_NOT_FOUND)
                    |   Some(snapshot) -> snapshot
                ];

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check that proposal exists in the current round's proposals
                const checkProposalExistsFlag : bool = Map.mem(proposalId, s.cycleProposals);
                if checkProposalExistsFlag = False then failwith(error_PROPOSAL_NOT_FOUND)
                else skip;

                // Get Proposal Record
                var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
                        Some(_proposal) -> _proposal
                    |   None            -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // Check that proposal has not been dropped
                if _proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // Check that proposal is locked
                if _proposal.locked = False then failwith(error_PROPOSAL_NOT_LOCKED)
                else skip;

                // ------------------------------------------------------------------
                // Compute Votes
                // ------------------------------------------------------------------

                // Check if satellite has voted
                const checkIfSatelliteHasVotedFlag : bool = case Big_map.find_opt((s.cycleId, Tezos.get_sender()), s.roundVotes) of [
                        Some (_voteRound)   -> case _voteRound of [
                                Proposal (_proposalId)      -> True
                            |   Voting (_voteType)          -> False
                        ] 
                   |    None                -> False
                ];

                // Compute satellite's votes 
                if checkIfSatelliteHasVotedFlag = False then block {
                
                    // -------------------------------------------
                    // Satellite has not voted for other proposals
                    // -------------------------------------------

                    // Calculate proposal's new vote
                    const newProposalVoteStakedMvkTotal : nat = _proposal.proposalVoteStakedMvkTotal + satelliteSnapshot.totalVotingPower;

                    // Update proposal with satellite's vote
                    _proposal.proposalVoteCount                     := _proposal.proposalVoteCount + 1n;    
                    _proposal.proposalVoteStakedMvkTotal            := newProposalVoteStakedMvkTotal;
                    
                    // Update proposal with new vote
                    s.proposalLedger[proposalId]    := _proposal;

                    // Update cycle proposal with its updated vote smvk
                    s.cycleProposals[proposalId]    := _proposal.proposalVoteStakedMvkTotal;

                    // Update current round votes with satellite
                    s.roundVotes[(s.cycleId, Tezos.get_sender())] := (Proposal (proposalId): roundVoteType);

                } else block {

                    // -------------------------------------------
                    // Satellite has voted for other proposals
                    // -------------------------------------------

                    // Check if satellite already voted for this proposal (double-counting check) and get the previous proposal ID
                    const previousVotedProposalId : nat = case s.roundVotes[(s.cycleId, Tezos.get_sender())] of [
                            Some (_voteRound)   -> case _voteRound of [
                                    Proposal (_proposalId)  -> if _proposalId = proposalId then failwith(error_VOTE_ALREADY_RECORDED) else _proposalId
                                |   Voting (_voteType)      -> failwith(error_VOTE_NOT_FOUND)
                            ]
                        |   None                -> failwith(error_PROPOSAL_NOT_FOUND)
                    ];

                    // Calculate proposal's new vote
                    const newProposalVoteStakedMvkTotal : nat = _proposal.proposalVoteStakedMvkTotal + satelliteSnapshot.totalVotingPower;

                    // Update proposal with satellite's vote
                    _proposal.proposalVoteCount               := _proposal.proposalVoteCount + 1n;
                    _proposal.proposalVoteStakedMvkTotal      := newProposalVoteStakedMvkTotal;

                    // -------------------------------------------
                    // Recalculate votes for previous proposal voted on 
                    // -------------------------------------------

                    // Get previous proposal record
                    var _previousProposal : proposalRecordType := case s.proposalLedger[previousVotedProposalId] of [
                            Some(_previousProposal) -> _previousProposal
                        |   None                    -> failwith(error_PROPOSAL_NOT_FOUND)
                    ];

                    // Decrement previous proposal vote count by one
                    var previousProposalProposalVoteCount : nat := _previousProposal.proposalVoteCount;
                    _previousProposal.proposalVoteCount := abs(previousProposalProposalVoteCount - 1n) ;

                    // Decrement previous proposal by amount of satellite's total voting power - check that min will never go below 0
                    var previousProposalProposalVoteStakedMvkTotal : nat := _previousProposal.proposalVoteStakedMvkTotal;
                    if satelliteSnapshot.totalVotingPower > previousProposalProposalVoteStakedMvkTotal then previousProposalProposalVoteStakedMvkTotal := 0n 
                    else previousProposalProposalVoteStakedMvkTotal := abs(previousProposalProposalVoteStakedMvkTotal - satelliteSnapshot.totalVotingPower); 
                    
                    _previousProposal.proposalVoteStakedMvkTotal := previousProposalProposalVoteStakedMvkTotal;
                    
                    // -------------------------------------------
                    // Update Storage
                    // -------------------------------------------
                
                    // Update proposal with satellite's vote
                    s.proposalLedger[proposalId]                := _proposal;
                    s.proposalLedger[previousVotedProposalId]   := _previousProposal;

                    // Update cycle proposals with their updated vote smvk
                    s.cycleProposals[proposalId]                    := _proposal.proposalVoteStakedMvkTotal;
                    s.cycleProposals[previousVotedProposalId]       := _previousProposal.proposalVoteStakedMvkTotal;

                    // Update current round votes with satellite
                    s.roundVotes[(s.cycleId, Tezos.get_sender())] := (Proposal (proposalId) : roundVoteType);
                };

                // Update the current round highest voted proposal
                const highestVote: nat  = case Big_map.find_opt(s.cycleHighestVotedProposalId, s.proposalLedger) of [
                        Some (_highestVotedProposal)    -> if _proposal.proposalVoteStakedMvkTotal > _highestVotedProposal.proposalVoteStakedMvkTotal then _proposal.proposalVoteStakedMvkTotal else _highestVotedProposal.proposalVoteStakedMvkTotal
                    |   None                            -> _proposal.proposalVoteStakedMvkTotal
                ];
                function findHighestVotedProposalIdFold(const currentHighestVotedProposalId: actionIdType; const proposalVote: actionIdType * nat): actionIdType is
                if proposalVote.1 >= highestVote then proposalVote.0 else currentHighestVotedProposalId;

                s.cycleHighestVotedProposalId   := Map.fold(findHighestVotedProposalIdFold, s.cycleProposals, s.cycleHighestVotedProposalId);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* votingRoundVote lambda *)
function lambdaVotingRoundVote(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check that the current round is a Voting round
    // 2. Check that there is at least one valid proposal to vote on
    // 3. Satellite Permissions Check
    //      -   Check that satellite exists and is not suspended or banned
    // 4. Validation Checks
    //      -   Check that proposal exists in the current round's proposals
    //      -   Check that proposal has not been dropped
    // 5. Compute votes
    //      -   If satellite has not voted - add new vote
    //          -   Update proposal with satellite's vote
    //      -   If satellite has already voted - change of vote type
    //          -   Set proposal record based on vote type 
    //          -   Unset previous vote in proposal record
    //          -   Update proposal with new vote changes
    

    // Check that the current round is a Voting round
    if s.currentCycleInfo.round = (Voting : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_VOTING_ROUND);

    // Check that there is at least one valid proposal to vote on
    if s.cycleHighestVotedProposalId = 0n then failwith(error_NO_PROPOSAL_TO_VOTE_FOR)
    else skip; 

    case governanceLambdaAction of [
        |   LambdaVotingRoundVote(voteRecord) -> {

                // init params: get vote from record 
                const voteType: voteType   = voteRecord.vote;

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Check that satellite exists and is not suspended or banned
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                        Some (_contractAddress) -> _contractAddress
                    |   None                    -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                checkSatelliteStatus(Tezos.get_sender(), delegationAddress, True, True);
                
                // Check that satellite snapshot exists (taken when proposal round was started)
                s   := checkSatelliteSnapshot(Tezos.get_sender(), s);
                const satelliteSnapshot : governanceSatelliteSnapshotRecordType = case s.snapshotLedger[(s.cycleId,Tezos.get_sender())] of [
                        None           -> failwith(error_SNAPSHOT_NOT_FOUND)
                    |   Some(snapshot) -> snapshot
                ];

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check that proposal exists in the current round's proposals
                const checkProposalExistsFlag : bool = Map.mem(s.cycleHighestVotedProposalId, s.cycleProposals);
                if checkProposalExistsFlag = False then failwith(error_PROPOSAL_NOT_FOUND)
                else skip;

                // Get Proposal Record
                var _proposal : proposalRecordType := case s.proposalLedger[s.cycleHighestVotedProposalId] of [
                        None            -> failwith(error_PROPOSAL_NOT_FOUND)
                    |   Some(_proposal) -> _proposal        
                ];

                // Check that proposal has not been dropped
                if _proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // ------------------------------------------------------------------
                // Compute Votes
                // ------------------------------------------------------------------
                // N.B. CurrentCycleInfo.roundVotes change in the use of nat from proposal round (from proposal id to vote type)
                //  i.e. (satelliteAddress, voteType - Yay | Nay | Pass)

                // Check if satellite has voted
                const previousVoteOpt : option(voteType) = case Big_map.find_opt((s.cycleId, Tezos.get_sender()), s.roundVotes) of [
                        Some (_voteRound)   -> case _voteRound of [
                                Proposal (_proposalId)  -> (None : option(voteType))
                            |   Voting (_voteType)      -> (Some (_voteType) : option(voteType))
                        ]
                    |   None                -> (None : option(voteType))
                ];

                case previousVoteOpt of [
                        Some (_previousVote)    -> block {
                            // -------------------------------------------
                            // Satellite has already voted - change of vote
                            // -------------------------------------------

                            // Check if new vote is the same as old vote
                            if _previousVote = voteType then failwith (error_VOTE_ALREADY_RECORDED)
                            else skip;

                            // Save new vote
                            s.roundVotes        := Big_map.update((s.cycleId, Tezos.get_sender()), Some (Voting (voteType)), s.roundVotes);
                            _proposal.voters    := Set.add(Tezos.get_sender(), _proposal.voters);

                            // Set proposal record based on vote type 
                            var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);

                            // Unset previous vote in proposal record
                            var _proposal : proposalRecordType := unsetProposalRecordVote(_previousVote, satelliteSnapshot.totalVotingPower, _proposal);
                            
                            // Update proposal with new vote changes
                            s.proposalLedger[s.cycleHighestVotedProposalId] := _proposal;
                        }
                    |   None                    -> block {
                            // -------------------------------------------
                            // Satellite has not voted - add new vote
                            // -------------------------------------------
                            
                            // Save new vote
                            s.roundVotes        := Big_map.update((s.cycleId, Tezos.get_sender()), Some (Voting (voteType)), s.roundVotes);
                            _proposal.voters    := Set.add(Tezos.get_sender(), _proposal.voters);

                            // Set proposal record based on vote type 
                            var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);
                            
                            // Update proposal with satellite's vote
                            s.proposalLedger[s.cycleHighestVotedProposalId] := _proposal;
                    }
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* executeProposal lambda *)
function lambdaExecuteProposal(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check the desired proposal to execute can be executed
    //      -   executionReady set to True
    //      -   or the current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
    // 2. Check that there is a valid timelock proposal
    // 3. Validation Checks
    //      -   Check that proposal has not been executed
    //      -   Check that proposal has not been dropped
    //      -   Check that there is at least one proposal metadata to execute
    //      -   Check if any data in the proposal has already been executed
    // 4. Update proposal and storage
    // 5. Process Metadata Loop
    //      -   Operation data should be executed in FIFO mode so the loop starts at the last index of the proposal
    // 6. Send reward to proposer

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaExecuteProposal(proposalId) -> {
                
                // Get proposal record
                var proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // Check the proposal can be executed
                if proposal.executionReady then skip
                else {

                    // Check that there is a valid timelock proposal
                    if s.timelockProposalId =/= proposalId then failwith(error_NO_PROPOSAL_TO_EXECUTE)
                    else skip;

                    // Check that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
                    if (s.currentCycleInfo.round = (Timelock : roundType) and Tezos.get_sender() =/= Tezos.get_self_address()) or s.currentCycleInfo.round = (Voting : roundType) then failwith(error_PROPOSAL_CANNOT_BE_EXECUTED_NOW)
                    else skip;

                };

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check that proposal has not been executed
                if proposal.executed then failwith(error_PROPOSAL_EXECUTED)
                else skip;

                // Check that proposal has not been dropped
                if proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // Check that there is at least one proposal metadata to execute
                if Map.size(proposal.proposalData) = 0n then failwith(error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE)
                else skip;

                // Check if any data in the proposal has already been executed
                if proposal.proposalDataExecutionCounter > 0n then failwith(error_PROPOSAL_EXECUTION_ALREADY_STARTED)
                else skip;

                // ------------------------------------------------------------------
                // Update Proposal and Storage
                // ------------------------------------------------------------------

                // Update proposal and set "executed" boolean to True
                proposal.executed                      := True;
                s.proposalLedger[proposalId] := proposal;

                // ------------------------------------------------------------------
                // Process Metadata Loop
                // ------------------------------------------------------------------

                // Operation data should be executed in FIFO mode
                // So the loop starts at the last index of the proposal
                var dataCounter : nat   := Map.size(proposal.proposalData);

                while (dataCounter > 0n) {

                    // Get the data with the corresponding index
                    var operationIndex: nat := abs(dataCounter - 1n);
                    
                    // Get the proposal metadata
                    var metadata: option(proposalDataType)  := case Map.find_opt(operationIndex, proposal.proposalData) of [
                            Some (_optionData)      -> _optionData
                        |   None                    -> failwith(error_PROPOSAL_DATA_NOT_FOUND)
                    ];

                    // Execute the data or skip if this entry has no data to execute
                    case metadata of [
                            Some (_dataBytes)   -> operations := Tezos.transaction(
                                                    _dataBytes.encodedCode,
                                                    0tez,
                                                    getExecuteGovernanceActionEntrypoint(s.governanceProxyAddress)
                                                ) # operations
                        |   None                -> skip
                    ];

                    // Decrement the counter
                    dataCounter := abs(dataCounter - 1n);
                };

                // Send reward to proposer
                operations  := sendRewardToProposer(s) # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* processProposalPayment lambda *)
function lambdaProcessProposalPayment(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Satellite Permissions Check
    //      -   Check that satellite exists and is not suspended or banned
    // 2. Validation Checks
    //      -   Check that sender is the creator of the proposal 
    //      -   Check that proposal payments has not been processed
    //      -   Check that proposal has not been dropped
    //      -   Check that proposal has been executed
    //      -   Check that there is at least one payment metadata to execute
    // 3. Update proposal and set "paymentProcessed" boolean to True
    // 5. Process Payment Metadata Loop
    //      -   Create paymentsData list of transfers for the Treasury Contract
    //      -   Get Payment Treasury Contract address from the General Contracts map
    //      -   Create operation of paymentsData transfers
    

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaProcessProposalPayment(proposalId) -> {

                // Get proposal record
                var proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Check that satellite exists and is not suspended or banned
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                        Some (_contractAddress) -> _contractAddress
                    |   None                    -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                checkSatelliteStatus(proposal.proposerAddress, delegationAddress, True, True);

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check that sender is the creator of the proposal 
                if Tezos.get_sender() =/= proposal.proposerAddress then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // Check that proposal payments has not been processed
                if proposal.paymentProcessed = True then failwith(error_PROPOSAL_PAYMENTS_PROCESSED)
                else skip;

                // Check that proposal has not been dropped
                if proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // Check that proposal has been executed
                if not proposal.executed then failwith(error_PROPOSAL_NOT_EXECUTED)
                else skip;

                // Check that there is at least one payment metadata to execute
                if Map.size(proposal.paymentData) = 0n then failwith(error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE)
                else skip;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Update proposal and set "paymentProcessed" boolean to True
                proposal.paymentProcessed    := True;
                s.proposalLedger[proposalId] := proposal;

                // ------------------------------------------------------------------
                // Process Payment Metadata
                // ------------------------------------------------------------------

                // Create paymentsData list of transfers for the Treasury Contract
                var paymentsData : list(transferDestinationType)   := nil;

                // The order of operation will be the same as the one in the proposal, that's why we start
                // from the tail of the list
                var dataCounter : nat := Map.size(proposal.paymentData);

                while (dataCounter > 0n) {

                    // Get the data with the corresponding index
                    var operationIndex : nat := abs(dataCounter - 1n);
                    var metadata : option(paymentDataType) := case Map.find_opt(operationIndex, proposal.paymentData) of [
                            Some (_optionData)      -> _optionData
                        |   None                    -> failwith(error_PROPOSAL_DATA_NOT_FOUND)
                    ];

                    // Execute the data or skip if this entry has no data to execute
                    case metadata of [
                            Some (_dataBytes)   -> paymentsData := _dataBytes.transaction # paymentsData
                        |   None                -> skip
                    ];

                    dataCounter := abs(dataCounter - 1n);

                };

                // Get Payment Treasury Contract address from the General Contracts map
                const treasuryAddress : address  = case Map.find_opt("paymentTreasury", s.generalContracts) of [
                        Some (_treasury) -> _treasury
                    |   None             -> failwith(error_PAYMENT_TREASURY_CONTRACT_NOT_FOUND)
                ];

                // Create operation of paymentsData transfers
                const transferOperation : operation = Tezos.transaction(
                    paymentsData,
                    0tez,
                    sendTransferOperationToTreasury(treasuryAddress)
                );
                operations := transferOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* processProposalSingleData lambda *)
function lambdaProcessProposalSingleData(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check the desired proposal to execute can be executed
    //      -   executionReady set to True
    //      -   or the current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)    
    // 2. Check that there is a valid timelock proposal
    // 3. Validation Checks
    //      -   Check that proposal has not been executed
    //      -   Check that proposal has not been dropped
    //      -   Check that there is at least one proposal metadata to execute
    // 4. Process Metadata 
    //      -   Proposal data should be executed in FIFO mode
    //      -   Get the data to execute next based on the proposalDataExecutionCounter
    //      -   Check if there is data to execute (even at the last entry where index = 0)
    // 6. Update storage
    //      -   Update proposalDataExecutionCounter after the execution of a metadata
    //      -   If all metadata operations have been executed
    //              -   Set proposal "executed" boolean to True
    //              -   Send reward to proposer
    //      -   Update and save proposal in storage

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaProcessProposalSingleData(proposalId) -> {
                
                // Get proposal record
                var proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // Check the proposal can be executed
                if proposal.executionReady then skip
                else {

                    // Check that there is a valid timelock proposal
                    if s.timelockProposalId =/= proposalId then failwith(error_NO_PROPOSAL_TO_EXECUTE)
                    else skip;

                    // Check that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
                    if (s.currentCycleInfo.round = (Timelock : roundType) and Tezos.get_sender() =/= Tezos.get_self_address()) or s.currentCycleInfo.round = (Voting : roundType) then failwith(error_PROPOSAL_CANNOT_BE_EXECUTED_NOW)
                    else skip;

                };

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check that proposal has not been executed
                if proposal.executed = True then failwith(error_PROPOSAL_EXECUTED)
                else skip;

                // Check that proposal has not been dropped
                if proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // Check that there is at least one proposal metadata to execute
                if Map.size(proposal.proposalData) = 0n then failwith(error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE)
                else skip;

                // ------------------------------------------------------------------
                // Process Metadata
                // ------------------------------------------------------------------

                // Proposal data should be executed in FIFO mode
                // Get the data to execute next based on the proposalDataExecutionCounter
                var optionData: option(proposalDataType)    := case proposal.proposalData[proposal.proposalDataExecutionCounter] of [
                        Some (_data)    -> _data
                    |   None            -> failwith(error_PROPOSAL_DATA_NOT_FOUND)
                ];

                // If there is no data to execute, loop through all the proposalData, starting from tail to head to get data
                while proposal.proposalDataExecutionCounter < Map.size(proposal.proposalData) and optionData = (None : option(proposalDataType)) block{
                    
                    proposal.proposalDataExecutionCounter   := proposal.proposalDataExecutionCounter + 1n;
                    optionData                                  := case proposal.proposalData[proposal.proposalDataExecutionCounter] of [
                            Some (_data)    -> _data
                        |   None            -> failwith(error_PROPOSAL_DATA_NOT_FOUND)
                    ];

                };

                // Check if there is data to execute (even at the last entry where index = 0)
                case optionData of [
                        Some (_dataBytes)   -> operations := Tezos.transaction(
                                                    _dataBytes.encodedCode,
                                                    0tez,
                                                    getExecuteGovernanceActionEntrypoint(s.governanceProxyAddress)
                                                ) # operations
                    |   None                -> skip
                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Update proposalDataExecutionCounter after the execution of a metadata
                proposal.proposalDataExecutionCounter  := proposal.proposalDataExecutionCounter + 1n;

                // Check if all operations were executed
                if proposal.proposalDataExecutionCounter >= Map.size(proposal.proposalData) then {
                    
                    // Set proposal "executed" boolean to True
                    proposal.executed := True;

                    // Send reward to proposer
                    operations  := sendRewardToProposer(s) # operations;

                } else skip;

                // Update and save proposal in storage
                s.proposalLedger[proposalId] := proposal;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* distributeProposalRewards lambda *)
function lambdaDistributeProposalRewards(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaDistributeProposalRewards(claimParams) -> {
            
            // Get values from params
            const satelliteAddress : address         = claimParams.satelliteAddress;
            const proposalIds : set(actionIdType)    = claimParams.proposalIds;

            // Get Delegation Contract address from the general contracts map
            const delegationAddress : address = case s.generalContracts["delegation"] of [
                    Some(_address) -> _address
                |   None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
            ];

            // Get the distribute reward entrypoint
            const claimSatellite : set(address)  = set [satelliteAddress];
            const distributeRewardsEntrypoint: contract(set(address) * nat) =
                case (Tezos.get_entrypoint_opt("%distributeReward", delegationAddress) : option(contract(set(address) * nat))) of [
                        Some(contr) -> contr
                    |   None -> (failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED) : contract(set(address) * nat))
                ];

            // Define the fold function for the set of proposal ids
            for proposalId in set proposalIds block{
                case Big_map.find_opt(proposalId, s.proposalLedger) of [
                        Some (_record) -> block{
                            // Check the satellite voted on the proposal
                            if Set.mem(satelliteAddress, _record.voters) then skip else failwith(error_VOTE_NOT_FOUND);

                            // Check the satellite did not already claimed its reward for this proposal
                            const satelliteRewardProposalKey: (actionIdType*address)    = (proposalId, satelliteAddress);
                            if Big_map.mem(satelliteRewardProposalKey, s.proposalRewards) then failwith(error_PROPOSAL_REWARD_ALREADY_CLAIMED) else skip;

                            // Check if the reward can be claimed
                            if _record.rewardClaimReady then skip else failwith(error_PROPOSAL_REWARD_CANNOT_BE_CLAIMED);

                            // Add the reward to the storage
                            s.proposalRewards   := Big_map.add(satelliteRewardProposalKey, unit, s.proposalRewards);

                            // Calculate the reward
                            const satelliteReward: nat  = _record.totalVotersReward / Set.cardinal(_record.voters);

                            const distributeOperation: operation = Tezos.transaction((claimSatellite, satelliteReward), 0tez, distributeRewardsEntrypoint);
                            operations  := distributeOperation # operations;
                        }
                    |   None -> failwith(error_PROPOSAL_NOT_FOUND)
                ];
            };

        }
        |   _ -> skip
    ];

} with (operations, s)



(* dropProposal lambda *)
function lambdaDropProposal(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    // Steps Overview:
    // 1. Satellite Permissions Check
    //      -   Check that satellite exists and is not suspended or banned
    // 2. Validation Checks
    //      -   Check that proposal exists in the current round's proposals
    //      -   Check that proposal has not been dropped
    // 3. Check if sender is proposer or admin 
    //      -   Set proposal status to "DROPPED"
    //      -   Remove proposal from currentCycleInfo.cycleProposers
    //      -   If current round is a timelock or voting round (where there is only one proposal), restart the cycle


    case governanceLambdaAction of [
        |   LambdaDropProposal(proposalId) -> {

                // Get proposal record
                var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
                        None            -> failwith(error_PROPOSAL_NOT_FOUND)
                    |   Some(_proposal) -> _proposal        
                ];

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Check that satellite exists and is not suspended or banned
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                        Some (_contractAddress) -> _contractAddress
                    |   None                    -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                checkSatelliteStatus(_proposal.proposerAddress, delegationAddress, True, True);

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check that proposal exists in the current round's proposals
                const checkProposalExistsFlag : bool = Map.mem(proposalId, s.cycleProposals);
                if checkProposalExistsFlag = False then failwith(error_PROPOSAL_NOT_FOUND)
                else skip;

                // Check that proposal has not been dropped
                if _proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // ------------------------------------------------------------------
                // Drop Proposal
                // ------------------------------------------------------------------

                // Check if sender is proposer or admin 
                if _proposal.proposerAddress = Tezos.get_sender() or Tezos.get_sender() = s.admin then block {

                    // Set proposal status to "DROPPED"
                    _proposal.status               := "DROPPED";
                    s.proposalLedger[proposalId]   := _proposal;

                    // Remove proposal from currentCycleInfo.cycleProposers
                    var satelliteProposals   : set(nat)  := case s.cycleProposers[(s.cycleId, _proposal.proposerAddress)] of [
                            Some (_proposals) -> _proposals
                        |   None              -> failwith(error_PROPOSAL_NOT_FOUND)
                    ];
                    s.cycleProposers[(s.cycleId, _proposal.proposerAddress)] := Set.remove(proposalId, satelliteProposals);

                    // Remove proposal from current cycle proposal
                    s.cycleProposals    := Map.remove(proposalId, s.cycleProposals);

                    // If current round is a timelock or voting round (where there is only one proposal), restart the cycle
                    if s.currentCycleInfo.round = (Voting : roundType) or s.currentCycleInfo.round = (Timelock : roundType) 
                    then s := setupProposalRound(s) else skip;

                } else failwith(error_ONLY_PROPOSER_ALLOWED)
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Governance Cycle Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Governance Lambdas End
//
// ------------------------------------------------------------------------------
