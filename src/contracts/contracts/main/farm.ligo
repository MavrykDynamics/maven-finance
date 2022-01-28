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
type delegatorRecord is record[
    balance: tokenBalance;
    participationMVKPerShare: tokenBalance;
    unclaimedRewards: tokenBalance;
]
type claimedRewards is record[
    unpaid: tokenBalance;
    paid: tokenBalance;
]
type plannedRewards is record[
    totalBlocks: nat;
    rewardPerBlock: tokenBalance;
]
type lpStandard is
    Fa12 of unit
|   Fa2 of unit
type lpToken is record[
    tokenAddress: address;
    tokenId: nat;
    tokenStandard: lpStandard;
    tokenBalance: tokenBalance;
]

type storage is record[
    admin                   : address;
    whitelistContracts      : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts        : generalContractsType;

    lastBlockUpdate         : nat;
    accumulatedMVKPerShare  : tokenBalance;
    claimedRewards          : claimedRewards;
    plannedRewards          : plannedRewards;
    delegators              : big_map(delegator, delegatorRecord);
    lpToken                 : lpToken;
    open                    : bool;
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
type initFarmParamsType is record[
    totalBlocks: nat;
    rewardPerBlock: nat;
]

////
// ENTRYPOINTS
////
type entryAction is
    Deposit of nat
|   Claim of unit
|   Withdraw of nat
|   InitFarm of initFarmParamsType

////
// EXTRA VARIABLES
////
const fixedPointAccuracy: nat = 1_000_000_000_000n; // 10^12

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

function checkFarmIsInit(const s: storage): unit is 
  if s.plannedRewards.rewardPerBlock = 0n or s.plannedRewards.totalBlocks = 0n then failwith("This farm has not yet been initiated")
  else unit

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
function transferLPOld(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenContractAddress: address): operation is
    block{
        const transferParams: oldTransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(oldTransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(oldTransferType))) of
                Some (c) -> c
            |   None -> (failwith("Transfer entrypoint not found in LP Token contract"): contract(oldTransferType))
            end;
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

function transferLPNew(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenContractAddress: address): operation is
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
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(newTransferType))) of
            Some (c) -> c
        |   None -> (failwith("Transfer entrypoint not found in LP Token contract"): contract(newTransferType))
        end;
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

function transferLP(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenStandard: lpStandard; const tokenContractAddress: address): operation is
    case tokenStandard of
        Fa12 -> transferLPOld(from_,to_,tokenAmount,tokenContractAddress)
    |   Fa2 -> transferLPNew(from_,to_,tokenAmount,tokenId,tokenContractAddress)
    end

function transferReward(const reserveAddress: address; const to_: address; const tokenAmount: tokenBalance; const rewardTokenContract: address): operation is
    block{
        const transferParams: newTransferType = list[
            record[
                from_=reserveAddress;
                txs=list[
                    record[
                        to_=to_;
                        token_id=0n;
                        amount=tokenAmount;
                    ]
                ]
            ]
        ];

        // For now it only transfers MVK to the user for the reserve
        const tokenContract: contract(newTransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", rewardTokenContract): option(contract(newTransferType))) of
                Some (c) -> c
            |   None -> (failwith("Transfer entrypoint not found in MVK Token contract"): contract(newTransferType))
            end;
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

////
// UPDATE FARM FUNCTIONS
///
function updateBlock(var s: storage): storage is
    block{
        // Close farm is totalBlocks duration has been exceeded
        const lastBlock: nat = s.plannedRewards.totalBlocks + s.initBlock;
        s.open := Tezos.level <= lastBlock;

        // Update lastBlockUpdate in storage
        s.lastBlockUpdate := Tezos.level;
    }
    with(s)

function updateFarmParameters(var s: storage): storage is
    block{
        // Compute the potential reward of this block
        const multiplier: nat = abs(Tezos.level - s.lastBlockUpdate);
        const suspectedReward: tokenBalance = multiplier * s.plannedRewards.rewardPerBlock;

        // This check is necessary in case the farm unpaid reward was not updated for a long time
        // and the outstandingReward grew to such a big number that it exceeds the planned rewards.
        // In that case only the difference between planned and claimed rewards is paid out to empty
        // the account.
        const totalClaimedRewards: tokenBalance = s.claimedRewards.paid + s.claimedRewards.unpaid;
        const totalFarmRewards: tokenBalance = suspectedReward + totalClaimedRewards;
        const totalPlannedRewards: tokenBalance = s.plannedRewards.rewardPerBlock * s.plannedRewards.totalBlocks;
        const reward: tokenBalance =
            case totalFarmRewards > totalPlannedRewards of
                True -> abs(totalPlannedRewards - totalClaimedRewards)
            |   False -> suspectedReward
            end;

        // Updates the storage
        s.claimedRewards.unpaid := s.claimedRewards.unpaid + reward;
        s.accumulatedMVKPerShare := s.accumulatedMVKPerShare + ((reward * fixedPointAccuracy) / s.lpToken.tokenBalance);
        s := updateBlock(s);
    } with(s)

function updateFarm(var s: storage): storage is
    block{
        s := 
            case s.lpToken.tokenBalance = 0n of
                True -> updateBlock(s)
            |   False ->
                    case s.lastBlockUpdate = Tezos.level of
                        True -> s
                    |   False -> updateFarmParameters(s)
                    end
            end;
    } with(s)

function updateUnclaimedRewards(var s: storage): storage is
    block{
        // Get delegator
        const delegator: delegator = Tezos.sender;

        // Check if sender as already a record
        var delegatorRecord: delegatorRecord :=
            case getDelegatorDeposit(delegator, s) of
                Some (r) -> r
            |   None -> (failwith("DELEGATOR_NOT_FOUND"): delegatorRecord)
            end;

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
// ENTRYPOINTS FUNCTIONS
///
(* Claim Entrypoint *)
function claim(var s: storage): return is
    block{
        // Check if farm has started
        checkFarmIsInit(s);

        // Update pool storage
        s := updateFarm(s);

        // Update user's unclaimed rewards
        s := updateUnclaimedRewards(s);

        const delegator: delegator = Tezos.sender;

        // Check if sender as already a record
        var delegatorRecord: delegatorRecord :=
            case getDelegatorDeposit(delegator, s) of
                Some (r) -> r
            |   None -> (failwith("DELEGATOR_NOT_FOUND"): delegatorRecord)
            end;

        const claimedRewards: tokenBalance = delegatorRecord.unclaimedRewards;

        // Store new unclaimedRewards value in delegator
        delegatorRecord.unclaimedRewards := 0n;
        s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

        // Transfer sMVK rewards
        const mvkTokenContract: address = getGeneralContract("mvkToken",s);
        const reserveContract: address = getGeneralContract("reserve",s);
        const operation: operation = transferReward(reserveContract, delegator, claimedRewards, mvkTokenContract);
    } with(list[operation], s)

(* Deposit Entrypoint *)
function deposit(const tokenAmount: tokenBalance; var s: storage): return is
    block{
        // Check if farm has started
        checkFarmIsInit(s);

        // Update pool storage
        s := updateFarm(s);

        // Check if farm is closed or not
        if s.open then skip else failwith("This farm is closed you cannot deposit on it");

        // Delegator address
        const delegator: delegator = Tezos.sender;

        // Check if sender as already a record
        const existingDelegator: bool = Big_map.mem(delegator, s.delegators);

        // Prepare new delegator record
        var delegatorRecord: delegatorRecord := record[balance=0n; participationMVKPerShare=0n; unclaimedRewards=0n];

        // Get delegator deposit and perform a claim
        if existingDelegator then {
            // Update user's unclaimed rewards
            s := updateUnclaimedRewards(s);

            delegatorRecord := 
                case getDelegatorDeposit(delegator, s) of
                    Some (d) -> d
                |   None -> failwith("Delegator not found")
                end;
            
        }
        else skip;

        // Update delegator token balance
        delegatorRecord.balance := delegatorRecord.balance + tokenAmount;
        delegatorRecord.participationMVKPerShare := s.accumulatedMVKPerShare;

        // Update delegators Big_map and farmTokenBalance
        s.lpToken.tokenBalance := s.lpToken.tokenBalance + tokenAmount;
        s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

        // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
        const operation: operation = transferLP(delegator, Tezos.self_address, tokenAmount, s.lpToken.tokenId, s.lpToken.tokenStandard, s.lpToken.tokenAddress);
    } with(list[operation], s)

(* Withdraw Entrypoint *)
function withdraw(const tokenAmount: tokenBalance; var s: storage): return is
    block{
        // Check if farm has started
        checkFarmIsInit(s);

        // Update pool storage
        s := updateFarm(s);

        const delegator: delegator = Tezos.sender;

        // Prepare to update user's unclaimedRewards if user already deposited tokens
        s := updateUnclaimedRewards(s);

        var delegatorRecord: delegatorRecord := 
            case getDelegatorDeposit(delegator, s) of
                Some (d) -> d
            |   None -> failwith("DELEGATOR_NOT_FOUND")
            end;

        // Check if the delegator has enough token to withdraw
        if tokenAmount > delegatorRecord.balance then failwith("The amount withdrawn is higher than the delegator deposit") else skip;
        delegatorRecord.balance := abs(delegatorRecord.balance - tokenAmount);
        s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

        // Check if the farm has enough token
        if tokenAmount > s.lpToken.tokenBalance then failwith("The amount withdrawn is higher than the farm lp balance") else skip;
        s.lpToken.tokenBalance := abs(s.lpToken.tokenBalance - tokenAmount);
        
        // Transfer LP tokens to the user from the farm balance in the LP Contract
        const operation: operation = transferLP(
            Tezos.self_address,
            delegator,
            tokenAmount,
            s.lpToken.tokenId, 
            s.lpToken.tokenStandard,
            s.lpToken.tokenAddress
        );
    } with(list[operation], s)

(* InitFarm Entrypoint *)
function initFarm (const initFarmParams: initFarmParamsType; var s: storage): return is
    block{
        checkSenderIsAdmin(s);

        if s.open then failwith("This farm is already opened you cannot initialize it again") else skip;
        
        s := updateFarm(s);
    
        s.initBlock := Tezos.level;
        s.plannedRewards.rewardPerBlock := initFarmParams.rewardPerBlock;
        s.plannedRewards.totalBlocks := initFarmParams.totalBlocks;
        s.open := True ;

    } with (noOperations, s)

(* Main entrypoint *)
function main (const action: entryAction; var s: storage): return is
  block{
    // Check that sender didn't send Tezos while calling an entrypoint
    checkNoAmount(Unit);
  } with(
    case action of
        Deposit (params) -> deposit(params, s)
    |   Claim (_params) -> claim(s)
    |   Withdraw (params) -> withdraw(params, s)
    |   InitFarm (params) -> initFarm(params, s)
    end
  )