
// #include "../partials/fa12/fa12_types.ligo"
// #include "../partials/fa2/fa2_types.ligo"

// type whitelistContractsType is set (address)
// type storage is record [
//     admin                 : address;
//     whitelistContracts    : whitelistContractsType;   // whitelist of contracts that can access treasury contract
//     glassBroken           : bool;
// ]

// type treasuryAction is 
//     | Default of (unit)
//     | UpdateWhitelistContracts of (address)
//     | Transfer of (nat)
//     | Second of (nat)

// const noOperations : list (operation) = nil;
// type return is list (operation) * storage

// // admin helper functions begin ---------------------------------------------------------
// function checkSenderIsAdmin(var s : storage) : unit is
//     if (Tezos.sender = s.admin) then unit
//         else failwith("Only the administrator can call this entrypoint.");

// function checkSenderIsWhitelistContract(var s : storage) : unit is
//     if (s.whitelistContracts contains Tezos.sender) then unit
//     else failwith("Only whitelisted contracts can call this entrypoint.");

// function checkNoAmount(const _p : unit) : unit is
//     if (Tezos.amount = 0tez) then unit
//         else failwith("This entrypoint should not receive any tez.");

// function checkGlassIsBroken(var s : storage) : unit is
//     if s.glassBroken = True then unit
//         else failwith("Error. Glass has not been broken");
// // admin helper functions end ---------------------------------------------------------

// function get_fa12_token_transfer_entrypoint(
//   const token           : address)
//                         : contract(fa12_transfer_type) is
//   case (Tezos.get_entrypoint_opt("%transfer", token) : option(contract(fa12_transfer_type))) of
//   | Some(contr) -> contr
//   | None        -> (failwith("Error. FA12 Token transfer entrypoint is not found.") : contract(fa12_transfer_type))
//   end

// function get_fa2_token_transfer_entrypoint(const token : address) : contract(fa2_transfer_type) is
//   case (Tezos.get_entrypoint_opt("%transfer", token) : option(contract(fa2_transfer_type))) of
//   | Some(contr) -> contr
//   | None        -> (failwith("Error. FA2 Token transfer entrypoint is not found.") : contract(fa2_transfer_type))
//   end

// [@inline] function wrap_fa12_transfer_trx(const from_ : address; const to_ : address; const amt : nat) : fa12_transfer_type is FA12_transfer(from_, (to_, amt))

// [@inline] function wrap_fa2_transfer_trx(
//   const from_           : address;
//   const to_             : address;
//   const amt             : nat;
//   const id              : fa2_token_id_type)
//                         : fa2_transfer_type is
//   FA2_transfer(
//     list [
//       record [
//         from_ = from_;
//         txs   = list [
//           record [
//             to_      = to_;
//             token_id = id;
//             amount   = amt;
//           ]
//         ];
//       ]
//     ]
//   )

// function transfer_tez(
//   const to_             : contract(unit);
//   const amt             : nat)
//                         : operation is
//   Tezos.transaction(unit, amt * 1mutez, to_)

// function transfer_fa12(
//   const from_           : address;
//   const to_             : address;
//   const amt             : nat;
//   const token           : address)
//                         : operation is
//   Tezos.transaction(
//     wrap_fa12_transfer_trx(from_, to_, amt),
//     0mutez,
//     get_fa12_token_transfer_entrypoint(token)
//   )

// function transfer_fa2(
//   const from_           : address;
//   const to_             : address;
//   const amt             : nat;
//   const token           : address;
//   const id              : fa2_token_id_type)
//                         : operation is
//   Tezos.transaction(
//     wrap_fa2_transfer_trx(from_, to_, amt, id),
//     0mutez,
//     get_fa2_token_transfer_entrypoint(token)
//   )

// function transfer_token(
//   const from_           : address;
//   const to_             : address;
//   const amt             : nat;
//   const token           : token_t)
//                         : operation is
//   case token of
//   | Tez         -> transfer_tez((get_contract(to_) : contract(unit)), amt)
//   | Fa12(token) -> transfer_fa12(from_, to_, amt, token)
//   | Fa2(token)  -> transfer_fa2(from_, to_, amt, token.token, token.id)
//   end


// function default(var s : storage) : return is 
// block {
//     skip
// } with (noOperations, s)

// // toggle adding and removal of whitelist contract addresses
// function updateWhitelistContracts(const contractName : string; const contractAddress : address; const store : storage) : return is 
// block{

//     checkNoAmount(Unit);   // entrypoint should not receive any tez amount
//     checkSenderIsAdmin(store); // check that sender is admin
    
//     const exitingAddress: option(address) = 
//       if checkInWhitelistContracts(contractAddress, store) then (None : option(address)) else Some (contractAddress);

//     const updatedWhitelistedContracts: whitelistContractsType = 
//       Map.update(
//         contractName, 
//         exitingAddress,
//         store.whitelistContracts
//       );
//   } with (noOperations, store with record[whitelistContracts=updatedWhitelistedContracts]) 

// function transfer(const _proposal : nat ; var s : storage) : return is 
// block {
//     // Steps Overview:
//     // 1. 
//     // 2. 
//     skip

// } with (noOperations, s)

// function second(const _parameters : nat; var s : storage) : return is 
// block {
//     // Steps Overview:
//     // 1. 
//     // 2.
    
//     skip
// } with (noOperations, s)

// function main (const action : treasuryAction; const s : storage) : return is 
//     case action of
//         | Default(parameters) -> default(parameters, s)
//         | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
//         | Transfer(parameters) -> transfer(parameters, s)
//         | Second(parameters) -> second(parameters, s)
//     end