// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Financial Contract
function verifySenderIsAdminOrGovernanceFinancial(const s : treasuryStorageType) : unit is
block{

    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceFinancialAddress], error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_FINANCIAL_ALLOWED)

} with(unit)



// Allowed Senders : Admin, Governance Contract, Treasury Factory Contract
function verifySenderIsAdminOrGovernanceOrFactory(const s : treasuryStorageType) : unit is
block {

    const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; s.governanceAddress; treasuryFactoryAddress], error_ONLY_ADMIN_OR_TREASURY_FACTORY_CONTRACT_ALLOWED)

} with(unit)



// helper function to verify sender is whitelisted
function verifySenderIsWhitelisted(const s : treasuryStorageType) : unit is 
block {

    if not checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
    else skip;

} with unit 

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to pause all entrypoints
function pauseAllTreasuryEntrypoints(var s : treasuryStorageType) : treasuryStorageType is 
block {

    // set all pause configs to True
    if s.breakGlassConfig.transferIsPaused then skip
    else s.breakGlassConfig.transferIsPaused := True;

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then skip
    else s.breakGlassConfig.mintMvkAndTransferIsPaused := True;

    if s.breakGlassConfig.stakeMvkIsPaused then skip
    else s.breakGlassConfig.stakeMvkIsPaused := True;

    if s.breakGlassConfig.unstakeMvkIsPaused then skip
    else s.breakGlassConfig.unstakeMvkIsPaused := True;

} with s



// helper function to unpause all entrypoints
function unpauseAllTreasuryEntrypoints(var s : treasuryStorageType) : treasuryStorageType is 
block {

    // set all pause configs to False
    if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
    else skip;

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
    else skip;

    if s.breakGlassConfig.stakeMvkIsPaused then s.breakGlassConfig.stakeMvkIsPaused := False
    else skip;

    if s.breakGlassConfig.unstakeMvkIsPaused then s.breakGlassConfig.unstakeMvkIsPaused := False
    else skip;

} with s

// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

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