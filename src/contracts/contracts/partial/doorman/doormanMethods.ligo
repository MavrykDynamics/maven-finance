#include "doormanTypes.ligo"

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

// contract admin address
function setContractAdmin(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.admin := parameters;
} with (noOperations, s)

// contract address
function setContractAddress(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.contract := parameters;
} with (noOperations, s)

// reserve address
function setReserveAddress(const parameters : address; var s : storage) : return is
block {
    s.reserve := parameters;
} with (noOperations, s)

// burn address
function setBurnAddress(const parameters : address; var s : storage) : return is
block {
    s.burnAddress := parameters;
} with (noOperations, s)

// voting contract address 
function setVotingContractAddress(const parameters : address; var s : storage) : return is
block {
    s.votingContract := parameters;
} with (noOperations, s)

function stake(const parameter : nat; var s : storage) : return is
block {

  // Steps Overview
  // 1. verify that user is staking more than 0 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  // 2. verify that user has the amount of MVK tokens to stake
  // 3. send staked MVK tokens to burn address : require burn address (set placeholder address to "...")
  // 4. mint vMVK tokens : amount equal to staked MVK tokens - transfer FA2 from the treasury or increase amount in user reward account?
  // 5. update record of user address with minted vMVK tokens

  // 1. verify that user is staking more than 0 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez  
  if parameter = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;

  // 2. verify that user has the amount of MVK tokens to stake

    // inter-contract call to mvkToken.ligo to getAllowance?
    
  // 3. send staked MVK tokens to burn address : require burn address (set placeholder address to "...")
    
    const tx : operation = transfer_fa12(
        Tezos.sender,
        s.burnAddress,
        parameter,
        s.contract);
    const operations : list(operation) = list [tx]

  // 4. mint vMVK tokens : amount equal to staked MVK tokens - transfer FA1.2 from the treasury or increase amount in user record?
  
    // if transfer vMVK FA1.2 from the treasury, add operation here
    // if increase amount in user record, save record here
  
  
  // 5. update record of user address with minted vMVK tokens

    // temp: to check if user address exist in the record, and increment lastUserId index if not
    const check_user_exists_in_records : map(address, stakeRecord) = case s.userStakeRecord[s.lastUserId] of
        Some(_val) -> _val
        | None -> map []
    end;
    if check_user_exists_in_records = map[] then s.lastUserId := s.lastUserId + 1n
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
            reward = 0n; // temporary: to be changed as reward might not be stored here
            amount = _val.amount + parameter;
            time = Tezos.now;        
        ]
        | None -> record [
                time = Tezos.now;
                amount = parameter;
                reward = 0n;            
            ]
    end;
    
    container[Tezos.sender] := user;
    s.userStakeRecord[userId] := container;

} with (operations, s)


function unstake(const parameters : nat; var s : storage) : return is
block {

  // Steps Overview
  // 1. verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  // 2. verify that user is not unstaking more vMVK tokens than what he has
  // 3. calculate exit fee (in vMVK tokens) and final MVK token amount
  // 4. check case that exit fee does not exceed vMVK tokens to be unstaked
  // 5. transfer final MVK token amount to user address
  // 6. calculate distribution of exit fee as rewards to vMVK holders
  // 7. transfer / save record of exit fee rewards for each vMVK holder

  // 1. verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez

  if parameter = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;

  // 2. verify that user is not unstaking more vMVK tokens than what he has

  // 3. calculate exit fee (in vMVK tokens) and final MVK token amount

  // 4. check case that exit fee does not exceed vMVK tokens to be unstaked

  // 5. transfer final MVK token amount to user address

  // 6. calculate distribution of exit fee as rewards to vMVK holders

  // 7. transfer / save record of exit fee rewards for each vMVK holder

} with (operations, s)


function calculateExitFee(const parameter: nat) : nat is 
block{

  // MLI = (total vMVK / (total vMVK + total MVK)) * 100
  // exit fee = 500 / (MLI + 5)

  // assume total vMVK to be the total amount in userStakeRecords + total amount in user's rewardAccount (from rewards accumulated from yield farming, satellite rewards etc)
  // total MVK to obtain from mvkToken getTotalSupply



} with exitFee



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
