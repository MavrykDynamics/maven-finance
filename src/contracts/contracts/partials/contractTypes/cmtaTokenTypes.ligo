// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type tokenIdType            is nat 
type ownerType              is address
type snapshotTimestampType  is timestamp

///

type ledgerKeyType is record [
    owner           : address;
    token_id        : nat;
]


///

type tokenMetadataInfoType is record [
    token_id          : tokenIdType;
    token_info        : map(string, bytes);
]
type ledgerType is big_map(address, tokenBalanceType);

type tokenMetadataType is big_map(tokenIdType, tokenMetadataInfoType);

///

type administratorsType is big_map(ledgerKeyType, nat)


///


type tokenAmountType is record [
    token_id        : nat;
    amount          : nat;
    address         : address; 
]


type reassignmentType is record [
    token_id            : nat;
    original_holder     : address;
    replacement_holder  : address;
]


type redemptionType is record [
    token_id            : nat;
    amount              : nat;
]


type destructionType is record [
    token_id            : nat;
    holders             : list(address);
]

type ruleType is record [
    token_id        : nat;
    rule_contract   : address; 
]

type snapshotLookupKeyType is record [
    token_id            : nat;
    snapshot_timestamp  : timestamp;
]

type snapshotLedgerKeyType is record [
    token_id            : nat;
    owner               : address;
    snapshot_timestamp  : timestamp;
]

// type snapshotLookupKeyType is (tokenIdType * ownerType * snapshotTimestampType)

// type snapshotLedgerKeyType is (tokenIdType * ownerType * snapshotTimestampType)

type tokenContextType is record [
    is_paused                           : bool;
    validate_transfer_rule_contract     : option(address);
    current_snapshot                    : option(timestamp);
    next_snapshot                       : option(timestamp);
]

type validationTransferType is record [
    from_       : address;
    to_         : address;
    token_id    : nat;
    amount      : nat;
]


type snapshotLedgerType is big_map(snapshotLedgerKeyType, nat)

type snapshotLookupType is big_map(snapshotLookupKeyType, timestamp)

type snapshotTotalSupplyType is big_map(snapshotLookupKeyType, nat)

type tokenContextMapType is big_map(nat, tokenContextType)

type identiferType is big_map(address, bytes)

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

(* Mint entrypoint inputs *)
type mintType is (ownerType * tokenBalanceType)

(* Burn entrypoint inputs *)
type burnType is nat

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type cmtaTokenStorageType is record [
    
    administrators          : administratorsType;

    metadata                : metadataType;

    token_metadata          : tokenMetadataType;
    totalSupply             : tokenBalanceType;

    snapshotLedger          : snapshotLedgerType;
    snapshotLookup          : snapshotLookupType;
    snapshotTotalSupply     : snapshotTotalSupplyType;
    tokenContext            : tokenContextMapType;
    identifer               : identiferType;

    ledger                  : ledgerType;
    operators               : operatorsType;
]
