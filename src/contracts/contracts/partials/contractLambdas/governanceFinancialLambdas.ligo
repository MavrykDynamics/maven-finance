// ------------------------------------------------------------------------------
//
// Governance Financial Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any mav amount
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address
    
    case governanceFinancialLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any mav amount
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address
    
    case governanceFinancialLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case governanceFinancialLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is 
block {

  verifyNoAmountSent(Unit);   // entrypoint should not receive any mav amount  
  verifySenderIsAdmin(s.admin); // verify that sender is admin

  case governanceFinancialLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : governanceFinancialUpdateConfigActionType     = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceFinancialUpdateConfigNewValueType   = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigApprovalPercentage (_v)        -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.approvalPercentage      := updateConfigNewValue
                    |   ConfigFinancialReqDurationDays (_v)  -> s.config.financialRequestDurationInDays          := updateConfigNewValue
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case governanceFinancialLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case governanceFinancialLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case governanceFinancialLambdaAction of [
        |   LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    var operations : list(operation) := nil;

    case governanceFinancialLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that the sender is admin or the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations (transferOperationFold in transferHelpers
                operations := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Financial Governance Lambdas Begin
// ------------------------------------------------------------------------------

(* requestTokens lambda *)
function lambdaRequestTokens(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is 
block {

    // Steps Overview:    
    // 1. Check that sender is from the Council Contract
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Take snapshot of current total staked MVN supply 
    // 4. Calculate staked MVN votes required for approval based on config's financial request approval percentage
    // 5. Validation checks
    //      -   Check if token type provided matches the standard (FA12, FA2, TEZ)
    //      -   If tokens are requested, check if token contract is whitelisted (security measure to prevent interacting with potentially malicious contracts)
    // 6. Create new financial request record - "TRANSFER"
    // 7. Update storage with new records
  
    verifySenderIsCouncilContract(s); // verify that sender is the Council contract

    case governanceFinancialLambdaAction of [
        |   LambdaRequestTokens(requestTokensParams) -> 
                
                s := createGovernanceFinancialRequest(
                    "TRANSFER",                                 // requestType
                    requestTokensParams.treasuryAddress,        // treasuryAddress
                    requestTokensParams.receiverAddress,        // receiverAddress
                    requestTokensParams.tokenContractAddress,   // tokenContractAddress
                    requestTokensParams.tokenAmount,            // tokenAmount
                    requestTokensParams.tokenName,              // tokenName
                    requestTokensParams.tokenType,              // tokenType
                    requestTokensParams.tokenId,                // tokenId
                    (None : option(key_hash)),                  // keyHash
                    requestTokensParams.purpose,                // purpose
                    s                                           // storage
                )

        |   _ -> skip
    ];

} with (noOperations, s)



(* requestMint lambda *)
function lambdaRequestMint(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is 
block {

    // Steps Overview:    
    // 1. Check that sender is from the Council Contract
    // 2. Get necessary contracts and config info
    //      -   Get MVN Token Contract from storage
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Take snapshot of current total staked MVN supply 
    // 4. Calculate staked MVN votes required for approval based on config's financial request approval percentage
    // 5. Create new financial request record - "MINT"
    // 6. Update storage with new records 
  
    verifySenderIsCouncilContract(s); // verify that sender is the Council contract

    case governanceFinancialLambdaAction of [
        |   LambdaRequestMint(requestMintParams) -> 
                
                s := createGovernanceFinancialRequest(
                    "MINT",                                 // requestType
                    requestMintParams.treasuryAddress,      // treasuryAddress
                    requestMintParams.receiverAddress,      // receiverAddress
                    s.mvnTokenAddress,                      // tokenContractAddress
                    requestMintParams.tokenAmount,          // tokenAmount
                    "MVN",                                  // tokenName
                    "FA2",                                  // tokenType
                    0n,                                     // tokenId
                    (None : option(key_hash)),              // keyHash
                    requestMintParams.purpose,              // purpose
                    s                                       // storage
                )

        |   _ -> skip
    ];

} with (noOperations, s)



(* setContractBaker lambda *)
function lambdaSetContractBaker(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is 
block {

    // Steps Overview:    
    // 1. Check that sender is from the Council Contract
    // 2. Get necessary contracts and config info
    //      -   Get MVN Token Contract from storage - used as placeholder here
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Take snapshot of current total staked MVN supply 
    // 4. Calculate staked MVN votes required for approval based on config's financial request approval percentage
    // 5. Create new financial request record - "SET_CONTRACT_BAKER"
    // 6. Update storage with new records 
  
    verifySenderIsCouncilContract(s); // verify that sender is the Council contract

    case governanceFinancialLambdaAction of [
        |   LambdaSetContractBaker(setContractBakerParams) -> 
                
                s := createGovernanceFinancialRequest(
                    "SET_CONTRACT_BAKER",                           // requestType
                    setContractBakerParams.targetContractAddress,   // treasury address
                    zeroAddress,                                    // no receiver address
                    s.mvnTokenAddress,                              // tokenContractAddress
                    0n,                                             // tokenAmount
                    "NIL",                                          // tokenName
                    "NIL",                                          // tokenType
                    0n,                                             // tokenId
                    setContractBakerParams.keyHash,                 // keyHash
                    "Set Contract Baker",                           // purpose  
                    s                                               // storage
                )

        |   _ -> skip
    ];

} with (noOperations, s)




(* dropFinancialRequest lambda *)
function lambdaDropFinancialRequest(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is 
block {

    // Steps Overview:    
    // 1. Check that sender is from the Council Contract
    // 2. Validation Checks
    //      -   Check if financial request exists
    //      -   Check if financial request has already been executed
    //      -   Check if financial request has expired
    // 3. Drop financial request (set status to false)
    // 4. Update storage 
    
    verifySenderIsCouncilContract(s); // verify that sender is the Council contract

    case governanceFinancialLambdaAction of [
        |   LambdaDropFinancialRequest(financialRequestId) -> {
                
                // Get financial request
                var financialRequestRecord : financialRequestRecordType := getFinancialRequest(financialRequestId, s);

                // Validate Financial Request (not dropped, executed, or expired)
                validateFinancialRequest(financialRequestRecord);

                // Drop financial request (set status to false)
                financialRequestRecord.status := False;

                // Update storage 
                s.financialRequestLedger[financialRequestId] := financialRequestRecord;

            }
        |   _ -> skip
    ];

} with (noOperations, s);



(* voteForRequest lambda *)
function lambdaVoteForRequest(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is 
block {

    // Steps Overview:    
    // 1. Check that sender is a satellite and is not suspended or banned
    // 2. Validation Checks
    //      -   Check if financial request exists
    //      -   Check if financial request has already been executed
    //      -   Check if financial request has been dropped
    //      -   Check if financial request has expired
    // 3. Get snapshot of satellite voting power
    //      -   Get financial request snapshot (of all active satellites and their voting power)
    //      -   Get satellite's snapshot record stored in financial request snapshot
    // 4. Save and update satellite's vote record
    //      -   Remove previous vote if user already voted
    //      -   Init new vote record
    //      -   Update financial request map of voters with new vote
    // 5. Compute financial request's vote totals and execute financial request if enough votes have been gathered
    
    var operations : list(operation) := nil;

    case governanceFinancialLambdaAction of [
        |   LambdaVoteForRequest(voteForRequest) -> {

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Verify that satellite exists and is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(Mavryk.get_sender(), s);

                // init financial request id
                const financialRequestId    : nat       = voteForRequest.requestId;
                const newVote               : voteType  = voteForRequest.vote;

                // Get financial request record if financial request exists
                var financialRequestRecord : financialRequestRecordType := getFinancialRequest(financialRequestId, s);
                const governanceCycleId : nat = financialRequestRecord.governanceCycleId;

                // Validate Financial Request (not dropped, executed, or expired)
                validateFinancialRequest(financialRequestRecord);

                // ------------------------------------------------------------------
                // Get snapshot of satellite voting power
                // ------------------------------------------------------------------

                // Get the satellite total voting power and check if it needs to be updated for the current cycle or not
                const totalVotingPowerAndSatelliteUpdate: (nat * list(operation))   = getTotalVotingPowerAndUpdateSnapshot(Mavryk.get_sender(), governanceCycleId, operations, s);
                const totalVotingPower : nat                                        = totalVotingPowerAndSatelliteUpdate.0;

                // Update the satellite snapshot on the governance contract if it needs to
                operations := totalVotingPowerAndSatelliteUpdate.1;

                // ------------------------------------------------------------------
                // Compute vote
                // ------------------------------------------------------------------

                // Remove previous vote if satellite has already voted
                financialRequestRecord := removePreviousVote(financialRequestRecord, financialRequestId, totalVotingPower, s);                

                // Compute financial request new vote totals 
                financialRequestRecord := computeNewVote(financialRequestRecord, newVote, totalVotingPower);

                // Execute financial request if sufficient yay votes gathered (i.e. total yay votes exceed staked MVN required for approval)
                if sufficientYayVotesGathered(financialRequestRecord) then block {

                    // Execute financial request, and set executed boolean to true
                    operations := executeFinancialRequest(financialRequestRecord, operations, s);
                    financialRequestRecord.executed         := True;
                    financialRequestRecord.executedDateTime := Some(Mavryk.get_now());

                } else skip;

                // Update storage
                s.financialRequestLedger[financialRequestId] := financialRequestRecord;
                
                // Save financial request map of voters with new vote
                s.financialRequestVoters[ (financialRequestId, Mavryk.get_sender()) ] := newVote;

            }
        |   _ -> skip
    ];
  
} with (operations, s)

// ------------------------------------------------------------------------------
//
// Governance Financial Lambdas End
//
// ------------------------------------------------------------------------------
