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
        |   LambdaRequestTokens(requestTokensParams) -> {

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case generalContractsOptViewDoorman of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat)         = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply: nat     = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's financial request approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Validation Checks 
                // ------------------------------------------------------------------

                // Check if token type provided matches the standard (FA12, FA2, TEZ)
                if requestTokensParams.tokenType = "FA12" or requestTokensParams.tokenType = "FA2" or requestTokensParams.tokenType = "TEZ" then skip
                else failwith(error_WRONG_TOKEN_TYPE_PROVIDED);

                // If tokens are requested, check if token contract is whitelisted (security measure to prevent interacting with potentially malicious contracts)
                if requestTokensParams.tokenType =/= "TEZ" and not checkInWhitelistTokenContracts(requestTokensParams.tokenContractAddress, s.whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else skip;

                // ------------------------------------------------------------------
                // Create new Financial Request Record
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType = map [];

                // init empty keyHash field - mainly used for setContractBaker entrypoint
                const keyHash : option(key_hash) = (None : option(key_hash));

                // Create new financial request record
                var newFinancialRequest : financialRequestRecordType := record [

                    requesterAddress                    = Tezos.get_sender();
                    requestType                         = "TRANSFER";
                    status                              = True;                  // status : True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                            = False;

                    treasuryAddress                     = requestTokensParams.treasuryAddress;
                    tokenContractAddress                = requestTokensParams.tokenContractAddress;
                    tokenAmount                         = requestTokensParams.tokenAmount;
                    tokenName                           = requestTokensParams.tokenName; 
                    tokenType                           = requestTokensParams.tokenType;
                    tokenId                             = requestTokensParams.tokenId;
                    requestPurpose                      = requestTokensParams.purpose; 
                    voters                              = emptyFinancialRequestVotersMap;
                    keyHash                             = keyHash;

                    yayVoteStakedMvkTotal               = 0n;
                    nayVoteStakedMvkTotal               = 0n;
                    passVoteStakedMvkTotal              = 0n;

                    snapshotStakedMvkTotalSupply        = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval      = s.config.financialRequestApprovalPercentage; 
                    stakedMvkRequiredForApproval        = stakedMvkRequiredForApproval; 

                    requestedDateTime                   = Tezos.get_now();               
                    expiryDateTime                      = Tezos.get_now() + (86_400 * s.config.financialRequestDurationInDays);
                
                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current financial request counter
                const financialRequestId : nat = s.financialRequestCounter;

                // Save request to financial request ledger
                s.financialRequestLedger[financialRequestId] := newFinancialRequest;

                // Increment financial request counter
                s.financialRequestCounter := financialRequestId + 1n;

            }
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
        |   LambdaRequestMint(requestMintParams) -> {

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------
  
                // Get MVK Token Contract from storage
                const mvkTokenAddress : address = s.mvkTokenAddress;

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case generalContractsOptViewDoorman of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat)        = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply: nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's financial request approval percentage
                const stakedMvkRequiredForApproval : nat  = abs((snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Financial Request Record
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType = map [];

                // init empty keyHash field - mainly used for setContractBaker entrypoint
                const keyHash : option(key_hash) = (None : option(key_hash));

                // Create new financial request record
                var newFinancialRequest : financialRequestRecordType := record [

                    requesterAddress                    = Tezos.get_sender();
                    requestType                         = "MINT";
                    status                              = True;                  // status : True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                            = False;

                    treasuryAddress                     = requestMintParams.treasuryAddress;
                    tokenContractAddress                = mvkTokenAddress;
                    tokenAmount                         = requestMintParams.tokenAmount;
                    tokenName                           = "MVK"; 
                    tokenType                           = "FA2";
                    tokenId                             = 0n;
                    requestPurpose                      = requestMintParams.purpose;
                    voters                              = emptyFinancialRequestVotersMap;
                    keyHash                             = keyHash;

                    yayVoteStakedMvkTotal               = 0n;
                    nayVoteStakedMvkTotal               = 0n;
                    passVoteStakedMvkTotal              = 0n;

                    snapshotStakedMvkTotalSupply        = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval      = s.config.financialRequestApprovalPercentage; 
                    stakedMvkRequiredForApproval        = stakedMvkRequiredForApproval; 

                    requestedDateTime                   = Tezos.get_now();               
                    expiryDateTime                      = Tezos.get_now() + (86_400 * s.config.financialRequestDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current financial request counter
                const financialRequestId : nat = s.financialRequestCounter;

                // Save request to financial request ledger
                s.financialRequestLedger[financialRequestId] := newFinancialRequest;

                // increment financial request counter
                s.financialRequestCounter := financialRequestId + 1n;

            }
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
        |   LambdaSetContractBaker(setContractBakerParams) -> {

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------
                
                // Get MVK Token Contract from storage - used as placeholder here
                const mvkTokenAddress : address = s.mvkTokenAddress;

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case generalContractsOptViewDoorman of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat)        = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply: nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's financial request approval percentage
                const stakedMvkRequiredForApproval : nat = abs((snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Financial Request Record
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];
  
                // Create new financial request record
                var newFinancialRequest : financialRequestRecordType := record [

                    requesterAddress                    = Tezos.get_sender();
                    requestType                         = "SET_CONTRACT_BAKER";
                    status                              = True;                  // status : True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                            = False;

                    treasuryAddress                     = setContractBakerParams.targetContractAddress;
                    tokenContractAddress                = mvkTokenAddress;
                    tokenAmount                         = 0n;
                    tokenName                           = "NIL"; 
                    tokenType                           = "NIL";
                    tokenId                             = 0n;
                    requestPurpose                      = "Set Contract Baker";
                    voters                              = emptyFinancialRequestVotersMap;
                    keyHash                             = setContractBakerParams.keyHash;

                    yayVoteStakedMvkTotal               = 0n;
                    nayVoteStakedMvkTotal               = 0n;
                    passVoteStakedMvkTotal              = 0n;

                    snapshotStakedMvkTotalSupply        = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval      = s.config.financialRequestApprovalPercentage; 
                    stakedMvkRequiredForApproval        = stakedMvkRequiredForApproval; 

                    requestedDateTime                   = Tezos.get_now();              
                    expiryDateTime                      = Tezos.get_now() + (86_400 * s.config.financialRequestDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current financial request counter
                const financialRequestId : nat = s.financialRequestCounter;

                // save request to financial request ledger
                s.financialRequestLedger[financialRequestId] := newFinancialRequest;

                // increment financial request counter
                s.financialRequestCounter := financialRequestId + 1n;

            }
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

                // Check if financial request has already been executed
                if financialRequest.executed then failwith(error_FINANCIAL_REQUEST_EXECUTED) else skip;

                // Check if financial request has expired
                if Tezos.get_now() > financialRequest.expiryDateTime then failwith(error_FINANCIAL_REQUEST_EXPIRED) else skip;

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
                checkSatelliteIsNotSuspendedOrBanned(Tezos.get_sender(), s);

                // init financial request id
                const financialRequestId : nat = voteForRequest.requestId;

                // Get financial request record if financial request exists
                var _financialRequest : financialRequestRecordType := case s.financialRequestLedger[financialRequestId] of [
                        Some(_request) -> _request
                    |   None           -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
                ];

                // Check if financial request has been dropped
                if _financialRequest.status    = False then failwith(error_FINANCIAL_REQUEST_DROPPED)  else skip;

                // Check if financial request has already been executed
                if _financialRequest.executed  = True  then failwith(error_FINANCIAL_REQUEST_EXECUTED) else skip;

                // Check if financial request has expired
                if Tezos.get_now() > _financialRequest.expiryDateTime then failwith(error_FINANCIAL_REQUEST_EXPIRED) else skip;

                // ------------------------------------------------------------------
                // Get snapshot of satellite voting power
                // ------------------------------------------------------------------

                // Get the satellite total voting power and check if it needs to be updated for the current cycle or not
                const totalVotingPowerAndSatelliteUpdate: (nat * option(operation)) = getTotalVotingPowerAndUpdateSnapshot(Tezos.get_sender(), s);
                const totalVotingPower : nat                                        = totalVotingPowerAndSatelliteUpdate.0;

                // Update the satellite snapshot on the governance contract if it needs to
                const updateSnapshotOperationOpt: option(operation) = totalVotingPowerAndSatelliteUpdate.1;
                case updateSnapshotOperationOpt of [
                    Some (_updateOperation) -> operations   := _updateOperation # operations
                |   None                    -> skip
                ];

                // ------------------------------------------------------------------
                // Compute vote
                // ------------------------------------------------------------------

                // Save and update satellite's vote record
                const voteType          : voteType   = voteForRequest.vote;

                // Remove previous vote if user already voted
                case _financialRequest.voters[Tezos.get_sender()] of [
                    
                        Some (_voteRecord) -> case _voteRecord.vote of [

                                Yay(_v)   ->    if _voteRecord.totalVotingPower > _financialRequest.yayVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _financialRequest.yayVoteStakedMvkTotal := abs(_financialRequest.yayVoteStakedMvkTotal - _voteRecord.totalVotingPower)

                            |   Nay(_v)   ->    if _voteRecord.totalVotingPower > _financialRequest.nayVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _financialRequest.nayVoteStakedMvkTotal := abs(_financialRequest.nayVoteStakedMvkTotal - _voteRecord.totalVotingPower)

                            |   Pass(_v)  ->    if _voteRecord.totalVotingPower > _financialRequest.passVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _financialRequest.passVoteStakedMvkTotal := abs(_financialRequest.passVoteStakedMvkTotal - _voteRecord.totalVotingPower)                    
                        ]

                    |   None -> skip

                ];

                // init new vote record
                const newVoteRecord : financialRequestVoteType = record [
                    vote             = voteType;
                    totalVotingPower = totalVotingPower;
                    timeVoted        = Tezos.get_now();
                ];

                // Update financial request map of voters with new vote
                _financialRequest.voters[Tezos.get_sender()] := newVoteRecord;

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

                            // Get Treasury Contract from params
                            const treasuryAddress : address = _financialRequest.treasuryAddress;

                            // Get Council Contract address from the General Contracts Map on the Governance Contract
                            const generalContractsOptViewCouncil : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "council", s.governanceAddress);
                            const councilAddress : address = case generalContractsOptViewCouncil of [
                                    Some (_optionContract) -> case _optionContract of [
                                            Some (_contract)    -> _contract
                                        |   None                -> failwith (error_COUNCIL_CONTRACT_NOT_FOUND)
                                    ]
                                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                            ];

                            // Financial Request Type - "TRANSFER"
                            if _financialRequest.requestType = "TRANSFER" then block {

                                // ------------ Set Token Type ------------
                                var _tokenTransferType : tokenType := Tez;

                                if  _financialRequest.tokenType = "FA12" 
                                then block {
                                    _tokenTransferType := (Fa12(_financialRequest.tokenContractAddress) : tokenType);
                                } 
                                else skip;

                                if  _financialRequest.tokenType = "FA2" 
                                then block {
                                    _tokenTransferType := (Fa2(record [
                                        tokenContractAddress  = _financialRequest.tokenContractAddress;
                                        tokenId               = _financialRequest.tokenId;
                                    ]) : tokenType); 
                                } 
                                else skip;
                                // ----------------------------------------

                                // If tokens are to be transferred, check if token contract is whitelisted (security measure to prevent interacting with potentially malicious contracts)
                                if _financialRequest.tokenType =/= "TEZ" and not checkInWhitelistTokenContracts(_financialRequest.tokenContractAddress, s.whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else skip;

                                // Create transfer token params and operation
                                const transferTokenParams : transferActionType = list [
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


                            // Financial Request Type - "MINT"
                            if _financialRequest.requestType = "MINT" then block {
                                
                                // Create mint operation
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


                            // Financial Request Type - "SET_CONTRACT_BAKER"
                            if _financialRequest.requestType = "SET_CONTRACT_BAKER" then block {

                                const keyHash : option(key_hash) = _financialRequest.keyHash;
                                const setContractBakerOperation : operation = Tezos.transaction(
                                    keyHash, 
                                    0tez, 
                                    setTreasuryBaker(_financialRequest.treasuryAddress)
                                );

                                operations := setContractBakerOperation # operations;

                            } else skip;

                            // Update financial request - set executed boolean to true
                            _financialRequest.executed := True;
                            s.financialRequestLedger[financialRequestId] := _financialRequest;

                        } else skip;

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
