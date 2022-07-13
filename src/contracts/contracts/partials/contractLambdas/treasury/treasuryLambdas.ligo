// ------------------------------------------------------------------------------
//
// Treasury Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
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
function lambdaSetGovernance(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
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
function lambdaSetBaker(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
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



(* setName lambda - update the contract name *)
function lambdaSetName(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {

    checkSenderIsAdmin(s);
    
    case treasuryLambdaAction of [
        | LambdaSetName(updatedName) -> {

                // Get treasury factory address
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasuryFactory", s.governanceAddress);
                const treasuryFactoryAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get the treasury factory config
                const configView : option (treasuryFactoryConfigType) = Tezos.call_view ("getConfig", unit, treasuryFactoryAddress);
                const treasuryFactoryConfig: treasuryFactoryConfigType = case configView of [
                    Some (_config) -> _config
                |   None -> failwith (error_GET_CONFIG_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                ];

                // Check get the name config param from the treasury factory
                const treasuryNameMaxLength: nat    = treasuryFactoryConfig.treasuryNameMaxLength;

                // Validate inputs and update the name
                if String.length(updatedName) > treasuryNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else s.name  := updatedName;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
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
function lambdaUpdateWhitelistContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorageType): return is
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
function lambdaUpdateGeneralContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorageType): return is
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
function lambdaUpdateWhitelistTokenContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorageType): return is
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
function lambdaPauseAll(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorageType) : return is
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

                if s.breakGlassConfig.stakeMvkIsPaused then skip
                else s.breakGlassConfig.stakeMvkIsPaused := True;

                if s.breakGlassConfig.unstakeMvkIsPaused then skip
                else s.breakGlassConfig.unstakeMvkIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
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

                if s.breakGlassConfig.stakeMvkIsPaused then s.breakGlassConfig.stakeMvkIsPaused := False
                else skip;

                if s.breakGlassConfig.unstakeMvkIsPaused then s.breakGlassConfig.unstakeMvkIsPaused := False
                else skip;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {

    checkNoAmount(Unit);
    checkSenderIsAdmin(s);

    case treasuryLambdaAction of [
        | LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                    Transfer (_v)             -> s.breakGlassConfig.transferIsPaused := _v
                |   MintMvkAndTransfer (_v)   -> s.breakGlassConfig.mintMvkAndTransferIsPaused := _v
                |   StakeMvk (_v)             -> s.breakGlassConfig.stakeMvkIsPaused := _v
                |   UnstakeMvk (_v)           -> s.breakGlassConfig.unstakeMvkIsPaused := _v
                ]
                
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
function lambdaTransfer(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send transfer operation from Treasury account to user account

    if not checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
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
                    const to_          : ownerType            = destination.to_;
                    const amt          : tokenAmountType  = destination.amount;
                    const from_        : address          = Tezos.get_self_address(); // treasury
                    
                    const transferTokenOperation : operation = case token of [
                        | Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address"): contract(unit)), amt * 1mutez)
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
function lambdaMintMvkAndTransfer(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send mint operation to MVK Token Contract

    // break glass check
    checkMintMvkAndTransferIsNotPaused(s);

    if not checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
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



(* updateMvkOperators lambda *)
function lambdaUpdateMvkOperators(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Update operators of this treasury to the mvk token contract

    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;


    case treasuryLambdaAction of [
        | LambdaUpdateMvkOperators(updateOperatorsParams) -> {
                
                // Get update_operators entrypoint in doorman
                const updateEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%update_operators",
                    s.mvkTokenAddress) : option(contract(updateOperatorsType))) of [
                            Some (contr)    -> contr
                        |   None            -> (failwith(error_UPDATE_OPERATORS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(updateOperatorsType))
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



(* stakeMvk lambda *)
function lambdaStakeMvk(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Send stake operation to Doorman Contract

    // break glass check
    checkStakeMvkIsNotPaused(s);

    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;


    case treasuryLambdaAction of [
        | LambdaStakeMvk(stakeAmount) -> {
                
                // Get doorman address
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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



(* unstakeMvk lambda *)
function lambdaUnstakeMvk(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Send stake operation to Doorman Contract

    // break glass check
    checkUnstakeMvkIsNotPaused(s);

    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;


    case treasuryLambdaAction of [
        | LambdaUnstakeMvk(unstakeAmount) -> {
                
                // Get doorman address
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
