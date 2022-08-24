// ------------------------------------------------------------------------------
//
// General Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                                                 = 0n;
[@inline] const error_TEZ_FEE_NOT_PAID                                                                                  = 1n;

[@inline] const error_LAMBDA_NOT_FOUND                                                                                  = 2n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                                           = 3n;

[@inline] const error_CALCULATION_ERROR                                                                                 = 4n;
[@inline] const error_CONFIG_VALUE_ERROR                                                                                = 5n;
[@inline] const error_CONFIG_VALUE_TOO_HIGH                                                                             = 6n;
[@inline] const error_CONFIG_VALUE_TOO_LOW                                                                              = 7n;
[@inline] const error_INVALID_BLOCKS_PER_MINUTE                                                                         = 8n;
[@inline] const error_WRONG_INPUT_PROVIDED                                                                              = 9n;
[@inline] const error_WRONG_TOKEN_TYPE_PROVIDED                                                                         = 10n;
[@inline] const error_TOKEN_NOT_WHITELISTED                                                                             = 11n;

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                                                        = 12n;
[@inline] const error_ONLY_SELF_ALLOWED                                                                                 = 13n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED                                                          = 14n;
[@inline] const error_ONLY_COUNCIL_MEMBERS_ALLOWED                                                                      = 15n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_WHITELISTED_ADDRESSES_ALLOWED                                               = 16n;
[@inline] const error_ONLY_WHITELISTED_ADDRESSES_ALLOWED                                                                = 17n;
[@inline] const error_ONLY_PROPOSER_ALLOWED                                                                             = 18n;
[@inline] const error_ONLY_BREAK_GLASS_CONTRACT_OR_DEVELOPERS_OR_PROXY_CONTRACT_ALLOWED                                 = 19n;

[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                                                                    = 20n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND                                                               = 21n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND                                                                   = 22n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_NOT_FOUND                                                           = 23n;
[@inline] const error_BREAK_GLASS_ENTRYPOINT_NOT_FOUND                                                                  = 24n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_NOT_FOUND                                                                    = 25n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_NOT_FOUND                                                                  = 26n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND                                                              = 27n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND                                                   = 28n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND                                                     = 29n;
[@inline] const error_SET_NAME_ENTRYPOINT_NOT_FOUND                                                                     = 30n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND                                             = 31n;
[@inline] const error_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_NOT_FOUND                                                        = 32n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_NOT_FOUND                                                            = 33n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND                                                    = 34n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND                                                     = 35n;

[@inline] const error_COUNCIL_SIZE_EXCEEDED                                                                             = 36n;
[@inline] const error_COUNCIL_MEMBER_ALREADY_EXISTS                                                                     = 37n;
[@inline] const error_COUNCIL_MEMBER_NOT_FOUND                                                                          = 38n;
[@inline] const error_COUNCIL_THRESHOLD_ERROR                                                                           = 39n;
[@inline] const error_COUNCIL_ACTION_NOT_FOUND                                                                          = 40n;
[@inline] const error_COUNCIL_ACTION_EXECUTED                                                                           = 41n;
[@inline] const error_COUNCIL_ACTION_FLUSHED                                                                            = 42n;
[@inline] const error_COUNCIL_ACTION_EXPIRED                                                                            = 43n;
[@inline] const error_COUNCIL_ACTION_PARAMETER_NOT_FOUND                                                                = 44n;
[@inline] const error_COUNCIL_ACTION_ALREADY_SIGNED_BY_SENDER                                                           = 45n;



// ------------------------------------------------------------------------------
//
// MVK Token Error
//
// ------------------------------------------------------------------------------

[@inline] const error_MVK_TOKEN_CONTRACT_NOT_FOUND                                                                      = 46n;
[@inline] const error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED                                                                   = 47n;

[@inline] const error_MAXIMUM_SUPPLY_EXCEEDED                                                                           = 48n;
[@inline] const error_INFLATION_RATE_TOO_HIGH                                                                           = 49n;
[@inline] const error_CANNOT_TRIGGER_INFLATION_NOW                                                                      = 50n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                              = 51n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                         = 52n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                             = 53n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                               = 54n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                      = 55n;
[@inline] const error_ASSERT_METADATA_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                        = 56n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                               = 57n;
[@inline] const error_BALANCE_OF_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                             = 58n;
[@inline] const error_UPDATE_OPERATORS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                       = 59n;
[@inline] const error_MINT_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                                   = 60n;
[@inline] const error_UPDATE_INFLATION_RATE_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                             = 61n;
[@inline] const error_TRIGGER_INFLATION_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                                 = 62n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                                    = 63n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                        = 64n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                      = 65n;
[@inline] const error_GET_INFLATION_RATE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                           = 66n;
[@inline] const error_GET_NEXT_INFLATION_TIMESTAMP_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                 = 67n;
[@inline] const error_GET_OPERATOR_OPT_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                             = 68n;
[@inline] const error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                                  = 69n;
[@inline] const error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                             = 70n;
[@inline] const error_GET_MAXIMUM_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                           = 71n;
[@inline] const error_GET_TOTAL_AND_MAXIMUM_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                 = 72n;



// ------------------------------------------------------------------------------
//
// Break Glass Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_BREAK_GLASS_CONTRACT_NOT_FOUND                                                                    = 73n;
[@inline] const error_ONLY_BREAK_GLASS_CONTRACT_ALLOWED                                                                 = 74n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_GLASS_NOT_BROKEN                                                                                  = 75n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_BREAK_GLASS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 76n;
[@inline] const error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 77n;
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                            = 78n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                       = 79n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                      = 80n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                        = 81n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                           = 82n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                             = 83n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                    = 84n;
[@inline] const error_UPDATE_COUNCIL_MEMBER_INFO_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                           = 85n;
[@inline] const error_ADD_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                   = 86n;
[@inline] const error_REMOVE_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 87n;
[@inline] const error_CHANGE_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 88n;
[@inline] const error_FLUSH_ACTION_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                         = 89n;
[@inline] const error_SIGN_ACTION_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 90n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                           = 91n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                                  = 92n;
[@inline] const error_GET_GLASS_BROKEN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                           = 93n;
[@inline] const error_GET_CONFIG_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                                 = 94n;
[@inline] const error_GET_COUNCIL_MEMBERS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                        = 95n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                    = 96n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                      = 97n;
[@inline] const error_GET_ACTION_OPT_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                             = 98n;
[@inline] const error_GET_ACTION_COUNTER_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                         = 99n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                             = 100n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 101n;



// ------------------------------------------------------------------------------
//
// Council Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                                                                        = 102n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                                                                     = 103n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED                                                    = 104n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_COUNCIL_CONTRACT                                                          = 105n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                           = 106n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                          = 107n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                            = 108n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                               = 109n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                 = 110n;
[@inline] const error_UPDATE_COUNCIL_MEMBER_INFO_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                               = 111n;
[@inline] const error_COUNCIL_ACTION_ADD_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                = 112n;
[@inline] const error_COUNCIL_ACTION_REMOVE_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 113n;
[@inline] const error_COUNCIL_ACTION_CHANGE_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 114n;
[@inline] const error_COUNCIL_ACTION_SET_BAKER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                 = 115n;
[@inline] const error_COUNCIL_ACTION_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                     = 116n;
[@inline] const error_COUNCIL_ACTION_ADD_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                = 117n;
[@inline] const error_COUNCIL_ACTION_REMOVE_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 118n;
[@inline] const error_COUNCIL_ACTION_UPDATE_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 119n;
[@inline] const error_COUNCIL_ACTION_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 120n;
[@inline] const error_COUNCIL_ACTION_TRANSFER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                  = 121n;
[@inline] const error_COUNCIL_ACTION_REQUEST_TOKENS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                            = 122n;
[@inline] const error_COUNCIL_ACTION_REQUEST_MINT_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                              = 123n;
[@inline] const error_COUNCIL_ACTION_SET_CONTRACT_BAKER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 124n;
[@inline] const error_COUNCIL_ACTION_DROP_FINANCIAL_REQ_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 125n;
[@inline] const error_FLUSH_ACTION_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                             = 126n;
[@inline] const error_SIGN_ACTION_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                              = 127n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                               = 128n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                      = 129n;
[@inline] const error_GET_CONFIG_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                     = 130n;
[@inline] const error_GET_COUNCIL_MEMBERS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                            = 131n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                        = 132n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                          = 133n;
[@inline] const error_GET_COUNCIL_ACTION_VIEW_OPT_IN_COUNCIL_CONTRACT_NOT_FOUND                                         = 134n;
[@inline] const error_GET_ACTION_COUNTER_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                             = 135n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                 = 136n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                              = 137n;



// ------------------------------------------------------------------------------
//
// Delegation Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                                                     = 138n;
[@inline] const error_SATELLITE_TREASURY_CONTRACT_NOT_FOUND                                                             = 139n;
[@inline] const error_ONLY_DELEGATION_CONTRACT_ALLOWED                                                                  = 140n;
[@inline] const error_ONLY_SELF_OR_SENDER_ALLOWED                                                                       = 141n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_SATELLITE_ALLOWED                                                                            = 142n;
[@inline] const error_SATELLITE_NOT_ALLOWED                                                                             = 143n;
[@inline] const error_SATELLITE_NOT_FOUND                                                                               = 144n;
[@inline] const error_SATELLITE_ALREADY_EXISTS                                                                          = 145n;

[@inline] const error_SATELLITE_SUSPENDED                                                                               = 146n;
[@inline] const error_SATELLITE_BANNED                                                                                  = 147n;

[@inline] const error_DELEGATE_NOT_ALLOWED                                                                              = 148n;
[@inline] const error_DELEGATE_NOT_FOUND                                                                                = 149n;
[@inline] const error_DELEGATE_ALREADY_EXISTS                                                                           = 150n;
[@inline] const error_ALREADY_DELEGATED_SATELLITE                                                                       = 151n;

[@inline] const error_SATELLITE_REWARDS_NOT_FOUND                                                                       = 152n;
[@inline] const error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND                                                      = 153n;

[@inline] const error_MAXIMUM_AMOUNT_OF_SATELLITES_REACHED                                                              = 154n;
[@inline] const error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT                                                          = 155n;
[@inline] const error_SATELLITE_FEE_EXCEEDS_TOTAL_REWARD                                                                = 156n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                    = 157n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                = 158n;
[@inline] const error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                    = 159n;
[@inline] const error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                  = 160n;
[@inline] const error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                  = 161n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                        = 162n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                             = 163n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                        = 164n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 165n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                         = 166n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                            = 167n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                              = 168n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                     = 169n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                             = 170n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 171n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 172n;
[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                 = 173n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                             = 174n;
[@inline] const error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                 = 175n;
[@inline] const error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 176n;
[@inline] const error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 177n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                     = 178n;
[@inline] const error_ON_STAKE_CHANGE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 179n;
[@inline] const error_UPDATE_SATELLITE_STATUS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 180n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                            = 181n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                                   = 182n;
[@inline] const error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                                  = 183n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                     = 184n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 185n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                      = 186n;
[@inline] const error_GET_DELEGATE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                            = 187n;
[@inline] const error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 188n;
[@inline] const error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                   = 189n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                              = 190n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 191n;

// ------------------------------------------------------------------------------
//
// Doorman Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                                                                        = 192n;
[@inline] const error_ONLY_DOORMAN_CONTRACT_ALLOWED                                                                     = 193n;
[@inline] const error_FARM_TREASURY_CONTRACT_NOT_FOUND                                                                  = 194n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_SMVK_ACCESS_AMOUNT_NOT_REACHED                                                                    = 195n;
[@inline] const error_MVK_ACCESS_AMOUNT_NOT_REACHED                                                                     = 196n;

[@inline] const error_USER_STAKE_RECORD_NOT_FOUND                                                                       = 197n;
[@inline] const error_NOT_ENOUGH_SMVK_BALANCE                                                                           = 198n;
[@inline] const error_UNSTAKE_AMOUNT_ERROR                                                                              = 199n;

[@inline] const error_CANNOT_TRANSFER_MVK_TOKEN_USING_MISTAKEN_TRANSFER                                                 = 200n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                       = 201n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                     = 202n;
[@inline] const error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                    = 203n;
[@inline] const error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                  = 204n;
[@inline] const error_ON_VAULT_DEPOSIT_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                 = 205n;
[@inline] const error_ON_VAULT_WITHDRAW_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                = 206n;
[@inline] const error_ON_VAULT_LIQUIDATE_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                               = 207n;


[@inline] const error_ALL_DOORMAN_CONTRACT_ENTRYPOINTS_SHOULD_BE_PAUSED_TO_MIGRATE_FUNDS                                = 208n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                = 209n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                           = 210n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 211n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                            = 212n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                               = 213n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                 = 214n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                        = 215n;
[@inline] const error_MIGRATE_FUNDS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                            = 216n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                = 217n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                              = 218n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                  = 219n;
[@inline] const error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                    = 220n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                  = 221n;
[@inline] const error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                 = 222n;
[@inline] const error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                               = 223n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                               = 224n;
[@inline] const error_ON_VAULT_DEPOSIT_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                              = 225n;
[@inline] const error_ON_VAULT_WITHDRAW_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                             = 226n;
[@inline] const error_ON_VAULT_LIQUIDATE_STAKED_MVK_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                            = 227n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                                      = 228n;
[@inline] const error_GET_CONFIG_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                                     = 229n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                        = 230n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 231n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                         = 232n;
[@inline] const error_GET_USER_STAKE_BALANCE_OPT_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                     = 233n;
[@inline] const error_GET_STAKED_MVK_TOTAL_SUPPLY_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                    = 234n;
[@inline] const error_GET_UNCLAIMED_REWARDS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 235n;
[@inline] const error_GET_ACCUMULATED_FEES_PER_SHARE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                 = 236n;
[@inline] const error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                             = 237n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                                 = 238n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                              = 239n;

// ------------------------------------------------------------------------------
//
// Emergency Governance Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                                           = 240n;
[@inline] const error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED                                                        = 241n;
[@inline] const error_TAX_TREASURY_CONTRACT_NOT_FOUND                                                                   = 242n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_EMERGENCY_GOVERNANCE_ALREADY_IN_THE_PROCESS                                                       = 243n;
[@inline] const error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS                                                           = 244n;
[@inline] const error_EMERGENCY_GOVERNANCE_NOT_FOUND                                                                    = 245n;
[@inline] const error_EMERGENCY_GOVERNANCE_DROPPED                                                                      = 246n;
[@inline] const error_EMERGENCY_GOVERNANCE_EXECUTED                                                                     = 247n;
[@inline] const error_EMERGENCY_GOVERNANCE_VOTE_ALEADY_REGISTERED                                                       = 248n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                   = 249n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                              = 250n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                             = 251n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                               = 252n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                    = 253n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                           = 254n;
[@inline] const error_TRIGGER_EMERGENCY_CONTROL_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                   = 255n;
[@inline] const error_VOTE_FOR_EMERGENCY_CONTROL_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                  = 256n;
[@inline] const error_DROP_EMERGENCY_GOVERNANCE_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                   = 257n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                  = 258n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 259n;
[@inline] const error_GET_CONFIG_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                        = 260n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                             = 261n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                           = 262n;
[@inline] const error_GET_EMERGENCY_GOVERNANCE_OPT_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                      = 263n;
[@inline] const error_GET_CURRENT_EMERGENCY_GOVERNANCE_ID_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND               = 264n;
[@inline] const error_GET_NEXT_EMERGENCY_GOVERNANCE_ID_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                  = 265n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 266n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                 = 267n;

// ------------------------------------------------------------------------------
//
// Farm Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_FARM_CONTRACT_NOT_FOUND                                                                           = 268n;
[@inline] const error_ONLY_FARM_CONTRACT_ALLOWED                                                                        = 269n;
[@inline] const error_ONLY_FARM_FACTORY_OR_COUNCIL_CONTRACT_ALLOWED                                                     = 270n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION                                                        = 271n;
[@inline] const error_DEPOSITOR_NOT_FOUND                                                                               = 272n;
[@inline] const error_WITHDRAWN_AMOUNT_TOO_HIGH                                                                         = 273n;
[@inline] const error_NO_FARM_REWARDS_TO_CLAIM                                                                          = 274n;

[@inline] const error_FARM_NOT_INITIATED                                                                                = 275n;
[@inline] const error_FARM_ALREADY_OPEN                                                                                 = 276n;
[@inline] const error_FARM_CLOSED                                                                                       = 277n;
[@inline] const error_DEPOSITOR_NOT_FOUND                                                                               = 278n;

[@inline] const error_CANNOT_TRANSFER_LP_TOKEN_USING_MISTAKEN_TRANSFER                                                  = 279n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                        = 280n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                       = 281n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                          = 282n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 283n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                              = 284n;
[@inline] const error_SET_NAME_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                    = 285n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                             = 286n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                               = 287n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                  = 288n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                    = 289n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                           = 290n;
[@inline] const error_UPDATE_BLOCKS_PER_MINUTE_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                    = 291n;
[@inline] const error_INIT_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 292n;
[@inline] const error_CLOSE_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                  = 293n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 294n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                 = 295n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                     = 296n;
[@inline] const error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                     = 297n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                    = 298n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                       = 299n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                  = 300n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                         = 301n;
[@inline] const error_GET_NAME_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                                  = 302n;
[@inline] const error_GET_CONFIG_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                        = 303n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                           = 304n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                             = 305n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                            = 306n;
[@inline] const error_GET_LAST_BLOCK_UPDATE_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                             = 307n;
[@inline] const error_GET_ACCUMULATED_REWARDS_PER_SHARE_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                 = 308n;
[@inline] const error_GET_CLAIMED_REWARDS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                               = 309n;
[@inline] const error_GET_DEPOSITOR_OPT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                 = 310n;
[@inline] const error_GET_OPEN_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                          = 311n;
[@inline] const error_GET_INIT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                          = 312n;
[@inline] const error_GET_INIT_BLOCK_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                    = 313n;
[@inline] const error_GET_MIN_BLOCK_TIME_SNAPSHOT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                       = 314n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                    = 315n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                 = 316n;

// ------------------------------------------------------------------------------
//
// Farm Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_FARM_FACTORY_CONTRACT_NOT_FOUND                                                                   = 317n;
[@inline] const error_ONLY_FARM_FACTORY_CONTRACT_ALLOWED                                                                = 318n;
[@inline] const error_ONLY_ADMIN_OR_FARM_FACTORY_CONTRACT_ALLOWED                                                       = 319n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_FARM_ALREADY_TRACKED                                                                              = 320n;
[@inline] const error_FARM_NOT_TRACKED                                                                                  = 321n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                            = 322n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                             = 323n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                           = 324n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                           = 325n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                      = 326n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                     = 327n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                       = 328n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                          = 329n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                            = 330n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                   = 331n;
[@inline] const error_UPDATE_BLOCKS_PER_MINUTE_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                            = 332n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                           = 333n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 334n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                             = 335n;
[@inline] const error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 336n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                          = 337n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                        = 338n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                          = 339n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                  = 340n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_CHECK_FARM_EXISTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 341n;
[@inline] const error_GET_ADMIN_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                                 = 342n;
[@inline] const error_GET_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                                = 343n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                    = 344n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                   = 345n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                     = 346n;
[@inline] const error_GET_TRACKED_FARMS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 347n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                            = 348n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 349n;
[@inline] const error_GET_PRODUCT_LAMBDA_OPT_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                    = 350n;
[@inline] const error_GET_PRODUCT_LAMBDA_LEDGER_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                 = 351n;

// ------------------------------------------------------------------------------
//
// Governance Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_CONTRACT_NOT_FOUND                                                                     = 352n;
[@inline] const error_ONLY_GOVERNANCE_CONTRACT_ALLOWED                                                                  = 353n;
[@inline] const error_PAYMENT_TREASURY_CONTRACT_NOT_FOUND                                                               = 354n;
[@inline] const error_PROPOSE_TAX_TREASURY_CONTRACT_NOT_FOUND                                                           = 355n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND                                                             = 356n;
[@inline] const error_ONLY_ACCESSIBLE_DURING_VOTING_ROUND                                                               = 357n;
[@inline] const error_ONLY_ACCESSIBLE_DURING_TIMELOCK_ROUND                                                             = 358n;
[@inline] const error_SNAPSHOT_NOT_READY                                                                                = 359n;
[@inline] const error_SNAPSHOT_NOT_FOUND                                                                                = 360n;
[@inline] const error_HIGHEST_VOTED_PROPOSAL_NOT_FOUND                                                                  = 361n;
[@inline] const error_TIMELOCK_PROPOSAL_NOT_FOUND                                                                       = 362n;
[@inline] const error_PROPOSAL_NOT_FOUND                                                                                = 363n;
[@inline] const error_PROPOSAL_LOCKED                                                                                   = 364n;
[@inline] const error_PROPOSAL_CANNOT_BE_EXECUTED_NOW                                                                   = 365n;
[@inline] const error_PROPOSAL_DROPPED                                                                                  = 366n;
[@inline] const error_PROPOSAL_EXECUTED                                                                                 = 367n;
[@inline] const error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE                                                                   = 368n;
[@inline] const error_PROPOSAL_DATA_NOT_FOUND                                                                           = 369n;
[@inline] const error_PROPOSAL_EXECUTION_ALREADY_STARTED                                                                = 370n;
[@inline] const error_PROPOSAL_NOT_EXECUTED                                                                             = 371n;
[@inline] const error_PROPOSAL_PAYMENTS_PROCESSED                                                                       = 372n;
[@inline] const error_PROPOSAL_NOT_LOCKED                                                                               = 373n;
[@inline] const error_NO_PROPOSAL_TO_VOTE_FOR                                                                           = 374n;
[@inline] const error_NO_PROPOSAL_TO_EXECUTE                                                                            = 375n;
[@inline] const error_VOTE_NOT_FOUND                                                                                    = 376n;
[@inline] const error_PROPOSAL_REWARD_ALREADY_CLAIMED                                                                   = 377n;
[@inline] const error_PROPOSAL_REWARD_CANNOT_BE_CLAIMED                                                                 = 378n;
[@inline] const error_VOTE_ALREADY_RECORDED                                                                             = 379n;
[@inline] const error_CURRENT_ROUND_NOT_FINISHED                                                                        = 380n;
[@inline] const error_MAX_PROPOSAL_REACHED                                                                              = 381n;
[@inline] const error_DEVELOPER_NOT_WHITELISTED                                                                         = 382n;
[@inline] const error_NOT_ENOUGH_WHITELISTED_DEVELOPERS                                                                 = 383n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                             = 384n;
[@inline] const error_SET_GOVERNANCE_PROXY_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                  = 385n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                       = 386n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 387n;
[@inline] const error_UPDATE_WHITELIST_DEVELOPERS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                           = 388n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                            = 389n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                      = 390n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 391n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 392n;
[@inline] const error_SET_CONTRACT_ADMIN_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 393n;
[@inline] const error_SET_CONTRACT_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                               = 394n;
[@inline] const error_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 395n;
[@inline] const error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                 = 396n;
[@inline] const error_UPDATE_SATELLITE_SNAPSHOT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                             = 397n;
[@inline] const error_START_NEXT_ROUND_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 398n;
[@inline] const error_PROPOSE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                               = 399n;
[@inline] const error_PROPOSAL_ROUND_VOTE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                   = 400n;
[@inline] const error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 401n;
[@inline] const error_ADD_UPDATE_PAYMENT_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                               = 402n;
[@inline] const error_LOCK_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 403n;
[@inline] const error_VOTING_ROUND_VOTE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 404n;
[@inline] const error_EXECUTE_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 405n;
[@inline] const error_PROCESS_PROPOSAL_PAYMENT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 406n;
[@inline] const error_PROCESS_PROPOSAL_SINGLE_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                          = 407n;
[@inline] const error_DROP_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 408n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 409n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                                   = 410n;
[@inline] const error_GET_CONFIG_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                                  = 411n;
[@inline] const error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                = 412n;
[@inline] const error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 413n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                       = 414n;
[@inline] const error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 415n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 416n;
[@inline] const error_GET_PROPOSAL_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 417n;
[@inline] const error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 418n;
[@inline] const error_GET_PROPOSAL_REWARD_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 419n;
[@inline] const error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 420n;
[@inline] const error_GET_CURRENT_CYCLE_INFO_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 421n;
[@inline] const error_GET_CYCLE_PROPOSALS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 422n;
[@inline] const error_GET_CYCLE_PROPOSER_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 423n;
[@inline] const error_GET_ROUND_VOTE_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                          = 424n;
[@inline] const error_GET_NEXT_PROPOSAL_ID_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                        = 425n;
[@inline] const error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 426n;
[@inline] const error_GET_CYCLE_HIGHEST_VOTED_PROPOSAL_ID_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                         = 427n;
[@inline] const error_GET_TIMELOCK_PROPOSAL_ID_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 428n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                              = 429n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 430n;

// ------------------------------------------------------------------------------
//
// Governance Financial Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                                           = 431n;
[@inline] const error_ONLY_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED                                                        = 432n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED                                               = 433n;
// CONTRACT SPECIFIC ERRORS
[@inline] const error_FINANCIAL_REQUEST_NOT_FOUND                                                                       = 434n;
[@inline] const error_FINANCIAL_REQUEST_EXECUTED                                                                        = 435n;
[@inline] const error_FINANCIAL_REQUEST_EXPIRED                                                                         = 436n;
[@inline] const error_FINANCIAL_REQUEST_DROPPED                                                                         = 437n;
[@inline] const error_FINANCIAL_REQUEST_SNAPSHOT_NOT_FOUND                                                              = 438n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                   = 439n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                              = 440n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                             = 441n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                               = 442n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND            = 443n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                    = 444n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                           = 445n;
[@inline] const error_REQUEST_TOKENS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                              = 446n;
[@inline] const error_REQUEST_MINT_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                = 447n;
[@inline] const error_SET_CONTRACT_BAKER_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                          = 448n;
[@inline] const error_DROP_FINANCIAL_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                      = 449n;
[@inline] const error_VOTE_FOR_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                            = 450n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                         = 451n;
[@inline] const error_GET_CONFIG_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                        = 452n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                 = 453n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                     = 454n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                             = 455n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                           = 456n;
[@inline] const error_GET_FINANCIAL_REQUEST_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                         = 457n;
[@inline] const error_GET_FINANCIAL_REQUEST_COUNTER_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                     = 458n;
[@inline] const error_GET_FINANCIAL_REQUEST_VOTER_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                   = 459n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                    = 460n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                 = 461n;

// ------------------------------------------------------------------------------
//
// Governance Proxy Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                                               = 462n;
[@inline] const error_ONLY_GOVERNANCE_PROXY_CONTRACT_ALLOWED                                                            = 463n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA                                                         = 464n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                       = 465n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                  = 466n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                 = 467n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                      = 468n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                = 469n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                        = 470n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                               = 471n;
[@inline] const error_SET_PROXY_LAMBDA_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                = 472n;
[@inline] const error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                       = 473n;
[@inline] const error_DATA_PACKING_HELPER_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                             = 474n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                             = 475n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                         = 476n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                               = 477n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                 = 478n;
[@inline] const error_GET_PROXY_LAMBDA_OPT_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                  = 479n;

// ------------------------------------------------------------------------------
//
// Treasury Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TREASURY_CONTRACT_NOT_FOUND                                                                       = 480n;
[@inline] const error_ONLY_TREASURY_CONTRACT_ALLOWED                                                                    = 481n;
[@inline] const error_ONLY_ADMIN_OR_TREASURY_FACTORY_CONTRACT_ALLOWED                                                   = 482n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                                   = 483n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                      = 484n;
[@inline] const error_UPDATE_MVK_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                       = 485n;
[@inline] const error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                                  = 486n;
[@inline] const error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                                = 487n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 488n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                          = 489n;
[@inline] const error_SET_BAKER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 490n;
[@inline] const error_SET_NAME_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                                = 491n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                         = 492n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                              = 493n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                = 494n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                        = 495n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                        = 496n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 497n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 498n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                 = 499n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                                = 500n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                   = 501n;
[@inline] const error_UPDATE_MVK_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                    = 502n;
[@inline] const error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 503n;
[@inline] const error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 504n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                                     = 505n;
[@inline] const error_GET_NAME_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                                      = 506n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                        = 507n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                 = 508n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                       = 509n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                         = 510n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                                = 511n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 512n;

// ------------------------------------------------------------------------------
//
// Vesting Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                                               = 513n;
[@inline] const error_ONLY_TREASURY_FACTORY_CONTRACT_ALLOWED                                                            = 514n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_TREASURY_ALREADY_TRACKED                                                                          = 515n;
[@inline] const error_TREASURY_NOT_TRACKED                                                                              = 516n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                    = 517n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                     = 518n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                   = 519n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                       = 520n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                  = 521n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 522n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                   = 523n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                      = 524n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                = 525n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                        = 526n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                               = 527n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                       = 528n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                     = 529n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                         = 530n;
[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 531n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                  = 532n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 533n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                      = 534n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                              = 535n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_CHECK_TREASURY_EXISTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 536n;
[@inline] const error_GET_ADMIN_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                             = 537n;
[@inline] const error_GET_CONFIG_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                            = 538n;
[@inline] const error_GET_TRACKED_TREASURIES_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 539n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 540n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                         = 541n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                               = 542n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 543n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                        = 544n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                     = 545n;
[@inline] const error_GET_PRODUCT_LAMBDA_OPT_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 546n;
[@inline] const error_GET_PRODUCT_LAMBDA_LEDGER_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                             = 547n;

// ------------------------------------------------------------------------------
//
// Vesting Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_VESTING_CONTRACT_NOT_FOUND                                                                        = 548n;
[@inline] const error_ONLY_VESTING_CONTRACT_ALLOWED                                                                     = 549n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_NO_VESTING_REWARDS_TO_CLAIM                                                                       = 550n;
[@inline] const error_CANNOT_CLAIM_VESTING_REWARDS_NOW                                                                  = 551n;

[@inline] const error_VESTING_IN_MONTHS_TOO_SHORT                                                                       = 552n;
[@inline] const error_CLIFF_PERIOD_TOO_LONG                                                                             = 553n;

[@inline] const error_VESTEE_ALREADY_EXISTS                                                                             = 554n;
[@inline] const error_VESTEE_NOT_FOUND                                                                                  = 555n;
[@inline] const error_VESTEE_LOCKED                                                                                     = 556n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                                = 557n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                           = 558n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                          = 559n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                               = 560n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                 = 561n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                        = 562n;
[@inline] const error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                               = 563n;
[@inline] const error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                            = 564n;
[@inline] const error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                            = 565n;
[@inline] const error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                       = 566n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                                    = 567n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                               = 568n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                      = 569n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                        = 570n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                          = 571n;
[@inline] const error_GET_TOTAL_VESTED_AMOUNT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                        = 572n;
[@inline] const error_GET_VESTEE_BALANCE_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                             = 573n;
[@inline] const error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                 = 574n;
[@inline] const error_GET_TOTAL_VESTED_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                               = 575n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                 = 576n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                              = 577n;

// ------------------------------------------------------------------------------
//
// Aggregator Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_AGGREGATOR_CONTRACT_NOT_FOUND                                                                     = 578n;
[@inline] const error_ONLY_AGGREGATOR_CONTRACT_ALLOWED                                                                  = 579n;
[@inline] const error_AGGREGATOR_CONTRACT_EXISTS                                                                        = 580n;
[@inline] const error_ONLY_AUTHORIZED_ORACLES_ALLOWED                                                                   = 581n;
[@inline] const error_NOT_ALLOWED_TO_TRIGGER_DEVIATION_BAN                                                              = 582n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_ALLOWED                                                        = 583n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_SATELLITE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                 = 584n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_OR_GOVERNANCE_SATELLITE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED   = 585n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ORACLE_ALREADY_ADDED_TO_AGGREGATOR                                                                = 586n;
[@inline] const error_ORACLE_NOT_PRESENT_IN_AGGREGATOR                                                                  = 587n;
[@inline] const error_NOT_A_CONTRACT                                                                                    = 588n;
[@inline] const error_WRONG_ROUND_NUMBER                                                                                = 589n;
[@inline] const error_LAST_ROUND_IS_NOT_COMPLETE                                                                        = 590n;
[@inline] const error_LAST_COMPLETED_ROUND_PRICE_NOT_FOUND                                                              = 591n;
[@inline] const error_YOU_CANNOT_COMMIT_NOW                                                                             = 592n;
[@inline] const error_YOU_CANNOT_REVEAL_NOW                                                                             = 593n;
[@inline] const error_NOT_ENOUGH_TEZ_IN_CONTRACT_TO_WITHDRAW                                                            = 594n;
[@inline] const error_ORACLE_HAS_ALREADY_ANSWERED_COMMIT                                                                = 595n;
[@inline] const error_ORACLE_HAS_ALREADY_ANSWERED_REVEAL                                                                = 596n;
[@inline] const error_ORACLE_DID_NOT_ANSWER                                                                             = 597n;
[@inline] const error_REVEAL_DOES_NOT_MATCH_COMMITMENT                                                                  = 598n;
[@inline] const error_TEZOS_ADDRESS_NOT_PRESENT_IN_HASH_COMMIT                                                          = 599n;
[@inline] const error_NO_REQUEST_RATE_DEVIATION_DEPOSIT_FEE_REQUIRED                                                    = 600n;
[@inline] const error_TEZOS_SENT_IS_NOT_EQUAL_TO_REQUEST_RATE_DEVIATION_DEPOSIT_FEE                                     = 601n;
[@inline] const error_MAINTAINER_ADDRESS_NOT_FOUND                                                                      = 602n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_REQUEST_RATE_UPDATE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                      = 603n;
[@inline] const error_REQUEST_RATE_UPDATE_DEVIATION_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                            = 604n;
[@inline] const error_SET_OBSERVATION_COMMIT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                   = 605n;
[@inline] const error_SET_OBSERVATION_REVEAL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                   = 606n;
[@inline] const error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                      = 607n;
[@inline] const error_WITHDRAW_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                               = 608n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                             = 609n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 610n;
[@inline] const error_SET_MAINTAINER_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 611n;
[@inline] const error_SET_NAME_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                              = 612n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                       = 613n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                         = 614n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                            = 615n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                              = 616n;
[@inline] const error_ADD_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                            = 617n;
[@inline] const error_REMOVE_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                         = 618n;

[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                             = 619n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 620n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                               = 621n;

[@inline] const error_REQUEST_RATE_UPDATE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                   = 622n;
[@inline] const error_REQUEST_RATE_UPDATE_DEVIATION_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                         = 623n;
[@inline] const error_SET_OBSERVATION_COMMIT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                = 624n;
[@inline] const error_SET_OBSERVATION_REVEAL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                = 625n;
[@inline] const error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                   = 626n;
[@inline] const error_WITHDRAW_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                            = 627n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 628n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                            = 629n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                   = 630n;
[@inline] const error_GET_CONFIG_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                  = 631n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                      = 632n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 633n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                       = 634n;
[@inline] const error_GET_MAINTAINER_ADDRESS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                      = 635n;
[@inline] const error_GET_ORACLE_ADDRESSES_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 636n;
[@inline] const error_GET_OBSERVATION_COMMITS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 637n;
[@inline] const error_GET_OBSERVATION_REVEALS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 638n;
[@inline] const error_GET_DEVIATION_TRIGGER_INFOS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                 = 639n;
[@inline] const error_GET_DEVIATION_TRIGGER_BAN_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                   = 640n;
[@inline] const error_GET_ORACLE_REWARDS_STAKED_MVK_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                               = 641n;
[@inline] const error_GET_ORACLE_REWARDS_XTZ_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                      = 642n;
[@inline] const error_GET_LAST_COMPLETED_ROUND_PRICE_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                              = 643n;
[@inline] const error_GET_DECIMALS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                = 644n;
[@inline] const error_GET_ROUND_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                   = 645n;
[@inline] const error_GET_ROUNDSTART_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                              = 646n;
[@inline] const error_GET_SWITCHBLOCK_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                             = 647n;
[@inline] const error_GET_CONTRACT_NAME_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 648n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                              = 649n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 650n;

// ------------------------------------------------------------------------------
//
// Aggregator Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                                             = 651n;
[@inline] const error_ONLY_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                                          = 652n;
[@inline] const error_ONLY_ADMIN_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                                 = 653n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_SENDER_IS_NOT_TRACKED_AGGREGATOR                                                                  = 654n;
[@inline] const error_ONLY_MAINTAINER_ALLOWED                                                                           = 655n;
[@inline] const error_ACTION_FAILED_AS_SATELLITE_IS_NOT_REGISTERED                                                      = 656n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                   = 657n;

[@inline] const error_AGGREGATOR_ALREADY_TRACKED                                                                        = 658n;
[@inline] const error_AGGREGATOR_NOT_TRACKED                                                                            = 659n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                                = 660n;
[@inline] const error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                                 = 661n;
[@inline] const error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                               = 662n;
[@inline] const error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                            = 663n;
[@inline] const error_DISTRIBUTE_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                     = 664n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                     = 665n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                = 666n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                               = 667n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                 = 668n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                    = 669n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                      = 670n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                     = 671n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                   = 672n;
[@inline] const error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                       = 673n;
[@inline] const error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 674n;
[@inline] const error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                              = 675n;
[@inline] const error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                            = 676n;
[@inline] const error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                         = 677n;
[@inline] const error_DISTRIBUTE_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                  = 678n;
[@inline] const error_MISTAKEN_TRANSFER_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 679n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                    = 680n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                            = 681n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                           = 682n;
[@inline] const error_GET_CONFIG_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                          = 683n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                              = 684n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 685n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                               = 686n;
[@inline] const error_GET_TRACKED_AGGREGATORS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 687n;
[@inline] const error_GET_AGGREGATOR_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                      = 688n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                      = 689n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                   = 690n;



// ------------------------------------------------------------------------------
//
// Governance Satellite Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                                           = 691n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED                                               = 692n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_INITIATOR_CAN_DROP_ACTION                                                                    = 693n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_DROPPED                                                               = 694n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_NOT_FOUND                                                             = 695n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_EXECUTED                                                              = 696n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_EXPIRED                                                               = 697n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_SNAPSHOT_NOT_FOUND                                                    = 698n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_PARAMETER_NOT_FOUND                                                   = 699n;
[@inline] const error_INITIATOR_ACTIONS_NOT_FOUND                                                                       = 700n;

[@inline] const error_MAX_GOVERNANCE_SATELLITE_ACTION_REACHED                                                           = 701n;

[@inline] const error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION                                             = 702n;
[@inline] const error_ONLY_SATELLITES_ALLOWED_TO_VOTE_FOR_GOVERNANCE_ACTION                                             = 703n;
[@inline] const error_SNAPSHOT_STAKED_MVK_TOTAL_SUPPLY_NOT_FOUND                                                        = 704n;

[@inline] const error_SATELLITE_ORACLE_RECORD_NOT_FOUND                                                                 = 705n;
[@inline] const error_ORACLE_NOT_FOUND                                                                                  = 706n;
[@inline] const error_AGGREGATOR_NEW_STATUS_NOT_FOUND                                                                   = 707n;
[@inline] const error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND                                               = 708n;
[@inline] const error_SATELLITE_AGGREGATORS_SUBSCRIBED_CALCULATION_ERROR                                                = 709n;

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
[@inline] const error_REGISTER_AGGREGATOR_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                         = 722n;
[@inline] const error_UPDATE_AGGREGATOR_STATUS_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                    = 723n;
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
[@inline] const error_GET_AGGREGATOR_RECORD_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                         = 740n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                    = 741n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                 = 742n;



// ------------------------------------------------------------------------------
//
// Token Sale Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TOKEN_SALE_CONTRACT_NOT_FOUND                                                                     = 743n;
[@inline] const error_ONLY_TOKEN_SALE_CONTRACT_ALLOWED                                                                  = 744n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ                                                            = 745n;
[@inline] const error_TOKEN_SALE_HAS_NOT_STARTED                                                                        = 746n;
[@inline] const error_WHITELIST_SALE_HAS_NOT_STARTED                                                                    = 747n;
[@inline] const error_USER_IS_NOT_WHITELISTED                                                                           = 748n;
[@inline] const error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED                                                          = 749n;
[@inline] const error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED                                                              = 750n;
[@inline] const error_WHITELIST_MAX_AMOUNT_CAP_REACHED                                                                  = 751n;
[@inline] const error_OVERALL_MAX_AMOUNT_CAP_REACHED                                                                    = 752n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                             = 753n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                       = 754n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                         = 755n;
[@inline] const error_ADD_TO_WHITELIST_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                      = 756n;
[@inline] const error_REMOVE_FROM_WHITELIST_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                 = 757n;
[@inline] const error_BUY_TOKENS_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                            = 758n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                                   = 759n;
[@inline] const error_GET_CONFIG_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                                  = 760n;
[@inline] const error_GET_TREASURY_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                        = 761n;
[@inline] const error_GET_WHITELISTED_ADDRESS_OPT_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                    = 762n;
[@inline] const error_GET_TOKEN_SALE_RECORD_OPT_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                      = 763n;
[@inline] const error_GET_TOKEN_SALE_HAS_STARTED_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                     = 764n;
[@inline] const error_GET_WHITELIST_AMOUNT_TOTAL_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                     = 765n;
[@inline] const error_GET_OVERALL_AMOUNT_TOTAL_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                       = 766n;

// ------------------------------------------------------------------------------
//
// USDM Token Controller Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_USDM_TOKEN_CONTROLLER_CONTRACT_NOT_FOUND                                                          = 767n;
[@inline] const error_ONLY_USDM_TOKEN_CONTROLLER_CONTRACT_ALLOWED                                                       = 768n;


// ------------------------------------------------------------------------------
//
// Token Pool Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TOKEN_POOL_CONTRACT_NOT_FOUND                                                                     = 769n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                              = 770n;
[@inline] const error_INSUFFICIENT_TOKENS_IN_TOKEN_POOL_TO_BE_BORROWED                                                  = 771n;

[@inline] const error_ON_BORROW_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                             = 772n;
[@inline] const error_ON_REPAY_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                              = 773n;
[@inline] const error_TOKEN_POOL_RESERVES_RATIO_NOT_MET                                                                 = 774n;
[@inline] const error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT                                                             = 775n;
[@inline] const error_DEPOSITOR_RECORD_NOT_FOUND                                                                        = 776n;
[@inline] const error_UPDATE_REWARDS_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                        = 777n;



// ------------------------------------------------------------------------------
//
// Token Pool Reward Errors
//
// ------------------------------------------------------------------------------


[@inline] const error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND                                                              = 778n;
[@inline] const error_TOKEN_POOL_REWARDS_RECORD_NOT_FOUND                                                               = 779n;

// ------------------------------------------------------------------------------
//
// Vault Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_NOT_AUTHORISED_TO_DEPOSIT_INTO_VAULT                                                              = 780n;
[@inline] const error_NOT_AUTHORISED_TO_WITHDRAW_FROM_VAULT                                                             = 781n;
[@inline] const error_AMOUNT_NOT_EQUAL_TO_DEPOSIT                                                                       = 782n;

[@inline] const error_ONLY_OWNER_CAN_DELEGATE_TEZ_TO_BAKER                                                              = 783n;
[@inline] const error_ONLY_OWNER_CAN_DELEGATE_MVK_TO_SATELLITE                                                          = 784n;


// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                                  = 785n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                             = 786n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                            = 787n;
[@inline] const error_VAULT_DELEGATE_TEZ_TO_BAKER_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                = 788n;
[@inline] const error_VAULT_DELEGATE_MVK_TO_SATELLITE_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                            = 789n;
[@inline] const error_VAULT_WITHDRAW_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                             = 790n;
[@inline] const error_VAULT_DEPOSIT_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                              = 791n;
[@inline] const error_VAULT_UPDATE_DEPOSITOR_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                     = 792n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_VAULT_CONTRACT_NOT_FOUND                                                 = 793n;

// VIEWS NOT FOUND ERRORS



// ------------------------------------------------------------------------------
//
// Lending Controller Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_VAULT_CONTROLLER_CONTRACT_NOT_FOUND                                                               = 794n;
[@inline] const error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                                                             = 795n;

[@inline] const error_ONLY_LENDING_CONTROLLER_CONTRACT_ALLOWED                                                          = 796n;

[@inline] const error_VAULT_ALREADY_EXISTS                                                                              = 797n;
[@inline] const error_VAULT_CONTRACT_NOT_FOUND                                                                          = 798n;
[@inline] const error_VAULT_ID_ALREADY_USED                                                                             = 799n;
[@inline] const error_VAULT_IS_UNDERCOLLATERIZED                                                                        = 800n;
[@inline] const error_TOTAL_SERVICE_LOAN_FEE_CANNOT_BE_GREATER_THAN_BORROWED_AMOUNT                                     = 801n;
[@inline] const error_LOAN_FEE_CANNOT_BE_GREATER_THAN_BORROWED_AMOUNT                                                   = 802n;
[@inline] const error_BORROW_CALLBACK_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                       = 803n;
[@inline] const error_REPAY_CALLBACK_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                        = 804n;
[@inline] const error_USER_BORROW_INDEX_CANNOT_BE_GREATER_THAN_TOKEN_BORROW_INDEX                                       = 805n;
[@inline] const error_REPAY_CALLBACK_ENTRYPOINT_IN_TOKEN_POOL_CONTRACT_NOT_FOUND                                        = 806n;
[@inline] const error_LOAN_OUTSTANDING_MISCALCULATION                                                                   = 807n;
[@inline] const error_PRINCIPAL_REDUCTION_MISCALCULATION                                                                = 808n;
[@inline] const error_LOAN_INTEREST_MISCALCULATION                                                                      = 809n;
[@inline] const error_LOAN_OUTSTANDING_IS_NOT_ZERO                                                                      = 810n;


// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_REGISTER_DEPOSIT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                              = 811n;
[@inline] const error_REGISTER_WITHDRAWAL_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                           = 812n;


[@inline] const error_GET_VAULT_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND                                       = 813n;

[@inline] const error_MINIMUM_LOAN_FEE_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_MINIMUM_LOAN_FEE                           = 814n;
[@inline] const error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_INTEREST_ACCRUED                                   = 815n;
[@inline] const error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID                                = 816n;
[@inline] const error_LOAN_TOKEN_ALREADY_EXISTS                                                                         = 817n;
[@inline] const error_LOAN_TOKEN_RECORD_NOT_FOUND                                                                       = 818n;
[@inline] const error_LOAN_TOKEN_RECORD_ALREADY_EXISTS                                                                  = 819n;
[@inline] const error_COLLATERAL_TOKEN_RECORD_NOT_FOUND                                                                 = 820n;
[@inline] const error_SENDER_MUST_BE_VAULT_ADDRESS                                                                      = 821n;

[@inline] const error_INSUFFICIENT_COLLATERAL_TOKEN_BALANCE_IN_VAULT                                                    = 822n;
[@inline] const error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE                                                = 823n;
[@inline] const error_CANNOT_WITHDRAW_AS_VAULT_IS_UNDERCOLLATERIZED                                                     = 824n;

[@inline] const error_VAULT_IS_NOT_UNDERCOLLATERIZED                                                                    = 825n;

[@inline] const error_OWNER_VAULT_SET_DOES_NOT_EXIST                                                                    = 826n;

[@inline] const error_GET_COL_TOKEN_RECORD_BY_ADDRESS_OPT_VIEW_NOT_FOUND                                                = 827n;

[@inline] const error_CANNOT_BURN_MORE_THAN_TOTAL_AMOUNT_OF_LP_TOKENS                                                   = 828n;
[@inline] const error_TOKEN_POOL_TOTAL_CANNOT_BE_NEGATIVE                                                               = 829n;
[@inline] const error_TOKEN_POOL_REMAINING_CANNOT_BE_NEGATIVE                                                           = 830n;

[@inline] const error_TEZOS_SENT_IS_NOT_EQUAL_TO_WITHDRAW_AMOUNT                                                        = 831n;

[@inline] const error_CANNOT_LIQUIDATE_MORE_THAN_TOTAL_COLLATERAL_BALANCE                                               = 832n;

[@inline] const error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION                                                           = 833n;
[@inline] const error_REBASE_DECIMALS_OUT_OF_BOUNDS                                                                     = 834n;

[@inline] const error_CANNOT_LIQUIDATE_MORE_THAN_VAULT_LOAN_OUTSTANDING_TOTAL                                           = 835n;
[@inline] const error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE                                               = 836n;

[@inline] const error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL                        = 837n;




