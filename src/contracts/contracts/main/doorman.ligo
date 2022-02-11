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
    opType            : string; // audit log for type of transaction (stake / unstake / exitFeeReward / exitFeeDistribution / farmClaim)
]
type userStakeRecordsType is big_map(address, map(nat, stakeRecordType))

type userStakeBalanceRecordType is record[
    balance: nat;
    participationFeesPerShare: nat;
]
type userStakeBalanceType is big_map(address, userStakeBalanceRecordType)

type burnTokenType is (address * nat)
type mintTokenType is (address * nat)
type updateSatelliteBalanceParams is (address * nat * nat)

type breakGlassConfigType is record [
    stakeIsPaused           : bool;
    unstakeIsPaused         : bool;
]

(* Fixed point accuracy *)
const fixedPointAccuracy: nat = 1_000_000_000_000n // 10^12

(* Transfer entrypoint inputs for FA2 *)
type transferDestination is [@layout:comb] record[
  to_: address;
  token_id: nat;
  amount: nat;
]
type transfer is [@layout:comb] record[
  from_: address;
  txs: list(transferDestination);
]
type transferType is list(transfer)

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

    accumulatedFeesPerShare : nat;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

type getSatelliteBalanceType is (address * string * string * string * nat * contract(string * string * string * nat * nat)) // name, description, image, satellite fee
type satelliteInfoType is (string * string * string * nat * nat) // name, description, image, satellite fee, vMVK balance

type farmClaimType is (address * nat)

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
    | Compound of (unit)

    | FarmClaim of (address * nat)

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

// break glass: checkIsNotPaused helper functions begin ---------------------------------------------------------
function checkStakeIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.stakeIsPaused then failwith("Stake entrypoint is paused.")
    else unit;

function checkUnstakeIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.unstakeIsPaused then failwith("Unstake entrypoint is paused.")
    else unit;

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

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mintTokenType))
  end;

// helper function to update satellite's balance
function updateSatelliteBalance(const delegationAddress : address) : contract(updateSatelliteBalanceParams) is
  case (Tezos.get_entrypoint_opt(
      "%onStakeChange",
      delegationAddress) : option(contract(updateSatelliteBalanceParams))) of
    Some(contr) -> contr
  | None -> (failwith("onStakeChange entrypoint in Satellite Contract not found") : contract(updateSatelliteBalanceParams))
  end;

// helper function to update satellite's balance
function updateUserBalanceInMvkContract(const tokenAddress : address) : contract(transferType) is
case (Tezos.get_entrypoint_opt(
    "%transfer",
    tokenAddress) : option(contract(transferType))) of
  Some(contr) -> contr
| None -> (failwith("transfer entrypoint in Token Contract not found") : contract(transferType))
end;

// helper function to get MVK total supply
function updateMvkTotalSupplyForDoorman(const tokenAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%updateMvkTotalSupplyForDoorman",
      tokenAddress) : option(contract(nat))) of
    Some(contr) -> contr
  | None -> (failwith("UpdateMvkTotalSupplyForDoorman entrypoint in MVK Token Contract not found") : contract(nat))
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
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(* View function that forwards the staked balance of source to a contract *)
function getStakedBalance (const userAddress : address; const contr : contract(nat); var s : storage) : return is
  block {
    var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[userAddress] of
          Some(_val) -> _val.balance
          | None -> 0n
      end;

  } with (list [transaction(userBalanceInStakeBalanceLedger, 0tz, contr)], s)

(* View function that forwards the balance of satellite with satellite creation params to the delegation contract *)
function getSatelliteBalance (const userAddress : address; const name : string; const description : string; const image : string; const satelliteFee : nat; const contr : contract(satelliteInfoType); var s : storage) : return is
  block {
    checkSenderIsDelegationContract(s);
    var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[userAddress] of
          Some(_val) -> _val.balance
          | None -> 0n
      end;
  } with (list [transaction((name, description, image, satelliteFee, userBalanceInStakeBalanceLedger), 0tz, contr)], s)

function compoundUserRewards(var s: storage): (option(operation) * storage) is 
  block{    
    // Get User
    const user: address = Tezos.source;

    // Get the user's record, failed if it does not exists
    var userRecord: userStakeBalanceRecordType := case s.userStakeBalanceLedger[user] of
      Some(_val) -> _val
      | None -> record[
        balance=0n;
        participationFeesPerShare=s.accumulatedFeesPerShare;
      ]
    end;

    var operation: option(operation) := None ;

    // Check if the user has more than 0MVK staked. If he/she hasn't, he cannot earn rewards
    if userRecord.balance > 0n then {
      // Calculate what fees the user missed since his/her last claim
      const currentFeesPerShare: nat = abs(s.accumulatedFeesPerShare - userRecord.participationFeesPerShare);
      // Calculate the user reward based on his sMVK
      const userRewards: nat = (currentFeesPerShare * userRecord.balance) / fixedPointAccuracy;
      // Increase the user balance
      userRecord.balance := userRecord.balance + userRewards;

      // Find delegation address
      const delegationAddress : address = case s.generalContracts["delegation"] of
          Some(_address) -> _address
          | None -> failwith("Error. Delegation Contract is not found.")
      end;

      // update satellite balance if user is delegated to a satellite
      operation := Some (
        Tezos.transaction(
          (Tezos.source, userRewards, 1n),
          0tez,
          updateSatelliteBalance(delegationAddress)
        )
      );

    }
    else skip;

    // Set the user's participationFeesPerShare 
    userRecord.participationFeesPerShare := s.accumulatedFeesPerShare;

    // Update the storage
    s.userStakeBalanceLedger := Big_map.update(user, Some (userRecord), s.userStakeBalanceLedger);
  } with (operation, s)

function compound(var s: storage): return is
  block{
    const userCompound: (option(operation) * storage) = compoundUserRewards(s);
    s := userCompound.1;
    const operations: list(operation) = 
      case userCompound.0 of
        Some (o) -> list[o]
      | None -> noOperations
      end;

  } with (operations, s)

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

  // break glass check
  checkStakeIsNotPaused(s);

  // Compound user rewards
  const userCompound: (option(operation) * storage) = compoundUserRewards(s);
  s := userCompound.1;

  // 1. verify that user is staking more than 0 MVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez 
  if stakeAmount < 100_000n then failwith("You have to stake more than 0 MVK tokens.")
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
  const transferParameters: transferType = list[
    record[
      from_=Tezos.sender;
      txs=list[
        record[
          to_=Tezos.self_address;
          token_id=0n;
          amount=stakeAmount;
        ]
      ]
    ]
  ];
  const transferOperation: operation = Tezos.transaction(
    transferParameters,
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
  const operations : list(operation) = 
    case userCompound.0 of
      Some (o) -> list [updateSatelliteBalanceOperation; transferOperation; o]
    | None -> list [updateSatelliteBalanceOperation; transferOperation]
    end;
  // 3. update record of user address with minted vMVK tokens

  // update user's staked balance in staked balance ledger
  var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[Tezos.sender] of
      Some(_val) -> _val
      | None -> record[
        balance=0n;
        participationFeesPerShare=s.accumulatedFeesPerShare;
      ]
  end;
  userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + stakeAmount; 
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

  // break glass check
  checkStakeIsNotPaused(s);

  // Compound user rewards
  const userCompound: (option(operation) * storage) = compoundUserRewards(s);
  s := userCompound.1;

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
  const operations : list(operation) = 
    case userCompound.0 of
      Some (o) -> list [updateMvkTotalSupplyProxyOperation; o]
    | None -> list [updateMvkTotalSupplyProxyOperation]
    end
} with (operations, s)

function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    // check that the call is coming from MVK Token Contract
    checkSenderIsMvkTokenContract(s);
    s.tempMvkTotalSupply := totalSupply;
} with (noOperations, s);

function unstakeComplete(const unstakeAmount: nat; var s : storage): return is
block {

    checkSenderIsMvkTokenContract(s);
  
    // note on MLI:
    // sMVK total supply is a part of MVK total supply since token aren't burned anymore.
    const mvkLoyaltyIndex: nat = (s.stakedMvkTotalSupply * 100n * fixedPointAccuracy) / s.tempMvkTotalSupply;
    
    // Fee calculation
    const exitFee: nat = (500n * fixedPointAccuracy * fixedPointAccuracy) / (mvkLoyaltyIndex + (5n * fixedPointAccuracy));

    //const finalAmountPercent: nat = abs(percentageFactor - exitFee); // i.e. 100% - 5% -> 10000 - 500 with fixed point arithmetic
    const paidFee: nat = unstakeAmount * (exitFee / 100n);
    const finalUnstakeAmount: nat = abs(unstakeAmount - (paidFee / fixedPointAccuracy));

    // Updated shares by users
    const stakedTotalWithoutUnstake: nat = abs(s.stakedMvkTotalSupply - unstakeAmount);
    if stakedTotalWithoutUnstake > 0n then s.accumulatedFeesPerShare := s.accumulatedFeesPerShare + (paidFee / stakedTotalWithoutUnstake)
    else skip;

    // temp to check correct amount of exit fee and final amount in console truffle tests
    s.logExitFee := exitFee;
    s.logFinalAmount := finalUnstakeAmount;
    // todo: split remainder of exitFee to be distributed as rewards

    // update user's staked balance in staked balance ledger
    var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[Tezos.source] of
        Some(_val) -> _val
        | None -> failwith("User staked balance not found in staked balance ledger.")
    end;
    
    // check if user has enough staked mvk to withdraw
    if unstakeAmount > userBalanceInStakeBalanceLedger.balance then failwith("Error. Not enough balance.")
    else skip;

    // update staked MVK total supply
    if s.stakedMvkTotalSupply < finalUnstakeAmount then failwith("Error. You cannot unstake more than what is in the staked MVK Total supply")
      else skip;
    s.stakedMvkTotalSupply := abs(s.stakedMvkTotalSupply - finalUnstakeAmount);

    userBalanceInStakeBalanceLedger.balance := abs(userBalanceInStakeBalanceLedger.balance - unstakeAmount); 
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
    const transferParameters: transferType = list[
      record[
        from_=Tezos.self_address;
        txs=list[
          record[
            to_=Tezos.source;
            token_id=0n;
            amount=finalUnstakeAmount;
          ]
        ]
      ]
    ];
    const transferOperation: operation = Tezos.transaction(
      transferParameters,
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
    const operations : list(operation) = list[transferOperation; updateSatelliteBalanceOperation];

    // if user wallet address does not exist in stake records ledger, add user to the stake records ledger
    var userRecordInStakeLedger : map(nat, stakeRecordType) := case s.userStakeRecordsLedger[Tezos.source] of
      Some(_val) -> _val
      | None -> map[]
    end;

    const lastRecordIndex : nat = size(userRecordInStakeLedger);

    const exitFeeRecord : nat = exitFee;
    var newStakeRecord : stakeRecordType := case userRecordInStakeLedger[lastRecordIndex] of         
        Some(_val) -> _val
        | None -> record[
            amount           = unstakeAmount; //TODO: Does it have to be the amount without fees or the amount with fees?
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

} with (operations, s);

(* Farm Claim entrypoint *)
function farmClaim(const farmClaim: farmClaimType; var s: storage): return is
  block{
    // Get values from parameter
    const delegator: address = farmClaim.0;
    const claimAmount: nat  = farmClaim.1;

    // Get farm address
    const farmAddress: address = Tezos.sender;

    // Check if farm address is known to the farmFactory
    const farmFactoryAddress: address = case Map.find_opt("farmFactory", s.generalContracts) of
        Some(_address) -> _address
        | None -> failwith("Error. Farm Factory Contract is not found.")
    end;
    const farmFactoryContract: contract(address) = 
      case (Tezos.get_entrypoint_opt("%checkFarm", farmFactoryAddress) : option(contract(address))) of
        Some(contr) -> contr
      | None -> (failwith("CheckFarm entrypoint in Farm Factory Contract not found") : contract(address))
      end;
    const checkFarmOperation: operation = Tezos.transaction(farmAddress, 0tez, farmFactoryContract);

    // Update the delegation balance
    const delegationAddress : address = case s.generalContracts["delegation"] of
        Some(_address) -> _address
        | None -> failwith("Error. Delegation Contract is not found.")
    end;
    const updateSatelliteBalanceOperation : operation = Tezos.transaction(
      (delegator, claimAmount, 1n),
      0tez,
      updateSatelliteBalance(delegationAddress)
    );

    // Mint new MVK for the doorman contract: TODO --> Check for minting limit
    const mvkTokenAddress: address = case Map.find_opt("mvkToken", s.generalContracts) of
        Some(_address) -> _address
        | None -> failwith("Error. MVK Token Contract is not found.")
    end;
    const mintOperation: operation = Tezos.transaction((Tezos.self_address, claimAmount), 0tez, getMintEntrypointFromTokenAddress(mvkTokenAddress));

    // List of operation, first check the farm exists, then update the Satellite balance
    const operations: list(operation) = list[checkFarmOperation;updateSatelliteBalanceOperation;mintOperation];

    // update user's staked balance in staked balance ledger
    var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := 
      case s.userStakeBalanceLedger[delegator] of
        Some (_val) -> _val
      | None -> record[
          balance=0n;
          participationFeesPerShare=s.accumulatedFeesPerShare;
        ]
      end;
    userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + claimAmount; 
    s.userStakeBalanceLedger[delegator] := userBalanceInStakeBalanceLedger;

    // update staked MVK total supply
    s.stakedMvkTotalSupply := s.stakedMvkTotalSupply + claimAmount;

    // check if user wallet address exists in stake ledger -> can also be taken as the number of user stake records
    var userRecordInStakeLedger : map(nat, stakeRecordType) := case s.userStakeRecordsLedger[delegator] of
        Some(_val) -> _val
        | None -> map[]
    end;

    // if user wallet address does not exist in stake ledger, add user to the stake ledger
    if size(userRecordInStakeLedger) = 0n then s.userStakeRecordsLedger[delegator] := userRecordInStakeLedger
      else skip;

    const lastRecordIndex : nat = size(userRecordInStakeLedger);

    var newStakeRecord : stakeRecordType := case userRecordInStakeLedger[lastRecordIndex] of
        Some(_val) -> _val
        | None -> record [
            amount           = claimAmount;
            time             = Tezos.now;  
            exitFee          = 0n;     
            mvkLoyaltyIndex  = 0n; 
            mvkTotalSupply   = 0n;  // FYI: will not be accurate - set to 0 / null / placeholder?    
            vMvkTotalSupply  = 0n;  // FYI: will not be accurate - set to 0 / null / placeholder?    
            opType           = "farmClaim";    
        ]
    end;

    userRecordInStakeLedger[lastRecordIndex] := newStakeRecord;
    s.userStakeRecordsLedger[delegator] := userRecordInStakeLedger;
  } with(operations, s)

(* Main entrypoint *)
function main (const action : stakeAction; const s : storage) : return is
  block {
    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);
  } with(
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
    | Compound(_parameters) -> compound(s)

    | FarmClaim(parameters) -> farmClaim(parameters, s)
    
    end
  )