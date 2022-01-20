// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Types
type delegator is address
type tokenBalance is nat

type delegatorRecord is record[
    balance: tokenBalance;
    rewardDebt: tokenBalance;
]
type claimedRewards is record[
    unpaid: tokenBalance;
    paid: tokenBalance;
]
type plannedRewards is record[
    totalBlocks: nat;
    rewardPerBlock: tokenBalance;
]

(* Transfer entrypoint inputs *)
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

(* LP Token standards *)
type lpStandard is
    Fa12 of unit
|   Fa2 of unit

type lpToken is record[
    tokenAddress: address;
    tokenId: nat;
    tokenStandard: lpStandard;
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
    farmTokenBalance        : tokenBalance;
    lpToken                 : lpToken;
]

(* define return for readability *)
type return is list (operation) * storage

(* define noop for readability *)
const noOperations : list (operation) = nil;
const fixedPointAccuracy: nat = 1_000_000n; // 10^6

type entryAction is
    Deposit of nat
|   Claim of unit
|   Withdraw of nat

(* Check and Get functions *)
function getDelegatorDeposit(const delegator: delegator; const s: storage): option(delegatorRecord) is
    Big_map.find_opt(delegator, s.delegators)

function checkSenderIsAdmin(const store: storage): unit is
  if Tezos.sender =/= store.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

(* Utils functions *)
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

(* updatePool function *)
function updatePool(const s: storage): storage is
    block{
        const newBlockUpdate: nat = Tezos.level;
        const lastBlockUpdate: nat = s.lastBlockUpdate;
        var updatedStorage: storage := s with record[lastBlockUpdate=newBlockUpdate];
        if updatedStorage.farmTokenBalance = 0n or newBlockUpdate = lastBlockUpdate then skip
        else{
            // Compute the potential reward of this block
            const potentialReward: tokenBalance = abs((newBlockUpdate - lastBlockUpdate) * updatedStorage.plannedRewards.rewardPerBlock);

            // This check is necessary in case updatePoolWithRewards was not called for a long time
            // and the outstandingReward grew to such a big number that it exceeds the planned rewards.
            // In that case only the differece between planned and claimed rewards is paid out to empty
            // the account.
            const claimedRewards: tokenBalance = updatedStorage.claimedRewards.paid + updatedStorage.claimedRewards.unpaid;
            const totalRewards: tokenBalance = potentialReward + claimedRewards;
            const totalPlannedRewards: tokenBalance = updatedStorage.plannedRewards.rewardPerBlock * updatedStorage.plannedRewards.totalBlocks;
            const newReward: tokenBalance =
                case totalRewards > totalPlannedRewards of
                    True -> abs(totalPlannedRewards - claimedRewards)
                |   False -> potentialReward
                end;

            // Updates the unpaid variable in the claimedRewards record of the storage
            const newClaimedRewards: claimedRewards = updatedStorage.claimedRewards with record[unpaid=updatedStorage.claimedRewards.unpaid + newReward];

            // Updates the accumulatedMVKPerShare of the storage
            const newAcculumatedMVKPerShare: tokenBalance = updatedStorage.accumulatedMVKPerShare + newReward * fixedPointAccuracy / updatedStorage.farmTokenBalance;

            // Updates the storage
            updatedStorage := updatedStorage with record[
                claimedRewards=newClaimedRewards;
                accumulatedMVKPerShare=newAcculumatedMVKPerShare;
            ]
        };
    } with(updatedStorage)

(* Entrypoints *)
function claim(const s: storage): return is
    block{
        // Update pool storage
        const updatedStorage: storage = updatePool(s);

        const delegator: delegator = Tezos.sender;

        // Check if sender as already a record
        const delegatorRecord: delegatorRecord =
            case getDelegatorDeposit(delegator, updatedStorage) of
                Some (r) -> r
            |   None -> (failwith("DELEGATOR_NOT_FOUND"): delegatorRecord)
            end;

        // Compute delegator reward
        const rewardDebt: tokenBalance = delegatorRecord.rewardDebt;
        const accumulatedMVKPerShare: tokenBalance = updatedStorage.accumulatedMVKPerShare;
        if rewardDebt > accumulatedMVKPerShare then failwith("The delegator reward debt is higher than the accumulated MVK per share") else skip;
        const delegatorAccumulatedMVKPerShare = abs(accumulatedMVKPerShare - rewardDebt);
        const delegatorReward = (delegatorAccumulatedMVKPerShare * delegatorRecord.balance) / fixedPointAccuracy;

        // Store new rewardDebt
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(delegator, Some (delegatorRecord with record[rewardDebt=accumulatedMVKPerShare]),  updatedStorage.delegators);

        // Update paid and unpaid rewards in storage
        if delegatorReward > updatedStorage.claimedRewards.unpaid then failwith("The delegator reward is higher than the unpaid reward") else skip;
        const newUnpaidRewards: tokenBalance = abs(updatedStorage.claimedRewards.unpaid - delegatorReward);
        const newPaidRewards: tokenBalance = updatedStorage.claimedRewards.paid + delegatorReward;
        const newClaimedRewards: claimedRewards = record[
            unpaid=newUnpaidRewards;
            paid=newPaidRewards;
        ];

        // Transfer sMVK rewards
        const mvkTokenContract: address = getGeneralContract("mvkToken",updatedStorage);
        const reserveContract: address = getGeneralContract("reserve",updatedStorage);
        const operation: operation = transferReward(reserveContract, delegator, delegatorReward, mvkTokenContract);
        const operations: list(operation) = list[operation];
    } with(operations, updatedStorage with record[delegators=newDelegators; claimedRewards=newClaimedRewards])

function deposit(const tokenAmount: tokenBalance; const s: storage): return is
    block{
        // Update pool storage
        const updatedStorage: storage = updatePool(s);

        // Delegator address
        const delegator: delegator = Tezos.sender;

        // Prepare to perform a claim if user already deposited tokens
        var delegatorClaim: return := (noOperations, updatedStorage);

        // Check if sender as already a record
        const existingDelegator: bool = Big_map.mem(delegator, updatedStorage.delegators);
        var delegatorRecord: delegatorRecord := record[balance=tokenAmount; rewardDebt=0n];
        if existingDelegator then {
            delegatorRecord := 
                case getDelegatorDeposit(delegator, updatedStorage) of
                    Some (d) -> d
                |   None -> failwith("Delegator not found")
                end;
            
            // Claim pending rewards
            delegatorClaim := claim(updatedStorage);

            // Update delegator token balance
            delegatorRecord.balance := delegatorRecord.balance + tokenAmount;
        }
        else skip;

        // Update delegators Big_map and farmTokenBalance
        const newFarmTokenBalance: tokenBalance = updatedStorage.farmTokenBalance + tokenAmount;
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(Tezos.sender, Some (delegatorRecord), updatedStorage.delegators);

        // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
        const operation: operation = transferLP(Tezos.sender, Tezos.self_address, tokenAmount, updatedStorage.lpToken.tokenId, updatedStorage.lpToken.tokenStandard, updatedStorage.lpToken.tokenAddress);
        const operations: list(operation) = operation # delegatorClaim.0;
    } with(operations, updatedStorage with record[farmTokenBalance=newFarmTokenBalance; delegators=newDelegators])

function withdraw(const tokenAmount: tokenBalance; const s: storage): return is
    block{
        // Update pool storage
        const updatedStorage: storage = updatePool(s);

        const delegator: delegator = Tezos.sender;

        // Prepare to perform a claim if user already deposited tokens
        const delegatorClaim: return = claim(updatedStorage);

        var delegatorRecord: delegatorRecord := 
            case getDelegatorDeposit(delegator, updatedStorage) of
                Some (d) -> d
            |   None -> failwith("DELEGATOR_NOT_FOUND")
            end;

        // Check if the delegator has enough token to withdraw
        if tokenAmount > delegatorRecord.balance then failwith("The amount withdrawn is higher than the delegator stake") else skip;
        const newDelegatorBalance: tokenBalance = abs(delegatorRecord.balance - tokenAmount);
        delegatorRecord := delegatorRecord with record[balance=newDelegatorBalance];
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(delegator, Some (delegatorRecord),updatedStorage.delegators);

        // Check if the farm has enough token
        if tokenAmount > updatedStorage.farmTokenBalance then failwith("The amount withdrawn is higher than the farm lp balance") else skip;
        const newFarmBalance: tokenBalance = abs(updatedStorage.farmTokenBalance - tokenAmount);
        
        // Transfer LP tokens to the user from the farm balance in the LP Contract
        const operation: operation = transferLP(
            Tezos.self_address,
            delegator,
            tokenAmount,
            updatedStorage.lpToken.tokenId, 
            updatedStorage.lpToken.tokenStandard,
            updatedStorage.lpToken.tokenAddress
        );
        const operations: list(operation) = operation # delegatorClaim.0;
    } with(operations, updatedStorage with record[farmTokenBalance=newFarmBalance; delegators=newDelegators])

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
    end
  )