type onStakeChangeParams is (address * nat * nat)
type burnTokenType is (address * nat)
type mintTokenType is (address * nat)

type delegationAction is 
    | SetDelegate of (address)
    // | SetDelegateComplete of (nat * address)
    | UnsetDelegate of (address)
    | RegisterAsSatellite of (unit)
    | RegisterAsSatelliteComplete of (nat)
    | UnregisterAsSatellite of (unit)
    | DecreaseSatelliteBond of (nat)
    | IncreaseSatelliteBond of (nat)
    | SetVMvkTokenAddress of (address)
    | OnStakeChange of onStakeChangeParams
    | OnGovernanceAction of (address)    // callback to check if satellite has sufficient bond and is not overdelegated

// record for users choosing satellites 
type delegateRecordType is record [
    // status               : nat; // active / inactive
    satelliteAddress     : address;
    delegatedDateTime    : timestamp;
    // amountStaked         : nat; // may not be used if we just look at vMVK - single source of truth will be delegate's vMVK balance
]
type delegateLedgerType is big_map (address, delegateRecordType)

// record for satellites
type satelliteRecordType is record [
    status                : nat;        // active: 1;
    bondAmount            : nat;        // to be removed? use vMVK balance as single source of truth  - sMVK
    bondSufficiency       : nat;        // bond sufficiency flag - set to 1 if satellite has enough bond; set to 0 if satellite has not enough bond (over-delegated) when checked on governance action
    registeredDateTime    : timestamp;
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // total delegated amount from delegates - 
]
type satelliteLedgerType is big_map (address, satelliteRecordType)

type configType is record [
    minimumSatelliteBond   : nat;  // minimum amount of vMVK required as bong to register as delegate (in muMVK)
    selfBondPercentage     : nat;  // percentage to determine if satellite is overdelegated (requires more vMVK to be staked) or underdelegated
]

type storage is record [
    admin                : address;
    config               : configType;
    delegateLedger       : delegateLedgerType;
    satelliteLedger      : satelliteLedgerType;
    vMvkTokenAddress     : address;
    sMvkTokenAddress     : address;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// helper function to receive staked vMVK amount from vMVK contract and complete set delegate
// function delegateCompleteEntrypoint(const stakedAmount : nat) : option((contract(nat)) is
//   case (Tezos.get_entrypoint_opt(
//       "%setDelegateComplete",
//       Tezos.self_address) : (contract(nat))) of
//     Some(contr) -> contr
//   | None -> (failwith("SetDelegateComplete entrypoint in Delegation Contract not found") : contract(nat))
//   end;

// helper function to get User's vMVK balance for delegation
function updateUserVMvkBalanceForDelegation(const tokenAddress : address) : contract(address * address) is
  case (Tezos.get_entrypoint_opt(
      "%updateVMvkBalanceForDelegate",
      tokenAddress) : option(contract(address * address))) of
    Some(contr) -> contr
  | None -> (failwith("UpdateVMvkBalanceForDelegate entrypoint in vMVK Token Contract not found") : contract(address * address))
  end;

// helper function to get User's vMVK balance from vMVK token address
function fetchVMvkBalance(const tokenAddress : address) : contract(address * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getBalance",
      tokenAddress) : option(contract(address * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetBalance entrypoint in vMVK Token Contract not found") : contract(address * contract(nat)))
  end;

  // helper function to get burn entrypoint from token address
function getBurnEntrypointFromTokenAddress(const tokenAddress : address) : contract(burnTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%burn",
      tokenAddress) : option(contract(burnTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Burn entrypoint not found") : contract(burnTokenType))
  end;

(* Helper function to burn mvk/vmvk tokens *)
function burnTokens(
  const from_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    (from_, amount_),
    0tez,
    getBurnEntrypointFromTokenAddress(tokenAddress)
  );

// helper function to get mint entrypoint from token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintTokenType) is
  case (Tezos.get_entrypoint_opt(
      "%mint",
      token_address) : option(contract(mintTokenType))) of
    Some(contr) -> contr
  | None -> (failwith("Mint entrypoint not found") : contract(mintTokenType))
  end;

(* Helper function to mint mvk/vmvk tokens *)
function mintTokens(
  const to_ : address;
  const amount_ : nat;
  const tokenAddress : address) : operation is
  Tezos.transaction(
    (to_, amount_),
    0tez,
    getMintEntrypointFromTokenAddress(tokenAddress)
  );

(* Helper function to get satellite *)
function getSatelliteAccount (const satelliteAddress : address; const s : storage) : satelliteRecordType is
  block {
    var satelliteAccount : satelliteRecordType :=
      record [
        status                = 1n;        
        bondAmount            = 1n;        
        bondSufficiency       = 1n;        
        registeredDateTime    = Tezos.now;
        satelliteFee          = 1n;    
        totalDelegatedAmount  = 1n;
      ];

    case s.satelliteLedger[satelliteAddress] of
      None -> skip
    | Some(instance) -> satelliteAccount := instance
    end;
  } with satelliteAccount


(* set vMvk contract address *)
function setVMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.vMvkTokenAddress := parameters;
} with (noOperations, s)

function setDelegate(const satelliteAddress : address; var s : storage) : return is 
block {

    var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of
         Some(_val) -> _val
        | None -> failwith("Satellite does not exist")
    end;

    var _checkDelegateExistsInDelegateLedger : delegateRecordType := case s.delegateLedger[Tezos.sender] of
         Some(_val) -> _val
        | None -> record [
            satelliteAddress   = satelliteAddress; 
            delegatedDateTime  = Tezos.now;
        ]
    end;

} with (noOperations, s)


function unsetDelegate(const satelliteAddress : address; var s : storage) : return is
block {

    // Overall steps:
    // 1. check if user address exists in delegateLedger
    // 2. check if satellite exists in satelliteLedger
    // 3. remove user's record in delegate ledger 
    
    var _checkDelegateExistsInDelegateLedger : delegateRecordType := case s.delegateLedger[Tezos.sender] of
         Some(_val) -> _val
        | None -> failwith("User wallet address not found.")
    end;

    var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of
         Some(_val) -> _val
        | None -> failwith("Satellite does not exist")
    end;

    // remove user record in delegate ledger - if records are kept, change status; if not reset record
    // s.delegateLedger[Tezos.sender]

} with (noOperations, s)


function registerAsSatellite(var s : storage) : return is 
block {
    
    // Overall steps: 
    // 1. verify user vMVK balance -> proxy call to get user vMVK balance in vMVK contract
    // 2. lock user vMVK balance in vMVK contract - hence unstake in doorman contract will not be possible - mint sMVK
    // 3. if user vMVK balance is more than minimumDelegateBond, register as delegate

    // from notes: Any stakeholder with sufficient vMVK balance can register as a delegate. 
    // Automatically his vMVK is considered as a locked bond / own stake.
    //  It is imporant to note that the locked bond limits the size of overall delegations/stake that a single delegate can accept. 
    // This introduces a certain dynamic into the tokenomics, in order to achieve an even distribution of voting power within the system.

    case s.satelliteLedger[Tezos.sender] of
          None -> skip
        | Some(_val) -> failwith("Satellite address already exists.")
    end;

    const registerDelegateCompleteCallback : contract(nat) = Tezos.self("%registerAsSatelliteComplete");

    const checkVMvkBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, registerDelegateCompleteCallback),
         0tez, 
         fetchVMvkBalance(s.vMvkTokenAddress)
         );
    
    const operations : list(operation) = list [checkVMvkBalanceOperation];

} with (operations, s)

function registerAsSatelliteComplete(const vMvkBalance : nat; var s : storage) : return is 
block {
    
    // lock satellite's vMVK amount -> bond? 
    if vMvkBalance < s.config.minimumSatelliteBond then failwith("You do not have enough vMVK to meet the minimum delegate bond.")
      else skip;

    // temp disable check sender address in vMVK and sMVK token contracts
    // need to refactor to a whitelist check since there are multiple contracts referring to the burn/mint entrypoints

    const burnVMvkTokensOperation : operation = burnTokens(
      Tezos.source,         // from address
      vMvkBalance,          // amount of vMVK Tokens to be burned
      s.vMvkTokenAddress);  // vMmvkTokenAddress

    const mintSMvkTokensOperation : operation = mintTokens(
      Tezos.source,        // to address
      vMvkBalance,         // amount of sMVK Tokens to be minted
      s.sMvkTokenAddress); // sMvkTokenAddress

    // list of operations: burn vMVk tokens first, then mint sMVK tokens
    const operations : list(operation) = list [burnVMvkTokensOperation; mintSMvkTokensOperation];

    // add new satellite record
    var newSatelliteRecord : satelliteRecordType := record[            
            status               = 1n;
            bondAmount           = vMvkBalance;  // bond - all locked
            bondSufficiency      = 1n;
            registeredDateTime   = Tezos.now;
            satelliteFee         = 0n;
            totalDelegatedAmount = 0n;
        ];

    s.satelliteLedger[Tezos.source] := newSatelliteRecord;

} with (operations, s)


function unregisterAsSatellite(var s : storage) : return is
block {
    // Overall steps:
    // 1. check if satellite exists in satelliteLedger
    // 2. remove satellite from user delegateLedger
    // 3. burn sMVK and return satellite's vMvk
    // 4. update satellite status in satelliteLedger as removed
    
    var checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
          Some(_val) -> _val
        | None -> failwith("Satellite address does not exist.")
    end;

    // todo: 2. remove satellite from user delegateLedger - loop

    const satelliteBondAmount = checkSatelliteExists.bondAmount;

    const burnSMvkTokensOperation : operation = burnTokens(
      Tezos.sender,         // from address
      satelliteBondAmount,  // amount of sMVK Tokens to be burned
      s.sMvkTokenAddress);  // sMvkTokenAddress

    const mintVMvkTokensOperation : operation = mintTokens(
      Tezos.sender,        // to address
      satelliteBondAmount, // amount of vMVK Tokens to be minted
      s.vMvkTokenAddress); // vMvkTokenAddress

    // list of operations: burn sMVK tokens first, then mint vMVK tokens
    const operations : list(operation) = list [burnSMvkTokensOperation; mintVMvkTokensOperation];

    remove (Tezos.sender : address) from map s.satelliteLedger

} with (operations, s)

function decreaseSatelliteBond(const bondAmountChange : nat; var s : storage) : return is
block {

    // Overall steps:
    // 1. check if satellite exists in satelliteLedger
    // 2. check that withdrawal does not cause satellite to go below minimum bond required
    // 3. decrease bond - burn sMVK / mint vMVK
    
    var checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
          Some(_val) -> _val
        | None -> failwith("Satellite address does not exist.")
    end;

    const currentBondAmount : nat = checkSatelliteExists.bondAmount;
    
    // check that currentBondAmount is greater than amount to be withdrawn
    if currentBondAmount < bondAmountChange then failwith("You do not have enough bond.")
      else skip;
    
    const bondAmountAfterChange : nat = abs(currentBondAmount - bondAmountChange); 

    // check that satellite still has enough bond to satisfy minimum Satellite bond requirements
    if bondAmountAfterChange < s.config.minimumSatelliteBond then failwith("You need sufficient bond to be a satellite.")
      else skip;

    const burnSMvkTokensOperation : operation = burnTokens(
      Tezos.sender,         // from address
      bondAmountChange,     // amount of sMVK Tokens to be burned
      s.sMvkTokenAddress);  // sMvkTokenAddress

    const mintVMvkTokensOperation : operation = mintTokens(
      Tezos.sender,        // to address
      bondAmountChange,    // amount of vMVK Tokens to be minted
      s.vMvkTokenAddress); // vMvkTokenAddress

    // list of operations: burn mvk tokens first, then mint vmvk tokens
    const operations : list(operation) = list [burnSMvkTokensOperation; mintVMvkTokensOperation];

    // save changes to satellite in ledger
    checkSatelliteExists.bondAmount := bondAmountAfterChange;
    s.satelliteLedger[Tezos.sender] := checkSatelliteExists;

} with (operations, s)

function increaseSatelliteBond(const bondAmountChange : nat; var s : storage) : return is
block {

    // Overall steps:
    // 1. check if satellite exists in satelliteLedger
    // 2. increase bond - burn vMVK / mint sMVK
    var checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
          Some(_val) -> _val
        | None -> failwith("Satellite address does not exist.")
    end;

    const currentBondAmount : nat = checkSatelliteExists.bondAmount;

    const bondAmountAfterChange : nat = currentBondAmount + bondAmountChange; 

    const burnVMvkTokensOperation : operation = burnTokens(
      Tezos.sender,         // from address
      bondAmountChange,     // amount of vMVK Tokens to be burned
      s.vMvkTokenAddress);  // vMvkTokenAddress

    const mintSMvkTokensOperation : operation = mintTokens(
      Tezos.sender,        // to address
      bondAmountChange,    // amount of sMVK Tokens to be minted
      s.sMvkTokenAddress); // sMvkTokenAddress

    // list of operations: burn mvk tokens first, then mint vmvk tokens
    const operations : list(operation) = list [burnVMvkTokensOperation; mintSMvkTokensOperation];

    // save changes to satellite in ledger
    checkSatelliteExists.bondAmount := bondAmountAfterChange;
    s.satelliteLedger[Tezos.sender] := checkSatelliteExists;

} with (operations, s)


function onStakeChange(const userAddress : address; const stakeAmount : nat; const stakeType : nat; var s : storage) : return is 
block {
    // Overall steps:
    // 1. verify that user (from_) has staked vMVK with a satellite
    // 2. change the amount staked with the satellite (type 1 to increase, type 0 to decrease)
    
    // var userRecord : delegateRecordType := case s.delegateLedger[userAddress] of
    //       Some(_record) -> _record
    //     | None -> failwith("User record not found.") // check if this can be changed to null
    // end;

    // var userRecord : delegateRecordType := record [
    //     satelliteAddress  = "";
    //     delegatedDateTime = Tezos.now;
    // ]
    
    var userRecord : delegateRecordType := case s.delegateLedger[userAddress] of          
        | Some(_record) -> _record
        | None -> failwith("test")
    end;

    var satelliteRecord : satelliteRecordType := case s.satelliteLedger[userRecord.satelliteAddress] of
         Some(_val) -> _val
        | None -> failwith("satellite does not exist") // check if this can be changed to null
    end;

    var totalDelegatedAmount : nat := satelliteRecord.totalDelegatedAmount;

    // if stakeType = 1, increment totalDelegatedAmount (i.e. mint vMVK, burn MVK)
    if stakeType = 1n then totalDelegatedAmount := totalDelegatedAmount + stakeAmount
      else skip;

    // check that stakeAmount <= totalDelegatedAmount

    // if stakeType = 0, decrement totalDelegatedAmount (i.e. burn vMVK, mint MVK)
    if stakeType = 0n then totalDelegatedAmount := abs(totalDelegatedAmount - stakeAmount)
      else skip;

    // save satellite record
    satelliteRecord.totalDelegatedAmount := totalDelegatedAmount; 
    s.satelliteLedger[userRecord.satelliteAddress] := satelliteRecord; 

} with (noOperations, s)

function onGovernanceAction(const satelliteAddress : address; var s : storage) : return is 
block {
    
    // Overall steps:
    // 1. check if satellite has sufficient bond
    //    - needs a loop to find all delegates of the satellite, and retrieve vMVK balance for each delegate
    // 2. perform governance action if satellite has sufficient bond - proxy call to governance contract to execute? 
    //    - pass back a callback operation

    // Retrieve satellite account from storage
    var satelliteAccount : satelliteRecordType := getSatelliteAccount(satelliteAddress, s);

    // check if minimum bond has been reached (units are in mu)
    if satelliteAccount.bondAmount < s.config.minimumSatelliteBond then failwith("Insufficient satellite bond - minimum bond not reached.")
      else skip;

    // check bond sufficiency using fixed point arithmetic 
    // percentage stored: 10% -> 10000
    // total amount that can be staked = bond / delegationPercentage 
    // check for division accuracy

    const bondAmount : nat           = satelliteAccount.bondAmount;
    const totalDelegatedAmount : nat = satelliteAccount.totalDelegatedAmount;
    const selfBondPercentage : nat   = s.config.selfBondPercentage; 

    const totalDelegatedAmountAllowed =  (bondAmount * 1000000n) / selfBondPercentage;

    if totalDelegatedAmount > totalDelegatedAmountAllowed then failwith("Satellite is over-delegated. Please increase bond amount.")
      else skip;

    // set satellite bond sufficiency flag to true
    satelliteAccount.bondSufficiency := 1n; 
    s.satelliteLedger[satelliteAddress] := satelliteAccount;

} with (noOperations, s)

function main (const action : delegationAction; const s : storage) : return is 
    case action of    
        | SetDelegate(parameters) -> setDelegate(parameters, s)
        // | SetDelegateComplete(parameters) -> setDelegateComplete(parameters.0, parameters.1, s)
        | SetVMvkTokenAddress(parameters) -> setVMvkTokenAddress(parameters, s)  
        | UnsetDelegate(parameters) -> unsetDelegate(parameters, s)
        | RegisterAsSatellite(_parameters) -> registerAsSatellite(s)
        | RegisterAsSatelliteComplete(parameters) -> registerAsSatelliteComplete(parameters, s)
        | UnregisterAsSatellite(_parameters) -> unregisterAsSatellite(s)
        | DecreaseSatelliteBond(parameters) -> decreaseSatelliteBond(parameters, s)
        | IncreaseSatelliteBond(parameters) -> increaseSatelliteBond(parameters, s)
        | OnStakeChange(parameters) -> onStakeChange(parameters.0, parameters.1, parameters.2, s)    
        | OnGovernanceAction(parameters) -> onGovernanceAction(parameters, s)
    end