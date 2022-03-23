// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type userStakeBalanceRecordType is record[
    balance                                : nat;
    participationFeesPerShare              : nat;
    // emergencyGovernanceLastVotedTimestamp  : timestamp;
]
type userStakeBalanceLedgerType is big_map(address, userStakeBalanceRecordType)

type mintTokenType is (address * nat)
type updateSatelliteBalanceParams is (address * nat * nat)

type breakGlassConfigType is record [
    stakeIsPaused           : bool;
    unstakeIsPaused         : bool;
    compoundIsPaused        : bool;
]

const fixedPointAccuracy: nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36

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
  admin                     : address;
  mvkTokenAddress           : address;
  
  minMvkAmount              : nat;
  
  whitelistContracts        : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
  generalContracts          : generalContractsType;
  
  breakGlassConfig          : breakGlassConfigType;
  
  userStakeBalanceLedger    : userStakeBalanceLedgerType;  // user staked balance ledger
  
  tempUnstakeAmount         : option(nat); // temporary unstake amount for a user who wants to unstake
  tempClaimForceTransfer    : option(bool); // temporary claim forceTransfer for a user who wants to claim from a farm
  tempClaimDelegator        : option(address); // temporary claim delegator for a user who wants to claim from a farm
  tempClaimAmount           : option(nat); // temporary claim amount for a user who wants to claim from a farm

  stakedMvkTotalSupply      : nat; // current total staked MVK
  unclaimedRewards          : nat; // current exit fee pool rewards

  logExitFee                : nat; // to be removed after testing
  logFinalAmount            : nat; // to be removed after testing

  accumulatedFeesPerShare   : nat;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

type getSatelliteBalanceType is (address * string * string * string * nat * contract(string * string * string * nat * nat)) // name, description, image, satellite fee
type satelliteInfoType is (string * string * string * nat * nat) // name, description, image, satellite fee, sMVK balance

type farmClaimType is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

type stakeType is 
  StakeAction of unit
| UnstakeAction of unit

type getTotalStakedSupplyParamsType is contract(nat)

type doormanAction is 
    SetAdmin of (address)
  | UpdateMinMvkAmount of (nat)
  
  | UpdateWhitelistContracts of updateWhitelistContractsParams
  | UpdateGeneralContracts of updateGeneralContractsParams

  | PauseAll of (unit)
  | UnpauseAll of (unit)
  | TogglePauseStake of (unit)
  | TogglePauseUnstake of (unit)
  | TogglePauseCompound of (unit)

  | GetTotalStakedSupply of getTotalStakedSupplyParamsType
  | GetStakedBalance of (address * contract(nat))
  | GetSatelliteBalance of getSatelliteBalanceType
  // | EmergencyGovernanceVoteCheck of emergencyGovernanceVoteCheckType

  | Stake of (nat)
  | Unstake of (nat)
  | UnstakeComplete of (nat)
  | Compound of (unit)

  | FarmClaim of farmClaimType
  | FarmClaimComplete of (nat * nat)

(* ---- Helper functions begin ---- *)

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
  if (Tezos.sender = s.admin) then unit
    else failwith("Error. Only the administrator can call this entrypoint.");

function checkSenderIsMvkTokenContract(var s : storage) : unit is
block{
  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
    else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
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

function checkCompoundIsNotPaused(var s : storage) : unit is
  if s.breakGlassConfig.compoundIsPaused then failwith("Compound entrypoint is paused.")
    else unit;

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// admin helper functions end ---------------------------------------------------------

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

// helper function to get transfer entrypoint
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(transferType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      tokenAddress) : option(contract(transferType))) of
    Some(contr) -> contr
  | None -> (failwith("transfer entrypoint in Token Contract not found") : contract(transferType))
  end;

// helper function to get MVK total supply
function getMvkTotalSupplyEntrypoint(const s: storage) : contract(contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalSupply",
      s.mvkTokenAddress) : option(contract(contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalSupply entrypoint in MVK Token Contract not found") : contract(contract(nat)))
  end;

// helper function to get MVK supplies
function getMvkSuppliesEntrypoint(const s: storage) : contract(contract(nat * nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalAndMaximumSupply",
      s.mvkTokenAddress) : option(contract(contract(nat * nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalAndMaximumSupply entrypoint in MVK Token Contract not found") : contract(contract(nat * nat)))
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

    if s.breakGlassConfig.compoundIsPaused then skip
      else s.breakGlassConfig.compoundIsPaused := True;

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
    
    if s.breakGlassConfig.compoundIsPaused then s.breakGlassConfig.compoundIsPaused := False
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

function togglePauseCompound(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.compoundIsPaused then s.breakGlassConfig.compoundIsPaused := False
      else s.breakGlassConfig.compoundIsPaused := True;

} with (noOperations, s)

// break glass toggle entrypoints end ---------------------------------------------------------


(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(*  get total staked supply *)
function getTotalStakedSupply(const getTotalStakedSupplyParams: getTotalStakedSupplyParamsType; const s : storage) : return is
  (list[Tezos.transaction(s.stakedMvkTotalSupply, 0tez, getTotalStakedSupplyParams)], s)

(*  update configuration in the storage *)
function updateMinMvkAmount(const newMinMvkAmount : nat; var s : storage) : return is 
block {
  // check that sender is admin (i.e. Governance DAO contract address)
  checkSenderIsAdmin(s);

  if newMinMvkAmount < 1_000_000_000n then failwith("Error. The minimum amount of MVK to stake should be equal to 1.") 
    else skip;

  s.minMvkAmount := newMinMvkAmount;

} with (noOperations, s)

(* View function that forwards the staked balance of source to a contract *)
function getStakedBalance (const userAddress : address; const contr : contract(nat); var s : storage) : return is
  block {
    var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[userAddress] of
      Some (_val) -> _val.balance
    | None -> 0n
    end;

  } with (list [transaction(userBalanceInStakeBalanceLedger, 0tz, contr)], s)

(* View function that forwards the balance of satellite with satellite creation params to the delegation contract *)
function getSatelliteBalance (const userAddress : address; const name : string; const description : string; const image : string; const satelliteFee : nat; const contr : contract(satelliteInfoType); var s : storage) : return is
  block {
    checkSenderIsDelegationContract(s);
    var userBalanceInStakeBalanceLedger : nat := case s.userStakeBalanceLedger[userAddress] of
      Some (_val) -> _val.balance
    | None -> 0n
    end;
  } with (list [transaction((name, description, image, satelliteFee, userBalanceInStakeBalanceLedger), 0tz, contr)], s)

function compoundUserRewards(var s: storage): (option(operation) * storage) is 
  block{
    // Get User
    const user: address = Tezos.source;

    // Get the user's record, failed if it does not exists
    var userRecord: userStakeBalanceRecordType := case s.userStakeBalanceLedger[user] of
      Some (_val) -> _val
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
      s.unclaimedRewards := abs(s.unclaimedRewards - userRewards);

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
    // Check if compound is paused
    checkCompoundIsNotPaused(s);

    // Compound rewards
    const userCompound: (option(operation) * storage) = compoundUserRewards(s);
    s := userCompound.1;
    const operations: list(operation) = case userCompound.0 of
      Some (compoundOperation) -> list[compoundOperation]
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
  // 2. mint + burn method in mvkToken.ligo and smvkToken.ligo - then Temple wallet reflects the ledger amounts of MVK and sMVK - burn/mint operations are reflected
  // 3. update record of user staking
  // ----------------------------------------

  // break glass check
  checkStakeIsNotPaused(s);

  // Compound user rewards
  const userCompound: (option(operation) * storage) = compoundUserRewards(s);
  s := userCompound.1;

  // 1. verify that user is staking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
  if stakeAmount < s.minMvkAmount then failwith("You have to stake at least 1 MVK token.")
    else skip;

  const mvkTokenAddress : address = s.mvkTokenAddress;

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
    getTransferEntrypointFromTokenAddress(mvkTokenAddress)
  );

  const updateSatelliteBalanceOperation : operation = Tezos.transaction(
    (Tezos.sender, stakeAmount, 1n),
    0tez,
    updateSatelliteBalance(delegationAddress)
  );

  // list of operations: burn mvk tokens first, then mint smvk tokens
  // const operations : list(operation) = list [burnMvkTokensOperation; mintSMvkTokensOperation; updateSatelliteBalanceOperation];
  const operations : list(operation) = case userCompound.0 of
    Some (o) -> list [updateSatelliteBalanceOperation; transferOperation; o]
  | None -> list [updateSatelliteBalanceOperation; transferOperation]
  end;
  // 3. update record of user address with minted sMVK tokens

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
 
} with (operations, s)


function unstake(const unstakeAmount : nat; var s : storage) : return is
block {
  // Steps Overview
  // 1. verify that user is unstaking more than 0 sMVK tokens - note: amount should be converted (on frontend) to 10^6 similar to mutez
  // 2. fetch and update total MVK supply by getting balance in MVK token coontract
  // 3. complete unstake in callback operation after total MVK supply has been set
  // 4. calculate exit fee and verify that user has a record in stake balance ledger, and has enough balance to unstake
  // 5. update user's staked balance in staked balance ledger
  // 6. add a new unstake record to user's stake records ledger 
  // 7. send an operation to update Satellite's total delegated amount (there are checks for the user user in the delegation contract)
  // 8. increase staked MVK in exit fee reward pool - update exit fee staked balance in stake balance ledger 

  // old steps - no more mint + burn used
  // 2. intercontract invocation -> update total supply for MVK and sMVK
  // 3. unstakeComplete -> calculate exit fee, mint and burn method in smvkToken.ligo and mvkToken.ligo respectively
  
  // to be done in future
  // 4. calculate distribution of exit fee as rewards to sMVK holders
  // 5. transfer / save record of exit fee rewards for each sMVK holder - unless exit fee rewards are calculated in a different way 
  // ----------------------------------------

  // break glass check
  checkUnstakeIsNotPaused(s);

  // 1. verify that user is unstaking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
  if unstakeAmount < s.minMvkAmount then failwith("You have to unstake at least 1 MVK token.")
    else skip;

  // Compound user rewards
  const userCompound: (option(operation) * storage) = compoundUserRewards(s);
  s := userCompound.1;

  // Store the unstake amount in the storage as a temp var
  s.tempUnstakeAmount := Some (unstakeAmount);

  // update temp MVK total supply and MVK maximum supply
  const unstakeCompleteEntrypoint: contract(nat) = case (Tezos.get_entrypoint_opt("%unstakeComplete", Tezos.self_address) : option(contract(nat))) of
    Some(contr) -> contr
  | None -> (failwith("Unstake complete entrypoint not found"): contract(nat))
  end;
  const unstakeCompleteOperation : operation = Tezos.transaction(unstakeCompleteEntrypoint, 0tez, getMvkTotalSupplyEntrypoint(s));

  // list of operations: get MVK total supply first, then get vMVK total supply (which will trigger unstake complete)
  const operations : list(operation) = case userCompound.0 of
    Some (compound) -> list [compound; unstakeCompleteOperation]
  | None -> list [unstakeCompleteOperation]
  end
} with (operations, s)

function unstakeComplete(const mvkTotalSupply: nat; var s : storage): return is
block {
    checkSenderIsMvkTokenContract(s);

    // Get unstake amount from the storage and reset it
    const unstakeAmount: nat  = case s.tempUnstakeAmount of
      Some (value) -> value
    | None -> failwith("Temp unstake amount invalid")
    end;
    s.tempUnstakeAmount := (None : option(nat));

    // sMVK total supply is a part of MVK total supply since token aren't burned anymore.
    const mvkLoyaltyIndex: nat = (s.stakedMvkTotalSupply * 100n * fixedPointAccuracy) / mvkTotalSupply;
    
    // Fee calculation
    const exitFee: nat = (500n * fixedPointAccuracy * fixedPointAccuracy) / (mvkLoyaltyIndex + (5n * fixedPointAccuracy));

    //const finalAmountPercent: nat = abs(percentageFactor - exitFee);
    const paidFee: nat = unstakeAmount * (exitFee / 100n);
    const finalUnstakeAmount: nat = abs(unstakeAmount - (paidFee / fixedPointAccuracy));
    s.unclaimedRewards := s.unclaimedRewards + (paidFee / fixedPointAccuracy);

    // Updated shares by users
    if unstakeAmount > s.stakedMvkTotalSupply then failwith("Error. You cannot unstake more than what is in the staked MVK Total supply") 
      else skip;
    const stakedTotalWithoutUnstake: nat = abs(s.stakedMvkTotalSupply - unstakeAmount);
    
    if stakedTotalWithoutUnstake > 0n then s.accumulatedFeesPerShare := s.accumulatedFeesPerShare + (paidFee / stakedTotalWithoutUnstake)
      else skip;

    // temp to check correct amount of exit fee and final amount in console truffle tests
    s.logExitFee := exitFee;
    s.logFinalAmount := finalUnstakeAmount;

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

    const mvkTokenAddress : address = s.mvkTokenAddress;

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
      getTransferEntrypointFromTokenAddress(mvkTokenAddress)
    );

    // update satellite balance if user is delegated to a satellite
    const updateSatelliteBalanceOperation : operation = Tezos.transaction(
      (Tezos.source, unstakeAmount, 0n),
      0tez,
      updateSatelliteBalance(delegationAddress)
    );

    // Compound with the user new rewards if he still have sMVK after unstaking
    const compoundAction: (option(operation) * storage) = compoundUserRewards(s);
    s := compoundAction.1;

    // create list of operations
    const operations : list(operation) = case compoundAction.0 of
      Some (compoundOperation) -> list[updateSatelliteBalanceOperation; transferOperation; compoundOperation]
    | None -> list[updateSatelliteBalanceOperation; transferOperation]
    end;

} with (operations, s);

(* Farm Claim entrypoint *)
function farmClaim(const farmClaim: farmClaimType; var s: storage): return is
  block{
    // Get values from parameter
    const delegator: address = farmClaim.0;
    const claimAmount: nat  = farmClaim.1;
    const forceTransfer: bool = farmClaim.2;

    // Store the variables in the storage as temp variables
    s.tempClaimAmount         := Some (claimAmount);
    s.tempClaimDelegator      := Some (delegator);
    s.tempClaimForceTransfer  := Some (forceTransfer);

    // Get farm address
    const farmAddress: address = Tezos.sender;

    // Check if farm address is known to the farmFactory
    const farmFactoryAddress: address = case Map.find_opt("farmFactory", s.generalContracts) of
        Some(_address) -> _address
        | None -> failwith("Error. Farm Factory Contract is not found.")
    end;
    const farmFactoryContract: contract(address) = 
      case (Tezos.get_entrypoint_opt("%checkFarmExists", farmFactoryAddress) : option(contract(address))) of
        Some(contr) -> contr
      | None -> (failwith("CheckFarmExists entrypoint in Farm Factory Contract not found") : contract(address))
      end;
    const checkFarmExistsOperation: operation = Tezos.transaction(farmAddress, 0tez, farmFactoryContract);

    // update temp MVK total supply and MVK maximum supply
    const farmClaimCompleteEntrypoint: contract(nat * nat) = case (Tezos.get_entrypoint_opt("%farmClaimComplete", Tezos.self_address) : option(contract(nat * nat))) of
      Some(contr) -> contr
    | None -> (failwith("Farm claim complete entrypoint not found"): contract(nat * nat))
    end;
    const farmClaimCompleteOperation : operation = Tezos.transaction(farmClaimCompleteEntrypoint, 0tez, getMvkSuppliesEntrypoint(s));

    // List of operation, first check the farm exists, then update the Satellite balance
    const operations: list(operation) = list[checkFarmExistsOperation; farmClaimCompleteOperation];

  } with(operations, s)

function farmClaimComplete(const mvkSuppliesParam: (nat * nat); var s: storage): return is
  block{
    checkSenderIsMvkTokenContract(s);

    // Get claim variables from the storage and reset them
    const recipientAddress: address = case s.tempClaimDelegator of
      Some (value) -> value
    | None -> failwith("Temp claim delegator invalid")
    end;
    s.tempClaimDelegator  := (None : option(address));
    var mintedTokens: nat := case s.tempClaimAmount of
      Some (value) -> value
    | None -> failwith("Temp claim amount invalid")
    end;
    s.tempClaimAmount  := (None : option(nat));
    var transferedToken: nat := 0n;
    const forceTransfer: bool = case s.tempClaimForceTransfer of
      Some (value) -> value
    | None -> failwith("Temp claim forceTransfer invalid")
    end;
    s.tempClaimForceTransfer  := (None : option(bool));

    // Set the supplies variables
    const mvkTotalSupply: nat = mvkSuppliesParam.0;
    const mvkMaximumSupply: nat = mvkSuppliesParam.1;

    // Compound user rewards
    const userCompound: (option(operation) * storage) = compoundUserRewards(s);
    s := userCompound.1;

    // Update the delegation balance
    const delegationAddress : address = case Map.find_opt("delegation", s.generalContracts) of
        Some(_address) -> _address
        | None -> failwith("Error. Delegation Contract is not found.")
    end;
    const updateSatelliteBalanceOperation : operation = Tezos.transaction(
      (recipientAddress, mintedTokens, 1n),
      0tez,
      updateSatelliteBalance(delegationAddress)
    );

    // get user's staked balance in staked balance ledger
    var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[recipientAddress] of
      Some (_val) -> _val
    | None -> record[
        balance=0n;
        participationFeesPerShare=s.accumulatedFeesPerShare;
      ]
    end;

    userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + mintedTokens; 
    s.userStakeBalanceLedger[recipientAddress] := userBalanceInStakeBalanceLedger;

    // update staked MVK total supply
    s.stakedMvkTotalSupply := s.stakedMvkTotalSupply + mintedTokens;

    // Get treasury address from name
    const treasuryAddress: address = case Map.find_opt("farmTreasury", s.generalContracts) of
      Some (v) -> v
    | None -> failwith("Error. Farm treasury contract not found")
    end;

    // Check if MVK should force the transfer instead of checking the possibility of minting
    if forceTransfer then {
      transferedToken := mintedTokens;
      mintedTokens := 0n;
    }
    else {
      // Check if the desired minted amount will surpass the maximum total supply
      const tempTotalSupply: nat = mvkTotalSupply + mintedTokens;
      if tempTotalSupply > mvkMaximumSupply then {
        transferedToken := abs(tempTotalSupply - mvkMaximumSupply);
        mintedTokens := abs(mintedTokens - transferedToken);
      } else skip;
    };

    // Prepare operation list
    var operations: list(operation) := list[updateSatelliteBalanceOperation];

    // Get MVK Token address
    const mvkTokenAddress: address = Tezos.sender;

    // Mint Tokens
    if mintedTokens > 0n then {
      const mintParam: mintTokenType = (Tezos.self_address, mintedTokens);
      const mintOperation: operation = Tezos.transaction(mintParam, 0tez, getMintEntrypointFromTokenAddress(mvkTokenAddress));
      operations := mintOperation # operations;
    } else skip;

    // Transfer from treasury
    if transferedToken > 0n then {
      // Check if provided treasury exists
      const transferParam: transferType = list[
        record[
          from_=treasuryAddress;
          txs=list[
            record[
              to_=Tezos.self_address;
              amount=transferedToken;
              token_id=0n;
            ]
          ]
        ]
      ];
      const transferOperation: operation = Tezos.transaction(
        transferParam,
        0tez,
        getTransferEntrypointFromTokenAddress(mvkTokenAddress)
      );
      operations := transferOperation # operations;
    } else skip;
  } with(operations, s)

(* Main entrypoint *)
function main (const action : doormanAction; const s : storage) : return is
  block {
    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);
  } with(
    case action of
    | SetAdmin(parameters) -> setAdmin(parameters, s)
    | UpdateMinMvkAmount(parameters) -> updateMinMvkAmount(parameters, s)

    | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
    | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

    | PauseAll(_parameters) -> pauseAll(s)
    | UnpauseAll(_parameters) -> unpauseAll(s)
    | TogglePauseStake(_parameters) -> togglePauseStake(s)
    | TogglePauseUnstake(_parameters) -> togglePauseUnstake(s)
    | TogglePauseCompound(_parameters) -> togglePauseCompound(s)

    | GetTotalStakedSupply(params) -> getTotalStakedSupply(params, s)
    | GetStakedBalance(params) -> getStakedBalance(params.0, params.1, s)
    | GetSatelliteBalance(params) -> getSatelliteBalance(params.0, params.1, params.2, params.3, params.4, params.5, s)
    
    | Stake(parameters) -> stake(parameters, s)  
    | Unstake(parameters) -> unstake(parameters, s)
    | UnstakeComplete(parameters) -> unstakeComplete(parameters, s)
    | Compound(_parameters) -> compound(s)

    | FarmClaim(parameters) -> farmClaim(parameters, s)
    | FarmClaimComplete(parameters) -> farmClaimComplete(parameters, s)
    
    end
  )
