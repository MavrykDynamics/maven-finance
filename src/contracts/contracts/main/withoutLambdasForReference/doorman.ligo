// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// Doorman types
#include "../partials/types/doormanTypes.ligo"

// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"

// Treasury types for farmClaim
#include "../partials/types/treasuryTypes.ligo"

const noOperations : list (operation) = nil;
type return is list (operation) * doormanStorage

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

  | Stake of (nat)
  | Unstake of (nat)
  | Compound of (unit)

  | FarmClaim of farmClaimType

(* ---- Helper functions begin ---- *)

// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : doormanStorage) : unit is
  if (Tezos.sender = s.admin) then unit
    else failwith("Error. Only the administrator can call this entrypoint.");

function checkSenderIsMvkTokenContract(var s : doormanStorage) : unit is
block{
  const mvkTokenAddress : address = s.mvkTokenAddress;
  if (Tezos.sender = mvkTokenAddress) then skip
    else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
} with unit

function checkSenderIsDelegationContract(var s : doormanStorage) : unit is
block{
  const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  ];
  if (Tezos.sender = delegationAddress) then skip
    else failwith("Error. Only the Delegation Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");

// break glass: checkIsNotPaused helper functions begin ---------------------------------------------------------
function checkStakeIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.stakeIsPaused then failwith("Stake entrypoint is paused.")
    else unit;

function checkUnstakeIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.unstakeIsPaused then failwith("Unstake entrypoint is paused.")
    else unit;

function checkCompoundIsNotPaused(var s : doormanStorage) : unit is
  if s.breakGlassConfig.compoundIsPaused then failwith("Compound entrypoint is paused.")
    else unit;

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: doormanStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  } with (noOperations, s)

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: doormanStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)

// admin helper functions end ---------------------------------------------------------

// helper function to update satellite's balance
function updateSatelliteBalance(const delegationAddress : address) : contract(updateSatelliteBalanceParams) is
  case (Tezos.get_entrypoint_opt(
      "%onStakeChange",
      delegationAddress) : option(contract(updateSatelliteBalanceParams))) of [
    Some(contr) -> contr
  | None -> (failwith("onStakeChange entrypoint in Satellite Contract not found") : contract(updateSatelliteBalanceParams))
  ];

// helper function to get transfer entrypoint
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(transferType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      tokenAddress) : option(contract(transferType))) of [
    Some(contr) -> contr
  | None -> (failwith("transfer entrypoint in Token Contract not found") : contract(transferType))
  ];

// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. Transfer entrypoint in Treasury Contract not found") : contract(transferActionType))
  ];

// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
  case (Tezos.get_entrypoint_opt(
      "%mintMvkAndTransfer",
      contractAddress) : option(contract(mintMvkAndTransferType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. MintMvkAndTransfer entrypoint in Treasury Contract not found") : contract(mintMvkAndTransferType))
  ];

(* ---- Helper functions end ---- *)


// break glass toggle entrypoints begin ---------------------------------------------------------

function pauseAll(var s : doormanStorage) : return is
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

function unpauseAll(var s : doormanStorage) : return is
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

function togglePauseStake(var s : doormanStorage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
      else s.breakGlassConfig.stakeIsPaused := True;

} with (noOperations, s)

function togglePauseUnstake(var s : doormanStorage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
      else s.breakGlassConfig.unstakeIsPaused := True;

} with (noOperations, s)

function togglePauseCompound(var s : doormanStorage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.compoundIsPaused then s.breakGlassConfig.compoundIsPaused := False
      else s.breakGlassConfig.compoundIsPaused := True;

} with (noOperations, s)

// break glass toggle entrypoints end ---------------------------------------------------------


(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : doormanStorage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(*  get total staked supply *)
[@view] function getTotalStakedSupply(const _: unit; const s: doormanStorage) : nat is
  s.stakedMvkTotalSupply

(* View function that forwards the staked balance of source to a contract *)
[@view] function getStakedBalance (const userAddress : address; var s : doormanStorage) : nat is
  case s.userStakeBalanceLedger[userAddress] of [
    Some (_val) -> _val.balance
  | None -> 0n
  ]

(*  update configuration in the doormanStorage *)
function updateMinMvkAmount(const newMinMvkAmount : nat; var s : doormanStorage) : return is 
block {
  // check that sender is admin (i.e. Governance DAO contract address)
  checkSenderIsAdmin(s);

  if newMinMvkAmount < 1_000_000_000n then failwith("Error. The minimum amount of MVK to stake should be equal to 1.") 
    else skip;

  s.minMvkAmount := newMinMvkAmount;

} with (noOperations, s)

function compoundUserRewards(var s: doormanStorage): (option(operation) * doormanStorage) is 
  block{
    // Get User
    const user: address = Tezos.source;

    // Get the user's record, failed if it does not exists
    var userRecord: userStakeBalanceRecordType := case s.userStakeBalanceLedger[user] of [
      Some (_val) -> _val
    | None -> record[
      balance=0n;
      participationFeesPerShare=s.accumulatedFeesPerShare;
    ]
    ];

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
      const delegationAddress : address = case s.generalContracts["delegation"] of [
          Some(_address) -> _address
          | None -> failwith("Error. Delegation Contract is not found.")
      ];

      // update satellite balance if user is delegated to a satellite
      operation := Some (
        Tezos.transaction(
          (Tezos.source),
          0tez,
          updateSatelliteBalance(delegationAddress)
        )
      );

    }
    else skip;

    // Set the user's participationFeesPerShare 
    userRecord.participationFeesPerShare := s.accumulatedFeesPerShare;

    // Update the doormanStorage
    s.userStakeBalanceLedger := Big_map.update(user, Some (userRecord), s.userStakeBalanceLedger);
  } with (operation, s)

function compound(var s: doormanStorage): return is
  block{
    // Check if compound is paused
    checkCompoundIsNotPaused(s);

    // Compound rewards
    const userCompound: (option(operation) * doormanStorage) = compoundUserRewards(s);
    s := userCompound.1;
    const operations: list(operation) = case userCompound.0 of [
      Some (compoundOperation) -> list[compoundOperation]
    | None -> noOperations
    ];

  } with (operations, s)

function stake(const stakeAmount : nat; var s : doormanStorage) : return is
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
  const userCompound: (option(operation) * doormanStorage) = compoundUserRewards(s);
  s := userCompound.1;

  // 1. verify that user is staking at least 1 MVK tokens - note: amount should be converted (on frontend) to 10^18
  if stakeAmount < s.minMvkAmount then failwith("You have to stake more MVK.")
    else skip;

  const mvkTokenAddress : address = s.mvkTokenAddress;

  const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  ];
        
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
    (Tezos.sender),
    0tez,
    updateSatelliteBalance(delegationAddress)
  );

  // list of operations: burn mvk tokens first, then mint smvk tokens
  // const operations : list(operation) = list [burnMvkTokensOperation; mintSMvkTokensOperation; updateSatelliteBalanceOperation];
  const operations : list(operation) = case userCompound.0 of [
    Some (o) -> list [o; updateSatelliteBalanceOperation; transferOperation]
  | None -> list [updateSatelliteBalanceOperation; transferOperation]
  ];
  // 3. update record of user address with minted sMVK tokens

  // update user's staked balance in staked balance ledger
  var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[Tezos.sender] of [
      Some(_val) -> _val
      | None -> record[
        balance=0n;
        participationFeesPerShare=s.accumulatedFeesPerShare;
      ]
  ];
  userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + stakeAmount; 
  s.userStakeBalanceLedger[Tezos.sender] := userBalanceInStakeBalanceLedger;

  // update staked MVK total supply
  s.stakedMvkTotalSupply := s.stakedMvkTotalSupply + stakeAmount;
 
} with (operations, s)


function unstake(const unstakeAmount : nat; var s : doormanStorage) : return is
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
  const firstCompound: (option(operation) * doormanStorage) = compoundUserRewards(s);
  s := firstCompound.1;

  const mvkTotalSupplyView : option (nat) = Tezos.call_view ("getTotalSupply", unit, s.mvkTokenAddress);
  const mvkTotalSupply: nat = case mvkTotalSupplyView of [
    Some (value) -> value
  | None -> (failwith ("Error. GetTotalSupply View not found in the MVK Token Contract") : nat)
  ];

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
  var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[Tezos.source] of [
      Some(_val) -> _val
      | None -> failwith("User staked balance not found in staked balance ledger.")
  ];
  
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

  const delegationAddress : address = case s.generalContracts["delegation"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Delegation Contract is not found.")
  ];

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
    (Tezos.source),
    0tez,
    updateSatelliteBalance(delegationAddress)
  );

  // Compound with the user new rewards if he still have sMVK after unstaking
  const secondCompound: (option(operation) * doormanStorage) = compoundUserRewards(s);
  s := secondCompound.1;

  // create list of operations
  var operations : list(operation) := case secondCompound.0 of [
    Some (compoundOperation) -> list[compoundOperation; updateSatelliteBalanceOperation; transferOperation]
  | None -> list[updateSatelliteBalanceOperation; transferOperation]
  ];

  operations := case firstCompound.0 of [
    Some (compoundOperation) -> compoundOperation # operations
  | None -> operations
  ];

} with (operations, s)

(* Farm Claim entrypoint *)
function farmClaim(const farmClaim: farmClaimType; var s: doormanStorage): return is
  block{
    // Get values from parameter
    const delegator: address = farmClaim.0;
    var claimAmount: nat  := farmClaim.1;
    var transferedToken: nat  := 0n;
    const forceTransfer: bool = farmClaim.2;

    // Get farm address
    const farmAddress: address = Tezos.sender;

    // Check if farm address is known to the farmFactory
    const farmFactoryAddress: address = case Map.find_opt("farmFactory", s.generalContracts) of [
        Some(_address) -> _address
        | None -> failwith("Error. Farm Factory Contract is not found.")
    ];

    const checkFarmExistsView : option (bool) = Tezos.call_view ("checkFarmExists", farmAddress, farmFactoryAddress);
    const checkFarmExists: bool = case checkFarmExistsView of [
      Some (value) -> value
    | None -> (failwith ("Error. CheckFarmExistsView View not found in the Farm factory Contract") : bool)
    ];

    if not checkFarmExists then failwith("Error. The Farm is not tracked by the Farm Factory or it does not exist.") else skip;

    const mvkTotalAndMaximumSupplyView : option (nat * nat) = Tezos.call_view ("getTotalAndMaximumSupply", unit, s.mvkTokenAddress);
    const mvkTotalAndMaximumSupply: (nat * nat) = case mvkTotalAndMaximumSupplyView of [
      Some (totalSupply, maximumSupply) -> (totalSupply, maximumSupply)
    | None -> (failwith ("Error. GetTotalAndMaximumSupply View not found in the MVK Token Contract") : nat * nat)
    ];

    // Set the supplies variables
    const mvkTotalSupply: nat = mvkTotalAndMaximumSupply.0;
    const mvkMaximumSupply: nat = mvkTotalAndMaximumSupply.1;

    // Compound user rewards
    const userCompound: (option(operation) * doormanStorage) = compoundUserRewards(s);
    s := userCompound.1;

    // Update the delegation balance
    const delegationAddress : address = case Map.find_opt("delegation", s.generalContracts) of [
        Some(_address) -> _address
        | None -> failwith("Error. Delegation Contract is not found.")
    ];
    const updateSatelliteBalanceOperation : operation = Tezos.transaction(
      (delegator),
      0tez,
      updateSatelliteBalance(delegationAddress)
    );

    // get user's staked balance in staked balance ledger
    var userBalanceInStakeBalanceLedger: userStakeBalanceRecordType := case s.userStakeBalanceLedger[delegator] of [
      Some (_val) -> _val
    | None -> record[
        balance=0n;
        participationFeesPerShare=s.accumulatedFeesPerShare;
      ]
    ];

    userBalanceInStakeBalanceLedger.balance := userBalanceInStakeBalanceLedger.balance + claimAmount; 
    s.userStakeBalanceLedger[delegator] := userBalanceInStakeBalanceLedger;

    // update staked MVK total supply
    s.stakedMvkTotalSupply := s.stakedMvkTotalSupply + claimAmount;

    // Get treasury address from name
    const treasuryAddress: address = case Map.find_opt("farmTreasury", s.generalContracts) of [
      Some (v) -> v
    | None -> failwith("Error. Farm treasury contract not found")
    ];

    // Check if MVK should force the transfer instead of checking the possibility of minting
    if forceTransfer then {
      transferedToken := claimAmount;
      claimAmount := 0n;
    }
    else {
      // Check if the desired minted amount will surpass the maximum total supply
      const tempTotalSupply: nat = mvkTotalSupply + claimAmount;
      if tempTotalSupply > mvkMaximumSupply then {
        transferedToken := abs(tempTotalSupply - mvkMaximumSupply);
        claimAmount := abs(claimAmount - transferedToken);
      } else skip;
    };

    // Prepare operation list
    var operations: list(operation) := list[updateSatelliteBalanceOperation];

    // Get MVK Token address
    const mvkTokenAddress: address = s.mvkTokenAddress;

    // Mint Tokens
    if claimAmount > 0n then {
      const mintMvkAndTransferTokenParams : mintMvkAndTransferType = record [
        to_  = Tezos.self_address;
        amt  = claimAmount;
      ];

      const mintOperation : operation = Tezos.transaction(
        mintMvkAndTransferTokenParams, 
        0tez, 
        sendMintMvkAndTransferOperationToTreasury(treasuryAddress)
      );
      operations := mintOperation # operations;
    } else skip;

    // Transfer from treasury
    if transferedToken > 0n then {
      // Check if provided treasury exists
      const transferParam: transferActionType = list[
        record[
          to_=Tezos.self_address;
          token=Fa2 (record[
            tokenContractAddress=mvkTokenAddress;
            tokenId=0n;
          ]);
          amount=transferedToken;
        ]
      ];

      const transferOperation: operation = Tezos.transaction(
        transferParam,
        0tez,
        sendTransferOperationToTreasury(treasuryAddress)
      );
      operations := transferOperation # operations;
    } else skip;
  } with(operations, s)

(* Main entrypoint *)
function main (const action : doormanAction; const s : doormanStorage) : return is
  block {
    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);
  } with(
    case action of [
    | SetAdmin(parameters) -> setAdmin(parameters, s)
    | UpdateMinMvkAmount(parameters) -> updateMinMvkAmount(parameters, s)

    | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
    | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

    | PauseAll(_parameters) -> pauseAll(s)
    | UnpauseAll(_parameters) -> unpauseAll(s)
    | TogglePauseStake(_parameters) -> togglePauseStake(s)
    | TogglePauseUnstake(_parameters) -> togglePauseUnstake(s)
    | TogglePauseCompound(_parameters) -> togglePauseCompound(s)

    | Stake(parameters) -> stake(parameters, s)  
    | Unstake(parameters) -> unstake(parameters, s)
    | Compound(_parameters) -> compound(s)

    | FarmClaim(parameters) -> farmClaim(parameters, s)
    ]
  )
