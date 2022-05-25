// ------------------------------------------------------------------------------
//
// Governance Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Lambda Begin
// ------------------------------------------------------------------------------

(*  breakGlass lambda *)
function lambdaBreakGlass(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    // Steps Overview:
    // 1. set admin to breakglass address in governance contract

    // check that sender is from emergency governance contract 
    checkSenderIsEmergencyGovernanceContract(s);

    case governanceLambdaAction of [
        | LambdaBreakGlass(_parameters) -> {
                
                const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_BREAK_GLASS_CONTRACT_NOT_FOUND)
                ];

                // Set self admin to breakGlass
                s.admin := _breakGlassAddress;

            }
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  propagateBreakGlass lambda *)
function lambdaPropagateBreakGlass(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    // Steps Overview:
    // 1. set admin to breakglass address in major contracts (doorman, delegation etc)
    // 2. send pause all operations to main contracts

    // check that sender is from break glass contract
    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaPropagateBreakGlass(_parameters) -> {
                
                // Check if glass is broken
                const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_BREAK_GLASS_CONTRACT_NOT_FOUND)
                ];

                const getGlassBrokenView : option (bool) = Tezos.call_view ("getGlassBroken", unit, _breakGlassAddress);
                const glassBroken: bool = case getGlassBrokenView of [
                      Some (_glassBroken) -> _glassBroken
                    | None -> failwith (error_GET_GLASS_BROKEN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND)
                ];

                if glassBroken then skip else failwith(error_GLASS_NOT_BROKEN);

                for _contractName -> contractAddress in map s.generalContracts block {
                    
                    // 1. first, trigger pauseAll entrypoint in contract 
                    // 2. second, trigger setAdmin entrypoint in contract to change admin to break glass contract

                    case (Tezos.get_entrypoint_opt("%setAdmin", contractAddress) : option(contract(address))) of [
                          Some(contr) -> operations := Tezos.transaction(_breakGlassAddress, 0tez, contr) # operations
                        | None        -> skip
                    ];
                    
                    case (Tezos.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
                          Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
                        | None        -> skip
                    ];
                } 

            }
        | _ -> skip
    ];
    
} with(operations, s)

// ------------------------------------------------------------------------------
// Break Glass Lambda End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {

                // Check if the desired admin is a whitelisted dev or the current proxy address
                if not Set.mem(newAdminAddress, s.whitelistDevelopers) and newAdminAddress =/= s.governanceProxyAddress then {
                    // Check if the admin is the breakGlass
                    const _breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
                        Some(_address) -> _address
                        | None           -> failwith(error_BREAK_GLASS_CONTRACT_NOT_FOUND)
                    ];
                    if newAdminAddress = _breakGlassAddress then skip
                    else failwith(error_ONLY_BREAK_GLASS_CONTRACT_OR_DEVELOPERS_OR_PROXY_CONTRACT_ALLOWED)
                }
                else skip;
                
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernanceProxy lambda *)
function lambdaSetGovernanceProxy(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceLambdaAction of [
        | LambdaSetGovernanceProxy(newGovernanceProxyAddress) -> {
                s.governanceProxyAddress := newGovernanceProxyAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)


(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    case governanceLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  
  checkSenderIsAdmin(s); // check that sender is admin

  case governanceLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : governanceUpdateConfigActionType     = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceUpdateConfigNewValueType   = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    ConfigSuccessReward (_v)              -> {
                        // set boundary - do for the rest
                        s.config.successReward              := updateConfigNewValue
                        }
                    | ConfigCycleVotersReward (_v)                      -> s.config.cycleVotersReward                       := updateConfigNewValue
                    | ConfigMinProposalRoundVotePct (_v)                -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minProposalRoundVotePercentage := updateConfigNewValue
                    | ConfigMinProposalRoundVotesReq (_v)               -> s.config.minProposalRoundVotesRequired           := updateConfigNewValue
                    | ConfigMinQuorumPercentage (_v)                    -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minQuorumPercentage                     := updateConfigNewValue
                    | ConfigMinQuorumMvkTotal (_v)                      -> s.config.minQuorumMvkTotal                       := updateConfigNewValue
                    | ConfigVotingPowerRatio (_v)                       -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.votingPowerRatio                        := updateConfigNewValue
                    | ConfigProposeFeeMutez (_v)                        -> s.config.proposalSubmissionFeeMutez              := updateConfigNewValue * 1mutez                    
                    | ConfigMinimumStakeReqPercentage (_v)              -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.minimumStakeReqPercentage               := updateConfigNewValue
                    | ConfigMaxProposalsPerDelegate (_v)                -> s.config.maxProposalsPerDelegate                 := updateConfigNewValue
                    | ConfigBlocksPerProposalRound (_v)                 -> if updateConfigNewValue > (Tezos.level + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerProposalRound                  := updateConfigNewValue
                    | ConfigBlocksPerVotingRound (_v)                   -> if updateConfigNewValue > (Tezos.level + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerVotingRound                    := updateConfigNewValue
                    | ConfigBlocksPerTimelockRound (_v)                 -> if updateConfigNewValue > (Tezos.level + maxRoundDuration) then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.blocksPerTimelockRound                  := updateConfigNewValue
                    | ConfigProposalDatTitleMaxLength (_v)              -> s.config.proposalMetadataTitleMaxLength          := updateConfigNewValue
                    | ConfigProposalTitleMaxLength (_v)                 -> s.config.proposalTitleMaxLength                  := updateConfigNewValue
                    | ConfigProposalDescMaxLength (_v)                  -> s.config.proposalDescriptionMaxLength            := updateConfigNewValue
                    | ConfigProposalInvoiceMaxLength (_v)               -> s.config.proposalInvoiceMaxLength                := updateConfigNewValue
                    | ConfigProposalCodeMaxLength (_v)                  -> s.config.proposalSourceCodeMaxLength             := updateConfigNewValue
                ];

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceLambdaAction : governanceLambdaActionType; var s: governanceStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    
    case governanceLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistDevelopersContracts lambda *)
function lambdaUpdateWhitelistDevelopers(const governanceLambdaAction : governanceLambdaActionType; var s: governanceStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case governanceLambdaAction of [
        | LambdaUpdateWhitelistDevelopers(developer) -> 

            if Set.mem(developer, s.whitelistDevelopers) then 
                if Set.size(s.whitelistDevelopers) > 1n then 
                    s.whitelistDevelopers := Set.remove(developer, s.whitelistDevelopers)
                        else failwith(error_NOT_ENOUGH_WHITELISTED_DEVELOPERS)
            else 
                s.whitelistDevelopers := Set.add(developer, s.whitelistDevelopers)
        | _ -> skip
    ];

} with (noOperations, s)



(*  setContractAdmin lambda *)
function lambdaSetContractAdmin(const governanceLambdaAction : governanceLambdaActionType; var s: governanceStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // Operations list
    var operations: list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaSetContractAdmin(setContractAdminParams) ->
            // Set admin of new contract
            operations := Tezos.transaction(
                (setContractAdminParams.newContractAdmin), 
                0tez, 
                getSetAdminEntrypoint(setContractAdminParams.targetContractAddress)
            ) # operations
        | _ -> skip
    ];

} with (operations, s)



(*  setContractGovernance lambda *)
function lambdaSetContractGovernance(const governanceLambdaAction : governanceLambdaActionType; var s: governanceStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // Operations list
    var operations: list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaSetContractGovernance(setContractGovernanceParams) ->
            // Set admin of new contract
            operations := Tezos.transaction(
                (setContractGovernanceParams.newContractGovernance), 
                0tez, 
                getSetGovernanceEntrypoint(setContractGovernanceParams.targetContractAddress)
            ) # operations
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Cycle Lambdas Begin
// ------------------------------------------------------------------------------

(*  startNextRound lambda *)
function lambdaStartNextRound(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is
block {

  // Current round hass not ended
  if Tezos.level < s.currentCycleInfo.roundEndLevel
  then failwith(error_CURRENT_ROUND_NOT_FINISHED) 
  else skip;

  // Execute past proposal if parameter set to true
  var operations: list(operation) := nil;

  case governanceLambdaAction of [
        | LambdaStartNextRound(executePastProposal) -> {
                
                // Get current variables
                const currentRoundHighestVotedProposal: option(proposalRecordType) = Big_map.find_opt(s.currentRoundHighestVotedProposalId, s.proposalLedger);
                
                var _highestVoteCounter     : nat := 0n;
                var highestVotedProposalId  : nat := 0n;
                for proposalId -> voteCount in map s.currentCycleInfo.roundProposals block {
                    if voteCount > _highestVoteCounter then block {
                        _highestVoteCounter     := voteCount;
                        highestVotedProposalId  := proposalId; 
                    } else skip;
                };
                const proposalRoundProposal: option(proposalRecordType) = Big_map.find_opt(highestVotedProposalId, s.proposalLedger);

                // Switch depending on current round
                case s.currentCycleInfo.round of [

                    Proposal -> case proposalRoundProposal of [
                        Some (proposal) -> if highestVotedProposalId =/= 0n and proposal.passVoteMvkTotal >= proposal.minProposalRoundVotesRequired then

                            // Start voting round with highest voted proposal from proposal round
                            s := setupVotingRound(highestVotedProposalId, s)

                        else

                            // Criteria not matched - Restart a new proposal round
                            s := setupProposalRound(s)

                        | None -> s := setupProposalRound(s)
                    ]
                    
                    | Voting -> case currentRoundHighestVotedProposal of [
                        Some (proposal) -> block{
                            // Check if proposal has voters. Send rewards to all voters
                            if Map.size(proposal.voters) > 0n then operations  := sendRewardsToVoters(s) # operations
                            else skip;

                            if proposal.upvoteMvkTotal < proposal.minQuorumMvkTotal then {
                            
                                // Vote criteria not matched - restart a new proposal round
                                s := setupProposalRound(s);

                            } else block {

                                // Vote criteria matched - start timelock round
                                s := setupTimelockRound(s);
                            };
                        }
                        | None -> failwith(error_HIGHEST_VOTED_PROPOSAL_NOT_FOUND)
                    ]

                    | Timelock -> block {
                        
                        // Start proposal round
                        s := setupProposalRound(s);
                        if s.timelockProposalId =/= 0n and executePastProposal then operations := Tezos.transaction(
                                (unit), 
                                0tez, 
                                getExecuteProposalEntrypoint(Tezos.self_address)
                            ) # operations else skip;
                    }
                ];

            }
        | _ -> skip
    ];

} with (operations, s)



(* propose lambda *)
function lambdaPropose(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    // Steps Overview:
    // 1. verify that the current round is a governance proposal round
    // 2. verify that current block level has not exceeded round's end level 
    // 3. verify that user is a satellite, has sufficient staked MVK to propose (data taken from snapshot of all active satellite holdings at start of governance round)
    // 4. check that proposer has sent enough tez to cover the submission fee
    // 5. submit (save) proposal - note: proposer does not automatically vote pass for his proposal
    // 6. add proposal id to current round proposals map

    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    var operations: list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaPropose(newProposal) -> {

                // check if tez sent is equal to the required fee
                if Tezos.amount =/= s.config.proposalSubmissionFeeMutez 
                then failwith(error_TEZ_FEE_UNPAID) 
                else skip;

                const treasuryAddress : address = case s.generalContracts["taxTreasury"] of [
                    Some(_address) -> _address
                    | None -> failwith(error_PROPOSE_TAX_TREASURY_CONTRACT_NOT_FOUND)
                ];

                const treasuryContract: contract(unit) = Tezos.get_contract_with_error(treasuryAddress, "Error. Contract not found at given address");
                const transferFeeToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.amount);
                
                operations  := transferFeeToTreasuryOperation # operations;

                // check if satellite exists in the active satellites map
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITE_ALLOWED)
                      ]
                    
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of [
                      None           -> failwith(error_SNAPSHOT_NOT_TAKEN)
                    | Some(snapshot) -> snapshot
                ];

                // validate inputs
                if String.length(newProposal.title) > s.config.proposalTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newProposal.description) > s.config.proposalDescriptionMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newProposal.invoice) > s.config.proposalInvoiceMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                if String.length(newProposal.sourceCode) > s.config.proposalSourceCodeMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // minimumStakeReqPercentage - 5% -> 500 | snapshotMvkTotalSupply - mu 
                const minimumMvkRequiredForProposalSubmission = s.config.minimumStakeReqPercentage * s.snapshotMvkTotalSupply / 10_000;

                if satelliteSnapshot.totalStakedMvkBalance < abs(minimumMvkRequiredForProposalSubmission) then failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip; 

                const proposalId          : nat                                     = s.nextProposalId;
                const emptyPassVotersMap  : passVotersMapType                       = map [];
                const emptyVotersMap      : votersMapType                           = map [];
                const proposalMetadata    : map(nat, option(proposalMetadataType))  = map [];
                const paymentMetadata     : map(nat, option(paymentMetadataType))   = map [];

                var proposerProposals   : set(nat)             := case s.currentCycleInfo.roundProposers[Tezos.sender] of [
                      Some (_proposals) -> _proposals
                    | None              -> Set.empty
                ];

                if Set.cardinal(proposerProposals) < s.config.maxProposalsPerDelegate then skip
                else failwith(error_MAX_PROPOSAL_REACHED);

                var newProposalRecord : proposalRecordType := record [
                    proposerAddress                     = Tezos.sender;
                    proposalMetadata                    = proposalMetadata;
                    proposalMetadataExecutionCounter    = 0n;
                    paymentMetadata                     = paymentMetadata;

                    status                              = "ACTIVE";                        // status: "ACTIVE", "DROPPED"
                    title                               = newProposal.title;               // title
                    description                         = newProposal.description;         // description
                    invoice                             = newProposal.invoice;             // ipfs hash of invoice file
                    sourceCode                          = newProposal.sourceCode;

                    successReward                       = s.config.successReward;          // log of successful proposal reward for voters - may change over time
                    executed                            = False;                           // boolean: executed set to true if proposal is executed
                    paymentProcessed                    = False;                           // boolean: set to true if proposal payment has been processed 
                    locked                              = False;                           // boolean: locked set to true after proposer has included necessary metadata and proceed to lock proposal

                    passVoteCount                       = 0n;                              // proposal round: pass votes count (to proceed to voting round)
                    passVoteMvkTotal                    = 0n;                              // proposal round pass vote total mvk from satellites who voted pass
                    passVotersMap                       = emptyPassVotersMap;              // proposal round ledger

                    minProposalRoundVotePercentage      = s.config.minProposalRoundVotePercentage;   // min vote percentage of total MVK supply required to pass proposal round
                    minProposalRoundVotesRequired       = s.config.minProposalRoundVotesRequired;    // min staked MVK votes required for proposal round to pass

                    upvoteCount                         = 0n;                              // voting round: upvotes count
                    upvoteMvkTotal                      = 0n;                              // voting round: upvotes MVK total 
                    downvoteCount                       = 0n;                              // voting round: downvotes count
                    downvoteMvkTotal                    = 0n;                              // voting round: downvotes MVK total 
                    abstainCount                        = 0n;                              // voting round: abstain count
                    abstainMvkTotal                     = 0n;                              // voting round: abstain MVK total 
                    voters                              = emptyVotersMap;                  // voting round ledger

                    minQuorumPercentage                 = s.config.minQuorumPercentage;    // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
                    minQuorumMvkTotal                   = s.config.minQuorumMvkTotal;      // log of min quorum in MVK - capture state at this point     
                    quorumCount                         = 0n;                              // log of turnout for voting round - number of satellites who voted
                    quorumMvkTotal                      = 0n;                              // log of total positive votes in MVK  
                    startDateTime                       = Tezos.now;                       // log of when the proposal was proposed

                    cycle                               = s.cycleCounter;
                    currentCycleStartLevel              = s.currentCycleInfo.roundStartLevel;        // log current round/cycle start level
                    currentCycleEndLevel                = s.currentCycleInfo.cycleEndLevel;          // log current cycle end level
                ];

                // save proposal to proposalLedger
                s.proposalLedger[proposalId] := newProposalRecord;

                // save proposer proposals
                proposerProposals                     := Set.add(proposalId, proposerProposals);
                s.currentCycleInfo.roundProposers[Tezos.sender] := proposerProposals;

                // Add data on creation
                case newProposal.proposalMetadata of [

                    Some (_metadataList) -> block{
                        // For a better user experience and frontend implementation, fold_right is used to execute the operation of adding 
                        // proposalData in FIFO
                        function proposalDataOperationAccumulator(const metadata: proposalMetadataType; const operationList: list(operation)): list(operation) is
                            Tezos.transaction(
                                record [
                                    proposalId      = proposalId;
                                    title           = metadata.title;
                                    proposalBytes   = metadata.data;
                                ],
                                0tez, 
                                getUpdateProposalDataEntrypoint(Tezos.self_address)
                            ) # operationList;
                        
                        operations := List.fold_right(proposalDataOperationAccumulator, _metadataList, operations)
                    }

                | None -> skip

                ];

                case newProposal.paymentMetadata of [

                    Some (_metadataList) -> block{
                        // For a better user experience and frontend implementation, fold_right is used to execute the operation of adding 
                        // paymentData in FIFO
                        function paymentDataOperationAccumulator(const metadata: paymentMetadataType; const operationList: list(operation)): list(operation) is
                            Tezos.transaction(
                                record [
                                    proposalId              = proposalId;
                                    title                   = metadata.title;
                                    paymentTransaction      = metadata.transaction;
                                ],
                                0tez, 
                                getUpdatePaymentDataEntrypoint(Tezos.self_address)
                            ) # operationList;
                        
                        operations := List.fold_right(paymentDataOperationAccumulator, _metadataList, operations)
                    }

                | None -> skip

                ];

                // add proposal id to current round proposals and initialise with zero positive votes in MVK 
                s.currentCycleInfo.roundProposals[proposalId] := 0n;

                // increment next proposal id
                s.nextProposalId := proposalId + 1n;

            }
        | _ -> skip
    ];

} with (operations, s)



(* updateProposalData lambda *)
function lambdaUpdateProposalData(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        | LambdaUpdateProposalData(proposalData) -> {
                
                const proposalId     : nat     = proposalData.proposalId;
                const title          : string  = proposalData.title;
                const proposalBytes  : bytes   = proposalData.proposalBytes;

                // validate inputs
                if String.length(title) > s.config.proposalMetadataTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                
                var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of [ 
                      Some(_record) -> _record
                    | None          -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // check that proposal is not locked
                if proposalRecord.locked = True then failwith(error_PROPOSAL_LOCKED)
                else skip;

                // check that sender is the creator of the proposal 
                if proposalRecord.proposerAddress =/= Tezos.sender and Tezos.self_address =/= Tezos.sender then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // check that proposer is still a satellite
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", proposalRecord.proposerAddress, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                            Some (_satellite) -> skip
                            | None -> failwith(error_ONLY_SATELLITE_ALLOWED)
                        ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Create the new proposalMetadata
                const newProposalData: proposalMetadataType = record[
                    title   = title;
                    data    = proposalBytes;
                ];
                // Calculate the index on where the metadata should be added in the map(index -> proposalMetadata)
                var newIndex: nat   := Map.size(proposalRecord.proposalMetadata);
                // Entries should have unique names in the proposal. The data will be added to the map if its name is unique 
                var addData: bool   := True;
                // Loop through all the current proposalMetadata of the proposal to check if a data with a similar name already exists
                for _index -> metadata in map proposalRecord.proposalMetadata block {

                    case metadata of [
                        Some (_validMetadata) -> block{
                            // If a data with a similar name exists, it set the addData to false
                            if _validMetadata.title = title then {
                                addData := False;
                                // If the data has the same bytes, it will be removed from the map (NONE), if not, the data will be updated (SOME)
                                if _validMetadata.data = proposalBytes then {
                                    proposalRecord.proposalMetadata[_index]   := (None : option(proposalMetadataType));
                                } else {
                                    proposalRecord.proposalMetadata[_index]   := Some (newProposalData);
                                }
                            } else skip
                        }
                    |   None -> skip
                    ];

                };
                // If the data is unique, it will be added to the map (SOME)
                if addData then proposalRecord.proposalMetadata[newIndex] := Some (newProposalData);

                // save changes and update proposal ledger
                s.proposalLedger[proposalId] := proposalRecord;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updatePaymentData lambda *)
function lambdaUpdatePaymentData(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        | LambdaUpdatePaymentData(paymentData) -> {
                
                const proposalId            : nat                       = paymentData.proposalId;
                const title                 : string                    = paymentData.title;
                const paymentTransaction    : transferDestinationType   = paymentData.paymentTransaction;

                // validate inputs
                if String.length(title) > s.config.proposalMetadataTitleMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
    
                var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of [ 
                      Some(_record) -> _record
                    | None          -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // check that proposal is not locked
                if proposalRecord.locked = True then failwith(error_PROPOSAL_LOCKED)
                else skip;

                // check that sender is the creator of the proposal 
                if proposalRecord.proposerAddress =/= Tezos.sender and Tezos.self_address =/= Tezos.sender then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // check that proposer is still a satellite
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", proposalRecord.proposerAddress, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                            Some (_satellite) -> skip
                            | None -> failwith(error_ONLY_SATELLITE_ALLOWED)
                        ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Create the new paymentMetadata
                const newPaymentData: paymentMetadataType = record[
                    title           = title;
                    transaction     = paymentTransaction;
                ];
                // Calculate the index on where the metadata should be added in the map(index -> paymentMetadata)
                var newIndex: nat   := Map.size(proposalRecord.paymentMetadata);
                // Entries should have unique names in the proposal. The data will be added to the map if its name is unique 
                var addData: bool   := True;
                // Loop through all the current paymentMetadata of the proposal to check if a data with a similar name already exists
                for _index -> metadata in map proposalRecord.paymentMetadata block {

                    case metadata of [
                        Some (_validMetadata) -> block{
                            // If a data with a similar name exists, it set the addData to false
                             if _validMetadata.title = title then {
                                addData := False;
                                // If the data has the same transaction, it will be removed from the map (NONE), if not, the data will be updated (SOME)
                                if _validMetadata.transaction = paymentTransaction then {
                                    proposalRecord.paymentMetadata[_index]   := (None : option(paymentMetadataType));
                                } else {
                                    proposalRecord.paymentMetadata[_index]   := Some (newPaymentData);
                                }
                            } else skip
                        }
                    |   None -> skip
                    ];

                };
                // If the data is unique, it will be added to the map (SOME)
                if addData then proposalRecord.paymentMetadata[newIndex] := Some (newPaymentData);

                // save changes and update proposal ledger
                s.proposalLedger[proposalId] := proposalRecord;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* lockProposal lambda *)
function lambdaLockProposal(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        | LambdaLockProposal(proposalId) -> {
                
                var proposalRecord : proposalRecordType := case s.proposalLedger[proposalId] of [ 
                      Some(_record) -> _record
                    | None          -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // check that sender is the creator of the proposal 
                if proposalRecord.proposerAddress =/= Tezos.sender then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // check that proposer is still a satellite
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", proposalRecord.proposerAddress, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                            Some (_satellite) -> skip
                            | None -> failwith(error_ONLY_SATELLITE_ALLOWED)
                        ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // check that proposal is not locked
                if proposalRecord.locked = True then failwith(error_PROPOSAL_LOCKED)
                else skip;

                proposalRecord.locked        := True; 
                s.proposalLedger[proposalId] := proposalRecord;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* proposalRoundVote lambda *)
function lambdaProposalRoundVote(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    // Steps Overview:
    // 1. verify that current round is a proposal round
    // 2. verify that user is an active satellite and is allowed to vote (address is a satellite)
    // 3. verify that proposal is active and has not been dropped
    // 4. verify that snapshot of satellite has been taken
    // 5. verify that proposal exists
    // 6a. if satellite has not voted in the current round, submit satellite's vote for proposal and update vote counts
    // 6b. if satellite has voted for another proposal in the current round, submit satellite's vote for new proposal and remove satellite's vote from previously voted proposal

    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        | LambdaProposalRoundVote(proposalId) -> {
                
                // check if satellite exists in the active satellites map
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [

                  Some (value) -> case value of [
                      Some (_satellite) -> skip
                    | None              -> failwith(error_ONLY_SATELLITE_ALLOWED)
                  ]

                | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)

                ];

                const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of [
                      None           -> failwith(error_SNAPSHOT_NOT_TAKEN)
                    | Some(snapshot) -> snapshot
                ];

                // check if proposal exists in the current round's proposals
                const checkProposalExistsFlag : bool = Map.mem(proposalId, s.currentCycleInfo.roundProposals);
                if checkProposalExistsFlag = False then failwith(error_PROPOSAL_NOT_FOUND)
                else skip;

                var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
                      Some(_proposal) -> _proposal
                    | None            -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // verify that proposal is active and has not been dropped
                if _proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // check that proposal is locked
                if _proposal.locked = False then failwith(error_PROPOSAL_NOT_LOCKED)
                else skip;

                const checkIfSatelliteHasVotedFlag : bool = Map.mem(Tezos.sender, s.currentCycleInfo.roundVotes);
                if checkIfSatelliteHasVotedFlag = False then block {
                
                    // satellite has not voted for other proposals

                    const newPassVoteMvkTotal : nat = _proposal.passVoteMvkTotal + satelliteSnapshot.totalVotingPower;

                    _proposal.passVoteCount               := _proposal.passVoteCount + 1n;    
                    _proposal.passVoteMvkTotal            := newPassVoteMvkTotal;
                    _proposal.passVotersMap[Tezos.sender] := (satelliteSnapshot.totalVotingPower, Tezos.now);
                    
                    // update proposal with new vote
                    s.proposalLedger[proposalId] := _proposal;

                    // update current round votes with satellite's address -> proposal id
                    s.currentCycleInfo.roundVotes[Tezos.sender] := proposalId;

                    // increment proposal with satellite snapshot's total voting power
                    s.currentCycleInfo.roundProposals[proposalId] := newPassVoteMvkTotal;

                } else block {
                    
                    // satellite has voted for another proposal

                    const newPassVoteMvkTotal : nat = _proposal.passVoteMvkTotal + satelliteSnapshot.totalVotingPower;

                    _proposal.passVoteCount               := _proposal.passVoteCount + 1n;
                    _proposal.passVoteMvkTotal            := newPassVoteMvkTotal;
                    _proposal.passVotersMap[Tezos.sender] := (satelliteSnapshot.totalVotingPower, Tezos.now);

                    // update previous prospoal begin -----------------
                    const previousVotedProposalId : nat = case s.currentCycleInfo.roundVotes[Tezos.sender] of [
                          Some(_id) -> _id
                        | None      -> failwith(error_PROPOSAL_NOT_FOUND)
                    ];

                    var _previousProposal : proposalRecordType := case s.proposalLedger[previousVotedProposalId] of [
                          Some(_previousProposal) -> _previousProposal
                        | None                    -> failwith(error_PROPOSAL_NOT_FOUND)
                    ];

                    var previousProposalPassVoteCount : nat := _previousProposal.passVoteCount;
                    _previousProposal.passVoteCount := abs(previousProposalPassVoteCount - 1n) ;

                    // decrement previously voted on proposal by amount of satellite's total voting power - conditionals to check that min will never go below 0
                    var previousProposalPassVoteMvkTotal : nat := _previousProposal.passVoteMvkTotal;
                    if satelliteSnapshot.totalVotingPower > previousProposalPassVoteMvkTotal then previousProposalPassVoteMvkTotal := 0n 
                    else previousProposalPassVoteMvkTotal := abs(previousProposalPassVoteMvkTotal - satelliteSnapshot.totalVotingPower); 
                    
                    _previousProposal.passVoteMvkTotal := previousProposalPassVoteMvkTotal;

                    // remove user from previous proposal that he voted on, decrement previously voted proposal by satellite snapshot's total voting power
                    remove Tezos.sender from map _previousProposal.passVotersMap;        
                    s.currentCycleInfo.roundProposals[previousVotedProposalId] := previousProposalPassVoteMvkTotal;
                    // -------- update previous prospoal end ---------
                
                    // update proposal with new vote, increment proposal with satellite snapshot's total voting power
                    s.proposalLedger[proposalId] := _proposal;
                    s.proposalLedger[previousVotedProposalId] := _previousProposal;

                    // increment proposal with satellite snapshot's total voting power
                    s.currentCycleInfo.roundProposals[proposalId] := newPassVoteMvkTotal;

                    // update current round votes with satellite's address -> new proposal id
                    s.currentCycleInfo.roundVotes[Tezos.sender] := proposalId;    
                } 

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* votingRoundVote lambda *)
function lambdaVotingRoundVote(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    // Steps Overview:
    // 1. verify that round is a voting round
    // 2. verify that user is a satellite, and is allowed to vote for the current voting round with his snapshot taken
    // 3. verify that proposal exists, proposal is active and has not been dropped
    // 4. submit satellite's vote for proposal and update vote counts
    
    if s.currentCycleInfo.round = (Voting : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_VOTING_ROUND);

    if s.currentRoundHighestVotedProposalId = 0n then failwith(error_NO_PROPOSAL_TO_VOTE_FOR)
    else skip; 

    case governanceLambdaAction of [
        | LambdaVotingRoundVote(voteRecord) -> {

                // get vote from record 
                const voteType: voteForProposalChoiceType   = voteRecord.vote;
                
                // check if satellite exists in the active satellites map
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                  Some(_address) -> _address
                | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                
                    Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITE_ALLOWED)
                    ]

                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)

                ];

                const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of [
                      None           -> failwith(error_SNAPSHOT_NOT_TAKEN)
                    | Some(snapshot) -> snapshot
                ];

                // check if proposal exists in the current round's proposals
                const checkProposalExistsFlag : bool = Map.mem(s.currentRoundHighestVotedProposalId, s.currentCycleInfo.roundProposals);
                if checkProposalExistsFlag = False then failwith(error_PROPOSAL_NOT_FOUND)
                else skip;

                var _proposal : proposalRecordType := case s.proposalLedger[s.currentRoundHighestVotedProposalId] of [
                      None            -> failwith(error_PROPOSAL_NOT_FOUND)
                    | Some(_proposal) -> _proposal        
                ];

                // verify that proposal is active and has not been dropped
                if _proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // note: currentCycleInfo.roundVotes change in the use of nat from proposal round (from proposal id to vote type)
                //  i.e. (satelliteAddress, voteType - Yay | Nay | Abstain)
                const checkIfSatelliteHasVotedFlag : bool = Map.mem(Tezos.sender, s.currentCycleInfo.roundVotes);
                if checkIfSatelliteHasVotedFlag = False then block {
                    // satellite has not voted - add new vote
                    
                    _proposal.voters[Tezos.sender] := (satelliteSnapshot.totalVotingPower, Tezos.now, voteType);

                    // set proposal record based on vote type 
                    var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);
                    
                    // update proposal with new vote changes
                    s.proposalLedger[s.currentRoundHighestVotedProposalId] := _proposal;

                } else block {
                    // satellite has already voted - change of vote
                    
                    // get previous vote
                    var previousVote : (nat * timestamp * voteForProposalChoiceType) := case _proposal.voters[Tezos.sender] of [ 
                        | None                -> failwith(error_VOTE_NOT_FOUND)
                        | Some(_previousVote) -> _previousVote
                    ];

                    const previousVoteType = previousVote.2;

                    // check if new vote is the same as old vote
                    if previousVoteType = voteType then failwith (error_VOTE_ALREADY_RECORDED)
                    else skip;

                    // save new vote
                    _proposal.voters[Tezos.sender] := (satelliteSnapshot.totalVotingPower, Tezos.now, voteType);

                    // set proposal record based on vote type 
                    var _proposal : proposalRecordType := setProposalRecordVote(voteType, satelliteSnapshot.totalVotingPower, _proposal);

                    // unset previous vote in proposal record
                    var _proposal : proposalRecordType := unsetProposalRecordVote(previousVoteType, satelliteSnapshot.totalVotingPower, _proposal);
                    
                    // update proposal with new vote changes
                    s.proposalLedger[s.currentRoundHighestVotedProposalId] := _proposal;
                    
                }

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* executeProposal lambda *)
function lambdaExecuteProposal(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {
    // Steps Overview: 
    // 1. verify that user is a satellite and can execute proposal
    // 2. verify that proposal can be executed
    // 3. execute proposal - list of operations to run

    // check that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
    if (s.currentCycleInfo.round = (Timelock : roundType) and Tezos.sender =/= Tezos.self_address) or s.currentCycleInfo.round = (Voting : roundType) then failwith(error_PROPOSAL_CANNOT_BE_EXECUTED_NOW)
    else skip;

    // check that there is a highest voted proposal in the current round
    if s.timelockProposalId = 0n then failwith(error_NO_PROPOSAL_TO_EXECUTE)
    else skip;

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaExecuteProposal(_parameters) -> {
                
                var proposal : proposalRecordType := case s.proposalLedger[s.timelockProposalId] of [
                      Some(_record) -> _record
                    | None -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                if proposal.executed = True then failwith(error_PROPOSAL_EXECUTED)
                else skip;

                // verify that proposal is active and has not been dropped
                if proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // check that there is at least one proposal metadata to execute
                if Map.size(proposal.proposalMetadata) = 0n then failwith(error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE)
                else skip;

                // check if some data in the proposal were already executed
                if proposal.proposalMetadataExecutionCounter > 0n then failwith(error_PROPOSAL_EXECUTION_ALREADY_STARTED)
                else skip;

                // update proposal executed and isSucessful boolean to True
                proposal.executed                      := True;
                s.proposalLedger[s.timelockProposalId] := proposal;

                // Operation data should be executed in FIFO mode
                // So the loop starts at the last index of the proposal
                var dataCounter : nat   := Map.size(proposal.proposalMetadata);
                while (dataCounter > 0n) {
                    // Get the data with the corresponding index
                    var operationIndex: nat                     := abs(dataCounter - 1n);
                    
                    // Get the proposal metadata
                    var metadata: option(proposalMetadataType)  := case Map.find_opt(operationIndex, proposal.proposalMetadata) of [
                        Some (_optionData)      -> _optionData
                    |   None                    -> failwith(error_PROPOSAL_DATA_NOT_FOUND)
                    ];

                    // Execute the data or skip if this entry has no data to execute
                    case metadata of [
                        Some (_dataBytes)   -> operations := Tezos.transaction(
                                                _dataBytes.data,
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
        | _ -> skip
    ];

} with (operations, s)



(* processProposalPayment lambda *)
function lambdaProcessProposalPayment(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {
    
    // Steps Overview: 
    // 1. verify that user is the proposer of the successful proposal
    // 2. verify that proposal is successful
    // 3. verify that payment for proposal has not been processed
    // 4. verify that proposal is active and has not been dropped
    // 5. verify that there is at least one proposal metadata to execute
    // 6. process payment for proposal - list of operations to send to governance proxy contract to execute

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaProcessProposalPayment(proposalId) -> {

                var proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
                      Some(_record) -> _record
                    | None -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                // verify that sender is the satellite that proposed the proposal
                if Tezos.sender =/= proposal.proposerAddress then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // verify that payment for proposal has not been processed
                if proposal.paymentProcessed = True then failwith(error_PROPOSAL_PAYMENTS_PROCESSED)
                else skip;

                // verify that proposal is active and has not been dropped
                if proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // check that there is at least one proposal metadata to execute
                if Map.size(proposal.paymentMetadata) = 0n then failwith(error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE)
                else skip;

                // update proposal paymentProcessed boolean to True
                proposal.paymentProcessed              := True;
                s.proposalLedger[proposalId] := proposal;

                // turn the operation map to a list for the treasury contract
                var paymentsData: list(transferDestinationType)   := nil;

                // The order of operation will be the same as the one in the proposal, that's why we start
                // from the tail of the list
                var dataCounter : nat   := Map.size(proposal.paymentMetadata);
                while (dataCounter > 0n) {
                    // Get the data with the corresponding index
                    var operationIndex: nat := abs(dataCounter - 1n);
                    var metadata: option(paymentMetadataType)  := case Map.find_opt(operationIndex, proposal.paymentMetadata) of [
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

                // Send the rewards from the treasury to the doorman contract
                const treasuryAddress: address  = case Map.find_opt("paymentTreasury", s.generalContracts) of [
                    Some (_treasury) -> _treasury
                |   None -> failwith(error_PAYMENT_TREASURY_CONTRACT_NOT_FOUND)
                ];

                // Send a single operation to the treasury
                const transferOperation: operation = Tezos.transaction(
                    paymentsData,
                    0tez,
                    sendTransferOperationToTreasury(treasuryAddress)
                );
                operations := transferOperation # operations;

            }
        | _ -> skip
    ];

} with (operations, s)



(* processProposalSingleData lambda *)
function lambdaProcessProposalSingleData(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaProcessProposalSingleData(_parameter) -> {
                
                // check that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
                if (s.currentCycleInfo.round = (Timelock : roundType) and Tezos.sender =/= Tezos.self_address) or s.currentCycleInfo.round = (Voting : roundType) then failwith(error_PROPOSAL_CANNOT_BE_EXECUTED_NOW)
                else skip;

                // check that there is a highest voted proposal in the current round
                if s.timelockProposalId = 0n then failwith(error_NO_PROPOSAL_TO_EXECUTE)
                else skip;

                var proposal : proposalRecordType := case s.proposalLedger[s.timelockProposalId] of [
                      Some(_record) -> _record
                    | None -> failwith(error_PROPOSAL_NOT_FOUND)
                ];

                if proposal.executed = True then failwith(error_PROPOSAL_EXECUTED)
                else skip;

                // verify that proposal is active and has not been dropped
                if proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                // check that there is at least one proposal metadata to execute
                if Map.size(proposal.proposalMetadata) = 0n then failwith(error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE)
                else skip;

                // Proposal data should be executed in FIFO mode
                // Get the data to execute next based on the proposalMetadataExecutionCounter
                var optionData: option(proposalMetadataType)    := case proposal.proposalMetadata[proposal.proposalMetadataExecutionCounter] of [
                    Some (_data)    -> _data
                |   None            -> failwith(error_PROPOSAL_DATA_NOT_FOUND)
                ];

                // If there is no data to execute, loop through all the proposalMetadata, starting from tail to head to get data
                while proposal.proposalMetadataExecutionCounter < Map.size(proposal.proposalMetadata) and optionData = (None : option(proposalMetadataType)) block{
                    proposal.proposalMetadataExecutionCounter   := proposal.proposalMetadataExecutionCounter + 1n;
                    optionData                                  := case proposal.proposalMetadata[proposal.proposalMetadataExecutionCounter] of [
                        Some (_data)    -> _data
                    |   None            -> failwith(error_PROPOSAL_DATA_NOT_FOUND)
                    ];
                };

                // Check if there is data to execute (even at the last entry where index=0)
                case optionData of [
                    Some (_dataBytes)   -> operations := Tezos.transaction(
                                                _dataBytes.data,
                                                0tez,
                                                getExecuteGovernanceActionEntrypoint(s.governanceProxyAddress)
                                            ) # operations
                |   None                -> skip
                ];

                // Update proposal after the execution of a metadata
                proposal.proposalMetadataExecutionCounter       := proposal.proposalMetadataExecutionCounter + 1n;

                // Check if all operations were executed
                if proposal.proposalMetadataExecutionCounter >= Map.size(proposal.proposalMetadata) then {
                    // update proposal executed and isSucessful boolean to True
                    proposal.executed                      := True;

                    // Send reward to proposer
                    operations  := sendRewardToProposer(s) # operations;
                } else skip;

                s.proposalLedger[s.timelockProposalId] := proposal;

            }
        | _ -> skip
    ];

} with (operations, s)



(* dropProposal lambda *)
function lambdaDropProposal(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    // Steps Overview: 
    // 1. verify that proposal is in the current round / cycle
    // 2. verify that satellite made the proposal
    // 3. change status of proposal to inactive

    case governanceLambdaAction of [
        | LambdaDropProposal(proposalId) -> {
                
                // check if satellite exists in the active satellites map
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [

                    Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None -> if Tezos.sender = s.admin then skip else failwith(error_ONLY_SATELLITE_ALLOWED)
                    ]
                | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)

                ];

                // check if proposal exists in the current round's proposals
                const checkProposalExistsFlag : bool = Map.mem(proposalId, s.currentCycleInfo.roundProposals);
                if checkProposalExistsFlag = False then failwith(error_PROPOSAL_NOT_FOUND)
                else skip;

                var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of [
                      None -> failwith(error_PROPOSAL_NOT_FOUND)
                    | Some(_proposal) -> _proposal        
                ];

                // verify that proposal has not been dropped already
                if _proposal.status = "DROPPED" then failwith(error_PROPOSAL_DROPPED)
                else skip;

                if _proposal.proposerAddress = Tezos.sender or Tezos.sender = s.admin then block {
                    _proposal.status               := "DROPPED";
                    s.proposalLedger[proposalId]   := _proposal;

                    // Remove proposal from currentCycleInfo.roundProposers
                    var proposerProposals   : set(nat)             := case s.currentCycleInfo.roundProposers[_proposal.proposerAddress] of [
                          Some (_proposals) -> _proposals
                        | None -> failwith(error_PROPOSAL_NOT_FOUND)
                    ];
                    s.currentCycleInfo.roundProposers[_proposal.proposerAddress] := Set.remove(proposalId, proposerProposals);

                    // If timelock or voting round, restart the cycle
                    if s.currentCycleInfo.round = (Voting : roundType) or s.currentCycleInfo.round = (Timelock : roundType) 
                    then s := setupProposalRound(s) else skip;

                } else failwith(error_ONLY_PROPOSER_ALLOWED)
                
            }
        | _ -> skip
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