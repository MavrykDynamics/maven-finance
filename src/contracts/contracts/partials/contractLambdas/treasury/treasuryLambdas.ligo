// ------------------------------------------------------------------------------
//
// Treasury Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const newAdminAddress : address; var s : treasuryStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    s.admin := newAdminAddress;

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const metadataKey: string; const metadataHash: bytes; var s : treasuryStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: treasuryStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: treasuryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: treasuryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(var s: treasuryStorage) : return is
block {
    
    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    // set all pause configs to True
    if s.breakGlassConfig.transferIsPaused then skip
    else s.breakGlassConfig.transferIsPaused := True;

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then skip
    else s.breakGlassConfig.mintMvkAndTransferIsPaused := True;

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(var s : treasuryStorage) : return is
block {
    
    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    // set all pause configs to False
    if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
    else skip;

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
    else skip;

} with (noOperations, s)



(* togglePauseTransfer lambda *)
function lambdaTogglePauseTransfer(var s : treasuryStorage) : return is
block {

    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
    else s.breakGlassConfig.transferIsPaused := True;

} with (noOperations, s)



(* togglePauseMintMvkAndTransfer lambda *)
function lambdaTogglePauseMintMvkAndTransfer(var s : treasuryStorage) : return is
block {

    // check that sender is admin or treasury factory
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
    else s.breakGlassConfig.mintMvkAndTransferIsPaused := True;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Lambdas Begin
// ------------------------------------------------------------------------------

(* transfer lambda *)
function lambdaTransfer(const transferTokenParams : transferActionType; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send transfer operation from Treasury account to user account
    // 3. Update user's satellite details in Delegation contract

    if not checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    // break glass check
    checkTransferIsNotPaused(s);

    // const txs : list(transferDestinationType)   = transferTokenParams.txs;
    const txs : list(transferDestinationType)   = transferTokenParams;
    
    const delegationAddress : address = case s.generalContracts["delegation"] of [
        Some(_address) -> _address
        | None -> failwith("Error. Delegation Contract is not found.")
    ];
    
    const mvkTokenAddress : address = s.mvkTokenAddress;

    function transferAccumulator (var accumulator : list(operation); const destination : transferDestinationType) : list(operation) is 
    block {

        const token        : tokenType        = destination.token;
        const to_          : owner            = destination.to_;
        const amt          : tokenAmountType  = destination.amount;
        const from_        : address          = Tezos.self_address; // treasury
        
        const transferTokenOperation : operation = case token of [
            | Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address. Cannot transfer XTZ"): contract(unit)), amt)
            | Fa12(token) -> transferFa12Token(from_, to_, amt, token)
            | Fa2(token)  -> transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
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
    const operations : list(operation) = List.fold(transferAccumulator, txs, emptyOperation);

} with (operations, s)



(* mintMvkAndTransfer lambda *)
function lambdaMintMvkAndTransfer(const mintMvkAndTransferParams : mintMvkAndTransferType ; var s : treasuryStorage) : return is 
block {
    
    // Steps Overview:
    // 1. Check that sender is in whitelist (governance)
    // 2. Send mint operation to MVK Token Contract
    // 3. Update user's satellite details in Delegation contract

    // break glass check
    checkMintMvkAndTransferIsNotPaused(s);

    if not checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then failwith("Error. Sender is not allowed to call this entrypoint.")
      else skip;

    var operations : list(operation) := nil;

    const to_    : address   = mintMvkAndTransferParams.to_;
    const amt    : nat       = mintMvkAndTransferParams.amt;

    const mvkTokenAddress : address = s.mvkTokenAddress;

    const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
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

} with (operations, s)

// ------------------------------------------------------------------------------
// Treasury Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Treasury Lambdas End
//
// ------------------------------------------------------------------------------
