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

    if not checkInWhitelistContracts(Mavryk.get_sender(), s.whitelistContracts) then failwith(error_ONLY_WHITELISTED_ADDRESSES_ALLOWED)
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

    if s.breakGlassConfig.updateTokenOperatorsIsPaused then skip
    else s.breakGlassConfig.updateTokenOperatorsIsPaused := True;

    if s.breakGlassConfig.stakeTokensIsPaused then skip
    else s.breakGlassConfig.stakeTokensIsPaused := True;

    if s.breakGlassConfig.unstakeTokensIsPaused then skip
    else s.breakGlassConfig.unstakeTokensIsPaused := True;

} with s



// helper function to unpause all entrypoints
function unpauseAllTreasuryEntrypoints(var s : treasuryStorageType) : treasuryStorageType is 
block {

    // set all pause configs to False
    if s.breakGlassConfig.transferIsPaused then s.breakGlassConfig.transferIsPaused := False
    else skip;

    if s.breakGlassConfig.mintMvkAndTransferIsPaused then s.breakGlassConfig.mintMvkAndTransferIsPaused := False
    else skip;

    if s.breakGlassConfig.updateTokenOperatorsIsPaused then s.breakGlassConfig.updateTokenOperatorsIsPaused := False
    else skip;

    if s.breakGlassConfig.stakeTokensIsPaused then s.breakGlassConfig.stakeTokensIsPaused := False
    else skip;

    if s.breakGlassConfig.unstakeTokensIsPaused then s.breakGlassConfig.unstakeTokensIsPaused := False
    else skip;

} with s

// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %stake entrypoint
function getStakeEntrypoint(const contractAddress : address) : contract(nat) is
    case (Mavryk.get_entrypoint_opt(
        "%stake",
        contractAddress) : option(contract(nat))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_STAKE_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND) : contract(nat))
        ];



// helper function to %unstake entrypoint
function getUnstakeEntrypoint(const contractAddress : address) : contract(nat) is
    case (Mavryk.get_entrypoint_opt(
        "%unstake",
        contractAddress) : option(contract(nat))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNSTAKE_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND) : contract(nat))
        ];


// helper function to %update_operators entrypoint 
function getUpdateOperatorsEntrypoint(const tokenContractAddress : address) : contract(updateOperatorsType) is
    case (Mavryk.get_entrypoint_opt(
        "%update_operators",
        tokenContractAddress) : option(contract(updateOperatorsType))) of [
                Some (contr)    -> contr
            |   None            -> (failwith(error_UPDATE_OPERATORS_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND) : contract(updateOperatorsType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to stake tokens on the provided contract address
function stakeTokensOperation(const stakeTokensParams : stakeTokensType) : operation is
block {

    const stakeAmount    : nat         = stakeTokensParams.amount;
    const contractAddress  : address   = stakeTokensParams.contractAddress;

    // Create and send stake operation
    const stakeTokensOperation : operation = Mavryk.transaction(
        (stakeAmount),
        0mav, 
        getStakeEntrypoint(contractAddress)
    );

} with stakeTokensOperation



// helper function to unstake tokens from the provided contract address
function unstakeTokensOperation(const unstakeTokensParams : unstakeTokensType) : operation is
block {

    const unstakeAmount    : nat       = unstakeTokensParams.amount;
    const contractAddress  : address   = unstakeTokensParams.contractAddress;

    // Create and send unstake operation
    const unstakeTokensOperation : operation = Mavryk.transaction(
        (unstakeAmount),
        0mav, 
        getUnstakeEntrypoint(contractAddress)
    );

} with unstakeTokensOperation



// helper function to update operators on the provided token contract
function updateTokenOperatorsOperation(const updateTokenOperatorsParams : updateTokenOperatorsType) : operation is
block {

    const tokenContractAddress   : address               = updateTokenOperatorsParams.tokenContractAddress;
    const updateOperatorsParams  : updateOperatorsType   = updateTokenOperatorsParams.updateOperators;

    // Create and send update MVK operators operation
    const updateTokenOperatorsOperation : operation = Mavryk.transaction(
        (updateOperatorsParams),
        0mav, 
        getUpdateOperatorsEntrypoint(tokenContractAddress)
    );

} with updateTokenOperatorsOperation

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
    
    const mintTokenOperation : operation = Mavryk.transaction(
        (to_, amount_),
        0mav,
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