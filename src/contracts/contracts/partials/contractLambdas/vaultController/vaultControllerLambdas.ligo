// ------------------------------------------------------------------------------
//
// Vault Controller Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case vaultControllerLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case vaultControllerLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case vaultControllerLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s: vaultControllerStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin 
    
    case vaultControllerLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s: vaultControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case vaultControllerLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s: vaultControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case vaultControllerLambdaAction of [
        |   LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        |   _ -> skip
    ];


} with (noOperations, s)



(* updateCollateralTokenLedger lambda *)
function lambdaUpdateCollateralTokenLedger(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s: vaultControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case vaultControllerLambdaAction of [
        |   LambdaUpdateCollateralTokens(updateCollateralTokenLedgerParams) -> {
                
                const tokenName             : string       = updateCollateralTokenLedgerParams.tokenName;
                const tokenContractAddress  : address      = updateCollateralTokenLedgerParams.tokenContractAddress;
                const tokenType             : tokenType    = updateCollateralTokenLedgerParams.tokenType;
                const decimals              : nat          = updateCollateralTokenLedgerParams.decimals;
                const oracleType            : string       = updateCollateralTokenLedgerParams.oracleType;
                var oracleAddress           : address     := updateCollateralTokenLedgerParams.oracleAddress;

                if oracleType = "cfmm" then block {
                    oracleAddress := zeroAddress;
                } else skip;
                
                const collateralTokenRecord : collateralTokenRecordType = record [
                    tokenName            = tokenName;
                    tokenContractAddress = tokenContractAddress;
                    tokenType            = tokenType;
                    decimals             = decimals;
                    oracleType           = oracleType;
                    oracleAddress        = oracleAddress;
                ];

                const existingToken: option(collateralTokenRecordType) = 
                if checkInCollateralTokenLedger(collateralTokenRecord, s) then (None : option(collateralTokenRecordType)) else Some (collateralTokenRecord);

                const updatedCollateralTokenLedger : collateralTokenLedgerType = 
                Map.update(
                    tokenName, 
                    existingToken,
                    s.collateralTokenLedger
                );

                s.collateralTokenLedger := updatedCollateralTokenLedger

            }
        |   _ -> skip
    ];


} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Pause all main entrypoints in the Delegation Contract
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case vaultControllerLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // Vault Entrypoints
                if s.breakGlassConfig.createVaultIsPaused then skip
                else s.breakGlassConfig.createVaultIsPaused := True;

                if s.breakGlassConfig.closeVaultIsPaused then skip
                else s.breakGlassConfig.closeVaultIsPaused := True;

                if s.breakGlassConfig.withdrawFromVaultIsPaused then skip
                else s.breakGlassConfig.withdrawFromVaultIsPaused := True;

                if s.breakGlassConfig.registerDepositIsPaused then skip
                else s.breakGlassConfig.registerDepositIsPaused := True;

                if s.breakGlassConfig.liquidateVaultIsPaused then skip
                else s.breakGlassConfig.liquidateVaultIsPaused := True;

                if s.breakGlassConfig.borrowIsPaused then skip
                else s.breakGlassConfig.borrowIsPaused := True;

                if s.breakGlassConfig.repayIsPaused then skip
                else s.breakGlassConfig.repayIsPaused := True;

                // Vault Staked MVK Entrypoints
                if s.breakGlassConfig.vaultDepositStakedMvkIsPaused then skip
                else s.breakGlassConfig.vaultDepositStakedMvkIsPaused := True;

                if s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused then skip
                else s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused := True;

                if s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused then skip
                else s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused := True;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Unpause all main entrypoints in the Delegation Contract

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    // set all pause configs to False
    case vaultControllerLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
            
                // Vault Entrypoints
                if s.breakGlassConfig.createVaultIsPaused then s.breakGlassConfig.createVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.closeVaultIsPaused then s.breakGlassConfig.closeVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.withdrawFromVaultIsPaused then s.breakGlassConfig.withdrawFromVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.registerDepositIsPaused then s.breakGlassConfig.registerDepositIsPaused := False
                else skip;

                if s.breakGlassConfig.liquidateVaultIsPaused then s.breakGlassConfig.liquidateVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.borrowIsPaused then s.breakGlassConfig.borrowIsPaused := False
                else skip;

                if s.breakGlassConfig.repayIsPaused then s.breakGlassConfig.repayIsPaused := False
                else skip;

                // Vault Staked MVK Entrypoints
                if s.breakGlassConfig.vaultDepositStakedMvkIsPaused then s.breakGlassConfig.vaultDepositStakedMvkIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused then s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused then s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused := False
                else skip;
            
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Pause or unpause entrypoint depending on boolean parameter sent 

    checkSenderIsAdmin(s); // check that sender is admin

    case vaultControllerLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [

                        // Vault Entrypoints
                        CreateVault (_v)                -> s.breakGlassConfig.createVaultIsPaused              := _v
                    |   CloseVault (_v)                 -> s.breakGlassConfig.closeVaultIsPaused               := _v
                    |   WithdrawFromVault (_v)          -> s.breakGlassConfig.withdrawFromVaultIsPaused        := _v
                    |   RegisterDeposit (_v)            -> s.breakGlassConfig.registerDepositIsPaused          := _v
                    |   LiquidateVault (_v)             -> s.breakGlassConfig.liquidateVaultIsPaused           := _v
                    |   Borrow (_v)                     -> s.breakGlassConfig.borrowIsPaused                   := _v
                    |   Repay (_v)                      -> s.breakGlassConfig.repayIsPaused                    := _v

                        // Vault Staked MVK Entrypoints
                    |   VaultDepositStakedMvk (_v)      -> s.breakGlassConfig.vaultDepositStakedMvkIsPaused    := _v
                    |   VaultWithdrawStakedMvk (_v)     -> s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused   := _v
                    |   VaultLiquidateStakedMvk (_v)    -> s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused  := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)


// ------------------------------------------------------------------------------
// Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Lambdas Begin
// ------------------------------------------------------------------------------

(* createVault lambda *)
function lambdaCreateVault(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;

    case vaultControllerLambdaAction of [
        |   LambdaCreateVault(createVaultParams) -> {
                
                const loanToken : string = createParams.loanToken; // USDT, EURL 

                // get vault counter
                const newVaultId : vaultIdType = s.vaultCounter;
                
                // check if vault id already exists
                if Big_map.mem(newVaultId, s.vaultLedger) then failwith("Error. Vault Id already exists.") else skip;
                
                // make vault handle
                const handle : vaultHandleType = record [
                    id     = newVaultId;
                    owner  = Tezos.get_sender();
                ];

                // check if vault already exists
                if Big_map.mem(handle, s.vaults) then failwith("Error. Vault already exists.") else skip;

                // params for vault with tez storage origination
                const originateVaultStorage : vaultStorage = record [
                    admin                       = Tezos.get_self_address();
                    handle                      = handle;
                    depositors                  = createParams.depositors;
                ];

                // originate vault func
                const vaultOrigination : (operation * address) = createVaultFunc(
                    (None : option(key_hash)), 
                    Tezos.amount,
                    originateVaultStorage
                );

                // add vaultWithTezOrigination operation to operations list
                operations := vaultOrigination.0 # operations; 

                // create new vault params
                if mutezToNatural(Tezos.amount) > 0n then block {
                    
                    // tez is sent
                    const collateralBalanceLedgerMap : collateralBalanceLedgerType = map[
                        ("tez" : string) -> mutezToNatural(Tezos.amount)
                    ];
                    const vault : vaultType = record [
                        
                        address                    = vaultOrigination.1; // vault address
                        collateralBalanceLedger    = collateralBalanceLedgerMap;

                        loanOutstanding            = 0n;
                        loanToken                  = loanToken;
                        lastUpdatedBlockLevel      = Tezos.get_level();

                    ];
                    
                    // update controller storage with new vault
                    s.vaults := Big_map.update(handle, Some(vault), s.vaults);

                } else block {
                    // no tez is sent
                    const emptyCollateralBalanceLedgerMap : collateralBalanceLedgerType = map[];
                    const vault : vaultType = record [

                        address                    = vaultOrigination.1; // vault address
                        collateralBalanceLedger    = emptyCollateralBalanceLedgerMap;
                        
                        loanOutstanding            = 0n;
                        loanToken                  = loanToken;
                        
                        lastUpdatedBlockLevel      = Tezos.get_level();
                    ];

                    // update controller storage with new vault
                    s.vaults := Big_map.update(handle, Some(vault), s.vaults);

                };

                // increment vault counter and add vault id to vaultLedger
                s.vaultLedger[newVaultId] := True;
                s.vaultCounter            := s.vaultCounter + 1n;


            }
        |   _ -> skip
    ];

} with (operations, s)



(* closeVault lambda *)
function lambdaCloseVault(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    var operations    : list(operation) := nil;

    case vaultControllerLambdaAction of [
        |   LambdaCloseVault(closeVaultParams) -> {
                
                // only the vault owner can close his own vault

                // init parameters 
                const vaultId     : vaultIdType      = closeVaultParams.vaultId;
                const vaultOwner  : vaultOwnerType   = Tezos.get_sender();
                
                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault
                var _vault : vaultType := getVault(vaultHandle, s);
                const vaultAddress : address = _vault.address;

                // check that vault has zero loan oustanding
                checkZeroLoanOutstanding(_vault);

                // get tokens and token balances and initiate transfer back to the vault owner
                for tokenName -> tokenBalance in map _vault.collateralBalanceLedger block {
                    
                    if tokenName = "tez" then block {

                        const transferTezOperation : operation = transferTez( (Tezos.get_contract_with_error(vaultOwner, "Error. Unable to send tez.") : contract(unit)), tokenBalance );
                        operations := transferTezOperation # operations;

                        _vault.collateralBalanceLedger[tokenName]  := 0n;
                        
                    } else block {

                        const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                                Some(_record) -> _record
                            |   None -> failwith("Error. Token does not exist in collateral token record.")
                        ];

                        if collateralTokenRecord.tokenName = "sMVK" then block {

                            // for special case of sMVK

                            // create operation to doorman to withdraw all staked MVK from vault to user
                            const vaultWithdrawStakedMvkParams : vaultWithdrawStakedMvkType = record [
                                vaultId         = vaultId;
                                withdrawAmount  = collateralTokenRecord.balance;
                            ];
                            const vaultWithdrawAllStakedMvkOperation : operation = Tezos.transaction(
                                vaultWithdrawStakedMvkParams,
                                0tez,
                                getVaultWithdrawStakedMvkEntrypoint(doormanAddress)
                            );
                            operations := vaultWithdrawAllStakedMvkOperation # operations;

                        } else block {

                            // for other collateral token types besides sMVK

                            const withdrawTokenOperation : operation = case collateralTokenRecord.tokenType of [
                                Tez(_tez) -> block {
                                    
                                    const withdrawTezOperationParams : vaultWithdrawType = record [
                                        from_ = vaultAddress;
                                        to_   = vaultOwner; 
                                        amt   = tokenBalance;
                                        token = Tez(_tez);
                                    ];
                                    const withdrawTezOperation : operation = Tezos.transaction(
                                        withdrawTezOperationParams,
                                        0mutez,
                                        getVaultWithdrawEntrypoint(vaultAddress)
                                    );

                                } with withdrawTezOperation
                                | Fa12(_token) -> block {

                                    const withdrawFa12OperationParams : vaultWithdrawType = record [
                                        from_ = vaultAddress;
                                        to_   = vaultOwner; 
                                        amt   = tokenBalance;
                                        token = Fa12(_token);
                                    ];
                                    const withdrawFa12Operation : operation = Tezos.transaction(
                                        withdrawFa12OperationParams,
                                        0mutez,
                                        getVaultWithdrawEntrypoint(vaultAddress)
                                    );

                                } with withdrawFa12Operation
                                | Fa2(_token) -> block {

                                    const withdrawFa2OperationParams : vaultWithdrawType = record [
                                        from_ = vaultAddress;
                                        to_   = vaultOwner; 
                                        amt   = tokenBalance;
                                        token = Fa2(_token);
                                    ];
                                    const withdrawFa2Operation : operation = Tezos.transaction(
                                        withdrawFa2OperationParams,
                                        0mutez,
                                        getVaultWithdrawEntrypoint(vaultAddress)
                                    );

                                } with withdrawFa2Operation
                            ];

                            operations := withdrawTokenOperation # operations;
                        };

                        // save and update balance for collateral token to zero
                        _vault.collateralBalanceLedger[tokenName]  := 0n;

                    }; // end if/else check for tez/token

                }; // end loop for withdraw operations of tez/tokens in vault collateral 


                // remove vault from stroage
                var ownerVaultSet : ownerVaultSetType := case s.ownerLedger[vaultOwner] of [
                        Some (_set) -> _set
                    |   None        -> failwith("Error. Owner vault set not found.")
                ];
                s.ownerLedger[vaultOwner] := Set.remove(vaultId, ownerVaultSet);
                remove vaultHandle from map s.vaults;
                remove vaultId from map s.vaultLedger;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdrawFromVault lambda *)
function lambdaWithdrawFromVault(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    var operations               : list(operation)  := nil;

    case vaultControllerLambdaAction of [
        |   LambdaWithdrawFromVault(withdrawFromVaultParams) -> {
                
                // init variables for convenience
                const vaultId                : vaultIdType       = withdrawParams.id; 
                const withdrawTokenAmount    : nat               = withdrawParams.tokenAmount;
                const tokenName              : string            = withdrawParams.tokenName;
                // const recipient              : contract(unit)    = withdrawParams.to_;
                const recipient              : address           = Tezos.get_sender();
                const initiator              : vaultOwnerType    = Tezos.get_sender();

                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // get vault
                var vault : vaultType := getVault(vaultHandle, s);

                // if tez is to be withdrawn, check that Tezos amount should be the same as withdraw amount
                if tokenName = "tez" then block {
                    if mutezToNatural(Tezos.amount) =/= withdrawTokenAmount then failwith("Error. Tezos amount and withdraw token amount do not match.") else skip;
                } else skip;

                // get token collateral balance in vault, fail if none found
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                        Some(_balance) -> _balance
                    |   None -> failwith("Error. You do not have any tokens to withdraw.")
                ];

                // calculate new vault balance
                if withdrawTokenAmount > vaultTokenCollateralBalance then failwith("Error. Token withdrawal amount cannot be greater than your collateral balance.") else skip;
                const newCollateralBalance : nat  = abs(vaultTokenCollateralBalance - withdrawTokenAmount);

                // check if vault is undercollaterized, if not then send withdraw operation
                if isUnderCollaterized(vault, s) 
                then failwith("Error. Withdrawal is not allowed as vault is undercollaterized.") 
                else skip;
                
                // get collateral token record - with token contract address and token type
                const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                        Some(_collateralTokenRecord) -> _collateralTokenRecord
                    |   None -> failwith("Error. Collateral Token Record not found in collateral token ledger.")
                ];

                // pattern match withdraw operation based on token type
                const withdrawOperation : operation = case collateralTokenRecord.tokenType of [
                    
                    Tez(_tez) -> block {
                        
                        const withdrawTezOperationParams : vaultWithdrawType = record [
                            from_ = vault.address;
                            to_   = recipient; 
                            amt   = withdrawTokenAmount;
                            token = Tez(_tez);
                        ];
                        const withdrawTezOperation : operation = Tezos.transaction(
                            withdrawTezOperationParams,
                            0mutez,
                            getVaultWithdrawEntrypoint(vault.address)
                        );

                    } with withdrawTezOperation

                    | Fa12(_token) -> block {

                        const withdrawFa12OperationParams : vaultWithdrawType = record [
                            from_ = vault.address;
                            to_   = recipient; 
                            amt   = withdrawTokenAmount;
                            token = Fa12(_token);
                        ];
                        const withdrawFa12Operation : operation = Tezos.transaction(
                            withdrawFa12OperationParams,
                            0mutez,
                            getVaultWithdrawEntrypoint(vault.address)
                        );

                    } with withdrawFa12Operation

                    | Fa2(_token) -> block {

                        const withdrawFa2OperationParams : vaultWithdrawType = record [
                            from_ = vault.address;
                            to_   = recipient; 
                            amt   = withdrawTokenAmount;
                            token = Fa2(_token);
                        ];
                        const withdrawFa2Operation : operation = Tezos.transaction(
                            withdrawFa2OperationParams,
                            0mutez,
                            getVaultWithdrawEntrypoint(vault.address)
                        );

                    } with withdrawFa2Operation

                ];

                operations := withdrawOperation # operations;

                // save and update new balance for collateral token
                vault.collateralBalanceLedger[tokenName] := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* registerDeposit lambda *)
function lambdaRegisterDeposit(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    

    case vaultControllerLambdaAction of [
        |   LambdaRegisterDeposit(registerDepositParams) -> {
                
                // init variables for convenience
                const vaultHandle     : vaultHandleType   = registerDepositParams.handle;
                const depositAmount   : nat               = registerDepositParams.amount;
                const tokenName       : string            = registerDepositParams.tokenName;

                const initiator       : address           = Tezos.get_sender(); // vault address that initiated deposit

                // check if token exists in collateral token ledger
                const _collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                        Some(_record) -> _record
                    |   None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
                ];

                // get vault
                var vault : vaultType := getVault(vaultHandle, s);

                // check if sender matches vault owner; if match, then update and save vault with new collateral balance
                if vault.address =/= initiator then failwith("Error. Sender does not match vault owner address.") else skip;
                
                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                        Some(_balance) -> _balance
                    |   None -> 0n
                ];

                // calculate new collateral balance
                const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

                // save and update new balance for collateral token
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* liquidateVault lambda *)
function lambdaLiquidateVault(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    var operations          : list(operation)        := nil;

    case vaultControllerLambdaAction of [
        |   LambdaLiquidateVault(liquidateVaultParams) -> {
                
                // init variables for convenience
                const vaultHandle       : vaultHandleType         = liquidateParams.handle; 
                const loanQuantity      : nat                     = liquidateParams.loanQuantity;
                const loanToken         : string                  = liquidateParams.loanToken;

                const recipient         : address                 = Tezos.get_sender();
                const initiator         : initiatorAddressType    = Tezos.get_sender();

                const liquidationFee        : nat  = s.config.liquidationFee;       // liquidation fee - penalty fee paid by vault owner to liquidator
                const adminLiquidationFee   : nat  = s.config.adminLiquidationFee;  // admin liquidation fee - penalty fee paid by vault owner to treasury

                // get vault
                var _vault : vaultType := getVault(vaultHandle, s);

                // check if vault is under collaterized
                if isUnderCollaterized(_vault, s) 
                then skip 
                else failwith("Error. Vault is not undercollaterized and cannot be liquidated.");

                // check if there is sufficient loanOutstanding, and calculate remaining loan after liquidation
                if loanQuantity > _vault.loanOutstanding then failwith("Error. Cannot burn more than outstanding amount in vault.") else skip;
                const remainingLoan : nat = abs(_vault.loanOutstanding - loanQuantity);

                // get USDM target
                // var usdmTarget : nat  := case s.targetLedger["usdm"] of [
                //       Some(_nat) -> _nat
                //     | None -> failwith("Error. Target not found for USDM.")
                // ];
                
                // todo: fix extracted balance amount
                (* get 32/31 of the target price, meaning there is a 1/31 penalty (3.23%) for the oven owner for being liquidated *)
                // const totalExtractedBalance : nat = (usdmQuantity * usdmTarget * fixedPointAccuracy) / (31n * fixedPointAccuracy); 

                // usdmQuantity - 1e9 | usdmTarget - 1e24 | fixedPointAccuracy - 1e24
                // var totalValueToBeLiquidated           : nat := loanQuantity * usdmTarget / fixedPointAccuracy;

                // 1e9 * 1e24 * (1e3?) / 1e24
                // const liquidationFeeToLiquidator       : nat  = loanQuantity * usdmTarget * liquidationFee / fixedPointAccuracy; 

                // amount to be sent to treasury
                // 1e9 * 1e24 * (1e3?) / 1e24
                // const adminLiquidationFeeToLiquidator  : nat  = loanQuantity * usdmTarget * adminLiquidationFee / fixedPointAccuracy; 
                
                // total value to be liquidated and sent to liquidator
                totalValueToBeLiquidated := totalValueToBeLiquidated + liquidationFeeToLiquidator;
                    
                // get total vault collateral value
                var vaultCollateralValue      : nat := 0n;
                for tokenName -> tokenBalance in map _vault.collateralBalanceLedger block {
                    
                    if tokenName = "tez" then block {

                        // calculate value of tez balance with same fixed point accuracy as price
                        const tezValueWithFixedPointAccuracy : nat = tokenBalance * tezFixedPointAccuracy;

                        // increment vault collateral value
                        vaultCollateralValue := vaultCollateralValue + tezValueWithFixedPointAccuracy;
                        
                    } else block {

                        // get price of token in xtz
                        const tokenPrice : nat = case s.priceLedger[tokenName] of [
                            Some(_price) -> _price
                            | None         -> failwith("Error. Price not found for token.")
                        ];

                        // calculate value of collateral balance
                        const tokenValueInXtz : nat = tokenBalance * tokenPrice; 

                        // increment vault collateral value
                        vaultCollateralValue := vaultCollateralValue + tokenValueInXtz;

                    };
                };

                
                // loop tokens in vault collateral balance ledger to be liquidated
                var _extractedBalanceTracker   : nat := 0n;
                for tokenName -> tokenBalance in map _vault.collateralBalanceLedger block {

                    // skip if token balance is 0n
                    if tokenBalance = 0n then skip else block {

                        // get collateral token record - with token contract address and token type
                        const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                            Some(_collateralTokenRecord) -> _collateralTokenRecord
                            | None  -> failwith("Error. Collateral Token Record not found in collateral token ledger.")
                        ];

                        // get price of token in xtz
                        const tokenPrice : nat = case s.priceLedger[tokenName] of [
                            Some(_price) -> _price
                            | None -> failwith("Error. Price not found for token.")
                        ];

                        // calculate value of collateral balance
                        const tokenValueInXtz : nat = tokenBalance * tokenPrice; 

                        // increment extracted balance
                        _extractedBalanceTracker := _extractedBalanceTracker + tokenValueInXtz;

                        // get proportion of collateral balance against total collateral value
                        const tokenProportion : nat = tokenValueInXtz * fixedPointAccuracy / vaultCollateralValue;

                        // get balance to be extracted from token
                        const tokenProportionalLiquidationValue : nat = tokenProportion * totalValueToBeLiquidated;

                        // get quantity of tokens to be liquidated
                        const tokenQuantityToBeLiquidated : nat = (tokenProportionalLiquidationValue / tokenPrice) / fixedPointAccuracy;

                        // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                        var vaultTokenCollateralBalance : nat := case _vault.collateralBalanceLedger[tokenName] of [
                            Some(_balance) -> _balance
                            | None -> 0n
                        ];

                        // calculate new collateral balance
                        if tokenQuantityToBeLiquidated > vaultTokenCollateralBalance then failwith("Error. Token quantity to be liquidated cannot be more than balance of token collateral in vault.") else skip;
                        const newTokenCollateralBalance : nat = abs(vaultTokenCollateralBalance - tokenQuantityToBeLiquidated);

                        // send collateral to initiator of liquidation: pattern match withdraw operation based on token type
                        const initiatorTakeCollateralOperation : operation = case collateralTokenRecord.tokenType of [
                            Tez(_tez) -> block {
                                
                                const withdrawTezOperationParams : vaultWithdrawType = record [
                                    from_ = _vault.address;
                                    to_   = recipient; 
                                    amt   = tokenQuantityToBeLiquidated;
                                    token = Tez(_tez);
                                ];
                                const withdrawTezOperation : operation = Tezos.transaction(
                                    withdrawTezOperationParams,
                                    0mutez,
                                    getVaultWithdrawEntrypoint(_vault.address)
                                );

                            } with withdrawTezOperation
                            | Fa12(_token) -> block {

                                const withdrawFa12OperationParams : vaultWithdrawType = record [
                                    from_ = _vault.address;
                                    to_   = recipient; 
                                    amt   = tokenQuantityToBeLiquidated;
                                    token = Fa12(_token);
                                ];
                                const withdrawFa12Operation : operation = Tezos.transaction(
                                    withdrawFa12OperationParams,
                                    0mutez,
                                    getVaultWithdrawEntrypoint(_vault.address)
                                );

                            } with withdrawFa12Operation
                            | Fa2(_token) -> block {

                                const withdrawFa2OperationParams : vaultWithdrawType = record [
                                    from_ = _vault.address;
                                    to_   = recipient; 
                                    amt   = tokenQuantityToBeLiquidated;
                                    token = Fa2(_token);
                                ];
                                const withdrawFa2Operation : operation = Tezos.transaction(
                                    withdrawFa2OperationParams,
                                    0mutez,
                                    getVaultWithdrawEntrypoint(_vault.address)
                                );

                            } with withdrawFa2Operation
                        ];

                        operations := initiatorTakeCollateralOperation # operations;

                        // save and update new balance for collateral token
                        _vault.collateralBalanceLedger[tokenName]  := newTokenCollateralBalance;

                    };

                };

                // operation to transfer loan token back to the Token Pool
                // const burnUsdmOperationParams : mintOrBurnParamsType = record [
                //     quantity = -usdmQuantity;
                //     target   = initiator;
                // ];
                // const burnUsdmOperation : operation = Tezos.transaction(
                //     burnUsdmOperationParams,
                //     0mutez,
                //     getUsdmMintOrBurnEntrypoint(s.usdmTokenAddress)
                // );
                // operations := burnUsdmOperation # operations;

                // Create transfer token params and operation
                const transferLoanTokenParams : transferActionType = list [
                    record [
                        to_        = tokenPoolContractAddress;
                        token      = _tokenTransferType; // todo: get loan token type 
                        amount     = loanQuantity;
                    ]
                ];

                const tokenPoolTransferOperation : operation = Tezos.transaction(
                    transferLoanTokenParams, 
                    0tez, 
                    sendTransferOperationToTreasury(tokenPoolContractAddress)
                );

                operations := treasuryTransferOperation # operations;


                // save and update new loanOutstanding and balance for collateral token
                _vault.loanOutstanding                    := remainingLoan;
                s.vaults[vaultHandle]                     := _vault;

                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* borrow lambda *)
function lambdaBorrow(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    var operations          : list(operation)        := nil;

    case vaultControllerLambdaAction of [
        |   LambdaBorrow(borrowParams) -> {
                
                // Init variables for convenience
                const vaultId            : nat                     = borrowParams.vaultId; 
                const quantity           : nat                     = borrowParams.quantity;
                const initiator          : initiatorAddressType    = Tezos.get_sender();
                var finalBorrowQuantity  : nat                     = quantity;
                
                // Init loan fees
                const minimumLoanFee   : nat = s.config.minimumLoanFee;
                const decimals         : nat = s.config.decimals;

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // Get vault if exists
                var vault : vaultType := getVault(vaultHandle, s);

                // Get loan token type
                const vaultLoanToken : string = vault.loanToken; // USDT, EURL, some other crypto coin
                const loanTokenType : tokenType = case s.loanTokenLedger[vaultLoanToken] of [
                        Some(_loanToken) -> _loanToken.tokenType
                    |   None             -> failwith("error loan token not found")
                ];

                // check if vault is undercollaterized; if it is not, then allow user to borrow
                if isUnderCollaterized(vault, s) 
                then failwith("Error. Excessive minting and vault will be undercollaterized.")
                else skip;

                // ------------------------------------------------------------------
                // Calculate Service Loan Fees
                // ------------------------------------------------------------------
                
                // Charge a minimum loan fee if user is borrowing
                const loanFee : nat = finalBorrowQuantity * minimumLoanFee / decimals;

                // Init total fee 
                var totalFees : nat = loanFee;

                // ------------------------------------------------------------------
                // Calculate fees on past loan outstanding
                // ------------------------------------------------------------------

                // calculate outstanding service fee amount
                if vault.loanOutstanding > 0n then block {
                    
                    const lastUpdatedBlockLevel     : nat   = vault.lastUpdatedBlockLevel;
                    const today                     : nat   = Tezos.get_level();
                    const dailyServiceLoanFee       : nat   = s.config.dailyServiceLoanFee;                   // daily service loan fee
                    const blocksPerDay              : nat   = s.config.blocksPerMinute * 60n * 24n;           // 2880 blocks per day -> if 2 blocks per minute 
                    
                    const daysPassed                : nat   = abs(today - lastUpdatedBlockLevel) / blocksPerDay; // only include whole days since remainder is not factored in division here
                    const totalServiceLoanFee       : nat   = daysPassed * dailyServiceLoanFee; 

                    // update finalBorrowQuantity
                    if totalServiceLoanFee > finalBorrowQuantity then failwith("Error. Total service loan fee cannot be greater than borrowed amount.") else skip;
                    finalBorrowQuantity := finalBorrowQuantity - totalServiceLoanFee

                    // update vault last updated block level
                    vault.lastUpdatedBlockLevel = Tezos.get_level();

                    // increment total fees
                    totalFees := totalFees + totalServiceLoanFee;

                } else skip;

                // ------------------------------------------------------------------
                // Calculate Final Borrow Amount
                // ------------------------------------------------------------------

                // reduce finalBorrowQuantity by loan fee
                if loanFee > finalBorrowQuantity then failwith("Error. Loan Fee to pay cannot be greater than borrowed amount.") else skip;
                finalBorrowQuantity := abs(finalBorrowQuantity - loanFee);

                // ------------------------------------------------------------------
                // Process Transfers
                // ------------------------------------------------------------------
                
                // Get Treasury Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasury", s.governanceAddress);
                const treasuryAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TREASURY_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Token Pool Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "tokenPool", s.governanceAddress);
                const tokenPoolAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TOKEN_POOL_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Send total fees from Token Pool Contract to Treasury 
                const sendFeesToTreasuryParams : transferActionType = list [
                    record [
                        to_        = treasuryAddress;
                        token      = loanTokenType;
                        amount     = totalFees;
                    ]
                ];

                const sendFeesToTreasuryOperation : operation = Tezos.transaction(
                    sendFeesToTreasuryParams,
                    0mutez,
                    getTransferEntrypointInTokenPoolContract(tokenPoolAddress)
                );

                operations := sendFeesToTreasuryParams # operations;

                // Send final borrowed quantity to initiator
                const sendFinalBorrowedQuantityToUserParams : transferActionType = list [
                    record [
                        to_        = initiator;
                        token      = loanTokenType;
                        amount     = finalBorrowQuantity;
                    ]
                ];

                const sendFinalBorrowedQuantityToUserOperation : operation = Tezos.transaction(
                    sendFinalBorrowedQuantityToUserParams,
                    0mutez,
                    getTransferEntrypointInTokenPoolContract(tokenPoolAddress)
                );

                operations := sendFinalBorrowedQuantityToUserOperation # operations;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Increment vault's loanOutstanding by original quantity borrowed
                vault.loanOutstanding := vault.loanOutstanding + quantity;    

                // update vault
                s.vaults[vaultHandle] := vault;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* repay lambda *)
function lambdaRepay(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    var operations          : list(operation)        := nil;

    case vaultControllerLambdaAction of [
        |   LambdaRepay(repayParams) -> {
                
                // Init variables for convenience
                const vaultId            : nat                     = borrowParams.vaultId; 
                const quantity           : nat                     = borrowParams.quantity;
                const initiator          : initiatorAddressType    = Tezos.get_sender();
                var finalRepaymentQuantity   : nat                     = quantity;
                
                // Init loan fees
                const decimals         : nat = s.config.decimals;

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // Get vault if exists
                var vault : vaultType := getVault(vaultHandle, s);
                
                // Get loan token type
                const vaultLoanToken   : string = vault.loanToken; // USDT, EURL, some other crypto coin
                const loanTokenType    : tokenType = case s.loanTokenLedger[vaultLoanToken] of [
                        Some(_loanToken) -> _loanToken.tokenType
                    |   None             -> failwith("error loan token not found")
                ];
                const loanTokenAddress  : address = loanTokenType.tokenContractAddress;
                const loanTokenId       : nat     = loanTokenType.tokenId;

                // Init total fee 
                var totalFees : nat = 0n;

                // ------------------------------------------------------------------
                // Calculate fees on past loan outstanding
                // ------------------------------------------------------------------

                // calculate outstanding service fee amount
                if vault.loanOutstanding > 0n then block {
                    
                    const lastUpdatedBlockLevel     : nat   = vault.lastUpdatedBlockLevel;
                    const today                     : nat   = Tezos.get_level();
                    const dailyServiceLoanFee       : nat   = s.config.dailyServiceLoanFee;                   // daily service loan fee
                    const blocksPerDay              : nat   = s.config.blocksPerMinute * 60n * 24n;           // 2880 blocks per day -> if 2 blocks per minute 
                    
                    const daysPassed                : nat   = abs(today - lastUpdatedBlockLevel) / blocksPerDay; // only include whole days since remainder is not factored in division here
                    const totalServiceLoanFee       : nat   = daysPassed * dailyServiceLoanFee; 

                    // update vault last updated block level
                    vault.lastUpdatedBlockLevel = Tezos.get_level();

                    // increment total fees
                    totalFees := totalFees + totalServiceLoanFee;

                } else skip;

                // ------------------------------------------------------------------
                // Calculate Final Repay Amount
                // ------------------------------------------------------------------

                // repaid amount first goes to cover the accrued fees (interest), before repaying the principal amount
                finalRepaymentQuantity := if totalFees > finalRepaymentQuantity then 0n else abs(finalRepaymentQuantity - totalFees);

                // ------------------------------------------------------------------
                // Process Transfers
                // ------------------------------------------------------------------
                
                // Get Treasury Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasury", s.governanceAddress);
                const treasuryAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TREASURY_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Token Pool Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "tokenPool", s.governanceAddress);
                const tokenPoolAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TOKEN_POOL_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Send total fees from initiator to Treasury 
                const sendFeesToTreasuryParams : transferActionType = list [
                    record [
                        to_        = treasuryAddress;
                        token      = loanTokenType;
                        amount     = totalFees;
                    ]
                ];

                const sendFeesToTreasuryOperation : operation = Tezos.transaction(
                    sendFeesToTreasuryParams,
                    0mutez,
                    getTransferEntrypointFromTokenAddress(loanTokenAddress)
                );

                operations := sendFeesToTreasuryParams # operations;

                // process repayment of principal if final repayment quantity is greater than 0
                if finalRepaymentQuantity > 0n then {

                    // Send final repay quantity from initiator to Token Pool contract
                    const sendFinalRepaymentQuantityToUserParams : transferActionType = list [
                        record [
                            to_        = tokenPoolAddress;
                            token      = loanTokenType;
                            amount     = finalRepaymentQuantity;
                        ]
                    ];

                    const sendFinalRepaymentQuantityToUserOperation : operation = Tezos.transaction(
                        sendFinalRepaymentQuantityToUserParams,
                        0mutez,
                        getTransferEntrypointFromTokenAddress(loanTokenAddress)
                    );

                    operations := sendFinalRepaymentQuantityToUserOperation # operations;

                } else skip;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Decrement vault's loanOutstanding by original quantity borrowed
                vault.loanOutstanding := abs(vault.loanOutstanding - quantity);    

                // update vault
                s.vaults[vaultHandle] := vault;
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Vault Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Staked MVK Lambdas Begin
// ------------------------------------------------------------------------------

(* depositStakedMvk lambda *)
function lambdaDepositStakedMvk(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    var operations        : list(operation)  := nil;

    case vaultControllerLambdaAction of [
        |   LambdaDepositStakedMvk(depositStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultDepositStakedMvkParams.vaultId;
                const depositAmount   : nat               = vaultDepositStakedMvkParams.depositAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "sMVK";

                // check if token (sMVK) exists in collateral token ledger
                const _collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                    Some(_record) -> _record
                    | None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
                ];

                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault
                var vault : vaultType := getVault(vaultHandle, s);

                // Find doorman Token Controller address
                const doormanAddress : address = case s.generalContracts["doorman"] of [
                    Some(_address) -> _address
                    | None           -> failwith("Error. Doorman contract not found.")
                ];

                // create operation to doorman to update balance of staked MVK from user to vault
                const vaultDepositStakedMvkOperation : operation = Tezos.transaction(
                    vaultDepositStakedMvkParams,
                    0tez,
                    getVaultDepositStakedMvkEntrypoint(doormanAddress)
                );
                operations := vaultDepositStakedMvkOperation # operations;
                
                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                    Some(_balance) -> _balance
                    | None           -> 0n
                ];

                // calculate new collateral balance
                const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

                // save and update new balance for collateral token
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;

                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdrawStakedMvk lambda *)
function lambdaWithdrawStakedMvk(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    var operations        : list(operation)  := nil;

    case vaultControllerLambdaAction of [
        |   LambdaWithdrawStakedMvk(withdrawStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultWithdrawStakedMvkParams.vaultId;
                const withdrawAmount  : nat               = vaultWithdrawStakedMvkParams.withdrawAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "sMVK";

                // check if token (sMVK) exists in collateral token ledger
                const _collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                    Some(_record) -> _record
                    | None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
                ];

                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault
                var vault : vaultType := getVault(vaultHandle, s);

                // Find doorman Token Controller address
                const doormanAddress : address = case s.generalContracts["doorman"] of [
                    Some(_address) -> _address
                    | None           -> failwith("Error. Doorman contract not found.")
                ];

                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                    Some(_balance) -> _balance
                    | None           -> 0n
                ];

                // calculate new collateral balance
                if withdrawAmount > vaultTokenCollateralBalance then failwith("Error. You do not have enough collateral balance.") else skip;
                const newCollateralBalance : nat = abs(vaultTokenCollateralBalance - withdrawAmount);

                // create operation to doorman to update balance of staked MVK from user to vault
                const vaultWithdrawStakedMvkOperation : operation = Tezos.transaction(
                    vaultWithdrawStakedMvkParams,
                    0tez,
                    getVaultWithdrawStakedMvkEntrypoint(doormanAddress)
                );
                operations := vaultWithdrawStakedMvkOperation # operations;
                
                // save and update new balance for collateral token
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;

                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* liquidateStakedMvk lambda *)
function lambdaLiquidateStakedMvk(const vaultControllerLambdaAction : vaultControllerLambdaActionType; var s : vaultControllerStorageType) : return is
block {
    
    // only callable from self (i.e. from LiquidateVault entrypoint, if owner of vault being liquidated has staked mvk as collateral)
    checkSenderIsSelf(unit);

    var operations        : list(operation)  := nil;

    case vaultControllerLambdaAction of [
        |   LambdaLiquidateStakedMvk(liquidateStakedMvkParams) -> {
                
                
                // init variables for convenience
                const vaultId           : vaultIdType       = vaultLiquidateStakedMvkParams.vaultId;
                const vaultOwner        : vaultOwnerType    = vaultLiquidateStakedMvkParams.vaultOwner;
                const liquidatedAmount  : nat               = vaultLiquidateStakedMvkParams.liquidatedAmount;
                const _liquidator        : address          = vaultLiquidateStakedMvkParams.liquidator;
                
                const tokenName       : string            = "sMVK";

                // check if token (sMVK) exists in collateral token ledger
                const _collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                    Some(_record) -> _record
                    | None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
                ];

                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault
                var vault : vaultType := getVault(vaultHandle, s);

                // Find doorman Token Controller address
                const doormanAddress : address = case s.generalContracts["doorman"] of [
                    Some(_address) -> _address
                    | None           -> failwith("Error. Doorman contract not found.")
                ];

                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                    Some(_balance) -> _balance
                    | None           -> failwith("Error. Vault collateral has zero balalnce.")
                ];

                // calculate new collateral balance
                if liquidatedAmount > vaultTokenCollateralBalance then failwith("Error. You do not have enough collateral balance.") else skip;
                const newCollateralBalance : nat = abs(vaultTokenCollateralBalance - liquidatedAmount);

                // create operation to doorman to update balance of staked MVK from user to vault
                const vaultLiquidateStakedMvkOperation : operation = Tezos.transaction(
                    vaultLiquidateStakedMvkParams,
                    0tez,
                    getVaultLiquidateStakedMvkEntrypoint(doormanAddress)
                );
                operations := vaultLiquidateStakedMvkOperation # operations;
                
                // save and update new balance for collateral token in liquidated vault
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;

                
            }
        |   _ -> skip
    ];

} with (operations, s)


// ------------------------------------------------------------------------------
// Vault Staked MVK Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Vault Controller Lambdas End
//
// ------------------------------------------------------------------------------
