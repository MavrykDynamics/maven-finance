type onStakeChangeParams is (address * nat * nat)
type burnTokenType is (address * nat)
type mintTokenType is (address * nat)

type delegationAction is 
    | SetSatellite of (address)
    | SetSatelliteComplete of (nat)
    | UnsetSatellite of (unit)
    | UnsetSatelliteComplete of (nat)
    | RegisterAsSatellite of (unit)
    | RegisterAsSatelliteComplete of (nat)
    | UnregisterAsSatellite of (unit)
    // | DecreaseSatelliteBond of (nat)
    // | IncreaseSatelliteBond of (nat)
    | SetVMvkTokenAddress of (address)
    | OnStakeChange of onStakeChangeParams
    | OnGovernanceAction of (address)    // callback to check if satellite has sufficient bond and is not overdelegated

// record for users choosing satellites 
type delegateRecordType is record [
    satelliteAddress     : address;
    delegatedDateTime    : timestamp;
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
    userIsSatelliteFlag  : bool;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

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
function getSatelliteRecord (const satelliteAddress : address; const s : storage) : satelliteRecordType is
  block {
    var satelliteRecord : satelliteRecordType :=
      record [
        status                = 0n;        
        bondAmount            = 0n;        
        bondSufficiency       = 0n;        
        registeredDateTime    = Tezos.now;
        satelliteFee          = 0n;    
        totalDelegatedAmount  = 0n;
      ];

    case s.satelliteLedger[satelliteAddress] of
      None -> skip
    | Some(instance) -> satelliteRecord := instance
    end;
  } with satelliteRecord


(* Helper function to get user delegate *)
function getDelegateRecord (const userAddress : address; const s : storage) : delegateRecordType is
  block {
    var delegateRecord : delegateRecordType :=
      record [
        satelliteAddress  = userAddress; // change to null?
        delegatedDateTime = Tezos.now; 
      ];

    case s.delegateLedger[userAddress] of
      None -> skip
    | Some(instance) -> delegateRecord := instance
    end;
  } with delegateRecord


(* set vMvk contract address *)
function setVMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.vMvkTokenAddress := parameters;
} with (noOperations, s)

function setSatellite(const satelliteAddress : address; var s : storage) : return is 
block {

    // Overall steps:
    // 1. check if satellite exists
    // 2. callback to vMVK token contract to fetch vMVK balance
    // 3. save new user delegate record
    // 4. update satellite total delegated amount

    var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of
         Some(_val) -> _val
        | None -> failwith("Satellite does not exist")
    end;

    var delegateRecord : delegateRecordType := record [
        satelliteAddress  = satelliteAddress;
        delegatedDateTime = Tezos.now;
    ];

    s.delegateLedger[Tezos.sender] := delegateRecord;

    // update satellite totalDelegatedAmount with user's vMVK balance
    const setSatelliteCompleteCallback : contract(nat) = Tezos.self("%setSatelliteComplete");

    const checkVMvkBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, setSatelliteCompleteCallback),
         0tez, 
         fetchVMvkBalance(s.vMvkTokenAddress)
         );
    
    const operations : list(operation) = list [checkVMvkBalanceOperation];

} with (operations, s)

function setSatelliteComplete(const vMvkBalance : nat; var s : storage) : return is 
block {

    // Retrieve delegate record from storage
    var delegateRecord : delegateRecordType := getDelegateRecord(Tezos.source, s);

    // Retrieve satellite account from storage
    var satelliteRecord : satelliteRecordType := getSatelliteRecord(delegateRecord.satelliteAddress, s);

    // update satellite totalDelegatedAmount balance
    satelliteRecord.totalDelegatedAmount := satelliteRecord.totalDelegatedAmount + vMvkBalance; 
    
    // update satellite ledger storage with new balance
    s.satelliteLedger[delegateRecord.satelliteAddress] := satelliteRecord;

} with (noOperations, s)

function unsetSatellite(var s : storage) : return is
block {

    // Overall steps:
    // 1. check if user address exists in delegateLedger
    // 2. callback to vMVK token contract to fetch vMVK balance
    // 3a. if satellite exists, update satellite record with new balance and remove user from delegateLedger
    // 3b. if satellite does not exist, remove user from delegateLedger
    
    var _delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.sender] of
         Some(_val) -> _val
        | None -> failwith("User address not found in delegateLedger.")
    end;

    // update satellite totalDelegatedAmount - decrease total amount with user's vMVK balance
    const unsetSatelliteCompleteCallback : contract(nat) = Tezos.self("%unsetSatelliteComplete");

    const checkVMvkBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, unsetSatelliteCompleteCallback),
         0tez, 
         fetchVMvkBalance(s.vMvkTokenAddress)
         );
    
    const operations : list(operation) = list [checkVMvkBalanceOperation];

} with (operations, s)


function unsetSatelliteComplete(const vMvkBalance : nat; var s : storage) : return is 
block {

    // Retrieve delegate record from storage 
    var delegateRecord : delegateRecordType := getDelegateRecord(Tezos.source, s);

    // Retrieve satellite account from storage
    var _satelliteRecord : satelliteRecordType := getSatelliteRecord(delegateRecord.satelliteAddress, s);

    // check that satellite record exists - e.g. in the edge case that satellite has unregistered
    if Big_map.mem(delegateRecord.satelliteAddress, s.satelliteLedger) then block{

        // satellite exists

        // check that vMVK balance does not exceed satellite's total delegated amount
        if vMvkBalance > _satelliteRecord.totalDelegatedAmount then failwith("Error: vMVK balance exceeds satellite's total delegated amount.")
        else skip;
        
        // update satellite totalDelegatedAmount balance
        _satelliteRecord.totalDelegatedAmount := abs(_satelliteRecord.totalDelegatedAmount - vMvkBalance); 
        
        // update satellite ledger storage with new balance
        s.satelliteLedger[delegateRecord.satelliteAddress] := _satelliteRecord;

        // remove user's address from delegateLedger
        remove (Tezos.source : address) from map s.delegateLedger

    } else block {

        // satellite no longer exists

        // remove user's address from delegateLedger
        remove (Tezos.source : address) from map s.delegateLedger
    };

} with (noOperations, s)


function registerAsSatellite(var s : storage) : return is 
block {
    
    // Overall steps: 
    // 1. verify that satellite does not already exist (prevent double registration)
    // 2. callback to vMVK token contract to fetch vMVK balance
    // 3. if user vMVK balance is more than minimumDelegateBond, register as delegate
    // 4. add new satellite record and save to satelliteLedger

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

} with (noOperations, s)

function unregisterAsSatellite(var s : storage) : return is
block {
    // Overall steps:
    // 1. check if satellite exists in satelliteLedger
    // 2. remove satellite address from satelliteLedger
    
    var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
          Some(_val) -> _val
        | None -> failwith("Satellite address does not exist.")
    end;

    remove (Tezos.sender : address) from map s.satelliteLedger

} with (noOperations, s)

// function decreaseSatelliteBond(const bondAmountChange : nat; var s : storage) : return is
// block {

//     // Overall steps:
//     // 1. check if satellite exists in satelliteLedger
//     // 2. check that withdrawal does not cause satellite to go below minimum bond required
//     // 3. decrease bond - burn sMVK / mint vMVK
    
//     var checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
//           Some(_val) -> _val
//         | None -> failwith("Satellite address does not exist.")
//     end;

//     const currentBondAmount : nat = checkSatelliteExists.bondAmount;
    
//     // check that currentBondAmount is greater than amount to be withdrawn
//     if currentBondAmount < bondAmountChange then failwith("You do not have enough bond.")
//       else skip;
    
//     const bondAmountAfterChange : nat = abs(currentBondAmount - bondAmountChange); 

//     // check that satellite still has enough bond to satisfy minimum Satellite bond requirements
//     if bondAmountAfterChange < s.config.minimumSatelliteBond then failwith("You need sufficient bond to be a satellite.")
//       else skip;

//     const burnSMvkTokensOperation : operation = burnTokens(
//       Tezos.sender,         // from address
//       bondAmountChange,     // amount of sMVK Tokens to be burned
//       s.sMvkTokenAddress);  // sMvkTokenAddress

//     const mintVMvkTokensOperation : operation = mintTokens(
//       Tezos.sender,        // to address
//       bondAmountChange,    // amount of vMVK Tokens to be minted
//       s.vMvkTokenAddress); // vMvkTokenAddress

//     // list of operations: burn mvk tokens first, then mint vmvk tokens
//     const operations : list(operation) = list [burnSMvkTokensOperation; mintVMvkTokensOperation];

//     // save changes to satellite in ledger
//     checkSatelliteExists.bondAmount := bondAmountAfterChange;
//     s.satelliteLedger[Tezos.sender] := checkSatelliteExists;

// } with (operations, s)

// function increaseSatelliteBond(const bondAmountChange : nat; var s : storage) : return is
// block {

//     // Overall steps:
//     // 1. check if satellite exists in satelliteLedger
//     // 2. increase bond - burn vMVK / mint sMVK
//     var checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
//           Some(_val) -> _val
//         | None -> failwith("Satellite address does not exist.")
//     end;

//     const currentBondAmount : nat = checkSatelliteExists.bondAmount;

//     const bondAmountAfterChange : nat = currentBondAmount + bondAmountChange; 

//     const burnVMvkTokensOperation : operation = burnTokens(
//       Tezos.sender,         // from address
//       bondAmountChange,     // amount of vMVK Tokens to be burned
//       s.vMvkTokenAddress);  // vMvkTokenAddress

//     const mintSMvkTokensOperation : operation = mintTokens(
//       Tezos.sender,        // to address
//       bondAmountChange,    // amount of sMVK Tokens to be minted
//       s.sMvkTokenAddress); // sMvkTokenAddress

//     // list of operations: burn mvk tokens first, then mint vmvk tokens
//     const operations : list(operation) = list [burnVMvkTokensOperation; mintSMvkTokensOperation];

//     // save changes to satellite in ledger
//     checkSatelliteExists.bondAmount := bondAmountAfterChange;
//     s.satelliteLedger[Tezos.sender] := checkSatelliteExists;

// } with (operations, s)


function onStakeChange(const userAddress : address; const stakeAmount : nat; const stakeType : nat; var s : storage) : return is 
block {

    // Overall steps:
    // 1. check if user is a satellite 
    // 2a. if user is a satellite, update satellite's bond amount depending on stakeAmount and stakeType
    // 2b. if user is not a satellite, update satellite's total delegated amount depending on stakeAmount and stakeType
    // Note: stakeType 1n to increase, stakeType 0n to decrease

    const userIsSatelliteFlag : bool = Big_map.mem(userAddress, s.satelliteLedger);

    s.userIsSatelliteFlag := userIsSatelliteFlag;

    // check if user is a satellite
    if userIsSatelliteFlag = True then block{

        // Retrieve satellite account from storage 
        // var satelliteRecord : satelliteRecordType := getSatelliteRecord(userAddress, s);

        var satelliteRecord : satelliteRecordType := case s.satelliteLedger[userAddress] of
            Some(_val) -> _val
            | None -> failwith("Satellite does not exist")
        end;

        var totalBondAmount : nat := satelliteRecord.bondAmount;

        if stakeType = 1n then totalBondAmount := totalBondAmount + stakeAmount
          else skip;

        // // check that stakeAmount <= totalDelegatedAmount

        if stakeType = 0n then block{
            if stakeAmount > totalBondAmount then failwith("Error: stakeAmount is larger than satellite's total bond amount.")
              else skip;        

            totalBondAmount := abs(totalBondAmount - stakeAmount);

            if totalBondAmount < s.config.minimumSatelliteBond then failwith("Error: unstaking would exceed satellite minimum bond amount.")
              else skip;


        } else skip;

        // // save satellite record
        satelliteRecord.bondAmount := totalBondAmount; 
        s.satelliteLedger[userAddress] := satelliteRecord; 

    } else block {

        // user is not a satellite 
        
        // check if user has delegated to a satellite
        const userHasDelegatedToSatelliteBool : bool = Big_map.mem(userAddress, s.delegateLedger);

        if userHasDelegatedToSatelliteBool = True then block {

            // Retrieve delegate record from storage 
            // var delegateRecord : delegateRecordType := getDelegateRecord(userAddress, s);
            var delegateRecord : delegateRecordType := case s.delegateLedger[userAddress] of
                Some(_val) -> _val
                | None -> failwith("Delegate does not exist")
            end;
            
            // Retrieve satellite account from storage 
            // var satelliteRecord : satelliteRecordType := getSatelliteRecord(delegateRecord.satelliteAddress, s);

            var satelliteRecord : satelliteRecordType := case s.satelliteLedger[delegateRecord.satelliteAddress] of
                Some(_val) -> _val
                | None -> failwith("Satellite does not exist")
            end;

            var totalDelegatedAmount : nat := satelliteRecord.totalDelegatedAmount;

            if stakeType = 1n then totalDelegatedAmount := totalDelegatedAmount + stakeAmount
            else skip;

            if stakeType = 0n then block{
                if stakeAmount > totalDelegatedAmount then failwith("Error: stakeAmount is larger than satellite's total delegated amount.")
                else skip;

                totalDelegatedAmount := abs(totalDelegatedAmount - stakeAmount);

            } else skip;

            // // save satellite record
            satelliteRecord.totalDelegatedAmount := totalDelegatedAmount; 
            s.satelliteLedger[delegateRecord.satelliteAddress] := satelliteRecord; 
        
        } else skip;

    } 

} with (noOperations, s)

function onGovernanceAction(const satelliteAddress : address; var s : storage) : return is 
block {
    
    // Overall steps:
    // 1. check if satellite has sufficient bond
    //    - needs a loop to find all delegates of the satellite, and retrieve vMVK balance for each delegate
    // 2. perform governance action if satellite has sufficient bond - proxy call to governance contract to execute? 
    //    - pass back a callback operation

    // Retrieve satellite account from storage
    var satelliteRecord : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);

    // check if minimum bond has been reached (units are in mu)
    if satelliteRecord.bondAmount < s.config.minimumSatelliteBond then failwith("Insufficient satellite bond - minimum bond not reached.")
      else skip;

    // check bond sufficiency using fixed point arithmetic 
    // percentage stored: 10% -> 10000
    // total amount that can be staked = bond / delegationPercentage 
    // check for division accuracy

    const bondAmount : nat           = satelliteRecord.bondAmount;
    const _totalDelegatedAmount : nat = satelliteRecord.totalDelegatedAmount;
    const selfBondPercentage : nat   = s.config.selfBondPercentage; 

    const _totalDelegatedAmountAllowed =  (bondAmount * 1000000n) / selfBondPercentage;

    // if totalDelegatedAmount > totalDelegatedAmountAllowed then failwith("Satellite is over-delegated. Please increase bond amount.")
    //   else skip;

    // set satellite bond sufficiency flag to true
    satelliteRecord.bondSufficiency := 1n; 
    s.satelliteLedger[satelliteAddress] := satelliteRecord;

} with (noOperations, s)

function main (const action : delegationAction; const s : storage) : return is 
    case action of    
        | SetSatellite(parameters) -> setSatellite(parameters, s)
        | SetSatelliteComplete(parameters) -> setSatelliteComplete(parameters, s)
        | SetVMvkTokenAddress(parameters) -> setVMvkTokenAddress(parameters, s)  
        | UnsetSatellite(_parameters) -> unsetSatellite(s)
        | UnsetSatelliteComplete(parameters) -> unsetSatelliteComplete(parameters, s)
        | RegisterAsSatellite(_parameters) -> registerAsSatellite(s)
        | RegisterAsSatelliteComplete(parameters) -> registerAsSatelliteComplete(parameters, s)
        | UnregisterAsSatellite(_parameters) -> unregisterAsSatellite(s)
        // | DecreaseSatelliteBond(parameters) -> decreaseSatelliteBond(parameters, s)
        // | IncreaseSatelliteBond(parameters) -> increaseSatelliteBond(parameters, s)
        | OnStakeChange(parameters) -> onStakeChange(parameters.0, parameters.1, parameters.2, s)    
        | OnGovernanceAction(parameters) -> onGovernanceAction(parameters, s)
    end