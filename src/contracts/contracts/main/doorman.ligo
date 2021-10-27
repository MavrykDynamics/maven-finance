type stakeRecordType is record [
    time : timestamp;
    amount : nat;    // muMVK / muVMvk
    fee: nat;        // muMVK / muVMvk
    opType : string; // stake / unstake 
]
// type userStakeRecords is big_map (nat, map (address, stakeRecord))
// type addressToUserRecord is big_map (address, nat)

type userRecordType is record [
    userId: nat;
    lastRecordIndex: nat;
]
type addressToUserRecordType is big_map (address, userRecordType) // user address, user index, user number of records
type userStakeRecordsType is big_map (nat, map(address, map(nat, stakeRecordType)))

// type lastRecordIndex is nat; 
// type addressToRecordIndex is big_map (address, lastRecordIndex)
// type userStakeRecords is big_map (address, map(nat, stakeRecord)))
// stakeRecord as a list -> to push into records

type burnTokenType is (address * nat)
type mintTokenType is (address * nat)

type storage is record [
    admin : address;
    addressToUserRecord : addressToUserRecordType; 
    mvkTokenAddress: address; 
    vMvkTokenAddress: address;
    userStakeLedger : userStakeRecordsType; // change userStakeRecord to userStakeRecords or consider Ledger
    tempMvkTotalSupply: nat;    
    tempVMvkTotalSupply: nat;  
    lastUserId: nat;
    logExitFee: nat;    // to be removed after testing
    logFinalAmount: nat // to be removed after testing
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

type stakeAction is 
    | Stake of (nat)
    | Unstake of (nat)
    | UnstakeComplete of (nat)
    | SetAdmin of (address)
    | SetMvkTokenAddress of (address)
    | SetVMvkTokenAddress of (address)
    | SetTempMvkTotalSupply of (nat)
    | SetTempVMvkTotalSupply of (nat)

(* ---- Helper functions begin ---- *)

// helper function to get MVK total supply
function updateMvkTotalSupplyForDoorman(const tokenAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%updateMvkTotalSupplyForDoorman",
      tokenAddress) : option(contract(unit))) of
    Some(contr) -> contr
  | None -> (failwith("UpdateMvkTotalSupplyForDoorman entrypoint in MVK Token Contract not found") : contract(unit))
  end;

// helper function to get vMVK total supply (type is different from getMvkTotalSupplyProxy)
function updateVMvkTotalSupplyForDoorman(const tokenAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%updateVMvkTotalSupplyForDoorman",
      tokenAddress) : option(contract(nat))) of
    Some(contr) -> contr
  | None -> (failwith("UpdateVMvkTotalSupplyForDoorman entrypoint in vMVK Token Contract not found") : contract(nat))
  end;

// helper function to get burn entrypoint from token address
function getBurnEntrypointFromTokenAddress(const tokenAddress : address) : contract(burnTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%burn",
      tokenAddress) : option(contract(burnTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Burn entrypoint not found") : contract(burnTokenType))
  end;

(* Helper function to burn mvk/vmvk tokens *)
function burnTokens(
  const from_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    (from_, amount_),
    0tez,
    getBurnEntrypointFromTokenAddress(tokenAddress)
  );

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mintTokenType))
  end;

(* Helper function to mint mvk/vmvk tokens *)
function mintTokens(
  const to_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    (to_, amount_),
    0tez,
    getMintEntrypointFromTokenAddress(tokenAddress)
  );

(* ---- Helper functions end ---- *)

(*  set contract admin address *)
function setAdmin(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.admin := parameters;
} with (noOperations, s)

(* set mvk contract address *)
function setMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.mvkTokenAddress := parameters;
} with (noOperations, s)

(* set vMvk contract address *)
function setVMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.vMvkTokenAddress := parameters;
} with (noOperations, s)


function stake(const stakeAmount : nat; var s : storage) : return is
block {

  // Steps Overview
  // 1. verify that user is staking more than 1 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez - set min to 1
  // 2. mint + burn method in mvkToken.ligo and vmvkToken.ligo - then Temple wallet reflects the ledger amounts of MVK and vMVK - burn/mint operations are reflected
  // 3. update record of user staking
  // ----------------------------------------

  // 1. verify that user is staking more than 0 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez 
  if stakeAmount = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;
    
  // 2. mint + burn method in mvkToken.ligo and vmvkToken.ligo - then Temple wallet reflects the ledger amounts of MVK and vMVK - burn/mint operations are reflected

  const burnMvkTokensOperation : operation = burnTokens(
      Tezos.sender,        // from address
      stakeAmount,         // amount of mvk Tokens to be burned
      s.mvkTokenAddress);  // mvkTokenAddress

  const mintVMvkTokensOperation : operation = mintTokens(
      Tezos.sender,        // to address
      stakeAmount,         // amount of vmvk Tokens to be minted
      s.vMvkTokenAddress); // vmvkTokenAddress

  // list of operations: burn mvk tokens first, then mint vmvk tokens
  const operations : list(operation) = list [burnMvkTokensOperation; mintVMvkTokensOperation];

  // 3. update record of user address with minted vMVK tokens

  // temp var: to check if user address exist in the record, and increment lastUserId index if not
  const checkUserExistsInStakeLedger : map(address, map(nat, stakeRecordType)) = case s.userStakeLedger[s.lastUserId] of
      Some(_val) -> _val
      | None -> map[]
  end;
  
  // comparison to be fixed - not sure if size(map[]) > 0
  if size(checkUserExistsInStakeLedger) > 0n then s.lastUserId := s.lastUserId + 1n
  else skip;

  // get user index in record from sender address; assign  user address to lastUserId index if user does not exist in record
  var getUserRecord : userRecordType := case s.addressToUserRecord[Tezos.sender] of
        Some(_val) -> _val
      | None -> record[
          userId = s.lastUserId;
          lastRecordIndex = 0n;
      ]
  end;

  s.addressToUserRecord[Tezos.sender] := getUserRecord;
  
  // save userStakeRecord
  var container : map(address, map(nat, stakeRecordType)) := case s.userStakeLedger[getUserRecord.userId] of 
      Some(_val) -> _val
      | None -> map []
  end;

  // check 
  var recordIndex : map(nat, stakeRecordType) := case container[Tezos.sender] of 
      Some(_val) -> _val
      | None -> map []
  end;

  var saveRecord : stakeRecordType := case recordIndex[getUserRecord.lastRecordIndex] of
      Some(_val) -> _val
      | None -> record[
          amount  = stakeAmount;
          time    = Tezos.now;  
          fee     = 0n;   
          opType = "stake";    
      ]
   end;
  
  recordIndex[getUserRecord.lastRecordIndex] := saveRecord;
  container[Tezos.sender] := recordIndex;
  s.userStakeLedger[getUserRecord.userId] := container;

  var incrementLastRecordIndex : userRecordType := record[
      userId = getUserRecord.userId;
      lastRecordIndex = getUserRecord.lastRecordIndex + 1n;
  ];
  s.addressToUserRecord[Tezos.sender] := incrementLastRecordIndex;

} with (operations, s)


function unstake(const unstakeAmount : nat; var s : storage) : return is
block {
    // Steps Overview
  // 1. verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  // 2. calculate exit fee (in vMVK tokens) and final MVK token amount
  // 3. mint + burn method in vmvkToken.ligo and mvkToken.ligo respectively
  // 4. update record of user unstaking
  
  // to be done in future
  // 5. calculate distribution of exit fee as rewards to vMVK holders
  // 6. transfer / save record of exit fee rewards for each vMVK holder - unless exit fee rewards are calculated in a different way 
  // ----------------------------------------

  // verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  if unstakeAmount = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;

  const updateMvkTotalSupplyProxyOperation : operation = Tezos.transaction(unit, 0tez, updateMvkTotalSupplyForDoorman(s.mvkTokenAddress));
  const updateVMvkTotalSupplyProxyOperation : operation = Tezos.transaction(unstakeAmount, 0tez, updateVMvkTotalSupplyForDoorman(s.vMvkTokenAddress));

  // list of operations: get MVK total supply first, then get vMVK total supply (which will trigger unstake complete)
  const operations : list(operation) = list [updateMvkTotalSupplyProxyOperation; updateVMvkTotalSupplyProxyOperation];
  
} with (operations, s)

function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    (* Check this call is comming from the mvk Token contract *)
    if s.mvkTokenAddress =/= Tezos.sender then
        failwith("NotAuthorized")
    else skip;
    s.tempMvkTotalSupply := totalSupply;
} with (noOperations, s);


function setTempVMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    (* Check this call is comming from the vMvk Token contract *)
    if s.vMvkTokenAddress =/= Tezos.sender then
      failwith("NotAuthorized")
    else skip;
    s.tempVMvkTotalSupply := totalSupply;
} with (noOperations, s);


function unstakeComplete(const unstakeAmount: nat; var s : storage) is 
block {

    (* Check this call is comming from the vMvk Token contract *)
    if s.vMvkTokenAddress =/= Tezos.sender then
      failwith("NotAuthorized")
    else skip;

    //   const exitFee = calculateExitFee(unit, s : storage);  // returns in mu (10^6)
    const mvkLoyaltyIndex : nat = (s.tempVMvkTotalSupply * 1000000n * 100n / (s.tempVMvkTotalSupply + s.tempMvkTotalSupply)); 
    const exitFee : nat = (500n * 1000000n * 100n) / (mvkLoyaltyIndex + (5n * 1000000n)); 
  
    const finalAmountPercent : nat = abs(10000n - exitFee);
    const finalAmount : nat = unstakeAmount * finalAmountPercent;
    const finalAmount : nat = finalAmount / 10000n;

    // temp to check correct amount of exit fee and final amount in console truffle tests
    s.logExitFee := exitFee;
    s.logFinalAmount := finalAmount;
    // todo: split remainder of exitFee
  
    // 3. mint + burn method in vmvkToken.ligo and mvkToken.ligo respectively
    // balance check in burn functions
    const burnVMvkTokensOperation : operation = burnTokens(
        Tezos.source,         // from address - use source as sender would be from vMvk Token Contract
        unstakeAmount,        // amount of vMVK Tokens to be burned [in mu - 10^6]
        s.vMvkTokenAddress);  // vmvkTokenAddress
  
    const mintMvkTokensOperation : operation = mintTokens(
        Tezos.source,        // to address - use source as sender would be from vMvk Token Contract
        finalAmount,         // final amount of MVK Tokens to be minted (vMVK - exit fee) [in mu - 10^6]
        s.mvkTokenAddress);  // mvkTokenAddress

    // list of operations: burn vmvk tokens first, then mint mvk tokens
    const operations : list(operation) = list [burnVMvkTokensOperation; mintMvkTokensOperation];

    // 4. update record of user unstaking
    // get user index in record from sender address
    var getUserRecord : userRecordType := case s.addressToUserRecord[Tezos.source] of
        Some(_val) -> _val
      | None -> record[
          userId = s.lastUserId;
          lastRecordIndex = 0n;
      ]
    end;

    s.addressToUserRecord[Tezos.source] := getUserRecord;
    
    // save userStakeLedger
    var container : map(address, map(nat, stakeRecordType)) := case s.userStakeLedger[getUserRecord.userId] of 
        Some(_val) -> _val
        | None -> map []
    end;

    // check 
    var recordIndex : map(nat, stakeRecordType) := case container[Tezos.source] of 
        Some(_val) -> _val
        | None -> map []
    end;

    const exitFeeRecord : nat = exitFee * 10000n;
    var saveRecord : stakeRecordType := case recordIndex[getUserRecord.lastRecordIndex] of
        Some(_val) -> _val
        | None -> record[
            amount  = unstakeAmount;
            time    = Tezos.now;  
            fee     = exitFeeRecord;   
            opType = "unstake";    
        ]
    end;
    
    recordIndex[getUserRecord.lastRecordIndex] := saveRecord;
    container[Tezos.source] := recordIndex;
    s.userStakeLedger[getUserRecord.userId] := container;

    var incrementLastRecordIndex : userRecordType := record[
        userId = getUserRecord.userId;
        lastRecordIndex = getUserRecord.lastRecordIndex + 1n;
    ];
    s.addressToUserRecord[Tezos.source] := incrementLastRecordIndex;

    // to be done in future
    //----------------------------------
    // 5. calculate distribution of exit fee as rewards to vMVK holders
    // 6. transfer / save record of exit fee rewards for each vMVK holder

} with (operations, s)

(* Main entrypoint *)
function main (const action : stakeAction; const s : storage) : return is
  case action of
  | Stake(parameters) -> stake(parameters, s)  
  | Unstake(parameters) -> unstake(parameters, s)  
  | UnstakeComplete(parameters) -> unstakeComplete(parameters, s)  
  | SetAdmin(parameters) -> setAdmin(parameters, s)  
  | SetMvkTokenAddress(parameters) -> setMvkTokenAddress(parameters, s)  
  | SetVMvkTokenAddress(parameters) -> setVMvkTokenAddress(parameters, s)  
  | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)
  | SetTempVMvkTotalSupply(parameters) -> setTempVMvkTotalSupply(parameters, s)
  end
