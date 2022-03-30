// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type voteType is (nat * timestamp)              // mvk amount, timestamp
type voterMapType is map (address, voteType)
type emergencyGovernanceRecordType is [@layout:comb] record [
    proposerAddress                  : address;
    status                           : bool;   
    executed                         : bool;
    dropped                          : bool;

    title                            : string;
    description                      : string;   
    voters                           : voterMapType; 
    totalStakedMvkVotes              : nat;              
    stakedMvkPercentageRequired      : nat;              // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
    stakedMvkRequiredForBreakGlass   : nat;              // capture state of min staked MVK vote required
    
    startDateTime                    : timestamp;
    startLevel                       : nat;              // block level of submission, used to order proposals
    executedDateTime                 : timestamp;        // will follow startDateTime and be updated when executed
    executedLevel                    : nat;              // will follow startLevel and be updated when executed
    expirationDateTime               : timestamp;
]

type emergencyGovernanceLedgerType is big_map(nat, emergencyGovernanceRecordType)

type configType is record [
    decimals                         : nat;   // decimals used for percentages
    voteExpiryDays                   : nat;   // track time by tezos blocks - e.g. 2 days 
    requiredFee                      : nat;   // fee for triggering emergency control - e.g. 100 tez -> change to MVK 
    stakedMvkPercentageRequired      : nat;   // minimum staked MVK percentage amount required to activate break glass 
    minStakedMvkRequiredToVote       : nat;   // minimum staked MVK balance of user required to vote for emergency governance
    minStakedMvkRequiredToTrigger    : nat;   // minimum staked MVK balance of user to trigger emergency governance
]

type storage is record [
    admin                               : address;
    config                              : configType;
    mvkTokenAddress                     : address;
    
    generalContracts                    : generalContractsType;

    emergencyGovernanceLedger           : emergencyGovernanceLedgerType; 
    
    currentEmergencyGovernanceId        : nat;
    nextEmergencyGovernanceProposalId   : nat;
]

type updateConfigNewValueType is nat
type updateConfigActionType is 
  ConfigVoteExpiryDays of unit
| ConfigRequiredFee of unit
| ConfigStakedMvkPercentRequired of unit
| ConfigMinStakedMvkForVoting of unit
| ConfigMinStakedMvkForTrigger of unit
type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue  : updateConfigNewValueType; 
  updateConfigAction    : updateConfigActionType;
]

type triggerEmergencyControlType is [@layout:comb] record[
  title        : string;
  description  : string;
]

type emergencyGovernanceAction is 
| SetAdmin of (address)
| UpdateConfig of updateConfigParamsType    
| UpdateGeneralContracts of updateGeneralContractsParams

| TriggerEmergencyControl of triggerEmergencyControlType
| VoteForEmergencyControl of (unit)
| DropEmergencyGovernance of (unit)

const noOperations : list (operation) = nil;
type return is list (operation) * storage



// basic helper functions begin ---------------------------------------------------------
const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg" : address);
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
// basic helper functions end ---------------------------------------------------------


// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsMvkTokenContract(var s : storage) : unit is
block{
  if (Tezos.sender = s.mvkTokenAddress) then skip
  else failwith("Error. Only the MVK Token Contract can call this entrypoint.");
} with unit

function checkSenderIsDoormanContract(var s : storage) : unit is
block{
  const doormanAddress : address = case s.generalContracts["doorman"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found.")
  ];
  if (Tezos.sender = doormanAddress) then skip
  else failwith("Error. Only the Doorman Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// admin helper functions end ---------------------------------------------------------

// helper function to break glass in the governance or breakGlass contract
function triggerBreakGlass(const contractAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%breakGlass",
      contractAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith("breakGlass entrypoint in Contract not found") : contract(unit))
  ];


// transfer tez helper function
function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)

(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    s.admin := newAdminAddress;

} with (noOperations, s)

(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  // checkSenderIsAdmin(s); // check that sender is admin

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of [
    ConfigVoteExpiryDays (_v)                     -> s.config.voteExpiryDays                  := updateConfigNewValue
  | ConfigRequiredFee (_v)                        -> s.config.requiredFee                     := updateConfigNewValue
  | ConfigStakedMvkPercentRequired (_v)           -> s.config.stakedMvkPercentageRequired     := updateConfigNewValue  
  | ConfigMinStakedMvkForVoting (_v)              -> s.config.minStakedMvkRequiredToVote      := updateConfigNewValue
  | ConfigMinStakedMvkForTrigger (_v)             -> s.config.minStakedMvkRequiredToTrigger   := updateConfigNewValue
  ];

} with (noOperations, s)

function triggerEmergencyControl(const triggerEmergencyControlParams : triggerEmergencyControlType; var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check that there is no currently active emergency governance being voted on
    // 2. operation to MVK token contract to get total supply -> then update temp total supply and emergency governce record min MVK required

    if s.currentEmergencyGovernanceId = 0n 
    then skip
    else failwith("Error. There is a emergency control governance in process.");

    // check if tez sent is equal to the required fee
    if mutezToNatural(Tezos.amount) =/= s.config.requiredFee 
    then failwith("Error. Tez sent is not equal to required fee to trigger emergency governance.") 
    else skip;

    const treasuryAddress : address = case s.generalContracts["treasury"] of [
        Some(_address) -> _address
        | None -> failwith("Error. Treasury Contract is not found.")
    ];

    const transferFeeToTreasuryOperation : operation = case (Tezos.get_contract_opt(treasuryAddress): option(contract(unit))) of [
        Some (_contract) -> transferTez(_contract, mutezToNatural(Tezos.amount))
    |   None -> failwith("Error. Contract not found at given address. Cannot transfer XTZ")
    ];

    // check if user has sufficient staked MVK to trigger emergency control
    const doormanAddress : address = case s.generalContracts["doorman"] of [
          Some(_address) -> _address
          | None -> failwith("Error. Doorman Contract is not found.")
      ];

    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.sender, doormanAddress);
    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
      Some (value) -> value
    | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
    ];
    
    if stakedMvkBalance < s.config.minStakedMvkRequiredToTrigger 
    then failwith("Error. You do not have enough staked MVK to trigger the emergency governance.") 
    else skip;

    // fetch staked MVK supply and calculate min staked MVK required for break glass to be triggered
    const stakedMvkTotalSupplyView : option (nat) = Tezos.call_view ("getTotalStakedSupply", unit, doormanAddress);
    const stakedMvkTotalSupply: nat = case stakedMvkTotalSupplyView of [
      Some (value) -> value
    | None -> (failwith ("Error. GetTotalStakedSupply View not found in the Doorman Contract") : nat)
    ];

    var stakedMvkRequiredForBreakGlass : nat := abs(s.config.stakedMvkPercentageRequired * stakedMvkTotalSupply / 10000);


    const title        : string  =  triggerEmergencyControlParams.title;
    const description  : string  =  triggerEmergencyControlParams.description;

    const emptyVotersMap : voterMapType = map[];
    var newEmergencyGovernanceRecord : emergencyGovernanceRecordType := record [
        proposerAddress                  = Tezos.sender;
        status                           = False;
        executed                         = False;
        dropped                          = False;

        title                            = title;
        description                      = description; 
        voters                           = emptyVotersMap;
        totalStakedMvkVotes              = 0n;
        stakedMvkPercentageRequired      = s.config.stakedMvkPercentageRequired;  // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
        stakedMvkRequiredForBreakGlass   = stakedMvkRequiredForBreakGlass;

        startDateTime                    = Tezos.now;
        startLevel                       = Tezos.level;             
        executedDateTime                 = Tezos.now;
        executedLevel                    = Tezos.level;
        expirationDateTime               = Tezos.now + (86_400 * s.config.voteExpiryDays);
    ];

    s.emergencyGovernanceLedger[s.nextEmergencyGovernanceProposalId] := newEmergencyGovernanceRecord;
    s.currentEmergencyGovernanceId := s.nextEmergencyGovernanceProposalId;
    s.nextEmergencyGovernanceProposalId := s.nextEmergencyGovernanceProposalId + 1n;

    // init variables
    var operations : list(operation) := list[transferFeeToTreasuryOperation];

} with (operations, s)

function voteForEmergencyControl(var s : storage) : return is 
block {
    // Steps Overview:
    // 1. check that emergency governance exist in the emergency governance ledger, and is currently active, and can be voted on
    // 2. check that user has not already voted for the emergency governance
    // 3. check proposer's staked MVK balance (via proxy) and increment totalMvkVotes by the balance

    checkNoAmount(Unit);

    if s.currentEmergencyGovernanceId = 0n then failwith("Error. There is no emergency control governance in process.")
      else skip;

    var _emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of [
        | None -> failwith("Error. Emergency governance record not found with given id.")
        | Some(_instance) -> _instance
    ];

    // Check is user already voted
    if not Map.mem(Tezos.sender, _emergencyGovernance.voters) then skip else failwith("Error. You can only vote once for emergency governance.");

    const doormanAddress : address = case s.generalContracts["doorman"] of [
        Some(_address) -> _address
        | None -> failwith("Error. Doorman Contract is not found.")
    ];
    
    // get user staked MVK Balance
    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.sender, doormanAddress);
    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
      Some (value) -> value
    | None -> failwith ("Error. GetStakedBalance View not found in the Doorman Contract")
    ];

    if stakedMvkBalance > s.config.minStakedMvkRequiredToVote then skip else failwith("Error. You do not have enough staked MVK balance to vote.");

    if _emergencyGovernance.dropped = True then failwith("Error. Emergency governance has been dropped")
    else skip; 

    if _emergencyGovernance.executed = True then failwith("Error. Emergency governance has already been executed.")
    else skip; 

    const totalStakedMvkVotes : nat = _emergencyGovernance.totalStakedMvkVotes + stakedMvkBalance;

    _emergencyGovernance.voters[Tezos.source] := (stakedMvkBalance, Tezos.now);
    _emergencyGovernance.totalStakedMvkVotes := totalStakedMvkVotes;
    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := _emergencyGovernance;

    // check if total votes has exceed threshold - if yes, trigger operation to break glass contract
    var operations : list(operation) := nil;
    if totalStakedMvkVotes > _emergencyGovernance.stakedMvkRequiredForBreakGlass then block {

        const breakGlassContractAddress : address = case s.generalContracts["breakGlass"] of [
            Some(_address) -> _address
            | None -> failwith("Error. Break Glass Contract is not found.")
        ];

        const governanceContractAddress : address = case s.generalContracts["governance"] of [
            Some(_address) -> _address
            | None -> failwith("Error. Governance Contract is not found.")
        ];

        // trigger break glass in break glass contract - set glassbroken to true in breakglass contract to give council members access to protected entrypoints
        const triggerBreakGlassOperation : operation = Tezos.transaction(
            unit,
            0tez, 
            triggerBreakGlass(breakGlassContractAddress)
            );

        // trigger break glass in governance contract - send operations to pause all entrypoints and change contract admin to break glass address
        const triggerGovernanceBreakGlassOperation : operation = Tezos.transaction(
            unit,
            0tez, 
            triggerBreakGlass(governanceContractAddress)
            );

        // update emergency governance record
        _emergencyGovernance.status              := True;
        _emergencyGovernance.executed            := True;
        _emergencyGovernance.executedDateTime    := Tezos.now;
        _emergencyGovernance.executedLevel       := Tezos.level;
        
        // save emergency governance record
        s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId]  := _emergencyGovernance;

        operations := list[triggerGovernanceBreakGlassOperation;triggerBreakGlassOperation];

    } else skip;

} with (operations, s)
 
function dropEmergencyGovernance(var s : storage) : return is 
block {

    // Steps Overview:
    // 1. check that emergency governance exist in the emergency governance ledger, and is currently active, and can be voted on
    // 2. check that satellite is proposer of emergency governance
    // 3. change emergency governance proposal to inactive and reset currentEmergencyGovernanceId
    
    checkNoAmount(Unit);

    if s.currentEmergencyGovernanceId = 0n then failwith("Error. There is no emergency control governance in process.")
      else skip;

    var emergencyGovernance : emergencyGovernanceRecordType := case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of [ 
        | None -> failwith("Error. Emergency governance record not found.")
        | Some(_instance) -> _instance
    ];

    if emergencyGovernance.proposerAddress =/= Tezos.sender then failwith("Error: You do not have permission to drop this emergency governance.")
      else skip;

    emergencyGovernance.dropped := True; 
    s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] := emergencyGovernance;

    s.currentEmergencyGovernanceId := 0n; 

} with (noOperations, s)

function main (const action : emergencyGovernanceAction; const s : storage) : return is 
    case action of [
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        | UpdateConfig(parameters) -> updateConfig(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

        | TriggerEmergencyControl(parameters) -> triggerEmergencyControl(parameters, s)
        | VoteForEmergencyControl(_parameters) -> voteForEmergencyControl(s)
        | DropEmergencyGovernance(_parameters) -> dropEmergencyGovernance(s)
    ]