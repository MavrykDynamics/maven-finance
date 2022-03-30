////
// TYPES INCLUDED
////
// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

////
// COMMON TYPES
////
type delegator is address
type tokenBalance is nat

////
// STORAGE
////
type delegatorRecord is [@layout:comb] record[
    balance: tokenBalance;
    participationMVKPerShare: tokenBalance;
    unclaimedRewards: tokenBalance;
]
type claimedRewards is [@layout:comb] record[
    unpaid: tokenBalance;
    paid: tokenBalance;
]
type plannedRewards is [@layout:comb] record[
    totalBlocks: nat;
    currentRewardPerBlock: tokenBalance;
    totalRewards: tokenBalance;
]
type lpStandard is
    Fa12 of unit
|   Fa2 of unit
type lpToken is [@layout:comb] record[
    tokenAddress: address;
    tokenId: nat;
    tokenStandard: lpStandard;
    tokenBalance: tokenBalance;
]
type tokenPairType is [@layout:comb] record[
    token0Address: address;
    token1Address: address;
]

type breakGlassConfigType is [@layout:comb] record [
    depositIsPaused         : bool;
    withdrawIsPaused        : bool;
    claimIsPaused           : bool;
]

type configType is record [
    lpToken                     : lpToken;
    tokenPair                   : tokenPairType;
    infinite                    : bool;
    forceRewardFromTransfer     : bool;
    blocksPerMinute             : nat;
    plannedRewards              : plannedRewards;
]

type storage is record[
    admin                   : address;
    mvkTokenAddress         : address;

    config                  : configType;

    whitelistContracts      : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts        : generalContractsType;

    breakGlassConfig        : breakGlassConfigType;

    lastBlockUpdate         : nat;
    accumulatedMVKPerShare  : tokenBalance;
    claimedRewards          : claimedRewards;
    delegators              : big_map(delegator, delegatorRecord);
    open                    : bool;
    init                    : bool;
    initBlock               : nat;
]

////
// RETURN TYPES
////
(* define return for readability *)
type return is list (operation) * storage
(* define noop for readability *)
const noOperations : list (operation) = nil;

////
// INPUTS
////
(* Transfer entrypoint inputs for FA12 and FA2 *)
type transferDestination is [@layout:comb] record[
  to_: address;
  token_id: nat;
  amount: tokenBalance;
]
type transfer is [@layout:comb] record[
  from_: address;
  txs: list(transferDestination);
]
type newTransferType is list(transfer)
type oldTransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

(* initFarm entrypoint inputs *)
type initFarmParamsType is [@layout:comb] record[
    totalBlocks: nat;
    currentRewardPerBlock: nat;
    blocksPerMinute: nat;
    forceRewardFromTransfer: bool;
    infinite: bool;
]

(* doorman's farmClaim entrypoint inputs *)
type farmClaimType is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

(* updateConfig entrypoint inputs *)
type updateConfigNewValueType is nat
type updateConfigActionType is 
  ConfigForceRewardFromTransfer of unit
| ConfigRewardPerBlock of unit
type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: updateConfigNewValueType; 
  updateConfigAction: updateConfigActionType;
]

////
// ENTRYPOINTS
////
type entryAction is
    SetAdmin of (address)
|   UpdateConfig of updateConfigParamsType

|   UpdateWhitelistContracts of updateWhitelistContractsParams
|   UpdateGeneralContracts of updateGeneralContractsParams

|   UpdateBlocksPerMinute of (nat)
|   CloseFarm of (unit)

|   PauseAll of (unit)
|   UnpauseAll of (unit)
|   TogglePauseDeposit of (unit)
|   TogglePauseWithdraw of (unit)
|   TogglePauseClaim of (unit)

|   Deposit of nat
|   Withdraw of nat
|   Claim of unit

|   InitFarm of initFarmParamsType

////
// EXTRA VARIABLES
////
const fixedPointAccuracy: nat = 1_000_000_000_000_000_000_000_000n; // 10^24

////
// HELPER FUNCTIONS
///
(* Getters and Setters *)
function getDelegatorDeposit(const delegator: delegator; const s: storage): option(delegatorRecord) is
    Big_map.find_opt(delegator, s.delegators)

(* Checks functions *)
function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit

function checkSenderIsAdmin(const s: storage): unit is
  if Tezos.sender =/= s.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

function checkSenderOrSourceIsCouncil(const s: storage): unit is
    block {
        const councilAddress: address = case s.whitelistContracts["council"] of [
            Some (_address) -> _address
        |   None -> (failwith("Council contract not found in whitelist contracts"): address)
        ];

        if Tezos.source = councilAddress or Tezos.sender = councilAddress then skip
        else failwith("Only Council contract allowed");
    } with(unit)

function checkSenderIsAllowed(const s: storage): unit is
    block {
        // First check because a farm without a facory should still be accessible
        if Tezos.sender = s.admin then skip
        else{
            const farmFactoryAddress: address = case s.whitelistContracts["farmFactory"] of [
                Some (_address) -> _address
            |   None -> (failwith("Only Admin or Factory contract allowed"): address)
            ];
            if Tezos.sender = farmFactoryAddress then skip else failwith("Only Admin or Factory contract allowed");
        };
    } with(unit)

function checkFarmIsInit(const s: storage): unit is 
  if not s.init then failwith("This farm has not yet been initiated")
  else unit

function checkFarmIsOpen(const s: storage): unit is 
  if not s.open then failwith("This farm is closed")
  else unit

////
// BREAK GLASS CHECKS
////

// break glass: checkIsNotPaused helper functions begin ---------------------------------------------------------
function checkDepositIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.depositIsPaused then failwith("Deposit entrypoint is paused.")
    else unit;

function checkWithdrawIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.withdrawIsPaused then failwith("Withdraw entrypoint is paused.")
    else unit;

function checkClaimIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.claimIsPaused then failwith("Claim entrypoint is paused.")
    else unit;

////
// FUNCTIONS INCLUDED
////
// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

////
// TRANSFER FUNCTIONS
///
function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenContractAddress: address): operation is
    block{
        const transferParams: oldTransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(oldTransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(oldTransferType))) of [
                Some (c) -> c
            |   None -> (failwith("Transfer entrypoint not found in LP Token contract"): contract(oldTransferType))
            ];
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

function transferFa2Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenContractAddress: address): operation is
block{
    const transferParams: newTransferType = list[
            record[
                from_=from_;
                txs=list[
                    record[
                        to_=to_;
                        token_id=tokenId;
                        amount=tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(newTransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(newTransferType))) of [
            Some (c) -> c
        |   None -> (failwith("Transfer entrypoint not found in LP Token contract"): contract(newTransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

function transferLP(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenStandard: lpStandard; const tokenContractAddress: address): operation is
    case tokenStandard of [
        Fa12 -> transferFa12Token(from_,to_,tokenAmount,tokenContractAddress)
    |   Fa2 -> transferFa2Token(from_,to_,tokenAmount,tokenId,tokenContractAddress)
    ]

function transferReward(const delegator: delegator; const tokenAmount: tokenBalance; const s: storage): operation is
    block{
        // Call farmClaim from the doorman contract
        const doormanContractAddress: address = case Big_map.find_opt("doorman", s.generalContracts) of [
            Some (a) -> a
        |   None -> (failwith("Doorman contract not found in generalContracts map"): address)
        ];
        
        const doormanContract: contract(farmClaimType) =
        case (Tezos.get_entrypoint_opt("%farmClaim", doormanContractAddress): option(contract(farmClaimType))) of [
            Some (c) -> c
        |   None -> (failwith("FarmClaim entrypoint not found in Doorman contract"): contract(farmClaimType))
        ];

        const farmClaimParams: farmClaimType = (delegator, tokenAmount, s.config.forceRewardFromTransfer);
    } with (Tezos.transaction(farmClaimParams, 0tez, doormanContract))

////
// UPDATE FARM FUNCTIONS
///
function updateBlock(var s: storage): storage is
    block{
        // Close farm is totalBlocks duration has been exceeded
        const lastBlock: nat = s.config.plannedRewards.totalBlocks + s.initBlock;
        s.open := Tezos.level <= lastBlock or s.config.infinite;

        // Update lastBlockUpdate in storage
        s.lastBlockUpdate := Tezos.level;
    }
    with(s)

function updateFarmParameters(var s: storage): storage is
    block{
        // Compute the potential reward of this block
        const multiplier: nat = abs(Tezos.level - s.lastBlockUpdate);
        const suspectedReward: tokenBalance = multiplier * s.config.plannedRewards.currentRewardPerBlock;

        // This check is necessary in case the farm unpaid reward was not updated for a long time
        // and the outstandingReward grew to such a big number that it exceeds the planned rewards.
        // In that case only the difference between planned and claimed rewards is paid out to empty
        // the account.
        const totalClaimedRewards: tokenBalance = s.claimedRewards.paid + s.claimedRewards.unpaid;
        const totalFarmRewards: tokenBalance = suspectedReward + totalClaimedRewards;
        const totalPlannedRewards: tokenBalance = s.config.plannedRewards.totalRewards;
        const reward: tokenBalance = case totalFarmRewards > totalPlannedRewards and not s.config.infinite of [
            True -> abs(totalPlannedRewards - totalClaimedRewards)
        |   False -> suspectedReward
        ];
            
        // Updates the storage
        s.claimedRewards.unpaid := s.claimedRewards.unpaid + reward;
        s.accumulatedMVKPerShare := s.accumulatedMVKPerShare + ((reward * fixedPointAccuracy) / s.config.lpToken.tokenBalance);
        s := updateBlock(s);
    } with(s)

function updateFarm(var s: storage): storage is
    block{
        s := case s.config.lpToken.tokenBalance = 0n of [
            True -> updateBlock(s)
        |   False -> case s.lastBlockUpdate = Tezos.level or not s.open of [
                True -> s
            |   False -> updateFarmParameters(s)
            ]
        ];
    } with(s)

function updateUnclaimedRewards(var s: storage): storage is
    block{
        // Get delegator
        const delegator: delegator = Tezos.sender;

        // Check if sender as already a record
        var delegatorRecord: delegatorRecord :=
            case getDelegatorDeposit(delegator, s) of [
                Some (r) -> r
            |   None -> (failwith("DELEGATOR_NOT_FOUND"): delegatorRecord)
            ];

        // Compute delegator reward
        const accumulatedMVKPerShareStart: tokenBalance = delegatorRecord.participationMVKPerShare;
        const accumulatedMVKPerShareEnd: tokenBalance = s.accumulatedMVKPerShare;
        if accumulatedMVKPerShareStart > accumulatedMVKPerShareEnd then failwith("The delegator reward debt is higher than the accumulated MVK per share") else skip;
        const currentMVKPerShare = abs(accumulatedMVKPerShareEnd - accumulatedMVKPerShareStart);
        const delegatorReward = (currentMVKPerShare * delegatorRecord.balance) / fixedPointAccuracy;

        // Update paid and unpaid rewards in storage
        if delegatorReward > s.claimedRewards.unpaid then failwith("The delegator reward is higher than the total unpaid reward") else skip;
        s.claimedRewards := record[
            unpaid=abs(s.claimedRewards.unpaid - delegatorReward);
            paid=s.claimedRewards.paid + delegatorReward;
        ];

        // Update user's unclaimed rewards and participationMVKPerShare
        delegatorRecord.unclaimedRewards := delegatorRecord.unclaimedRewards + delegatorReward;
        delegatorRecord.participationMVKPerShare := accumulatedMVKPerShareEnd;
        s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);
    } with(s)

////
// BREAK GLASS FUNCTIONS
///
function pauseAll(var s: storage) : return is
    block {
        // check that source is admin
        checkSenderIsAllowed(s);

        // set all pause configs to True
        if s.breakGlassConfig.depositIsPaused then skip
        else s.breakGlassConfig.depositIsPaused := True;

        if s.breakGlassConfig.withdrawIsPaused then skip
        else s.breakGlassConfig.withdrawIsPaused := True;

        if s.breakGlassConfig.claimIsPaused then skip
        else s.breakGlassConfig.claimIsPaused := True;

    } with (noOperations, s)

function unpauseAll(var s : storage) : return is
    block {
        // check that source is admin
        checkSenderIsAllowed(s);

        // set all pause configs to False
        if s.breakGlassConfig.depositIsPaused then s.breakGlassConfig.depositIsPaused := False
        else skip;

        if s.breakGlassConfig.withdrawIsPaused then s.breakGlassConfig.withdrawIsPaused := False
        else skip;

        if s.breakGlassConfig.claimIsPaused then s.breakGlassConfig.claimIsPaused := False
        else skip;

    } with (noOperations, s)

function togglePauseDeposit(var s : storage) : return is
    block {
        // check that source is admin
        checkSenderIsAllowed(s);

        if s.breakGlassConfig.depositIsPaused then s.breakGlassConfig.depositIsPaused := False
        else s.breakGlassConfig.depositIsPaused := True;

    } with (noOperations, s)

function togglePauseWithdraw(var s : storage) : return is
    block {
        // check that source is admin
        checkSenderIsAllowed(s);

        if s.breakGlassConfig.withdrawIsPaused then s.breakGlassConfig.withdrawIsPaused := False
        else s.breakGlassConfig.withdrawIsPaused := True;

    } with (noOperations, s)

function togglePauseClaim(var s : storage) : return is
    block {
        // check that source is admin
        checkSenderIsAllowed(s);

        if s.breakGlassConfig.claimIsPaused then s.breakGlassConfig.claimIsPaused := False
        else s.breakGlassConfig.claimIsPaused := True;

    } with (noOperations, s)

////
// ENTRYPOINTS FUNCTIONS
///
(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(*  update contract config *)
function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {
  checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of [
    ConfigForceRewardFromTransfer (_v)  -> block {
        if updateConfigNewValue =/= 1n and updateConfigNewValue =/= 0n then failwith("Configuration value error") else skip;
        s.config.forceRewardFromTransfer    := updateConfigNewValue = 1n;
    }
  | ConfigRewardPerBlock (_v)          -> block {
        // check if farm has been initiated
        checkFarmIsInit(s);

        checkFarmIsInit(s);

        // update storage
        s := updateFarm(s);

        // Check new reward per block
        const currentRewardPerBlock: nat = s.config.plannedRewards.currentRewardPerBlock;
        if currentRewardPerBlock > updateConfigNewValue then failwith("The new reward per block must be higher than the previous one.") else skip;

        // Calculate new total rewards
        const totalClaimedRewards: nat = s.claimedRewards.unpaid+s.claimedRewards.paid;
        const remainingBlocks: nat = abs((s.initBlock + s.config.plannedRewards.totalBlocks) - s.lastBlockUpdate);
        const newTotalRewards: nat = totalClaimedRewards + remainingBlocks * updateConfigNewValue;

        // Update storage
        s.config.plannedRewards.currentRewardPerBlock := updateConfigNewValue;
        s.config.plannedRewards.totalRewards := newTotalRewards;
  }
  ];

} with (noOperations, s)

(*  UpdateBlocksPerMinute entrypoint *)
function updateBlocksPerMinute(const blocksPerMinute: nat; var s: storage) : return is
block {
    // check that source is admin or factory
    checkSenderOrSourceIsCouncil(s);

    // check if farm has been initiated
    checkFarmIsInit(s);

    // update storage
    s := updateFarm(s);

    // Check new blocksPerMinute
    if blocksPerMinute > 0n then skip else failwith("The new block per minute should be greater than zero");

    var newcurrentRewardPerBlock: nat := 0n;
    if s.config.infinite then {
        newcurrentRewardPerBlock := s.config.blocksPerMinute * s.config.plannedRewards.currentRewardPerBlock * fixedPointAccuracy / blocksPerMinute;
    }
    else {
        // Unclaimed rewards
        const totalUnclaimedRewards: nat = abs(s.config.plannedRewards.totalRewards - (s.claimedRewards.unpaid+s.claimedRewards.paid));

        // Updates rewards and total blocks accordingly
        const blocksPerMinuteRatio: nat = s.config.blocksPerMinute * fixedPointAccuracy / blocksPerMinute;
        const newTotalBlocks: nat = (s.config.plannedRewards.totalBlocks * fixedPointAccuracy) / blocksPerMinuteRatio;
        const remainingBlocks: nat = abs((s.initBlock + newTotalBlocks) - s.lastBlockUpdate);
        newcurrentRewardPerBlock := (totalUnclaimedRewards * fixedPointAccuracy) / remainingBlocks;
        
        // Update storage
        s.config.plannedRewards.totalBlocks := newTotalBlocks;
    };

    // Update storage
    s.config.blocksPerMinute := blocksPerMinute;
    s.config.plannedRewards.currentRewardPerBlock := (newcurrentRewardPerBlock/fixedPointAccuracy);

} with (noOperations, s)

(* Claim Entrypoint *)
function claim(var s: storage): return is
    block{
        // break glass check
        checkClaimIsNotPaused(s);

        // Check if farm has started
        checkFarmIsInit(s);

        // Update pool storage
        s := updateFarm(s);

        // Update user's unclaimed rewards
        s := updateUnclaimedRewards(s);

        const delegator: delegator = Tezos.sender;

        // Check if sender as already a record
        var delegatorRecord: delegatorRecord := case getDelegatorDeposit(delegator, s) of [
            Some (r) -> r
        |   None -> (failwith("DELEGATOR_NOT_FOUND"): delegatorRecord)
        ];

        const claimedRewards: tokenBalance = delegatorRecord.unclaimedRewards;

        if claimedRewards = 0n then failwith("The delegator has no rewards to claim") else skip;

        // Store new unclaimedRewards value in delegator
        delegatorRecord.unclaimedRewards := 0n;
        s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

        // Transfer sMVK rewards
        const operation: operation = transferReward(delegator, claimedRewards, s);
    } with(list[operation], s)

(* Deposit Entrypoint *)
function deposit(const tokenAmount: tokenBalance; var s: storage): return is
    block{
        // break glass check
        checkDepositIsNotPaused(s);

        // Check if farm has started
        checkFarmIsInit(s);

        // Update pool storage
        s := updateFarm(s);

        // Check if farm is closed or not
        checkFarmIsOpen(s);

        // Delegator address
        const delegator: delegator = Tezos.sender;

        // Check if sender as already a record
        const existingDelegator: bool = Big_map.mem(delegator, s.delegators);

        // Prepare new delegator record
        var delegatorRecord: delegatorRecord := record[
            balance=0n;
            participationMVKPerShare=s.accumulatedMVKPerShare;
            unclaimedRewards=0n
        ];

        // Get delegator deposit and perform a claim
        if existingDelegator then {
            // Update user's unclaimed rewards
            s := updateUnclaimedRewards(s);

            // Refresh delegator deposit with updated unclaimed rewards
            delegatorRecord :=  case getDelegatorDeposit(delegator, s) of [
                Some (_delegator) -> _delegator
            |   None -> failwith("Delegator not found")
            ];
            
        }
        else skip;

        // Update delegator token balance
        delegatorRecord.balance := delegatorRecord.balance + tokenAmount;

        // Update delegators Big_map and farmTokenBalance
        s.config.lpToken.tokenBalance := s.config.lpToken.tokenBalance + tokenAmount;
        s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

        // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
        const operation: operation = transferLP(delegator, Tezos.self_address, tokenAmount, s.config.lpToken.tokenId, s.config.lpToken.tokenStandard, s.config.lpToken.tokenAddress);
    } with(list[operation], s)

(* Withdraw Entrypoint *)
function withdraw(const tokenAmount: tokenBalance; var s: storage): return is
    block{
        // break glass check
        checkWithdrawIsNotPaused(s);

        // Check if farm has started
        checkFarmIsInit(s);

        // Update pool storage
        s := updateFarm(s);

        const delegator: delegator = Tezos.sender;

        // Prepare to update user's unclaimedRewards if user already deposited tokens
        s := updateUnclaimedRewards(s);

        var delegatorRecord: delegatorRecord := case getDelegatorDeposit(delegator, s) of [
            Some (d) -> d
        |   None -> failwith("DELEGATOR_NOT_FOUND")
        ];

        // Check if the delegator has enough token to withdraw
        if tokenAmount > delegatorRecord.balance then failwith("The amount withdrawn is higher than the delegator deposit") else skip;
        delegatorRecord.balance := abs(delegatorRecord.balance - tokenAmount);
        s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

        // Check if the farm has enough token
        if tokenAmount > s.config.lpToken.tokenBalance then failwith("The amount withdrawn is higher than the farm lp balance") else skip;
        s.config.lpToken.tokenBalance := abs(s.config.lpToken.tokenBalance - tokenAmount);
        
        // Transfer LP tokens to the user from the farm balance in the LP Contract
        const operation: operation = transferLP(
            Tezos.self_address,
            delegator,
            tokenAmount,
            s.config.lpToken.tokenId, 
            s.config.lpToken.tokenStandard,
            s.config.lpToken.tokenAddress
        );
    } with(list[operation], s)

(* CloseFarm Entrypoint *)
function closeFarm (var s: storage): return is
    block{
        // Check sender is admin
        checkSenderIsAdmin(s);

        // Check if farm is open
        checkFarmIsOpen(s);
        
        s := updateFarm(s);
    
        s.open := False ;

    } with (noOperations, s)

(* InitFarm Entrypoint *)
function initFarm (const initFarmParams: initFarmParamsType; var s: storage): return is
    block{
        // Check if sender is admin
        checkSenderIsAdmin(s);

        // Check if farm is already open
        if s.open or s.init then failwith("This farm is already opened you cannot initialize it again") else skip;

        // Check if the blocks per minute is greater than 0
        if initFarmParams.blocksPerMinute <= 0n then failwith("This farm farm blocks per minute should be greater than 0") else skip;

        // Check wether the farm is infinite or its total blocks has been set
        if not initFarmParams.infinite and initFarmParams.totalBlocks = 0n then failwith("This farm should be either infinite or have a specified duration") else skip;
        
        // Update storage
        s := updateFarm(s);
        s.initBlock := Tezos.level;
        s.config.infinite := initFarmParams.infinite;
        s.config.forceRewardFromTransfer := initFarmParams.forceRewardFromTransfer;
        s.config.plannedRewards.currentRewardPerBlock := initFarmParams.currentRewardPerBlock;
        s.config.plannedRewards.totalBlocks := initFarmParams.totalBlocks;
        s.config.plannedRewards.totalRewards := s.config.plannedRewards.currentRewardPerBlock * s.config.plannedRewards.totalBlocks;
        s.config.blocksPerMinute := initFarmParams.blocksPerMinute;
        s.open := True ;
        s.init := True ;
    } with (noOperations, s)

(* Main entrypoint *)
function main (const action: entryAction; var s: storage): return is
  block{
    // Check that sender didn't send Tezos while calling an entrypoint
    checkNoAmount(Unit);
  } with(
    case action of [
        SetAdmin (parameters) -> setAdmin(parameters, s)
    |   UpdateConfig (parameters) -> updateConfig(parameters, s)
    |   UpdateWhitelistContracts (parameters) -> updateWhitelistContracts(parameters, s)
    |   UpdateGeneralContracts (parameters) -> updateGeneralContracts(parameters, s)

    |   UpdateBlocksPerMinute (parameters) -> updateBlocksPerMinute(parameters, s)
    |   CloseFarm (_parameters) -> closeFarm(s)

    |   PauseAll (_parameters) -> pauseAll(s)
    |   UnpauseAll (_parameters) -> unpauseAll(s)
    |   TogglePauseDeposit (_parameters) -> togglePauseDeposit(s)
    |   TogglePauseWithdraw (_parameters) -> togglePauseWithdraw(s)
    |   TogglePauseClaim (_parameters) -> togglePauseClaim(s)

    |   Deposit (parameters) -> deposit(parameters, s)
    |   Withdraw (parameters) -> withdraw(parameters, s)
    |   Claim (_parameters) -> claim(s)
    |   InitFarm (parameters) -> initFarm(parameters, s)
    ]
  )