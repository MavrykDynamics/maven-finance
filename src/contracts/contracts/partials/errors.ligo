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

[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_CONTRACT_NOT_FOUND                                                        = 20n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_CONTRACT_NOT_FOUND                                                   = 21n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND                                                                   = 22n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_NOT_FOUND                                                           = 23n;
[@inline] const error_BREAK_GLASS_ENTRYPOINT_NOT_FOUND                                                                  = 24n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND                                                              = 25n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND                                                   = 26n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND                                                     = 27n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND                                             = 28n;
[@inline] const error_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_IN_NOT_FOUND                                                     = 29n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND                                                    = 30n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND                                                     = 31n;

[@inline] const error_COUNCIL_SIZE_EXCEEDED                                                                             = 32n;
[@inline] const error_COUNCIL_MEMBER_ALREADY_EXISTS                                                                     = 33n;
[@inline] const error_COUNCIL_MEMBER_NOT_FOUND                                                                          = 34n;
[@inline] const error_COUNCIL_THRESHOLD_ERROR                                                                           = 35n;
[@inline] const error_COUNCIL_ACTION_NOT_FOUND                                                                          = 36n;
[@inline] const error_COUNCIL_ACTION_EXECUTED                                                                           = 37n;
[@inline] const error_COUNCIL_ACTION_FLUSHED                                                                            = 38n;
[@inline] const error_COUNCIL_ACTION_EXPIRED                                                                            = 39n;
[@inline] const error_COUNCIL_ACTION_PARAMETER_NOT_FOUND                                                                = 40n;
[@inline] const error_COUNCIL_ACTION_ALREADY_SIGNED_BY_SENDER                                                           = 41n;



// ------------------------------------------------------------------------------
//
// MVK Token Error
//
// ------------------------------------------------------------------------------

[@inline] const error_MVK_TOKEN_CONTRACT_NOT_FOUND                                                                      = 42n;
[@inline] const error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED                                                                   = 43n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                              = 44n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                         = 45n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                             = 46n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                               = 47n;
[@inline] const error_ASSERT_METADATA_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                        = 48n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                               = 49n;
[@inline] const error_BALANCE_OF_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                             = 50n;
[@inline] const error_UPDATE_OPERATORS_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                       = 51n;
[@inline] const error_MINT_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                                   = 52n;
[@inline] const error_UPDATE_INFLATION_RATE_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                             = 53n;
[@inline] const error_TRIGGER_INFLATION_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                                 = 54n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                                    = 55n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                        = 56n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                      = 57n;
[@inline] const error_GET_INFLATION_RATE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                           = 58n;
[@inline] const error_GET_NEXT_INFLATION_TIMESTAMP_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                 = 59n;
[@inline] const error_GET_OPERATOR_OPT_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                             = 60n;
[@inline] const error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                                  = 61n;
[@inline] const error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                             = 62n;
[@inline] const error_GET_MAXIMUM_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                           = 63n;
[@inline] const error_GET_TOTAL_AND_MAXIMUM_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND                                 = 64n;



// ------------------------------------------------------------------------------
//
// Break Glass Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_BREAK_GLASS_CONTRACT_NOT_FOUND                                                                    = 65n;
[@inline] const error_ONLY_BREAK_GLASS_CONTRACT_ALLOWED                                                                 = 66n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_GLASS_NOT_BROKEN                                                                                  = 67n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_BREAK_GLASS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 68n;
[@inline] const error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 69n;
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                            = 70n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                       = 71n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                      = 72n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                        = 73n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                           = 74n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                             = 75n;
[@inline] const error_UPDATE_COUNCIL_MEMBER_INFO_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                           = 76n;
[@inline] const error_ADD_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                   = 77n;
[@inline] const error_REMOVE_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 78n;
[@inline] const error_CHANGE_COUNCIL_MEMBER_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                = 79n;
[@inline] const error_FLUSH_ACTION_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                         = 80n;
[@inline] const error_SIGN_ACTION_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 81n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                           = 82n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                                  = 83n;
[@inline] const error_GET_GLASS_BROKEN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                           = 84n;
[@inline] const error_GET_CONFIG_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                                 = 85n;
[@inline] const error_GET_COUNCIL_MEMBERS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                        = 86n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                    = 87n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                      = 88n;
[@inline] const error_GET_ACTION_OPT_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                             = 89n;
[@inline] const error_GET_ACTION_COUNTER_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                         = 90n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                             = 91n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 92n;



// ------------------------------------------------------------------------------
//
// Council Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                                                                        = 93n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                                                                     = 94n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED                                                    = 95n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                                = 96n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                           = 97n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                          = 98n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                            = 99n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                               = 100n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                 = 101n;
[@inline] const error_UPDATE_COUNCIL_MEMBER_INFO_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                               = 102n;
[@inline] const error_COUNCIL_ACTION_ADD_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                = 103n;
[@inline] const error_COUNCIL_ACTION_REMOVE_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 104n;
[@inline] const error_COUNCIL_ACTION_CHANGE_MEMBER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 105n;
[@inline] const error_COUNCIL_ACTION_SET_BAKER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                 = 106n;
[@inline] const error_COUNCIL_ACTION_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                     = 107n;
[@inline] const error_COUNCIL_ACTION_ADD_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                = 108n;
[@inline] const error_COUNCIL_ACTION_REMOVE_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 109n;
[@inline] const error_COUNCIL_ACTION_UPDATE_VESTEE_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                             = 110n;
[@inline] const error_COUNCIL_ACTION_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 111n;
[@inline] const error_COUNCIL_ACTION_TRANSFER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                  = 112n;
[@inline] const error_COUNCIL_ACTION_REQUEST_TOKENS_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                            = 113n;
[@inline] const error_COUNCIL_ACTION_REQUEST_MINT_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                              = 114n;
[@inline] const error_COUNCIL_ACTION_SET_CONTRACT_BAKER_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 115n;
[@inline] const error_COUNCIL_ACTION_DROP_FINANCIAL_REQ_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                        = 116n;
[@inline] const error_FLUSH_ACTION_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                             = 117n;
[@inline] const error_SIGN_ACTION_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                              = 118n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                                               = 119n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                      = 120n;
[@inline] const error_GET_CONFIG_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                     = 121n;
[@inline] const error_GET_COUNCIL_MEMBERS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                            = 122n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                        = 123n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                          = 124n;
[@inline] const error_GET_COUNCIL_ACTION_VIEW_OPT_IN_COUNCIL_CONTRACT_NOT_FOUND                                         = 125n;
[@inline] const error_GET_ACTION_COUNTER_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                             = 126n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                                 = 127n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_COUNCIL_CONTRACT_NOT_FOUND                                              = 128n;



// ------------------------------------------------------------------------------
//
// Delegation Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                                                     = 129n;
[@inline] const error_SATELLITE_TREASURY_CONTRACT_NOT_FOUND                                                             = 130n;
[@inline] const error_ONLY_DELEGATION_CONTRACT_ALLOWED                                                                  = 131n;
[@inline] const error_ONLY_SELF_OR_SENDER_ALLOWED                                                                       = 132n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_SATELLITE_ALLOWED                                                                            = 133n;
[@inline] const error_SATELLITE_NOT_ALLOWED                                                                             = 134n;
[@inline] const error_SATELLITE_NOT_FOUND                                                                               = 135n;
[@inline] const error_SATELLITE_ALREADY_EXISTS                                                                          = 136n;

[@inline] const error_DELEGATE_NOT_ALLOWED                                                                              = 137n;
[@inline] const error_DELEGATE_NOT_FOUND                                                                                = 138n;
[@inline] const error_DELEGATE_ALREADY_EXISTS                                                                           = 139n;
[@inline] const error_ALREADY_DELEGATED_SATELLITE                                                                       = 140n;

[@inline] const error_SATELLITE_REWARDS_NOT_FOUND                                                                       = 141n;
[@inline] const error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND                                                      = 142n;

[@inline] const error_MAXIMUM_AMOUNT_OF_SATELLITES_REACHED                                                              = 143n;
[@inline] const error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT                                                          = 144n;
[@inline] const error_SATELLITE_FEE_EXCEEDS_TOTAL_REWARD                                                                = 145n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                    = 146n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                = 147n;
[@inline] const error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                    = 148n;
[@inline] const error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                  = 149n;
[@inline] const error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                  = 150n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED                                        = 151n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                             = 152n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                        = 153n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 154n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                         = 155n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                            = 156n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                              = 157n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                             = 158n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 159n;
[@inline] const error_TOGGLE_PAUSE_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                    = 160n;
[@inline] const error_TOGGLE_PAUSE_UNDELEGATE_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                     = 161n;
[@inline] const error_TOGGLE_PAUSE_REGISTER_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                       = 162n;
[@inline] const error_TOGGLE_PAUSE_UNREGISTER_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                     = 163n;
[@inline] const error_TOGGLE_PAUSE_UPDATE_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                         = 164n;
[@inline] const error_TOGGLE_PAUSE_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                        = 165n;
[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                 = 166n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                             = 167n;
[@inline] const error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                 = 168n;
[@inline] const error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 169n;
[@inline] const error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 170n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                     = 171n;
[@inline] const error_ON_STAKE_CHANGE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 172n;
[@inline] const error_UPDATE_SATELLITE_STATUS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                               = 173n;
[@inline] const error_ON_SATELLITE_REWARD_PAID_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                              = 174n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                                            = 175n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                                   = 176n;
[@inline] const error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                                  = 177n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                     = 178n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 179n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                      = 180n;
[@inline] const error_GET_DELEGATE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                            = 181n;
[@inline] const error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 182n;
[@inline] const error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                   = 183n;
[@inline] const error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                       = 184n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                              = 185n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND                                           = 186n;



// ------------------------------------------------------------------------------
//
// Doorman Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                                                                        = 187n;
[@inline] const error_ONLY_DOORMAN_CONTRACT_ALLOWED                                                                     = 188n;
[@inline] const error_FARM_TREASURY_CONTRACT_NOT_FOUND                                                                  = 189n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_SMVK_ACCESS_AMOUNT_NOT_REACHED                                                                    = 190n;
[@inline] const error_MVK_ACCESS_AMOUNT_NOT_REACHED                                                                     = 191n;

[@inline] const error_USER_STAKE_RECORD_NOT_FOUND                                                                       = 192n;
[@inline] const error_NOT_ENOUGH_SMVK_BALANCE                                                                           = 193n;
[@inline] const error_UNSTAKE_AMOUNT_ERROR                                                                              = 194n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                       = 195n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                     = 196n;
[@inline] const error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                    = 197n;
[@inline] const error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED                                                  = 198n;

[@inline] const error_ALL_DOORMAN_CONTRACT_ENTRYPOINTS_SHOULD_BE_PAUSED_TO_MIGRATE_FUNDS                                = 199n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                = 200n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                           = 201n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 202n;
[@inline] const error_UPDATE_MIN_MVK_AMOUNT_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                    = 203n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                               = 204n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                 = 205n;
[@inline] const error_MIGRATE_FUNDS_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                            = 206n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                = 207n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                              = 208n;
[@inline] const error_TOGGLE_PAUSE_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                       = 209n;
[@inline] const error_TOGGLE_PAUSE_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                     = 210n;
[@inline] const error_TOGGLE_PAUSE_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                    = 211n;
[@inline] const error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                    = 212n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                  = 213n;
[@inline] const error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                                 = 214n;
[@inline] const error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                               = 215n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND                                               = 216n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                                      = 217n;
[@inline] const error_GET_MIN_MVK_AMOUNT_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                             = 218n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                        = 219n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 220n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                         = 221n;
[@inline] const error_GET_USER_STAKE_BALANCE_OPT_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                     = 222n;
[@inline] const error_GET_STAKED_MVK_TOTAL_SUPPLY_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                    = 223n;
[@inline] const error_GET_UNCLAIMED_REWARDS_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                          = 224n;
[@inline] const error_GET_ACCUMULATED_FEES_PER_SHARE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                 = 225n;
[@inline] const error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                             = 226n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                                 = 227n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND                                              = 228n;



// ------------------------------------------------------------------------------
//
// Emergency Governance Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                                           = 229n;
[@inline] const error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED                                                        = 230n;
[@inline] const error_TAX_TREASURY_CONTRACT_NOT_FOUND                                                                   = 231n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_EMERGENCY_GOVERNANCE_ALREADY_IN_THE_PROCESS                                                       = 232n;
[@inline] const error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS                                                           = 233n;
[@inline] const error_EMERGENCY_GOVERNANCE_NOT_FOUND                                                                    = 234n;
[@inline] const error_EMERGENCY_GOVERNANCE_DROPPED                                                                      = 235n;
[@inline] const error_EMERGENCY_GOVERNANCE_EXECUTED                                                                     = 236n;
[@inline] const error_EMERGENCY_GOVERNANCE_VOTE_ALEADY_REGISTERED                                                       = 237n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                   = 238n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                              = 239n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                             = 240n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                               = 241n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                    = 242n;
[@inline] const error_TRIGGER_EMERGENCY_CONTROL_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                   = 243n;
[@inline] const error_VOTE_FOR_EMERGENCY_CONTROL_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                  = 244n;
[@inline] const error_DROP_EMERGENCY_GOVERNANCE_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                   = 245n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                  = 246n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 247n;
[@inline] const error_GET_CONFIG_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                        = 248n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                             = 249n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                           = 250n;
[@inline] const error_GET_EMERGENCY_GOVERNANCE_OPT_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                      = 251n;
[@inline] const error_GET_CURRENT_EMERGENCY_GOVERNANCE_ID_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND               = 252n;
[@inline] const error_GET_NEXT_EMERGENCY_GOVERNANCE_ID_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                  = 253n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 254n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                 = 255n;



// ------------------------------------------------------------------------------
//
// Farm Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_FARM_CONTRACT_NOT_FOUND                                                                           = 256n;
[@inline] const error_ONLY_FARM_CONTRACT_ALLOWED                                                                        = 257n;
[@inline] const error_ONLY_FARM_FACTORY_OR_COUNCIL_CONTRACT_ALLOWED                                                     = 258n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION                                                        = 259n;
[@inline] const error_DEPOSITOR_NOT_FOUND                                                                               = 260n;
[@inline] const error_WITHDRAWN_AMOUNT_TOO_HIGH                                                                         = 261n;
[@inline] const error_NO_FARM_REWARDS_TO_CLAIM                                                                          = 262n;

[@inline] const error_FARM_NOT_INITIATED                                                                                = 263n;
[@inline] const error_FARM_ALREADY_OPEN                                                                                 = 264n;
[@inline] const error_FARM_CLOSED                                                                                       = 265n;
[@inline] const error_DEPOSITOR_NOT_FOUND                                                                               = 266n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                        = 267n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                       = 268n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED                                                          = 269n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 270n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                              = 271n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                             = 272n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                               = 273n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                  = 274n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                    = 275n;
[@inline] const error_UPDATE_BLOCKS_PER_MINUTE_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                    = 276n;
[@inline] const error_INIT_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 277n;
[@inline] const error_CLOSE_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                  = 278n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                   = 279n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                 = 280n;
[@inline] const error_TOGGLE_PAUSE_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                        = 281n;
[@inline] const error_TOGGLE_PAUSE_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                       = 282n;
[@inline] const error_TOGGLE_PAUSE_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                          = 283n;
[@inline] const error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                     = 284n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                    = 285n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                       = 286n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                                                  = 287n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                         = 288n;
[@inline] const error_GET_CONFIG_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                        = 289n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                           = 290n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                             = 291n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                            = 292n;
[@inline] const error_GET_LAST_BLOCK_UPDATE_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                             = 293n;
[@inline] const error_GET_ACCUMULATED_REWARDS_PER_SHARE_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                 = 294n;
[@inline] const error_GET_CLAIMED_REWARDS_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                               = 295n;
[@inline] const error_GET_DEPOSITOR_OPT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                 = 296n;
[@inline] const error_GET_OPEN_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                          = 297n;
[@inline] const error_GET_INIT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                          = 298n;
[@inline] const error_GET_INIT_BLOCK_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                    = 299n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                    = 300n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_FARM_CONTRACT_NOT_FOUND                                                 = 301n;



// ------------------------------------------------------------------------------
//
// Farm Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_FARM_FACTORY_CONTRACT_NOT_FOUND                                                                   = 302n;
[@inline] const error_ONLY_FARM_FACTORY_CONTRACT_ALLOWED                                                                = 303n;
[@inline] const error_ONLY_ADMIN_OR_FARM_FACTORY_CONTRACT_ALLOWED                                                       = 304n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_FARM_ALREADY_TRACKED                                                                              = 305n;
[@inline] const error_FARM_NOT_TRACKED                                                                                  = 306n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                            = 307n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                             = 308n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED                                           = 309n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                           = 310n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                      = 311n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                     = 312n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                       = 313n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                          = 314n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                            = 315n;
[@inline] const error_UPDATE_BLOCKS_PER_MINUTE_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                            = 316n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                           = 317n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 318n;
[@inline] const error_TOGGLE_PAUSE_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                            = 319n;
[@inline] const error_TOGGLE_PAUSE_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                             = 320n;
[@inline] const error_TOGGLE_PAUSE_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                           = 321n;
[@inline] const error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 322n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                          = 323n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                        = 324n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                          = 325n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                  = 326n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_CHECK_FARM_EXISTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 327n;
[@inline] const error_GET_ADMIN_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                                 = 328n;
[@inline] const error_GET_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                                = 329n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                    = 330n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                   = 331n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                     = 332n;
[@inline] const error_GET_TRACKED_FARMS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 333n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                            = 334n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 335n;
[@inline] const error_GET_PRODUCT_LAMBDA_OPT_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                    = 336n;
[@inline] const error_GET_PRODUCT_LAMBDA_LEDGER_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                                 = 337n;



// ------------------------------------------------------------------------------
//
// Governance Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_CONTRACT_NOT_FOUND                                                                     = 338n;
[@inline] const error_ONLY_GOVERNANCE_CONTRACT_ALLOWED                                                                  = 339n;
[@inline] const error_PAYMENT_TREASURY_CONTRACT_NOT_FOUND                                                               = 340n;
[@inline] const error_PROPOSE_TAX_TREASURY_CONTRACT_NOT_FOUND                                                           = 341n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND                                                             = 342n;
[@inline] const error_ONLY_ACCESSIBLE_DURING_VOTING_ROUND                                                               = 343n;
[@inline] const error_ONLY_ACCESSIBLE_DURING_TIMELOCK_ROUND                                                             = 344n;
[@inline] const error_SNAPSHOT_NOT_TAKEN                                                                                = 345n;
[@inline] const error_HIGHEST_VOTED_PROPOSAL_NOT_FOUND                                                                  = 346n;
[@inline] const error_TIMELOCK_PROPOSAL_NOT_FOUND                                                                       = 347n;
[@inline] const error_PROPOSAL_NOT_FOUND                                                                                = 348n;
[@inline] const error_PROPOSAL_LOCKED                                                                                   = 349n;
[@inline] const error_PROPOSAL_CANNOT_BE_EXECUTED_NOW                                                                   = 350n;
[@inline] const error_PROPOSAL_DROPPED                                                                                  = 351n;
[@inline] const error_PROPOSAL_EXECUTED                                                                                 = 352n;
[@inline] const error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE                                                                   = 353n;
[@inline] const error_PROPOSAL_DATA_NOT_FOUND                                                                           = 354n;
[@inline] const error_PROPOSAL_EXECUTION_ALREADY_STARTED                                                                = 355n;
[@inline] const error_PROPOSAL_NOT_EXECUTED                                                                             = 356n;
[@inline] const error_PROPOSAL_PAYMENTS_PROCESSED                                                                       = 357n;
[@inline] const error_PROPOSAL_NOT_LOCKED                                                                               = 358n;
[@inline] const error_NO_PROPOSAL_TO_VOTE_FOR                                                                           = 359n;
[@inline] const error_NO_PROPOSAL_TO_EXECUTE                                                                            = 360n;
[@inline] const error_VOTE_NOT_FOUND                                                                                    = 361n;
[@inline] const error_VOTE_ALREADY_RECORDED                                                                             = 362n;
[@inline] const error_CURRENT_ROUND_NOT_FINISHED                                                                        = 363n;
[@inline] const error_MAX_PROPOSAL_REACHED                                                                              = 364n;
[@inline] const error_DEVELOPER_NOT_WHITELISTED                                                                         = 365n;
[@inline] const error_NOT_ENOUGH_WHITELISTED_DEVELOPERS                                                                 = 366n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                             = 367n;
[@inline] const error_SET_GOVERNANCE_PROXY_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                  = 368n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                       = 369n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 370n;
[@inline] const error_UPDATE_WHITELIST_DEVELOPERS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                           = 371n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                            = 372n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                      = 373n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 374n;
[@inline] const error_SET_CONTRACT_ADMIN_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 375n;
[@inline] const error_SET_CONTRACT_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                               = 376n;
[@inline] const error_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 377n;
[@inline] const error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                 = 378n;
[@inline] const error_START_NEXT_ROUND_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 379n;
[@inline] const error_PROPOSE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                               = 380n;
[@inline] const error_PROPOSAL_ROUND_VOTE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                   = 381n;
[@inline] const error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 382n;
[@inline] const error_ADD_UPDATE_PAYMENT_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                               = 383n;
[@inline] const error_LOCK_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 384n;
[@inline] const error_VOTING_ROUND_VOTE_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 385n;
[@inline] const error_EXECUTE_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 386n;
[@inline] const error_PROCESS_PROPOSAL_PAYMENT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                              = 387n;
[@inline] const error_PROCESS_PROPOSAL_SINGLE_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                          = 388n;
[@inline] const error_DROP_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 389n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 390n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                                   = 391n;
[@inline] const error_GET_CONFIG_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                                  = 392n;
[@inline] const error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                = 393n;
[@inline] const error_GET_WHITELIST_DEVELOPERS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 394n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                       = 395n;
[@inline] const error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 396n;
[@inline] const error_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                         = 397n;
[@inline] const error_GET_PROPOSAL_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 398n;
[@inline] const error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                            = 399n;
[@inline] const error_GET_CURRENT_CYCLE_INFO_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                      = 400n;
[@inline] const error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 401n;
[@inline] const error_GET_CURRENT_ROUND_HIGHEST_VOTED_PROPOSAL_ID_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                 = 402n;
[@inline] const error_GET_TIMELOCK_PROPOSAL_ID_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                    = 403n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                              = 404n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND                                           = 405n;



// ------------------------------------------------------------------------------
//
// Governance Financial Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                                           = 406n;
[@inline] const error_ONLY_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED                                                        = 407n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_FINANCIAL_CONTRACT_ALLOWED                                               = 408n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_FINANCIAL_REQUEST_NOT_FOUND                                                                       = 409n;
[@inline] const error_FINANCIAL_REQUEST_EXECUTED                                                                        = 410n;
[@inline] const error_FINANCIAL_REQUEST_EXPIRED                                                                         = 411n;
[@inline] const error_FINANCIAL_REQUEST_DROPPED                                                                         = 412n;
[@inline] const error_FINANCIAL_REQUEST_SNAPSHOT_NOT_FOUND                                                              = 413n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                   = 414n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                              = 415n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                             = 416n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                               = 417n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                      = 418n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                    = 419n;
[@inline] const error_REQUEST_TOKENS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                              = 420n;
[@inline] const error_REQUEST_MINT_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                = 421n;
[@inline] const error_SET_CONTRACT_BAKER_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                          = 422n;
[@inline] const error_DROP_FINANCIAL_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                      = 423n;
[@inline] const error_VOTE_FOR_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                            = 424n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                         = 425n;
[@inline] const error_GET_CONFIG_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                        = 426n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                 = 427n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                     = 428n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                             = 429n;
[@inline] const error_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                               = 430n;
[@inline] const error_GET_FINANCIAL_REQUEST_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                         = 431n;
[@inline] const error_GET_FINANCIAL_REQUEST_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                = 432n;
[@inline] const error_GET_FINANCIAL_REQUEST_COUNTER_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                     = 433n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                    = 434n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND                                 = 435n;



// ------------------------------------------------------------------------------
//
// Governance Proxy Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                                               = 436n;
[@inline] const error_ONLY_GOVERNANCE_PROXY_CONTRACT_ALLOWED                                                            = 437n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA                                                         = 438n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_PROXY_LAMBDA_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                = 439n;
[@inline] const error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                       = 440n;
[@inline] const error_DATA_PACKING_HELPER_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                             = 441n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                             = 442n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                         = 443n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                               = 444n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                 = 445n;
[@inline] const error_GET_PROXY_LAMBDA_OPT_VIEW_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND                                  = 446n;



// ------------------------------------------------------------------------------
//
// Treasury Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TREASURY_CONTRACT_NOT_FOUND                                                                       = 447n;
[@inline] const error_ONLY_TREASURY_CONTRACT_ALLOWED                                                                    = 448n;
[@inline] const error_ONLY_ADMIN_OR_TREASURY_FACTORY_CONTRACT_ALLOWED                                                   = 449n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                                   = 450n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                      = 451n;
[@inline] const error_UPDATE_MVK_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                       = 452n;
[@inline] const error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                                  = 453n;
[@inline] const error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_PAUSED                                                = 454n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 455n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                          = 456n;
[@inline] const error_SET_BAKER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 457n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                         = 458n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                              = 459n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                = 460n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                        = 461n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                        = 462n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 463n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 464n;
[@inline] const error_TOGGLE_PAUSE_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                   = 465n;
[@inline] const error_TOGGLE_PAUSE_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                      = 466n;
[@inline] const error_TOGGLE_PAUSE_STAKE_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                      = 467n;
[@inline] const error_TOGGLE_PAUSE_UNSTAKE_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                    = 468n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                                = 469n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                   = 470n;
[@inline] const error_UPDATE_MVK_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                    = 471n;
[@inline] const error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                               = 472n;
[@inline] const error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 473n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                                     = 474n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                        = 475n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                 = 476n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                       = 477n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                         = 478n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                                = 479n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_TREASURY_CONTRACT_NOT_FOUND                                             = 480n;



// ------------------------------------------------------------------------------
//
// Treasury Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                                               = 481n;
[@inline] const error_ONLY_TREASURY_FACTORY_CONTRACT_ALLOWED                                                            = 482n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_TREASURY_ALREADY_TRACKED                                                                          = 483n;
[@inline] const error_TREASURY_NOT_TRACKED                                                                              = 484n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                    = 485n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                     = 486n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_PAUSED                                   = 487n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                       = 488n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                  = 489n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 490n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                   = 491n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                      = 492n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                = 493n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                        = 494n;
[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                       = 495n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                     = 496n;
[@inline] const error_TOGGLE_PAUSE_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                    = 497n;
[@inline] const error_TOGGLE_PAUSE_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                     = 498n;
[@inline] const error_TOGGLE_PAUSE_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                   = 499n;
[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 500n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                  = 501n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 502n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                      = 503n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                              = 504n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_CHECK_TREASURY_EXISTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 505n;
[@inline] const error_GET_ADMIN_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                             = 506n;
[@inline] const error_GET_TRACKED_TREASURIES_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 507n;
[@inline] const error_GET_BREAK_GLASS_CONFIG_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 508n;
[@inline] const error_GET_WHITELIST_TOKEN_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                         = 509n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                               = 510n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                 = 511n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                        = 512n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                     = 513n;
[@inline] const error_GET_PRODUCT_LAMBDA_OPT_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                = 514n;
[@inline] const error_GET_PRODUCT_LAMBDA_LEDGER_VIEW_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND                             = 515n;



// ------------------------------------------------------------------------------
//
// Vesting Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_VESTING_CONTRACT_NOT_FOUND                                                                        = 516n;
[@inline] const error_ONLY_VESTING_CONTRACT_ALLOWED                                                                     = 517n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_NO_VESTING_REWARDS_TO_CLAIM                                                                       = 518n;
[@inline] const error_CANNOT_CLAIM_VESTING_REWARDS_NOW                                                                  = 519n;

[@inline] const error_VESTING_IN_MONTHS_TOO_SHORT                                                                       = 520n;
[@inline] const error_CLIFF_PERIOD_TOO_LONG                                                                             = 521n;

[@inline] const error_VESTEE_ALREADY_EXISTS                                                                             = 522n;
[@inline] const error_VESTEE_NOT_FOUND                                                                                  = 523n;
[@inline] const error_VESTEE_LOCKED                                                                                     = 524n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                                = 525n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                           = 526n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                          = 527n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                               = 528n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                 = 529n;
[@inline] const error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                               = 530n;
[@inline] const error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                            = 531n;
[@inline] const error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                            = 532n;
[@inline] const error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                       = 533n;
[@inline] const error_CLAIM_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                                    = 534n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                                               = 535n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                      = 536n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                        = 537n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                          = 538n;
[@inline] const error_GET_TOTAL_VESTED_AMOUNT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                        = 539n;
[@inline] const error_GET_VESTEE_BALANCE_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                             = 540n;
[@inline] const error_GET_VESTEE_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                 = 541n;
[@inline] const error_GET_TOTAL_VESTED_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                               = 542n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                                 = 543n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_VESTING_CONTRACT_NOT_FOUND                                              = 544n;



// ------------------------------------------------------------------------------
//
// Aggregator Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_AGGREGATOR_CONTRACT_NOT_FOUND                                                                     = 545n;
[@inline] const error_AGGREGATOR_CONTRACT_EXISTS                                                                        = 546n;
[@inline] const error_ONLY_ADMIN_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                                 = 547n;
[@inline] const error_ONLY_AUTHORIZED_ORACLES_ALLOWED                                                                   = 548n;
[@inline] const error_NOT_ALLOWED_TO_TRIGGER_DEVIATION_BAN                                                              = 549n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ORACLE_ALREADY_ADDED_TO_AGGREGATOR                                                                = 550n;
[@inline] const error_ORACLE_NOT_PRESENT_IN_AGGREGATOR                                                                  = 551n;
[@inline] const error_NOT_A_CONTRACT                                                                                    = 552n;
[@inline] const error_WRONG_ROUND_NUMBER                                                                                = 553n;
[@inline] const error_LAST_ROUND_IS_NOT_COMPLETE                                                                        = 554n;
[@inline] const error_YOU_CANNOT_COMMIT_NOW                                                                             = 555n;
[@inline] const error_YOU_CANNOT_REVEAL_NOW                                                                             = 556n;
[@inline] const error_NOT_ENOUGH_TEZ_IN_CONTRACT_TO_WITHDRAW                                                            = 557n;
[@inline] const error_ORACLE_HAS_ALREADY_ANSWERED_COMMIT                                                                = 558n;
[@inline] const error_ORACLE_HAS_ALREADY_ANSWERED_REVEAL                                                                = 559n;
[@inline] const error_ORACLE_DID_NOT_ANSWER                                                                             = 560n;
[@inline] const error_REVEAL_DOES_NOT_MATCH_COMMITMENT                                                                  = 561n;
[@inline] const error_TEZOS_ADDRESS_NOT_PRESENT_IN_HASH_COMMIT                                                          = 562n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_REQUEST_RATE_UPDATE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                      = 563n;
[@inline] const error_REQUEST_RATE_UPDATE_DEVIATION_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                            = 564n;
[@inline] const error_SET_OBSERVATION_COMMIT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                   = 565n;
[@inline] const error_SET_OBSERVATION_REVEAL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                   = 566n;
[@inline] const error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                                      = 567n;
[@inline] const error_WITHDRAW_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED                               = 568n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                             = 569n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 570n;
[@inline] const error_SET_MAINTAINER_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 571n;
[@inline] const error_SET_NAME_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                              = 572n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                       = 573n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                         = 574n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                            = 575n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                              = 576n;
[@inline] const error_ADD_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                            = 577n;
[@inline] const error_REMOVE_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                         = 578n;

[@inline] const error_PAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                             = 579n;
[@inline] const error_UNPAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 580n;
[@inline] const error_TOGGLE_PAUSE_REQUEST_RATE_UPDATE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                      = 581n;
[@inline] const error_TOGGLE_PAUSE_REQUEST_RATE_UPDATE_DEV_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                  = 582n;
[@inline] const error_TOGGLE_PAUSE_SET_OBSERVATION_COMMIT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                   = 583n;
[@inline] const error_TOGGLE_PAUSE_SET_OBSERVATION_REVEAL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                   = 584n;
[@inline] const error_TOGGLE_PAUSE_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                      = 585n;
[@inline] const error_TOGGLE_PAUSE_WITHDRAW_REWARD_SMVK_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                     = 586n;

[@inline] const error_REQUEST_RATE_UPDATE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                   = 587n;
[@inline] const error_REQUEST_RATE_UPDATE_DEVIATION_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                         = 588n;
[@inline] const error_SET_OBSERVATION_COMMIT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                = 589n;
[@inline] const error_SET_OBSERVATION_REVEAL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                = 590n;
[@inline] const error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                   = 591n;
[@inline] const error_WITHDRAW_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                            = 592n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                            = 593n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                   = 594n;
[@inline] const error_GET_CONFIG_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                  = 595n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                      = 596n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 597n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                       = 598n;
[@inline] const error_GET_MAINTAINER_ADDRESS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                      = 599n;
[@inline] const error_GET_ORACLE_ADDRESSES_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                        = 600n;
[@inline] const error_GET_OBSERVATION_COMMITS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 601n;
[@inline] const error_GET_OBSERVATION_REVEALS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                     = 602n;
[@inline] const error_GET_DEVIATION_TRIGGER_INFOS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                 = 603n;
[@inline] const error_GET_DEVIATION_TRIGGER_BAN_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                   = 604n;
[@inline] const error_GET_ORACLE_REWARDS_STAKED_MVK_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                               = 605n;
[@inline] const error_GET_ORACLE_REWARDS_XTZ_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                      = 606n;
[@inline] const error_GET_LAST_COMPLETED_ROUND_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                    = 607n;
[@inline] const error_GET_DECIMALS_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                = 608n;
[@inline] const error_GET_ROUND_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                                   = 609n;
[@inline] const error_GET_ROUNDSTART_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                              = 610n;
[@inline] const error_GET_SWITCHBLOCK_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                             = 611n;
[@inline] const error_GET_CONTRACT_NAME_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 612n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                              = 613n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND                                           = 614n;



// ------------------------------------------------------------------------------
//
// Aggregator Factory Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                                             = 615n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_SENDER_IS_NOT_TRACKED_AGGREGATOR                                                                  = 616n;
[@inline] const error_ONLY_MAINTAINER_ALLOWED                                                                           = 617n;
[@inline] const error_ACTION_FAILED_AS_SATELLITE_IS_NOT_REGISTERED                                                      = 618n;
[@inline] const error_ONLY_ADMIN_OR_GOVERNANCE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                   = 619n;

[@inline] const error_AGGREGATOR_ALREADY_TRACKED                                                                        = 620n;
[@inline] const error_AGGREGATOR_NOT_TRACKED                                                                            = 621n;

// ENTRYPOINTS PAUSED ERRORS
[@inline] const error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                                = 622n;
[@inline] const error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                                 = 623n;
[@inline] const error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                               = 624n;
[@inline] const error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                            = 625n;
[@inline] const error_DISTRIBUTE_REWARD_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_PAUSED                            = 626n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                     = 627n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                = 628n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                               = 629n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                 = 630n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                    = 631n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                      = 632n;
[@inline] const error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 633n;
[@inline] const error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                              = 634n;
[@inline] const error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                            = 635n;
[@inline] const error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                         = 636n;
[@inline] const error_DISTRIBUTE_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                  = 637n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                    = 638n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                            = 639n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                           = 640n;
[@inline] const error_GET_CONFIG_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                          = 641n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                              = 642n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 643n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                               = 644n;
[@inline] const error_GET_TRACKED_AGGREGATORS_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                             = 645n;
[@inline] const error_GET_AGGREGATOR_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                      = 646n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                      = 647n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND                                   = 648n;



// ------------------------------------------------------------------------------
//
// Governance Satellite Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                                           = 649n;
[@inline] const error_ONLY_ADMIN_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED                                                 = 650n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_ONLY_INITIATOR_CAN_DROP_ACTION                                                                    = 651n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_DROPPED                                                               = 652n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_NOT_FOUND                                                             = 653n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_EXECUTED                                                              = 654n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_EXPIRED                                                               = 655n;
[@inline] const error_GOVERNANCE_SATELLITE_ACTION_SNAPSHOT_NOT_FOUND                                                    = 656n;

[@inline] const error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION                                             = 657n;
[@inline] const error_ONLY_SATELLITES_ALLOWED_TO_VOTE_FOR_GOVERNANCE_ACTION                                             = 658n;
[@inline] const error_SATELLITE_NOT_FOUND_IN_ACTION_SNAPSHOT                                                            = 659n;
[@inline] const error_SNAPSHOT_STAKED_MVK_TOTAL_SUPPLY_NOT_FOUND                                                        = 660n;

[@inline] const error_SATELLITE_ORACLE_RECORD_NOT_FOUND                                                                 = 661n;
[@inline] const error_ORACLE_NOT_FOUND                                                                                  = 662n;
[@inline] const error_AGGREGATOR_NEW_STATUS_NOT_FOUND                                                                   = 663n;
[@inline] const error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND                                               = 664n;
[@inline] const error_SATELLITE_AGGREGATORS_SUBSCRIBED_CALCULATION_ERROR                                                = 665n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                   = 666n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                              = 667n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                             = 668n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                               = 669n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                  = 670n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                    = 671n;
[@inline] const error_SUSPEND_SATELLITE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                           = 672n;
[@inline] const error_UNSUSPEND_SATELLITE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                         = 673n;
[@inline] const error_BAN_SATELLITE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                               = 674n;
[@inline] const error_UNBAN_SATELLITE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                             = 675n;
[@inline] const error_REMOVE_ALL_SATELLITE_ORACLES_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                = 676n;
[@inline] const error_ADD_ORACLE_TO_AGGREGATOR_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                    = 677n;
[@inline] const error_REMOVE_ORACLE_IN_AGGREGATOR_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                 = 678n;
[@inline] const error_REGISTER_AGGREGATOR_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                         = 679n;
[@inline] const error_UPDATE_AGGREGATOR_STATUS_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                    = 680n;
[@inline] const error_DROP_ACTION_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                 = 681n;
[@inline] const error_VOTE_FOR_ACTION_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                             = 682n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                  = 683n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                         = 684n;
[@inline] const error_GET_CONFIG_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                        = 685n;
[@inline] const error_GET_GOVERNANCE_ADDRESS_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                            = 686n;
[@inline] const error_GET_WHITELIST_CONTRACTS_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                           = 687n;
[@inline] const error_GET_GENERAL_CONTRACTS_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                             = 688n;
[@inline] const error_GET_GOVERNANCE_SATELLITE_ACTION_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND               = 689n;
[@inline] const error_GET_GOVERNANCE_ACTION_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                = 690n;
[@inline] const error_GET_GOVERNANCE_SATELLITE_ACTION_COUNTER_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND           = 691n;
[@inline] const error_GET_SATELLITE_ORACLE_RECORD_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                   = 692n;
[@inline] const error_GET_LAMBDA_OPT_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                    = 693n;
[@inline] const error_GET_LAMBDA_LEDGER_VIEW_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND                                 = 694n;



// ------------------------------------------------------------------------------
//
// Token Sale Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_TOKEN_SALE_CONTRACT_NOT_FOUND                                                                     = 695n;
[@inline] const error_ONLY_TOKEN_SALE_CONTRACT_ALLOWED                                                                  = 696n;

// CONTRACT SPECIFIC ERRORS
[@inline] const error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ                                                            = 697n;
[@inline] const error_TOKEN_SALE_HAS_NOT_STARTED                                                                        = 698n;
[@inline] const error_WHITELIST_SALE_HAS_NOT_STARTED                                                                    = 699n;
[@inline] const error_USER_IS_NOT_WHITELISTED                                                                           = 700n;
[@inline] const error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED                                                          = 701n;
[@inline] const error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED                                                              = 702n;
[@inline] const error_WHITELIST_MAX_AMOUNT_CAP_REACHED                                                                  = 703n;
[@inline] const error_OVERALL_MAX_AMOUNT_CAP_REACHED                                                                    = 704n;

// ENTRYPOINTS NOT FOUND ERRORS
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                             = 705n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                       = 706n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                         = 707n;
[@inline] const error_ADD_TO_WHITELIST_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                      = 708n;
[@inline] const error_REMOVE_FROM_WHITELIST_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                 = 709n;
[@inline] const error_BUY_TOKENS_ENTRYPOINT_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                            = 710n;

// VIEWS NOT FOUND ERRORS
[@inline] const error_GET_ADMIN_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                                   = 711n;
[@inline] const error_GET_CONFIG_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                                  = 712n;
[@inline] const error_GET_TREASURY_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                                        = 713n;
[@inline] const error_GET_WHITELISTED_ADDRESS_OPT_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                    = 714n;
[@inline] const error_GET_TOKEN_SALE_RECORD_OPT_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                      = 715n;
[@inline] const error_GET_TOKEN_SALE_HAS_STARTED_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                     = 716n;
[@inline] const error_GET_WHITELIST_AMOUNT_TOTAL_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                     = 717n;
[@inline] const error_GET_OVERALL_AMOUNT_TOTAL_VIEW_ADDRESS_VIEW_IN_TOKEN_SALE_CONTRACT_NOT_FOUND                       = 718n;
