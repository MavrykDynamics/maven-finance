type blockLevel is nat;
type metadata is big_map (string, bytes);

type vesteeRecordType is [@layout:comb] record [
    
    // static variables initiated at start ----

    totalAllocatedAmount     : nat;             // total amount allocated to vestee
    claimAmountPerMonth      : nat;             // amount to be claimed each month: claimAmountPerMonth = (totalAllocatedAmount / vestingMonths)

    startTimestamp           : timestamp;       // date/time start of when 

    vestingMonths            : nat;             // number of months of vesting for total allocaed amount
    cliffMonths              : nat;             // number of months for cliff before vestee can claim

    endCliffDateTime         : timestamp;       // calculated end of cliff duration in timestamp based on dateTimeStart
    
    endVestingDateTime       : timestamp;       // calculated end of vesting duration in timestamp based on dateTimeStart

    status                   : string;          // status of vestee: "ACTIVE", "LOCKED"

    // updateable variables on claim ----------

    totalRemainder           : nat;             // total amount that is left to be claimed
    totalClaimed             : nat;             // total amount that has been claimed

    monthsClaimed            : nat;             // claimed number of months   
    monthsRemaining          : nat;             // remaining number of months   
    
    nextRedemptionTimestamp  : timestamp;       // timestamp of when vestee will be able to claim again

    lastClaimedTimestamp     : timestamp;       // timestamp of when vestee last claimed
] 
type vesteeLedgerType is big_map(address, vesteeRecordType) // address, vestee record

type addVesteeType is [@layout:comb] record [
    vesteeAddress           : address;
    totalAllocatedAmount    : nat;
    cliffInMonths           : nat;
    vestingInMonths         : nat;
]

type updateVesteeType is [@layout:comb] record [
    vesteeAddress              : address;
    newTotalAllocatedAmount    : nat;
    newCliffInMonths           : nat;
    newVestingInMonths         : nat;
]

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type vestingLambdaActionType is 

  // Housekeeping Entrypoints
| LambdaSetAdmin                      of (address)
| LambdaSetGovernance                 of (address)
| LambdaUpdateMetadata                of updateMetadataType
| LambdaUpdateWhitelistContracts      of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts        of updateGeneralContractsParams

  // Internal Vestee Control Entrypoints
| LambdaAddVestee                     of (addVesteeType)
| LambdaRemoveVestee                  of (address)
| LambdaUpdateVestee                  of (updateVesteeType)
| LambdaToggleVesteeLock              of (address)

  // Vestee Entrypoints
| LambdaClaim                         of (unit)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type vestingStorage is [@layout:comb] record [
    admin               : address;
    metadata            : metadata;

    mvkTokenAddress     : address;
    governanceAddress   : address;

    whitelistContracts  : whitelistContractsType;      
    generalContracts    : generalContractsType;

    vesteeLedger        : vesteeLedgerType;

    totalVestedAmount   : nat;              // record of how much has been vested so far

    lambdaLedger        : lambdaLedgerType;
]
