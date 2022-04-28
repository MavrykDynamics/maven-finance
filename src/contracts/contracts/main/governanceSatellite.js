type counterIdType is nat

type satelliteGovernanceVoteChoiceType is 
  Approve of unit
| Disapprove of unit

type satelliteGovernanceVoteType is [@layout:comb] record [
  vote              : satelliteGovernanceVoteChoiceType;
  totalVotingPower  : nat; 
  timeVoted         : timestamp;
] 

type satelliteGovernanceVotersMapType is map (address, satelliteGovernanceVoteType)

type satelliteGovernanceRecordType is [@layout:comb] record [
    initiator                          : address;
    status                             : bool;                  // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                           : bool;                  // false on creation; set to true when financial request is executed successfully
    
    governanceType                     : string;                // "MINT" or "TRANSFER"
    governancePurpose                  : string;
    voters                             : satelliteGovernanceVotersMapType; 

    approveVoteTotal                   : nat;
    disapproveVoteTotal                : nat;

    snapshotStakedMvkTotalSupply       : nat;
    stakedMvkPercentageForApproval     : nat; 
    stakedMvkRequiredForApproval       : nat; 

    requestedDateTime                  : timestamp;           // log of when the request was submitted
    expiryDateTime                     : timestamp;               
]
type satelliteGovernanceLedgerType is big_map (nat, satelliteGovernanceRecordType);


type satelliteGovernanceSnapshotRecordType is [@layout:comb] record [
    totalMvkBalance           : nat;      // log of satellite's total mvk balance for this counter
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
]
type satelliteGovernanceSnapshotMapType is map (address, satelliteGovernanceSnapshotRecordType)
type satelliteGovernanceSnapshotLedgerType is big_map (counterIdType, satelliteGovernanceSnapshotMapType);

type storage is record [
    admin                      : address;
    metadata                   : metadata;
    config                     : governanceSatelliteConfigType;

    mvkTokenAddress            : address;
    governanceProxyAddress     : address; 
    
    // satellite governance storage 
    satelliteGovernanceLedger              : satelliteGovernanceLedgerType;
    satelliteGovernanceSnapshotLedger      : satelliteGovernanceSnapshotLedgerType;
    satelliteGovernanceCounter             : nat;

    // lambda storage
    lambdaLedger                        : lambdaLedgerType;             // governance contract lambdas
  
]

type governanceSatelliteAction is 
    | First of (nat)
    | Second of (nat)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

function first(const _proposal : nat ; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2. 


    skip

} with (noOperations, s)

function second(const _parameters : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. 
    // 2.
    
    skip
} with (noOperations, s)

function main (const action : governanceSatelliteAction; const s : storage) : return is 
    case action of
        | First(parameters) -> first(parameters, s)
        | Second(parameters) -> second(parameters, s)
    end