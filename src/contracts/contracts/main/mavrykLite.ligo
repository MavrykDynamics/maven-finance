type delegationConfigType is [@layout:comb] record [
    minimumStakedMvkBalance             : nat;   // minimumStakedMvkBalance - minimum amount of staked MVK required to register as delegate (in muMVK)
    delegationRatio                     : nat;   // delegationRatio (tbd) -   percentage to determine if satellite is overdelegated (requires more staked MVK to be staked) or underdelegated    
    maxSatellites                       : nat;   // 100 -> prevent any gaming of system with mass registration of satellites - can be changed through governance
    
    satelliteNameMaxLength              : nat;
    satelliteDescriptionMaxLength       : nat;
    satelliteImageMaxLength             : nat;
    satelliteWebsiteMaxLength           : nat;
]

type satelliteRecordType is [@layout:comb] record [
    status                : string;     // ACTIVE / INACTIVE / SUSPENDED / BANNED
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    website               : string;     // satellite website if it has one
    
    registeredDateTime    : timestamp;  

    oraclePublicKey       : key;        // oracle public key
    oraclePeerId          : string;     // oracle peer id
]
type satelliteLedgerType is big_map (address, satelliteRecordType)

type distributeRewardStakedMvkType is [@layout:comb] record [
    eligibleSatellites      : set(address);
    totalStakedMvkReward    : nat;
]

type setAggregatorReferenceType is [@layout:comb] record [
    aggregatorAddress       : address;
    oldName                 : string;
    newName                 : string;
]

type updateType is 
    |   Update of unit
    |   Remove of unit

type generalContractsType is big_map (string, address)
type updateGeneralContractsType is [@layout:comb] record [
    generalContractName     : string;
    generalContractAddress  : address;
    updateType              : updateType;
]

type tokenAmountType     is nat
type tezType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
    tokenContractAddress    : address;
    tokenId                 : nat;
]

type tokenType is
    |   Tez    of tezType         // unit
    |   Fa12   of fa12TokenType   // address
    |   Fa2    of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferDestinationType is [@layout:comb] record[
    to_       : address;
    amount    : tokenAmountType;
    token     : tokenType;
]

type transferActionType is list(transferDestinationType);

type mavrykLiteStorageType is record [
    config                  : delegationConfigType;
    generalContracts        : generalContractsType;
    satelliteLedger         : satelliteLedgerType;
]

(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : mavrykLiteStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)

(* View: get Satellite Record *)
[@view] function getSatelliteOpt(const satelliteAddress : address; const s : mavrykLiteStorageType) : option(satelliteRecordType) is
    Big_map.find_opt(satelliteAddress, s.satelliteLedger)

(* View: get Config *)
[@view] function getConfig(const _ : unit; const s : mavrykLiteStorageType) : delegationConfigType is
    s.config

type aggregatorAction is

    |   DistributeReward                of distributeRewardStakedMvkType
    |   SetAggregatorReference          of setAggregatorReferenceType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   Transfer                        of transferActionType
    |   UnregisterAsSatellite           of (address)

const noOperations : list (operation) = nil;
type return is list (operation) * mavrykLiteStorageType

(* entrypoints *)
function distributeReward(const _distributeRewardParams : distributeRewardStakedMvkType; const s : mavrykLiteStorageType) : return is (noOperations, s)
function setAggregatorReference(const _setAggregatorReferenceParams : setAggregatorReferenceType; const s : mavrykLiteStorageType) : return is (noOperations, s)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : mavrykLiteStorageType) : return is
block{
    const contractName     : string     = updateGeneralContractsParams.generalContractName;
    const contractAddress  : address    = updateGeneralContractsParams.generalContractAddress;
    const updateType       : updateType = updateGeneralContractsParams.updateType; 

    s.generalContracts := case updateType of [
            Update(_) -> Big_map.update(contractName, (Some(contractAddress)), s.generalContracts)
        |   Remove(_) -> Big_map.update(contractName, (None : option(address)), s.generalContracts)
    ]
} with(noOperations, s)
function transfer(const _transferTokenParams : transferActionType; const s : mavrykLiteStorageType) : return is (noOperations, s)
function unregisterAsSatellite(const satelliteAddress : address; var s : mavrykLiteStorageType) : return is 
block {
    s.satelliteLedger   := Big_map.remove(satelliteAddress, s.satelliteLedger);
} with(noOperations, s)

(* main entrypoint *)
function main (const action : aggregatorAction; const s : mavrykLiteStorageType) : return is
case action of [

    |   DistributeReward(parameters)                -> distributeReward(parameters, s)
    |   SetAggregatorReference(parameters)          -> setAggregatorReference(parameters, s)
    |   UpdateGeneralContracts (parameters)         -> updateGeneralContracts(parameters, s)
    |   Transfer(parameters)                        -> transfer(parameters, s)
    |   UnregisterAsSatellite(parameters)           -> unregisterAsSatellite(parameters, s)

]
