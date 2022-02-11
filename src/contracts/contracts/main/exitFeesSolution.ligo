// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

////
// STORAGE
////
type userStakeBalanceRecord is record[
    balance: nat;
    participationFeesPerShare: nat;
]
type userStakeBalanceType is big_map(address, userStakeBalanceRecord)

type storage is record [
    generalContracts            : generalContractsType;
    userStakeBalanceLedger      : userStakeBalanceType;
    stakedMvkTotalSupply        : nat;
    accumulatedFeesPerShare     : nat;
    mli                         : nat;
]

////
// ACCURACY
////
const fixedPointAccuracy: nat = 1_000_000_000_000n // 10^12

////
// RETURN TYPES
////
(* define noop for readability *)
const noOperations : list (operation) = nil;
(* define return for readability *)
type return is list (operation) * storage

////
// INPUTS
////
(* Transfer FA2 inputs *)
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

(* getStakedBalance entrypoint inputs *)
type getStakedBalanceType is (address * contract(nat))

////
// ENTRYPOINTS
////
type action is
    Stake of nat
|   Unstake of nat
|   GetStakedBalance of getStakedBalanceType
|   SetMli of nat

////
// FUNCTIONS
////
(* Transfer MVK from an address to another *)
function transferMVK(const from_: address; const to_: address; const tokenAmount: nat; const s: storage): operation is
block{
    const mvkContractAddress: address = 
        case Map.find_opt("mvkToken", s.generalContracts) of
            Some (a) -> a
        |   None -> failwith("Error. MVK Token contract not found")
        end;

    const transferParams: transferType = list[
            record[
                from_=from_;
                txs=list[
                    record[
                        to_=to_;
                        token_id=0n;
                        amount=tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(transferType) =
        case (Tezos.get_entrypoint_opt("%transfer", mvkContractAddress): option(contract(transferType))) of
            Some (c) -> c
        |   None -> (failwith("Transfer entrypoint not found in MVK Token contract"): contract(transferType))
        end;
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

function getMvkTotalSupply(const tokenAddress : address) : contract(unit * contract(nat)) is
    case (Tezos.get_entrypoint_opt("%getTotalSupply",tokenAddress) : option(contract(unit * contract(nat)))) of
        Some (contr) -> contr
    |   None -> (failwith("GetTotalSupply entrypoint in MVK Token Contract not found") : contract(unit * contract(nat)))
    end

(* Return the userStakeBalanceRecord of a user and throw an error if it does not exist *)
function getUserStakeBalanceRecord(const s: storage): userStakeBalanceRecord is
    case Big_map.find_opt(Tezos.sender, s.userStakeBalanceLedger) of
        Some (u) -> u
    |   None -> (failwith("Error. User sMVK not found"): userStakeBalanceRecord)
    end

(* Update user sMVK balance based on his share on the stake pool *)
function updateUserBalance(var s: storage): storage is
    block{
        // User address
        const user: address = Tezos.sender;

        // Get the user's record, failed if it does not exists
        var userRecord: userStakeBalanceRecord := getUserStakeBalanceRecord(s);

        // Check if the user has more than 0MVK staked. If he/she hasn't, he cannot earn rewards
        if userRecord.balance > 0n then {
            // Calculate what fees the user missed since his/her last claim
            const currentFeesPerShare: nat = abs(s.accumulatedFeesPerShare - userRecord.participationFeesPerShare);
            // Calculate the user reward based on his sMVK
            const userRewards: nat = (currentFeesPerShare * userRecord.balance) / fixedPointAccuracy;
            // Increase the user balance
            userRecord.balance := userRecord.balance + userRewards;

            // Update the storage
            s.userStakeBalanceLedger := Big_map.update(user, Some (userRecord), s.userStakeBalanceLedger);
        }
        else skip;

        // Set the user's participationFeesPerShare 
        userRecord.participationFeesPerShare := s.accumulatedFeesPerShare;

        // Update the storage
        s.userStakeBalanceLedger := Big_map.update(user, Some (userRecord), s.userStakeBalanceLedger);
    } with(s)

(* setMLI entrypoint *)
function setMli(const totalSupply: nat; var s: storage): return is
    block{
        const cumulatedMVKSupply: nat = totalSupply + s.stakedMvkTotalSupply;
        s.mli := s.stakedMvkTotalSupply / cumulatedMVKSupply;
    } with(noOperations, s)

(* stake entrypoint *)
function stake(const tokenAmount: nat; var s: storage): return is
    block{
        // User address
        const user: address = Tezos.sender;

        // Check if the stake is greater than 1MVK (MVK has 6 decimals), if not it throws an error
        if tokenAmount < 100000n then failwith("Error. User must stake at least one MVK") else skip;

        // Check if the user already staked on the contract, if not it creates a record for him/her
        const userExists: bool = Big_map.mem(Tezos.sender, s.userStakeBalanceLedger);
        var userRecord: userStakeBalanceRecord := record[
            balance=0n;
            participationFeesPerShare=s.accumulatedFeesPerShare;    // Set the participationFeesPerShare so the user can't claim the past exit fees rewards
        ];
        if userExists then {
            s := updateUserBalance(s); // Update the storage according to the current user (calculate and add rewards to his account)
            userRecord := getUserStakeBalanceRecord(s);
        }
        else skip;

        // Increase the user stake balance
        userRecord.balance          := userRecord.balance + tokenAmount;

        // Update the storage with the updated user record and send the MVK amount from the user to the contract
        s.stakedMvkTotalSupply      := s.stakedMvkTotalSupply + tokenAmount;
        s.userStakeBalanceLedger    := Big_map.update(user, Some (userRecord), s.userStakeBalanceLedger);

        const transferOperation: operation = transferMVK(
            user,
            Tezos.self_address,
            tokenAmount,
            s
        )
    } with(list[transferOperation], s)

(* unstake entrypoint *)
function unstake(const tokenAmount: nat; var s: storage): return is
    block{
        // User address
        const user: address = Tezos.sender;

        // Check if user exists in storage ledger, throw an error if not
        const userExists: bool = Big_map.mem(Tezos.sender, s.userStakeBalanceLedger);
        if not userExists then failwith("Error. This user never staked MVK") else skip;

        // Update the storage according to the current user (calculate and add rewards to his account)
        s := updateUserBalance(s);

        // Get the user's record
        var userRecord: userStakeBalanceRecord := getUserStakeBalanceRecord(s);

        // Check if the user has the balance he wants to unstake, throw an error if he does not
        if userRecord.balance < tokenAmount then failwith("Error. The user wants to unstake more than he has") else skip;

        // Decrease the stake balance
        userRecord.balance          := abs(userRecord.balance - tokenAmount);

        // Calculate the Exit Fee
        const mvkTokenAddress: address = 
            case Map.find_opt("mvkToken", s.generalContracts) of
                Some (a) -> a
            |   None -> (failwith("Error. MVK Token contract not found in generalContracts."): address)
            end;
        const setMliCallback: contract(nat) = Tezos.self("%setMli");    
        const updateMvkTotalSupplyOperation: operation = Tezos.transaction(
            (unit, setMliCallback),
            0tez, 
            getMvkTotalSupply(mvkTokenAddress)
        );

        const exitFee: nat = tokenAmount * (500n / (s.mli + 5n)); // Fees with MLI calculation
        const stakedTotalWithoutUnstake: nat = abs(s.stakedMvkTotalSupply - tokenAmount);
        if stakedTotalWithoutUnstake > 0n then {
            // If there are still sMVK on the contract, update the accumulatedFeesPerShare of the storage
            s.accumulatedFeesPerShare := s.accumulatedFeesPerShare + ((exitFee * fixedPointAccuracy) / stakedTotalWithoutUnstake);
        }
        else skip;

        // Remove the fees from the unstake amount and send it to the user
        var unstakeAmount: nat := tokenAmount;
        unstakeAmount := abs(unstakeAmount - exitFee);

        // Update the storage
        s.stakedMvkTotalSupply      := abs(s.stakedMvkTotalSupply - unstakeAmount);
        s.userStakeBalanceLedger    := Big_map.update(user, Some (userRecord), s.userStakeBalanceLedger);
        
        const transferOperation: operation = transferMVK(
            Tezos.self_address,
            user,
            unstakeAmount,
            s
        );
    } with(list[transferOperation;updateMvkTotalSupplyOperation], s)

(* getStakedBalance entrypoint *)
function getStakedBalance(const getStakedBalanceParams: getStakedBalanceType; const s: storage): return is
    block {
        // User address
        const user: address = getStakedBalanceParams.0;

        // Look for the user's record in storage
        var userBalanceStakeRecord: nat := 
            case Big_map.find_opt(user, s.userStakeBalanceLedger) of
                Some (r) -> block{
                    // Compute the user's exit fees rewards without actually storing them
                    var userBalance: nat := r.balance;
                    const currentFeesPerShare: nat = abs(s.accumulatedFeesPerShare - r.participationFeesPerShare);
                    const userRewards: nat = (currentFeesPerShare * r.balance) / fixedPointAccuracy;

                    // Return the total sMVK Balance of the user
                    userBalance := userBalance + userRewards;
                } with(userBalance)
            |   None -> 0n
            end;
  } with (list[Tezos.transaction(userBalanceStakeRecord, 0tez, getStakedBalanceParams.1)], s)

(* Main entrypoint *)
function main (const action: action; const s: storage) : return is
    case action of
        Stake (parameters) -> stake(parameters, s)
    |   Unstake (parameters) -> unstake(parameters, s)
    |   GetStakedBalance (parameters) -> getStakedBalance(parameters, s)
    |   SetMli (parameters) -> setMli(parameters, s)
    end