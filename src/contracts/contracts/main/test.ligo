// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// Shared Types
#include "../partials/shared/sharedTypes.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Doorman types
#include "../partials/contractTypes/doormanTypes.ligo"

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Farm types
#include "../partials/contractTypes/farmTypes.ligo"

// FarmFactory Types
#include "../partials/contractTypes/farmFactoryTypes.ligo"

// Treasury Type
#include "../partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Type
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"

// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

// Vestee Types
#include "../partials/contractTypes/vestingTypes.ligo"

// Vault Types 
#include "../partials/contractTypes/vaultTypes.ligo"

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"


type actionType is 
        // Default Entrypoint to Receive Tez
        Default                       of unit
    |   Empty                         of unit

const noOperations : list (operation) = nil;
type return is list (operation) * unit

// function setAdmin (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address),
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%setAdmin",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(address))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(address))
//         ]
//     );
// } with list[contractOperation]

// function setGovernance (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address),
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%setGovernance",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(address))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(address))
//         ]
//     );
// } with list[contractOperation]

// function setName (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         "nameTest",
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%setName",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(string))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(string))
//         ]
//     );
// } with list[contractOperation]

// function setLambda (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record[
//             name="LAMBDANAME";
//             func_bytes=("74657a6f732d73746f726167653a64617461": bytes)
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%setLambda",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(setLambdaType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(setLambdaType))
//         ]
//     );
// } with list[contractOperation]

// function setProductLambda (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record[
//             name="LAMBDANAME";
//             func_bytes=("74657a6f732d73746f726167653a64617461": bytes)
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%setProductLambda",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(setLambdaType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(setLambdaType))
//         ]
//     );
// } with list[contractOperation]

// function updateMetadata (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record[
//             metadataKey="KEY";
//             metadataHash=("74657a6f732d73746f726167653a64617461": bytes)
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%updateMetadata",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(updateMetadataType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(updateMetadataType))
//         ]
//     );
// } with list[contractOperation]

// function updateWhitelistContracts (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record [
//             whitelistContractName     = "CONTRACTNAME";
//             whitelistContractAddress  = ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address);
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%updateWhitelistContracts",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(updateWhitelistContractsType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(updateWhitelistContractsType))
//         ]
//     );
// } with list[contractOperation]

// function updateGeneralContracts (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record [
//             generalContractName     = "CONTRACTNAME";
//             generalContractAddress  = ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address);
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%updateGeneralContracts",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(updateGeneralContractsType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(updateGeneralContractsType))
//         ]
//     );
// } with list[contractOperation]

// function updateWhitelistTokenContracts (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record [
//             tokenContractName     = "CONTRACTNAME";
//             tokenContractAddress  = ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address);
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%updateWhitelistTokenContracts",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(updateWhitelistTokenContractsType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(updateWhitelistTokenContractsType))
//         ]
//     );
// } with list[contractOperation]

function updateDoormanConfig (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            updateConfigNewValue    = 111n; 
            updateConfigAction      = ConfigMinMvkAmount
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(doormanUpdateConfigParamsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(doormanUpdateConfigParamsType))
        ]
    );
} with list[contractOperation]
// TODO: Implement others 

// function pauseAll (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         unit,
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%pauseAll",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(unit))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(unit))
//         ]
//     );
// } with list[contractOperation]

// function unpauseAll (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         unit,
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%unpauseAll",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(unit))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(unit))
//         ]
//     );
// } with list[contractOperation]

function togglePauseDoormanEntrypoint (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            targetEntrypoint  = Stake(True);
            empty             = Unit;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%togglePauseEntrypoint",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(doormanTogglePauseEntrypointType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(doormanTogglePauseEntrypointType))
        ]
    );
} with list[contractOperation]
// TODO: Implement others 

// function updateWhitelistDevelopers (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address),
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%updateWhitelistDevelopers",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(address))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(address))
//         ]
//     );
// } with list[contractOperation]

// function setGovernanceProxy (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address),
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%setGovernanceProxy",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(address))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(address))
//         ]
//     );
// } with list[contractOperation]

// function createFarm (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record[
//             name                     = "FARMNAME";
//             addToGeneralContracts    = True;
//             forceRewardFromTransfer  = False;
//             infinite                 = False;
//             plannedRewards           = record[
//                 totalBlocks              = 66n;
//                 currentRewardPerBlock    = 12345n;
//             ];
//             metadata                 = ("74657a6f732d73746f726167653a64617461": bytes);
//             lpToken                  = record[
//                 tokenAddress             = ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address);
//                 tokenId                  = 1n;
//                 tokenStandard            = (Fa2: lpStandardType);
//             ];
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%createFarm",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(createFarmType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(createFarmType))
//         ]
//     );
// } with list[contractOperation]

// function initFarm (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record[
//             totalBlocks                 = 66n;
//             currentRewardPerBlock       = 12345n;
//             forceRewardFromTransfer     = True;
//             infinite                    = False;
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%initFarm",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(initFarmParamsType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(initFarmParamsType))
//         ]
//     );
// } with list[contractOperation]

// function closeFarm (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         unit,
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%closeFarm",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(unit))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(unit))
//         ]
//     );
// } with list[contractOperation]

// function createTreasury (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record[
//             name                    = "TREASURYTYPE";
//             addToGeneralContracts   = True;
//             metadata                = ("74657a6f732d73746f726167653a64617461": bytes);
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%createTreasury",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(createTreasuryType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(createTreasuryType))
//         ]
//     );
// } with list[contractOperation]

function transfer (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        list[
            record[
                to_       = ("tz1bfkfgQ8EsH9wrFXueAvm8rKRxzab1vQH1" : address);
                amount    = 12345n;
                token     = Fa12(("tz1Zgg2vLeyYLwQCtChXKjYDAXCRowQTzEGw" : address));
            ];
            record[
                to_       = ("tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n" : address);
                amount    = 67890n;
                token     = Fa2(record[
                    tokenContractAddress = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
                    tokenId              = 1n;
                ]);
            ];
            record[
                to_       = ("tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n" : address);
                amount    = 13578n;
                token     = Tez;
            ]
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%transfer",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(transferActionType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(transferActionType))
        ]
    );
} with list[contractOperation]

// function mintMvkAndTransfer (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record [
//             to_ = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
//             amt = 12345n;
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%mintMvkAndTransfer",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(mintMvkAndTransferType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(mintMvkAndTransferType))
//         ]
//     );
// } with list[contractOperation]

function updateMvkOperators (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        list[
            Add_operator(record[
                owner    = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
                operator = ("tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n" : address);
                token_id = 12345n;
            ]);
            Remove_operator(record[
                owner    = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
                operator = ("tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n" : address);
                token_id = 12345n;
            ]);
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateMvkOperators",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(updateOperatorsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(updateOperatorsType))
        ]
    );
} with list[contractOperation]

// function stakeMvk (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         12345n,
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%stakeMvk",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(nat))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(nat))
//         ]
//     );
// } with list[contractOperation]

// function unstakeMvk (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         12345n,
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%unstakeMvk",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(nat))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(nat))
//         ]
//     );
// } with list[contractOperation]

function createAggregator (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record[
            name                  = "TESTAGGREGATOR";
            addToGeneralContracts = True;
            oracleAddresses       = map[
                ("tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n" : address) -> record [
                    oraclePublicKey = ("edpktqePwpgrWGS49FiAMDacb3bLiDLE8BrbLoi6zYdcZ9bttDLo1D" : key);
                    oraclePeerId    = "12D3KooWJQWBQvefFGj3uAzKGhpZYWYGKtj2fNQAG47aov4uj9p1";
                ];
                ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address) -> record [
                    oraclePublicKey = ("edpkv758sKsFGRwE3ZNDR1wdVEnxZui344fsxEtCKbpNMcTaQw2Yis" : key);
                    oraclePeerId    = "12D3KooWBpgAXhUAgjPAwEk5FJ9DRB2kFbuj8KLkPPmqKKmzrXz2";
                ]
            ];
            aggregatorConfig      = record [
                decimals                = 1111n;
                alphaPercentPerThousand = 2222n;
                percentOracleThreshold  = 3333n;
                heartBeatSeconds        = 4444n;
                rewardAmountStakedMvk   = 5555n;
                rewardAmountXtz         = 6666n;
            ];
            metadata              = ("74657a6f732d73746f726167653a64617461": bytes);
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%createAggregator",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(createAggregatorParamsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(createAggregatorParamsType))
        ]
    );
} with list[contractOperation]

// function updateInflationRate (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         12345n,
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%updateInflationRate",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(nat))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(nat))
//         ]
//     );
// } with list[contractOperation]

// function triggerInflation (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         unit,
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%triggerInflation",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(unit))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(unit))
//         ]
//     );
// } with list[contractOperation]

// function trackFarm (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address),
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%trackFarm",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(address))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(address))
//         ]
//     );
// } with list[contractOperation]

// function untrackFarm (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address),
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%untrackFarm",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(address))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(address))
//         ]
//     );
// } with list[contractOperation]

// function addVestee (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record [
//             vesteeAddress        = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
//             totalAllocatedAmount = 111n;
//             cliffInMonths        = 222n;
//             vestingInMonths      = 333n;
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%addVestee",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(addVesteeType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(addVesteeType))
//         ]
//     );
// } with list[contractOperation]

// function removeVestee (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address),
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%removeVestee",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(address))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(address))
//         ]
//     );
// } with list[contractOperation]

// function updateVestee (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         record [
//             vesteeAddress           = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
//             newTotalAllocatedAmount = 111n;
//             newCliffInMonths        = 222n;
//             newVestingInMonths      = 333n;
//         ],
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%updateVestee",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(updateVesteeType))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(updateVesteeType))
//         ]
//     );
// } with list[contractOperation]

// function toggleVesteeLock (const _ : unit) : list(operation) is
// block {
//     const contractOperation : operation = Tezos.transaction(
//         ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address),
//         0tez,
//         case (Tezos.get_entrypoint_opt(
//             "%toggleVesteeLock",
//             ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(address))) of [
//                     Some(contr) -> contr
//                 |   None        -> (failwith(0n) : contract(address))
//         ]
//     );
// } with list[contractOperation]

function setLoanToken1 (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            action = CreateLoanToken(record [
                tokenName                           = "LOANTOKENNAME";
                tokenDecimals                       = 111n;
                oracleAddress                       = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
                mTokenAddress                       = ("tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n" : address);
                reserveRatio                        = 222n;
                optimalUtilisationRate              = 333n;
                baseInterestRate                    = 444n;
                maxInterestRate                     = 555n;
                interestRateBelowOptimalUtilisation = 666n;
                interestRateAboveOptimalUtilisation = 777n;
                minRepaymentAmount                  = 888n;
                tokenType                           = (Tez : tokenType)
            ]);
            empty  = Unit;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setLoanToken",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(setLoanTokenActionType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(setLoanTokenActionType))
        ]
    );
} with list[contractOperation]

function setLoanToken2 (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            action = UpdateLoanToken(record [
                tokenName                           = "LOANTOKENNAME";
                oracleAddress                       = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
                reserveRatio                        = 111n;
                optimalUtilisationRate              = 222n;
                baseInterestRate                    = 333n;
                maxInterestRate                     = 444n;
                interestRateBelowOptimalUtilisation = 555n;
                interestRateAboveOptimalUtilisation = 666n;
                minRepaymentAmount                  = 777n;
                isPaused                            = True;
            ]);
            empty  = Unit;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setLoanToken",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(setLoanTokenActionType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(setLoanTokenActionType))
        ]
    );
} with list[contractOperation]

function setCollateralToken1 (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            action = CreateCollateralToken(record [
                tokenName              = "COLLATERALTOKENNAME";
                tokenContractAddress   = ("tz1dQNGEDPoapnJaK1nX5boVHYKcdtoMjKSq" : address);
                tokenDecimals          = 111n;
                oracleAddress          = ("tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n" : address);
                protected              = True;
                isScaledToken          = False;
                isStakedToken          = False;
                stakingContractAddress = Some(("tz1Zgg2vLeyYLwQCtChXKjYDAXCRowQTzEGw" : address));
                maxDepositAmount       = Some(222n);
                tokenType              = Fa12(("tz1SDg2Wah3wBHFwCK5gYV591BhpLWZTWX42" : address));
            ]);
            empty  = Unit;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setCollateralToken",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(setCollateralTokenActionType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(setCollateralTokenActionType))
        ]
    );
} with list[contractOperation]

function setCollateralToken2 (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            action = UpdateCollateralToken(record [
                tokenName              = "COLLATERALTOKENNAME";
                oracleAddress          = ("tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n" : address);
                isPaused               = False;
                stakingContractAddress = None;
                maxDepositAmount       = Some(111n);
            ]);
            empty  = Unit;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setCollateralToken",
            ("tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" : address)) : option(contract(setCollateralTokenActionType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(setCollateralTokenActionType))
        ]
    );
} with list[contractOperation]

(* main entrypoint *)
function main (const action : actionType; const s : unit) : return is

    case action of [

            // Housekeeping Entrypoints
            Default (_parameters)                -> (toggleVesteeLock(), s)
        |   Empty (_parameters)                  -> ((nil : list(operation)), s)

    ]
