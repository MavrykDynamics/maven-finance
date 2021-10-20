function get_fa12_token_contract(
  const token_address : address) : contract(transfer_type_fa12) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      token_address) : option(contract(transfer_type_fa12))) of
    Some(contr) -> contr
  | None -> (failwith("Dex/not-token") : contract(transfer_type_fa12))
  end;

(* Helper function to prepare the token transfer *)
function wrap_fa12_transfer_trx(
  const owner : address;
  const receiver : address;
  const value : nat) : transfer_type_fa12 is
  TransferTypeFA12(owner, (receiver, value))

(* Helper function to transfer fa1.2 tokens *)
function transfer_fa12(
  const sender_ : address;
  const receiver : address;
  const amount_ : nat;
  const contract_address : address) : operation is
  Tezos.transaction(
    wrap_fa12_transfer_trx(
      sender_,
      receiver,
      amount_),
    0mutez,
    get_fa12_token_contract(contract_address)
  );

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
  BurnToken(from_, value))

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
  MintToken(to_, value))

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
    s.vmvkTokenAddress := parameters;
} with (noOperations, s)


// voting contract address 
function setVotingContractAddress(const parameters : address; var s : storage) : return is
block {
    s.votingContract := parameters;
} with (noOperations, s)

function stake(const parameter : nat; var s : storage) : return is
block {

  // Steps Overview
  // 1. verify that user is staking more than 1 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez - set min to 1
  // 2. mint + burn method in mvkToken.ligo and vmvkToken.ligo - then Temple wallet reflects the ledger amounts of MVK and vMVK - burn/mint operations are reflected
  // 3. update record of user staking
  // ----------------------------------------

  // 1. verify that user is staking more than 0 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez 
  if parameter = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;
    
  // 2. mint + burn method in mvkToken.ligo and vmvkToken.ligo - then Temple wallet reflects the ledger amounts of MVK and vMVK - burn/mint operations are reflected
  
  // balance check in burn functions
  const burn_mvk_tokens_tx : operation = burn_tokens(
      Tezos.sender,        // from address
      parameter,           // amount of mvk Tokens to be burned
      s.mvkTokenAddress);  // mvkTokenAddress
  
  const mint_vmvk_tokens_tx : operation = mint_tokens(
      Tezos.sender,        // to address
      parameter,           // amount of vmvk Tokens to be minted
      s.vmvkTokenAddress); // vmvkTokenAddress

  // s.tempMvkTotalSupply := s.tempMvkTotalSupply - parameter; // burn MVK - MVK total supply decrease
  // s.tempVmvkTotalSupply := s.tempVmvkTotalSupply - parameter; // burn vMVK - vMVK total supply increase
  
  // list of operations: burn mvk tokens first, then mint vmvk tokens
  const operations : list(operation) = list [burn_mvk_tokens_tx, mint_vmvk_tokens_tx]

  // 3. update record of user address with minted vMVK tokens

  // temp var: to check if user address exist in the record, and increment lastUserId index if not
  const check_user_exists_in_stake_records : map(address, stakeRecord) = case s.userStakeRecord[s.lastUserId] of
      Some(_val) -> _val
      | None -> map []
  end;
  if check_user_exists_in_stake_records = map[] then s.lastUserId := s.lastUserId + 1n
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
          amount = _val.amount + parameter;
          time = Tezos.now;        
      ]
      | None -> record [
              time = Tezos.now;
              amount = parameter;                        
          ]
  end;
  
  container[Tezos.sender] := user;
  s.userStakeRecord[userId] := container;

} with (operations, s)

function temp(const: parameters)

function unstake(const parameters : nat; var s : storage) : return is
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
  if parameter = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;

  // 2. calculate exit fee (in vMVK tokens) and final MVK token amount
  // get and update MVK/vMVK total supply
  const totalMvkSupply = getTotalMvkSupply();
  const totalVmvkSupply = getTotalVmvkSupply();
  s.tempMvkTotalSupply := totalMvkSupply;
  s.tempVmvkTotalSupply := totalVmvkSupply;
  
  const exitFee = calculateExitFee(); 
  const finalAmount: nat := parameter * ((100 - exitFee) / 100)

  // 3. mint + burn method in vmvkToken.ligo and mvkToken.ligo respectively
  // balance check in burn functions
  const burn_vmvk_tokens_tx : operation = burn_tokens(
      Tezos.sender,         // from address
      finalAmount,          // amount of vMVK Tokens to be burned
      s.vmvkTokenAddress);  // vmvkTokenAddress
  
  const mint_mvk_tokens_tx : operation = mint_tokens(
      Tezos.sender,        // to address
      finalAmount,         // final amount of MVK Tokens to be minted (vMVK - exit fee)
      s.mvkTokenAddress);  // mvkTokenAddress

  // list of operations: burn vmvk tokens first, then mint mvk tokens
  const operations : list(operation) = list [burn_vmvk_tokens_tx, mint_mvk_tokens_tx]

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
          amount = _val.amount - parameter; // decrease amount by unstaked MVK
          time = Tezos.now;        
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


function calculateExitFee(const _parameter : unit) : nat is 
block{

  // - check on how to handle decimals
  //----------------------------------
  // MLI = (total vMVK / (total vMVK + total MVK)) * 100
  // exitFee = 500 / (MLI + 5)
  var mvkLoyaltyIndex : nat := (s.tempMvkTotalSupply / (s.tempVmvkTotalSupply + s.tempMvkTotalSupply)) * 100;
  var exitFee : nat := 500 / (mvkLoyaltyIndex + 5); 

  // sample calculation: assume unstake param = 250; s.tempMvkTotalSupply = 3000; s.tempVmvkTotalSupply = 4000
  // MLI = (3000/7000)*100 = 42.857
  // exitFee = 500 / (42.857 + 5) = 10.447
  // finalAmount = 250 * ((100 - 10.447) / 100) = 250 * 0.89553 = 223.8825

} with exitFee


// Helper function for getting total supply
function getTotalSupply (const request : request; var s: s): return is (list [Tezos.transaction(s.totalSupply, 0mutez, request.callback)], s);

function getTotalMvkSupply(const _parameter : unit) : nat is
block{
  const totalMvkSupply : nat = getTotalSupply(s.mvkTokenAddress); // can it be done this way?
} with totalMvkSupply

function getTotalVmvkSupply(const _parameter : unit) : nat is
block{
  const totalVmvkSupply : nat = getTotalSupply(s.vmvkTokenAddress);
} with totalVmvkSupply



//-------------------------------------------------------------------------
// rewards to be in a separate contract? as there are no time-based rewards

function getReward(const parameters : getRewardParam) : nat is
block {

    // Reward from Governance vote - voting is incentivised with stability fees (from satellites to delegates)
    // Reward from Oracle - providing price feed data (from satellites to delegates)
    // Reward from Exit Fees - opportunity cost for staking (how will this be distributed)
    // Reward from time staked? - set temporary function first

    // const k : nat = 10_000_000_000n;
    // var period : nat := abs(parameters.stop - parameters.start);
    // var timeRatio : nat := k * period;
    // timeRatio := abs(timeRatio / 31536000);
    // var reward : nat := timeRatio * parameters.rate * parameters.amount;
    // reward := reward / (k * 100n);
} with reward


function claimReward(const _parameters : unit; var s : storage) : return is 
block {

} with (operations, s)
