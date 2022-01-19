// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Types
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

type transferType is record[
        from_: address;
        to_: address;
        value: token_balance;
    ]

type tempTransferType is list(
        record[
            from_: address;
            txs: list(
                record[
                    to_: address;
                    amount: nat; 
                    token_id: nat;
                ]
            )
        ]
    )

type storage is record[
    admin                   : address;
    whitelistContracts      : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts        : generalContractsType;

    lastBlockUpdate         : nat;
    accumulatedMVKPerShare  : token_balance;
    claimedRewards          : claimedRewards;
    plannedRewards          : plannedRewards;
    delegators              : big_map(delegator, delegatorRecord);
    farmTokenBalance        : token_balance;
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
function transferLP(const from_: address; const to_: address; const tokenAmount: token_balance; const tokenContractAddress: address): operation is
    block{
        const transferParams: transferType = record[
            from_=from_;
            to_=to_;
            value=tokenAmount;
        ];

        const tokenContract: contract(transferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(transferType))) of
                Some (c) -> c
            |   None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(transferType))
            end;
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

function transferReward(const reserveAddress: address; const to_: address; const tokenAmount: token_balance; const rewardTokenContract: address): operation is
    block{
        const transferParams: tempTransferType = list[
            record[
                from_=reserveAddress;
                txs=list[
                    record[
                        to_=to_;
                        amount=tokenAmount;
                        token_id=0n;
                    ]
                ]
            ]
        ];

        // For now it only transfers MVK to the user for the reserve
        const tokenContract: contract(tempTransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", rewardTokenContract): option(contract(tempTransferType))) of
                Some (c) -> c
            |   None -> (failwith("ENTRYPOINT_NOT_FOUND"): contract(tempTransferType))
            end;
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

(* updatePool function *)
function updatePool(const s: storage): storage is
    block{
        const newLastBlockUpdate: nat = Tezos.level;
        var updatedStorage: storage := s with record[lastBlockUpdate=newLastBlockUpdate];
        if s.farmTokenBalance = 0n or newLastBlockUpdate = s.lastBlockUpdate then skip
        else{
            // Compute the potential reward of this block
            const potentialReward: token_balance = abs((newLastBlockUpdate - s.lastBlockUpdate) * s.plannedRewards.rewardPerBlock);

            // This check is necessary in case updatePoolWithRewards was not called for a long time
            // and the outstandingReward grew to such a big number that it exceeds the planned rewards.
            // In that case only the differece between planned and claimed rewards is paid out to empty
            // the account.
            const claimedRewards: token_balance = s.claimedRewards.paid + s.claimedRewards.unpaid;
            const totalRewards: token_balance = potentialReward + claimedRewards;
            const totalPlannedRewards: token_balance = s.plannedRewards.rewardPerBlock * s.plannedRewards.totalBlocks;
            const newReward: token_balance =
                case totalRewards > totalPlannedRewards of
                    True -> abs(totalPlannedRewards - claimedRewards)
                |   False -> potentialReward
                end;

            // Updates the unpaid variable in the claimedRewards record of the storage
            const newClaimedRewards: claimedRewards = s.claimedRewards with record[unpaid=s.claimedRewards.unpaid + newReward];

            // Updates the accumulatedMVKPerShare of the storage
            const fixedPointAccuracy: nat = 100000000000000000n; // 10^18
            const newAcculumatedMVKPerShare: token_balance = s.accumulatedMVKPerShare + newReward * fixedPointAccuracy / s.farmTokenBalance;

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
            case getDelegatorDeposit(delegator, s) of
                Some (r) -> r
            |   None -> (failwith("DELEGATOR_NOT_FOUND"): delegatorRecord)
            end;

        // Compute delegator reward
        const rewardDebt: token_balance = delegatorRecord.rewardDebt;
        const accumulatedMVKPerShare: token_balance = s.accumulatedMVKPerShare;
        if rewardDebt > accumulatedMVKPerShare then failwith("NOT_ENOUGH_BALANCE") else skip;
        const fixedPointAccuracy: nat = 100000000000000000n; // 10^18
        const delegatorAccumulatedMVKPerShare = abs(accumulatedMVKPerShare - rewardDebt);
        const delegatorReward = (delegatorAccumulatedMVKPerShare * delegatorRecord.balance) / fixedPointAccuracy;

        // Compute new rewardDebt
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(delegator, Some (delegatorRecord with record[rewardDebt=accumulatedMVKPerShare]),  s.delegators);

        // Transfer sMVK rewards
        const mvkTokenContract: address = getGeneralContract("mvkToken",s);
        const reserveContract: address = getGeneralContract("reserve",s);
        const operation: operation = transferReward(reserveContract, delegator, delegatorReward, mvkTokenContract);
        const operations: list(operation) = list[operation];
    } with(operations, updatedStorage with record[delegators=newDelegators])

function deposit(const tokenAmount: token_balance; const s: storage): return is
    block{
        // Update pool storage
        const updatedStorage: storage = updatePool(s);

        const delegator: delegator = Tezos.sender;

        // Prepare to perform a claim if user already deposited tokens
        var delegatorClaim: return := (noOperations, s);

        // Check if sender as already a record
        const existingDelegator: bool = Big_map.mem(delegator, s.delegators);
        var delegatorRecord: delegatorRecord := record[balance=tokenAmount; rewardDebt=0n];
        if existingDelegator then {
            delegatorRecord := 
                case getDelegatorDeposit(delegator, s) of
                    Some (d) -> d
                |   None -> failwith("Delegator not found")
                end;
            delegatorClaim := claim(s);
        }
        else skip;

        // Update delegators Big_map and farmTokenBalance
        const newFarmTokenBalance: token_balance = updatedStorage.farmTokenBalance + tokenAmount;
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(Tezos.sender, Some (delegatorRecord), updatedStorage.delegators);

        // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
        const lpTokenContract: address = getGeneralContract("lpToken",s);
        const operation: operation = transferLP(Tezos.sender, Tezos.self_address, tokenAmount, lpTokenContract);
        const operations: list(operation) = operation # delegatorClaim.0;
    } with(operations, updatedStorage with record[farmTokenBalance=newFarmTokenBalance; delegators=newDelegators])

function withdraw(const tokenAmount: token_balance; const s: storage): return is
    block{
        // Update pool storage
        const updatedStorage: storage = updatePool(s);

        const delegator: delegator = Tezos.sender;

        // Prepare to perform a claim if user already deposited tokens
        const delegatorClaim: return = claim(s);

        var delegatorRecord: delegatorRecord := 
            case getDelegatorDeposit(delegator, s) of
                Some (d) -> d
            |   None -> failwith("DELEGATOR_NOT_FOUND")
            end;

        // Check if the delegator has enough token to withdraw
        if tokenAmount > delegatorRecord.balance then failwith("NOT_ENOUGH_BALANCE") else skip;
        const newDelegatorBalance: token_balance = abs(delegatorRecord.balance - tokenAmount);
        delegatorRecord := delegatorRecord with record[balance=newDelegatorBalance];
        const newDelegators: big_map(delegator, delegatorRecord) = Big_map.update(delegator, Some (delegatorRecord),updatedStorage.delegators);

        // Check if the farm has enough token
        if tokenAmount > updatedStorage.farmTokenBalance then failwith("NOT_ENOUGH_BALANCE") else skip;
        const newFarmBalance: token_balance = abs(updatedStorage.farmTokenBalance - tokenAmount);
        
        // Transfer LP tokens to the user from the farm balance in the LP Contract
        const lpTokenContract: address = getGeneralContract("lpToken",s);
        const operation: operation = transferLP(
            Tezos.self_address,
            delegator,
            tokenAmount,
            lpTokenContract
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