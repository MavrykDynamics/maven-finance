// ------------------------------------------------------------------------------
//
// General Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                                                 = 0n;
[@inline] const error_INCORRECT_TEZ_FEE                                                                                 = 1n;

[@inline] const error_LAMBDA_NOT_FOUND                                                                                  = 2n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                                           = 3n;
[@inline] const error_UNABLE_TO_UNPACK_ACTION_PARAMETER                                                                 = 4n;

[@inline] const error_CALCULATION_ERROR                                                                                 = 5n;
[@inline] const error_CONFIG_VALUE_ERROR                                                                                = 6n;
[@inline] const error_CONFIG_VALUE_TOO_HIGH                                                                             = 7n;
[@inline] const error_CONFIG_VALUE_TOO_LOW                                                                              = 8n;
[@inline] const error_INDEX_OUT_OF_BOUNDS                                                                               = 9n;
[@inline] const error_INVALID_BLOCKS_PER_MINUTE                                                                         = 10n;
[@inline] const error_WRONG_INPUT_PROVIDED                                                                              = 11n;
[@inline] const error_WRONG_TOKEN_TYPE_PROVIDED                                                                         = 12n;
[@inline] const error_TOKEN_NOT_WHITELISTED                                                                             = 13n;

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                                                        = 14n;
[@inline] const error_ONLY_SELF_ALLOWED                                                                                 = 15n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED                                                          = 16n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_FINANCIAL_ALLOWED                                                = 17n;
[@inline] const error_ONLY_COUNCIL_MEMBERS_ALLOWED                                                                      = 18n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_WHITELISTED_ADDRESSES_ALLOWED                                               = 19n;
[@inline] const error_ONLY_WHITELISTED_ADDRESSES_ALLOWED                                                                = 20n;
[@inline] const error_ONLY_PROPOSER_ALLOWED                                                                             = 21n;
[@inline] const error_ONLY_BREAK_GLASS_CONTRACT_OR_DEVELOPERS_OR_PROXY_CONTRACT_ALLOWED                                 = 22n;

[@inline] const error_SPECIFIED_ENTRYPOINT_NOT_FOUND                                                                    = 23n;
[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                                                                    = 24n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND                                                               = 25n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND                                                                   = 26n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_NOT_FOUND                                                           = 27n;
[@inline] const error_BREAK_GLASS_ENTRYPOINT_NOT_FOUND                                                                  = 28n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_NOT_FOUND                                                                    = 29n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_NOT_FOUND                                                                  = 30n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND                                                              = 31n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND                                                   = 32n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND                                                     = 33n;
[@inline] const error_SET_NAME_ENTRYPOINT_NOT_FOUND                                                                     = 34n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND                                             = 35n;
[@inline] const error_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_NOT_FOUND                                                        = 36n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_NOT_FOUND                                                            = 37n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND                                                    = 38n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND                                                     = 39n;

[@inline] const error_COUNCIL_SIZE_EXCEEDED                                                                             = 40n;
[@inline] const error_COUNCIL_MEMBER_ALREADY_EXISTS                                                                     = 41n;
[@inline] const error_COUNCIL_MEMBER_NOT_FOUND                                                                          = 42n;
[@inline] const error_COUNCIL_THRESHOLD_ERROR                                                                           = 43n;
[@inline] const error_COUNCIL_ACTION_NOT_FOUND                                                                          = 44n;
[@inline] const error_COUNCIL_ACTION_EXECUTED                                                                           = 45n;
[@inline] const error_COUNCIL_ACTION_FLUSHED                                                                            = 46n;
[@inline] const error_COUNCIL_ACTION_EXPIRED                                                                            = 47n;
[@inline] const error_COUNCIL_ACTION_PARAMETER_NOT_FOUND                                                                = 48n;
[@inline] const error_COUNCIL_ACTION_ALREADY_SIGNED_BY_SENDER                                                           = 49n;



// ------------------------------------------------------------------------------
//
// MVN Token Error
//
// ------------------------------------------------------------------------------

[@inline] const error_MVN_TOKEN_CONTRACT_NOT_FOUND                                                                      = 50n;
[@inline] const error_ONLY_MVN_TOKEN_CONTRACT_ALLOWED                                                                   = 51n;

[@inline] const error_MAXIMUM_SUPPLY_EXCEEDED                                                                           = 52n;
[@inline] const error_INFLATION_RATE_TOO_HIGH                                                                           = 53n;
[@inline] const error_CANNOT_TRIGGER_INFLATION_NOW                                                                      = 54n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                              = 55n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                         = 56n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                             = 57n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                               = 58n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                      = 59n;
[@inline] const error_ASSERT_METADATA_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                        = 60n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                               = 61n;
[@inline] const error_BALANCE_OF_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                             = 62n;
[@inline] const error_UPDATE_OPERATORS_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                       = 63n;
[@inline] const error_MINT_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                                   = 64n;
[@inline] const error_UPDATE_INFLATION_RATE_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                             = 65n;
[@inline] const error_TRIGGER_INFLATION_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                                 = 66n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                                    = 67n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                        = 68n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                      = 69n;
[@inline] const error_GET_INFLATION_RATE_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                           = 70n;
[@inline] const error_GET_NEXT_INFLATION_TIMESTAMP_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                 = 71n;
[@inline] const error_GET_OPERATOR_OPT_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                             = 72n;
[@inline] const error_GET_BALANCE_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                                  = 73n;
[@inline] const error_GET_TOTAL_SUPPLY_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                             = 74n;
[@inline] const error_GET_MAXIMUM_SUPPLY_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                           = 75n;
[@inline] const error_GET_TOTAL_AND_MAXIMUM_SUPPLY_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND                                 = 76n;



// ------------------------------------------------------------------------------
//
// Break Glass Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_BREAK_GLASS_CONTRACT_NOT_FOUND                                                                    = 77n;
[@inline] const error_ONLY_BREAK_GLASS_CONTRACT_ALLOWED                                                                 = 78n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_GLASS_NOT_BROKEN                                                                                  = 79n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_BREAK_GLASS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 80n;
[@inline] const error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 81n;
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                            = 82n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                       = 83n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                      = 84n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                        = 85n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                           = 86n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                             = 87n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                    = 88n;
[@inline] const error_UPDATE_COUNCIL_MEMBER_INFO_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                           = 89n;
[@inline] const error_ADD_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                   = 90n;
[@inline] const error_REMOVE_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 91n;
[@inline] const error_CHANGE_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 92n;
[@inline] const error_FLUSH_ACTION_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                         = 93n;
[@inline] const error_SIGN_ACTION_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 94n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                           = 95n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                                  = 96n;
[@inline] const error_GET_GLASS_BROKEN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                           = 97n;
[@inline] const error_GET_CONFIG_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                                 = 98n;
[@inline] const error_GET_COUNCIL_MEMBERS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                        = 99n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                    = 100n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                      = 101n;
[@inline] const error_GET_ACTION_OPT_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                             = 102n;
[@inline] const error_GET_ACTION_COUNTER_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                         = 103n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                             = 104n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 105n;



// ------------------------------------------------------------------------------
//
// Council Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                                                                        = 106n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                                                                     = 107n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED                                                    = 108n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_COUNCIL_CONTRACT                                                          = 109n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                           = 110n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                          = 111n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                            = 112n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                               = 113n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                 = 114n;
[@inline] const error_UPDATE_COUNCIL_MEMBER_INFO_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                               = 115n;
[@inline] const error_COUNCIL_ACTION_ADD_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                = 116n;
[@inline] const error_COUNCIL_ACTION_REMOVE_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 117n;
[@inline] const error_COUNCIL_ACTION_CHANGE_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 118n;
[@inline] const error_COUNCIL_ACTION_SET_BAKER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                 = 119n;
[@inline] const error_COUNCIL_ACTION_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                     = 120n;
[@inline] const error_COUNCIL_ACTION_ADD_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                = 121n;
[@inline] const error_COUNCIL_ACTION_REMOVE_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 122n;
[@inline] const error_COUNCIL_ACTION_UPDATE_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 123n;
[@inline] const error_COUNCIL_ACTION_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 124n;
[@inline] const error_COUNCIL_ACTION_TRANSFER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                  = 125n;
[@inline] const error_COUNCIL_ACTION_REQUEST_TOKENS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                            = 126n;
[@inline] const error_COUNCIL_ACTION_REQUEST_MINT_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                              = 127n;
[@inline] const error_COUNCIL_ACTION_SET_CONTRACT_BAKER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 128n;
[@inline] const error_COUNCIL_ACTION_DROP_FINANCIAL_REQ_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 129n;
[@inline] const error_FLUSH_ACTION_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                             = 130n;
[@inline] const error_SIGN_ACTION_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                              = 131n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                               = 132n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                      = 133n;
[@inline] const error_GET_CONFIG_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                     = 134n;
[@inline] const error_GET_COUNCIL_MEMBERS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                            = 135n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                        = 136n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                          = 137n;
[@inline] const error_GET_COUNCIL_ACTION_VIEW_OPT_IN_COUNCIL_CONTRACT_NOT_FOUND                                         = 138n;
[@inline] const error_GET_ACTION_COUNTER_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                             = 139n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                 = 140n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                              = 141n;



// ------------------------------------------------------------------------------
//
// Delegation Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                                                     = 142n;
[@inline] const error_SATELLITE_TREASURY_CONTRACT_NOT_FOUND                                                             = 143n;
[@inline] const error_ONLY_DELEGATION_CONTRACT_ALLOWED                                                                  = 144n;
[@inline] const error_ONLY_SELF_OR_SPECIFIED_ADDRESS_ALLOWED                                                            = 145n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_SATELLITE_ALLOWED                                                                            = 146n;
[@inline] const error_SATELLITE_NOT_ALLOWED                                                                             = 147n;
[@inline] const error_SATELLITE_NOT_FOUND                                                                               = 148n;
[@inline] const error_SATELLITE_ALREADY_EXISTS                                                                          = 149n;

[@inline] const error_SATELLITE_SUSPENDED                                                                               = 150n;
[@inline] const error_SATELLITE_BANNED                                                                                  = 151n;

[@inline] const error_DELEGATE_NOT_ALLOWED                                                                              = 152n;
[@inline] const error_DELEGATE_NOT_FOUND                                                                                = 153n;
[@inline] const error_DELEGATE_ALREADY_EXISTS                                                                           = 154n;
[@inline] const error_ALREADY_DELEGATED_SATELLITE                                                                       = 155n;

[@inline] const error_SATELLITE_REWARDS_NOT_FOUND                                                                       = 156n;
[@inline] const error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND                                                      = 157n;

[@inline] const error_MAXIMUM_AMOUNT_OF_SATELLITES_REACHED                                                              = 158n;
[@inline] const error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT                                                          = 159n;
[@inline] const error_SATELLITE_FEE_EXCEEDS_TOTAL_REWARD                                                                = 160n;
[@inline] const error_INVALID_SATELLITE_STATUS                                                                          = 161n;


// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                    = 162n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                = 163n;
[@inline] const error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                    = 164n;
[@inline] const error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                  = 165n;
[@inline] const error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                  = 166n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                        = 167n;
[@inline] const error_TAKE_SATELLITES_SNAPSHOT_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                 = 168n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                             = 169n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                        = 170n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 171n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                         = 172n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                            = 173n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                              = 174n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                     = 175n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                             = 176n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 177n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 178n;
[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                 = 179n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                             = 180n;
[@inline] const error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                 = 181n;
[@inline] const error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 182n;
[@inline] const error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 183n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                     = 184n;
[@inline] const error_TAKE_SATELLITES_SNAPSHOT_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                              = 185n;
[@inline] const error_ON_STAKE_CHANGE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 186n;
[@inline] const error_UPDATE_SATELLITE_STATUS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 187n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                            = 188n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                                   = 189n;
[@inline] const error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                                  = 190n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                     = 191n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 192n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                      = 193n;
[@inline] const error_GET_DELEGATE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                            = 194n;
[@inline] const error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 195n;
[@inline] const error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                   = 196n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                              = 197n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 198n;

// ------------------------------------------------------------------------------
//
// Doorman Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                                                                        = 199n;
[@inline] const error_ONLY_DOORMAN_CONTRACT_ALLOWED                                                                     = 200n;
[@inline] const error_FARM_TREASURY_CONTRACT_NOT_FOUND                                                                  = 201n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_MIN_STAKED_MVN_AMOUNT_NOT_REACHED                                                                 = 202n;
[@inline] const error_MIN_MVN_AMOUNT_NOT_REACHED                                                                        = 203n;

[@inline] const error_USER_STAKE_RECORD_NOT_FOUND                                                                       = 204n;
[@inline] const error_VAULT_STAKE_RECORD_NOT_FOUND                                                                      = 205n;
[@inline] const error_INSUFFICIENT_STAKED_MVN_BALANCE                                                                   = 206n;
[@inline] const error_UNSTAKE_AMOUNT_CANNOT_BE_GREATER_THAN_STAKED_MVN_TOTAL_SUPPLY                                     = 207n;

[@inline] const error_CANNOT_TRANSFER_MVN_TOKEN_USING_MISTAKEN_TRANSFER                                                 = 208n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                       = 209n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                     = 210n;
[@inline] const error_EXIT_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                        = 211n;
[@inline] const error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                    = 212n;
[@inline] const error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                  = 213n;
[@inline] const error_ON_VAULT_DEPOSIT_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                      = 214n;
[@inline] const error_ON_VAULT_WITHDRAW_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                     = 215n;
[@inline] const error_ON_VAULT_LIQUIDATE_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                    = 216n;


[@inline] const error_ALL_DOORMAN_CONTRACT_ENTRYPOINTS_SHOULD_BE_PAUSED_TO_MIGRATE_FUNDS                                = 217n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                = 218n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                           = 219n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 220n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                            = 221n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                               = 222n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                 = 223n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                        = 224n;
[@inline] const error_MIGRATE_FUNDS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                            = 225n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                = 226n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                              = 227n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                  = 228n;
[@inline] const error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                    = 229n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                  = 230n;
[@inline] const error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                 = 231n;
[@inline] const error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                               = 232n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                               = 233n;
[@inline] const error_ON_VAULT_DEPOSIT_STAKED_MVN_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                              = 234n;
[@inline] const error_ON_VAULT_WITHDRAW_STAKED_MVN_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                             = 235n;
[@inline] const error_ON_VAULT_LIQUIDATE_STAKED_MVN_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                            = 236n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                                      = 237n;
[@inline] const error_GET_CONFIG_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                                     = 238n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                        = 239n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 240n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                         = 241n;
[@inline] const error_GET_USER_STAKE_BALANCE_OPT_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                     = 242n;
[@inline] const error_GET_STAKED_MVN_TOTAL_SUPPLY_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                    = 243n;
[@inline] const error_GET_UNCLAIMED_REWARDS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 244n;
[@inline] const error_GET_ACCUMULATED_FEES_PER_SHARE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                 = 245n;
[@inline] const error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                             = 246n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                                 = 247n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                              = 248n;

// ------------------------------------------------------------------------------
//
// Emergency Governance Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                                           = 249n;
[@inline] const error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED                                                        = 250n;
[@inline] const error_TAX_TREASURY_CONTRACT_NOT_FOUND                                                                   = 251n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_EMERGENCY_GOVERNANCE_ALREADY_IN_THE_PROCESS                                                       = 252n;
[@inline] const error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS                                                           = 253n;
[@inline] const error_EMERGENCY_GOVERNANCE_NOT_FOUND                                                                    = 254n;
[@inline] const error_EMERGENCY_GOVERNANCE_DROPPED                                                                      = 255n;
[@inline] const error_EMERGENCY_GOVERNANCE_EXECUTED                                                                     = 256n;
[@inline] const error_EMERGENCY_GOVERNANCE_EXPIRED                                                                      = 257n;
[@inline] const error_EMERGENCY_GOVERNANCE_VOTE_ALEADY_REGISTERED                                                       = 258n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                   = 259n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                              = 260n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                             = 261n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                               = 262n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                    = 263n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                           = 264n;
[@inline] const error_TRIGGER_EMERGENCY_CONTROL_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                   = 265n;
[@inline] const error_VOTE_FOR_EMERGENCY_CONTROL_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                  = 266n;
[@inline] const error_DROP_EMERGENCY_GOVERNANCE_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                   = 267n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                  = 268n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 269n;
[@inline] const error_GET_CONFIG_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                        = 270n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                             = 271n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                           = 272n;
[@inline] const error_GET_EMERGENCY_GOVERNANCE_OPT_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                      = 273n;
[@inline] const error_GET_EMERGENCY_GOVERNANCE_VOTER_OPT_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                = 274n;
[@inline] const error_GET_CURRENT_EMERGENCY_GOVERNANCE_ID_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND               = 275n;
[@inline] const error_GET_NEXT_EMERGENCY_GOVERNANCE_ID_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                  = 276n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 277n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                 = 278n;

// ------------------------------------------------------------------------------
//
// Farm Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_FARM_CONTRACT_NOT_FOUND                                                                           = 279n;
[@inline] const error_ONLY_FARM_CONTRACT_ALLOWED                                                                        = 280n;
[@inline] const error_ONLY_FARM_FACTORY_OR_COUNCIL_CONTRACT_ALLOWED                                                     = 281n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_OR_FARM_FACTORY_CONTRACT_ALLOWED                                         = 282n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION                                                        = 283n;
[@inline] const error_DEPOSITOR_NOT_FOUND                                                                               = 284n;
[@inline] const error_WITHDRAWN_AMOUNT_TOO_HIGH                                                                         = 285n;
[@inline] const error_NO_FARM_REWARDS_TO_CLAIM                                                                          = 286n;

[@inline] const error_FARM_NOT_INITIATED                                                                                = 287n;
[@inline] const error_FARM_ALREADY_OPEN                                                                                 = 288n;
[@inline] const error_FARM_CLOSED                                                                                       = 289n;
[@inline] const error_DEPOSITOR_NOT_FOUND                                                                               = 290n;

[@inline] const error_CANNOT_TRANSFER_LP_TOKEN_USING_MISTAKEN_TRANSFER                                                  = 291n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                        = 292n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                       = 293n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                          = 294n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 295n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                              = 296n;
[@inline] const error_SET_NAME_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                    = 297n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                             = 298n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                               = 299n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                  = 300n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                    = 301n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                           = 302n;
[@inline] const error_UPDATE_BLOCKS_PER_MINUTE_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                    = 303n;
[@inline] const error_INIT_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 304n;
[@inline] const error_CLOSE_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                  = 305n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 306n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                 = 307n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                     = 308n;
[@inline] const error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                     = 309n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                    = 310n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                       = 311n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                  = 312n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                         = 313n;
[@inline] const error_GET_NAME_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                          = 314n;
[@inline] const error_GET_CONFIG_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                        = 315n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                           = 316n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                             = 317n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                            = 318n;
[@inline] const error_GET_LAST_BLOCK_UPDATE_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                             = 319n;
[@inline] const error_GET_ACCUMULATED_REWARDS_PER_SHARE_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                 = 320n;
[@inline] const error_GET_CLAIMED_REWARDS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                               = 321n;
[@inline] const error_GET_DEPOSITOR_OPT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                 = 322n;
[@inline] const error_GET_OPEN_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                          = 323n;
[@inline] const error_GET_INIT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                          = 324n;
[@inline] const error_GET_INIT_BLOCK_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                    = 325n;
[@inline] const error_GET_MIN_BLOCK_TIME_SNAPSHOT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                       = 326n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                    = 327n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                 = 328n;

// ------------------------------------------------------------------------------
//
// Farm Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_FARM_FACTORY_CONTRACT_NOT_FOUND                                                                   = 329n;
[@inline] const error_ONLY_FARM_FACTORY_CONTRACT_ALLOWED                                                                = 330n;
[@inline] const error_ONLY_ADMIN_OR_FARM_FACTORY_CONTRACT_ALLOWED                                                       = 331n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_FARM_ALREADY_TRACKED                                                                              = 332n;
[@inline] const error_FARM_NOT_TRACKED                                                                                  = 333n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                            = 334n;
[@inline] const error_CREATE_FARM_M_TOKEN_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                    = 335n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                             = 336n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                           = 337n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                           = 338n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                      = 339n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                     = 340n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                       = 341n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                          = 342n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                            = 343n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                   = 344n;
[@inline] const error_UPDATE_BLOCKS_PER_MINUTE_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                            = 345n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                           = 346n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 347n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                             = 348n;
[@inline] const error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 349n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                          = 350n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                        = 351n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                          = 352n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                  = 353n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_CHECK_FARM_EXISTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 354n;
[@inline] const error_GET_ADMIN_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                                 = 355n;
[@inline] const error_GET_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                                = 356n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                    = 357n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                   = 358n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                     = 359n;
[@inline] const error_GET_TRACKED_FARMS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 360n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                            = 361n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 362n;
[@inline] const error_GET_PRODUCT_LAMBDA_OPT_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                    = 363n;
[@inline] const error_GET_PRODUCT_LAMBDA_LEDGER_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                 = 364n;

// ------------------------------------------------------------------------------
//
// Governance Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_CONTRACT_NOT_FOUND                                                                     = 365n;
[@inline] const error_ONLY_GOVERNANCE_CONTRACT_ALLOWED                                                                  = 366n;
[@inline] const error_PAYMENT_TREASURY_CONTRACT_NOT_FOUND                                                               = 367n;
[@inline] const error_PROPOSE_TAX_TREASURY_CONTRACT_NOT_FOUND                                                           = 368n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND                                                             = 369n;
[@inline] const error_ONLY_ACCESSIBLE_DURING_VOTING_ROUND                                                               = 370n;
[@inline] const error_ONLY_ACCESSIBLE_DURING_TIMELOCK_ROUND                                                             = 371n;
[@inline] const error_SNAPSHOT_NOT_READY                                                                                = 372n;
[@inline] const error_SNAPSHOT_NOT_FOUND                                                                                = 373n;
[@inline] const error_SATELLITE_DID_NOT_CREATE_SNAPSHOT_FOR_THIS_CYCLE                                                  = 374n;
[@inline] const error_SATELLITE_LAST_SNAPSHOT_NOT_FOUND                                                                 = 375n;
[@inline] const error_HIGHEST_VOTED_PROPOSAL_NOT_FOUND                                                                  = 376n;
[@inline] const error_PROPOSAL_NOT_FOUND                                                                                = 377n;
[@inline] const error_PROPOSAL_LOCKED                                                                                   = 378n;
[@inline] const error_PROPOSAL_CANNOT_BE_EXECUTED_NOW                                                                   = 379n;
[@inline] const error_PROPOSAL_DROPPED                                                                                  = 380n;
[@inline] const error_PROPOSAL_EXECUTED                                                                                 = 381n;
[@inline] const error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE                                                                   = 382n;
[@inline] const error_PROPOSAL_DATA_NOT_FOUND                                                                           = 383n;
[@inline] const error_PAYMENT_DATA_NOT_FOUND                                                                            = 384n;
[@inline] const error_PROPOSAL_EXECUTION_ALREADY_STARTED                                                                = 385n;
[@inline] const error_PROPOSAL_NOT_EXECUTED                                                                             = 386n;
[@inline] const error_PROPOSAL_PAYMENTS_PROCESSED                                                                       = 387n;
[@inline] const error_PROPOSAL_NOT_LOCKED                                                                               = 388n;
[@inline] const error_NO_PROPOSAL_TO_VOTE_FOR                                                                           = 389n;
[@inline] const error_NO_PROPOSAL_TO_EXECUTE                                                                            = 390n;
[@inline] const error_VOTE_NOT_FOUND                                                                                    = 391n;
[@inline] const error_PROPOSAL_REWARD_ALREADY_CLAIMED                                                                   = 392n;
[@inline] const error_PROPOSAL_REWARD_CANNOT_BE_CLAIMED                                                                 = 393n;
[@inline] const error_VOTE_ALREADY_RECORDED                                                                             = 394n;
[@inline] const error_CURRENT_ROUND_NOT_FINISHED                                                                        = 395n;
[@inline] const error_MAX_PROPOSAL_REACHED                                                                              = 396n;
[@inline] const error_DEVELOPER_NOT_WHITELISTED                                                                         = 397n;
[@inline] const error_AT_LEAST_ONE_WHITELISTED_DEVELOPER_REQUIRED                                                       = 398n;
[@inline] const error_STAKED_MVN_SNAPSHOT_FOR_CYCLE_NOT_FOUND                                                           = 399n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                             = 400n;
[@inline] const error_SET_GOVERNANCE_PROXY_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                  = 401n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                       = 402n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 403n;
[@inline] const error_UPDATE_WHITELIST_DEVELOPERS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                           = 404n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                            = 405n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                      = 406n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 407n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 408n;
[@inline] const error_SET_CONTRACT_ADMIN_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 409n;
[@inline] const error_SET_CONTRACT_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                               = 410n;
[@inline] const error_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 411n;
[@inline] const error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                 = 412n;
[@inline] const error_UPDATE_SATELLITE_SNAPSHOT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                             = 413n;
[@inline] const error_START_NEXT_ROUND_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 414n;
[@inline] const error_PROPOSE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                               = 415n;
[@inline] const error_PROPOSAL_ROUND_VOTE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                   = 416n;
[@inline] const error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 417n;
[@inline] const error_ADD_UPDATE_PAYMENT_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                               = 418n;
[@inline] const error_LOCK_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 419n;
[@inline] const error_VOTING_ROUND_VOTE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 420n;
[@inline] const error_EXECUTE_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 421n;
[@inline] const error_PROCESS_PROPOSAL_PAYMENT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 422n;
[@inline] const error_PROCESS_PROPOSAL_SINGLE_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                          = 423n;
[@inline] const error_DROP_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 424n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 425n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                                   = 426n;
[@inline] const error_GET_CONFIG_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                                  = 427n;
[@inline] const error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                = 428n;
[@inline] const error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 429n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                       = 430n;
[@inline] const error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 431n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 432n;
[@inline] const error_GET_PROPOSAL_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 433n;
[@inline] const error_GET_PROPOSAL_VOTER_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 434n;
[@inline] const error_GET_PROPOSAL_REWARD_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 435n;
[@inline] const error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 436n;
[@inline] const error_GET_SATELLITE_LAST_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                             = 437n;
[@inline] const error_GET_STAKED_MVN_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                 = 438n;
[@inline] const error_GET_CURRENT_CYCLE_INFO_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 439n;
[@inline] const error_GET_CYCLE_PROPOSALS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 440n;
[@inline] const error_GET_CYCLE_PROPOSER_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 441n;
[@inline] const error_GET_ROUND_VOTE_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                          = 442n;
[@inline] const error_GET_NEXT_PROPOSAL_ID_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                        = 443n;
[@inline] const error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 444n;
[@inline] const error_GET_CYCLE_HIGHEST_VOTED_PROPOSAL_ID_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                         = 445n;
[@inline] const error_GET_TIMELOCK_PROPOSAL_ID_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 446n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                              = 447n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 448n;

// ------------------------------------------------------------------------------
//
// Governance Financial Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                                           = 449n;
[@inline] const error_ONLY_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED                                                        = 450n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED                                               = 451n;
// CONTRACT SPECIFIC ERRORS
[@inline] const error_FINANCIAL_REQUEST_NOT_FOUND                                                                       = 452n;
[@inline] const error_FINANCIAL_REQUEST_EXECUTED                                                                        = 453n;
[@inline] const error_FINANCIAL_REQUEST_EXPIRED                                                                         = 454n;
[@inline] const error_FINANCIAL_REQUEST_DROPPED                                                                         = 455n;
[@inline] const error_FINANCIAL_REQUEST_SNAPSHOT_NOT_FOUND                                                              = 456n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                   = 457n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                              = 458n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                             = 459n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                               = 460n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND            = 461n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                    = 462n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                           = 463n;
[@inline] const error_REQUEST_TOKENS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                              = 464n;
[@inline] const error_REQUEST_MINT_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                = 465n;
[@inline] const error_SET_CONTRACT_BAKER_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                          = 466n;
[@inline] const error_DROP_FINANCIAL_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                      = 467n;
[@inline] const error_VOTE_FOR_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                            = 468n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                         = 469n;
[@inline] const error_GET_CONFIG_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                        = 470n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                 = 471n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                     = 472n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                             = 473n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                           = 474n;
[@inline] const error_GET_FINANCIAL_REQUEST_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                         = 475n;
[@inline] const error_GET_FINANCIAL_REQUEST_COUNTER_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                     = 476n;
[@inline] const error_GET_FINANCIAL_REQUEST_VOTER_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                   = 477n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                    = 478n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                 = 479n;

// ------------------------------------------------------------------------------
//
// Governance Proxy Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                                               = 480n;
[@inline] const error_ONLY_GOVERNANCE_PROXY_CONTRACT_ALLOWED                                                            = 481n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA                                                         = 482n;
[@inline] const error_DATA_PACKING_HELPER_ENTRYPOINT_SHOULD_NOT_BE_CALLED                                               = 483n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                       = 484n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                  = 485n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                 = 486n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                               = 487n;
[@inline] const error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                       = 488n;
[@inline] const error_DATA_PACKING_HELPER_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                             = 489n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                      = 490n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                             = 491n;
[@inline] const error_GET_GOVERNANCE_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                        = 492n;

// ------------------------------------------------------------------------------
//
// Treasury Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TREASURY_CONTRACT_NOT_FOUND                                                                       = 493n;
[@inline] const error_ONLY_TREASURY_CONTRACT_ALLOWED                                                                    = 494n;
[@inline] const error_ONLY_ADMIN_OR_TREASURY_FACTORY_CONTRACT_ALLOWED                                                   = 495n;

[@inline] const error_UPDATE_OPERATORS_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND                                           = 496n;
[@inline] const error_STAKE_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND                                                      = 497n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND                                                    = 498n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                                   = 499n;
[@inline] const error_MINT_MVN_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                      = 500n;
[@inline] const error_UPDATE_TOKEN_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                     = 501n;
[@inline] const error_STAKE_TOKENS_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                               = 502n;
[@inline] const error_UNSTAKE_TOKENS_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                             = 503n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 504n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                          = 505n;
[@inline] const error_SET_BAKER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 506n;
[@inline] const error_SET_NAME_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                                = 507n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                         = 508n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                              = 509n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                = 510n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                        = 511n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                        = 512n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 513n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 514n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                 = 515n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                                = 516n;
[@inline] const error_MINT_MVN_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                   = 517n;
[@inline] const error_UPDATE_MVN_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                    = 518n;
[@inline] const error_STAKE_MVN_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 519n;
[@inline] const error_UNSTAKE_MVN_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 520n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                                     = 521n;
[@inline] const error_GET_NAME_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                                      = 522n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                        = 523n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                 = 524n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                       = 525n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                         = 526n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                                = 527n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 528n;

// ------------------------------------------------------------------------------
//
// Treasury Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                                               = 529n;
[@inline] const error_ONLY_TREASURY_FACTORY_CONTRACT_ALLOWED                                                            = 530n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_TREASURY_ALREADY_TRACKED                                                                          = 531n;
[@inline] const error_TREASURY_NOT_TRACKED                                                                              = 532n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                    = 533n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                     = 534n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                   = 535n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                       = 536n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                  = 537n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 538n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                   = 539n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                      = 540n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                = 541n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                        = 542n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                               = 543n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                       = 544n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                     = 545n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                         = 546n;
[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 547n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                  = 548n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 549n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                      = 550n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                              = 551n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_CHECK_TREASURY_EXISTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 552n;
[@inline] const error_GET_ADMIN_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                             = 553n;
[@inline] const error_GET_CONFIG_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                            = 554n;
[@inline] const error_GET_TRACKED_TREASURIES_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 555n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 556n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                         = 557n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                               = 558n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 559n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                        = 560n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                     = 561n;
[@inline] const error_GET_PRODUCT_LAMBDA_OPT_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 562n;
[@inline] const error_GET_PRODUCT_LAMBDA_LEDGER_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                             = 563n;

// ------------------------------------------------------------------------------
//
// Vesting Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_VESTING_CONTRACT_NOT_FOUND                                                                        = 564n;
[@inline] const error_ONLY_VESTING_CONTRACT_ALLOWED                                                                     = 565n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_NO_VESTING_REWARDS_TO_CLAIM                                                                       = 566n;
[@inline] const error_CANNOT_CLAIM_VESTING_REWARDS_NOW                                                                  = 567n;

[@inline] const error_VESTING_IN_MONTHS_TOO_SHORT                                                                       = 568n;
[@inline] const error_CLIFF_PERIOD_TOO_LONG                                                                             = 569n;

[@inline] const error_VESTEE_ALREADY_EXISTS                                                                             = 570n;
[@inline] const error_VESTEE_NOT_FOUND                                                                                  = 571n;
[@inline] const error_VESTEE_LOCKED                                                                                     = 572n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                                = 573n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                           = 574n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                          = 575n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                               = 576n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                 = 577n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                        = 578n;
[@inline] const error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                               = 579n;
[@inline] const error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                            = 580n;
[@inline] const error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                            = 581n;
[@inline] const error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                       = 582n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                                    = 583n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                               = 584n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                      = 585n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                        = 586n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                          = 587n;
[@inline] const error_GET_TOTAL_VESTED_AMOUNT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                        = 588n;
[@inline] const error_GET_VESTEE_BALANCE_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                             = 589n;
[@inline] const error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                 = 590n;
[@inline] const error_GET_TOTAL_VESTED_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                               = 591n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                 = 592n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                              = 593n;

// ------------------------------------------------------------------------------
//
// Aggregator Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_AGGREGATOR_CONTRACT_NOT_FOUND                                                                     = 594n;
[@inline] const error_ONLY_AGGREGATOR_CONTRACT_ALLOWED                                                                  = 595n;
[@inline] const error_AGGREGATOR_CONTRACT_EXISTS                                                                        = 596n;
[@inline] const error_ONLY_AUTHORIZED_ORACLES_ALLOWED                                                                   = 597n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_ALLOWED                                                        = 598n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_SATELLITE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                 = 599n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_OR_GOVERNANCE_SATELLITE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED   = 600n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ORACLE_ALREADY_ADDED_TO_AGGREGATOR                                                                = 601n;
[@inline] const error_ORACLE_NOT_PRESENT_IN_AGGREGATOR                                                                  = 602n;


// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_UPDATE_DATA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                              = 603n;
[@inline] const error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                      = 604n;
[@inline] const error_WITHDRAW_REWARD_STAKED_MVN_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                               = 605n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                             = 606n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 607n;
[@inline] const error_SET_MAINTAINER_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 608n;
[@inline] const error_SET_NAME_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                              = 609n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                       = 610n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                         = 611n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                            = 612n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                              = 613n;
[@inline] const error_ADD_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                            = 614n;
[@inline] const error_REMOVE_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                         = 615n;

[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                             = 616n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 617n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                               = 618n;

[@inline] const error_REQUEST_RATE_UPDATE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                   = 619n;
[@inline] const error_SET_OBSERVATION_REVEAL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                = 620n;
[@inline] const error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                   = 621n;
[@inline] const error_WITHDRAW_REWARD_STAKED_MVN_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                            = 622n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 623n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                            = 624n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                   = 625n;
[@inline] const error_GET_NAME_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                    = 626n;
[@inline] const error_GET_CONFIG_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                  = 627n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                      = 628n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 629n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                       = 630n;
[@inline] const error_GET_ORACLE_ADDRESSES_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 631n;
[@inline] const error_GET_ORACLE_REWARDS_STAKED_MVN_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                               = 632n;
[@inline] const error_GET_ORACLE_REWARDS_XTZ_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                      = 633n;
[@inline] const error_GET_LAST_COMPLETED_DATA_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 634n;
[@inline] const error_GET_DECIMALS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                = 635n;
[@inline] const error_GET_CONTRACT_NAME_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 636n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                              = 637n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 638n;

// ------------------------------------------------------------------------------
//
// Aggregator Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                                             = 639n;
[@inline] const error_ONLY_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                                          = 640n;
[@inline] const error_ONLY_ADMIN_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                                 = 641n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_SENDER_IS_NOT_TRACKED_AGGREGATOR                                                                  = 642n;
[@inline] const error_ACTION_FAILED_AS_SATELLITE_IS_NOT_REGISTERED                                                      = 643n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                   = 644n;
[@inline] const error_AGGREGATOR_ALREADY_TRACKED                                                                        = 645n;
[@inline] const error_AGGREGATOR_NOT_TRACKED                                                                            = 646n;
[@inline] const error_WRONG_SIGNATURES_MAP_SIZE                                                                         = 647n;
[@inline] const error_WRONG_OBSERVATIONS_MAP_SIZE                                                                       = 648n;
[@inline] const error_WRONG_SIGNATURE_IN_OBSERVATIONS_MAP                                                               = 649n;
[@inline] const error_ACTION_FAILED_AS_ORACLE_IS_NOT_REGISTERED                                                         = 650n;
[@inline] const error_WRONG_AGGREGATOR_ADDRESS_IN_OBSERVATIONS_MAP                                                      = 651n;
[@inline] const error_OBSERVATION_MADE_BY_WRONG_ORACLE                                                                  = 652n;
[@inline] const error_DIFFERENT_EPOCH_IN_OBSERVATIONS_MAP                                                               = 653n;
[@inline] const error_DIFFERENT_ROUND_IN_OBSERVATIONS_MAP                                                               = 654n;
[@inline] const error_EPOCH_SHOULD_BE_GREATER_THAN_PREVIOUS_RESULT                                                      = 655n;
[@inline] const error_ROUND_SHOULD_BE_GREATER_THAN_PREVIOUS_RESULT                                                      = 656n;


// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                                = 657n;
[@inline] const error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                                 = 658n;
[@inline] const error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                               = 659n;
[@inline] const error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                            = 660n;
[@inline] const error_DISTRIBUTE_REWARD_STAKED_MVN_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                     = 661n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                     = 662n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                = 663n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                               = 664n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                 = 665n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                    = 666n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                      = 667n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                     = 668n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                   = 669n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                       = 670n;
[@inline] const error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 671n;
[@inline] const error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                              = 672n;
[@inline] const error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                            = 673n;
[@inline] const error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                         = 674n;
[@inline] const error_DISTRIBUTE_REWARD_STAKED_MVN_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                  = 675n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 676n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                    = 677n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                            = 678n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                           = 679n;
[@inline] const error_GET_CONFIG_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                          = 680n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                              = 681n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                              = 682n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 683n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                               = 684n;
[@inline] const error_GET_TRACKED_AGGREGATORS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 685n;
[@inline] const error_GET_AGGREGATOR_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                      = 686n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                      = 687n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                   = 688n;



// ------------------------------------------------------------------------------
//
// Governance Satellite Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                                           = 689n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED                                               = 690n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_WHITELISTED_ADDRESSES_OR_AGGREGATOR_ALLOWED                                 = 691n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_INITIATOR_CAN_DROP_ACTION                                                                    = 692n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_DROPPED                                                               = 693n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_NOT_FOUND                                                             = 694n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_EXECUTED                                                              = 695n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_EXPIRED                                                               = 696n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_SNAPSHOT_NOT_FOUND                                                    = 697n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_PARAMETER_NOT_FOUND                                                   = 698n;
[@inline] const error_SATELLITE_ACTIONS_NOT_FOUND                                                                       = 699n;

[@inline] const error_MAX_GOVERNANCE_SATELLITE_ACTIONS_REACHED                                                          = 700n;

[@inline] const error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION                                             = 701n;
[@inline] const error_ONLY_SATELLITES_ALLOWED_TO_VOTE_FOR_GOVERNANCE_ACTION                                             = 702n;
[@inline] const error_SNAPSHOT_STAKED_MVN_TOTAL_SUPPLY_NOT_FOUND                                                        = 703n;

[@inline] const error_SATELLITE_SUBSCRIBED_AGGREGATORS_NOT_FOUND                                                        = 704n;
[@inline] const error_ORACLE_NOT_FOUND                                                                                  = 705n;
[@inline] const error_ORACLE_INFORMATION_NOT_FOUND                                                                      = 706n;
[@inline] const error_AGGREGATOR_NEW_STATUS_NOT_FOUND                                                                   = 707n;
[@inline] const error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND                                               = 708n;
[@inline] const error_WRONG_AGGREGATOR_ADDRESS_PROVIDED                                                                 = 709n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                   = 710n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                              = 711n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                             = 712n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                               = 713n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                  = 714n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                    = 715n;
[@inline] const error_SUSPEND_SATELLITE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                           = 716n;
[@inline] const error_BAN_SATELLITE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                               = 717n;
[@inline] const error_RESTORE_SATELLITE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                           = 718n;
[@inline] const error_REMOVE_ALL_SATELLITE_ORACLES_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                = 719n;
[@inline] const error_ADD_ORACLE_TO_AGGREGATOR_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                    = 720n;
[@inline] const error_REMOVE_ORACLE_IN_AGGREGATOR_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                 = 721n;
[@inline] const error_SET_AGGREGATOR_REFERENCE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                    = 722n;
[@inline] const error_TOGGLE_PAUSE_AGGREGATOR_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                     = 723n;
[@inline] const error_FIX_MISTAKEN_TRANSFER_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                       = 724n;
[@inline] const error_DROP_ACTION_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                 = 725n;
[@inline] const error_VOTE_FOR_ACTION_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                             = 726n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                  = 727n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                           = 728n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                         = 729n;
[@inline] const error_GET_CONFIG_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                        = 730n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                            = 731n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                           = 732n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                             = 733n;
[@inline] const error_GET_GOVERNANCE_SATELLITE_ACTION_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND               = 734n;
[@inline] const error_GET_GOVERNANCE_SATELLITE_ACTION_COUNTER_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND           = 735n;
[@inline] const error_GET_GOVERNANCE_SATELLITE_VOTER_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                = 736n;
[@inline] const error_GET_ACTIONS_INITATOR_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                          = 737n;
[@inline] const error_GET_GOVERNANCE_CYCLE_SNAPSHOT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                     = 738n;
[@inline] const error_GET_SATELLITE_ORACLE_RECORD_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                   = 739n;
[@inline] const error_GET_AGGREGATOR_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                = 740n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                    = 741n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                 = 742n;



// ------------------------------------------------------------------------------
//
// Token Sale Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_MVN_PAY_AMOUNT_NOT_MET                                                                            = 743n;
[@inline] const error_MIN_MVN_AMOUNT_NOT_REACHED                                                                        = 744n;
[@inline] const error_TOKEN_SALE_HAS_NOT_STARTED                                                                        = 745n;
[@inline] const error_TOKEN_SALE_HAS_ENDED                                                                              = 746n;
[@inline] const error_TOKEN_SALE_HAS_NOT_ENDED                                                                          = 747n;
[@inline] const error_TOKEN_SALE_IS_PAUSED                                                                              = 748n;
[@inline] const error_TOKEN_SALE_IS_NOT_PAUSED                                                                          = 749n;
[@inline] const error_WHITELIST_SALE_HAS_NOT_STARTED                                                                    = 750n;
[@inline] const error_USER_IS_NOT_WHITELISTED                                                                           = 751n;
[@inline] const error_MAX_AMOUNT_WHITELIST_WALLET_EXCEEDED                                                              = 752n;
[@inline] const error_MIN_AMOUNT_NOT_REACHED                                                                            = 753n;
[@inline] const error_MAX_AMOUNT_CLAIMED                                                                                = 754n;
[@inline] const error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED                                                              = 755n;
[@inline] const error_MAX_AMOUNT_CAP_EXCEEDED                                                                           = 756n;
[@inline] const error_BUY_OPTION_NOT_FOUND                                                                              = 757n;
[@inline] const error_USER_TOKEN_SALE_RECORD_NOT_FOUND                                                                  = 758n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                             = 759n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                       = 760n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                         = 761n;
[@inline] const error_SET_WHITELIST_DATETIME_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                = 762n;
[@inline] const error_ADD_TO_WHITELIST_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                      = 763n;
[@inline] const error_REMOVE_FROM_WHITELIST_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                 = 764n;
[@inline] const error_START_SALE_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                            = 765n;
[@inline] const error_CLOSE_SALE_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                            = 766n;
[@inline] const error_PAUSE_SALE_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                            = 767n;
[@inline] const error_BUY_TOKENS_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                            = 768n;
[@inline] const error_CLAIM_TOKENS_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                          = 769n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                                   = 770n;
[@inline] const error_GET_CONFIG_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                                  = 771n;
[@inline] const error_GET_TREASURY_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                        = 772n;
[@inline] const error_GET_WHITELISTED_ADDRESS_OPT_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                 = 773n;
[@inline] const error_GET_TOKEN_SALE_RECORD_OPT_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                   = 774n;
[@inline] const error_GET_WHITELIST_START_TIMESTAMP_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                               = 775n;
[@inline] const error_GET_WHITELIST_END_TIMESTAMP_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                 = 776n;
[@inline] const error_GET_TOKEN_SALE_HAS_STARTED_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                  = 777n;
[@inline] const error_GET_TOKEN_SALE_HAS_ENDED_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                    = 778n;
[@inline] const error_GET_TOKEN_SALE_END_TIMESTAMP_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                = 779n;
[@inline] const error_GET_TOKEN_SALE_END_BLOCK_LEVEL_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                              = 780n;

// ------------------------------------------------------------------------------
//
// USDM Token Controller Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_USDM_TOKEN_CONTROLLER_CONTRACT_NOT_FOUND                                                          = 781n;
[@inline] const error_ONLY_USDM_TOKEN_CONTROLLER_CONTRACT_ALLOWED                                                       = 782n;


// ------------------------------------------------------------------------------
//
// Token Pool Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TOKEN_POOL_CONTRACT_NOT_FOUND                                                                     = 783n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                              = 784n;
[@inline] const error_INSUFFICIENT_TOKENS_IN_TOKEN_POOL_TO_BE_BORROWED                                                  = 785n;

[@inline] const error_ON_BORROW_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                             = 786n;
[@inline] const error_ON_REPAY_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                              = 787n;
[@inline] const error_TOKEN_POOL_RESERVES_RATIO_NOT_MET                                                                 = 788n;
[@inline] const error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT                                                             = 789n;
[@inline] const error_DEPOSITOR_RECORD_NOT_FOUND                                                                        = 790n;
[@inline] const error_UPDATE_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                        = 791n;



// ------------------------------------------------------------------------------
//
// Token Pool Reward Errors
//
// ------------------------------------------------------------------------------


[@inline] const error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND                                                              = 792n;
[@inline] const error_TOKEN_POOL_REWARDS_RECORD_NOT_FOUND                                                               = 793n;

[@inline] const error_UPDATE_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_REWARD_CONTRACT_PAUSED                                    = 794n;
[@inline] const error_CLAIM_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_REWARD_CONTRACT_PAUSED                                     = 795n;
[@inline] const error_UPDATE_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND                                 = 796n;
[@inline] const error_CLAIM_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND                                  = 797n;

[@inline] const error_ONLY_WHITELISTED_LP_TOKEN_CONTRACT_ADDRESSES_ALLOWED                                              = 798n;


// ------------------------------------------------------------------------------
//
// Vault Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_NOT_AUTHORISED_TO_DEPOSIT_INTO_VAULT                                                              = 799n;
[@inline] const error_NOT_AUTHORISED_TO_WITHDRAW_FROM_VAULT                                                             = 800n;
[@inline] const error_AMOUNT_NOT_EQUAL_TO_DEPOSIT                                                                       = 801n;

[@inline] const error_ONLY_VAULT_OWNER_ALLOWED                                                                          = 802n;
[@inline] const error_INVALID_DEPOSITORS_CONFIG                                                                         = 803n;
[@inline] const error_INVALID_UPDATE_DEPOSITORS_CONFIGURATION                                                           = 804n;
[@inline] const error_VAULT_LAMBDA_NOT_FOUND_IN_VAULT_FACTORY_VAULT_LAMBDA_LEDGER                                       = 805n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                                  = 806n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                             = 807n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                            = 808n;
[@inline] const error_DELEGATE_TEZ_TO_BAKER_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                      = 809n;
[@inline] const error_VAULT_DELEGATE_MVN_TO_SATELLITE_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                            = 810n;
[@inline] const error_VAULT_DEPOSIT_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                              = 811n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                                   = 812n;
[@inline] const error_ON_LIQUIDATE_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                               = 813n;
[@inline] const error_VAULT_UPDATE_DEPOSITOR_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                     = 814n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                                 = 815n;
[@inline] const error_INIT_VAULT_ACTION_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                          = 816n;

// VIEWS NOT FOUND ERRORS

[@inline] const error_CANNOT_DEPOSIT_PROTECTED_COLLATERAL_TOKEN                                                         = 817n;
[@inline] const error_CANNOT_WITHDRAW_PROTECTED_COLLATERAL_TOKEN                                                        = 818n;


// ------------------------------------------------------------------------------
//
// Vault Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_VAULT_FACTORY_CONTRACT_NOT_FOUND                                                                  = 819n;
[@inline] const error_ONLY_VAULT_FACTORY_CONTRACT_ALLOWED                                                               = 820n;

[@inline] const error_CREATE_VAULT_ENTRYPOINT_IN_VAULT_FACTORY_CONTRACT_PAUSED                                          = 821n;
[@inline] const error_CREATE_VAULT_ENTRYPOINT_IN_VAULT_FACTORY_CONTRACT_NOT_FOUND                                       = 822n;

[@inline] const error_GET_VAULT_LAMBDA_OPT_NOT_FOUND_IN_VAULT_FACTORY                                                   = 823n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_NOT_FOUND_IN_VAULT_FACTORY                                            = 824n;
[@inline] const error_GET_CONFIG_VIEW_IN_VAULT_FACTORY_CONTRACT_NOT_FOUND                                               = 825n;

// ------------------------------------------------------------------------------
//
// Lending Controller Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                                                             = 826n;

[@inline] const error_ONLY_LENDING_CONTROLLER_CONTRACT_ALLOWED                                                          = 827n;

[@inline] const error_VAULT_ALREADY_EXISTS                                                                              = 828n;
[@inline] const error_VAULT_CONTRACT_NOT_FOUND                                                                          = 829n;
[@inline] const error_VAULT_ID_ALREADY_USED                                                                             = 830n;
[@inline] const error_VAULT_IS_UNDERCOLLATERIZED                                                                        = 831n;
[@inline] const error_TOTAL_SERVICE_LOAN_FEE_CANNOT_BE_GREATER_THAN_BORROWED_AMOUNT                                     = 832n;
[@inline] const error_LOAN_FEE_CANNOT_BE_GREATER_THAN_BORROWED_AMOUNT                                                   = 833n;
[@inline] const error_BORROW_CALLBACK_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                       = 834n;
[@inline] const error_REPAY_CALLBACK_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                        = 835n;
[@inline] const error_LOAN_OUTSTANDING_MISCALCULATION                                                                   = 836n;
[@inline] const error_PRINCIPAL_REDUCTION_MISCALCULATION                                                                = 837n;
[@inline] const error_LOAN_INTEREST_MISCALCULATION                                                                      = 838n;
[@inline] const error_LOAN_OUTSTANDING_IS_NOT_ZERO                                                                      = 839n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND                                       = 840n;
[@inline] const error_STAKING_CONTRACT_ADDRESS_FOR_STAKED_TOKEN_NOT_FOUND                                               = 841n;
[@inline] const error_INCORRECT_LOAN_TOKEN_AMOUNT_SENT                                                                  = 842n;
[@inline] const error_INCORRECT_COLLATERAL_TOKEN_AMOUNT_SENT                                                            = 843n;
[@inline] const error_ONLY_VAULT_OR_VAULT_FACTORY_CONTRACT_ALLOWED                                                      = 844n;
[@inline] const error_LAST_COMPLETED_DATA_NOT_FRESH                                                                     = 845n;


[@inline] const error_LOAN_TOKEN_IS_PAUSED                                                                              = 846n;
[@inline] const error_COLLATERAL_TOKEN_IS_PAUSED                                                                        = 847n;


// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_SET_LOAN_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                   = 848n;
[@inline] const error_ADD_LIQUIDITY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                    = 849n;
[@inline] const error_REMOVE_LIQUIDITY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                 = 850n;
[@inline] const error_SET_COLLATERAL_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                             = 851n;
[@inline] const error_REGISTER_VAULT_CREATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                          = 852n;
[@inline] const error_CLOSE_VAULT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                      = 853n;
[@inline] const error_REGISTER_DEPOSIT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                 = 854n;
[@inline] const error_REGISTER_WITHDRAWAL_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                              = 855n;
[@inline] const error_MARK_FOR_LIQUIDATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                             = 856n;
[@inline] const error_LIQUIDATE_VAULT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                  = 857n;
[@inline] const error_BORROW_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                           = 858n;
[@inline] const error_REPAY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                            = 859n;
[@inline] const error_VAULT_DEPOSIT_STAKED_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                       = 860n;
[@inline] const error_VAULT_WITHDRAW_STAKED_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                      = 861n;

[@inline] const error_VAULT_DELEGATE_TEZ_TO_BAKER_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                 = 862n;
[@inline] const error_VAULT_DELEGATE_MVN_TO_SAT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                   = 863n;
[@inline] const error_VAULT_DEPOSIT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                               = 864n;
[@inline] const error_VAULT_WITHDRAW_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                              = 865n;
[@inline] const error_VAULT_ON_LIQUIDATE_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                          = 866n;
[@inline] const error_VAULT_UPDATE_DEPOSITOR_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                      = 867n;

[@inline] const error_CLAIM_REWARDS_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED                                    = 868n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_ON_VAULT_DEPOSIT_STAKE_ENTRYPOINT_IN_STAKING_CONTRACT_NOT_FOUND                                   = 869n;
[@inline] const error_ON_VAULT_WITHDRAW_STAKE_ENTRYPOINT_IN_STAKING_CONTRACT_NOT_FOUND                                  = 870n;
[@inline] const error_ON_VAULT_LIQUIDATE_STAKE_ENTRYPOINT_IN_STAKING_CONTRACT_NOT_FOUND                                 = 871n;


[@inline] const error_REGISTER_DEPOSIT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                              = 872n;
[@inline] const error_REGISTER_WITHDRAWAL_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                           = 873n;
[@inline] const error_REGISTER_VAULT_CREATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                       = 874n;

[@inline] const error_VAULT_LIQUIDATE_STAKED_MVN_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                               = 875n;
[@inline] const error_SET_LOAN_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                                = 876n;
[@inline] const error_SET_COLLATERAL_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                          = 877n;


[@inline] const error_GET_VAULT_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                                       = 878n;

[@inline] const error_MINIMUM_LOAN_FEE_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_MINIMUM_LOAN_FEE                           = 879n;
[@inline] const error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_INTEREST_ACCRUED                                   = 880n;
[@inline] const error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID                                = 881n;
[@inline] const error_LOAN_TOKEN_ALREADY_EXISTS                                                                         = 882n;
[@inline] const error_LOAN_TOKEN_RECORD_NOT_FOUND                                                                       = 883n;
[@inline] const error_LOAN_TOKEN_LEDGER_NOT_FOUND                                                                       = 884n;
[@inline] const error_LOAN_TOKEN_RECORD_ALREADY_EXISTS                                                                  = 885n;
[@inline] const error_COLLATERAL_TOKEN_RECORD_NOT_FOUND                                                                 = 886n;
[@inline] const error_COLLATERAL_TOKEN_ALREADY_EXISTS                                                                   = 887n;
[@inline] const error_SENDER_MUST_BE_VAULT_ADDRESS                                                                      = 888n;

[@inline] const error_INSUFFICIENT_COLLATERAL_TOKEN_BALANCE_IN_VAULT                                                    = 889n;
[@inline] const error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE                                                = 890n;
[@inline] const error_CANNOT_WITHDRAW_AS_VAULT_IS_UNDERCOLLATERIZED                                                     = 891n;

[@inline] const error_VAULT_IS_NOT_UNDERCOLLATERIZED                                                                    = 892n;
[@inline] const error_VAULT_IS_NOT_LIQUIDATABLE                                                                         = 893n;
[@inline] const error_VAULT_HAS_ALREADY_BEEN_MARKED_FOR_LIQUIDATION                                                     = 894n;
[@inline] const error_VAULT_IS_NOT_READY_TO_BE_LIQUIDATED                                                               = 895n;

[@inline] const error_OWNER_VAULT_SET_DOES_NOT_EXIST                                                                    = 896n;

[@inline] const error_GET_COL_TOKEN_RECORD_BY_ADDRESS_OPT_VIEW_NOT_FOUND                                                = 897n;
[@inline] const error_GET_COL_TOKEN_RECORD_BY_NAME_OPT_VIEW_NOT_FOUND                                                   = 898n;

[@inline] const error_CANNOT_BURN_MORE_THAN_TOTAL_AMOUNT_OF_LP_TOKENS                                                   = 899n;
[@inline] const error_TOKEN_POOL_TOTAL_CANNOT_BE_NEGATIVE                                                               = 900n;
[@inline] const error_TOKEN_POOL_REMAINING_CANNOT_BE_NEGATIVE                                                           = 901n;

[@inline] const error_TEZOS_SENT_IS_NOT_EQUAL_TO_WITHDRAW_AMOUNT                                                        = 902n;

[@inline] const error_CANNOT_LIQUIDATE_MORE_THAN_TOTAL_COLLATERAL_BALANCE                                               = 903n;

[@inline] const error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION                                                           = 904n;
[@inline] const error_REBASE_DECIMALS_OUT_OF_BOUNDS                                                                     = 905n;

[@inline] const error_CANNOT_LIQUIDATE_MORE_THAN_VAULT_LOAN_OUTSTANDING_TOTAL                                           = 906n;
[@inline] const error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE                                               = 907n;

[@inline] const error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL                        = 908n;

[@inline] const error_CANNOT_REMOVE_MORE_LIQUIDITY_THAN_BALANCE                                                         = 909n;
[@inline] const error_MINT_OR_BURN_ENTRYPOINT_IN_M_TOKEN_NOT_FOUND                                                      = 910n;
[@inline] const error_BREAK_GLASS_CONFIG_NOT_FOUND_IN_LENDING_CONTROLLER                                                = 911n;

[@inline] const error_GET_LOAN_TOKEN_RECORD_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                           = 912n;
[@inline] const error_GET_TOKEN_POOL_DEPOSITOR_BALANCE_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                = 913n;
[@inline] const error_GET_LOAN_TOKEN_LEDGER_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                               = 914n;


[@inline] const error_MIN_REPAYMENT_AMOUNT_NOT_REACHED                                                                  = 915n;
[@inline] const error_CANNOT_REGISTER_DEPOSIT_FOR_PROTECTED_COLLATERAL_TOKEN                                            = 916n;
[@inline] const error_CANNOT_REGISTER_WITHDRAWAL_FOR_PROTECTED_COLLATERAL_TOKEN                                         = 917n;

[@inline] const error_VAULT_NEEDS_TO_BE_MARKED_FOR_LIQUIDATION_AGAIN                                                    = 918n;

[@inline] const error_GET_STAKED_BALANCE_VIEW_IN_CONTRACT_NOT_FOUND                                                     = 919n;

[@inline] const error_NOT_STAKED_TOKEN                                                                                  = 920n;
[@inline] const error_UPDATE_OPERATORS_ENTRYPOINT_IN_STAKING_TOKEN_CONTRACT_NOT_FOUND                                   = 921n;
[@inline] const error_MAX_DEPOSIT_AMOUNT_FOR_COLLATERAL_TOKEN_EXCEEDED                                                  = 922n;

// ------------------------------------------------------------------------------
//
// M Token Errors
//
// ------------------------------------------------------------------------------

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                                                = 923n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                                           = 924n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                               = 925n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                                        = 926n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                                                 = 927n;
[@inline] const error_BALANCE_OF_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                                               = 928n;
[@inline] const error_UPDATE_OPERATORS_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                                         = 929n;
[@inline] const error_ASSERT_METADATA_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                                          = 930n;
[@inline] const error_MINT_OR_BURN_ENTRYPOINT_IN_M_TOKEN_CONTRACT_NOT_FOUND                                             = 931n;

// VIEWS NOT FOUND ERRORS

[@inline] const error_GET_ADMIN_VIEW_IN_M_TOKEN_CONTRACT_NOT_FOUND                                                      = 932n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_M_TOKEN_CONTRACT_NOT_FOUND                                        = 933n;
[@inline] const error_GET_OPERATOR_OPT_VIEW_IN_M_TOKEN_CONTRACT_NOT_FOUND                                               = 934n;
[@inline] const error_GET_BALANCE_VIEW_IN_M_TOKEN_CONTRACT_NOT_FOUND                                                    = 935n;
[@inline] const error_GET_REWARD_INDEX_VIEW_IN_M_TOKEN_CONTRACT_NOT_FOUND                                               = 936n;
[@inline] const error_ALL_TOKENS_VIEW_IN_M_TOKEN_CONTRACT_NOT_FOUND                                                     = 937n;
[@inline] const error_IS_OPERATOR_VIEW_IN_M_TOKEN_CONTRACT_NOT_FOUND                                                    = 938n;