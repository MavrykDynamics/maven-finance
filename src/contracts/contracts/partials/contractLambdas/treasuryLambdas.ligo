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
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case treasuryLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case treasuryLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* setBaker lambda *)
function lambdaSetBaker(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {
    
    checkNoAmount(Unit);                            // entrypoint should not receive any tez amount  
    checkSenderIsAdminOrGovernanceFinancial(s);     // check that sender is admin or the Governance Financial Contract address

    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        |   LambdaSetBaker(keyHash) -> {
                const setBakerOperation  : operation = Tezos.set_delegate(keyHash);
                operations := setBakerOperation # operations;
            }
        |   _ -> skip
    ];

} with (operations, s)



(* setName lambda - update the contract name *)
function lambdaSetName(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {

    // Steps Overview:
    // 1. Check if sender is admin
    // 2. Get Treasury Factory Contract address from the General Contracts Map on the Governance Contract
    // 3. Get the Treasury Factory Contract Config
    // 4. Get the treasuryNameMaxLength parameter from the Treasury Factory Contract Config
    // 5. Validate input (name does not exceed max length) and update the Treasury Contract name

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)
    
    case treasuryLambdaAction of [
        |   LambdaSetName(updatedName) -> {

                // Get Treasury Factory Address from the General Contracts map on the Governance Contract
                const treasuryFactoryAddress: address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

                // Get the Treasury Factory Contract Config
                const configView : option (treasuryFactoryConfigType) = Tezos.call_view ("getConfig", unit, treasuryFactoryAddress);
                const treasuryFactoryConfig: treasuryFactoryConfigType = case configView of [
                        Some (_config) -> _config
                    |   None           -> failwith (error_GET_CONFIG_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                ];

                // Get the treasuryNameMaxLength parameter from the Treasury Factory Contract Config
                const treasuryNameMaxLength: nat    = treasuryFactoryConfig.treasuryNameMaxLength;

                // Validate input and update the Treasury name
                if String.length(updatedName) > treasuryNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else s.name  := updatedName;
              
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case treasuryLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata[metadataKey] := metadataHash;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin 
    
    case treasuryLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case treasuryLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const treasuryLambdaAction : treasuryLambdaActionType; var s: treasuryStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case treasuryLambdaAction of [
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
function lambdaPauseAll(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {
    
    // check that sender is admin, Governance Contract address or Treasury Factory Contract address
    checkSenderIsGovernanceOrFactory(s); 

    case treasuryLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
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
        |   _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {
    
    // check that sender is admin, Governance Contract address or Treasury Factory Contract address
    checkSenderIsGovernanceOrFactory(s);

    case treasuryLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
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
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is
block {

    checkNoAmount(Unit);    // entrypoint should not receive any tez amount    
    checkSenderIsAdmin(s);  // check that sender is admin 

    case treasuryLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        Transfer (_v)             -> s.breakGlassConfig.transferIsPaused            := _v
                    |   MintMvkAndTransfer (_v)   -> s.breakGlassConfig.mintMvkAndTransferIsPaused  := _v
                    |   StakeMvk (_v)             -> s.breakGlassConfig.stakeMvkIsPaused            := _v
                    |   UnstakeMvk (_v)           -> s.breakGlassConfig.unstakeMvkIsPaused          := _v
                ]
                
            }
        |   _ -> skip
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
    // 1. Check if sender is whitelisted (e.g. governance)
    // 2. Check that %transfer entrypoint is not paused (e.g. if glass broken)
    // 3. Check that tokens to be transferred are in the Whitelisted Token Contracts map
    // 4. Create and excecute transfer operations 

    // Verify that sender is whitelisted
    verifySenderIsWhitelisted(s);

    checkTransferIsNotPaused(s); // check that %transfer entrypoint is not paused (e.g. if glass broken)

    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        |   LambdaTransfer(transferTokenParams) -> {
                
                const txs : list(transferDestinationType) = transferTokenParams;
                
                const whitelistTokenContracts : whitelistTokenContractsType = s.whitelistTokenContracts;

                function transferAccumulator (var accumulator : list(operation); const destination : transferDestinationType) : list(operation) is 
                block {

                    const token        : tokenType        = destination.token;
                    const to_          : ownerType        = destination.to_;
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



(* mintMvkAndTransfer lambda *)
function lambdaMintMvkAndTransfer(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is whitelisted (governance)
    // 2. Check that %mintMvkAndTransfer entrypoint is not paused (e.g. if glass broken)
    // 3. Create and execute mint operation to MVK Token Contract

    // Verify that sender is whitelisted
    verifySenderIsWhitelisted(s);

    checkMintMvkAndTransferIsNotPaused(s); // check that %mintMvkAndTransfer entrypoint is not paused (e.g. if glass broken)

    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        |   LambdaMintMvkAndTransfer(mintMvkAndTransferParams) -> {
                
                const to_    : address   = mintMvkAndTransferParams.to_;
                const amt    : nat       = mintMvkAndTransferParams.amt;

                const mintMvkTokensOperation : operation = mintTokens(
                    to_,                // to address
                    amt,                // amount of mvk Tokens to be minted
                    s                   // mvkTokenAddress
                );

                operations := mintMvkTokensOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* updateMvkOperators lambda *)
function lambdaUpdateMvkOperators(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is admin
    // 2. Update operators of Treasury Contract on the MVK Token contract 
    //    - required to set Doorman Contract as an operator for staking/unstaking 

    checkSenderIsAdmin(s); // check that sender is admin 

    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        |   LambdaUpdateMvkOperators(updateOperatorsParams) -> {
                
                // Create and send update operators operation
                const updateMvkOperatorsOperation : operation = updateMvkOperatorsOperation(updateOperatorsParams, s);
                operations := updateMvkOperatorsOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* stakeMvk lambda *)
function lambdaStakeMvk(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is admin
    // 2. Check that %stakeMvk entrypoint is not paused (e.g. if glass broken)
    // 3. Get Doorman Contract address from the General Contracts Map on the Governance Contract
    // 4. Get stake entrypoint in the Doorman Contract
    // 5. Create and send stake operation to the Doorman Contract

    checkSenderIsAdmin(s);       // check that sender is admin

    checkStakeMvkIsNotPaused(s); // check that %stakeMvk entrypoint is not paused (e.g. if glass broken)

    var operations : list(operation) := nil;


    case treasuryLambdaAction of [
        |   LambdaStakeMvk(stakeAmount) -> {
                
                // Create and send stake operation
                const stakeMvkOperation : operation = stakeMvkOperation(stakeAmount, s);
                operations := stakeMvkOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* unstakeMvk lambda *)
function lambdaUnstakeMvk(const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is admin
    // 2. Check that %unstakeMvk entrypoint is not paused (e.g. if glass broken)
    // 3. Get Doorman Contract address from the General Contracts Map on the Governance Contract
    // 4. Get unstake entrypoint in the Doorman Contract
    // 5. Create and send unstake operation to the Doorman Contract
    
    checkSenderIsAdmin(s);         // check that sender is admin
    checkUnstakeMvkIsNotPaused(s); // check that %unstakeMvk entrypoint is not paused (e.g. if glass broken)

    var operations : list(operation) := nil;

    case treasuryLambdaAction of [
        |   LambdaUnstakeMvk(unstakeAmount) -> {
                
                // Create and send unstake operation
                const unstakeMvkOperation : operation = unstakeMvkOperation(unstakeAmount, s);
                operations := unstakeMvkOperation # operations;

            }
        |   _ -> skip
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
