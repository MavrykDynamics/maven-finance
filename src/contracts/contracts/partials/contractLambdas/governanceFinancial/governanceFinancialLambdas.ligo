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
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address
    
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
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address
    
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

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

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

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  case governanceFinancialLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : governanceFinancialUpdateConfigActionType     = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceFinancialUpdateConfigNewValueType   = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigFinancialReqApprovalPct (_v)   -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.financialRequestApprovalPercentage      := updateConfigNewValue
                    |   ConfigFinancialReqDurationDays (_v)  -> s.config.financialRequestDurationInDays          := updateConfigNewValue
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceFinancialLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceFinancialLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    
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
    // 3. Take snapshot of current total staked MVK supply 
    // 4. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 5. Validation checks
    //      -   Check if token type provided matches the standard (FA12, FA2, TEZ)
    //      -   If tokens are requested, check if token contract is whitelisted (security measure to prevent interacting with potentially malicious contracts)
    // 6. Create new financial request record - "TRANSFER"
    // 7. Update storage with new records
  
    checkSenderIsCouncilContract(s); // check that sender is from the Council Contract

    case governanceFinancialLambdaAction of [
        |   LambdaRequestTokens(requestTokensParams) -> 
                s   := createGovernanceFinancialRequest(
                    "TRANSFER",
                    requestTokensParams.treasuryAddress,
                    requestTokensParams.tokenContractAddress,
                    requestTokensParams.tokenAmount,
                    requestTokensParams.tokenName,
                    requestTokensParams.tokenType,
                    requestTokensParams.tokenId,
                    (None : option(key_hash)),
                    requestTokensParams.purpose,
                    s
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
    //      -   Get MVK Token Contract from storage
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Take snapshot of current total staked MVK supply 
    // 4. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 5. Create new financial request record - "MINT"
    // 6. Update storage with new records 
  
    checkSenderIsCouncilContract(s); // check that sender is from the Council Contract

    case governanceFinancialLambdaAction of [
        |   LambdaRequestMint(requestMintParams) -> 
                s   := createGovernanceFinancialRequest(
                    "MINT",
                    requestMintParams.treasuryAddress,
                    s.mvkTokenAddress,
                    requestMintParams.tokenAmount,
                    "MVK",
                    "FA2",
                    0n,
                    (None : option(key_hash)),
                    requestMintParams.purpose,
                    s
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
    //      -   Get MVK Token Contract from storage - used as placeholder here
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Take snapshot of current total staked MVK supply 
    // 4. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 5. Create new financial request record - "SET_CONTRACT_BAKER"
    // 6. Update storage with new records 
  
    checkSenderIsCouncilContract(s); // check that sender is from the Council Contract

    case governanceFinancialLambdaAction of [
        |   LambdaSetContractBaker(setContractBakerParams) -> 
                s   := createGovernanceFinancialRequest(
                    "SET_CONTRACT_BAKER",
                    setContractBakerParams.targetContractAddress,
                    s.mvkTokenAddress,
                    0n,
                    "NIL",
                    "NIL",
                    0n,
                    setContractBakerParams.keyHash,
                    "Set Contract Baker",
                    s
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
    
    checkSenderIsCouncilContract(s); // check that sender is from the Council Contract

    case governanceFinancialLambdaAction of [
        |   LambdaDropFinancialRequest(requestId) -> {
                
                // Check if financial request exists
                var financialRequest : financialRequestRecordType := case s.financialRequestLedger[requestId] of [
                        Some(_request) -> _request
                    |   None           -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
                ];

                // Check if satellite can interact with the request
                checkRequestInteraction(financialRequest);

                // Drop financial request (set status to false)
                financialRequest.status := False;

                // Update storage 
                s.financialRequestLedger[requestId] := financialRequest;

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

                // Check if satellite exists and is not suspended or banned
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);
                checkSatelliteStatus(Tezos.get_sender(), delegationAddress, True, True);

                // init financial request id
                const financialRequestId : nat = voteForRequest.requestId;

                // Get financial request record if financial request exists
                var _financialRequest : financialRequestRecordType := case s.financialRequestLedger[financialRequestId] of [
                        Some(_request) -> _request
                    |   None           -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
                ];

                // Check if satellite can interact with the request
                checkRequestInteraction(_financialRequest);

                // ------------------------------------------------------------------
                // Get snapshot of satellite voting power
                // ------------------------------------------------------------------

                // Get the satellite total voting power and check if it needs to be updated for the current cycle or not
                const totalVotingPowerAndSatelliteUpdate: (nat * list(operation))   = getTotalVotingPowerAndUpdateSnapshot(Tezos.get_sender(), operations, s);
                const totalVotingPower : nat                                        = totalVotingPowerAndSatelliteUpdate.0;

                // Update the satellite snapshot on the governance contract if it needs to
                operations                                                          := totalVotingPowerAndSatelliteUpdate.1;

                // ------------------------------------------------------------------
                // Compute vote
                // ------------------------------------------------------------------

                // Save and update satellite's vote record
                const voteType          : voteType   = voteForRequest.vote;

                // Remove previous vote if user already voted
                case s.financialRequestVoters[(financialRequestId, Tezos.get_sender())] of [
                    
                        Some (_voteType) -> case _voteType of [

                                Yay(_v)   ->    if totalVotingPower > _financialRequest.yayVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _financialRequest.yayVoteStakedMvkTotal := abs(_financialRequest.yayVoteStakedMvkTotal - totalVotingPower)

                            |   Nay(_v)   ->    if totalVotingPower > _financialRequest.nayVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _financialRequest.nayVoteStakedMvkTotal := abs(_financialRequest.nayVoteStakedMvkTotal - totalVotingPower)

                            |   Pass(_v)  ->    if totalVotingPower > _financialRequest.passVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _financialRequest.passVoteStakedMvkTotal := abs(_financialRequest.passVoteStakedMvkTotal - totalVotingPower)                    
                        ]

                    |   None -> skip

                ];

                // Update financial request map of voters with new vote
                s.financialRequestVoters[(financialRequestId, Tezos.get_sender())] := voteType;

                // Save voter in the storage
                _financialRequest.voters := Set.add(Tezos.get_sender(), _financialRequest.voters);

                // Compute financial request vote totals and execute financial request if enough votes have been gathered
                case voteType of [

                    Yay(_v) -> block {

                        // Compute new YAY vote total
                        const newYayVoteStakedMvkTotal : nat = _financialRequest.yayVoteStakedMvkTotal + totalVotingPower;

                        // Update financial request with new vote total
                        _financialRequest.yayVoteStakedMvkTotal         := newYayVoteStakedMvkTotal;
                        s.financialRequestLedger[financialRequestId]    := _financialRequest;

                        // Execute financial request if total yay votes exceed staked MVK required for approval
                        if newYayVoteStakedMvkTotal > _financialRequest.stakedMvkRequiredForApproval then block {
                            const executeGovernanceFinancialActionReturn : return   = executeGovernanceFinancialRequest(_financialRequest, financialRequestId, operations, s);
                            s           := executeGovernanceFinancialActionReturn.1;
                            operations  := executeGovernanceFinancialActionReturn.0;
                        } else skip

                    }

                |   Nay(_v) -> block {

                        // Compute new NAY vote total
                        const newNayVoteStakedMvkTotal : nat             = _financialRequest.nayVoteStakedMvkTotal + totalVotingPower;

                        // Update financial request with new vote total
                        _financialRequest.nayVoteStakedMvkTotal         := newNayVoteStakedMvkTotal;
                        s.financialRequestLedger[financialRequestId]    := _financialRequest;

                    }

                |   Pass(_v) -> block {

                        // Compute new PASS vote total
                        const newPassVoteStakedMvkTotal : nat            = _financialRequest.passVoteStakedMvkTotal + totalVotingPower;

                        // Update financial request with new vote total
                        _financialRequest.passVoteStakedMvkTotal        := newPassVoteStakedMvkTotal;
                        s.financialRequestLedger[financialRequestId]    := _financialRequest;

                    }
                ];

            }
        |   _ -> skip
    ];
  
} with (operations, s)

// ------------------------------------------------------------------------------
//
// Governance Financial Lambdas End
//
// ------------------------------------------------------------------------------
