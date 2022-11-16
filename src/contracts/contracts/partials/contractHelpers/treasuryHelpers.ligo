// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Contract
function checkSenderIsAllowed(const s : treasuryStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders : Admin
function checkSenderIsAdmin(var s : treasuryStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders : Admin, Governance Financial Contract
function checkSenderIsAdminOrGovernanceFinancial(const s : treasuryStorageType) : unit is
block{

    const governanceFinancialAddress : address = case s.whitelistContracts["governanceFinancial"] of [
            Some (_address) -> _address
        |   None            -> (failwith(error_ONLY_ADMIN_OR_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED) : address)
    ];
    
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = governanceFinancialAddress) then skip
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);

} with(unit)



// Allowed Senders : Admin, Governance Contract, Treasury Factory Contract
function checkSenderIsGovernanceOrFactory(const s : treasuryStorageType) : unit is
block {
    
    if Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress
    then skip
    else{

        const treasuryFactoryAddress : address = case s.whitelistContracts["treasuryFactory"] of [
                Some (_address) -> _address
            |   None            -> (failwith(error_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : address)
        ];

        if Tezos.get_sender() = treasuryFactoryAddress then skip else failwith(error_ONLY_ADMIN_OR_TREASURY_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)



// helper function to verify sender is whitelisted
function verifySenderIsWhitelisted(const s : treasuryStorageType) : unit is 
block {

    if not checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
    else skip;

} with unit 



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %transfer entrypoint is not paused
function checkTransferIsNotPaused(var s : treasuryStorageType) : unit is
    if s.breakGlassConfig.transferIsPaused then failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %mintMvkAndTransfer entrypoint is not paused
function checkMintMvkAndTransferIsNotPaused(var s : treasuryStorageType) : unit is
    if s.breakGlassConfig.mintMvkAndTransferIsPaused then failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %stakeMvk entrypoint is not paused
function checkStakeMvkIsNotPaused(var s : treasuryStorageType) : unit is
    if s.breakGlassConfig.stakeMvkIsPaused then failwith(error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %unstakeMvk entrypoint is not paused
function checkUnstakeMvkIsNotPaused(var s : treasuryStorageType) : unit is
    if s.breakGlassConfig.unstakeMvkIsPaused then failwith(error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get mint entrypoint from specified token contract address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintType) is
    case (Tezos.get_entrypoint_opt(
        "%mint",
        token_address) : option(contract(mintType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_MINT_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(mintType))
        ];



// helper function to %stake entrypoint on the Doorman contract
function getStakeEntrypointOnDoorman(const contractAddress : address) : contract(nat) is
    case (Tezos.get_entrypoint_opt(
        "%stake",
        contractAddress) : option(contract(nat))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(nat))
        ];



// helper function to %unstake entrypoint on the Doorman contract
function getUnstakeEntrypointOnDoorman(const contractAddress : address) : contract(nat) is
    case (Tezos.get_entrypoint_opt(
        "%unstake",
        contractAddress) : option(contract(nat))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(nat))
        ];



// helper function to %update_operators entrypoint on the MVK token contract
function getUpdateMvkOperatorsEntrypoint(const tokenContractAddress : address) : contract(updateOperatorsType) is
    case (Tezos.get_entrypoint_opt(
        "%update_operators",
        tokenContractAddress) : option(contract(updateOperatorsType))) of [
                Some (contr)    -> contr
            |   None            -> (failwith(error_UPDATE_OPERATORS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(updateOperatorsType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to stake MVK on the Doorman contract
function stakeMvkOperation(const stakeAmount : nat; const s : treasuryStorageType) : operation is
block {

    // Get Doorman Contract address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Create and send stake operation
    const stakeMvkOperation : operation = Tezos.transaction(
        (stakeAmount),
        0tez, 
        getStakeEntrypointOnDoorman(doormanAddress)
    );

} with stakeMvkOperation



// helper function to unstake MVK on the Doorman contract
function unstakeMvkOperation(const unstakeAmount : nat; const s : treasuryStorageType) : operation is
block {

    // Get Doorman Contract address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Create and send unstake operation
    const unstakeMvkOperation : operation = Tezos.transaction(
        (unstakeAmount),
        0tez, 
        getUnstakeEntrypointOnDoorman(doormanAddress)
    );

} with unstakeMvkOperation



// helper function to update operators on the MVK token contract
function updateMvkOperatorsOperation(const updateOperatorsParams : updateOperatorsType; const s : treasuryStorageType) : operation is
block {

    // Create and send update MVK operators operation
    const updateMvkOperatorsOperation : operation = Tezos.transaction(
        (updateOperatorsParams),
        0tez, 
        getUpdateMvkOperatorsEntrypoint(s.mvkTokenAddress)
    );

} with updateMvkOperatorsOperation

// ------------------------------------------------------------------------------
// Operations Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to mint mvk tokens 
function mintTokens(const to_ : address; const amount_ : nat; const s : treasuryStorageType) : operation is
block {

    const mvkTokenAddress : address = s.mvkTokenAddress;
    
    const mintTokenOperation : operation = Tezos.transaction(
        (to_, amount_),
        0tez,
        getMintEntrypointFromTokenAddress(mvkTokenAddress)
    );

} with mintTokenOperation

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get lambda bytes
function getLambdaBytes(const lambdaKey : string; const s : treasuryStorageType) : bytes is 
block {
    
    // get lambda bytes from lambda ledger
    const lambdaBytes : bytes = case s.lambdaLedger[lambdaKey] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

} with lambdaBytes



// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const treasuryLambdaAction : treasuryLambdaActionType; var s : treasuryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(treasuryUnpackLambdaFunctionType)) of [
            Some(f) -> f(treasuryLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------