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

    verifySenderIsEmergencyGovernanceContract(s); // verify that sender is from the Emergency Governance Gontract 

    case governanceLambdaAction of [
        |   LambdaBreakGlass(_parameters) -> {
                
                // Get Break Glass Contract address from the general contracts map
                const breakGlassAddress : address = getAddressFromGeneralContracts("breakGlass", s, error_BREAK_GLASS_CONTRACT_NOT_FOUND);

                // Set Governance Contract admin to the Break Glass Contract
                s.admin := breakGlassAddress;

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

    verifySenderIsAdmin(s.admin); // Check that sender is admin (if glass has been broken, admin should be the Break Glass Contract)

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaPropagateBreakGlass(contractAddressSet) -> {
                
                // Verify that glass is broken on the Break Glass contract
                verifyGlassBroken(s);

                // Loop to propagate break glass in all general contracts
                for contractAddress in set contractAddressSet block {
                    
                    // Order of operations: first in last out
                    // 1. First, trigger pauseAll entrypoint in contract 
                    // 2. Second, trigger setAdmin entrypoint in contract to change admin to Break Glass Contract

                    operations := setAdminIfExistOperation(contractAddress, operations, s);
                    operations := pauseAllIfExistOperation(contractAddress, operations);
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

    verifyNoAmountSent(Unit);    // check that no tez is sent to the entrypoint
    verifySenderIsAdmin(s.admin); // verify that sender is admin (e.g. Governance Proxy contract)
    
    case governanceLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {

                // Verify that the new admin address is either a whitelisted developer, or the governance proxy contract, or the break glass contract
                verifyValidAdminAddress(newAdminAddress, s);
                
                // Update storage
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
    
    verifyNoAmountSent(Unit);    // check that no tez is sent to the entrypoint
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
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

    verifyNoAmountSent(Unit);    // check that no tez is sent to the entrypoint
    verifySenderIsAdmin(s.admin); // verify that sender is admin

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

    verifyNoAmountSent(Unit);   // check that no tez is sent to the entrypoint
    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case governanceLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : governanceUpdateConfigActionType     = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceUpdateConfigNewValueType   = updateConfigParams.updateConfigNewValue;

                const blocksPerMinute   : nat = 60n / Mavryk.get_min_block_time();
                const maxRoundDuration  : nat = 10_080n * blocksPerMinute; // one week in block levels

                case updateConfigAction of [
                        ConfigSuccessReward (_v)                          -> s.config.successReward                           := updateConfigNewValue
                    |   ConfigCycleVotersReward (_v)                      -> s.config.cycleVotersReward                       := updateConfigNewValue
                    |   ConfigMinProposalRoundVotePct (_v)                -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minProposalRoundVotePercentage := updateConfigNewValue
                    |   ConfigMinQuorumPercentage (_v)                    -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minQuorumPercentage            := updateConfigNewValue
                    |   ConfigMinYayVotePercentage (_v)                   -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minYayVotePercentage           := updateConfigNewValue
                    |   ConfigProposeFeeMutez (_v)                        -> s.config.proposalSubmissionFeeMutez              := updateConfigNewValue * 1mumav                    
                    |   ConfigMaxProposalsPerSatellite (_v)               -> s.config.maxProposalsPerSatellite                := updateConfigNewValue
                    |   ConfigBlocksPerProposalRound (_v)                 -> if updateConfigNewValue > (Mavryk.get_level() + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerProposalRound     := updateConfigNewValue
                    |   ConfigBlocksPerVotingRound (_v)                   -> if updateConfigNewValue > (Mavryk.get_level() + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerVotingRound       := updateConfigNewValue
                    |   ConfigBlocksPerTimelockRound (_v)                 -> if updateConfigNewValue > (Mavryk.get_level() + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerTimelockRound     := updateConfigNewValue
                    |   ConfigDataTitleMaxLength (_v)                     -> s.config.proposalDataTitleMaxLength              := updateConfigNewValue
                    |   ConfigProposalTitleMaxLength (_v)                 -> s.config.proposalTitleMaxLength                  := updateConfigNewValue
                    |   ConfigProposalDescMaxLength (_v)                  -> s.config.proposalDescriptionMaxLength            := updateConfigNewValue
                    |   ConfigProposalInvoiceMaxLength (_v)               -> s.config.proposalInvoiceMaxLength                := updateConfigNewValue
                    |   ConfigProposalCodeMaxLength (_v)                  -> s.config.proposalSourceCodeMaxLength             := updateConfigNewValue
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    // Steps Overview:
    // 1. Check that sender is admin or whitelisted (e.g. Factory contracts)
    // 2. Check that no tez is sent to the entrypoint
    // 3. Update whitelist contracts map

    verifySenderIsWhitelistedOrAdmin(s); // verify that sender is admin or whitelisted (e.g. Factory contracts)
    verifyNoAmountSent(Unit);            // verify that no tez is sent to the entrypoint
    
    case governanceLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
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

    verifySenderIsWhitelistedOrAdmin(s); // verify that sender is admin or whitelisted (e.g. Factory contracts)
    verifyNoAmountSent(Unit);            // check that no tez is sent to the entrypoint
    
    case governanceLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
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

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    verifyNoAmountSent(Unit);     // check that no tez is sent to the entrypoint

    case governanceLambdaAction of [
            LambdaUpdateWhitelistDevelopers(developer) -> 

                // if checkWhitelistDeveloperExists(developer, s) 
                // then s := removeWhitelistDeveloper(developer, s)
                // else s := addWhitelistDeveloper(developer, s)

            if Set.mem(developer, s.whitelistDevelopers) then 
                
                if Set.cardinal(s.whitelistDevelopers) > 1n then 
                    s.whitelistDevelopers := Set.remove(developer, s.whitelistDevelopers)
                else failwith(error_AT_LEAST_ONE_WHITELISTED_DEVELOPER_REQUIRED)

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

                // Verify that the sender is admin or the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations (transferOperationFold in transferHelpers
                for transferParams in list destinationParams block {
                    operations := transferOperationFold(transferParams, operations);
                }
                 
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

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    verifyNoAmountSent(Unit);     // check that no tez is sent to the entrypoint    

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaSetContractAdmin(setContractAdminParams) -> {
                
                // Create operation to set new admin address of contract
                const setContractAdminOperation : operation = setContractAdminOperation(setContractAdminParams);
                operations := setContractAdminOperation # operations;
            }
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

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    verifyNoAmountSent(Unit);     // check that no tez is sent to the entrypoint    

    // Operations list
    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaSetContractGovernance(setContractGovernanceParams) -> {
                
                // Create operation to set new governanceaddress of contract
                const setContractGovernanceOperation : operation = setContractGovernanceOperation(setContractGovernanceParams);
                operations := setContractGovernanceOperation # operations;
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Cycle Lambdas Begin
// ------------------------------------------------------------------------------

(*  updateSatellitesSnapshot lambda *)
function lambdaUpdateSatellitesSnapshot(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is
block {

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaUpdateSatellitesSnapshot(updateSatellitesSnapshotParams) -> {

                // Verify sender is whitelisted or is the admin
                verifySenderIsWhitelistedOrAdmin(s);
                
                // Update the storage with the new snapshots
                for satelliteSnapshot in set updateSatellitesSnapshotParams block{
                    s := updateSatellitesSnapshotRecord(satelliteSnapshot, s);
                }

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

    // Verify that current round has not ended
    verifyRoundHasNotEnded(s);

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaStartNextRound(executePastProposal) -> {
                
                // Get current round variables
                const currentRoundHighestVotedProposal: option(proposalRecordType) = Big_map.find_opt(s.cycleHighestVotedProposalId, s.proposalLedger);

                // ------------------------------------------------------------------
                // Check if full cycles have passed since the previous round, to account for instances where a new round has not started for a long time
                // ------------------------------------------------------------------

                const currentCycleEndLevel  : nat = s.currentCycleInfo.cycleEndLevel;
                const currentBlockLevel     : nat = Mavryk.get_level();
                const blocksPerFullCycle    : nat = s.config.blocksPerProposalRound + s.config.blocksPerVotingRound + s.config.blocksPerTimelockRound;

                // calculate number of cycles that have passed if any
                var cyclesPassed : nat := 0n;
                if currentBlockLevel > currentCycleEndLevel then {
                    if blocksPerFullCycle = 0n then cyclesPassed := 0n else {
                        cyclesPassed := (abs(currentBlockLevel - currentCycleEndLevel) / blocksPerFullCycle) 
                    };
                } else skip;

                if cyclesPassed > 0n then block {

                    // if at least one full cycle has passed, reset to a new proposal round
                    s := setupProposalRound(s);

                } else block {

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
                                    var proposalToExecute : proposalRecordType := getProposalRecord(s.timelockProposalId, s);
                                    proposalToExecute.executionReady                := True;
                                    s.proposalLedger[s.timelockProposalId]          := proposalToExecute;

                                    // Execute the timelock proposal if the boolean was set to true
                                    if executePastProposal then operations := Mavryk.transaction((s.timelockProposalId), 0mav, getExecuteProposalEntrypoint(Mavryk.get_self_address())) # operations 
                                    else skip;
                                    
                                } else skip;

                                // Start proposal round 
                                s := setupProposalRound(s);
                            }
                    ];

                };

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

    // Verify that the current round is a Proposal round
    verifyIsProposalRound(s);

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        |   LambdaPropose(newProposal) -> {

                // init variables
                const proposalId : nat = s.nextProposalId;

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Verify that satellite exists and is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(Mavryk.get_sender(), s);

                // Check that satellite snapshot exists (taken when proposal round was started)
                s := checkSatelliteSnapshot(Mavryk.get_sender(), s);
                const satelliteSnapshot : governanceSatelliteSnapshotRecordType = getCurrentSatelliteSnapshot(s);

                // ------------------------------------------------------------------
                // Process Proposal Submission Fee
                // ------------------------------------------------------------------

                // check if tez sent is equal to the required fee
                verifyCorrectSubmissionFee(s);

                // Get Tax Treasury from General Contracts map
                const treasuryAddress : address = getAddressFromGeneralContracts("taxTreasury", s, error_PROPOSE_TAX_TREASURY_CONTRACT_NOT_FOUND);

                // Create operation to transfer submission fee to treasury
                const treasuryContract : contract(unit) = Mavryk.get_contract_with_error(treasuryAddress, "Error. Contract not found at given address");
                const transferFeeToTreasuryOperation : operation = transferTez(treasuryContract, Mavryk.get_amount());
                
                operations := transferFeeToTreasuryOperation # operations;
                
                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------
                
                // Get minimumStakedMvkBalance from Delegation Contract Config to serve as requirement for satellite to make a proposal
                const minimumStakedMvkRequirement : nat = getMinimumStakedMvkRequirement(s);

                // Verify that satellite has sufficient staked MVK to make a proposal 
                verifySatelliteHasSufficientStakedMvk(satelliteSnapshot.totalStakedMvkBalance, minimumStakedMvkRequirement);

                // Get total number of proposals from satellite for current cycle
                var satelliteProposals : set(nat) := getSatelliteProposals(Mavryk.get_sender(), s.cycleId, s);

                // Verify that satellite's total number of proposals does not exceed the maximum set in config (spam check)
                verifyMaxProposalsPerSatelliteNotReached(satelliteProposals, s);

                // ------------------------------------------------------------------
                // Create new proposal
                // ------------------------------------------------------------------

                // Create new proposal record
                var newProposalRecord : proposalRecordType := createNewProposal(newProposal, s);

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Save proposal to proposalLedger
                s.proposalLedger[proposalId]                            := newProposalRecord;

                // Add new proposal to satellite's proposals set
                satelliteProposals                                      := Set.add(proposalId, satelliteProposals);
                s.cycleProposers[(s.cycleId,Mavryk.get_sender())]        := satelliteProposals;

                // ------------------------------------------------------------------
                // Add Proposal Metadata and Payment Metadata 
                // ------------------------------------------------------------------
                // N.B. Metadata is bytecode of changes/operations that Satellite is proposing to be executed

                // Check if there are proposal or payment data
                const proposalHasProposalData  : bool = checkProposalDataExists(newProposal);
                const proposalHasPaymentData   : bool = checkPaymentDataExists(newProposal);

                // Create operations to add proposal and payment data
                if proposalHasProposalData or proposalHasPaymentData then block {

                    const updateProposalDataOperation : operation = updateProposalDataOperation(proposalId, newProposal);
                    operations := updateProposalDataOperation # operations;

                } else skip;

                // Add proposal id to current round proposals and initialise with zero positive votes in MVK 
                s.cycleProposals := Map.add(proposalId, 0n, s.cycleProposals);

                // Increment next proposal id
                s.nextProposalId := proposalId + 1n;

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

    // Verify that the current round is a Proposal round
    verifyIsProposalRound(s);

    case governanceLambdaAction of [
        |   LambdaUpdateProposalData(updateProposalDataParams) -> {

                // init params
                const proposalId    : nat                               = updateProposalDataParams.proposalId;
                const proposalData  : option(updateProposalDataType)    = updateProposalDataParams.proposalData;
                const paymentData   : option(updatePaymentDataType)     = updateProposalDataParams.paymentData;

                // Get proposal record
                var proposalRecord : proposalRecordType := getProposalRecord(proposalId, s);

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------
                
                // Retrieve title max length from config
                const proposalDataTitleMaxLength : nat  = s.config.proposalDataTitleMaxLength;

                // Check that proposal is not locked
                verifyProposalIsNotLocked(proposalRecord);

                // Check that sender is self (governance contract) or the creator of the proposal 
                verifySenderIsSelfOrProposalCreator(proposalRecord);

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Verify that satellite exists and is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(proposalRecord.proposerAddress, s);

                // ------------------------------------------------------------------
                // Update proposal data
                // ------------------------------------------------------------------

                case proposalData of [
                        Some (_proposalData)    -> block {
                            for updateProposalData in list _proposalData block {
                                proposalRecord.proposalData := case updateProposalData of [
                                        AddOrSetProposalData (data) -> if String.length(data.title) > proposalDataTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else addOrSetProposalData(data, proposalRecord.proposalData)
                                    |   RemoveProposalData (data)   -> removeProposalData(data, proposalRecord.proposalData)
                                ]
                            }
                        }
                    |   None -> skip
                ];

                // ------------------------------------------------------------------
                // Update payment data
                // ------------------------------------------------------------------

                case paymentData of [
                        Some (_paymentData)    -> block {
                            for updatePaymentData in list _paymentData block {
                                proposalRecord.paymentData  := case updatePaymentData of [
                                        AddOrSetPaymentData (data) -> if String.length(data.title) > proposalDataTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else addOrSetPaymentData(data, proposalRecord.paymentData)
                                    |   RemovePaymentData (data)   -> removePaymentData(data, proposalRecord.paymentData)
                                ]
                            }
                        }
                    |   None -> skip
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


    // Verify that the current round is a Proposal round
    verifyIsProposalRound(s);

    case governanceLambdaAction of [
        |   LambdaLockProposal(proposalId) -> {
                
                // Get proposal record
                var proposalRecord : proposalRecordType := getProposalRecord(proposalId, s);

                // Verify that satellite exists and is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(proposalRecord.proposerAddress, s);

                // Check that sender is the creator of the proposal 
                verifySenderIsProposalCreator(proposalRecord);

                // Check that proposal is not locked
                verifyProposalIsNotLocked(proposalRecord);

                // Verify that there is at least one proposal metadata to execute
                verifyAtLeastOneProposalData(proposalRecord);

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

    // Verify that the current round is a Proposal round
    verifyIsProposalRound(s);

    case governanceLambdaAction of [
        |   LambdaProposalRoundVote(proposalId) -> {
                
                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Verify that satellite exists and is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(Mavryk.get_sender(), s);

                // Check that satellite snapshot exists (taken when proposal round was started)
                s := checkSatelliteSnapshot(Mavryk.get_sender(), s);
                const satelliteSnapshot : governanceSatelliteSnapshotRecordType = getCurrentSatelliteSnapshot(s);

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Verify that proposal exists in the current cycle's proposals
                verifyProposalExistsInCurrentCycle(proposalId, s);

                // Get Proposal Record
                var _proposal : proposalRecordType := getProposalRecord(proposalId, s);

                // Verify that proposal has not been dropped
                verifyProposalNotDropped(_proposal);

                // Check that proposal is locked
                verifyProposalIsLocked(_proposal);

                // ------------------------------------------------------------------
                // Compute Votes
                // ------------------------------------------------------------------

                // Check if satellite has voted
                const checkIfSatelliteHasVotedFlag : bool = checkIfSatelliteHasVoted(Mavryk.get_sender(), s);

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
                    s.roundVotes[(s.cycleId, Mavryk.get_sender())] := (Proposal (proposalId): roundVoteType);

                } else block {

                    // -------------------------------------------
                    // Satellite has voted for other proposals
                    // -------------------------------------------

                    // Check if satellite already voted for this proposal (double-counting check) and get the previous proposal ID
                    const previousVotedProposalId : nat = case s.roundVotes[(s.cycleId, Mavryk.get_sender())] of [
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
                    var _previousProposal : proposalRecordType := getProposalRecord(previousVotedProposalId, s);

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
                    s.roundVotes[(s.cycleId, Mavryk.get_sender())] := (Proposal (proposalId) : roundVoteType);
                };

                // Update the current round highest voted proposal
                const highestVote: nat  = case Big_map.find_opt(s.cycleHighestVotedProposalId, s.proposalLedger) of [
                        Some (_highestVotedProposal)    -> if _proposal.proposalVoteStakedMvkTotal > _highestVotedProposal.proposalVoteStakedMvkTotal then _proposal.proposalVoteStakedMvkTotal else _highestVotedProposal.proposalVoteStakedMvkTotal
                    |   None                            -> _proposal.proposalVoteStakedMvkTotal
                ];
                function findHighestVotedProposalIdFold(const currentHighestVotedProposalId: actionIdType; const proposalVote: actionIdType * nat): actionIdType is
                if proposalVote.1 >= highestVote then proposalVote.0 else currentHighestVotedProposalId;

                for actionId -> vote in map s.cycleProposals block{
                    s.cycleHighestVotedProposalId   := findHighestVotedProposalIdFold(s.cycleHighestVotedProposalId, (actionId, vote));
                };

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

    // Verify that the current round is a Voting round
    verifyIsVotingRound(s);

    // Verify that there is at least one valid proposal to vote on (i.e. cycle's highest voted proposal exists)
    verifyCycleHighestVotedProposalExists(s);

    case governanceLambdaAction of [
        |   LambdaVotingRoundVote(voteRecord) -> {

                // init params: get vote from record 
                const voteType: voteType   = voteRecord.vote;

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Verify that satellite exists and is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(Mavryk.get_sender(), s);
                
                // Check that satellite snapshot exists (taken when proposal round was started)
                s := checkSatelliteSnapshot(Mavryk.get_sender(), s);
                const satelliteSnapshot : governanceSatelliteSnapshotRecordType = getCurrentSatelliteSnapshot(s);

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Verify that proposal exists in the current cycle's proposals
                verifyProposalExistsInCurrentCycle(s.cycleHighestVotedProposalId, s);

                // Get Proposal Record
                var _proposal : proposalRecordType := getProposalRecord(s.cycleHighestVotedProposalId, s);

                // Check that proposal has not been dropped
                verifyProposalNotDropped(_proposal);

                // ------------------------------------------------------------------
                // Compute Votes
                // ------------------------------------------------------------------
                // N.B. CurrentCycleInfo.roundVotes change in the use of nat from proposal round (from proposal id to vote type)
                //  i.e. (satelliteAddress, voteType - Yay | Nay | Pass)

                // Check if satellite has voted
                const previousVoteOpt : option(voteType) = case Big_map.find_opt((s.cycleId, Mavryk.get_sender()), s.roundVotes) of [
                        Some (_voteRound)   -> case _voteRound of [
                                Proposal (_proposalId)  -> (None : option(voteType))
                            |   Voting (_voteType)      -> (Some (_voteType) : option(voteType))
                        ]
                    |   None -> (None : option(voteType))
                ];

                case previousVoteOpt of [
                        Some (_previousVote) -> block {

                            // -------------------------------------------
                            // Satellite has already voted - change of vote
                            // -------------------------------------------

                            // Check if new vote is the same as old vote
                            if _previousVote = voteType then failwith (error_VOTE_ALREADY_RECORDED)
                            else skip;

                            // Save new vote
                            s.roundVotes        := Big_map.update((s.cycleId, Mavryk.get_sender()), Some (Voting (voteType)), s.roundVotes);
                            s.proposalVoters    := Big_map.update((s.cycleHighestVotedProposalId, Mavryk.get_sender()), Some(voteType), s.proposalVoters);

                            // Set proposal record based on vote type 
                            var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);

                            // Unset previous vote in proposal record
                            var _proposal : proposalRecordType := unsetProposalRecordVote(_previousVote, satelliteSnapshot.totalVotingPower, _proposal);
                            
                            // Update proposal with new vote changes
                            s.proposalLedger[s.cycleHighestVotedProposalId] := _proposal;
                        }
                    
                    |   None -> block {

                            // -------------------------------------------
                            // Satellite has not voted - add new vote
                            // -------------------------------------------
                            
                            // Save new vote
                            s.roundVotes        := Big_map.update((s.cycleId, Mavryk.get_sender()), Some (Voting (voteType)), s.roundVotes);
                            s.proposalVoters    := Big_map.add((s.cycleHighestVotedProposalId, Mavryk.get_sender()), voteType, s.proposalVoters);

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
                var proposal : proposalRecordType := getProposalRecord(proposalId, s);

                // Check the proposal can be executed
                if proposal.executionReady then skip
                else {

                    // Verify that there is a valid timelock proposal
                    verifyTimelockProposalExists(proposalId, s);

                    // Verify that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
                    verifyProposalCanBeExecuted(s);

                };

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Verify that proposal has not been executed
                verifyProposalNotExecuted(proposal);

                // Verify that proposal has not been dropped
                verifyProposalNotDropped(proposal);

                // Verify that there is at least one proposal metadata to execute
                verifyAtLeastOneProposalData(proposal);

                // Verify that no data in the proposal has been executed yet
                verifyProposalExecutionNotStarted(proposal);

                // ------------------------------------------------------------------
                // Update Proposal and Storage
                // ------------------------------------------------------------------

                // Update proposal and set "executed" boolean to True
                proposal.executed               := True;
                proposal.executedDateTime       := Some(Mavryk.get_now());
                s.proposalLedger[proposalId]    := proposal;

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
                    var metadata : option(proposalDataType) := getProposalData(proposal, operationIndex);

                    // Execute the data or skip if this entry has no data to execute
                    case metadata of [
                            Some (_dataBytes)   -> operations := executeGovernanceActionOperation(_dataBytes.encodedCode, s) # operations
                        |   None                -> skip
                    ];

                    // Decrement the counter
                    dataCounter := abs(dataCounter - 1n);
                };

                // Send reward to proposer
                operations := sendRewardToProposer(s) # operations;

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
                var proposal : proposalRecordType := getProposalRecord(proposalId, s);

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Verify that satellite exists and is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(proposal.proposerAddress, s);

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Verify that sender is the creator of the proposal 
                verifySenderIsProposalCreator(proposal);

                // Verify that proposal payments has not been processed
                verifyPaymentsNotProcessed(proposal);

                // Verify that proposal has not been dropped
                verifyProposalNotDropped(proposal);

                // Verify that proposal has been executed
                verifyProposalExecuted(proposal);

                // Verify that there is at least one payment metadata to execute
                verifyAtLeastOnePaymentData(proposal);

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
                var paymentsData : list(transferDestinationType) := nil;

                // The order of operation will be the same as the one in the proposal, that's why we start
                // from the tail of the list
                var dataCounter : nat := Map.size(proposal.paymentData);

                while (dataCounter > 0n) {

                    // Get the data with the corresponding index
                    var operationIndex : nat := abs(dataCounter - 1n);
                    var metadata : option(paymentDataType) := getProposalPaymentData(proposal, operationIndex);

                    // Execute the data or skip if this entry has no data to execute
                    case metadata of [
                            Some (_dataBytes)   -> paymentsData := _dataBytes.transaction # paymentsData
                        |   None                -> skip
                    ];

                    dataCounter := abs(dataCounter - 1n);

                };

                // process proposal payments data through paymentTreasury
                const processProposalPaymentOperation : operation = processProposalPaymentOperation(paymentsData, s);
                operations := processProposalPaymentOperation # operations;

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
                var proposal : proposalRecordType := getProposalRecord(proposalId, s);

                // Check the proposal can be executed
                if proposal.executionReady then skip
                else {

                    // Verify that there is a valid timelock proposal
                    verifyTimelockProposalExists(proposalId, s);

                    // Verify that current round is not Timelock Round or Voting Round (in the scenario proposal was executed before timelock round started)
                    verifyProposalCanBeExecuted(s);

                };

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Verify that proposal has not been executed
                verifyProposalNotExecuted(proposal);

                // Verify that proposal has not been dropped
                verifyProposalNotDropped(proposal);

                // Verify that there is at least one proposal metadata to execute
                verifyAtLeastOneProposalData(proposal);

                // ------------------------------------------------------------------
                // Process Metadata
                // ------------------------------------------------------------------

                // Proposal data should be executed in FIFO mode
                // Get the data to execute next based on the proposalDataExecutionCounter - (proposalRecord, index)
                var optionData : option(proposalDataType) := getProposalData(proposal, proposal.proposalDataExecutionCounter); 

                // If there is no data to execute, loop through all the proposalData, starting from tail to head to get data
                while proposal.proposalDataExecutionCounter < Map.size(proposal.proposalData) and optionData = (None : option(proposalDataType)) block {
                    
                    const proposalIndex : nat = proposal.proposalDataExecutionCounter + 1n;
                    optionData := getProposalData(proposal, proposalIndex); 

                };

                // Check if there is data to execute (even at the last entry where index = 0)
                case optionData of [
                        Some (_dataBytes) -> operations := executeGovernanceActionOperation(_dataBytes.encodedCode, s) # operations
                    |   None              -> skip
                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Update proposalDataExecutionCounter after the execution of a metadata
                proposal.proposalDataExecutionCounter := proposal.proposalDataExecutionCounter + 1n;

                // Check if all operations were executed
                if proposal.proposalDataExecutionCounter >= Map.size(proposal.proposalData) then {
                    
                    // Set proposal "executed" boolean to True
                    proposal.executed           := True;
                    
                    // Update the execution datetime
                    proposal.executedDateTime   := Some(Mavryk.get_now());

                    // Send reward to proposer
                    operations                  := sendRewardToProposer(s) # operations;

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
            const satelliteAddress : address      = claimParams.satelliteAddress;
            const proposalIds : set(actionIdType) = claimParams.proposalIds;

            // Get the distribute reward entrypoint
            const claimSatellite : set(address)  = set [satelliteAddress];

            // Define the fold function for the set of proposal ids
            for proposalId in set proposalIds block{

                case Big_map.find_opt(proposalId, s.proposalLedger) of [
                        Some (_record) -> block{

                            // Verify that satellite voted on the proposal
                            verifySatelliteHasVotedForProposal(satelliteAddress, proposalId, s);

                            // Verify that satellite has not claimed its reward for given proposal
                            verifyRewardNotClaimed(satelliteAddress, proposalId, s);

                            // Verify that the reward is ready to be claimed
                            verifyRewardReadyToBeClaimed(_record);

                            // Add the reward to the storage
                            const satelliteRewardProposalKey : (actionIdType * address) = (proposalId, satelliteAddress);
                            s.proposalRewards[satelliteRewardProposalKey] := unit;

                            // Calculate the reward
                            const globalVoteCount : nat = _record.yayVoteCount + _record.nayVoteCount + _record.passVoteCount;
                            const satelliteReward : nat = _record.totalVotersReward / globalVoteCount;

                            // Create distribute reward operation
                            const distributeRewardOperation : operation = distributeRewardOperation(claimSatellite, satelliteReward, s);
                            operations := distributeRewardOperation # operations;
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
                var proposal : proposalRecordType := getProposalRecord(proposalId, s);

                // ------------------------------------------------------------------
                // Satellite Permissions Check
                // ------------------------------------------------------------------

                // Verify that satellite exists and is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(proposal.proposerAddress, s);

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check that proposal exists in the current cycle's proposals
                verifyProposalExistsInCurrentCycle(proposalId, s);

                // Check that proposal has not been dropped
                verifyProposalNotDropped(proposal);

                // ------------------------------------------------------------------
                // Drop Proposal
                // ------------------------------------------------------------------

                // Check if sender is proposer or admin 
                if proposal.proposerAddress = Mavryk.get_sender() or Mavryk.get_sender() = s.admin then block {

                    // Set proposal status to "DROPPED"
                    proposal.status               := "DROPPED";
                    s.proposalLedger[proposalId]  := proposal;

                    // Drop and remove proposal
                    s := dropProposal(proposal.proposerAddress, proposalId, s);

                    // If current round is a timelock or voting round (where there is only one proposal), restart the cycle
                    s := restartCycleIfVotingOrTimelockRound(s);

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
