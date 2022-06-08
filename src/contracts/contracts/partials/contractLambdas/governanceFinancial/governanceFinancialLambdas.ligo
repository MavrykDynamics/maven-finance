// ------------------------------------------------------------------------------
//
// Governance Financial Lambdas Begin
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAllowed(s); // check that sender is admin
    
    case governanceFinancialLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is
block {
    
    checkNoAmount(Unit);    // entrypoint should not receive any tez amount
    
    checkSenderIsAllowed(s); // check that sender is admin
    
    case governanceFinancialLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    case governanceFinancialLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  
  checkSenderIsAdmin(s); // check that sender is admin

  case governanceFinancialLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : governanceFinancialUpdateConfigActionType     = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceFinancialUpdateConfigNewValueType   = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigVotingPowerRatio (_v)                       -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.votingPowerRatio                        := updateConfigNewValue
                    | ConfigFinancialReqApprovalPct (_v)                -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.financialRequestApprovalPercentage      := updateConfigNewValue
                    | ConfigFinancialReqDurationDays (_v)               -> s.config.financialRequestDurationInDays          := updateConfigNewValue
                ];

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s: governanceFinancialStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    
    case governanceFinancialLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage): return is
block {
    
    checkSenderIsAdmin(s);
    
    case governanceFinancialLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s: governanceFinancialStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    
    case governanceFinancialLambdaAction of [
        | LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Financial Governance Lambdas Begin
// ------------------------------------------------------------------------------

(* requestTokens lambda *)
function lambdaRequestTokens(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is 
block {
  
    checkSenderIsCouncilContract(s);

    case governanceFinancialLambdaAction of [
        | LambdaRequestTokens(requestTokensParams) -> {
                
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];

                const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptViewDoorman of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const generalContractsOptViewDelegation : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case generalContractsOptViewDelegation of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const balanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                s.snapshotStakedMvkTotalSupply  := case balanceView of [
                    Some (value) -> value
                | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

                if requestTokensParams.tokenType = "FA12" or requestTokensParams.tokenType = "FA2" or requestTokensParams.tokenType = "TEZ" then skip
                else failwith(error_WRONG_TOKEN_TYPE_PROVIDED);

                const keyHash : option(key_hash) = (None : option(key_hash));

                // Check if token is in whitelist token map
                if requestTokensParams.tokenType =/= "TEZ" and not checkInWhitelistTokenContracts(requestTokensParams.tokenContractAddress, s.whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else skip;

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
function lambdaRequestMint(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  case governanceFinancialLambdaAction of [
        | LambdaRequestMint(requestMintParams) -> {
                
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];
  
                const mvkTokenAddress : address = s.mvkTokenAddress;

                const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptViewDoorman of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const generalContractsOptViewDelegation : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case generalContractsOptViewDelegation of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const balanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                s.snapshotStakedMvkTotalSupply  := case balanceView of [
                    Some (value) -> value
                | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
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
function lambdaSetContractBaker(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is 
block {
  
  checkSenderIsCouncilContract(s);

  case governanceFinancialLambdaAction of [
        | LambdaSetContractBaker(setContractBakerParams) -> {
                
                const emptyFinancialRequestVotersMap  : financialRequestVotersMapType     = map [];
  
                const mvkTokenAddress : address = s.mvkTokenAddress;

                const generalContractsOptViewDoorman : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptViewDoorman of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const generalContractsOptViewDelegation : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case generalContractsOptViewDelegation of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const balanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                s.snapshotStakedMvkTotalSupply  := case balanceView of [
                    Some (value) -> value
                | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
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
function lambdaDropFinancialRequest(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is 
block {

  checkSenderIsCouncilContract(s);

  case governanceFinancialLambdaAction of [
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
function lambdaVoteForRequest(const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorage) : return is 
block {

    var operations : list(operation) := nil;

    case governanceFinancialLambdaAction of [
        | LambdaVoteForRequest(voteForRequest) -> {
                
                // check if satellite exists in the active satellites map
                const generalContractsOptViewDelegation : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case generalContractsOptViewDelegation of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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

                            const generalContractsOptViewCouncil : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "council", s.governanceAddress);
                            const councilAddress: address = case generalContractsOptViewCouncil of [
                                Some (_optionContract) -> case _optionContract of [
                                        Some (_contract)    -> _contract
                                    |   None                -> failwith (error_COUNCIL_CONTRACT_NOT_FOUND)
                                    ]
                            |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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

                                // Check if token is in whitelist token map
                                if _financialRequest.tokenType =/= "TEZ" and not checkInWhitelistTokenContracts(_financialRequest.tokenContractAddress, s.whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else skip;

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
//
// Governance Financial Lambdas End
//
// ------------------------------------------------------------------------------