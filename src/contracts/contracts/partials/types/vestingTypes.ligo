type blockLevel is nat;
type metadata is big_map (string, bytes);

type configType is record [
    defaultCliffPeriod           : nat;   // 6 months in block levels -> 2880 * 30 * 6 = 518,400
    defaultCooldownPeriod        : nat;   // 1 month in block level -> 2880 * 30 = 86400
]

type claimRecordType is record [
    amountClaimed      : nat;
    remainderVested    : nat; 
    dateTimeClaimed    : timestamp;
    blockLevelClaimed  : nat;
]
type claimLedgerType is big_map(address, claimRecordType)

type vesteeRecordType is record [
    
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

// how to account for changes in block level

// determine if cliff period and vesting period will be unique to different users 
// e.g. different start times for each person depending on when they joined and vesting starts
    
type addVesteeType is (address * nat * nat * nat) // vestee address, total allocated amount, cliff in months, vesting in months
type updateVesteeType is (address * nat * nat * nat) // vestee address, new total allocated amount, new cliff in months, new vesting in months

type updateConfigNewValueType is nat
type updateConfigActionType is 
  ConfigDefaultCliffPeriod of unit
| ConfigDefaultCooldownPeriod of unit
type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: updateConfigNewValueType; 
  updateConfigAction: updateConfigActionType;
]

type vestingStorage is [@layout:comb] record [
    admin               : address;
    mvkTokenAddress     : address;
    metadata            : metadata;

    config              : configType;

    whitelistContracts  : whitelistContractsType;      
    generalContracts    : generalContractsType;

    claimLedger         : claimLedgerType;
    vesteeLedger        : vesteeLedgerType;

    totalVestedAmount   : nat;          // record of how much has been vested so far

    tempBlockLevel      : nat; 
]
