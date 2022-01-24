// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type stakeRecordType is record [
    time              : timestamp;
    amount            : nat;    // MVK / vMvk in mu (10^6)
    exitFee           : nat;    // MVK / vMvk in mu (10^6)
    mvkLoyaltyIndex   : nat;    // audit log for MVK Loyalty Index at time of transaction
    mvkTotalSupply    : nat;    // audit log for MVK total supply at time of transaction
    vMvkTotalSupply   : nat;    // audit log for vMVK total supply at time of transaction
    opType            : string; // audit log for type of transaction (stake / unstake / exitFeeReward / exitFeeDistribution)
]
type userStakeRecordsType is big_map(address, map(nat, stakeRecordType))

type userStakeBalanceType is big_map(address, nat)

type burnTokenType is (address * nat)
type mintTokenType is (address * nat)
type udpateSatelliteBalanceParams is (address * nat * nat)

type breakGlassConfigType is record [
    stakeIsPaused           : bool;
    unstakeIsPaused         : bool;
]

type storage is record [

    admin                 : address;
    
    whitelistContracts    : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts      : generalContractsType;
    
    breakGlassConfig      : breakGlassConfigType;
    
    userStakeRecordsLedger    : userStakeRecordsType;  // records of all user transactions
    userStakeBalanceLedger    : userStakeBalanceType;  // user staked balance
    
    tempMvkTotalSupply    : nat; // temporary mvk total supply in circulation   
    stakedMvkTotalSupply  : nat; // current total staked MVK 

    logExitFee            : nat; // to be removed after testing
    logFinalAmount        : nat; // to be removed after testing
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

type getSatelliteBalanceType is (address * string * string * string * nat * contract(string * string * string * nat * nat)) // name, description, image, satellite fee
type satelliteInfoType is (string * string * string * nat * nat) // name, description, image, satellite fee, vMVK balance

type stakeType is 
  StakeAction of unit
| UnstakeAction of unit

type stakeAction is 

    | SetAdmin of (address)
    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams
    | SetTempMvkTotalSupply of (nat)    

    | PauseAll of (unit)
    | UnpauseAll of (unit)
    | TogglePauseStake of (unit)
    | TogglePauseUnstake of (unit)

    | GetStakedBalance of (address * contract(nat))
    | GetSatelliteBalance of getSatelliteBalanceType

    | Stake of (nat)
    | Unstake of (nat)
    | UnstakeComplete of (nat)
    | DistributeExitFeeReward of (address * nat)

(* ---- Helper functions begin ---- *)

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Error. Only the administrator can call this entrypoint.");

function checkSenderIsMvkTokenContract(var s : storage) : unit is
block{
  const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
      Some(_address) -> _address
      | None -> failwith("Error. MVK Token Contract is not found.")
  end;
  if (Tezos.sender = mvkTokenAddress) then skip
  else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
} with unit

function checkSenderIsExitFeePoolContract(var s : storage) : unit is
block{
    const exitFeePoolAddress : address = case s.generalContracts["exitFeePool"] of
        Some(_address) -> _address
        | None -> failwith("Error. Exit Fee Pool Contract is not found.")
    end;
    if (Tezos.sender = exitFeePoolAddress) then skip
    else failwith("Error. Only the Exit Fee Pool Contract can call this entrypoint.");
} with unit

function checkSenderIsDelegationContract(var s : storage) : unit is
block{
    const delegationAddress : address = case s.generalContracts["delegation"] of
        Some(_address) -> _address
        | None -> failwith("Error. Delegation Contract is not found.")
    end;
    if (Tezos.sender = delegationAddress) then skip
    else failwith("Error. Only the Delegation Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// admin helper functions end ---------------------------------------------------------

// helper function to get token total supply (works for either MVK and vMVK)
// function getTokenTotalSupply(const tokenAddress : address) : contract(contract(nat)) is
//   case (Tezos.get_entrypoint_opt(
//       "%getTotalSupply",
//       tokenAddress) : option(contract(contract(nat)))) of
//     Some(contr) -> contr
//   | None -> (failwith("GetTotalSupply entrypoint in Token Contract not found") : contract(contract(nat)))
//   end;

// helper function to get MVK total supply
function updateMvkTotalSupplyForDoorman(const tokenAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%updateMvkTotalSupplyForDoorman",
      tokenAddress) : option(contract(nat))) of
    Some(contr) -> contr
  | None -> (failwith("UpdateMvkTotalSupplyForDoorman entrypoint in MVK Token Contract not found") : contract(nat))
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

// helper function to update satellite's balance
function updateSatelliteBalance(const delegationAddress : address) : contract(udpateSatelliteBalanceParams) is
  case (Tezos.get_entrypoint_opt(
      "%onStakeChange",
      delegationAddress) : option(contract(udpateSatelliteBalanceParams))) of
    Some(contr) -> contr
  | None -> (failwith("onStakeChange entrypoint in Satellite Contract not found") : contract(udpateSatelliteBalanceParams))
  end;

  // helper function to update satellite's balance
// function updateUserBalanceInMvkContract(const tokenAddress : address) : contract(address * nat) is
//   case (Tezos.get_entrypoint_opt(
//       "%updateUserBalance",
//       tokenAddress) : option(contract(address * nat))) of
//     Some(contr) -> contr
//   | None -> (failwith("updateUserBalance entrypoint in Token Contract not found") : contract(address * nat))
//   end;

  function updateUserBalanceInMvkContract(const tokenAddress : address) : contract(address * nat * stakeType) is
  case (Tezos.get_entrypoint_opt(
      "%onStakeChange",
      tokenAddress) : option(contract(address * nat * stakeType))) of
    Some(contr) -> contr
  | None -> (failwith("onStakeChange entrypoint in Token Contract not found") : contract(address * nat * stakeType))
  end;

(* ---- Helper functions end ---- *)


// break glass toggle entrypoints begin ---------------------------------------------------------

function pauseAll(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to True

    if s.breakGlassConfig.stakeIsPaused then skip
      else s.breakGlassConfig.stakeIsPaused := True;

    if s.breakGlassConfig.unstakeIsPaused then skip
      else s.breakGlassConfig.unstakeIsPaused := True;

} with (noOperations, s)

function unpauseAll(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to False
    if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
      else skip;

    if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
      else skip;

} with (noOperations, s)

function togglePauseStake(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
      else s.breakGlassConfig.stakeIsPaused := True;

} with (noOperations, s)

function togglePauseUnstake(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
      else s.breakGlassConfig.unstakeIsPaused := True;

} with (noOperations, s)

// break glass toggle entrypoints end ---------------------------------------------------------


(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(* set mvk contract address *)
// function setMvkTokenAddress(const newTokenAddress : address; var s : storage) : return is
// block {
//     checkNoAmount(Unit); // entrypoint should not receive any tez amount
//     checkSenderIsAdmin(s); // check that sender is admin
//     s.mvkTokenAddress := newTokenAddress;
// } with (noOperations, s)

// (* set mvk contract address *)
// function setDelegationAddress(const newContractAddress : address; var s : storage) : return is
// block {

//     // entrypoint should not receive any tez amount
//     checkNoAmount(Unit);

//     // check that sender is admin
//     checkSenderIsAdmin(s);

//     s.delegationAddress := newContractAddress;
// } with (noOperations, s)

// (* set mvk contract address *)
// function setExitFeePoolAddress(const newContractAddress : address; var s : storage) : return is
// block {

//     checkNoAmount(Unit);   // entrypoint should not receive any tez amount
//     checkSenderIsAdmin(s); // check that sender is admin

//     s.exitFeePoolAddress := newContractAddress;
// } with (noOperations, s)


(* View function that forwards the staked balance of source to a contract *)
function getStakedBalance (const userAddress : address; const contr : contract(nat); var s : storage) : return is
  block {
    var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[userAddress] of
          Some(_val) -> _val
          | None -> 0n
      end;

  } with (list [transaction(userBalanceInStakeBalanceLedger, 0tz, contr)], s)

(* View function that forwards the balance of satellite with satellite creation params to the delegation contract *)
function getSatelliteBalance (const userAddress : address; const name : string; const description : string; const image : string; const satelliteFee : nat; const contr : contract(satelliteInfoType); var s : storage) : return is
  block {
    checkSenderIsDelegationContract(s);
    var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[userAddress] of
          Some(_val) -> _val
          | None -> 0n
      end;
  } with (list [transaction((name, description, image, satelliteFee, userBalanceInStakeBalanceLedger), 0tz, contr)], s)

function stake(const stakeAmount : nat; var s : storage) : return is
block {

  // Steps Overview
  // 1. verify that user is staking more than 1 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez - set min to 1
  // 2. update user staked balance in staked balance ledger, and update the total staked MVK supply
  // 3. send an operation to update Satellite's total delegated amount (there are checks for the user user in the delegation contract)
  // 4. add a new stake record for the user
  
  // old steps - no more mint + burn used
  // 2. mint + burn method in mvkToken.ligo and vmvkToken.ligo - then Temple wallet reflects the ledger amounts of MVK and vMVK - burn/mint operations are reflected
  // 3. update record of user staking
  // ----------------------------------------

  // entrypoint should not receive any tez amount
  checkNoAmount(Unit);

  // 1. verify that user is staking more than 0 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez 
  if stakeAmount = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;

  const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
      Some(_address) -> _address
      | None -> failwith("Error. MVK Token Contract is not found.")
  end;

  const delegationAddress : address = case s.generalContracts["delegation"] of
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  end;
        
  // update user's MVK balance (stake) -> decrease user balance in mvk ledger
  const updateUserMvkBalanceOperation : operation = Tezos.transaction(
      (Tezos.sender, stakeAmount, (StakeAction: stakeType)),
      0tez,
      updateUserBalanceInMvkContract(mvkTokenAddress)
    );

  const updateSatelliteBalanceOperation : operation = Tezos.transaction(
    (Tezos.sender, stakeAmount, 1n),
    0tez,
    updateSatelliteBalance(delegationAddress)
  );

  // list of operations: burn mvk tokens first, then mint vmvk tokens
  // const operations : list(operation) = list [burnMvkTokensOperation; mintVMvkTokensOperation; updateSatelliteBalanceOperation];
  const operations : list(operation) = list [updateSatelliteBalanceOperation; updateUserMvkBalanceOperation];

  // 3. update record of user address with minted vMVK tokens

  // update user's staked balance in staked balance ledger
  var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[Tezos.sender] of
      Some(_val) -> _val
      | None -> 0n
  end;
  var userBalanceInStakeBalanceLedger : nat := userBalanceInStakeBalanceLedger + stakeAmount; 
  s.userStakeBalanceLedger[Tezos.sender] := userBalanceInStakeBalanceLedger;

  // update staked MVK total supply
  s.stakedMvkTotalSupply := s.stakedMvkTotalSupply + stakeAmount;

  // check if user wallet address exists in stake ledger -> can also be taken as the number of user stake records
  var userRecordInStakeLedger : map(nat, stakeRecordType) := case s.userStakeRecordsLedger[Tezos.sender] of
      Some(_val) -> _val
      | None -> map[]
  end;

  // if user wallet address does not exist in stake ledger, add user to the stake ledger
  if size(userRecordInStakeLedger) = 0n then s.userStakeRecordsLedger[Tezos.sender] := userRecordInStakeLedger
    else skip;

  const lastRecordIndex : nat = size(userRecordInStakeLedger);

  var newStakeRecord : stakeRecordType := case userRecordInStakeLedger[lastRecordIndex] of
      Some(_val) -> _val
      | None -> record [
          amount           = stakeAmount;
          time             = Tezos.now;  
          exitFee          = 0n;     
          mvkLoyaltyIndex  = 0n; 
          mvkTotalSupply   = 0n;  // FYI: will not be accurate - set to 0 / null / placeholder?    
          vMvkTotalSupply  = 0n;  // FYI: will not be accurate - set to 0 / null / placeholder?    
          opType           = "stake";    
      ]
   end;

   userRecordInStakeLedger[lastRecordIndex] := newStakeRecord;
   s.userStakeRecordsLedger[Tezos.sender] := userRecordInStakeLedger;
 
} with (operations, s)


function unstake(const unstakeAmount : nat; var s : storage) : return is
block {
  // Steps Overview
  // 1. verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  // 2. fetch and update total MVK supply by getting balance in MVK token coontract
  // 3. complete unstake in callback operation after total MVK supply has been set
  // 4. calculate exit fee and verify that user has a record in stake balance ledger, and has enough balance to unstake
  // 5. update user's staked balance in staked balance ledger
  // 6. add a new unstake record to user's stake records ledger 
  // 7. send an operation to update Satellite's total delegated amount (there are checks for the user user in the delegation contract)
  // 8. increase staked MVK in exit fee reward pool - update exit fee staked balance in stake balance ledger 

  // old steps - no more mint + burn used
  // 2. intercontract invocation -> update total supply for MVK and vMVK
  // 3. unstakeComplete -> calculate exit fee, mint and burn method in vmvkToken.ligo and mvkToken.ligo respectively
  
  // to be done in future
  // 4. calculate distribution of exit fee as rewards to vMVK holders
  // 5. transfer / save record of exit fee rewards for each vMVK holder - unless exit fee rewards are calculated in a different way 
  // ----------------------------------------

  // verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  if unstakeAmount = 0n then failwith("You have to unstake more than 0 MVK tokens.")
    else skip;

  const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
      Some(_address) -> _address
      | None -> failwith("Error. MVK Token Contract is not found.")
  end;

  // update temp MVK total supply
  const updateMvkTotalSupplyProxyOperation : operation = Tezos.transaction(unstakeAmount, 0tez, updateMvkTotalSupplyForDoorman(mvkTokenAddress));

  // list of operations: get MVK total supply first, then get vMVK total supply (which will trigger unstake complete)
  const operations : list(operation) = list [updateMvkTotalSupplyProxyOperation];
  
} with (operations, s)



function unstakeComplete(const unstakeAmount : nat; var s : storage) : return is
block {

  checkSenderIsMvkTokenContract(s);

  // todo: use scalefactor of 10^18

  const scaleFactor : nat = 1000000n;                // mu (10^6) - can be adjusted for greater accuracy by increasing the value
  const percentageFactor : nat = scaleFactor / 100n; // with mu, percentageFactor returns 10000n
  
  // note on MLI:
  // stakedMvkTotalSupply becomes an implicit part of tempMvkTotalSupply, after the changes were done where 
  //   vMVK token contract is not used so that tempMvkTotalSupply does not fluctuate with staking/unstaking
  // const mvkLoyaltyIndex : nat = (s.stakedMvkTotalSupply * scaleFactor * 100n / (s.stakedMvkTotalSupply + s.tempMvkTotalSupply)); 
  const mvkLoyaltyIndex : nat = (s.stakedMvkTotalSupply * scaleFactor * 100n / s.tempMvkTotalSupply); 
  
  const exitFee : nat = (500n * scaleFactor * 100n ) / (mvkLoyaltyIndex + (5n * scaleFactor)); 

  if exitFee > abs(percentageFactor - 1n) then // exitFee cannot be more than 9999n (with scaleFactor of 10^6)
    failwith("Exit fee calculation error.")
  else skip;

  const finalAmountPercent : nat = abs(percentageFactor - exitFee); // i.e. 100% - 5% -> 10000 - 500 with fixed point arithmetic
  const finalAmount : nat = unstakeAmount * finalAmountPercent;
  const finalAmount : nat = finalAmount / percentageFactor;

  // temp to check correct amount of exit fee and final amount in console truffle tests
  s.logExitFee := exitFee * percentageFactor;
  s.logFinalAmount := finalAmount;
  // todo: split remainder of exitFee to be distributed as rewards

  // update user's staked balance in staked balance ledger
  var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[Tezos.source] of
      Some(_val) -> _val
      | None -> failwith("User staked balance not found in staked balance ledger.")
  end;
  
  // check if user has enough staked mvk to withdraw
  if unstakeAmount > userBalanceInStakeBalanceLedger then failwith("Error. Not enough balance.")
   else skip;

  // update staked MVK total supply
  if s.stakedMvkTotalSupply < finalAmount then failwith("Error. You cannot unstake more than what is in the staked MVK Total supply")
    else skip;
  s.stakedMvkTotalSupply := abs(s.stakedMvkTotalSupply - finalAmount);

  var userBalanceInStakeBalanceLedger : nat := abs(userBalanceInStakeBalanceLedger - unstakeAmount); 
  s.userStakeBalanceLedger[Tezos.source] := userBalanceInStakeBalanceLedger;

  const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
      Some(_address) -> _address
      | None -> failwith("Error. MVK Token Contract is not found.")
  end;

  const delegationAddress : address = case s.generalContracts["delegation"] of
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  end;

  // update user's MVK balance (unstake) -> increase user balance in mvk ledger
  const updateUserMvkBalanceOperation : operation = Tezos.transaction(
      (Tezos.source, finalAmount, (UnstakeAction: stakeType)),
      0tez,
      updateUserBalanceInMvkContract(mvkTokenAddress)
    );

  // update satellite balance if user is delegated to a satellite
  const updateSatelliteBalanceOperation : operation = Tezos.transaction(
      (Tezos.source, unstakeAmount, 0n),
      0tez,
      updateSatelliteBalance(delegationAddress)
    );

  // create list of operations
  const operations : list(operation) = list [updateUserMvkBalanceOperation; updateSatelliteBalanceOperation];

  // if user wallet address does not exist in stake records ledger, add user to the stake records ledger
  var userRecordInStakeLedger : map(nat, stakeRecordType) := case s.userStakeRecordsLedger[Tezos.source] of
    Some(_val) -> _val
    | None -> map[]
  end;

  const lastRecordIndex : nat = size(userRecordInStakeLedger);

  const exitFeeRecord : nat = exitFee * percentageFactor;
  var newStakeRecord : stakeRecordType := case userRecordInStakeLedger[lastRecordIndex] of         
      Some(_val) -> _val
      | None -> record[
          amount           = unstakeAmount;
          time             = Tezos.now;  
          exitFee          = exitFeeRecord;   
          mvkLoyaltyIndex  = mvkLoyaltyIndex; 
          mvkTotalSupply   = s.tempMvkTotalSupply;
          vMvkTotalSupply  = s.stakedMvkTotalSupply;          
          opType           = "unstake";  
      ]
  end;

  userRecordInStakeLedger[lastRecordIndex] := newStakeRecord;
  s.userStakeRecordsLedger[Tezos.source] := userRecordInStakeLedger;

  // const exitFeePoolAddress : address = case s.generalContracts["exitFeePool"] of
  //     Some(_address) -> _address
  //     | None -> failwith("Error. Exit Fee Pool Contract is not found.")
  // end;

  // // update exit fee pool's staked balance in staked balance ledger
  // var exitFeePoolBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[exitFeePoolAddress] of
  //     Some(_val) -> _val
  //     | None -> 0n
  // end;
  // var exitFeePoolBalanceInStakeBalanceLedger : nat := exitFeePoolBalanceInStakeBalanceLedger + exitFeeRecord; 
  // s.userStakeBalanceLedger[exitFeePoolAddress] := exitFeePoolBalanceInStakeBalanceLedger;

} with (operations, s)

function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    // check that the call is coming from MVK Token Contract
    checkSenderIsMvkTokenContract(s);
    s.tempMvkTotalSupply := totalSupply;
} with (noOperations, s);


// ********
// Pending Alex confirmation of how exit fee distribution will work
// ********
function distributeExitFeeReward(const userAddress : address; const exitFeeReward : nat; var s : storage) : return is
block {

  // only the exit fee pool can call this entrypoint
  checkSenderIsExitFeePoolContract(s);

  const exitFeePoolAddress : address = case s.generalContracts["exitFeePool"] of
      Some(_address) -> _address
      | None -> failwith("Error. Exit Fee Pool Contract is not found.")
  end;

  // check if exit fee pool address exists in stake record ledger 
  var exitFeePoolRecordInStakeRecordLedger : map(nat, stakeRecordType) := case s.userStakeRecordsLedger[exitFeePoolAddress] of
      | Some(_val) -> _val
      | None -> map[]
  end;

  // check if exit fee pool address exist in stake balance ledger
  var exitFeePoolBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[exitFeePoolAddress] of
      | Some(_val) -> _val
      | None -> failwith("Exit Fee Pool Balance not found in stake balance ledger.")
  end;

  // check if user address exists in stake record ledger - i.e. user must have staked at least one time to be eligible for exit fee rewards 
  var userRecordInStakeRecordLedger : map(nat, stakeRecordType) := case s.userStakeRecordsLedger[userAddress] of
      | Some(_val) -> _val
      | None -> failwith("User record not found stake record ledger.")
  end;

  // check if user address exists in stake balance ledger - i.e. user must have staked at least one time to be eligible for exit fee rewards
  var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[userAddress] of
      | Some(_val) -> _val
      | None -> failwith("User staked balance not found in stake balance ledger.")
  end;

  // check that there is enough MVK balance in the exit fee pool
  if exitFeePoolBalanceInStakeBalanceLedger < exitFeeReward then failwith("Error. Not enough staked MVK in exit fee pool.")
    else skip;
  
  // reduce exit fee pool by exit fee reward to be distributed
  var exitFeePoolBalanceInStakeBalanceLedger : nat := abs(exitFeePoolBalanceInStakeBalanceLedger - exitFeeReward); 
  s.userStakeBalanceLedger[exitFeePoolAddress] := exitFeePoolBalanceInStakeBalanceLedger;

  // check last index of records in exitFeePoolRecordInStakeRecordLedger
  if size(exitFeePoolRecordInStakeRecordLedger) = 0n then s.userStakeRecordsLedger[exitFeePoolAddress] := exitFeePoolRecordInStakeRecordLedger
    else skip;

  const exitFeePoollastRecordIndex : nat = size(exitFeePoolRecordInStakeRecordLedger);

  // add new exit fee distributed record for exit fee pool record
  var newExitFeePoolDistributedRewardRecord : stakeRecordType := case exitFeePoolRecordInStakeRecordLedger[exitFeePoollastRecordIndex] of
      Some(_val) -> _val
      | None -> record [
          amount           = exitFeeReward;
          time             = Tezos.now;  
          exitFee          = 0n;     
          mvkLoyaltyIndex  = 0n; 
          mvkTotalSupply   = s.tempMvkTotalSupply;    // FYI: may not be completely accurate
          vMvkTotalSupply  = s.stakedMvkTotalSupply;  
          opType           = "exitFeeDistributed";    
      ]
   end;
   exitFeePoolRecordInStakeRecordLedger[exitFeePoollastRecordIndex] := newExitFeePoolDistributedRewardRecord;
   s.userStakeRecordsLedger[exitFeePoolAddress] := exitFeePoolRecordInStakeRecordLedger;

  // ---- do the opposite for user ----
  
  // increase user balance by exit fee reward to be distributed
  var userBalanceInStakeBalanceLedger : nat := userBalanceInStakeBalanceLedger + exitFeeReward; 
  s.userStakeBalanceLedger[userAddress] := userBalanceInStakeBalanceLedger;

  // check last index of records in userRecordInStakeRecordLedger 
  if size(userRecordInStakeRecordLedger) = 0n then s.userStakeRecordsLedger[exitFeePoolAddress] := exitFeePoolRecordInStakeRecordLedger
    else skip;
  
  const userlastRecordIndex : nat = size(userRecordInStakeRecordLedger);

  // add new exit fee reward record for user record
  var newUserExitFeeRewardRecord : stakeRecordType := case userRecordInStakeRecordLedger[userlastRecordIndex] of
      Some(_val) -> _val
      | None -> record [
          amount           = exitFeeReward;
          time             = Tezos.now;  
          exitFee          = 0n;     
          mvkLoyaltyIndex  = 0n; 
          mvkTotalSupply   = s.tempMvkTotalSupply;    // FYI: may not be completely accurate
          vMvkTotalSupply  = s.stakedMvkTotalSupply;  
          opType           = "exitFeeReward";    
      ]
   end;
   userRecordInStakeRecordLedger[userlastRecordIndex] := newUserExitFeeRewardRecord;
   s.userStakeRecordsLedger[userAddress] := userRecordInStakeRecordLedger;

  // const mvkTokenAddress : address = case s.generalContracts["mvkToken"] of
  //     Some(_address) -> _address
  //     | None -> failwith("Error. MVK Token Contract is not found.")
  // end;

  // const delegationAddress : address = case s.generalContracts["delegation"] of
  //     Some(_address) -> _address
  //     | None -> failwith("Error. Delegation Contract is not found.")
  // end;

   // update user's MVK balance
  // const updateUserMvkBalanceOperation : operation = Tezos.transaction(
  //     (userAddress, exitFeeReward, (StakeAction: stakeType)),
  //     0tez,
  //     updateUserBalanceInMvkContract(mvkTokenAddress)
  //   );


  // update satellite balance if user is delegated to a satellite
  // const updateSatelliteBalanceOperation : operation = Tezos.transaction(
  //     (userAddress, exitFeeReward, 1n),
  //     0tez,
  //     updateSatelliteBalance(delegationAddress)
  //   );

  // create list of operations
  // const operations : list(operation) = list [updateUserMvkBalanceOperation; updateSatelliteBalanceOperation];
  // const operations : list(operation) = list [updateSatelliteBalanceOperation];

} with (noOperations, s)

(* Main entrypoint *)
function main (const action : stakeAction; const s : storage) : return is
  case action of
  | SetAdmin(parameters) -> setAdmin(parameters, s)  
  | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
  | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)
  | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)

  | PauseAll(_parameters) -> pauseAll(s)
  | UnpauseAll(_parameters) -> unpauseAll(s)
  | TogglePauseStake(_parameters) -> togglePauseStake(s)
  | TogglePauseUnstake(_parameters) -> togglePauseUnstake(s)

  | GetStakedBalance(params) -> getStakedBalance(params.0, params.1, s)
  | GetSatelliteBalance(params) -> getSatelliteBalance(params.0, params.1, params.2, params.3, params.4, params.5, s)
  
  | Stake(parameters) -> stake(parameters, s)  
  | Unstake(parameters) -> unstake(parameters, s)  
  | UnstakeComplete(parameters) -> unstakeComplete(parameters, s)  
  | DistributeExitFeeReward(parameters) -> distributeExitFeeReward(parameters.0, parameters.1, s)
  
  end
