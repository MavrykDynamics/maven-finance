// ------------------------------------------------------------------------------
//
// Treasury Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s); 

    case treasuryLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case treasuryLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* setBaker lambda *)
function lambdaSetBaker(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdminOrGovernanceFinancial(s); 

    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        | LambdaSetBaker(keyHash) -> {
                const setBakerOperation  : operation = Tezos.set_delegate(keyHash);
                operations := setBakerOperation # operations;
            }
        | _ -> skip
    ];

} with (operations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {

    checkSenderIsAdmin(s);
    
    case treasuryLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorage): return is
block {
    
    checkSenderIsAdmin(s);
    
    case treasuryLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorage): return is
block {

    checkSenderIsAdmin(s);
    
    case treasuryLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorage): return is
block {

    checkSenderIsAdmin(s);

    case treasuryLambdaAction of [
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
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorage) : return is
block {
    
    // check that sender is admin or treasury factory
    checkSenderIsGovernanceOrFactory(s);

    case treasuryLambdaAction of [
        | LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.transferIsPaused then skip
                else s.breakGlassConfig.transferIsPaused := True;

                if s.breakGlassConfig.mintMvkAndTransferIsPaused then skip
                else s.breakGlassConfig.mintMvkAndTransferIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {
    
    // check that sender is admin or treasury factory
    checkSenderIsGovernanceOrFactory(s);

    case treasuryLambdaAction of [
        | LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
                else skip;

                if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
                else skip;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseTransfer lambda *)
function lambdaTogglePauseTransfer(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case treasuryLambdaAction of [
        | LambdaTogglePauseTransfer(_parameters) -> {
                
                if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
                else s.breakGlassConfig.transferIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseMintMvkAndTransfer lambda *)
function lambdaTogglePauseMintMvkAndTransfer(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case treasuryLambdaAction of [
        | LambdaTogglePauseMintTransfer(_parameters) -> {
                
                if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
                else s.breakGlassConfig.mintMvkAndTransferIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Lambdas Begin
// ------------------------------------------------------------------------------

(* transfer lambda *)
function lambdaTransfer(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send transfer operation from Treasury account to user account
    // 3. Update user's satellite details in Delegation contract

    if not checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
      else skip;

    // break glass check
    checkTransferIsNotPaused(s);

    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        | LambdaTransfer(transferTokenParams) -> {
                
                // const txs : list(transferDestinationType)   = transferTokenParams.txs;
                const txs : list(transferDestinationType)   = transferTokenParams;
                
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                    Some(_address) -> _address
                    | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                
                const mvkTokenAddress           : address                       = s.mvkTokenAddress;
                const whitelistTokenContracts   : whitelistTokenContractsType   = s.whitelistTokenContracts;

                function transferAccumulator (var accumulator : list(operation); const destination : transferDestinationType) : list(operation) is 
                block {

                    const token        : tokenType        = destination.token;
                    const to_          : owner            = destination.to_;
                    const amt          : tokenAmountType  = destination.amount;
                    const from_        : address          = Tezos.self_address; // treasury
                    
                    const transferTokenOperation : operation = case token of [
                        | Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address"): contract(unit)), amt)
                        | Fa12(token) -> if not checkInWhitelistTokenContracts(token, whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else transferFa12Token(from_, to_, amt, token)
                        | Fa2(token)  -> if not checkInWhitelistTokenContracts(token.tokenContractAddress, whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
                    ];

                    accumulator := transferTokenOperation # accumulator;

                    // update user's satellite balance if MVK is transferred
                    const checkIfMvkToken : bool = case token of [
                        Tez -> False
                        | Fa12(_token) -> False
                        | Fa2(token) -> block {
                                var mvkBool : bool := False;
                                if token.tokenContractAddress = mvkTokenAddress then mvkBool := True else mvkBool := False;                
                            } with mvkBool        
                    ];

                    if checkIfMvkToken = True then block {
                        
                        const updateSatelliteBalanceOperation : operation = Tezos.transaction(
                            (to_),
                            0mutez,
                            updateSatelliteBalance(delegationAddress)
                        );

                        accumulator := updateSatelliteBalanceOperation # accumulator;

                    } else skip;    

                } with accumulator;

                const emptyOperation : list(operation) = list[];
                operations := List.fold(transferAccumulator, txs, emptyOperation);

            }
        | _ -> skip
    ];

} with (operations, s)



(* mintMvkAndTransfer lambda *)
function lambdaMintMvkAndTransfer(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send mint operation to MVK Token Contract
    // 3. Update user's satellite details in Delegation contract

    // break glass check
    checkMintMvkAndTransferIsNotPaused(s);

    if not checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
      else skip;

    var operations : list(operation) := nil;


    case treasuryLambdaAction of [
        | LambdaMintMvkAndTransfer(mintMvkAndTransferParams) -> {
                
                const to_    : address   = mintMvkAndTransferParams.to_;
                const amt    : nat       = mintMvkAndTransferParams.amt;

                const mvkTokenAddress : address = s.mvkTokenAddress;

                const delegationAddress : address = case s.generalContracts["delegation"] of [
                Some(_address) -> _address
                | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const mintMvkTokensOperation : operation = mintTokens(
                    to_,                // to address
                    amt,                // amount of mvk Tokens to be minted
                    mvkTokenAddress     // mvkTokenAddress
                ); 

                const updateSatelliteBalanceOperation : operation = Tezos.transaction(
                    (to_),
                    0mutez,
                    updateSatelliteBalance(delegationAddress)
                );

                operations := mintMvkTokensOperation # operations;
                operations := updateSatelliteBalanceOperation # operations;

            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Treasury Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Treasury Lambdas End
//
// ------------------------------------------------------------------------------
