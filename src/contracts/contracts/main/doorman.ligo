type stakeRecordType is record [
    time              : timestamp;
    amount            : nat;    // MVK / vMvk in mu (10^6)
    exitFee           : nat;    // MVK / vMvk in mu (10^6)
    mvkLoyaltyIndex   : nat;    // audit log for MVK Loyalty Index at time of transaction
    mvkTotalSupply    : nat;    // audit log for MVK total supply at time of transaction
    vMvkTotalSupply   : nat;    // audit log for vMVK total supply at time of transaction
    opType            : string; // audit log for type of transaction (stake / unstake)
]
type userStakeRecordsType is big_map (address, map(nat, stakeRecordType))

type burnTokenType is (address * nat)
type mintTokenType is (address * nat)
type udpateSatelliteBalanceParams is (address * nat * nat)

type breakGlassConfigType is record [
    stakeIsPaused           : bool;
    unstakeIsPaused         : bool;
]

type storage is record [
    admin                 : address;
    breakGlassConfig      : breakGlassConfigType;
    mvkTokenAddress       : address; 
    vMvkTokenAddress      : address;
    delegationAddress     : address;
    userStakeLedger       : userStakeRecordsType; 
    tempMvkTotalSupply    : nat;    
    tempVMvkTotalSupply   : nat;  
    logExitFee            : nat; // to be removed after testing
    logFinalAmount        : nat; // to be removed after testing
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

type stakeAction is 
    | Stake of (nat)
    | Unstake of (nat)
    | UnstakeComplete of (nat)
    | SetAdmin of (address)
    | TogglePauseStake of (unit)
    | TogglePauseUnstake of (unit)
    | SetMvkTokenAddress of (address)
    | SetVMvkTokenAddress of (address)
    | SetDelegationAddress of (address)
    | SetTempMvkTotalSupply of (nat)
    | SetTempVMvkTotalSupply of (nat)

(* ---- Helper functions begin ---- *)

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsMvkTokenContract(var s : storage) : unit is
    if (Tezos.sender = s.mvkTokenAddress) then unit
    else failwith("Only the MVK Token Contract can call this entrypoint.");

function checkSenderIsVMvkTokenContract(var s : storage) : unit is
    if (Tezos.sender = s.vMvkTokenAddress) then unit
    else failwith("Only the vMVK Token Contract can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");
// admin helper functions end ---------------------------------------------------------


// helper function to get token total supply (works for either MVK and vMVK)
function getTokenTotalSupply(const tokenAddress : address) : contract(contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalSupply",
      tokenAddress) : option(contract(contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalSupply entrypoint in Token Contract not found") : contract(contract(nat)))
  end;

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

// helper function to update satellite's balance
function updateSatelliteBalance(const delegationAddress : address) : contract(udpateSatelliteBalanceParams) is
  case (Tezos.get_entrypoint_opt(
      "%onStakeChange",
      delegationAddress) : option(contract(udpateSatelliteBalanceParams))) of
    Some(contr) -> contr
  | None -> (failwith("onStakeChange entrypoint in Token Contract not found") : contract(udpateSatelliteBalanceParams))
  end;

(* ---- Helper functions end ---- *)


// break glass toggle entrypoints begin ---------------------------------------------------------

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
function setAdmin(const parameters : address; var s : storage) : return is
block {

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that sender is admin
    checkSenderIsAdmin(s);

    s.admin := parameters;

} with (noOperations, s)

(* set mvk contract address *)
function setMvkTokenAddress(const parameters : address; var s : storage) : return is
block {

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that sender is admin
    checkSenderIsAdmin(s);

    s.mvkTokenAddress := parameters;
} with (noOperations, s)

(* set mvk contract address *)
function setDelegationAddress(const parameters : address; var s : storage) : return is
block {

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that sender is admin
    checkSenderIsAdmin(s);

    s.delegationAddress := parameters;
} with (noOperations, s)

(* set vMvk contract address *)
function setVMvkTokenAddress(const parameters : address; var s : storage) : return is
block {

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that sender is admin
    checkSenderIsAdmin(s);

    s.vMvkTokenAddress := parameters;
} with (noOperations, s)


function stake(const stakeAmount : nat; var s : storage) : return is
block {

  // Steps Overview
  // 1. verify that user is staking more than 1 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez - set min to 1
  // 2. mint + burn method in mvkToken.ligo and vmvkToken.ligo - then Temple wallet reflects the ledger amounts of MVK and vMVK - burn/mint operations are reflected
  // 3. update record of user staking
  // ----------------------------------------

  // entrypoint should not receive any tez amount
  checkNoAmount(Unit);

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

  const updateSatelliteBalanceOperation : operation = Tezos.transaction(
    (Tezos.sender, stakeAmount, 1n),
    0tez,
    updateSatelliteBalance(s.delegationAddress)
  );

  // list of operations: burn mvk tokens first, then mint vmvk tokens
  const operations : list(operation) = list [burnMvkTokensOperation; mintVMvkTokensOperation; updateSatelliteBalanceOperation];

  // 3. update record of user address with minted vMVK tokens

  // check if user wallet address exists in stake ledger -> can also be taken as the number of user stake records
  var userRecordInStakeLedger : map(nat, stakeRecordType) := case s.userStakeLedger[Tezos.sender] of
      Some(_val) -> _val
      | None -> map[]
  end;

  // if user wallet address does not exist in stake ledger, add user to the stake ledger
  if size(userRecordInStakeLedger) = 0n then s.userStakeLedger[Tezos.sender] := userRecordInStakeLedger
    else skip;

  const lastRecordIndex : nat = size(userRecordInStakeLedger);

  var newStakeRecord : stakeRecordType := case userRecordInStakeLedger[lastRecordIndex] of
      Some(_val) -> _val
      | None -> record[
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
   s.userStakeLedger[Tezos.sender] := userRecordInStakeLedger;
 
} with (operations, s)


function unstake(const unstakeAmount : nat; var s : storage) : return is
block {
  // Steps Overview
  // 1. verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  // 2. intercontract invocation -> update total supply for MVK and vMVK
  // 3. unstakeComplete -> calculate exit fee, mint and burn method in vmvkToken.ligo and mvkToken.ligo respectively
  
  // to be done in future
  // 4. calculate distribution of exit fee as rewards to vMVK holders
  // 5. transfer / save record of exit fee rewards for each vMVK holder - unless exit fee rewards are calculated in a different way 
  // ----------------------------------------

  // verify that user is unstaking more than 0 vMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  if unstakeAmount = 0n then failwith("You have to stake more than 0 MVK tokens.")
    else skip;

  // update temp MVK total supply
  const setTempMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setTempMvkTotalSupply");    
  const updateMvkTotalSupplyProxyOperation : operation = Tezos.transaction(setTempMvkTotalSupplyCallback,0tez, getTokenTotalSupply(s.mvkTokenAddress));

  // const updateMvkTotalSupplyProxyOperation : operation = Tezos.transaction(unit, 0tez, updateMvkTotalSupplyForDoorman(s.mvkTokenAddress));
  const updateVMvkTotalSupplyProxyOperation : operation = Tezos.transaction(unstakeAmount, 0tez, updateVMvkTotalSupplyForDoorman(s.vMvkTokenAddress));

  // list of operations: get MVK total supply first, then get vMVK total supply (which will trigger unstake complete)
  const operations : list(operation) = list [updateMvkTotalSupplyProxyOperation; updateVMvkTotalSupplyProxyOperation];
  
} with (operations, s)


function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    // check that the call is coming from MVK Token Contract
    checkSenderIsMvkTokenContract(s);
    s.tempMvkTotalSupply := totalSupply;
} with (noOperations, s);


function setTempVMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    // check that the call is coming from vMVK Token Contract
    checkSenderIsVMvkTokenContract(s);
    s.tempVMvkTotalSupply := totalSupply;
} with (noOperations, s);


function unstakeComplete(const unstakeAmount: nat; var s : storage) is 
block {

    (* Check this call is coming from the vMvk Token contract *)
    checkSenderIsVMvkTokenContract(s);
    
    const scaleFactor : nat = 1000000n;                // mu (10^6) - can be adjusted for greater accuracy by increasing the value
    const percentageFactor : nat = scaleFactor / 100n; // with mu, percentageFactor returns 10000n
    const mvkLoyaltyIndex : nat = (s.tempVMvkTotalSupply * scaleFactor * 100n / (s.tempVMvkTotalSupply + s.tempMvkTotalSupply)); 
    const exitFee : nat = (500n * scaleFactor * 100n ) / (mvkLoyaltyIndex + (5n * scaleFactor)); 
  
    if exitFee > abs(percentageFactor - 1n) then // exitFee cannot be more than 9999n (with scaleFactor of 10^6)
      failwith("Exit fee calculation error.")
    else skip;

    const finalAmountPercent : nat = abs(percentageFactor - exitFee); // i.e. 100% - 5% -> 10000 - 500 with fixed point arithmetic
    const finalAmount : nat = unstakeAmount * finalAmountPercent;
    const finalAmount : nat = finalAmount / percentageFactor;

    // temp to check correct amount of exit fee and final amount in console truffle tests
    s.logExitFee := exitFee;
    s.logFinalAmount := finalAmount;
    // todo: split remainder of exitFee to be distributed as rewards
  
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

    const updateSatelliteBalanceOperation : operation = Tezos.transaction(
        (Tezos.source, unstakeAmount, 0n),
        0tez,
        updateSatelliteBalance(s.delegationAddress)
      );

    // list of operations: burn vmvk tokens first, then mint mvk tokens
    const operations : list(operation) = list [burnVMvkTokensOperation; mintMvkTokensOperation; updateSatelliteBalanceOperation];

    // if user wallet address does not exist in stake ledger, add user to the stake ledger
    var userRecordInStakeLedger : map(nat, stakeRecordType) := case s.userStakeLedger[Tezos.source] of
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
            vMvkTotalSupply  = s.tempVMvkTotalSupply;          
            opType           = "unstake";  
        ]
    end;

   userRecordInStakeLedger[lastRecordIndex] := newStakeRecord;
   s.userStakeLedger[Tezos.source] := userRecordInStakeLedger;

    // to be done in future
    //----------------------------------
    // 4. calculate distribution of exit fee as rewards to vMVK holders
    // 5. transfer / save record of exit fee rewards for each vMVK holder

} with (operations, s)

(* Main entrypoint *)
function main (const action : stakeAction; const s : storage) : return is
  case action of
  | Stake(parameters) -> stake(parameters, s)  
  | Unstake(parameters) -> unstake(parameters, s)  
  | UnstakeComplete(parameters) -> unstakeComplete(parameters, s)  
  | SetAdmin(parameters) -> setAdmin(parameters, s)  
  | TogglePauseStake(_parameters) -> togglePauseStake(s)
  | TogglePauseUnstake(_parameters) -> togglePauseUnstake(s)
  | SetMvkTokenAddress(parameters) -> setMvkTokenAddress(parameters, s)  
  | SetVMvkTokenAddress(parameters) -> setVMvkTokenAddress(parameters, s)  
  | SetDelegationAddress(parameters) -> setDelegationAddress(parameters, s)  
  | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)
  | SetTempVMvkTotalSupply(parameters) -> setTempVMvkTotalSupply(parameters, s)
  end
