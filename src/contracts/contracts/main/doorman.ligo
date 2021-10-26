
type stakeRecord is record [
    time : timestamp;
    amount : nat;
    op_type : string; // stake / unstake 
]
type userStakeRecords is big_map (nat, map (address, stakeRecord))
type addressId is big_map (address, nat)

// type burn_token_params is michelson_pair(address, "from", nat, "value")
type burn_token_params is (address * nat)
type burn_token is BurnToken of burn_token_params

// type mint_token_params is michelson_pair(address, "to", nat, "value")
type mint_token_params is (address * nat)
type mint_token is MintToken of mint_token_params

type request is record[
    callback: contract(int)
]

type storage is record [
    admin : address;
    addressId : addressId;
    mvkTokenAddress: address; 
    tempSenderAddress: address;
    vMvkTokenAddress: address;
    userStakeRecord : userStakeRecords;
    tempMvkTotalSupply: nat;    
    tempVMvkTotalSupply: nat;  
    lastUserId: nat;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

type stakeAction is 
    | Stake of (nat)
    | Unstake of (nat)
    | SetAdmin of (address)
    | SetMvkTokenAddress of (address)
    | SetVMvkTokenAddress of (address)
    | TestContractCall of (address)
    | TestContractCallEntrypoint of (address)

(* Helper functions *)
// helper function to burn token
function get_burn_token_contract(const tokenAddress : address) : contract(burn_token) is
  case (Tezos.get_entrypoint_opt(
      "%burn",
      tokenAddress) : option(contract(burn_token))) of
    Some(contr) -> contr
  | None -> (failwith("Burn entrypoint not found") : contract(burn_token))
  end;

(* Helper function to prepare the token transfer *)
function wrap_token_burn_tx(
  const from_ : address;
  const value : nat) : burn_token is
  BurnToken(from_, value)

(* Helper function to burn mvk/vmvk tokens *)
function burn_tokens(
  const sender_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    wrap_token_burn_tx(
      sender_,
      amount_),
    0tez,
    get_burn_token_contract(tokenAddress)
  );

// helper functions to mint token
function get_mint_token_contract(const token_address : address) : contract(mint_token) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mint_token))) of
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mint_token))
  end;

function wrap_token_mint_tx(
  const to_ : address;
  const value : nat) : mint_token is
  MintToken(to_, value)

(* Helper function to mint mvk/vmvk tokens *)
function mint_tokens(
  const receiver_ : address;
  const amount_ : nat;
  const contract_address : address) : operation is
  Tezos.transaction(
    wrap_token_mint_tx(
      receiver_,
      amount_),
    0tez,
    get_mint_token_contract(contract_address)
  );

(*  set contract admin address *)
function setAdmin(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.admin := parameters;
} with (noOperations, s)

(* mvk contract address *)
function setMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.mvkTokenAddress := parameters;
} with (noOperations, s)

(* vMvk contract address *)
function setVMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.vMvkTokenAddress := parameters;
} with (noOperations, s)



function get_increment_entrypoint (const addr : address) is
block {
  const entrypoint : option (contract (nat))
  = Tezos.get_entrypoint_opt ("%increment", addr)
} with
    case entrypoint of [
      Some (contract) -> contract
    | None -> (failwith ("Increment entrypoint does not exist") : contract (nat))
    ]

function get_mvk_burn_entrypoint (const addr : address) is
block {
  const entrypoint : option (contract (burn_token_params))
  = Tezos.get_entrypoint_opt ("%burn", addr)
} with
    case entrypoint of [
      Some (contract) -> contract
    | None -> (failwith ("Burn entrypoint does not exist") : contract (burn_token_params))
    ]



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

  const burn_mvk_tokens_tx : operation = burn_tokens(
      Tezos.sender,        // from address
      stakeAmount,         // amount of mvk Tokens to be burned
      s.mvkTokenAddress);  // mvkTokenAddress

  const mint_vmvk_tokens_tx : operation = mint_tokens(
      Tezos.sender,        // to address
      stakeAmount,         // amount of vmvk Tokens to be minted
      s.vMvkTokenAddress); // vmvkTokenAddress

//   // list of operations: burn mvk tokens first, then mint vmvk tokens
const operations : list(operation) = list [burn_mvk_tokens_tx; mint_vmvk_tokens_tx];

  // 3. update record of user address with minted vMVK tokens

  // temp var: to check if user address exist in the record, and increment lastUserId index if not
  const check_user_exists_in_stake_records : map(address, stakeRecord) = case s.userStakeRecord[s.lastUserId] of
      Some(_val) -> _val
      | None -> map[]
  end;
  // comparison to be fixed - not sure if size(map[]) > 0
  if size(check_user_exists_in_stake_records) > 0n then s.lastUserId := s.lastUserId + 1n
  else skip;

  // get user index in record from sender address; assign  user address to lastUserId index if user does not exist in record
  const userId : nat = case s.addressId[Tezos.sender] of
      Some(_val) -> _val
      | None -> s.lastUserId 
  end;

  s.addressId[Tezos.sender] := userId;
  
  // save userStakeRecord
  var container : map(address, stakeRecord) := case s.userStakeRecord[userId] of 
      Some(_val) -> _val
      | None -> map []
  end;

  var user : stakeRecord := case container[Tezos.sender] of 
      Some(_val) -> record [
          amount  = _val.amount + stakeAmount;
          time    = Tezos.now;     
          op_type = "stake";       
      ]
      | None -> record [
              time = Tezos.now;
              amount = stakeAmount;    
              op_type = "stake";                        
          ]
  end;
  
  container[Tezos.sender] := user;
  s.userStakeRecord[userId] := container;

} with (operations, s)

function testContractCall(const contractAddress : address; const s : storage) : return is
block{
 const testTx : contract (unit) =
      case (Tezos.get_contract_opt (contractAddress): option(contract(unit))) of
        Some (contr) -> contr
      | None -> (failwith ("cannot find contract address") : (contract(unit)))
      end;
  const testOperation : operation = Tezos.transaction (unit, 0mutez, testTx);   
  const operations : list(operation) = list [testOperation];

} with (operations, s)

function testContractCallEntrypoint(const contractAddress : address; const s : storage) : return is
block{
 const testTx : contract (burn_token) =
      case (Tezos.get_entrypoint_opt ("%burn",contractAddress): option(contract(burn_token))) of
        Some (contr) -> contr
      | None -> (failwith ("cannot find entrypoint") : (contract(burn_token)))
      end;
  const testOperation : operation = Tezos.transaction (wrap_token_burn_tx(
      Tezos.sender,
      5n), 0mutez, testTx);   
  const operations : list(operation) = list [testOperation];

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

  // 1. verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  if unstakeAmount = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;

  // 2. calculate exit fee (in vMVK tokens) and final MVK token amount
  // get and update MVK/vMVK total supply

  
  // frontend - call getMvkTotalSupply and getVMvkTotalSupply to update storage?
  // security issue - set calling of unstake method only from admin address and/or whitelisted address and/or Tezos.self_address (include separate callUnstake method to verify sender)?


  // const totalMvkSupply = getTotalMvkSupply(unit);
  // const totalVmvkSupply = getTotalVmvkSupply(unit);
  // s.tempMvkTotalSupply := totalMvkSupply;
  // s.tempVMvkTotalSupply := totalVmvkSupply;

  // const exitFee = calculateExitFee(unit, s : storage);  // returns in mu (10^6)
//   const mvkLoyaltyIndex : nat = (s.tempMvkTotalSupply * 1000000n * 100n / (s.tempVMvkTotalSupply + s.tempMvkTotalSupply));
//   const exitFee : nat = (500n * 1000000n * 100n) / (mvkLoyaltyIndex + (5n * 1000000n)); 
//   const finalAmount : nat = abs((unstakeAmount * 1000000n) - (unstakeAmount * exitFee)); // somehow giving int type, use abs to cast as nat
  
  // 3. mint + burn method in vmvkToken.ligo and mvkToken.ligo respectively
  // balance check in burn functions
//   const burn_vmvk_tokens_tx : operation = burn_tokens(
//       Tezos.sender,         // from address
//       finalAmount,          // amount of vMVK Tokens to be burned [in mu - 10^6]
//       s.vMvkTokenAddress);  // vmvkTokenAddress
  
//   const mint_mvk_tokens_tx : operation = mint_tokens(
//       Tezos.sender,        // to address
//       finalAmount,         // final amount of MVK Tokens to be minted (vMVK - exit fee) [in mu - 10^6]
//       s.mvkTokenAddress);  // mvkTokenAddress

  // list of operations: burn vmvk tokens first, then mint mvk tokens
//   const operations : list(operation) = list [burn_vmvk_tokens_tx; mint_mvk_tokens_tx];

  // 4. update record of user unstaking
  // get user index in record from sender address
//   const userId : nat = case s.addressId[Tezos.sender] of
//       Some(_val) -> _val
//       | None -> failwith("User not found")
//   end;

//   s.addressId[Tezos.sender] := userId;

//   // save userStakeRecord
//   var container : map(address, stakeRecord) := case s.userStakeRecord[userId] of 
//       Some(_val) -> _val
//       | None -> map []
//   end;

//   var user : stakeRecord := case container[Tezos.sender] of 
//       Some(_val) -> record [
//           amount  = abs(_val.amount - unstakeAmount); // decrease amount by unstaked MVK
//           time    = Tezos.now;    
//           op_type = "unstake";    
//       ]
//       | None -> failwith("User record not found")
//   end;
  
//   container[Tezos.sender] := user;
//   s.userStakeRecord[userId] := container;

  // to be done in future
  //----------------------------------
  // 5. calculate distribution of exit fee as rewards to vMVK holders
  // 6. transfer / save record of exit fee rewards for each vMVK holder

} with (noOperations, s)

(* Main entrypoint *)
function main (const action : stakeAction; const s : storage) : return is
  case action of
  | Stake(parameters) -> stake(parameters, s)  
  | Unstake(parameters) -> unstake(parameters, s)  
  | SetAdmin(parameters) -> setAdmin(parameters, s)  
  | SetMvkTokenAddress(parameters) -> setMvkTokenAddress(parameters, s)  
  | SetVMvkTokenAddress(parameters) -> setVMvkTokenAddress(parameters, s)  
  | TestContractCall(parameters) -> testContractCall(parameters, s)
  | TestContractCallEntrypoint(parameters) -> testContractCallEntrypoint(parameters, s)
  end
