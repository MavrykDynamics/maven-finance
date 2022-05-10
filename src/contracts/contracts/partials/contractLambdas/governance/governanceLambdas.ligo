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
  
  checkSenderIsAdminOrSelf(s); // check that sender is admin

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
                    | ConfigFinancialReqApprovalPct (_v)                -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.financialRequestApprovalPercentage      := updateConfigNewValue
                    | ConfigFinancialReqDurationDays (_v)               -> s.config.financialRequestDurationInDays          := updateConfigNewValue
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



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceLambdaAction : governanceLambdaActionType; var s: governanceStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    
    case governanceLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
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



(*  updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const governanceLambdaAction : governanceLambdaActionType; var s: governanceStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case governanceLambdaAction of [
        | LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
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
                s.whitelistDevelopers := Set.remove(developer, s.whitelistDevelopers)
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
                            if Set.cardinal(proposal.voters) > 0n then operations  := sendRewardsToVoters(s) # operations
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

                if satelliteSnapshot.totalMvkBalance < abs(minimumMvkRequiredForProposalSubmission) then failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED)
                else skip; 

                const proposalId          : nat                   = s.nextProposalId;
                const emptyPassVotersMap  : passVotersMapType     = map [];
                const emptyVotersMap      : votersMapType         = map [];
                const proposalMetadata    : proposalMetadataType  = map [];
                const paymentMetadata     : paymentMetadataType   = map [];

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
                    paymentMetadataExecutionCounter     = 0n;

                    status                              = "ACTIVE";                        // status: "ACTIVE", "DROPPED"
                    title                               = newProposal.title;               // title
                    description                         = newProposal.description;         // description
                    invoice                             = newProposal.invoice;             // ipfs hash of invoice file
                    sourceCode                          = newProposal.sourceCode;

                    successReward                       = s.config.successReward;          // log of successful proposal reward for voters - may change over time
                    executed                            = False;                           // boolean: executed set to true if proposal is executed
                    isSuccessful                        = False;                           // boolean: set to true if proposal is successful (gone from voting round to timelock round)
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

                    Some (_metadataMap) -> block{
                    for title -> data in map _metadataMap block {

                        // prepare proposal data parameters
                        const proposalData = record [
                            proposalId      = proposalId;
                            title           = title;
                            proposalBytes   = data;
                        ];

                        // new operation for add/update proposal data
                        operations := Tezos.transaction(
                            proposalData,
                            0tez, 
                            getAddUpdateProposalDataEntrypoint(Tezos.self_address)
                        ) # operations;
                    }
                    }

                | None -> skip

                ];

                case newProposal.paymentMetadata of [

                    Some (_metadataMap) -> block{
                    for title -> data in map _metadataMap block {

                        // prepare payment data parameters
                        const paymentData = record [
                            proposalId              = proposalId;
                            title                   = title;
                            paymentTransaction      = data;
                        ];

                        // new operation for add/update payment data
                        operations := Tezos.transaction(
                            paymentData,
                            0tez, 
                            getAddUpdatePaymentDataEntrypoint(Tezos.self_address)
                        ) # operations;
                    }
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



(* addUpdateProposalData lambda *)
function lambdaAddUpdateProposalData(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        | LambdaAddUpdateProposalData(proposalData) -> {
                
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
                if proposalRecord.proposerAddress =/= Tezos.source then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // Add or update data to proposal
                proposalRecord.proposalMetadata[title] := proposalBytes; 

                // save changes and update proposal ledger
                s.proposalLedger[proposalId] := proposalRecord;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* addUpdatePaymentData lambda *)
function lambdaAddUpdatePaymentData(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    if s.currentCycleInfo.round = (Proposal : roundType) then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

    case governanceLambdaAction of [
        | LambdaAddUpdatePaymentData(paymentData) -> {
                
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
                if proposalRecord.proposerAddress =/= Tezos.source then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

                // Add or update data to proposal
                proposalRecord.paymentMetadata[title] := paymentTransaction; 

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
                if proposalRecord.proposerAddress =/= Tezos.source then failwith(error_ONLY_PROPOSER_ALLOWED)
                else skip;

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
        | LambdaVotingRoundVote(voteType) -> {
                
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
    if (s.currentCycleInfo.round = (Timelock : roundType) and Tezos.sender =/= Tezos.self_address) or s.currentCycleInfo.round = (Voting : roundType) then skip else failwith(error_PROPOSAL_CANNOT_BE_EXECUTED_NOW);

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

                // update proposal executed and isSucessful boolean to True
                proposal.executed                      := True;
                proposal.isSuccessful                  := True;
                s.proposalLedger[s.timelockProposalId] := proposal;    

                // loop proposal metadata for execution
                for _title -> metadataBytes in map proposal.proposalMetadata block {

                    const sendProposalActionToGovernanceProxyForExecutionOperation : operation = Tezos.transaction(
                        metadataBytes,
                        0tez,
                        getExecuteGovernanceActionEntrypoint(s.governanceProxyAddress)
                    );
                
                    operations := sendProposalActionToGovernanceProxyForExecutionOperation # operations;

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

                // verify that proposal is successful
                if proposal.isSuccessful = False then failwith(error_PROPOSAL_UNSUCCESSFUL)
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
                s.proposalLedger[s.timelockProposalId] := proposal;

                // turn the operation map to a list for the treasury contract
                var paymentsData: list(transferDestinationType)   := nil;
                function getPaymentData(const payments: list(transferDestinationType); const payment: string * transferDestinationType): list(transferDestinationType) is
                    payment.1 # payments;
                paymentsData := Map.fold(getPaymentData, proposal.paymentMetadata, paymentsData);

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

                // loop proposal metadata for execution
                var _dataCounter: nat       := 0n;
                const operationToPick: nat  = abs(Map.size(proposal.proposalMetadata) - 1n - proposal.proposalMetadataExecutionCounter);
                for _title -> metadataBytes in map proposal.proposalMetadata block {

                    if _dataCounter = operationToPick then {
                        const sendProposalActionToGovernanceProxyForExecutionOperation : operation = Tezos.transaction(
                            metadataBytes,
                            0tez,
                            getExecuteGovernanceActionEntrypoint(s.governanceProxyAddress)
                        );
                        operations  := sendProposalActionToGovernanceProxyForExecutionOperation # operations;
                    } else skip;

                    _dataCounter := _dataCounter + 1n;
                };

                // Update proposal after the execution of a metadata
                proposal.proposalMetadataExecutionCounter       := proposal.proposalMetadataExecutionCounter + 1n;

                // Check if all operations were executed
                if proposal.proposalMetadataExecutionCounter >= Map.size(proposal.proposalMetadata) then {
                    // update proposal executed and isSucessful boolean to True
                    proposal.executed                      := True;
                    proposal.isSuccessful                  := True;

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
// Financial Governance Lambdas Begin
// ------------------------------------------------------------------------------

(* requestTokens lambda *)
function lambdaRequestTokens(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {
  
    checkSenderIsCouncilContract(s);

    case governanceLambdaAction of [
        | LambdaRequestTokens(requestTokensParams) -> {
                
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];

                const doormanAddress : address = case s.generalContracts["doorman"] of [
                      Some(_address) -> _address
                    | None -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
                ];

                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedMvkTotalSupply", unit, doormanAddress);
                s.snapshotStakedMvkTotalSupply := case stakedMvkBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_STAKED_MVK_TOTAL_SUPPLY_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

                if requestTokensParams.tokenType = "FA12" or requestTokensParams.tokenType = "FA2" or requestTokensParams.tokenType = "TEZ" then skip
                else failwith(error_WRONG_TOKEN_TYPE_PROVIDED);

                const keyHash : option(key_hash) = (None : option(key_hash));

                var newFinancialRequest : financialRequestRecordType := record [
                    requesterAddress     = Tezos.sender;
                    requestType          = "TRANSFER";
                    status               = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed             = False;

                    treasuryAddress      = requestTokensParams.treasuryAddress;
                    tokenContractAddress = requestTokensParams.tokenContractAddress;
                    tokenAmount          = requestTokensParams.tokenAmount;
                    tokenName            = requestTokensParams.tokenName; 
                    tokenType            = requestTokensParams.tokenType;
                    tokenId              = requestTokensParams.tokenId;
                    requestPurpose       = requestTokensParams.purpose; 
                    voters               = emptyFinancialRequestVotersMap;
                    keyHash              = keyHash;

                    approveVoteTotal     = 0n;
                    disapproveVoteTotal  = 0n;

                    snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.financialRequestApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    requestedDateTime    = Tezos.now;               // log of when the request was submitted
                    expiryDateTime       = Tezos.now + (86_400 * s.config.financialRequestDurationInDays);
                
                ];

                const financialRequestId : nat = s.financialRequestCounter;

                // save request to financial request ledger
                s.financialRequestLedger[financialRequestId] := newFinancialRequest;

                // create snapshot in financialRequestSnapshotLedger (to be filled with satellite's )
                const emptyFinancialRequestSnapshotMap  : financialRequestSnapshotMapType     = map [];
                s.financialRequestSnapshotLedger[financialRequestId] := emptyFinancialRequestSnapshotMap;

                // increment financial request counter
                s.financialRequestCounter := financialRequestId + 1n;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                for satelliteAddress -> satellite in map activeSatellites block {
                    
                    const satelliteSnapshot : requestSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        requestId             = financialRequestId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := requestSatelliteSnapshot(satelliteSnapshot,s);
                };

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* requestMint lambda *)
function lambdaRequestMint(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  case governanceLambdaAction of [
        | LambdaRequestMint(requestMintParams) -> {
                
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];
  
                const mvkTokenAddress : address = s.mvkTokenAddress;

                const doormanAddress : address = case s.generalContracts["doorman"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
                ];

                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedMvkTotalSupply", unit, doormanAddress);
                s.snapshotStakedMvkTotalSupply := case stakedMvkBalanceView of [
                      Some (value) -> value
                    | None         -> (failwith (error_GET_STAKED_MVK_TOTAL_SUPPLY_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

                const keyHash : option(key_hash) = (None : option(key_hash));

                var newFinancialRequest : financialRequestRecordType := record [

                        requesterAddress     = Tezos.sender;
                        requestType          = "MINT";
                        status               = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed             = False;

                        treasuryAddress      = requestMintParams.treasuryAddress;
                        tokenContractAddress = mvkTokenAddress;
                        tokenAmount          = requestMintParams.tokenAmount;
                        tokenName            = "MVK"; 
                        tokenType            = "FA2";
                        tokenId              = 0n;
                        requestPurpose       = requestMintParams.purpose;
                        voters               = emptyFinancialRequestVotersMap;
                        keyHash              = keyHash;

                        approveVoteTotal     = 0n;
                        disapproveVoteTotal  = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.financialRequestApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        requestedDateTime    = Tezos.now;               // log of when the request was submitted
                        expiryDateTime       = Tezos.now + (86_400 * s.config.financialRequestDurationInDays);
                    ];

                const financialRequestId : nat = s.financialRequestCounter;

                // save request to financial request ledger
                s.financialRequestLedger[financialRequestId] := newFinancialRequest;

                // increment financial request counter
                s.financialRequestCounter := financialRequestId + 1n;

                // create snapshot in financialRequestSnapshotLedger (to be filled with satellite's )
                const emptyFinancialRequestSnapshotMap  : financialRequestSnapshotMapType     = map [];
                s.financialRequestSnapshotLedger[financialRequestId] := emptyFinancialRequestSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                for satelliteAddress -> satellite in map activeSatellites block {
                    const satelliteSnapshot : requestSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        requestId             = financialRequestId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := requestSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* setContractBaker lambda *)
function lambdaSetContractBaker(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  case governanceLambdaAction of [
        | LambdaSetContractBaker(setContractBakerParams) -> {
                
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];
  
                const mvkTokenAddress : address = s.mvkTokenAddress;

                const doormanAddress : address = case s.generalContracts["doorman"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
                ];
                const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedMvkTotalSupply", unit, doormanAddress);
                s.snapshotStakedMvkTotalSupply := case stakedMvkBalanceView of [
                      Some (value) -> value
                    | None         -> (failwith (error_GET_STAKED_MVK_TOTAL_SUPPLY_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
                ];

                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

                var newFinancialRequest : financialRequestRecordType := record [

                        requesterAddress     = Tezos.sender;
                        requestType          = "SET_CONTRACT_BAKER";
                        status               = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed             = False;

                        treasuryAddress      = setContractBakerParams.targetContractAddress;
                        tokenContractAddress = mvkTokenAddress;
                        tokenAmount          = 0n;
                        tokenName            = "NIL"; 
                        tokenType            = "NIL";
                        tokenId              = 0n;
                        requestPurpose       = "Set Contract Baker";
                        voters               = emptyFinancialRequestVotersMap;
                        keyHash              = setContractBakerParams.keyHash;

                        approveVoteTotal     = 0n;
                        disapproveVoteTotal  = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.financialRequestApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        requestedDateTime    = Tezos.now;               // log of when the request was submitted
                        expiryDateTime       = Tezos.now + (86_400 * s.config.financialRequestDurationInDays);
                    ];

                const financialRequestId : nat = s.financialRequestCounter;

                // save request to financial request ledger
                s.financialRequestLedger[financialRequestId] := newFinancialRequest;

                // increment financial request counter
                s.financialRequestCounter := financialRequestId + 1n;

                // create snapshot in financialRequestSnapshotLedger (to be filled with satellite's )
                const emptyFinancialRequestSnapshotMap  : financialRequestSnapshotMapType     = map [];
                s.financialRequestSnapshotLedger[financialRequestId] := emptyFinancialRequestSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                for satelliteAddress -> satellite in map activeSatellites block {
                    const satelliteSnapshot : requestSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        requestId             = financialRequestId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := requestSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)




(* dropFinancialRequest lambda *)
function lambdaDropFinancialRequest(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

  checkSenderIsCouncilContract(s);

  case governanceLambdaAction of [
        | LambdaDropFinancialRequest(requestId) -> {
                
                var financialRequest : financialRequestRecordType := case s.financialRequestLedger[requestId] of [
                      Some(_request) -> _request
                    | None           -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
                ];

                if financialRequest.executed then failwith(error_FINANCIAL_REQUEST_EXECUTED) else skip;

                if Tezos.now > financialRequest.expiryDateTime then failwith(error_FINANCIAL_REQUEST_EXPIRED) else skip;

                financialRequest.status := False;
                s.financialRequestLedger[requestId] := financialRequest;

            }
        | _ -> skip
    ];

} with (noOperations, s);



(* voteForRequest lambda *)
function lambdaVoteForRequest(const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorage) : return is 
block {

    var operations : list(operation) := nil;

    case governanceLambdaAction of [
        | LambdaVoteForRequest(voteForRequest) -> {
                
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

                const financialRequestId : nat = voteForRequest.requestId;

                var _financialRequest : financialRequestRecordType := case s.financialRequestLedger[financialRequestId] of [
                      Some(_request) -> _request
                    | None           -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
                ];

                if _financialRequest.status    = False then failwith(error_FINANCIAL_REQUEST_DROPPED)          else skip;
                if _financialRequest.executed  = True  then failwith(error_FINANCIAL_REQUEST_EXECUTED) else skip;

                if Tezos.now > _financialRequest.expiryDateTime then failwith(error_FINANCIAL_REQUEST_EXPIRED) else skip;

                const financialRequestSnapshot : financialRequestSnapshotMapType = case s.financialRequestSnapshotLedger[financialRequestId] of [
                      Some(_snapshot) -> _snapshot
                    | None            -> failwith(error_FINANCIAL_REQUEST_SNAPSHOT_NOT_FOUND)
                ]; 

                const satelliteSnapshotRecord : financialRequestSnapshotRecordType = case financialRequestSnapshot[Tezos.sender] of [ 
                      Some(_record) -> _record
                    | None          -> failwith(error_SATELLITE_NOT_FOUND)
                ];

                // Save and update satellite's vote record
                const voteType         : voteForRequestChoiceType   = voteForRequest.vote;
                const totalVotingPower : nat                        = satelliteSnapshotRecord.totalVotingPower;

                // Remove previous vote if user already voted
                case _financialRequest.voters[Tezos.sender] of [
                    
                    Some (_voteRecord) -> case _voteRecord.vote of [

                        Approve(_v) ->  if _voteRecord.totalVotingPower > _financialRequest.approveVoteTotal 
                                        then failwith(error_CALCULATION_ERROR) 
                                        else _financialRequest.approveVoteTotal := abs(_financialRequest.approveVoteTotal - _voteRecord.totalVotingPower)

                    | Disapprove(_v) -> if _voteRecord.totalVotingPower > _financialRequest.disapproveVoteTotal 
                                        then failwith(error_CALCULATION_ERROR) 
                                        else _financialRequest.disapproveVoteTotal := abs(_financialRequest.disapproveVoteTotal - _voteRecord.totalVotingPower)

                    ]

                    | None -> skip

                ];

                const newVoteRecord : financialRequestVoteType     = record [
                    vote             = voteType;
                    totalVotingPower = totalVotingPower;
                    timeVoted        = Tezos.now;
                ];

                _financialRequest.voters[Tezos.sender] := newVoteRecord;

                // Satellite cast vote and send request to Treasury if enough votes have been gathered
                case voteType of [

                    Approve(_v) -> block {

                        const newApproveVoteTotal : nat = _financialRequest.approveVoteTotal + totalVotingPower;

                        _financialRequest.approveVoteTotal           := newApproveVoteTotal;
                        s.financialRequestLedger[financialRequestId] := _financialRequest;

                        // send request to treasury if total approved votes exceed staked MVK required for approval
                        if newApproveVoteTotal > _financialRequest.stakedMvkRequiredForApproval then block {

                            const treasuryAddress : address = _financialRequest.treasuryAddress;

                            const councilAddress : address = case s.generalContracts["council"] of [
                                  Some(_address) -> _address
                                | None           -> failwith(error_COUNCIL_CONTRACT_NOT_FOUND)
                            ];

                            if _financialRequest.requestType = "TRANSFER" then block {

                                // ---- set token type ----
                                var _tokenTransferType : tokenType := Tez;

                                if  _financialRequest.tokenType = "FA12" 
                                then block {
                                    _tokenTransferType := Fa12(_financialRequest.tokenContractAddress); 
                                } 
                                else skip;

                                if  _financialRequest.tokenType = "FA2" 
                                then block {
                                    _tokenTransferType := Fa2(record [
                                        tokenContractAddress  = _financialRequest.tokenContractAddress;
                                        tokenId               = _financialRequest.tokenId;
                                    ]); 
                                } 
                                else skip;
                                // --- --- ---

                                const transferTokenParams : transferActionType = list[
                                record [
                                    to_        = councilAddress;
                                    token      = _tokenTransferType;
                                    amount     = _financialRequest.tokenAmount;
                                ]
                                ];

                                const treasuryTransferOperation : operation = Tezos.transaction(
                                    transferTokenParams, 
                                    0tez, 
                                    sendTransferOperationToTreasury(treasuryAddress)
                                );

                                operations := treasuryTransferOperation # operations;

                            } else skip;



                            if _financialRequest.requestType = "MINT" then block {
                                
                                const mintMvkAndTransferTokenParams : mintMvkAndTransferType = record [
                                    to_  = councilAddress;
                                    amt  = _financialRequest.tokenAmount;
                                ];

                                const treasuryMintMvkAndTransferOperation : operation = Tezos.transaction(
                                    mintMvkAndTransferTokenParams, 
                                    0tez, 
                                    sendMintMvkAndTransferOperationToTreasury(treasuryAddress)
                                );

                                operations := treasuryMintMvkAndTransferOperation # operations;

                            } else skip;



                            if _financialRequest.requestType = "SET_CONTRACT_BAKER" then block {

                                const keyHash : option(key_hash) = _financialRequest.keyHash;
                                const setContractBakerOperation : operation = Tezos.transaction(
                                    keyHash, 
                                    0tez, 
                                    setTreasuryBaker(_financialRequest.treasuryAddress)
                                );

                                operations := setContractBakerOperation # operations;

                            } else skip;

                            _financialRequest.executed := True;
                            s.financialRequestLedger[financialRequestId] := _financialRequest;

                        } else skip;

                    }

                | Disapprove(_v) -> block {
                        const newDisapproveVoteTotal : nat            = _financialRequest.disapproveVoteTotal + totalVotingPower;
                        _financialRequest.disapproveVoteTotal        := newDisapproveVoteTotal;
                        s.financialRequestLedger[financialRequestId] := _financialRequest;
                    }
                ];

            }
        | _ -> skip
    ];
  
} with (operations, s)

// ------------------------------------------------------------------------------
// Financial Governance Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Governance Lambdas End
//
// ------------------------------------------------------------------------------