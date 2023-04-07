// ------------------------------------------------------------------------------
// Lambda Types
// ------------------------------------------------------------------------------

type lambdaLedgerType is map(string, bytes)
type setLambdaType is [@layout:comb] record [
    name                  : string;
    func_bytes            : bytes;
]

// ------------------------------------------------------------------------------
// Metadata Types
// ------------------------------------------------------------------------------

type metadataType is big_map (string, bytes);
type updateMetadataType is [@layout:comb] record [
    metadataKey           : string;
    metadataHash          : bytes; 
]

// ------------------------------------------------------------------------------
// General Contract Types
// ------------------------------------------------------------------------------

type updateType is 
    |   Update of unit
    |   Remove of unit

type generalContractsType is map (string, address)
type updateGeneralContractsType is [@layout:comb] record [
    generalContractName     : string;
    generalContractAddress  : address;
    updateType              : updateType;
]

// ------------------------------------------------------------------------------
// Whitelist Contract Types
// ------------------------------------------------------------------------------

type whitelistContractsType is map (string, address)
type updateWhitelistContractsType is [@layout:comb] record [
    whitelistContractName     : string;
    whitelistContractAddress  : address;
    updateType                : updateType;
]

// ------------------------------------------------------------------------------
// Whitelist Token Contract Types
// ------------------------------------------------------------------------------

type whitelistTokenContractsType is map (string, address)
type updateWhitelistTokenContractsType is [@layout:comb] record [
    tokenContractName     : string;
    tokenContractAddress  : address;
    updateType            : updateType;
]
