// // Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
// #include "../partials/whitelistContractsType.ligo"

// // General Contracts: generalContractsType, updateGeneralContractsParams
// #include "../partials/generalContractsType.ligo"

// // MvkToken types for transfer
// #include "../partials/types/mvkTokenTypes.ligo"

// // Vesting types for vesting council actions
// #include "../partials/types/vestingTypes.ligo"

// // Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
// #include "../partials/whitelistTokenContractsType.ligo"

// // Treasury types for transfer and mint
// #include "../partials/types/treasuryTypes.ligo"

// // General Contracts: generalContractsType, updateGeneralContractsParams
// #include "../partials/types/councilTypes.ligo"

// type councilAction is 
//     | Default of unit
//     | SetAdmin of address
//     | UpdateMetadata of (string * bytes)
//     | UpdateConfig of councilUpdateConfigParamsType
//     | UpdateWhitelistContracts of updateWhitelistContractsParams
//     | UpdateGeneralContracts of updateGeneralContractsParams

//     // Council members action
//     | UpdateCouncilMemberInfo of councilMemberInfoType

//     // Council actions for contracts
//     | CouncilActionUpdateBlocksPerMin of councilActionUpdateBlocksPerMinType

//     // Council actions for vesting
//     | CouncilActionAddVestee of addVesteeType
//     | CouncilActionRemoveVestee of address
//     | CouncilActionUpdateVestee of updateVesteeType
//     | CouncilActionToggleVesteeLock of address
    
//     // Council actions for internal control
//     | CouncilActionAddMember of councilActionAddMemberType
//     | CouncilActionRemoveMember of address
//     | CouncilActionChangeMember of councilActionChangeMemberType
//     | CouncilActionTransfer of councilActionTransferType

//     // Council actions to Governance DAO and Treasury
//     | CouncilActionRequestTokens of councilActionRequestTokensType
//     | CouncilActionRequestMint of councilActionRequestMintType
//     | CouncilActionDropFinancialReq of nat

//     | SignAction of nat                
//     | FlushAction of flushActionType

// const noOperations : list (operation) = nil;
// type return is list (operation) * councilStorage

// // consideration: may need a lambda function to be able to send calls to future unspecified entrypoints if needed

// // admin helper functions begin ---------------------------------------------------------
// function checkSenderIsAdmin(var s : councilStorage) : unit is
//     if (Tezos.sender = s.admin) then unit
//         else failwith("Only the administrator can call this entrypoint.");

// function checkSenderIsCouncilMember(var s : councilStorage) : unit is
//     if Map.mem(Tezos.sender, s.councilMembers) then unit 
//         else failwith("Only council members can call this entrypoint.");

// function checkNoAmount(const _p : unit) : unit is
//     if (Tezos.amount = 0tez) then unit
//         else failwith("This entrypoint should not receive any tez.");

// // Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
// #include "../partials/whitelistContractsMethod.ligo"

// function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: councilStorage): return is
//   block {
//     // check that sender is admin
//     checkSenderIsAdmin(s);

//     s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
//   } with (noOperations, s)

// // General Contracts: checkInGeneralContracts, updateGeneralContracts
// #include "../partials/generalContractsMethod.ligo"

// function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: councilStorage): return is
//   block {
//     // check that sender is admin
//     checkSenderIsAdmin(s);

//     s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
//   } with (noOperations, s)

// // admin helper functions end ---------------------------------------------------------

// function sendUpdateBlocksPerMinuteParams(const contractAddress : address) : contract(nat) is
//   case (Tezos.get_entrypoint_opt(
//       "%updateBlocksPerMinute",
//       contractAddress) : option(contract(nat))) of [
//     Some(contr) -> contr
//   | None -> (failwith("updateBlocksPerMinutes entrypoint in Contract not found") : contract(nat))
// ];

// function sendAddVesteeParams(const contractAddress : address) : contract(addVesteeType) is
//   case (Tezos.get_entrypoint_opt(
//       "%addVestee",
//       contractAddress) : option(contract(addVesteeType))) of [
//     Some(contr) -> contr
//   | None -> (failwith("addVestee entrypoint in Vesting Contract not found") : contract(addVesteeType))
// ];

// function sendRemoveVesteeParams(const contractAddress : address) : contract(address) is
//   case (Tezos.get_entrypoint_opt(
//       "%removeVestee",
//       contractAddress) : option(contract(address))) of [
//     Some(contr) -> contr
//   | None -> (failwith("removeVestee entrypoint in Vesting Contract not found") : contract(address))
// ];

// function sendUpdateVesteeParams(const contractAddress : address) : contract(updateVesteeType) is
// case (Tezos.get_entrypoint_opt(
//     "%updateVestee",
//     contractAddress) : option(contract(updateVesteeType))) of [
// Some(contr) -> contr
// | None -> (failwith("updateVestee entrypoint in Vesting Contract not found") : contract(updateVesteeType))
// ];

// function sendToggleVesteeLockParams(const contractAddress : address) : contract(address) is
// case (Tezos.get_entrypoint_opt(
//     "%toggleVesteeLock",
//     contractAddress) : option(contract(address))) of [
// Some(contr) -> contr
// | None -> (failwith("toggleVesteeLock entrypoint in Vesting Contract not found") : contract(address))
// ];

// function sendRequestTokensParams(const contractAddress : address) : contract(councilActionRequestTokensType) is
//   case (Tezos.get_entrypoint_opt(
//       "%requestTokens",
//       contractAddress) : option(contract(councilActionRequestTokensType))) of [
//     Some(contr) -> contr
//   | None -> (failwith("requestTokens entrypoint in Governance Contract not found") : contract(councilActionRequestTokensType))
// ];

// function sendRequestMintParams(const contractAddress : address) : contract(councilActionRequestMintType) is
//   case (Tezos.get_entrypoint_opt(
//       "%requestMint",
//       contractAddress) : option(contract(councilActionRequestMintType))) of [
//     Some(contr) -> contr
//   | None -> (failwith("requestMint entrypoint in Governance Contract not found") : contract(councilActionRequestMintType))
// ];

// function sendDropFinancialRequestParams(const contractAddress : address) : contract(nat) is
//   case (Tezos.get_entrypoint_opt(
//       "%dropFinancialRequest",
//       contractAddress) : option(contract(nat))) of [
//     Some(contr) -> contr
//   | None -> (failwith("dropFinancialRequest entrypoint in Governance Contract not found") : contract(nat))
// ];


// ////
// // TRANSFER FUNCTIONS
// ///
// function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)

// function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenContractAddress: address): operation is
//     block{
//         const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

//         const tokenContract: contract(fa12TransferType) =
//             case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of [
//                 Some (c) -> c
//             |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
//             ];
//     } with (Tezos.transaction(transferParams, 0tez, tokenContract))

// function transferFa2Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenContractAddress: address): operation is
// block{
//     const transferParams: fa2TransferType = list[
//             record[
//                 from_ = from_;
//                 txs = list[
//                     record[
//                         to_      = to_;
//                         token_id = tokenId;
//                         amount   = tokenAmount;
//                     ]
//                 ]
//             ]
//         ];

//     const tokenContract: contract(fa2TransferType) =
//         case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa2TransferType))) of [
//             Some (c) -> c
//         |   None -> (failwith("Error. Transfer entrypoint not found in FA2 Token contract"): contract(fa2TransferType))
//         ];
// } with (Tezos.transaction(transferParams, 0tez, tokenContract))


// ////
// // Housekeeping Entrypoints
// ///

// (*  set contract admin address *)
// function setAdmin(const newAdminAddress : address; var s : councilStorage) : return is
// block {
//     checkNoAmount(Unit); // entrypoint should not receive any tez amount
//     checkSenderIsAdmin(s); // check that sender is admin
//     s.admin := newAdminAddress;
// } with (noOperations, s)

// (*  update the metadata at a given key *)
// function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : councilStorage) : return is
// block {
//     checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    
//     // Update metadata
//     s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
// } with (noOperations, s)

// (*  update the info of a council member *)
// function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : councilStorage) : return is
// block {
//     // Check if sender is a member of the council
//     var councilMember: councilMemberInfoType := case Map.find_opt(Tezos.sender, s.councilMembers) of [
//         Some (_info) -> _info
//     |   None -> failwith("Error. You are not a member of the council")
//     ];
    
//     // Update member info
//     councilMember.name      := councilMemberInfo.name;
//     councilMember.website   := councilMemberInfo.website;
//     councilMember.image     := councilMemberInfo.image;

//     // Update storage
//     s.councilMembers[Tezos.sender]  := councilMember;
// } with (noOperations, s)

// (*  updateConfig entrypoint  *)
// function updateConfig(const updateConfigParams : councilUpdateConfigParamsType; var s : councilStorage) : return is 
// block {

//   checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
//   checkSenderIsAdmin(s); // check that sender is admin

//   const updateConfigAction    : councilUpdateConfigActionType   = updateConfigParams.updateConfigAction;
//   const updateConfigNewValue  : councilUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

//   case updateConfigAction of [
//     ConfigThreshold (_v)                  -> if updateConfigNewValue > Map.size(s.councilMembers) then failwith("Error. This config value cannot exceed the amount of members in the council") else s.config.threshold := updateConfigNewValue
//   | ConfigActionExpiryDays (_v)           -> s.config.actionExpiryDays          := updateConfigNewValue  
//   ];

// } with (noOperations, s)

// ////
// // Council Action Entrypoints
// ///

// function councilActionAddMember(const newCouncilMember : councilActionAddMemberType ; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check if new council member is already in the council
//     if Map.mem(newCouncilMember.memberAddress, s.councilMembers) then failwith("Error. The provided council member is already in the council")
//     else skip;

//     const addressMap          : addressMapType     = map [
//             ("councilMemberAddress" : string) -> newCouncilMember.memberAddress
//         ];
//     const stringMap           : stringMapType      = map [
//             ("councilMemberName": string) -> newCouncilMember.memberName;
//             ("councilMemberImage": string) -> newCouncilMember.memberImage;
//             ("councilMemberWebsite": string) -> newCouncilMember.memberWebsite
//     ];
//     const emptyNatMap         : natMapType         = map [];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "addCouncilMember";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = stringMap;
//         natMap                = emptyNatMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionRemoveMember(const councilMemberAddress : address ; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check if council member is in the council
//     if not Map.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is not in the council")
//     else skip;

//     // Check if removing the council member won't impact the threshold
//     if (abs(Map.size(s.councilMembers) - 1n)) < s.config.threshold then failwith("Error. Removing a council member will have an impact on the threshold. Try to adjust the threshold first.")
//     else skip;

//     const addressMap          : addressMapType     = map [
//             ("councilMemberAddress" : string) -> councilMemberAddress
//         ];
//     const emptyStringMap      : stringMapType      = map [];
//     const emptyNatMap         : natMapType         = map [];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "removeCouncilMember";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = emptyStringMap;
//         natMap                = emptyNatMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionChangeMember(const councilActionChangeMemberParams : councilActionChangeMemberType; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check if new council member is already in the council
//     if Map.mem(councilActionChangeMemberParams.newCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided new council member is already in the council")
//     else skip;

//     // Check if old council member is in the council
//     if not Map.mem(councilActionChangeMemberParams.oldCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided old council member is not in the council")
//     else skip;

//     const addressMap          : addressMapType     = map [
//         ("oldCouncilMemberAddress" : string) -> councilActionChangeMemberParams.oldCouncilMemberAddress;
//         ("newCouncilMemberAddress" : string) -> councilActionChangeMemberParams.newCouncilMemberAddress;
//     ];
//     const stringMap           : stringMapType      = map [
//         ("newCouncilMemberName" : string) -> councilActionChangeMemberParams.newCouncilMemberName;
//         ("newCouncilMemberWebsite" : string) -> councilActionChangeMemberParams.newCouncilMemberWebsite;
//         ("newCouncilMemberImage" : string) -> councilActionChangeMemberParams.newCouncilMemberImage;
//     ];
//     const emptyNatMap         : natMapType         = map [];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "changeCouncilMember";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = stringMap;
//         natMap                = emptyNatMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionTransfer(const councilActionTransferParams : councilActionTransferType; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check if type is correct
//     if councilActionTransferParams.tokenType = "FA12" or
//     councilActionTransferParams.tokenType = "FA2" or
//     councilActionTransferParams.tokenType = "XTZ" then skip
//     else failwith("Error. Wrong token type provided. Only FA12/FA2/XTZ allowed");

//     const addressMap : addressMapType     = map [
//         ("receiverAddress"       : string) -> councilActionTransferParams.receiverAddress;
//         ("tokenContractAddress"  : string) -> councilActionTransferParams.tokenContractAddress;
//     ];
//     const stringMap : stringMapType      = map [
//         ("tokenType"             : string) -> councilActionTransferParams.tokenType; 
//         ("purpose"               : string) -> councilActionTransferParams.purpose; 
//     ];
//     const natMap : natMapType         = map [
//         ("tokenAmount"           : string) -> councilActionTransferParams.tokenAmount;
//         ("tokenId"               : string) -> councilActionTransferParams.tokenId;
//     ];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "transfer";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = stringMap;
//         natMap                = natMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionUpdateBlocksPerMinute(const councilActionUpdateBlocksPerMinParam : councilActionUpdateBlocksPerMinType ; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check that blocks per minute will not break the system
//     if councilActionUpdateBlocksPerMinParam.newBlocksPerMinute = 0n then failwith("Error. The provided new blocksPerMinutes would break the system")
//     else skip;

//     // Check if the provided contract has a updateBlocksPerMinute entrypoint
//     const _checkEntrypoint: contract(nat)    = sendUpdateBlocksPerMinuteParams(councilActionUpdateBlocksPerMinParam.contractAddress);

//     const addressMap : addressMapType     = map [
//         ("contractAddress": string) -> councilActionUpdateBlocksPerMinParam.contractAddress
//     ];
//     const emptyStringMap : stringMapType  = map [];
//     const natMap : natMapType            = map [
//         ("newBlocksPerMinute"  : string) -> councilActionUpdateBlocksPerMinParam.newBlocksPerMinute;
//     ];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "updateBlocksPerMinute";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = emptyStringMap;
//         natMap                = natMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionAddVestee(const addVesteeParams : addVesteeType ; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);
    
//     // Check if the vesting has a addVestee entrypoint
//     var vestingAddress : address := case s.generalContracts["vesting"] of [
//         Some(_address) -> _address
//         | None -> failwith("Error. Vesting Contract Address not found")
//     ];
//     const _checkEntrypoint: contract(addVesteeType)    = sendAddVesteeParams(vestingAddress);

//     // init parameters
//     const vesteeAddress          : address  = addVesteeParams.vesteeAddress;
//     const totalAllocatedAmount   : nat      = addVesteeParams.totalAllocatedAmount;
//     const cliffInMonths          : nat      = addVesteeParams.cliffInMonths;
//     const vestingInMonths        : nat      = addVesteeParams.vestingInMonths;

//     // Check if the vestee already exists
//     const getVesteeOptView : option (option(vesteeRecordType)) = Tezos.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
//     case getVesteeOptView of [
//         Some (_value) -> case _value of [
//             Some (_vestee) -> failwith ("Error. This vestee already exists")
//         |   None -> skip
//         ]
//     |   None -> failwith ("Error. GetVesteeOpt view does not exist in the vesting contract")
//     ];

//     const addressMap : addressMapType     = map [
//         ("vesteeAddress"         : string) -> vesteeAddress;
//     ];
//     const emptyStringMap : stringMapType = map [];
//     const natMap : natMapType            = map [
//         ("totalAllocatedAmount"  : string) -> totalAllocatedAmount;
//         ("cliffInMonths"         : string) -> cliffInMonths;
//         ("vestingInMonths"       : string) -> vestingInMonths;
//     ];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "addVestee";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = emptyStringMap;
//         natMap                = natMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionRemoveVestee(const vesteeAddress : address ; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);
    
//     // Check if the vesting has a removeVestee entrypoint
//     var vestingAddress : address := case s.generalContracts["vesting"] of [
//         Some(_address) -> _address
//         | None -> failwith("Error. Vesting Contract Address not found")
//     ];
//     const _checkEntrypoint: contract(address)    = sendRemoveVesteeParams(vestingAddress);

//     // Check if the vestee already exists
//     const getVesteeOptView : option (option(vesteeRecordType)) = Tezos.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
//     case getVesteeOptView of [
//         Some (_value) -> case _value of [
//             Some (_vestee) -> skip
//         |   None -> failwith ("Error. This vestee does not exist")
//         ]
//     |   None -> failwith ("Error. GetVesteeOpt view does not exist in the vesting contract")
//     ];

//     const addressMap : addressMapType     = map [
//         ("vesteeAddress"         : string) -> vesteeAddress;
//     ];
//     const emptyStringMap : stringMapType  = map [];
//     const emptyNatMap : natMapType        = map [];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "removeVestee";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = emptyStringMap;
//         natMap                = emptyNatMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionUpdateVestee(const updateVesteeParams : updateVesteeType; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter
    
//     checkSenderIsCouncilMember(s);

//     // Check if the vesting has a updateVestee entrypoint
//     var vestingAddress : address := case s.generalContracts["vesting"] of [
//         Some(_address) -> _address
//         | None -> failwith("Error. Vesting Contract Address not found")
//     ];
//     const _checkEntrypoint: contract(updateVesteeType)    = sendUpdateVesteeParams(vestingAddress);

//     // init parameters
//     const vesteeAddress             : address  = updateVesteeParams.vesteeAddress;
//     const newTotalAllocatedAmount   : nat      = updateVesteeParams.newTotalAllocatedAmount;
//     const newCliffInMonths          : nat      = updateVesteeParams.newCliffInMonths;
//     const newVestingInMonths        : nat      = updateVesteeParams.newVestingInMonths;

//     // Check if the vestee already exists
//     const getVesteeOptView : option (option(vesteeRecordType)) = Tezos.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
//     case getVesteeOptView of [
//         Some (_value) -> case _value of [
//             Some (_vestee) -> skip
//         |   None -> failwith ("Error. This vestee does not exist")
//         ]
//     |   None -> failwith ("Error. GetVesteeOpt view does not exist in the vesting contract")
//     ];

//     const addressMap : addressMapType     = map [
//         ("vesteeAddress"         : string)    -> vesteeAddress;
//     ];
//     const emptyStringMap : stringMapType = map [];
//     const natMap : natMapType            = map [
//         ("newTotalAllocatedAmount"  : string) -> newTotalAllocatedAmount;
//         ("newCliffInMonths"         : string) -> newCliffInMonths;
//         ("newVestingInMonths"       : string) -> newVestingInMonths;
//     ];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "updateVestee";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = emptyStringMap;
//         natMap                = natMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionToggleVesteeLock(const vesteeAddress : address ; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check if the provided contract has a toggleVesteeLock entrypoint
//     var vestingAddress : address := case s.generalContracts["vesting"] of [
//         Some(_address) -> _address
//         | None -> failwith("Error. Vesting Contract Address not found")
//     ];
//     const _checkEntrypoint: contract(address)    = sendToggleVesteeLockParams(vestingAddress);

//     // Check if the vestee already exists
//     const getVesteeOptView : option (option(vesteeRecordType)) = Tezos.call_view ("getVesteeOpt", vesteeAddress, vestingAddress);
//     case getVesteeOptView of [
//         Some (_value) -> case _value of [
//             Some (_vestee) -> skip
//         |   None -> failwith ("Error. This vestee does not exist")
//         ]
//     |   None -> failwith ("Error. GetVesteeOpt view does not exist in the vesting contract")
//     ];

//     const addressMap : addressMapType     = map [
//         ("vesteeAddress"         : string) -> vesteeAddress;
//     ];
//     const emptyStringMap : stringMapType  = map [];
//     const emptyNatMap : natMapType        = map [];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "toggleVesteeLock";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = emptyStringMap;
//         natMap                = emptyNatMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionRequestTokens(const councilActionRequestTokensParams : councilActionRequestTokensType ; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check if the governance has a updateVestee entrypoint
//     var govenanceAddress : address := case s.generalContracts["governance"] of [
//         Some(_address) -> _address
//         | None -> failwith("Error. Governance Contract Address not found")
//     ];
//     const _checkEntrypoint: contract(councilActionRequestTokensType)    = sendRequestTokensParams(govenanceAddress);

//     // Check if type is correct
//     if councilActionRequestTokensParams.tokenType = "FA12" or
//     councilActionRequestTokensParams.tokenType = "FA2" or
//     councilActionRequestTokensParams.tokenType = "XTZ" then skip
//     else failwith("Error. Wrong token type provided. Only FA12/FA2/XTZ allowed");

//     const addressMap : addressMapType     = map [
//         ("treasuryAddress"       : string) -> councilActionRequestTokensParams.treasuryAddress;
//         ("tokenContractAddress"  : string) -> councilActionRequestTokensParams.tokenContractAddress;
//     ];
//     const stringMap : stringMapType      = map [
//         ("tokenName"             : string) -> councilActionRequestTokensParams.tokenName; 
//         ("purpose"               : string) -> councilActionRequestTokensParams.purpose;        
//         ("tokenType"             : string) -> councilActionRequestTokensParams.tokenType;  
//     ];
//     const natMap : natMapType         = map [
//         ("tokenAmount"           : string) -> councilActionRequestTokensParams.tokenAmount;
//         ("tokenId"               : string) -> councilActionRequestTokensParams.tokenId;
//     ];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "requestTokens";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = stringMap;
//         natMap                = natMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionRequestMint(const councilActionRequestMintParams : councilActionRequestMintType ; var s : councilStorage) : return is 
// block {
    
//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check if the governance has a updateVestee entrypoint
//     var govenanceAddress : address := case s.generalContracts["governance"] of [
//         Some(_address) -> _address
//         | None -> failwith("Error. Governance Contract Address not found")
//     ];
//     const _checkEntrypoint: contract(councilActionRequestTokensType)    = sendRequestTokensParams(govenanceAddress);

//     const addressMap : addressMapType     = map [
//         ("treasuryAddress"       : string) -> councilActionRequestMintParams.treasuryAddress;
//     ];
//     const stringMap : stringMapType      = map [
//         ("purpose"               : string) -> councilActionRequestMintParams.purpose; 
//     ];
//     const natMap : natMapType         = map [
//         ("tokenAmount"           : string) -> councilActionRequestMintParams.tokenAmount;
//     ];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "requestMint";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = stringMap;
//         natMap                = natMap;     

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// function councilActionDropFinancialRequest(const requestID : nat ; var s : councilStorage) : return is 
// block {
    
//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter

//     checkSenderIsCouncilMember(s);

//     // Check if financial request exists
//     const _request: councilActionRecordType = case Big_map.find_opt(requestID, s.councilActionsLedger) of [
//         Some (_action) -> _action
//     |   None -> failwith("Error. Provided financial request not found")
//     ];

//     if _request.status  = "FLUSHED" then failwith("Error. The provided financial request has already been dropped")
//     else skip;

//     const addressMap : addressMapType     = map [];
//     const stringMap : stringMapType      = map [];
//     const natMap : natMapType         = map [
//         ("requestId"           : string) -> requestID;
//     ];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "dropFinancialRequest";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = addressMap;
//         stringMap             = stringMap;
//         natMap                = natMap;     

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)


// function flushAction(const actionId: flushActionType; var s : councilStorage) : return is 
// block {

//     // Overall steps:
//     // 1. Check that sender is a council member
//     // 2. Create and save new council action record, set the sender as a signer of the action
//     // 3. Increment action counter
    
//     checkSenderIsCouncilMember(s);

//     // Check if council action
//     const _request: councilActionRecordType = case Big_map.find_opt(actionId, s.councilActionsLedger) of [
//         Some (_action) -> _action
//     |   None -> failwith("Error. Provided council action not found")
//     ];

//     if _request.status  = "FLUSHED" then failwith("Error. The council action has already been flushed")
//     else skip;

//     if _request.executed then failwith("Error. The provided council action has been executed, it cannot be flushed")
//     else skip;

//     const emptyAddressMap  : addressMapType     = map [];
//     const emptyStringMap   : stringMapType      = map [];
//     const natMap           : natMapType         = map [
//         ("actionId" : string) -> actionId;
//     ];

//     var councilActionRecord : councilActionRecordType := record[
//         initiator             = Tezos.sender;
//         actionType            = "flushAction";
//         signers               = set[Tezos.sender];

//         status                = "PENDING";
//         signersCount          = 1n;
//         executed              = False;

//         addressMap            = emptyAddressMap;
//         stringMap             = emptyStringMap;
//         natMap                = natMap;

//         startDateTime         = Tezos.now;
//         startLevel            = Tezos.level;             
//         executedDateTime      = Tezos.now;
//         executedLevel         = Tezos.level;
//         expirationDateTime    = Tezos.now + (86_400 * s.config.actionExpiryDays);
//     ];
//     s.councilActionsLedger[s.actionCounter] := councilActionRecord; 

//     // increment action counter
//     s.actionCounter := s.actionCounter + 1n;

// } with (noOperations, s)

// // function signAction(const actionId: nat; const voteType: nat; var s : councilStorage) : return is 
// function signAction(const actionId: nat; var s : councilStorage) : return is 
// block {
    
//     checkSenderIsCouncilMember(s);

//     var _councilActionRecord : councilActionRecordType := case s.councilActionsLedger[actionId] of [
//         Some(_record) -> _record
//         | None -> failwith("Error. Council Action not found")
//     ];

//     // check if council action has been flushed
//     if _councilActionRecord.status = "FLUSHED" then failwith("Error. Council action has been flushed") else skip;

//     // check if council action has expired
//     if Tezos.now > _councilActionRecord.expirationDateTime then failwith("Error. Council action has expired") else skip;

//     // check if signer already signer
//     if Set.mem(Tezos.sender, _councilActionRecord.signers) then failwith("Error. Sender already signed this council action") else skip;

//     // update signers and signersCount for council action record
//     var signersCount : nat             := _councilActionRecord.signersCount + 1n;
//     _councilActionRecord.signersCount  := signersCount;
//     _councilActionRecord.signers       := Set.add(Tezos.sender, _councilActionRecord.signers);
//     s.councilActionsLedger[actionId]   := _councilActionRecord;

//     const actionType : string = _councilActionRecord.actionType;

//     var operations : list(operation) := nil;

//     // check if threshold has been reached
//     if signersCount >= s.config.threshold and not _councilActionRecord.executed then block {
        
//         // --------------------------------------
//         // execute action based on action types
//         // --------------------------------------

//         // flush action type
//         if actionType = "flushAction" then block {

//             // fetch params begin ---
//             const flushedCouncilActionId : nat = case _councilActionRecord.natMap["actionId"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. ActionId not found.")
//             ];
//             // fetch params end ---

//             var flushedCouncilActionRecord : councilActionRecordType := case s.councilActionsLedger[flushedCouncilActionId] of [      
//                 Some(_record) -> _record
//                 | None -> failwith("Error. Council Action not found")
//             ];

//             if flushedCouncilActionRecord.status  = "FLUSHED" then failwith("Error. The council action has already been flushed")
//             else skip;

//             if flushedCouncilActionRecord.executed then failwith("Error. The provided council action has been executed, it cannot be flushed")
//             else skip;

//             flushedCouncilActionRecord.status := "FLUSHED";
//             s.councilActionsLedger[flushedCouncilActionId] := flushedCouncilActionRecord;

//         } else skip;

//         // updateBlocksPerMinute action type
//         if actionType = "updateBlocksPerMinute" then block {
            
//             // fetch params begin ---
//             const newBlocksPerMinute : nat = case _councilActionRecord.natMap["newBlocksPerMinute"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. NewBlocksPerMinute not found.")
//             ];
//             const contractAddress : address = case _councilActionRecord.addressMap["contractAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. ContractAddress not found.")
//             ];
//             // fetch params end ---

//             const updateBlocksPerMinuteOperation : operation = Tezos.transaction(
//                 newBlocksPerMinute,
//                 0tez, 
//                 sendUpdateBlocksPerMinuteParams(contractAddress)
//             );
            
//             operations := updateBlocksPerMinuteOperation # operations;
//         } else skip;

//         // addVestee action type
//         if actionType = "addVestee" then block {

//             // fetch params begin ---
//             const vesteeAddress : address = case _councilActionRecord.addressMap["vesteeAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. VesteeAddress not found.")
//             ];

//             const totalAllocatedAmount : nat = case _councilActionRecord.natMap["totalAllocatedAmount"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. TotalAllocatedAmount not found.")
//             ];

//             const cliffInMonths : nat = case _councilActionRecord.natMap["cliffInMonths"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. CliffInMonths not found.")
//             ];

//             const vestingInMonths : nat = case _councilActionRecord.natMap["vestingInMonths"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. VestingInMonths not found.")
//             ];
//             // fetch params end ---

//             const addVesteeParams : addVesteeType = record [
//                 vesteeAddress           = vesteeAddress;
//                 totalAllocatedAmount    = totalAllocatedAmount;
//                 cliffInMonths           = cliffInMonths;
//                 vestingInMonths         = vestingInMonths;
//             ];

//             var vestingAddress : address := case s.generalContracts["vesting"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. Vesting Contract Address not found")
//             ];

//             const addVesteeOperation : operation = Tezos.transaction(
//                 addVesteeParams,
//                 0tez, 
//                 sendAddVesteeParams(vestingAddress)
//             );
            
//             operations := addVesteeOperation # operations;

//         } else skip;



//         // addVestee action type
//         if actionType = "removeVestee" then block {

//             // fetch params begin ---
//             const vesteeAddress : address = case _councilActionRecord.addressMap["vesteeAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. VesteeAddress not found.")
//             ];
//             // fetch params end ---


//             var vestingAddress : address := case s.generalContracts["vesting"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. Vesting Contract Address not found")
//             ];

//             const removeVesteeOperation : operation = Tezos.transaction(
//                 vesteeAddress,
//                 0tez, 
//                 sendRemoveVesteeParams(vestingAddress)
//             );
            
//             operations := removeVesteeOperation # operations;

//         } else skip;



//         // updateVestee action type
//         if actionType = "updateVestee" then block {

//             // fetch params begin ---
//             const vesteeAddress : address = case _councilActionRecord.addressMap["vesteeAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. VesteeAddress not found.")
//             ];

//             const newTotalAllocatedAmount : nat = case _councilActionRecord.natMap["newTotalAllocatedAmount"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. NewTotalAllocatedAmount not found.")
//             ];

//             const newCliffInMonths : nat = case _councilActionRecord.natMap["newCliffInMonths"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. NewCliffInMonths not found.")
//             ];

//             const newVestingInMonths : nat = case _councilActionRecord.natMap["newVestingInMonths"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. NewVestingInMonths not found.")
//             ];
//             // fetch params end ---

//             const updateVesteeParams : updateVesteeType = record [
//                 vesteeAddress               = vesteeAddress;
//                 newTotalAllocatedAmount     = newTotalAllocatedAmount;
//                 newCliffInMonths            = newCliffInMonths;
//                 newVestingInMonths          = newVestingInMonths;
//             ];

//             var vestingAddress : address := case s.generalContracts["vesting"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. Vesting Contract Address not found")
//             ];

//             const updateVesteeOperation : operation = Tezos.transaction(
//                 updateVesteeParams,
//                 0tez, 
//                 sendUpdateVesteeParams(vestingAddress)
//             );

//             operations := updateVesteeOperation # operations;
            
//         } else skip;    



//         // updateVestee action type
//         if actionType = "toggleVesteeLock" then block {

//             // fetch params begin ---
//             const vesteeAddress : address = case _councilActionRecord.addressMap["vesteeAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. VesteeAddress not found.")
//             ];
//             // fetch end begin ---

//             var vestingAddress : address := case s.generalContracts["vesting"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. Vesting Contract Address not found")
//             ];

//             const toggleVesteeLockOperation : operation = Tezos.transaction(
//                 vesteeAddress,
//                 0tez, 
//                 sendToggleVesteeLockParams(vestingAddress)
//             );

//             operations := toggleVesteeLockOperation # operations;
            
//         } else skip;    



//         // addCouncilMember action type
//         if actionType = "addCouncilMember" then block {

//             // fetch params begin ---
//             const councilMemberAddress : address = case _councilActionRecord.addressMap["councilMemberAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. CouncilMemberAddress not found.")
//             ];

//             const councilMemberName : string = case _councilActionRecord.stringMap["councilMemberName"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. CouncilMemberName not found.")
//             ];

//             const councilMemberImage : string = case _councilActionRecord.stringMap["councilMemberImage"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. CouncilMemberImage not found.")
//             ];

//             const councilMemberWebsite : string = case _councilActionRecord.stringMap["councilMemberWebsite"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. CouncilMemberWebsite not found.")
//             ];
//             // fetch params end ---

//             // Check if new council member is already in the council

//             const councilMemberInfo: councilMemberInfoType  = record[
//                 name=councilMemberName;
//                 image=councilMemberImage;
//                 website=councilMemberWebsite;
//             ];

//             if Map.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is already in the council")
//             else s.councilMembers := Map.add(councilMemberAddress, councilMemberInfo, s.councilMembers);
            
//         } else skip;



//         // removeCouncilMember action type
//         if actionType = "removeCouncilMember" then block {

//             // fetch params begin ---
//             const councilMemberAddress : address = case _councilActionRecord.addressMap["councilMemberAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. CouncilMemberAddress not found.")
//             ];
//             // fetch params end ---

//             // Check if council member is in the council
//             if not Map.mem(councilMemberAddress, s.councilMembers) then failwith("Error. The provided council member is not in the council")
//             else skip;

//             // Check if removing the council member won't impact the threshold
//             if (abs(Map.size(s.councilMembers) - 1n)) < s.config.threshold then failwith("Error. Removing a council member will have an impact on the threshold. Try to adjust the threshold first.")
//             else skip;
//             s.councilMembers := Map.remove(councilMemberAddress, s.councilMembers);
//         } else skip;



//         // changeCouncilMember action type
//         if actionType = "changeCouncilMember" then block {

//             // fetch params begin ---
//             const oldCouncilMemberAddress : address = case _councilActionRecord.addressMap["oldCouncilMemberAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. OldCouncilMemberAddress not found.")
//             ];

//             const newCouncilMemberAddress : address = case _councilActionRecord.addressMap["newCouncilMemberAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. NewCouncilMemberAddress not found.")
//             ];

//             const newCouncilMemberName : string = case _councilActionRecord.stringMap["newCouncilMemberName"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. NewCouncilMemberName not found.")
//             ];

//             const newCouncilMemberImage : string = case _councilActionRecord.stringMap["newCouncilMemberImage"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. NewCouncilMemberImage not found.")
//             ];

//             const newCouncilMemberWebsite : string = case _councilActionRecord.stringMap["newCouncilMemberWebsite"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. NewCouncilMemberWebsite not found.")
//             ];
//             // fetch params end ---

//             // Check if new council member is already in the council
//             if Map.mem(newCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided new council member is already in the council")
//             else skip;

//             // Check if old council member is in the council
//             if not Map.mem(oldCouncilMemberAddress, s.councilMembers) then failwith("Error. The provided old council member is not in the council")
//             else skip;

//             const councilMemberInfo: councilMemberInfoType  = record[
//                 name=newCouncilMemberName;
//                 image=newCouncilMemberImage;
//                 website=newCouncilMemberWebsite;
//             ];

//             s.councilMembers := Map.add(newCouncilMemberAddress, councilMemberInfo, s.councilMembers);
//             s.councilMembers := Map.remove(oldCouncilMemberAddress, s.councilMembers);
//         } else skip;



//         // transfer action type
//         if actionType = "transfer" then block {

//             // fetch params begin ---
//             const receiverAddress : address = case _councilActionRecord.addressMap["receiverAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. ReceiverAddress not found.")
//             ];

//             const tokenContractAddress : address = case _councilActionRecord.addressMap["tokenContractAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. TokenContractAddress not found.")
//             ];

//             const tokenType : string = case _councilActionRecord.stringMap["tokenType"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. TokenType not found.")
//             ];

//             const tokenAmount : nat = case _councilActionRecord.natMap["tokenAmount"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. TokenAmount not found.")
//             ];

//             const tokenId : nat = case _councilActionRecord.natMap["tokenId"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. TokenId not found.")
//             ];
//             // fetch params end ---


//             const from_  : address   = Tezos.self_address;
//             const to_    : address   = receiverAddress;
//             const amt    : nat       = tokenAmount;
            
//             // ---- set token type ----
//             var _tokenTransferType : tokenType := Tez;

//             if  tokenType = "XTZ" then block {
//               _tokenTransferType      := Tez; 
//             } else skip;

//             if  tokenType = "FA12" then block {
//               _tokenTransferType      := Fa12(tokenContractAddress); 
//             } else skip;

//             if  tokenType = "FA2" then block {
//               _tokenTransferType      := Fa2(record [
//                 tokenContractAddress   = tokenContractAddress;
//                 tokenId                = tokenId;
//               ]); 
//             } else skip;
//             // --- --- ---

//             const transferTokenOperation : operation = case _tokenTransferType of [ 
//                 | Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address. Cannot transfer XTZ"): contract(unit)), amt)
//                 | Fa12(token) -> transferFa12Token(from_, to_, amt, token)
//                 | Fa2(token)  -> transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
//             ];

//             operations := transferTokenOperation # operations;

//         } else skip;

//         // requestTokens action type
//         if actionType = "requestTokens" then block {

//             // fetch params begin ---
//             const treasuryAddress : address = case _councilActionRecord.addressMap["treasuryAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. TreasuryAddress not found.")
//             ];

//             const tokenContractAddress : address = case _councilActionRecord.addressMap["tokenContractAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. TokenContractAddress not found.")
//             ];

//             const tokenType : string = case _councilActionRecord.stringMap["tokenType"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. TokenType not found.")
//             ];

//             const tokenName : string = case _councilActionRecord.stringMap["tokenName"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. TokenName not found.")
//             ];

//             const purpose : string = case _councilActionRecord.stringMap["purpose"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. Purpose not found.")
//             ];

//             const tokenAmount : nat = case _councilActionRecord.natMap["tokenAmount"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. TokenAmount not found.")
//             ];

//             const tokenId : nat = case _councilActionRecord.natMap["tokenId"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. TokenId not found.")
//             ];
//             // fetch params end ---


//             const requestTokensParams : councilActionRequestTokensType = record[
//                 treasuryAddress       = treasuryAddress;
//                 tokenContractAddress  = tokenContractAddress;
//                 tokenName             = tokenName;
//                 tokenAmount           = tokenAmount;
//                 tokenType             = tokenType;
//                 tokenId               = tokenId;
//                 purpose               = purpose;
//             ];

//             var governanceAddress : address := case s.generalContracts["governance"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. Governance Contract Address not found")
//             ];

//             const requestTokensOperation : operation = Tezos.transaction(
//                 requestTokensParams,
//                 0tez, 
//                 sendRequestTokensParams(governanceAddress)
//             );

//             operations := requestTokensOperation # operations;
//         } else skip;



//         // requestMint action type
//         if actionType = "requestMint" then block {
            
//             var governanceAddress : address := case s.generalContracts["governance"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. Governance Contract Address not found")
//             ];


//             // fetch params begin ---
//             const treasuryAddress : address = case _councilActionRecord.addressMap["treasuryAddress"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. TreasuryAddress not found.")
//             ];

//             const purpose : string = case _councilActionRecord.stringMap["purpose"] of [
//                 Some(_string) -> _string
//                 | None -> failwith("Error. Purpose not found.")
//             ];

//             const tokenAmount : nat = case _councilActionRecord.natMap["tokenAmount"] of [
//                 Some(_nat) -> _nat
//                 | None -> failwith("Error. TokenAmount not found.")
//             ];
//             // fetch params end ---

//             const requestMintParams : councilActionRequestMintType = record[
//                 tokenAmount      = tokenAmount;
//                 treasuryAddress  = treasuryAddress;
//                 purpose          = purpose;
//             ];

//             const requestMintOperation : operation = Tezos.transaction(
//                 requestMintParams,
//                 0tez, 
//                 sendRequestMintParams(governanceAddress)
//             );

//             operations := requestMintOperation # operations;
//         } else skip;


//         // dropFinancialRequest action type
//         if actionType = "dropFinancialRequest" then block {
            
//             var governanceAddress : address := case s.generalContracts["governance"] of [ 
//                 Some(_address) -> _address
//                 | None -> failwith("Error. Governance Contract Address not found")
//             ];

//             // fetch params begin ---
//             const requestId : nat = case _councilActionRecord.natMap["requestId"] of [
//                 Some(_address) -> _address
//                 | None -> failwith("Error. RequestID not found.")
//             ];
//             // fetch params end ---

//             const dropFinancialRequestOperation : operation = Tezos.transaction(
//                 requestId,
//                 0tez, 
//                 sendDropFinancialRequestParams(governanceAddress)
//             );

//             operations := dropFinancialRequestOperation # operations;
//         } else skip;

//         // update council action record status
//         _councilActionRecord.status              := "EXECUTED";
//         _councilActionRecord.executed            := True;
//         _councilActionRecord.executedDateTime    := Tezos.now;
//         _councilActionRecord.executedLevel       := Tezos.level;
        
//         // save council action record
//         s.councilActionsLedger[actionId]         := _councilActionRecord;

//     } else skip;

// } with (operations, s)

// function main (const action : councilAction; const s : councilStorage) : return is 
//     case action of [
//         | Default(_params) -> ((nil : list(operation)), s)
        
//         // Housekeeping Entrypoints
//         | SetAdmin(parameters) -> setAdmin(parameters, s)
//         | UpdateMetadata(parameters) -> updateMetadata(parameters.0, parameters.1, s)  
//         | UpdateConfig(parameters) -> updateConfig(parameters, s)
//         | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
//         | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
//         | UpdateCouncilMemberInfo(parameters) -> updateCouncilMemberInfo(parameters, s)

//         // Council actions for contracts
//         | CouncilActionUpdateBlocksPerMin(parameters) -> councilActionUpdateBlocksPerMinute(parameters, s)

//         // Council actions for vesting
//         | CouncilActionAddVestee(parameters) -> councilActionAddVestee(parameters, s)
//         | CouncilActionRemoveVestee(parameters) -> councilActionRemoveVestee(parameters, s)
//         | CouncilActionUpdateVestee(parameters) -> councilActionUpdateVestee(parameters, s)
//         | CouncilActionToggleVesteeLock(parameters) -> councilActionToggleVesteeLock(parameters, s)
        
//         // Council actions for internal control
//         | CouncilActionAddMember(parameters) -> councilActionAddMember(parameters, s)
//         | CouncilActionRemoveMember(parameters) -> councilActionRemoveMember(parameters, s)
//         | CouncilActionChangeMember(parameters) -> councilActionChangeMember(parameters, s)
//         | CouncilActionTransfer(parameters) -> councilActionTransfer(parameters, s)
        
//         // Council actions to Governance DAO and Treasury
//         | CouncilActionRequestTokens(parameters) -> councilActionRequestTokens(parameters, s)
//         | CouncilActionRequestMint(parameters) -> councilActionRequestMint(parameters, s)
//         | CouncilActionDropFinancialReq(parameters) -> councilActionDropFinancialRequest(parameters, s)

//         // Council signing of actions
//         | SignAction(parameters) -> signAction(parameters, s)
//         | FlushAction(parameters) -> flushAction(parameters, s)
//     ]