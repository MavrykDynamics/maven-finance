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

                if s.breakGlassConfig.stakeIsPaused then skip
                else s.breakGlassConfig.stakeIsPaused := True;

                if s.breakGlassConfig.unstakeIsPaused then skip
                else s.breakGlassConfig.unstakeIsPaused := True;

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

                if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
                else skip;

                if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
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



(* togglePauseStake lambda *)
function lambdaTogglePauseStake(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case treasuryLambdaAction of [
        | LambdaTogglePauseStake(_parameters) -> {
                
                if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
                else s.breakGlassConfig.stakeIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* togglePauseUnstake lambda *)
function lambdaTogglePauseUnstake(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    case treasuryLambdaAction of [
        | LambdaTogglePauseUnstake(_parameters) -> {
                
                if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
                else s.breakGlassConfig.unstakeIsPaused := True;

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

    if not checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
      else skip;

    // break glass check
    checkTransferIsNotPaused(s);

    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        | LambdaTransfer(transferTokenParams) -> {
                
                // const txs : list(transferDestinationType)   = transferTokenParams.txs;
                const txs : list(transferDestinationType)   = transferTokenParams;
                
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

                const mintMvkTokensOperation : operation = mintTokens(
                    to_,                // to address
                    amt,                // amount of mvk Tokens to be minted
                    mvkTokenAddress     // mvkTokenAddress
                );

                operations := mintMvkTokensOperation # operations;

            }
        | _ -> skip
    ];

} with (operations, s)



(* update_operators lambda *)
function lambdaUpdateOperators(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Update operators of this treasury to the mvk token contract

    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;


    case treasuryLambdaAction of [
        | LambdaUpdateOperators(updateOperatorsParams) -> {
                
                // Get update_operators entrypoint in doorman
                const updateEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%update_operators",
                    s.mvkTokenAddress) : option(contract(updateOperatorsParams))) of [
                            Some (contr)    -> contr
                        |   None            -> (failwith(error_UPDATE_OPERATORS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(updateOperatorsParams))
                ];

                const updateOperation : operation = Tezos.transaction(
                    (updateOperatorsParams),
                    0tez, 
                    updateEntrypoint
                );

                operations := updateOperation # operations;

            }
        | _ -> skip
    ];

} with (operations, s)



(* stake lambda *)
function lambdaStake(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Send stake operation to Doorman Contract

    // break glass check
    checkStakeIsNotPaused(s);

    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;


    case treasuryLambdaAction of [
        | LambdaStake(stakeAmount) -> {
                
                // Get doorman address
                const doormanAddress: address   = case s.generalContracts["doorman"] of [
                    Some (_address)     -> _address
                |   None                -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
                ];

                // Get stake entrypoint in doorman
                const stakeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%stake",
                    doormanAddress) : option(contract(nat))) of [
                            Some (contr)    -> contr
                        |   None            -> (failwith(error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(nat))
                ];

                const stakeOperation : operation = Tezos.transaction(
                    (stakeAmount),
                    0tez, 
                    stakeEntrypoint
                );

                operations := stakeOperation # operations;

            }
        | _ -> skip
    ];

} with (operations, s)



(* unstake lambda *)
function lambdaUnstake(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Send stake operation to Doorman Contract

    // break glass check
    checkUnstakeIsNotPaused(s);

    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;


    case treasuryLambdaAction of [
        | LambdaUnstake(unstakeAmount) -> {
                
                // Get doorman address
                const doormanAddress: address   = case s.generalContracts["doorman"] of [
                    Some (_address)     -> _address
                |   None                -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
                ];

                // Get stake entrypoint in doorman
                const unstakeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%unstake",
                    doormanAddress) : option(contract(nat))) of [
                            Some (contr)    -> contr
                        |   None            -> (failwith(error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(nat))
                ];

                const unstakeOperation : operation = Tezos.transaction(
                    (unstakeAmount),
                    0tez, 
                    unstakeEntrypoint
                );

                operations := unstakeOperation # operations;

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
