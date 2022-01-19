type delegator is address
type token_balance is nat

type delegatorRecord is record[
    balance: token_balance;
    rewardDebt: token_balance;
]
type claimedRewards is record[
    unpaid: token_balance;
    paid: token_balance;
]
type plannedRewards is record[
    totalBlocks: nat;
    rewardPerBlock: token_balance;
]

type transfer is record[
    from_: address;
    to_: address;
    value: token_balance;
]

type storage is record[
    lastBlockUpdate: nat;
    accumulatedMVKPerShare: token_balance;
    claimedRewards: claimedRewards;
    plannedRewards: plannedRewards;
    delegators: big_map(delegator, delegatorRecord);
    lpTokenContract: address;
    farmTokenBalance: token_balance;
    mvkTokenContract: address;
    rewardReserveContract: address // useful?
]

(* define return for readability *)
type return is list (operation) * storage

(* define noop for readability *)
const noOperations : list (operation) = nil;

type entryAction is
    Deposit of nat
|   Claim of unit
|   Withdraw of nat

(* Check and Get functions *)
function getDelegatorDeposit(const delegator: delegator; const store: storage): option(delegatorRecord) is
    Big_map.find_opt(delegator, store.delegators)

(* Utils functions *)
function transfer(const from_: address; const to_: address; const tokenAmount: token_balance; const tokenContractAddress: address): operation is
    block{
        const transferParams: transfer = record[
            from_=from_;
            to_=to_;
            value=tokenAmount;
        ];

        const tokenContract: contract(transfer) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(transfer))) of
                Some (c) -> c
            |   None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(transfer))
            end;
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

(* updatePool function *)
function updatePool(const store: storage): storage is
    block{
        const newLastBlockUpdate: nat = Tezos.level;
        var updatedStore: storage := store with record[lastBlockUpdate=newLastBlockUpdate];
        if store.farmTokenBalance = 0n or newLastBlockUpdate = store.lastBlockUpdate then skip
        else{
            // Compute the potential reward of this block
            const potentialReward: token_balance = abs((newLastBlockUpdate - store.lastBlockUpdate) * store.plannedRewards.rewardPerBlock);

            // This check is necessary in case updatePoolWithRewards was not called for a long time
            // and the outstandingReward grew to such a big number that it exceeds the planned rewards.
            // In that case only the differece between planned and claimed rewards is paid out to empty
            // the account.
            const claimedRewards: token_balance = store.claimedRewards.paid + store.claimedRewards.unpaid;
            const totalRewards: token_balance = potentialReward + claimedRewards;
            const totalPlannedRewards: token_balance = store.plannedRewards.rewardPerBlock * store.plannedRewards.totalBlocks;
            const newReward: token_balance =
                case totalRewards > totalPlannedRewards of
                    True -> abs(totalPlannedRewards - claimedRewards)
                |   False -> potentialReward
                end;

            // Updates the unpaid variable in the claimedRewards record of the storage
            const newClaimedRewards: claimedRewards = store.claimedRewards with record[unpaid=store.claimedRewards.unpaid + newReward];

            // Updates the accumulatedMVKPerShare of the storage
            const fixedPointAccuracy: nat = 100000000000000000n; // 10^18
            const newAcculumatedMVKPerShare: token_balance = store.accumulatedMVKPerShare + newReward * fixedPointAccuracy / store.farmTokenBalance;

            // Updates the storage
            updatedStore := updatedStore with record[
                claimedRewards=newClaimedRewards;
                accumulatedMVKPerShare=newAcculumatedMVKPerShare;
            ]
        };
    } with(updatedStore)

(* Entrypoints *)
function claim(const store: storage): return is
    block{
        // Update pool storage
        const updatedStorage: storage = updatePool(store);

        const delegator: delegator = Tezos.sender;

        // Check if sender as already a record
        const delegatorRecord: delegatorRecord =
            case getDelegatorDeposit(delegator, store) of
                Some (r) -> r
            |   None -> (failwith("DELEGATOR_NOT_FOUND"): delegatorRecord)
            end;

        // Compute delegator reward
        const rewardDebt: token_balance = delegatorRecord.rewardDebt;
        const accumulatedMVKPerShare: token_balance = store.accumulatedMVKPerShare;
        if rewardDebt > accumulatedMVKPerShare then failwith("NOT_ENOUGH_BALANCE") else skip;
        const fixedPointAccuracy: nat = 100000000000000000n; // 10^18
        const delegatorAccumulatedMVKPerShare = abs(accumulatedMVKPerShare - rewardDebt);
        const delegatorReward = (delegatorAccumulatedMVKPerShare * delegatorRecord.balance) / fixedPointAccuracy;

        // Compute new rewardDebt
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(delegator, Some (delegatorRecord with record[rewardDebt=accumulatedMVKPerShare]),  store.delegators);

        // Transfer operation
        const operation: operation = transfer(store.rewardReserveContract, delegator, delegatorReward, store.mvkTokenContract);

    } with(noOperations, store)

function deposit(const tokenAmount: token_balance; const store: storage): return is
    block{
        // Update pool storage
        const updatedStorage: storage = updatePool(store);

        // Prepare to perform a claim if user already deposited tokens
        var delegatorClaim: return := (noOperations, store);

        // Check if sender as already a record
        const delegatorRecord: delegatorRecord =
            case getDelegatorDeposit(Tezos.sender, store) of
                Some (r) -> block{
                    // Perform a claim
                    delegatorClaim := claim(store);
                } with (r)
            |   None -> record[balance=tokenAmount; rewardDebt=0n]
            end;

        // Update delegators Big_map and farmTokenBalance
        const newFarmTokenBalance: token_balance = store.farmTokenBalance + tokenAmount;
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(Tezos.sender, Some (delegatorRecord), store.delegators);

        // Transfer tokens from sender to farm balance in LP Contract (use Allowances or Operators depending if the LP is FA12 or FA2 contract)
        const operation: operation = transfer(Tezos.sender, Tezos.self_address, tokenAmount, store.lpTokenContract);

    } with(operation # delegatorClaim.0, store with record[farmTokenBalance=newFarmTokenBalance; delegators=newDelegators])

function withdraw(const tokenAmount: token_balance; const store: storage): return is
    block{
        // Update pool storage
        const updatedStorage: storage = updatePool(store);

        const delegator: delegator = Tezos.sender;

        // Prepare to perform a claim if user already deposited tokens
        const delegatorClaim: return = claim(store);

        var delegatorRecord: delegatorRecord := 
            case getDelegatorDeposit(delegator, store) of
                Some (d) -> d
            |   None -> failwith("DELEGATOR_NOT_FOUND")
            end;

        // Check if the delegator has enough token to withdraw
        if tokenAmount > delegatorRecord.balance then failwith("NOT_ENOUGH_BALANCE") else skip;
        const newDelegatorBalance: token_balance = abs(delegatorRecord.balance - tokenAmount);
        delegatorRecord := delegatorRecord with record[balance=newDelegatorBalance];
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(delegator, Some (delegatorRecord),store.delegators);

        // Check if the farm has enough token
        if tokenAmount > store.farmTokenBalance then failwith("NOT_ENOUGH_BALANCE") else skip;
        const newFarmBalance: token_balance = abs(store.farmTokenBalance - tokenAmount);
        
        // Transfer tokens
        const operation: operation = transfer(
            Tezos.self_address,
            delegator,
            tokenAmount,
            store.lpTokenContract
        )
    } with(operation # delegatorClaim.0, store with record[farmTokenBalance=newFarmBalance; delegators=newDelegators])

(* Main entrypoint *)
function main (const action: entryAction; var store: storage): return is
    case action of
        Deposit (params) -> deposit(params, store)
    |   Claim (_params) -> claim(store)
    |   Withdraw (params) -> withdraw(params, store)
    end;