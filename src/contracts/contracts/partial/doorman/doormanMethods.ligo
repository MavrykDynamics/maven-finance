#include "doormanTypes.ligo"

// helper function to burn token
function get_burn_token_contract(const token_address : address) : contract(burn_token) is
  case (Tezos.get_entrypoint_opt(
      "%burn",
      token_address) : option(contract(burn_token))) of
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
  const contract_address : address) : operation is
  Tezos.transaction(
    wrap_token_burn_tx(
      sender_,
      amount_),
    0mutez,
    get_burn_token_contract(contract_address)
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
    0mutez,
    get_mint_token_contract(contract_address)
  );

  // Helper function for getting total supply
  // function getTotalSupply (const request : request; var s: storage): return is (list [Tezos.transaction(s.tempTotalSupply, 0mutez, request.callback)], s);

  // function getTotalMvkSupply(const _parameter : unit) : nat is
  // block{
  //   const totalMvkSupply : nat = getTotalSupply(s.mvkTokenAddress); // can it be done this way?
  // } with totalMvkSupply

  // function getTotalVmvkSupply(const _parameter : unit) : nat is
  // block{
  //   const totalVmvkSupply : nat = getTotalSupply(s.vmvkTokenAddress);
  // } with totalVmvkSupply

// function getTotalMvkSupply(const tokenContractAddress: address; var s: storage): return is
//     block {
//         // The entry point where the information will arrive in THIS contract
//         const requested : request = record [
//             callback =  case (Tezos.get_entrypoint_opt("%setTotalMvkSupply", Tezos.self_address) : option(contract(nat))) of 
//                             | Some (cb) -> cb
//                             | None -> (failwith ("Not a contract"): contract (nat))
//                         end;
//         ];

//         // The entry point of the contract, from where we are going to obtain the information
//         // Must be of the same type, request, see the "contract(request)"
//         const destination : contract (request) =
//             case (Tezos.get_entrypoint_opt ("%getTotalSupply", tokenContractAddress) : option (contract (request))) of
//                 | Some (cb) -> cb
//                 | None -> (failwith ("Entrypoint not found.") : contract (request))
//             end;

//     } with (list [Tezos.transaction (requested, 0mutez, destination)], s);

//   function setTotalMvkSupply (const mvkTotalSupply : nat ; var s : storage) : return is
//     block { 
//         patch s with record [tempMvkTotalSupply = mvkTotalSupply]
//     } with (emptyOps, s);


//   function getTotalVMvkSupply(const tokenContractAddress: address; var s: storage): return is
//   block {
//       // The entry point where the information will arrive in THIS contract
//       const requested : request = record [
//           callback =  case (Tezos.get_entrypoint_opt("%setTotalVMvkSupply", Tezos.self_address) : option(contract(nat))) of 
//                           | Some (cb) -> cb
//                           | None -> (failwith ("Not a contract"): contract (nat))
//                       end;
//       ];

//       // The entry point of the contract, from where we are going to obtain the information
//       // Must be of the same type, request, see the "contract(request)"
//       const destination : contract (request) =
//           case (Tezos.get_entrypoint_opt ("%getTotalSupply", tokenContractAddress) : option (contract (request))) of
//               | Some (cb) -> cb
//               | None -> (failwith ("Entrypoint not found.") : contract (request))
//           end;

//   } with (list [Tezos.transaction (requested, 0mutez, destination)], s);

//   function setTotalVMvkSupply (const vMvkTotalSupply : nat ; var s : storage) : return is
//     block { 
//         patch s with record [tempVMvkTotalSupply = vMvkTotalSupply]
//     } with (emptyOps, s);


  // // receive transaction from mvkToken getTotalSupply
  // function receiveTotalMvkSupply(const mvkTotalSupply : nat; var s: storage) : nat is
  // block{
  //   skip
  // } with mvkTotalSupply

  // // receive transaction from vmvkToken getTotalSupply
  // function receiveTotalVmvkSupply(const vmvkTotalSupply : nat; var s: s) : nat is
  // block{
  //   skip
  // } with vmvkTotalSupply


  // function calculateExitFee(const _parameter : unit; var s : storage) : nat is 
  // block{
  //   // MLI = (total vMVK / (total vMVK + total MVK)) * 100
  //   // exitFee = 500 / (MLI + 5)
    
  //   // sample calculation assumed parameters:  unstake amount (param) = 250; s.tempMvkTotalSupply = 3000; s.tempVmvkTotalSupply = 4000
  //   // Normal calculation (where decimals are factored in)
  //   // MLI = (3000/7000)*100 = 42.857        -> in Ligo, will return 42
  //   // exitFee = 500 / (42.857 + 5) = 10.447 -> in Ligo, will return 10
  //   // finalAmount = 250 * ((100 - 10.447) / 100) = 250 * 0.89553 = 223.8825  
  //   // comparison if fixed-point arithmetic is not used: finalAmount = 250 * 0.9 = 225 (since exit fee will be taken as 10 in Ligo)
  //   // difference of 1.1175
  //   // ----
  //   // with Fixed-point arithmetic - scale with mu - 10^6
  //   // MLI(i) = (3000 * 10^6 * 100) / 7000 = 42857142.85714 -> in Ligo, will return 42857142
  //   // exitFee = (500 * 10^6 * 10^4) / (MLI + 5*10^6) = (500,000,000 * 10^4) / (42,857,142 + 5,000,000) = 104477.613811 -> in Ligo, will return 104477 (i.e. 10.4477%)
  //   // adjust accuracy by multiplying exitFee quotient by 10^4 or 10^6 (10^6 will be more accurate e.g. 10447761 is used instead of 104477)
  //   // finalAmount = (250 * 10^6) - (250 * 104477) = 250*10^6 - 26119250 = 223880750 muMVK -> 223.880750 MVK
  //   // difference of 0.00175 
  //   var mvkLoyaltyIndex : nat := (s.tempMvkTotalSupply * 1000000n * 100n / (s.tempVmvkTotalSupply + s.tempMvkTotalSupply));
  //   var exitFee : nat := (500n * 1000000n * 100n) / (mvkLoyaltyIndex + (5n * 1000000n)); 
  // } with exitFee

// --------


// contract admin address
function setAdmin(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.admin := parameters;
} with (noOperations, s)

// mvk contract address 
function setMvkContractAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.mvkTokenAddress := parameters;
} with (noOperations, s)

// vmvk contract address 
function setVmvkContractAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.vMvkTokenAddress := parameters;
} with (noOperations, s)

// voting contract address - not in use currently, for future DAO based governance implementation
// function setVotingContractAddress(const parameters : address; var s : storage) : return is
// block {
//     s.votingContract := parameters;
// } with (noOperations, s)

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
  
  // balance check in burn functions
  const burn_mvk_tokens_tx : operation = burn_tokens(
      Tezos.sender,        // from address
      stakeAmount,         // amount of mvk Tokens to be burned
      s.mvkTokenAddress);  // mvkTokenAddress
  
  const mint_vmvk_tokens_tx : operation = mint_tokens(
      Tezos.sender,        // to address
      stakeAmount,         // amount of vmvk Tokens to be minted
      s.vMvkTokenAddress); // vmvkTokenAddress

  // list of operations: burn mvk tokens first, then mint vmvk tokens
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

// unstake function -> return list of operations: 1. call getTotalMvkSupply 2. call getTotalVMvkSupply 3. unstakeAction (perform unstaking with ) 


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
  const mvkLoyaltyIndex : nat = (s.tempMvkTotalSupply * 1000000n * 100n / (s.tempVMvkTotalSupply + s.tempMvkTotalSupply));
  const exitFee : nat = (500n * 1000000n * 100n) / (mvkLoyaltyIndex + (5n * 1000000n)); 
  const finalAmount : nat = abs((unstakeAmount * 1000000n) - (unstakeAmount * exitFee)); // somehow giving int type, use abs to cast as nat
  
  // 3. mint + burn method in vmvkToken.ligo and mvkToken.ligo respectively
  // balance check in burn functions
  const burn_vmvk_tokens_tx : operation = burn_tokens(
      Tezos.sender,         // from address
      finalAmount,          // amount of vMVK Tokens to be burned [in mu - 10^6]
      s.vMvkTokenAddress);  // vmvkTokenAddress
  
  const mint_mvk_tokens_tx : operation = mint_tokens(
      Tezos.sender,        // to address
      finalAmount,         // final amount of MVK Tokens to be minted (vMVK - exit fee) [in mu - 10^6]
      s.mvkTokenAddress);  // mvkTokenAddress

  // list of operations: burn vmvk tokens first, then mint mvk tokens
  const operations : list(operation) = list [burn_vmvk_tokens_tx; mint_mvk_tokens_tx];

  // 4. update record of user unstaking
  // get user index in record from sender address
  const userId : nat = case s.addressId[Tezos.sender] of
      Some(_val) -> _val
      | None -> failwith("User not found")
  end;

  s.addressId[Tezos.sender] := userId;

  // save userStakeRecord
  var container : map(address, stakeRecord) := case s.userStakeRecord[userId] of 
      Some(_val) -> _val
      | None -> map []
  end;

  var user : stakeRecord := case container[Tezos.sender] of 
      Some(_val) -> record [
          amount  = abs(_val.amount - unstakeAmount); // decrease amount by unstaked MVK
          time    = Tezos.now;    
          op_type = "unstake";    
      ]
      | None -> failwith("User record not found")
  end;
  
  container[Tezos.sender] := user;
  s.userStakeRecord[userId] := container;

  // to be done in future
  //----------------------------------
  // 5. calculate distribution of exit fee as rewards to vMVK holders
  // 6. transfer / save record of exit fee rewards for each vMVK holder

} with (operations, s)




