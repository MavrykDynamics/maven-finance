// ------------------------------------------------------------------------------
//
// Vault Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case vaultLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case vaultLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case vaultLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Lambdas Begin
// ------------------------------------------------------------------------------

(* delegateTezToBaker lambda *)
function lambdaDelegateTezToBaker(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaDelegateTezToBaker(delegateParams) -> {

                // set new delegate only if sender is the vault owner
                if Tezos.get_sender() =/= s.handle.owner then failwith(error_ONLY_OWNER_CAN_DELEGATE_TEZ_TO_BAKER) 
                else skip; 
                
                const delegateToTezBakerOperation : operation = Tezos.set_delegate(delegateParams);
                
                operations := delegateToTezBakerOperation # operations;
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* delegateMvkToSatellite lambda *)
function lambdaDelegateMvkToSat(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaDelegateMvkToSat(satelliteAddress) -> {

                // set new delegate only if sender is the vault owner
                if Tezos.get_sender() =/= s.handle.owner then failwith(error_ONLY_OWNER_CAN_DELEGATE_MVK_TO_SATELLITE) 
                else skip; 

                // Get Delegation Address from the General Contracts map on the Governance Contract
                const delegationAddress: address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

                // create delegate to satellite operation
                const delegateToSatelliteOperation : operation = Tezos.transaction(
                    satelliteAddress,
                    0tez,
                    getDelegateToSatelliteEntrypoint(delegationAddress)
                );

                operations := delegateToSatelliteOperation # operations;
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* withdraw lambda *)
function lambdaWithdraw(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaWithdraw(withdrawParams) -> {

                // withdraw operation
                const amount     : nat        = withdrawParams.amount;
                const tokenType  : tokenType  = withdrawParams.token;

                // Get Lending Controller Address from the General Contracts map on the Governance Contract
                const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

                if Tezos.get_sender() = s.handle.owner then {

                    // sender is owner of vault

                    // register withdrawal in Lending Controller
                    const registerWithdrawalOperation : operation = registerWithdrawalInLendingController(
                        amount,       // amount
                        tokenType,    // tokenType
                        s             // storage
                    );

                    // process withdrawal from vault to sender
                    const processVaultWithdrawalOperation : operation = processVaultTransfer(
                        Tezos.get_self_address(),   // from_
                        Tezos.get_sender(),         // to_
                        amount,                     // amount
                        tokenType                   // tokenType
                    );

                    operations := list[
                        registerWithdrawalOperation;
                        processVaultWithdrawalOperation
                    ];

                } else if Tezos.get_sender() = lendingControllerAddress then {

                    // sender is Lending Controller - e.g. from %closeVault, %liquidateVault

                    // process withdrawal from vault to sender
                    const processVaultWithdrawalOperation : operation = processVaultTransfer(
                        Tezos.get_self_address(),   // from_
                        Tezos.get_sender(),         // to_
                        amount,                     // amount
                        tokenType                   // tokenType
                    );

                    operations := processVaultWithdrawalOperation # operations;

                } else failwith(error_NOT_AUTHORISED_TO_WITHDRAW_FROM_VAULT)
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* deposit lambda *)
function lambdaDeposit(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaDeposit(depositParams) -> {

                // init deposit operation params
                const amount     : nat        = depositParams.amount;
                const tokenType  : tokenType  = depositParams.token;

                // check if sender is owner
                var isOwnerCheck : bool := False;
                if Tezos.get_sender() = s.handle.owner then isOwnerCheck := True else isOwnerCheck := False;

                // check if sender is a whitelisted depositor
                const isAbleToDeposit : bool = case s.depositors of [
                    | Any                    -> True
                    | Whitelist(_depositors) -> _depositors contains Tezos.get_sender()
                ];
                
                // check that sender is either the vault owner or a depositor
                if isOwnerCheck = True or isAbleToDeposit = True then block {

                    // register deposit in Lending Controller
                    const registerDepositOperation : operation = registerDepositInLendingController(
                        amount,       // amount
                        tokenType,    // tokenType
                        s             // storage
                    );

                    // process deposit from sender to vault
                    const processVaultDepositOperation : operation = processVaultTransfer(
                        Tezos.get_sender(),         // from_
                        Tezos.get_self_address(),   // to_
                        amount,                     // amount
                        tokenType                   // tokenType
                    );

                    operations := list[
                        registerDepositOperation; 
                        processVaultDepositOperation
                    ];

                } else failwith(error_NOT_AUTHORISED_TO_DEPOSIT_INTO_VAULT);
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* updateDepositor lambda *)
function lambdaUpdateDepositor(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    case vaultLambdaAction of [
        |   LambdaUpdateDepositor(updateDepositorParams) -> {

                // set new depositor only if sender is the vault owner
                if Tezos.get_sender() =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
                else block {

                    // if AllowAny and is true, then value is Any; if AllowAny and is false, then reset Whitelist to empty address set
                    // if AllowAccount and bool is true, then add account to Whitelist set; else remove account from Whitelist set
                    const emptyWhitelistSet : set(address) = set[];
                    const depositors : depositorsType = case updateDepositorParams.allowance of [
                        | AllowAny(_allow) -> if _allow then Any else Whitelist(emptyWhitelistSet)
                        | AllowAccount(_account) -> block {
                            const updateDepositors : depositorsType = case s.depositors of [
                                | Any -> failwith("Error. Set any off first")
                                | Whitelist(_depositors) -> Whitelist(if _account.0 then Set.add(_account.1, _depositors) else Set.remove(_account.1, _depositors))  
                            ];
                        } with updateDepositors
                    ];
                    
                    // update depositors
                    s.depositors := depositors;

                };

            }   
        |   _ -> skip
    ];

} with (noOperations, s)


// ------------------------------------------------------------------------------
//
// Vault Lambdas End
//
// ------------------------------------------------------------------------------