// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type tokenIdType            is nat 
type ownerType              is address
type snapshotTimestampType  is timestamp


type operatorKeyType is [@layout:comb] record [
    token_id    : nat;
    owner       : address;
    operator    : address; 
]

///

type ledgerKeyType is [@layout:comb] record [
    owner           : address;
    token_id        : nat;
]


///

type tokenMetadataInfoType is [@layout:comb] record [
    token_id          : tokenIdType;
    token_info        : map(string, bytes);
]
type ledgerType is big_map(ledgerKeyType, nat);

type tokenMetadataType is big_map(tokenIdType, tokenMetadataInfoType);

///

type administratorsType is big_map(ledgerKeyType, nat)


///


type totalSupplyType is big_map(nat, nat);


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

type identityType is big_map(address, bytes)

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

    token_metadata          : tokenMetadataType;
    total_supply            : totalSupplyType;

    snapshotLedger          : snapshotLedgerType;
    snapshot_lookup         : snapshotLookupType;
    snapshotTotalSupply     : snapshotTotalSupplyType;
    token_context           : tokenContextMapType;
    identities              : identityType;

    ledger                  : ledgerType;
    operators               : operatorsType;
]
