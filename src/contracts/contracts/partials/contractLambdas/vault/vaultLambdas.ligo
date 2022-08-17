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

(* vaultDelegateTezToBaker lambda *)
function lambdaVaultDelegateTezToBaker(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaVaultDelegateTezToBaker(vaultDelegateParams) -> {

                // set new delegate only if sender is the vault owner
                if Tezos.get_sender() =/= s.handle.owner then failwith(error_ONLY_OWNER_CAN_DELEGATE_TEZ_TO_BAKER) 
                else skip; 
                
                const delegateToTezBakerOperation : operation = Tezos.set_delegate(vaultDelegateParams);
                
                operations := delegateToTezBakerOperation # operations;
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* vaultDelegateMvkToSatellite lambda *)
function lambdaVaultDelegateMvkToSat(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaVaultDelegateMvkToSat(satelliteAddress) -> {

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



(* vaultWithdraw lambda *)
function lambdaVaultWithdraw(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    // check that sender is admin (token controller)
    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaVaultWithdraw(vaultWithdrawParams) -> {

                // withdraw operation
                const from_  : address    = Tezos.get_self_address();
                const to_    : address    = vaultWithdrawParams.to_;
                const amt    : nat        = vaultWithdrawParams.amount;
                const token  : tokenType  = vaultWithdrawParams.token;

                const withdrawOperation : operation = case token of [

                    |   Tez(_tez) -> block {
                        
                            const transferOperation : operation = transferTez( (Tezos.get_contract_with_error(to_, "Error. Unable to send tez.") : contract(unit)), amt * 1mutez );

                        } with transferOperation

                    |   Fa12(token) -> block {
                        
                            // check collateral token contract address exists in Lending controller collateral token ledger
                            const getCollateralTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getColTokenRecordByAddressOpt", token, s.admin);
                            const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getCollateralTokenRecordView of [
                                    Some (_opt)    -> _opt
                                |   None           -> failwith (error_GET_COL_TOKEN_RECORD_BY_ADDRESS_OPT_VIEW_NOT_FOUND)
                            ];
                            const _collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                                    Some(_record)  -> _record
                                |   None           -> failwith (error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
                            ];

                            const transferOperation : operation = transferFa12Token(from_, to_, amt, token)

                        } with transferOperation

                    |   Fa2(token)  -> block{
                        
                            // check collateral token contract address exists in Lending controller collateral token ledger
                            const getCollateralTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getColTokenRecordByAddressOpt", token.tokenContractAddress, s.admin);
                            const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getCollateralTokenRecordView of [
                                    Some (_opt)    -> _opt
                                |   None           -> failwith (error_GET_COL_TOKEN_RECORD_BY_ADDRESS_OPT_VIEW_NOT_FOUND)
                            ];
                            const _collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                                    Some(_record)  -> _record
                                |   None           -> failwith (error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
                            ];

                            const transferOperation : operation = transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)

                        } with transferOperation
                    ];

                operations := withdrawOperation # operations;
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* vaultDeposit lambda *)
function lambdaVaultDeposit(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaVaultDeposit(vaultDepositParams) -> {

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

                    // deposit operation
                    const from_      : address    = Tezos.get_sender();
                    const to_        : address    = Tezos.get_self_address();
                    const amt        : nat        = vaultDepositParams.amount;
                    const token      : tokenType  = vaultDepositParams.token;

                    // if to_ =/= s.admin then failwith("Error. Deposit address should be admin.") else skip;

                    case token of [

                        |   Tez(_tez) -> block{

                                // check if tezos amount sent is equal to amount specified
                                if mutezToNatural(Tezos.get_amount()) =/= amt then failwith(error_AMOUNT_NOT_EQUAL_TO_DEPOSIT) else skip;

                                // transfer tez to vault
                                const depositTezOperation : operation = transferTez( (Tezos.get_contract_with_error(to_, "Error. Unable to send tez to vault.") : contract(unit)), amt * 1mutez);
                                operations := depositTezOperation # operations;

                                // create register deposit params
                                const registerDepositParams : registerDepositType = record [
                                    handle          = s.handle;
                                    amount          = mutezToNatural(Tezos.get_amount()); 
                                    tokenName       = "tez";
                                ];
                                
                                // create register deposit operation
                                const registerTezDepositOperation : operation = Tezos.transaction(
                                    registerDepositParams,
                                    0mutez,
                                    registerDepositInLendingController(s.admin)
                                );

                                // register tez deposit in Lending Controller
                                operations := registerTezDepositOperation # operations;

                            } 

                        |   Fa12(token) -> block {

                                checkNoAmount(Unit);

                                // check collateral token contract address exists in Lending Controller collateral token ledger
                                const getCollateralTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getColTokenRecordByAddressOpt", token, s.admin);
                                const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getCollateralTokenRecordView of [
                                        Some (_opt)    -> _opt
                                    |   None           -> failwith (error_GET_COL_TOKEN_RECORD_BY_ADDRESS_OPT_VIEW_NOT_FOUND)
                                ];
                                const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                                        Some(_record)  -> _record
                                    |   None           -> failwith (error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
                                ];

                                // transfer tokens to vault
                                const depositTokenOperation : operation = transferFa12Token(from_, to_, amt, token);
                                operations := depositTokenOperation # operations;

                                // create register deposit params
                                const registerDepositParams : registerDepositType = record [
                                    handle          = s.handle;
                                    amount          = amt; 
                                    tokenName       = collateralTokenRecord.tokenName;
                                ];
                                
                                // create register deposit operation
                                const registerTokenDepositOperation : operation = Tezos.transaction(
                                    registerDepositParams,
                                    0mutez,
                                    registerDepositInLendingController(s.admin)
                                );

                                // register token deposit in USDM Token Controller
                                operations := registerTokenDepositOperation # operations;

                            } 

                        |   Fa2(token)  -> block{

                                checkNoAmount(Unit);
                                
                                // check collateral token contract address exists in Lending Controller collateral token ledger
                                const getCollateralTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getColTokenRecordByAddressOpt", token.tokenContractAddress, s.admin);
                                const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getCollateralTokenRecordView of [
                                        Some (_opt)    -> _opt
                                    |   None           -> failwith (error_GET_COL_TOKEN_RECORD_BY_ADDRESS_OPT_VIEW_NOT_FOUND)
                                ];
                                const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                                        Some(_record)  -> _record
                                    |   None           -> failwith (error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
                                ];

                                // transfer tokens to vault
                                const depositTokenOperation : operation = transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress);
                                operations := depositTokenOperation # operations;

                                // create register deposit params
                                const registerDepositParams : registerDepositType = record [
                                    handle          = s.handle;
                                    amount          = amt; 
                                    tokenName       = collateralTokenRecord.tokenName;
                                ];
                                
                                // create register deposit operation
                                const registerTokenDepositOperation : operation = Tezos.transaction(
                                    registerDepositParams,
                                    0mutez,
                                    registerDepositInLendingController(s.admin)
                                );

                                // register token deposit in USDM Token Controller
                                operations := registerTokenDepositOperation # operations;
                            }
                    ];

                } else failwith(error_NOT_AUTHORISED_TO_DEPOSIT_INTO_VAULT);
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* vaultEditDepositor lambda *)
function lambdaVaultEditDepositor(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    case vaultLambdaAction of [
        |   LambdaVaultEditDepositor(vaultEditDepositorParams) -> {

                // set new depositor only if sender is the vault owner
                if Tezos.get_sender() =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
                else block {

                    // if AllowAny and is true, then value is Any; if AllowAny and is false, then reset Whitelist to empty address set
                    // if AllowAccount and bool is true, then add account to Whitelist set; else remove account from Whitelist set
                    const emptyWhitelistSet : set(address) = set[];
                    const depositors : depositorsType = case vaultEditDepositorParams of [
                        | AllowAny(_allow) -> if _allow then Any else Whitelist(emptyWhitelistSet)
                        | AllowAccount(_account) -> block {
                            const editDepositors : depositorsType = case s.depositors of [
                                | Any -> failwith("Error. Set any off first")
                                | Whitelist(_depositors) -> Whitelist(if _account.0 then Set.add(_account.1, _depositors) else Set.remove(_account.1, _depositors))  
                            ];
                        } with editDepositors
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