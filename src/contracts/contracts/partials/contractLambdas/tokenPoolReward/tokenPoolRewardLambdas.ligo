// ------------------------------------------------------------------------------
//
// Token Pool Reward Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolRewardLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolRewardLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolRewardLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s: tokenPoolRewardStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolRewardLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s: tokenPoolRewardStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolRewardLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s: tokenPoolRewardStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case tokenPoolRewardLambdaAction of [
        |   LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        |   _ -> skip
    ];


} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {
    
    checkNoAmount(Unit);     // entrypoint should not receive any tez amount    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    case tokenPoolRewardLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.onClaimRewardsIsPaused then skip
                else s.breakGlassConfig.onClaimRewardsIsPaused := True;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {
    
    checkNoAmount(Unit);     // entrypoint should not receive any tez amount    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    case tokenPoolRewardLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.onClaimRewardsIsPaused then s.breakGlassConfig.onClaimRewardsIsPaused := False
                else skip;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {

    checkNoAmount(Unit);     // entrypoint should not receive any tez amount    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    case tokenPoolRewardLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        OnClaimRewards (_v)   -> s.breakGlassConfig.onClaimRewardsIsPaused            := _v
                    |   Empty (_v)            -> skip
                    
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Reward Lambdas Begin
// ------------------------------------------------------------------------------

(*  onClaimRewards lambda *)
function lambdaOnClaimRewards(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {

    checkNoAmount(Unit);                       // entrypoint should not receive any tez amount    
    checkSenderIsLendingControllerContract(s); // check that sender is Lending Controller contract
    checkOnClaimRewardsIsNotPaused(s);         // check that %onClaimRewards entrypoint is not paused (e.g. if glass broken)

    var operations : list(operation) := nil;

    case tokenPoolRewardLambdaAction of [
        |   LambdaOnClaimRewards(onClaimRewardsParams) -> {

                const txs : list(transferDestinationType) = onClaimRewardsParams;
                
                const whitelistTokenContracts : whitelistTokenContractsType = s.whitelistTokenContracts;

                function transferAccumulator (var accumulator : list(operation); const destination : transferDestinationType) : list(operation) is 
                block {

                    const token        : tokenType        = destination.token;
                    const to_          : address          = destination.to_;
                    const amt          : tokenAmountType  = destination.amount;
                    const from_        : address          = Tezos.get_self_address(); // treasury
                    
                    // Create transfer token operation
                    // - check that token to be transferred are in the Whitelisted Token Contracts map
                    const transferTokenOperation : operation = case token of [
                        |   Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address") : contract(unit)), amt * 1mutez)
                        |   Fa12(token) -> if not checkInWhitelistTokenContracts(token, whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else transferFa12Token(from_, to_, amt, token)
                        |   Fa2(token)  -> if not checkInWhitelistTokenContracts(token.tokenContractAddress, whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
                    ];

                    accumulator := transferTokenOperation # accumulator;

                } with accumulator;

                const emptyOperation : list(operation) = list[];
                operations := List.fold(transferAccumulator, txs, emptyOperation);

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Token Pool Reward Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Token Pool Reward Lambdas End
//
// ------------------------------------------------------------------------------