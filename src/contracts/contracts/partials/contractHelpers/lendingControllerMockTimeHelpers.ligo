// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Verify that sender is admin or tester
function verifySenderIsAdminOrTester(const s : lendingControllerStorageType) : unit is
block {

    if Mavryk.get_sender() = s.admin or Mavryk.get_sender() = s.tester then skip
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);

} with unit



// Allowed Senders: Vault Factory Contract
function verifySenderIsVaultFactoryContract(const s : lendingControllerStorageType) : unit is
block{

    // Get Vault Factory Address from the General Contracts map on the Governance Contract
    const vaultFactoryAddress: address = getContractAddressFromGovernanceContract("vaultFactory", s.governanceAddress, error_VAULT_FACTORY_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[vaultFactoryAddress], error_ONLY_VAULT_FACTORY_CONTRACT_ALLOWED)

} with unit



// verify that sender is vault
function verifySenderIsVault(const vaultAddress : address; const sender : address) : unit is 
block {

    if vaultAddress =/= sender then failwith(error_SENDER_MUST_BE_VAULT_ADDRESS) else skip; 

} with unit



// verify that sender is vault or vault factory
function verifySenderIsVaultOrVaultFactory(const vaultAddress : address; const s : lendingControllerStorageType) : unit is 
block {

    // Get Vault Factory Address from the General Contracts map on the Governance Contract
    const vaultFactoryAddress: address = getContractAddressFromGovernanceContract("vaultFactory", s.governanceAddress, error_VAULT_FACTORY_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[vaultFactoryAddress; vaultAddress], error_ONLY_VAULT_OR_VAULT_FACTORY_CONTRACT_ALLOWED)

} with unit


// verify that collateral token is not protected
function verifyCollateralTokenIsNotProtected(const collateralTokenRecord : collateralTokenRecordType; const errorCode : nat) : unit is
block {

    if collateralTokenRecord.protected = True then failwith(errorCode) else skip;

} with unit



// verify that loan token does not exist
function verifyLoanTokenDoesNotExist(const loanTokenName : string; const s : lendingControllerStorageType) : unit is 
block {

    if Big_map.mem(loanTokenName, s.loanTokenLedger) then failwith(error_LOAN_TOKEN_ALREADY_EXISTS) else skip;

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Misc Helper Functions Begin
// ------------------------------------------------------------------------------

// helper functions - conversions
function mumavToNatural(const amt : mav) : nat is amt / 1mumav;
function naturalToMumav(const amt : nat) : mav is amt * 1mumav;


// helper function to check no loan outstanding on vault
function checkZeroLoanOutstanding(const vault : vaultRecordType) : unit is
  if vault.loanOutstandingTotal = 0n then unit
  else failwith(error_LOAN_OUTSTANDING_IS_NOT_ZERO)

// ------------------------------------------------------------------------------
// Misc Helper Functions Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get %initVaultAction entrypoint in a Vault Contract
function getInitVaultActionEntrypoint(const vaultAddress : address) : contract(initVaultActionType) is
    case (Mavryk.get_entrypoint_opt(
        "%initVaultAction",
        vaultAddress) : option(contract(initVaultActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_INIT_VAULT_ACTION_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND) : contract(initVaultActionType))
        ]



// helper function to get %onVaultDepositStake entrypoint in staking Contract
function getOnVaultDepositStakeEntrypoint(const contractAddress : address) : contract(onVaultDepositStakeType) is
    case (Mavryk.get_entrypoint_opt(
        "%onVaultDepositStake",
        contractAddress) : option(contract(onVaultDepositStakeType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_VAULT_DEPOSIT_STAKE_ENTRYPOINT_IN_STAKING_CONTRACT_NOT_FOUND) : contract(onVaultDepositStakeType))
        ]



// helper function to get %onVaultWithdrawStake entrypoint from staking contract address
function getOnVaultWithdrawStakeEntrypoint(const contractAddress : address) : contract(onVaultWithdrawStakeType) is
    case (Mavryk.get_entrypoint_opt(
        "%onVaultWithdrawStake",
        contractAddress) : option(contract(onVaultWithdrawStakeType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_VAULT_WITHDRAW_STAKE_ENTRYPOINT_IN_STAKING_CONTRACT_NOT_FOUND) : contract(onVaultWithdrawStakeType))
        ]



// helper function to get %onVaultLiquidateStake entrypoint from staking contract address
function getOnVaultLiquidateStakeEntrypoint(const contractAddress : address) : contract(onVaultLiquidateStakeType) is
    case (Mavryk.get_entrypoint_opt(
        "%onVaultLiquidateStake",
        contractAddress) : option(contract(onVaultLiquidateStakeType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_VAULT_LIQUIDATE_STAKE_ENTRYPOINT_IN_STAKING_CONTRACT_NOT_FOUND) : contract(onVaultLiquidateStakeType))
        ]        



// helper function to get mintOrBurn entrypoint from MToken contract (FA2 Token Standard)
function getMTokenMintOrBurnEntrypoint(const tokenContractAddress : address) : contract(mintOrBurnType) is
    case (Mavryk.get_entrypoint_opt(
        "%mintOrBurn",
        tokenContractAddress) : option(contract(mintOrBurnType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_MINT_OR_BURN_ENTRYPOINT_IN_M_TOKEN_NOT_FOUND) : contract(mintOrBurnType))
        ]

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Contract Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get user staked mvn balance from staking contract (e.g. Doorman)
function getBalanceFromStakingContract(const userAddress : address; const contractAddress : address) : nat is 
block {

    // get staked MVN balance of user from Doorman contract
    const getStakedBalanceView : option (nat) = Mavryk.call_view ("getStakedBalance", userAddress, contractAddress);
    const userStakedMvnBalance : nat = case getStakedBalanceView of [
            Some (_value) -> _value
        |   None          -> failwith(error_GET_STAKED_BALANCE_VIEW_IN_CONTRACT_NOT_FOUND)
    ];

} with userStakedMvnBalance



// helper function to get target user balance from scaled token contract (e.g. mToken)
function getBalanceFromScaledTokenContract(const userAddress : address; const tokenContractAddress : address) : nat is 
block {

    // get balance of user from scaled token contract
    const getBalanceView : option (nat) = Mavryk.call_view ("get_balance", (userAddress, 0), tokenContractAddress);
    const scaledBalance : nat = case getBalanceView of [
            Some (_balance) -> _balance
        |   None            -> 0n
    ];

} with scaledBalance



// helper function to mint or burn M Token
function mintOrBurnMToken(const target : address; const quantity : int; const mTokenAddress : address) : operation is 
block {

    const mintOrBurnParams : mintOrBurnType = record [
        quantity = quantity;
        tokenId  = 0n;          
        target   = target;
    ];

} with (Mavryk.transaction(mintOrBurnParams, 0mumav, getMTokenMintOrBurnEntrypoint(mTokenAddress) ) )



// helper function to get loan token record
function getLoanTokenRecord(const loanTokenName : string; const s : lendingControllerStorageType) : loanTokenRecordType is 
block {

    const loanTokenRecord : loanTokenRecordType = case s.loanTokenLedger[loanTokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

} with loanTokenRecord



// helper function to create new loan token record
function createLoanTokenRecord(const createLoanTokenParams : createLoanTokenActionType) : loanTokenRecordType is 
block {

    // init variables for convenience
    const tokenName                             : string        = createLoanTokenParams.tokenName;
    const tokenType                             : tokenType     = createLoanTokenParams.tokenType;
    const tokenDecimals                         : nat           = createLoanTokenParams.tokenDecimals;

    const oracleAddress                         : address       = createLoanTokenParams.oracleAddress;

    const mTokenAddress                         : address       = createLoanTokenParams.mTokenAddress;
    const reserveRatio                          : nat           = createLoanTokenParams.reserveRatio;

    const optimalUtilisationRate                : nat           = createLoanTokenParams.optimalUtilisationRate;
    const baseInterestRate                      : nat           = createLoanTokenParams.baseInterestRate;
    const maxInterestRate                       : nat           = createLoanTokenParams.maxInterestRate;
    const interestRateBelowOptimalUtilisation   : nat           = createLoanTokenParams.interestRateBelowOptimalUtilisation;
    const interestRateAboveOptimalUtilisation   : nat           = createLoanTokenParams.interestRateAboveOptimalUtilisation;

    const minRepaymentAmount                    : nat           = createLoanTokenParams.minRepaymentAmount;

    const newLoanTokenRecord : loanTokenRecordType = record [
                    
        tokenName                           = tokenName;
        tokenType                           = tokenType;
        tokenDecimals                       = tokenDecimals;

        oracleAddress                       = oracleAddress;

        rawMTokensTotalSupply               = 0n;
        mTokenAddress                       = mTokenAddress;

        reserveRatio                        = reserveRatio;
        tokenPoolTotal                      = 0n;
        totalBorrowed                       = 0n;
        totalRemaining                      = 0n;

        utilisationRate                     = 1n;
        optimalUtilisationRate              = optimalUtilisationRate;
        baseInterestRate                    = baseInterestRate;
        maxInterestRate                     = maxInterestRate;
        interestRateBelowOptimalUtilisation = interestRateBelowOptimalUtilisation;
        interestRateAboveOptimalUtilisation = interestRateAboveOptimalUtilisation;
        minRepaymentAmount                  = minRepaymentAmount;

        currentInterestRate                 = baseInterestRate;
        lastUpdatedBlockLevel               = Mavryk.get_level();
        tokenRewardIndex                    = fixedPointAccuracy;
        borrowIndex                         = fixedPointAccuracy;

        isPaused                            = False;
    ];

} with newLoanTokenRecord



// helper function to create new loan token record
function updateLoanTokenRecord(const loanTokenName : string; const updateLoanTokenParams : updateLoanTokenActionType; const s : lendingControllerStorageType) : loanTokenRecordType is 
block {

    var loanTokenRecord : loanTokenRecordType := getLoanTokenRecord(loanTokenName, s);

    loanTokenRecord.oracleAddress                        := updateLoanTokenParams.oracleAddress;
    loanTokenRecord.reserveRatio                         := updateLoanTokenParams.reserveRatio;
    loanTokenRecord.optimalUtilisationRate               := updateLoanTokenParams.optimalUtilisationRate;
    loanTokenRecord.baseInterestRate                     := updateLoanTokenParams.baseInterestRate;
    loanTokenRecord.maxInterestRate                      := updateLoanTokenParams.maxInterestRate;
    loanTokenRecord.interestRateBelowOptimalUtilisation  := updateLoanTokenParams.interestRateBelowOptimalUtilisation;
    loanTokenRecord.interestRateAboveOptimalUtilisation  := updateLoanTokenParams.interestRateAboveOptimalUtilisation;
    loanTokenRecord.minRepaymentAmount                   := updateLoanTokenParams.minRepaymentAmount;
    loanTokenRecord.isPaused                             := updateLoanTokenParams.isPaused;

} with loanTokenRecord



// helper function to create new collateral token record
function createCollateralTokenRecord(const createCollateralTokenParams : createCollateralTokenActionType) : collateralTokenRecordType is 
block {

    // init variables for convenience

    const tokenName             : string       = createCollateralTokenParams.tokenName;
    const tokenContractAddress  : address      = createCollateralTokenParams.tokenContractAddress;
    const tokenType             : tokenType    = createCollateralTokenParams.tokenType;
    const tokenDecimals         : nat          = createCollateralTokenParams.tokenDecimals;
    const oracleAddress         : address      = createCollateralTokenParams.oracleAddress;
    const protected             : bool         = createCollateralTokenParams.protected;
    
    const isScaledToken         : bool         = createCollateralTokenParams.isScaledToken;

    // To extend functionality beyond sMVN to other staked tokens in future
    const isStakedToken             : bool              = createCollateralTokenParams.isStakedToken;
    const stakingContractAddress   : option(address)    = createCollateralTokenParams.stakingContractAddress;
    
    const maxDepositAmount          : option(nat)       = createCollateralTokenParams.maxDepositAmount;

    const newCollateralTokenRecord : collateralTokenRecordType = record [
        tokenName               = tokenName;
        tokenContractAddress    = tokenContractAddress;
        tokenDecimals           = tokenDecimals;

        oracleAddress           = oracleAddress;
        protected               = protected;

        isScaledToken           = isScaledToken;
        isStakedToken           = isStakedToken;
        stakingContractAddress  = stakingContractAddress;

        totalDeposited          = 0n;
        maxDepositAmount        = maxDepositAmount;

        tokenType               = tokenType;

        isPaused                = False;
    ];

} with newCollateralTokenRecord



// helper function to get vault token collateral balance - fail if token not found
function getVaultTokenCollateralBalance(const vault : vaultRecordType; const tokenName : string) : nat is 
block {

    const vaultTokenCollateralBalance : nat = case vault.collateralBalanceLedger[tokenName] of [
            Some(_balance) -> _balance
        |   None           -> failwith(error_INSUFFICIENT_COLLATERAL_TOKEN_BALANCE_IN_VAULT)
    ];

} with vaultTokenCollateralBalance



// helper function to get vault token collateral balance - set to 0 if not found
function getOrSetVaultTokenCollateralBalance(const vault : vaultRecordType; const tokenName : string) : nat is 
block {

    const vaultTokenCollateralBalance : nat = case vault.collateralBalanceLedger[tokenName] of [
            Some(_balance) -> _balance
        |   None           -> 0n
    ];

} with vaultTokenCollateralBalance



// helper function to create new vault record
function createVaultRecord(const vaultAddress : address; const loanTokenName : string; const decimals : nat) : vaultRecordType is 
block {

    const vaultRecord : vaultRecordType = record [
                        
        address                     = vaultAddress;
        collateralBalanceLedger     = (map[] : collateralBalanceLedgerType); // init empty collateral balance ledger map
        loanToken                   = loanTokenName;

        loanOutstandingTotal        = 0n;
        loanPrincipalTotal          = 0n;
        loanInterestTotal           = 0n;
        loanDecimals                = decimals;
        borrowIndex                 = 0n;

        lastUpdatedBlockLevel       = Mavryk.get_level();
        lastUpdatedTimestamp        = Mavryk.get_now();

        markedForLiquidationLevel   = 0n;
        liquidationEndLevel         = 0n;
    ];
    
} with vaultRecord



// helper function to get collateral token record reference through on-chain views
function getCollateralTokenReference(const collateralTokenName : string; const s : lendingControllerStorageType) : collateralTokenRecordType is
block {

    const collateralTokenRecordOpt : option(collateralTokenRecordType) = getColTokenRecordByNameOpt(collateralTokenName, s);
    const collateralTokenRecord : collateralTokenRecordType = case collateralTokenRecordOpt of [
            Some(_record) -> _record
        |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ]

} with collateralTokenRecord



// helper function to get collateral token record 
function getCollateralTokenRecord(const collateralTokenName : string; const s : lendingControllerStorageType) : collateralTokenRecordType is
block {

    const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[collateralTokenName] of [
            Some(_record) -> _record
        |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ];

} with collateralTokenRecord



// helper function to verify collateral token is not paused
function verifyCollateralTokenIsNotPaused(const collateralTokenRecord : collateralTokenRecordType) : unit is 
block {

    if collateralTokenRecord.isPaused then failwith(error_COLLATERAL_TOKEN_IS_PAUSED) else skip;

} with unit



// helper function to check collateral token exists
function checkCollateralTokenExists(const collateralTokenName : string; const s : lendingControllerStorageType) : unit is 
block {

    const collateralTokenRecordOpt : option(collateralTokenRecordType) = getColTokenRecordByNameOpt(collateralTokenName, s);
    const collateralTokenExists : unit = case collateralTokenRecordOpt of [
            Some(_record) -> unit
        |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ]

} with collateralTokenExists



// helper function to verify that collateral token is staked token
function verifyCollateralTokenIsStakedToken(const collateralTokenRecord : collateralTokenRecordType) : unit is 
block {

    if collateralTokenRecord.isStakedToken = False then failwith(error_NOT_STAKED_TOKEN) else skip;

} with unit



function verifyMaxDepositAmountNotExceeded(const collateralTokenRecord : collateralTokenRecordType; const depositAmount : nat) : unit is
block {

    const maxDepositAmount : nat = case collateralTokenRecord.maxDepositAmount of [
            Some(_amount) -> _amount
        |   None          -> 0n
    ];

    if maxDepositAmount =/= 0n then {

        const totalDeposited     : nat = collateralTokenRecord.totalDeposited;
        const newTotalDeposited  : nat = totalDeposited + depositAmount;

        if newTotalDeposited > maxDepositAmount then failwith(error_MAX_DEPOSIT_AMOUNT_FOR_COLLATERAL_TOKEN_EXCEEDED) else skip;

    } else skip;

} with unit



// helper function to get loan token record reference through on-chain views
function getLoanTokenReference(const loanTokenName : string; const s : lendingControllerStorageType) : loanTokenRecordType is
block {

    const loanTokenRecordOpt : option(loanTokenRecordType) = getLoanTokenRecordOpt(loanTokenName, s);
    const loanTokenRecord : loanTokenRecordType = case loanTokenRecordOpt of [
            Some(_record) -> _record
        |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
    ];

} with loanTokenRecord



// helper function to verify loan token is not paused
function verifyLoanTokenIsNotPaused(const loanTokenRecord : loanTokenRecordType) : unit is 
block {

    if loanTokenRecord.isPaused then failwith(error_LOAN_TOKEN_IS_PAUSED) else skip;

} with unit



// helper function to get vault by vaultHandle
function getVaultByHandle(const handle : vaultHandleType; const s : lendingControllerStorageType) : vaultRecordType is 
block {

    var vault : vaultRecordType := case s.vaults[handle] of [
            Some(_vault) -> _vault
        |   None -> failwith(error_VAULT_CONTRACT_NOT_FOUND)
    ];

} with vault



// helper function to make vault handle
function makeVaultHandle(const vaultId : nat; const vaultOwner : address) : vaultHandleType is 
block {

    const vaultHandle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

} with vaultHandle



// helper function to get owner vault set
function getOwnerVaultSet(const vaultOwner : address; const s : lendingControllerStorageType) : ownerVaultSetType is 
block {

    const ownerVaultSet : ownerVaultSetType = case s.ownerLedger[vaultOwner] of [
            Some (_set) -> _set
        |   None        -> failwith(error_OWNER_VAULT_SET_DOES_NOT_EXIST)
    ];

} with ownerVaultSet



// helper function to get or create owner vault set
function getOrCreateOwnerVaultSet(const vaultOwner : address; const s : lendingControllerStorageType) : ownerVaultSetType is 
block {

    const ownerVaultSet : ownerVaultSetType = case s.ownerLedger[vaultOwner] of [
            Some (_set) -> _set
        |   None        -> set []
    ];

} with ownerVaultSet



// helper function to get staking contract address
function getStakingContractAddress(const optionAddress : option(address)) : address is
block {

    const stakingContractAddress : address = case optionAddress of [
            Some(_address) -> _address
        |   None           -> failwith(error_STAKING_CONTRACT_ADDRESS_FOR_STAKED_TOKEN_NOT_FOUND)
    ];

} with stakingContractAddress



// helper function for transfers related to token pool (from/to)
function tokenPoolTransfer(const from_ : address; const to_ : address; const amount : nat; const token : tokenType) : operation is
block {

    const tokenPoolTransferOperation : operation = case token of [
        
        |   Mav(_mav) -> {

                const transferMavOperation : operation = transferMav( (Mavryk.get_contract_with_error(to_, "Error. Unable to send mav.") : contract(unit)), amount * 1mumav );
            
            } with transferMavOperation

        |   Fa12(_token) -> {

                verifyNoAmountSent(Unit);

                const transferFa12Operation : operation = transferFa12Token(
                    from_,                      // from_
                    to_,                        // to_
                    amount,                     // token amount
                    _token                      // token contract address
                );

            } with transferFa12Operation

        |   Fa2(_token) -> {

                verifyNoAmountSent(Unit);

                const transferFa2Operation : operation = transferFa2Token(
                    from_,                          // from_
                    to_,                            // to_
                    amount,                         // token amount
                    _token.tokenId,                 // token id
                    _token.tokenContractAddress     // token contract address
                );

            } with transferFa2Operation
    ];

} with tokenPoolTransferOperation



// helper function withdraw staked token (e.g. sMVN) from vault through the staking contract (e.g. Doorman Contract) - call %onVaultWithdrawStake in Doorman Contract
function onWithdrawStakedTokenFromVaultOperation(const vaultOwner : address; const vaultAddress : address; const withdrawAmount : nat; const stakingContractAddress : address) : operation is
block {

    // Create operation to staking contract to withdraw staked token (e.g. sMVN) from vault to user
    const onVaultWithdrawStakeParams : onVaultWithdrawStakeType = record [
        vaultOwner      = vaultOwner;
        vaultAddress    = vaultAddress;
        withdrawAmount  = withdrawAmount;
    ];

    const vaultWithdrawStakeOperation : operation = Mavryk.transaction(
        onVaultWithdrawStakeParams,
        0mav,
        getOnVaultWithdrawStakeEntrypoint(stakingContractAddress)
    );

} with vaultWithdrawStakeOperation



// helper function deposit staked token (e.g. sMVN) from vault through the staking contract (e.g. Doorman Contract) - call %onVaultDepositStake in Doorman Contract
function onDepositStakedTokenToVaultOperation(const vaultOwner : address; const vaultAddress : address; const depositAmount : nat; const stakingContractAddress : address) : operation is
block {

    // Create operation to staking contract to deposit staked token (e.g. sMVN) from user to vault
    const onVaultDepositStakeParams : onVaultDepositStakeType = record [
        vaultOwner      = vaultOwner;
        vaultAddress    = vaultAddress;
        depositAmount   = depositAmount;
    ];

    const vaultDepositStakeOperation : operation = Mavryk.transaction(
        onVaultDepositStakeParams,
        0mav,
        getOnVaultDepositStakeEntrypoint(stakingContractAddress)
    );

} with vaultDepositStakeOperation



// // helper function liquidate staked token (e.g. sMVN) from vault through the staking contract (e.g. Doorman Contract) - call %onVaultLiquidateStake in Doorman Contract
// function onLiquidateStakedTokenFromVaultOperation(const vaultAddress : address; const liquidator : address; const liquidatedAmount : nat; const stakingContractAddress : address) : operation is
// block {

//     // Create operation to staking contract to liquidate staked token (e.g. sMVN) from vault to liquidator
//     const onVaultLiquidateStakeParams : onVaultLiquidateStakeType = record [
//         vaultAddress        = vaultAddress;
//         liquidator          = liquidator;
//         liquidatedAmount    = liquidatedAmount;
//     ];

//     const vaultLiquidateStakeOperation : operation = Mavryk.transaction(
//         onVaultLiquidateStakeParams,
//         0mav,
//         getOnVaultLiquidateStakeEntrypoint(stakingContractAddress)
//     );

// } with vaultLiquidateStakeOperation


// helper function liquidate staked token (e.g. sMVN) from vault through the staking contract (e.g. Doorman Contract) - call %onVaultLiquidateStake in Doorman Contract
function onLiquidateStakedTokenFromVaultOperation(const onVaultLiquidateStakeListParams : onVaultLiquidateStakeType; const stakingContractAddress : address) : operation is
block {

    const vaultLiquidateStakeOperation : operation = Mavryk.transaction(
        onVaultLiquidateStakeListParams,
        0mav,
        getOnVaultLiquidateStakeEntrypoint(stakingContractAddress)
    );

} with vaultLiquidateStakeOperation



// helper function liquidate collateral from vault - call %onLiquidate in a specified Vault Contract
// function liquidateFromVaultOperation(const receiver : address; const tokenName : string; const amount : nat; const vaultAddress : address) : operation is
// block {

//     const liquidateOperationParams : initVaultActionType = OnLiquidate(
//         record[
//             receiver   = receiver;
//             amount     = amount;
//             tokenName  = tokenName;
//         ]
//     );

//     const liquidateFromVaultOperation : operation = Mavryk.transaction(
//         liquidateOperationParams,
//         0mumav,
//         getInitVaultActionEntrypoint(vaultAddress)
//     );

// } with liquidateFromVaultOperation



// helper function liquidate collateral from vault - call %onLiquidate in a specified Vault Contract
function liquidateFromVaultOperation(const onLiquidateList : onLiquidateListType; const vaultAddress : address) : operation is
block {

    const liquidateOperationParams : initVaultActionType = OnLiquidate(onLiquidateList);

    const liquidateFromVaultOperation : operation = Mavryk.transaction(
        liquidateOperationParams,
        0mav,
        getInitVaultActionEntrypoint(vaultAddress)
    );

} with liquidateFromVaultOperation



// helper function to rebase token decimals
function rebaseTokenValue(const tokenValueRaw : nat; const rebaseDecimals : nat) : nat is 
block {

    var tokenValueRebased : nat := tokenValueRaw;

    if rebaseDecimals = 0n then 
        skip
    else if rebaseDecimals = 1n then 
        tokenValueRebased := tokenValueRebased * 10n
    else if rebaseDecimals = 2n then 
        tokenValueRebased := tokenValueRebased * 100n 
    else if rebaseDecimals = 3n then 
        tokenValueRebased := tokenValueRebased * 1000n 
    else if rebaseDecimals = 4n then 
        tokenValueRebased := tokenValueRebased * fpa10e4  
    else if rebaseDecimals = 5n then 
        tokenValueRebased := tokenValueRebased * fpa10e5
    else if rebaseDecimals = 6n then 
        tokenValueRebased := tokenValueRebased * fpa10e6
    else if rebaseDecimals = 7n then 
        tokenValueRebased := tokenValueRebased * fpa10e7
    else if rebaseDecimals = 8n then 
        tokenValueRebased := tokenValueRebased * fpa10e8
    else if rebaseDecimals = 9n then 
        tokenValueRebased := tokenValueRebased * fpa10e9
    else if rebaseDecimals = 10n then 
        tokenValueRebased := tokenValueRebased * fpa10e10
    else if rebaseDecimals = 11n then 
        tokenValueRebased := tokenValueRebased * fpa10e11
    else if rebaseDecimals = 12n then 
        tokenValueRebased := tokenValueRebased * fpa10e12
    else if rebaseDecimals = 13n then 
        tokenValueRebased := tokenValueRebased * fpa10e13
    else if rebaseDecimals = 14n then 
        tokenValueRebased := tokenValueRebased * fpa10e14
    else if rebaseDecimals = 15n then 
        tokenValueRebased := tokenValueRebased * fpa10e15
    else if rebaseDecimals = 16n then 
        tokenValueRebased := tokenValueRebased * fpa10e16
    else if rebaseDecimals = 17n then 
        tokenValueRebased := tokenValueRebased * fpa10e17
    else if rebaseDecimals = 18n then 
        tokenValueRebased := tokenValueRebased * fpa10e18
    else if rebaseDecimals = 19n then 
        tokenValueRebased := tokenValueRebased * fpa10e19
    else if rebaseDecimals = 20n then 
        tokenValueRebased := tokenValueRebased * fpa10e20
    else if rebaseDecimals = 21n then 
        tokenValueRebased := tokenValueRebased * fpa10e21
    else if rebaseDecimals = 22n then 
        tokenValueRebased := tokenValueRebased * fpa10e22
    else if rebaseDecimals = 23n then 
        tokenValueRebased := tokenValueRebased * fpa10e23
    else if rebaseDecimals = 24n then 
        tokenValueRebased := tokenValueRebased * fpa10e24
    else if rebaseDecimals = 25n then 
        tokenValueRebased := tokenValueRebased * fpa10e25
    else if rebaseDecimals = 26n then 
        tokenValueRebased := tokenValueRebased * fpa10e26
    else failwith(error_REBASE_DECIMALS_OUT_OF_BOUNDS);    

} with tokenValueRebased



// helper function to get token last completed data from aggregator
function getTokenLastCompletedDataFromAggregator(const aggregatorAddress : address) : lastCompletedDataReturnType is 
block {

    // get last completed round price of token from Oracle view
    const getTokenLastCompletedDataView : option (lastCompletedDataReturnType) = Mavryk.call_view ("getLastCompletedData", unit, aggregatorAddress);
    const tokenLastCompletedData : lastCompletedDataReturnType = case getTokenLastCompletedDataView of [
            Some (_value) -> _value
        |   None          -> failwith (error_GET_LAST_COMPLETED_DATA_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND)
    ];

} with tokenLastCompletedData



function verifyLastCompletedDataFreshness(const lastUpdatedAt : timestamp; const lastCompletedDataMaxDelay : nat) : unit is
block {

    if abs(Mavryk.get_now() - lastUpdatedAt) <= lastCompletedDataMaxDelay 
    then skip
    else failwith(error_LAST_COMPLETED_DATA_NOT_FRESH);

} with unit



// helper function to calculate collateral token value rebased (to max decimals 1e32)
function calculateCollateralTokenValueRebased(const collateralTokenName : string; const tokenBalance : nat; const s : lendingControllerStorageType) : nat is 
block {

    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation; // default 32 decimals i.e. 1e32

    // get collateral token reference using on-chain views
    const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(collateralTokenName, s);

    // get last completed round price of token from Aggregator view
    // todo: for mToken, aggregator could be set to pegged token to reduce the need to have another aggregator
    const collateralTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(collateralTokenRecord.oracleAddress);
    
    // check for freshness of last completed data
    verifyLastCompletedDataFreshness(collateralTokenLastCompletedData.lastUpdatedAt, s.config.lastCompletedDataMaxDelay);

    const tokenDecimals    : nat  = collateralTokenRecord.tokenDecimals; 
    const priceDecimals    : nat  = collateralTokenLastCompletedData.decimals;
    const tokenPrice       : nat  = collateralTokenLastCompletedData.data;            

    // calculate required number of decimals to rebase each token to the same unit for comparison
    // assuming most token decimals are 6, and most price decimals from oracle is 8 - (upper limit of 32 decimals)
    if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
    const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

    // calculate raw value of collateral balance
    const tokenValueRaw : nat = tokenBalance * tokenPrice;

    // rebase token value to 1e32 (or 10^32)
    const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);                

} with tokenValueRebased



// helper function to calculate loan token value rebased (to max decimals 1e32)
function calculateLoanTokenValueRebased(const loanTokenName : string; const tokenBalance : nat; const s : lendingControllerStorageType) : nat is 
block {

    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation; // default 32 decimals i.e. 1e32

    // get loan token record reference using on-chain views
    const loanTokenRecord : loanTokenRecordType = getLoanTokenReference(loanTokenName, s);

    // get last completed round price of token from Oracle view
    const loanTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(loanTokenRecord.oracleAddress);
    
    const tokenDecimals    : nat  = loanTokenRecord.tokenDecimals; 
    const priceDecimals    : nat  = loanTokenLastCompletedData.decimals;
    const tokenPrice       : nat  = loanTokenLastCompletedData.data;            

    // calculate required number of decimals to rebase each token to the same unit for comparison
    // assuming most token decimals are 6, and most price decimals from oracle is 8 - (upper limit of 32 decimals)
    if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
    const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

    // calculate raw value of collateral balance
    const tokenValueRaw : nat = tokenBalance * tokenPrice;

    // rebase token value to 1e32 (or 10^32)
    const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);                

} with tokenValueRebased



// helper function to calculate loan token value (without rebasing)
function calculateLoanTokenValue(const loanTokenName : string; const tokenBalance : nat; const s : lendingControllerStorageType) : nat is 
block {

    // get loan token record reference using on-chain views
    const loanTokenRecord : loanTokenRecordType = getLoanTokenReference(loanTokenName, s);

    // get last completed round price of token from Oracle view
    const loanTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(loanTokenRecord.oracleAddress);
    const tokenPrice       : nat  = loanTokenLastCompletedData.data;            

    // calculate raw value of collateral balance
    const tokenValueRaw : nat = tokenBalance * tokenPrice;

} with tokenValueRaw



// helper function for simple multiplication of token amount by price
function multiplyTokenAmountByPrice(const tokenAmount : nat; const tokenPrice : nat) : nat is tokenAmount * tokenPrice



// helper function to calculate vault's collateral value rebased (to max decimals 1e32)
function calculateVaultCollateralValueRebased(const vaultAddress : address; const collateralBalanceLedger : collateralBalanceLedgerType; const s : lendingControllerStorageType) : nat is
block {

    var vaultCollateralValueRebased  : nat := 0n;

    for collateralTokenName -> collateralTokenBalance in map collateralBalanceLedger block {

        // init final token balance
        var finalTokenBalance  : nat := collateralTokenBalance;

        // get collateral token reference using on-chain views
        const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(collateralTokenName, s);

        // check if collateral token is a staked Token (e.g. sMVN) or a scaled token (e.g. mToken) - get balance from doorman contract and token contract address respectively
        if collateralTokenRecord.isStakedToken then {

            const stakingContractAddress : address = case collateralTokenRecord.stakingContractAddress of [
                    Some(_address) -> _address
                |   None           -> failwith(error_STAKING_CONTRACT_ADDRESS_FOR_STAKED_TOKEN_NOT_FOUND)
            ];
            finalTokenBalance := getBalanceFromStakingContract(vaultAddress, stakingContractAddress);

        } else if collateralTokenRecord.isScaledToken then {

            // get updated scaled token balance (e.g. mToken)
            finalTokenBalance := getBalanceFromScaledTokenContract(vaultAddress, collateralTokenRecord.tokenContractAddress);
        
        } else skip;

        // get collateral token value based on oracle/aggregator's price and rebase to 1e32 (or 10^32) for comparison
        const tokenValueRebased : nat = calculateCollateralTokenValueRebased(collateralTokenName, finalTokenBalance, s);

        // increment vault collateral value (decimals: 1e32 or 10^32)
        vaultCollateralValueRebased := vaultCollateralValueRebased + tokenValueRebased;      

    };

} with vaultCollateralValueRebased



// helper function to check if vault is under collaterized
function isUnderCollaterized(const vault : vaultRecordType; var s : lendingControllerStorageType) : (bool * lendingControllerStorageType) is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    const loanOutstandingTotal       : nat    = vault.loanOutstandingTotal;    
    const loanTokenName              : string = vault.loanToken;
    const collateralRatio            : nat    = s.config.collateralRatio;  // default 3000n: i.e. 3x - 2.25x - 2250

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.address, vault.collateralBalanceLedger, s);

    // calculate loan outstanding value rebased
    const loanOutstandingRebased : nat = calculateLoanTokenValueRebased(loanTokenName, loanOutstandingTotal, s);

    // check is vault is under collaterized based on collateral ratio
    const isUnderCollaterized : bool = vaultCollateralValueRebased < (collateralRatio * loanOutstandingRebased) / 1000n;

} with (isUnderCollaterized, s)



// helper function to check if vault is liquidatable
function isLiquidatable(const vault : vaultRecordType; var s : lendingControllerStorageType) : bool is 
block {
    
    // initialise variables - vaultCollateralValue and loanOutstanding
    const loanOutstandingTotal       : nat    = vault.loanOutstandingTotal;    
    const loanTokenName              : string = vault.loanToken;
    const liquidationRatio           : nat    = s.config.liquidationRatio;  // default 3000n: i.e. 3x - 2.25x - 2250

    // calculate vault collateral value rebased (1e32 or 10^32)
    const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.address, vault.collateralBalanceLedger, s);

    // calculate loan outstanding value rebased
    const loanOutstandingRebased : nat = calculateLoanTokenValueRebased(loanTokenName, loanOutstandingTotal, s);
    
    // check is vault is liquidatable based on liquidation ratio
    const isLiquidatable : bool = vaultCollateralValueRebased < (liquidationRatio * loanOutstandingRebased) / 1000n;

} with isLiquidatable

// ------------------------------------------------------------------------------
// Contract Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to calculate compounded interest
function calculateCompoundedInterest(const interestRate : nat; const lastUpdatedBlockLevel : nat; var s : lendingControllerStorageType) : nat is
block{

    (* From AAVE:
    *
    * To avoid expensive exponentiation, the calculation is performed using a binomial approximation:
    *
    *  (1+x)^n = 1+n*x + [n/2*(n-1)]*x^2 + [n/6*(n-1)*(n-2)*x^3 ...
    *
    *  The approximation slightly underpays liquidity providers and undercharges borrowers, with the advantage of great
    *  gas cost reductions. The whitepaper contains reference to the approximation and a table showing the margin of
    *  error per different time periods
    *
    *)

    // mock level for time tests (instead of using Mavryk.get_level())
    const mockLevel : nat    = s.config.mockLevel;

    var exp : nat := abs(mockLevel - lastUpdatedBlockLevel); // exponent
    exp := exp * Mavryk.get_min_block_time(); // number of seconds
    
    const interestRateOverSecondsInYear : nat = ((interestRate * fixedPointAccuracy) / secondsInYear) / fixedPointAccuracy; // 1e27 * 1e27 / const / 1e27 -> 1e27

    var compoundedInterest : nat := 0n;

    if exp > 0n then {

        const expMinusOne : nat = abs(exp - 1n);
        const expMinusTwo : nat = if exp > 2n then abs(exp - 2n) else 0n;

        const basePowerTwo : nat = ((interestRateOverSecondsInYear * interestRateOverSecondsInYear) / fixedPointAccuracy) / (secondsInYear * secondsInYear); 
        const basePowerThree : nat = ((basePowerTwo * interestRateOverSecondsInYear) / fixedPointAccuracy) / secondsInYear;

        const secondTerm : nat = (exp * expMinusOne * basePowerTwo) / 2n;
        const thirdTerm : nat = (exp * expMinusOne * expMinusTwo * basePowerThree) / 6n;

        compoundedInterest := fixedPointAccuracy + (interestRateOverSecondsInYear * exp) + secondTerm + thirdTerm;

    } else skip;
   
} with (compoundedInterest)



// helper function to update token state
// - updates last updated block level and borrow index
function updateLoanTokenState(var loanTokenRecord : loanTokenRecordType; var s : lendingControllerStorageType) : loanTokenRecordType is
block{
    
    const tokenPoolTotal            : nat    = loanTokenRecord.tokenPoolTotal;             // 1e6
    const totalBorrowed             : nat    = loanTokenRecord.totalBorrowed;              // 1e6
    const optimalUtilisationRate    : nat    = loanTokenRecord.optimalUtilisationRate;     // 1e27
    const lastUpdatedBlockLevel     : nat    = loanTokenRecord.lastUpdatedBlockLevel;
    const maxInterestRate           : nat    = loanTokenRecord.maxInterestRate;
    
    const baseInterestRate                      : nat = loanTokenRecord.baseInterestRate;                    // r0 - 1e27
    const interestRateBelowOptimalUtilisation   : nat = loanTokenRecord.interestRateBelowOptimalUtilisation; // r1 - 1e27
    const interestRateAboveOptimalUtilisation   : nat = loanTokenRecord.interestRateAboveOptimalUtilisation; // r2 - 1e27

    var borrowIndex                 : nat := loanTokenRecord.borrowIndex;
    var currentInterestRate         : nat := loanTokenRecord.currentInterestRate;

    // mock level for time tests (instead of using Mavryk.get_level())
    const mockLevel                 : nat    = s.config.mockLevel;

    if tokenPoolTotal > 0n then {
        // calculate utilisation rate - total debt borrowed / token pool total
        const utilisationRate : nat = (totalBorrowed * fixedPointAccuracy) / tokenPoolTotal;  // utilisation rate, or ratio of debt to total amount -> (1e6 * 1e27 / 1e6) -> 1e27

        // if total borrowed is greater than 0
        if totalBorrowed > 0n then {

            // Calculations based on AAVE's variable borrow rate calculation: https://github.com/aave/aave-protocol/blob/master/docs/Aave_Protocol_Whitepaper_v1_0.pdf

            if utilisationRate > optimalUtilisationRate then {

                // utilisation rate is above optimal rate

                const firstTerm : nat = baseInterestRate;                       // 1e27
                const secondTerm : nat = interestRateBelowOptimalUtilisation;   // 1e27
                
                const utilisationRateLessOptimalRate : nat = abs(utilisationRate - optimalUtilisationRate);       // 1e27 (from above)
                const coefficientDenominator : nat = abs(fixedPointAccuracy - optimalUtilisationRate);            // 1e27 - 1e27 -> 1e27
                const thirdTerm : nat = (((utilisationRateLessOptimalRate * fixedPointAccuracy) / coefficientDenominator) * interestRateAboveOptimalUtilisation) / fixedPointAccuracy; // ( ((1e27 * 1e27) / 1e27) * 1e27) / 1e27 -> 1e27

                currentInterestRate := firstTerm + secondTerm + thirdTerm;

            } else {

                // utilisation rate is below optimal rate

                const firstTerm : nat = baseInterestRate; // 1e27

                const secondTermCoefficient : nat = (utilisationRate * fixedPointAccuracy) / optimalUtilisationRate;            // 1e27 * 1e27 / 1e27 -> 1e27
                const secondTerm : nat = (secondTermCoefficient * interestRateBelowOptimalUtilisation) / fixedPointAccuracy;    // 1e27 * 1e27 / 1e27 -> 1e27

                currentInterestRate := firstTerm + secondTerm; 

            };

        } else skip;

        // check if max interest rate is exceeded
        if currentInterestRate > maxInterestRate then currentInterestRate := maxInterestRate else skip;

        if mockLevel > lastUpdatedBlockLevel or Mavryk.get_level() > lastUpdatedBlockLevel then {

            const compoundedInterest : nat = calculateCompoundedInterest(currentInterestRate, lastUpdatedBlockLevel, s); // 1e27 
            borrowIndex := (borrowIndex * compoundedInterest) / fixedPointAccuracy; // 1e27 x 1e27 / 1e27 -> 1e27

        } else skip;

        loanTokenRecord.lastUpdatedBlockLevel   := mockLevel + Mavryk.get_level();
        loanTokenRecord.borrowIndex             := borrowIndex;
        loanTokenRecord.utilisationRate         := utilisationRate;
        loanTokenRecord.currentInterestRate     := currentInterestRate;
    } else skip;

} with loanTokenRecord



// accrue interest to vault
function accrueInterestToVault(const currentLoanOutstandingTotal : nat; const vaultBorrowIndex : nat; const tokenBorrowIndex : nat) : nat is 
block {

    // init new loan outstanding total
    var newLoanOutstandingTotal : nat := currentLoanOutstandingTotal;

    if currentLoanOutstandingTotal > 0n then block {

        if vaultBorrowIndex =/= 0n
        then newLoanOutstandingTotal := (currentLoanOutstandingTotal * tokenBorrowIndex) / vaultBorrowIndex  // 1e6 * 1e27 / 1e27 -> 1e6
        else skip;

    } else skip;

} with newLoanOutstandingTotal

// ------------------------------------------------------------------------------
// Token Pool Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Liquidate Vault Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check correct duration has passed after being marked for liquidation
function checkMarkedVaultLiquidationDuration(const vault : vaultRecordType; const s : lendingControllerStorageType) : unit is
block {

    // Init variables and get level when vault can be liquidated
    const blocksPerMinute                : nat  = 60n / Mavryk.get_min_block_time();
    const liquidationDelayInMins         : nat  = s.config.liquidationDelayInMins;
    const liquidationDelayInBlockLevel   : nat  = liquidationDelayInMins * blocksPerMinute; 
    const levelWhenVaultCanBeLiquidated  : nat  = vault.markedForLiquidationLevel + liquidationDelayInBlockLevel;
    const mockLevel                      : nat  = s.config.mockLevel;

    // Check if sufficient time has passed since vault was marked for liquidation
    if mockLevel < levelWhenVaultCanBeLiquidated
    then failwith(error_VAULT_IS_NOT_READY_TO_BE_LIQUIDATED)
    else skip;

} with (unit)



// helper function to check that vault is still within window of opportunity for liquidation to occur
function checkVaultInLiquidationWindow(const vault : vaultRecordType; const s : lendingControllerStorageType) : unit is
block {

    // Get level when vault can no longer be liquidated 
    const vaultLiquidationEndLevel : nat = vault.liquidationEndLevel;
    const mockLevel                : nat  = s.config.mockLevel;

    // Check if current block level has exceeded vault liquidation end level
    if mockLevel > vaultLiquidationEndLevel
    then failwith(error_VAULT_NEEDS_TO_BE_MARKED_FOR_LIQUIDATION_AGAIN)
    else skip;

} with (unit)



// helper function to calculate the ratio used in the collateral token amount receive calculation
function calculateCollateralPriceAdjustmentRatio(const loanToken : (nat*nat); const collateralToken : (nat*nat)) : nat is
block {

    // Init variables
    const loanTokenDecimals                     : nat = loanToken.0;
    const loanTokenPriceDecimals                : nat = loanToken.1;
    const tokenDecimals                         : nat = collateralToken.0;
    const priceDecimals                         : nat = collateralToken.1;

    // calculate exponents
    const tokenDecimalsMultiplyExponent         : nat = if tokenDecimals > loanTokenDecimals then abs(tokenDecimals - loanTokenDecimals) else 0n;
    const tokenDecimalsDivideExponent           : nat = if tokenDecimals < loanTokenDecimals then abs(loanTokenDecimals - tokenDecimals) else 0n;
    
    const priceTokenDecimalsMultiplyExponent    : nat = if priceDecimals > loanTokenPriceDecimals then abs(priceDecimals - loanTokenPriceDecimals) else 0n;
    const priceTokenDecimalsDivideExponent      : nat = if priceDecimals < loanTokenPriceDecimals then abs(loanTokenPriceDecimals - priceDecimals) else 0n;

    // multiple exponents by 10^exp
    // e.g. if tokenDecimalsMultiplyExponent is 3, then tokenDecimalsMultiplyDifference = 1 * 1000 = 1000;
    const tokenDecimalsMultiplyDifference       : nat = rebaseTokenValue(1n, tokenDecimalsMultiplyExponent);
    const tokenDecimalsDivideDifference         : nat = rebaseTokenValue(1n, tokenDecimalsDivideExponent);
    
    const priceTokenDecimalsMultiplyDifference  : nat = rebaseTokenValue(1n, priceTokenDecimalsMultiplyExponent);
    const priceTokenDecimalsDivideDifference    : nat = rebaseTokenValue(1n, priceTokenDecimalsDivideExponent);
    
    // ratio used in liquidator and treasury token amount calculation
    const collateralTokenPriceAdjustmentRatio   : nat = (tokenDecimalsMultiplyDifference * priceTokenDecimalsMultiplyDifference) / (tokenDecimalsDivideDifference * priceTokenDecimalsDivideDifference);

} with (collateralTokenPriceAdjustmentRatio)



// helper function to calculate the collateral token proportion received during a liquidation
function calculateCollateralTokenProportion(const collateralToken : collateralTokenRecordType; const collateralTokenLastCompletedData : lastCompletedDataReturnType; const collateralTokenBalance : nat; const vaultCollateralValueRebased : nat; const s : lendingControllerStorageType) : nat is
block {

    const maxDecimalsForCalculation  : nat  = s.config.maxDecimalsForCalculation; // default 32 decimals i.e. 1e32
    
    const tokenDecimals             : nat  = collateralToken.tokenDecimals; 
    const priceDecimals             : nat  = collateralTokenLastCompletedData.decimals;
    const tokenPrice                : nat  = collateralTokenLastCompletedData.data;

    // Calculate required number of decimals to rebase each token to the same unit for comparison                        
    if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
    const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

    // Calculate raw value of collateral balance
    const tokenValueRaw : nat = collateralTokenBalance * tokenPrice;

    // rebase token value to 1e32 (or 10^32)
    const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);

    // get proportion of collateral token balance against total vault's collateral value
    const tokenProportion : nat = (tokenValueRebased * fixedPointAccuracy) / vaultCollateralValueRebased;

} with (tokenProportion)



// helper function to calculate the collateral token amount received during a liquidation
function calculateCollateralAmountReceived(const loanTokenPrice : nat; const tokenPrice : nat; const tokenProportion : nat; const collateralTokenPriceAdjustmentRatio : nat; const liquidationFeeAmount : nat) : nat is
block {

    // get value to be extracted and sent to liquidator (1e27 * token decimals e.g. 1e6 => 1e33)
    const tokenProportionalAmount           : nat = tokenProportion * liquidationFeeAmount;

    // multiply amount by loan token price - with on chain view to get loan token price from aggregator
    const tokenProportionalValue            : nat = multiplyTokenAmountByPrice(tokenProportionalAmount, loanTokenPrice);

    // adjust value by token decimals difference - no change if all decimals are the same (e.g. value * 1 * 1 / (1 * 1) )
    const tokenProportionalValueAdjusted    : nat = tokenProportionalValue * collateralTokenPriceAdjustmentRatio;

    // get quantity of tokens to be liquidated (final decimals should equal collateral token decimals)
    const tokenQuantityTotal                : nat = (tokenProportionalValueAdjusted / tokenPrice) / fixedPointAccuracy;

} with (tokenQuantityTotal)



// helper function to process transfer operations for the one collateral token
// function processLiquidationCollateralTransferOperations(
//     const collateralToken : collateralTokenRecordType; 
//     const vaultAddress : address; 
//     const liquidator : (address*nat); 
//     const treasury : (address*nat); 
//     var operations : list(operation)
// ) : list(operation) is
// block {

//     // Init variables
//     const collateralTokenName   : string      = collateralToken.tokenName;
//     const liquidatorAddress     : address     = liquidator.0;
//     const liquidatorTokenAmount : nat         = liquidator.1;
//     const treasuryAddress       : address     = treasury.0;
//     const treasuryTokenAmount   : nat         = treasury.1;

//     // Transfer operations
//     if collateralTokenName = "smvn" then {

//         // use %onVaultLiquidateStake entrypoint in Doorman Contract to transfer staked token balances

//         // get staking contract address
//         const stakingContractAddress : address = case collateralToken.stakingContractAddress of [
//                 Some(_address) -> _address
//             |   None           -> failwith(error_STAKING_CONTRACT_ADDRESS_FOR_STAKED_TOKEN_NOT_FOUND)
//         ];

//         // send staked token from vault to liquidator
//         const sendStakedTokenFromVaultToLiquidatorOperation : operation = onLiquidateStakedTokenFromVaultOperation(
//             vaultAddress,                       // vault address
//             liquidatorAddress,                  // liquidator              
//             liquidatorTokenAmount,              // liquidated amount
//             stakingContractAddress              // staking contract address
//         );                

//         operations := sendStakedTokenFromVaultToLiquidatorOperation # operations;

//         // send staked token from vault to treasury
//         const sendStakedTokenFromVaultToTreasuryOperation : operation = onLiquidateStakedTokenFromVaultOperation(
//             vaultAddress,                       // vault address
//             treasuryAddress,                    // liquidator              
//             treasuryTokenAmount,                // liquidated amount
//             stakingContractAddress              // staking contract address
//         );                

//         operations := sendStakedTokenFromVaultToTreasuryOperation # operations;

//     } else {

//         // use standard token transfer operations

//         // send tokens from vault to liquidator
//         const sendTokensFromVaultToLiquidatorOperation : operation = liquidateFromVaultOperation(
//             liquidatorAddress,                  // receiver (i.e. to_)
//             collateralTokenName,                // token name
//             liquidatorTokenAmount,              // token amount to be withdrawn
//             vaultAddress                        // vault address
//         );
//         operations := sendTokensFromVaultToLiquidatorOperation # operations;

//         // send tokens from vault to treasury
//         const sendTokensFromVaultToTreasuryOperation : operation = liquidateFromVaultOperation(
//             treasuryAddress,                    // receiver (i.e. to_)
//             collateralTokenName,                // token name
//             treasuryTokenAmount,                // token amount to be withdrawn
//             vaultAddress                        // vault address
//         );
//         operations := sendTokensFromVaultToTreasuryOperation # operations;

//     };

// } with(operations)


function processLiquidationCollateralTokenTransferRecord(
    const collateralToken : collateralTokenRecordType; 
    const liquidator : (address * nat); 
    const treasury : (address * nat); 
    var onLiquidateList : onLiquidateListType
) : onLiquidateListType is
block {

    // Init variables
    const collateralTokenName   : string      = collateralToken.tokenName;
    const liquidatorAddress     : address     = liquidator.0;
    const liquidatorTokenAmount : nat         = liquidator.1;
    const treasuryAddress       : address     = treasury.0;
    const treasuryTokenAmount   : nat         = treasury.1;

    if liquidatorTokenAmount > 0n then {
        // send tokens from vault to liquidator
        const liquidateTokenToLiquidatorRecordParams : onLiquidateSingleType = record [
            receiver   = liquidatorAddress;
            amount     = liquidatorTokenAmount;
            tokenName  = collateralTokenName;
        ];
        onLiquidateList := liquidateTokenToLiquidatorRecordParams # onLiquidateList;
    };

    if treasuryTokenAmount > 0n then {
        // send tokens from vault to treasury
        const liquidateTokenToTreasuryRecordParams : onLiquidateSingleType = record [
            receiver   = treasuryAddress;
            amount     = treasuryTokenAmount;
            tokenName  = collateralTokenName;
        ];
        onLiquidateList := liquidateTokenToTreasuryRecordParams # onLiquidateList;
    };

} with (onLiquidateList)



// helper function to process transfer record for collateral token
function processLiquidationCollateralStakedTokenTransferOperations(
    const collateralToken : collateralTokenRecordType; 
    const vaultAddress : address; 
    const liquidator : (address * nat); 
    const treasury : (address * nat); 
    var operations : list(operation)
) : list(operation) is
block {

    // Init variables
    // const collateralTokenName   : string      = collateralToken.tokenName;
    const liquidatorAddress     : address     = liquidator.0;
    const liquidatorTokenAmount : nat         = liquidator.1;
    const treasuryAddress       : address     = treasury.0;
    const treasuryTokenAmount   : nat         = treasury.1;

    // Transfer operations
    if collateralToken.isStakedToken then {

        // use %onVaultLiquidateStake entrypoint in Staking Contract (e.g. Doorman) to transfer staked token (e.g. sMvn) balances
        
        // get staking contract address
        const stakingContractAddress : address = case collateralToken.stakingContractAddress of [
                Some(_address) -> _address
            |   None           -> failwith(error_STAKING_CONTRACT_ADDRESS_FOR_STAKED_TOKEN_NOT_FOUND)
        ];

        
        var liquidationList : onVaultLiquidateStakeType := list[]; 

        if liquidatorTokenAmount > 0n then {
            const sendStakedTokenFromVaultToLiquidatoRecord : onVaultLiquidateStakeSingleType = record [
                vaultAddress      = vaultAddress;
                liquidator        = liquidatorAddress;
                liquidatedAmount  = liquidatorTokenAmount;
            ];

            liquidationList := sendStakedTokenFromVaultToLiquidatoRecord # liquidationList;
        };

        if liquidatorTokenAmount > 0n then {
            const sendStakedTokenFromVaultToTreasuryRecord : onVaultLiquidateStakeSingleType = record [
                vaultAddress      = vaultAddress;
                liquidator        = treasuryAddress;
                liquidatedAmount  = treasuryTokenAmount;
            ];
            liquidationList := sendStakedTokenFromVaultToTreasuryRecord # liquidationList;
        };


        if List.length(liquidationList) > 0n then {
            const liquidateVaultStakedTokenOperation : operation = onLiquidateStakedTokenFromVaultOperation(
                liquidationList,
                stakingContractAddress
            );                
            operations := liquidateVaultStakedTokenOperation # operations;
        };
        
    } else skip;

} with operations



// helper function to calculate the ratio used in the collateral token amount receive calculation
function processCollateralTokenLiquidation(
    const liquidatorAddress : address; 
    const treasuryAddress : address; 
    const loanTokenDecimals : nat; 
    const loanTokenLastCompletedData : lastCompletedDataReturnType; 
    const vaultAddress : address; 
    const vaultCollateralValueRebased : nat; 
    const collateralTokenName : string; 
    const collateralTokenBalance : nat; 
    const liquidationAmount : nat; 
    var onLiquidateList : onLiquidateListType; 
    var operations : list(operation); 
    const s : lendingControllerStorageType
) : onLiquidateListType * list(operation) * nat is
block {

    // get collateral token record through on-chain view
    const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(collateralTokenName, s);

    // get last completed data of token from Aggregator view
    const collateralTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(collateralTokenRecord.oracleAddress);

    // init variables
    const loanTokenPrice            : nat = loanTokenLastCompletedData.data;
    const loanTokenPriceDecimals    : nat = loanTokenLastCompletedData.decimals;
    const tokenDecimals             : nat = collateralTokenRecord.tokenDecimals;
    const tokenPrice                : nat = collateralTokenLastCompletedData.data;
    const priceDecimals             : nat = collateralTokenLastCompletedData.decimals;

    // if token is sMVN, get latest balance from Doorman Contract through on-chain views
    // - may differ from token balance if rewards have been claimed 
    // - requires a call to %compound on staking contract (i.e. doorman contract) to compound rewards for the vault and get the latest balance
    var collateralTokenBalance : nat := 
        // get vault staked balance from staking contract i.e. doorman contract (includes unclaimed exit fee rewards, does not include satellite rewards)
        // - for better accuracy, there should be a frontend call to compound rewards for the vault first
        if collateralTokenRecord.isStakedToken then {
            const stakingContractAddress : address = case collateralTokenRecord.stakingContractAddress of [
                    Some(_address) -> _address
                |   None           -> failwith(error_STAKING_CONTRACT_ADDRESS_FOR_STAKED_TOKEN_NOT_FOUND)
            ];
            const stakedBalance : nat = getBalanceFromStakingContract(vaultAddress, stakingContractAddress);
        } with stakedBalance
        // get updated scaled token balance (e.g. mToken)
        else if collateralTokenRecord.isScaledToken then getBalanceFromScaledTokenContract(vaultAddress, collateralTokenRecord.tokenContractAddress)
        else collateralTokenBalance;

    // get proportion of collateral token balance against total vault's collateral value
    const tokenProportion : nat = calculateCollateralTokenProportion(collateralTokenRecord, collateralTokenLastCompletedData, collateralTokenBalance, vaultCollateralValueRebased, s);

    // ------------------------------------------------------------------
    // Rebase decimals for calculation
    //  - account for exponent (decimal) differences between collateral and loan token decimals
    //  - account for exponent (decimal) differences between collateral price and loan token price decimals from aggregators
    // ------------------------------------------------------------------

    // ratio used in liquidator and treasury token amount calculation
    const collateralTokenPriceAdjustmentRatio   : nat = calculateCollateralPriceAdjustmentRatio(
        (loanTokenDecimals, loanTokenPriceDecimals),
        (tokenDecimals, priceDecimals)
    );

    // ------------------------------------------------------------------
    // Calculate Liquidator's Amount 
    // ------------------------------------------------------------------

    const liquidationFeePercent         : nat   = s.config.liquidationFeePercent;       // liquidation fee - penalty fee paid by vault owner to liquidator 
    const liquidationIncentive          : nat   = ((liquidationFeePercent * liquidationAmount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;
    const liquidatorAmountAndIncentive  : nat   = liquidationAmount + liquidationIncentive;
    const liquidatorTokenQuantityTotal  : nat   = calculateCollateralAmountReceived(
        loanTokenPrice,
        tokenPrice,
        tokenProportion,
        collateralTokenPriceAdjustmentRatio,
        liquidatorAmountAndIncentive
    ); 
    
    // Calculate new collateral balance
    if liquidatorTokenQuantityTotal > collateralTokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
    var newCollateralTokenBalance : nat := abs(collateralTokenBalance - liquidatorTokenQuantityTotal);

    // ------------------------------------------------------------------
    // Calculate Treasury's Amount 
    // ------------------------------------------------------------------

    // calculate final amounts to be liquidated
    const adminLiquidationFeePercent    : nat   = s.config.adminLiquidationFeePercent;  // admin liquidation fee - penalty fee paid by vault owner to treasury
    const adminLiquidationFee           : nat   = ((adminLiquidationFeePercent * liquidationAmount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;
    const treasuryTokenQuantityTotal    : nat   = calculateCollateralAmountReceived(
        loanTokenPrice,
        tokenPrice,
        tokenProportion,
        collateralTokenPriceAdjustmentRatio,
        adminLiquidationFee
    ); 

    // Calculate new collateral balance
    if treasuryTokenQuantityTotal > newCollateralTokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
    newCollateralTokenBalance := abs(newCollateralTokenBalance - treasuryTokenQuantityTotal);

    // ------------------------------------------------------------------
    // Process liquidation transfer of collateral token
    // ------------------------------------------------------------------
    
    if collateralTokenRecord.isStakedToken then {

        // collateral token is a staked token 
        operations := processLiquidationCollateralStakedTokenTransferOperations(
            collateralTokenRecord,
            vaultAddress,
            (liquidatorAddress, liquidatorTokenQuantityTotal),
            (treasuryAddress, treasuryTokenQuantityTotal),
            operations
        );

    } else {

        // collateral token is a non-staked token
        onLiquidateList := processLiquidationCollateralTokenTransferRecord(
            collateralTokenRecord,
            // vaultAddress,
            (liquidatorAddress, liquidatorTokenQuantityTotal),
            (treasuryAddress, treasuryTokenQuantityTotal),
            onLiquidateList
        );

    }

} with (onLiquidateList, operations, newCollateralTokenBalance)

// ------------------------------------------------------------------------------
// Liquidate Vault Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Helper Functions Begin
// ------------------------------------------------------------------------------

function updateVaultState(const vaultHandle : vaultHandleType; var s : lendingControllerStorageType) : (vaultRecordType*loanTokenRecordType) is
block {

    // get vault
    var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

    // ------------------------------------------------------------------
    // Update Loan Token state and get token borrow index
    // ------------------------------------------------------------------

    // Get vault loan token name
    const vaultLoanTokenName  : string = vault.loanToken; // USDT, EURT, some other crypto coin

    // Get loan token record
    var loanTokenRecord : loanTokenRecordType := getLoanTokenRecord(vaultLoanTokenName, s);
                
    // Update Loan Token State: Latest utilisation rate, current interest rate, compounded interest and borrow index
    loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);
    
    // Get loan token parameters
    const tokenBorrowIndex  : nat = loanTokenRecord.borrowIndex;

    // Get or set current vault borrow index
    var vaultBorrowIndex : nat := vault.borrowIndex;
    if vaultBorrowIndex = 0n then vaultBorrowIndex := tokenBorrowIndex else skip;

    // ------------------------------------------------------------------
    // Accrue interest to vault oustanding
    // ------------------------------------------------------------------

    // Get current user loan outstanding and init new total variables
    const currentLoanOutstandingTotal  : nat = vault.loanOutstandingTotal;
    const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;
    var newLoanOutstandingTotal        : nat := currentLoanOutstandingTotal;
    var newLoanInterestTotal           : nat := vault.loanInterestTotal;

    // Calculate interest
    newLoanOutstandingTotal := accrueInterestToVault(
        currentLoanOutstandingTotal,
        vaultBorrowIndex,
        tokenBorrowIndex
    );

    if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
    newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

    // ------------------------------------------------------------------
    // Update storage
    // ------------------------------------------------------------------

    vault.loanOutstandingTotal                := newLoanOutstandingTotal;
    vault.loanInterestTotal                   := newLoanInterestTotal;
    vault.borrowIndex                         := tokenBorrowIndex;
    vault.lastUpdatedBlockLevel               := Mavryk.get_level();
    vault.lastUpdatedTimestamp                := Mavryk.get_now();

} with(vault, loanTokenRecord)

// ------------------------------------------------------------------------------
// Vault Helper Functions Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(lendingControllerUnpackLambdaFunctionType)) of [
            Some(f) -> f(lendingControllerLambdaAction, s)
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