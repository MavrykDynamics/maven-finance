// ------------------------------------------------------------------------------
//
// Vault Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case vaultFactoryLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case vaultFactoryLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // verify that sender is admin (i.e. Governance Proxy Contract address)
    
    case vaultFactoryLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is 
block {

    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // verify that sender is admin 

    case vaultFactoryLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : vaultFactoryUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : vaultFactoryUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigVaultNameMaxLength (_v)    -> s.config.vaultNameMaxLength         := updateConfigNewValue
                    |   Empty (_v)                       -> skip
                ];
            }
        |   _ -> skip
    ];
  
} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case vaultFactoryLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // verify that sender is admin 
    
    case vaultFactoryLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent

    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  

    var operations : list(operation) := nil;

    case vaultFactoryLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that sender is admin or from the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam : transferDestinationType; const operationList : list(operation)) : list(operation) is
                    block{

                        const transferTokenOperation : operation = case transferParam.token of [
                            |   Tez         -> transferTez((Mavryk.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address") : contract(unit)), transferParam.amount * 1mumav)
                            |   Fa12(token) -> transferFa12Token(Mavryk.get_self_address(), transferParam.to_, transferParam.amount, token)
                            |   Fa2(token)  -> transferFa2Token(Mavryk.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                        ];

                    } with (transferTokenOperation # operationList);
                
                for transferParams in list destinationParams block {
                    operations := transferOperationFold(transferParams, operations);
                }
                 
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Pause entrypoints in Vault Factory

    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case vaultFactoryLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.createVaultIsPaused then skip
                else s.breakGlassConfig.createVaultIsPaused := True;

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Unpause entrypoints in Vault Factory

    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case vaultFactoryLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.createVaultIsPaused then s.breakGlassConfig.createVaultIsPaused := False
                else skip;

            }
        |   _ -> skip
    ];
    
} with (operations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is
block {

    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // check that sender is admin

    case vaultFactoryLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                    |   CreateVault (_v)    -> s.breakGlassConfig.createVaultIsPaused := _v   
                    |   Empty (_v)          -> skip
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Factory Lambdas Begin
// ------------------------------------------------------------------------------

(* createVault lambda *)
function lambdaCreateVault(const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is 
block{

    // Steps Overview:    
    // 1. Check that %createVault entrypoint is not paused (e.g. glass broken)
    // 2. Create Vault
    // 3. Create operation to originate new Vault

    // verify that %createVault entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.createVaultIsPaused, error_CREATE_VAULT_ENTRYPOINT_IN_VAULT_FACTORY_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case vaultFactoryLambdaAction of [
        |   LambdaCreateVault(createVaultParams) -> {

                // init variables
                const vaultDelegate         : option(key_hash) = createVaultParams.baker;
                const vaultLoanTokenName    : string = createVaultParams.loanTokenName; // e.g. USDT, EURL 
                const vaultOwner            : address = Mavryk.get_sender();
                const newVaultId            : vaultIdType = s.vaultCounter;

                // Get deposits if any
                const collateralDepositList : list(depositType) = case createVaultParams.collateral of [
                        Some(_list) -> _list
                    |   None        -> list[]
                ];

                // Get Lending Controller Address from the General Contracts map on the Governance Contract
                const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

                // Prepare new vault storage
                const originateVaultStorage : vaultStorageType = prepareVaultStorage(
                    createVaultParams, 
                    vaultOwner,
                    newVaultId,
                    s
                );

                // originate vault func with delegate option
                const vaultOrigination : (operation * address) = createVaultFunc(
                    (vaultDelegate,  
                    Mavryk.get_amount(),                       
                    originateVaultStorage)
                );

                // get vault address
                const vaultAddress : address = vaultOrigination.1;

                // register vault creation operation in lending controller
                const registerVaultCreationOperation : operation = registerVaultCreationOperation(
                    vaultOwner,                 // vault owner address
                    newVaultId,                 // vault id
                    vaultAddress,               // vault address
                    vaultLoanTokenName,         // vault loan token name
                    lendingControllerAddress  
                ); 

                // FILO (First-In, Last-Out) - registerDeposit operation will occur after registerVaultCreation operation in lending controller
                function processNewVaultCollateralDeposit(const collateralDeposit : depositType; var operationList: list(operation)) : list(operation) is 
                block {

                    const amount     : nat      = collateralDeposit.amount;  
                    const tokenName  : string   = collateralDeposit.tokenName;

                    // get collateral token record from Lending Controller through on-chain view
                    const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecordByName(tokenName, lendingControllerAddress);
                    const tokenType : tokenType = collateralTokenRecord.tokenType;

                    // if tez is sent, check that it matches the amount listed
                    if tokenName = "tez" then {
                        if Mavryk.get_amount() = (amount * 1mumav) then skip else failwith(error_INCORRECT_COLLATERAL_TOKEN_AMOUNT_SENT);
                    } else skip;

                    operationList := registerDepositInLendingController(
                        vaultOwner,
                        newVaultId,
                        amount, 
                        tokenName, 
                        lendingControllerAddress
                    ) # operationList;

                    // process deposit from sender to vault address
                    if tokenName =/= "tez" then {
                        
                        const processVaultDepositOperation : operation = processVaultCollateralTransfer(
                            Mavryk.get_sender(),         // from_
                            vaultAddress,               // to_
                            amount,                     // amount
                            tokenType                   // tokenType
                        );
                        operationList := processVaultDepositOperation # operationList;
                    };

                } with operationList;

                for collateralDeposit in list collateralDepositList block {
                    operations := processNewVaultCollateralDeposit(collateralDepositList, operations);
                }

                // FILO (First-In, Last-Out) - originate vault first then register vault creation in lending controller
                operations := registerVaultCreationOperation # operations;
                operations := vaultOrigination.0 # operations; 

                // increment vault counter 
                s.vaultCounter := s.vaultCounter + 1n;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Vault Factory Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Vault Factory Lambdas End
//
// ------------------------------------------------------------------------------
