type delegationConfigType is [@layout:comb] record [
    minimumStakedMvnBalance             : nat;   // minimumStakedMvnBalance - minimum amount of staked MVN required to register as delegate (in muMVN)
    delegationRatio                     : nat;   // delegationRatio (tbd) -   percentage to determine if satellite is overdelegated (requires more staked MVN to be staked) or underdelegated    
    maxSatellites                       : nat;   // 100 -> prevent any gaming of system with mass registration of satellites - can be changed through governance
    
    satelliteNameMaxLength              : nat;
    satelliteDescriptionMaxLength       : nat;
    satelliteImageMaxLength             : nat;
    satelliteWebsiteMaxLength           : nat;
]

type satelliteRecordType is [@layout:comb] record [
    status                : string;     // ACTIVE / INACTIVE / SUSPENDED / BANNED
    stakedMvnBalance      : nat;        // bondAmount -> staked MVN Balance
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

type distributeRewardStakedMvnType is [@layout:comb] record [
    eligibleSatellites      : set(address);
    totalStakedMvnReward    : nat;
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

type mavenLiteStorageType is record [
    config                  : delegationConfigType;
    generalContracts        : generalContractsType;
    satelliteLedger         : satelliteLedgerType;
]

(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : mavenLiteStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)

(* View: get Satellite Record *)
[@view] function getSatelliteOpt(const satelliteAddress : address; const s : mavenLiteStorageType) : option(satelliteRecordType) is
    Big_map.find_opt(satelliteAddress, s.satelliteLedger)

(* View: get Config *)
[@view] function getConfig(const _ : unit; const s : mavenLiteStorageType) : delegationConfigType is
    s.config

type aggregatorAction is

    |   DistributeReward                of distributeRewardStakedMvnType
    |   SetAggregatorReference          of setAggregatorReferenceType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   Transfer                        of transferActionType
    |   UnregisterAsSatellite           of (address)

const noOperations : list (operation) = nil;
type return is list (operation) * mavenLiteStorageType

(* entrypoints *)
function distributeReward(const _distributeRewardParams : distributeRewardStakedMvnType; const s : mavenLiteStorageType) : return is (noOperations, s)
function setAggregatorReference(const _setAggregatorReferenceParams : setAggregatorReferenceType; const s : mavenLiteStorageType) : return is (noOperations, s)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : mavenLiteStorageType) : return is
block{
    const contractName     : string     = updateGeneralContractsParams.generalContractName;
    const contractAddress  : address    = updateGeneralContractsParams.generalContractAddress;
    const updateType       : updateType = updateGeneralContractsParams.updateType; 

    s.generalContracts := case updateType of [
            Update(_) -> Big_map.update(contractName, (Some(contractAddress)), s.generalContracts)
        |   Remove(_) -> Big_map.update(contractName, (None : option(address)), s.generalContracts)
    ]
} with(noOperations, s)
function transfer(const _transferTokenParams : transferActionType; const s : mavenLiteStorageType) : return is (noOperations, s)
function unregisterAsSatellite(const satelliteAddress : address; var s : mavenLiteStorageType) : return is 
block {
    s.satelliteLedger   := Big_map.remove(satelliteAddress, s.satelliteLedger);
} with(noOperations, s)

(* main entrypoint *)
function main (const action : aggregatorAction; const s : mavenLiteStorageType) : return is
case action of [

    |   DistributeReward(parameters)                -> distributeReward(parameters, s)
    |   SetAggregatorReference(parameters)          -> setAggregatorReference(parameters, s)
    |   UpdateGeneralContracts (parameters)         -> updateGeneralContracts(parameters, s)
    |   Transfer(parameters)                        -> transfer(parameters, s)
    |   UnregisterAsSatellite(parameters)           -> unregisterAsSatellite(parameters, s)

]
