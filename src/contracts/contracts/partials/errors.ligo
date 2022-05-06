// ------------------------------------------------------------------------------
//
// General Errors
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                             = 0n;
[@inline] const error_ONLY_GOVERNANCE_PROXY_ALLOWED                                          = 1n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED                               = 2n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                      = 5n;

[@inline] const error_BAD_INPUT                                                              = 12n;

[@inline] const error_LAMBDA_NOT_FOUND                                                       = 24n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                = 25n;

[@inline] const error_SENDER_ALREADY_SIGNED_THIS_ACTION                                      = 18n;

// ------------------------------------------------------------------------------
//
// Break Glass Error
//
// ------------------------------------------------------------------------------

// BREAK GLASS

[@inline] const error_ONLY_COUNCIL_MEMBERS_ALLOWED                                           = 3n;
[@inline] const error_ONLY_EMERGENCY_CONTRACT_ALLOWED                                        = 4n;
[@inline] const error_GLASS_NOT_BROKEN                                                       = 6n;
[@inline] const error_PROPAGATE_BREAK_GLASS_ENTRYPOINT_NOT_FOUND_IN_GOVERNANCE_CONTRACT      = 7n;

[@inline] const error_BREAK_GLASS_COUNCIL_SIZE_EXCEEDED                                      = 8n;
[@inline] const error_BREAK_GLASS_COUNCIL_MEMBER_ALREADY_EXISTS                              = 9n;
[@inline] const error_BREAK_GLASS_COUNCIL_MEMBER_NOT_FOUND                                   = 10n;
[@inline] const error_CANNOT_CHANGE_BREAK_GLASS_COUNCIL_WITHOUT_IMPACTING_THRESHOLD          = 11n;
[@inline] const error_BREAK_GLASS_ACTION_NOT_FOUND                                           = 13n;
[@inline] const error_BREAK_GLASS_ACTION_EXECUTED                                            = 14n;
[@inline] const error_BREAK_GLASS_ACTION_FLUSHED                                             = 15n;
[@inline] const error_BREAK_GLASS_ACTION_EXPIRED                                             = 16n;
[@inline] const error_BREAK_GLASS_ACTION_PARAMETER_NOT_FOUND                                 = 17n;

[@inline] const error_EMERGENCY_CONTRACT_NOT_FOUND                                           = 19n;
[@inline] const error_SET_ADMIN_ENTRYPOINT_IN_CONTRACT_NOT_FOUND                             = 20n;

[@inline] const error_VIEW_GET_WHITELIST_DEVELOPERS_NOT_FOUND                                = 21n;
[@inline] const error_VIEW_GET_GOVERNANCE_PROXY_ADDRESS_NOT_FOUND                            = 22n;
[@inline] const error_DEVELOPER_NOT_WHITELISTED                                              = 23n;

// COUNCIL

[@inline] const error_ONLY_COUNCIL_MEMBERS_ALLOWED                                           = 3n;
[@inline] const error_VESTING_CONTRACT_NOT_FOUND                                             = 5n;

[@inline] const error_CANNOT_CHANGE_COUNCIL_WITHOUT_IMPACTING_THRESHOLD                      = 6n;
[@inline] const error_COUNCIL_MEMBER_NOT_FOUND                                               = 7n;
[@inline] const error_COUNCIL_MEMBER_ALREADY_EXISTS                                          = 8n;
[@inline] const error_INVALID_BLOCKS_PER_MINUTE                                              = 10n;
[@inline] const error_VESTEE_ALREADY_EXISTS                                                  = 11n;
[@inline] const error_VESTEE_NOT_FOUND                                                       = 12n;
[@inline] const error_VIEW_GET_VESTEE_OPT_NOT_FOUND                                          = 13n;
[@inline] const error_WRONG_TOKEN_TYPE_PROVIDED                                              = 14n;
[@inline] const error_FINANCIAL_REQUEST_NOT_FOUND                                            = 15n;
[@inline] const error_FINANCIAL_REQUEST_DROPPED                                              = 16n;
[@inline] const error_COUNCIL_ACTION_NOT_FOUND                                               = 17n;
[@inline] const error_COUNCIL_ACTION_FLUSHED                                                 = 18n;
[@inline] const error_COUNCIL_ACTION_EXECUTED                                                = 19n;
[@inline] const error_COUNCIL_ACTION_EXPIRED                                                 = 20n;
[@inline] const error_SENDER_ALREADY_SIGNED_THE_ACTION                                       = 21n;
[@inline] const error_COUNCIL_ACTION_PARAMETER_NOT_FOUND                                     = 22n;

[@inline] const error_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_NOT_FOUND                             = 23n;
[@inline] const error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                    = 24n;
[@inline] const error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                 = 25n;
[@inline] const error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND                 = 26n;
[@inline] const error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND            = 27n;
[@inline] const error_REQUEST_TOKENS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND             = 28n;
[@inline] const error_REQUEST_MINT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND               = 29n;
[@inline] const error_DROP_FINANCIAL_REQUEST_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND     = 30n;
[@inline] const error_SET_CONTRACT_BAKER_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND         = 31n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND                         = 32n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND                          = 33n;

// DELEGATION

[@inline] const error_ONLY_WHITELISTED_ADDRESSES_ALLOWED                    = 2n;
[@inline] const error_ONLY_SELF_ALLOWED                                     = 4n;
[@inline] const error_ONLY_SELF_OR_DELEGATE_ALLOWED                         = 5n;
[@inline] const error_ONLY_DOORMAN_CONTRACT_ALLOWED                         = 6n;
[@inline] const error_ONLY_GOVERNANCE_CONTRACT_ALLOWED                      = 7n;
[@inline] const error_ONLY_SATELLITE_ALLOWED                                = 8n;
[@inline] const error_SATELLITE_NOT_ALLOWED                                 = 9n;

[@inline] const error_SATELLITE_NOT_FOUND                                   = 11n;
[@inline] const error_SATELLITE_ALREADY_EXISTS                              = 12n;
[@inline] const error_MAXIMUM_AMOUNT_OF_SATELLITES_EXCEEDED                 = 13n;
[@inline] const error_MORE_SMVK_NEEDED_TO_REGISTER                          = 14n;
[@inline] const error_DELEGATE_NOT_FOUND                                    = 15n;
[@inline] const error_ALREADY_DELEGATED_SATELLITE                           = 16n;
[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                            = 17n;
[@inline] const error_GOVERNANCE_CONTRACT_NOT_FOUND                         = 18n;
[@inline] const error_SATELLITE_TREASURY_CONTRACT_NOT_FOUND                 = 19n;
[@inline] const error_STAKE_EXCEEDS_SATELLITE_DELEGATED_AMOUNT              = 20n;
[@inline] const error_SATELLITE_FEE_EXCEEDS_TOTAL_REWARD                    = 21n;


[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_NOT_FOUND            = 23n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_NOT_FOUND        = 24n;

[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IS_PAUSED            = 25n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IS_PAUSED        = 26n;
[@inline] const error_REGISTER_AS_SATELLITE_ENTRYPOINT_IS_PAUSED            = 27n;
[@inline] const error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IS_PAUSED          = 28n;
[@inline] const error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IS_PAUSED          = 29n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_IS_PAUSED                = 30n;

[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND    = 31n;

[@inline] const error_VIEW_GET_STAKED_BALANCE_NOT_FOUND                     = 32n;

[@inline] const error_REWARDS_RECORD_NOT_FOUND                              = 33n;
[@inline] const error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND          = 34n;
[@inline] const error_CONFIG_VALUE_TOO_HIGH                                 = 35n;
[@inline] const error_CONFIG_VALUE_TOO_LOW                                  = 36n;

// DOORMAN

[@inline] const error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED                                         = 3n;
[@inline] const error_ONLY_DELEGATION_CONTRACT_ALLOWED                                        = 4n;
[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                           = 6n;
[@inline] const error_FARM_FACTORY_CONTRACT_NOT_FOUND                                         = 7n;
[@inline] const error_FARM_TREASURY_CONTRACT_NOT_FOUND                                        = 8n;

[@inline] const error_STAKE_ENTRYPOINT_IS_PAUSED                                              = 9n;
[@inline] const error_UNSTAKE_ENTRYPOINT_IS_PAUSED                                            = 10n;
[@inline] const error_COMPOUND_ENTRYPOINT_IS_PAUSED                                           = 11n;
[@inline] const error_ON_STAKE_CHANGE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND             = 12n;
[@inline] const error_ON_SATELLITE_REWARD_PAID_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND    = 13n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND                         = 14n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                      = 15n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND         = 16n;

[@inline] const error_VIEW_GET_USER_REWARD_OPT_NOT_FOUND                                      = 17n;
[@inline] const error_VIEW_GET_TOTAL_SUPPLY_NOT_FOUND                                         = 18n;
[@inline] const error_VIEW_GET_TOTAL_AND_MAXIMUM_SUPPLY_NOT_FOUND                             = 19n;
[@inline] const error_VIEW_CHECK_FARM_EXISTS_NOT_FOUND                                        = 20n;
[@inline] const error_REFERENCE_SATELLITE_NOT_FOUND                                           = 21n;
[@inline] const error_STAKE_RECORD_NOT_FOUND                                                  = 22n;
[@inline] const error_FARM_NOT_FOUND                                                          = 23n;
[@inline] const error_NOT_ENOUGH_BALANCE                                                      = 24n;

[@inline] const error_MINIMUM_LIMIT_IS_0_01_MVK                                               = 25n;
[@inline] const error_PROVIDED_AMOUNT_TOO_LOW                                                 = 26n;
[@inline] const error_PROVIDED_AMOUNT_TOO_HIGH                                                = 27n;

// EMERGENCY GOVERNANCE

[@inline] const error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED                     = 3n;
[@inline] const error_ONLY_DOORMAN_CONTRACT_ALLOWED                       = 4n;


[@inline] const error_VIEW_GET_STAKED_BALANCE_NOT_FOUND                   = 7n;
[@inline] const error_VIEW_GET_TOTAL_STAKED_SUPPLY_NOT_FOUND              = 8n;

[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                          = 9n;
[@inline] const error_BREAK_GLASS_CONTRACT_NOT_FOUND                      = 10n;
[@inline] const error_TAX_TREASURY_CONTRACT_NOT_FOUND                     = 11n;
[@inline] const error_BREAK_GLASS_ENTRYPOINT_NOT_FOUND                    = 12n;

[@inline] const error_CONFIG_VALUE_TOO_HIGH                               = 13n;
[@inline] const error_CONFIG_VALUE_TOO_LOW                                = 14n;

[@inline] const error_EMERGENCY_GOVERNANCE_ALREADY_IN_THE_PROCESS         = 15n;
[@inline] const error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS             = 16n;
[@inline] const error_EMERGENCY_GOVERNANCE_NOT_FOUND                      = 17n;
[@inline] const error_EMERGENCY_GOVERNANCE_DROPPED                        = 18n;
[@inline] const error_EMERGENCY_GOVERNANCE_EXECUTED                       = 19n;
[@inline] const error_ONLY_PROPOSER_CAN_DROP_EMERGENCY_GOVERNANCE         = 20n;
[@inline] const error_SENDER_ALREADY_VOTED                                = 21n;
[@inline] const error_MORE_SMVK_NEEDED_TO_TRIGGER_EMERGENCY_GOVERNANCE    = 22n;
[@inline] const error_MORE_SMVK_NEEDED_TO_VOTE                            = 23n;
[@inline] const error_TEZ_FEE_UNPAID                                      = 24n;

// FARM

[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                                          = 3n;
[@inline] const error_ONLY_ADMIN_OR_FACTORY_CONTRACT_ALLOWED                                 = 4n;
[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                                             = 5n;

[@inline] const error_CONFIG_VALUE_ERROR                                                     = 6n;
[@inline] const error_CANNOT_LOWER_REWARD_PER_BLOCK                                          = 6n;
[@inline] const error_BLOCKS_PER_MINUTE_VALUE_ERROR                                          = 6n;

[@inline] const error_FARM_ALREADY_OPEN                                                      = 6n;
[@inline] const error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION                             = 6n;
[@inline] const error_DEPOSITOR_NOT_FOUND                                                    = 6n;
[@inline] const error_WITHDRAWN_AMOUNT_TOO_HIGH                                              = 6n;
[@inline] const error_NOTHING_TO_CLAIM                                                       = 6n;

[@inline] const error_FARM_NOT_INITIATED                                                     = 7n;
[@inline] const error_FARM_IS_CLOSED                                                         = 8n;
[@inline] const error_DEPOSIT_ENTRYPOINT_IS_PAUSED                                           = 9n;
[@inline] const error_WITHDRAW_ENTRYPOINT_IS_PAUSED                                          = 10n;
[@inline] const error_CLAIM_ENTRYPOINT_IS_PAUSED                                             = 11n;
[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND_IN_GENERAL_CONTRACTS                        = 12n;
[@inline] const error_FARM_CLAIM_ENTRYPOINT_NOT_FOUND_IN_DOORMAN_CONTRACT                    = 13n;
[@inline] const error_DEPOSITOR_NOT_FOUND                                                    = 14n;
[@inline] const error_DEPOSITOR_REWARD_DEBT_IS_HIGHER_THAN_ACCUMULATED_MVK_PER_SHARE         = 15n;
[@inline] const error_DEPOSITOR_REWARD_IS_HIGHER_THAN_TOTAL_UNPAID_REWARD                    = 16n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_LP_FA12_CONTRACT_NOT_FOUND                      = 17n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_LP_FA2_CONTRACT_NOT_FOUND                       = 18n;

// FARM FACTORY

[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                                          = 3n;
[@inline] const error_COUNCIL_CONTRACT_NOT_WHITELISTED                                       = 5n;

[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                                             = 6n;
[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                                             = 7n;
[@inline] const error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION                             = 8n;
[@inline] const error_FARM_ALREADY_TRACKED                                                   = 9n;
[@inline] const error_FARM_NOT_TRACKED                                                       = 10n;

[@inline] const error_CREATE_FARM_ENTRYPOINT_IS_PAUSED                                       = 11n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IS_PAUSED                                        = 12n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IS_PAUSED                                      = 13n;

// GOVERNANCE

[@inline] const error_ONLY_SELF_ALLOWED                                                       = 1n;
[@inline] const error_ONLY_ADMIN_OR_SELF_ALLOWED                                              = 2n;
[@inline] const error_ONLY_DOORMAN_CONTRACT_ALLOWED                                           = 3n;
[@inline] const error_ONLY_DELEGATION_CONTRACT_ALLOWED                                        = 4n;
[@inline] const error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED                                         = 5n;
[@inline] const error_ONLY_COUNCIL_CONTRACT_ALLOWED                                           = 6n;
[@inline] const error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED                              = 7n;
[@inline] const error_ONLY_BREAK_GLASS_CONTRACT_CONTRACT_ALLOWED                              = 8n;
[@inline] const error_ONLY_BREAK_GLASS_CONTRACT_OR_DEVELOPERS_OR_PROXY_CONTRACT_ALLOWED       = 9n;


[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                                              = 12n;
[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                           = 13n;
[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                                              = 14n;
[@inline] const error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                 = 15n;
[@inline] const error_BREAK_GLASS_CONTRACT_NOT_FOUND                                          = 16n;
[@inline] const error_TAX_TREASURY_CONTRACT_NOT_FOUND                                         = 17n;
[@inline] const error_PAYMENT_TREASURY_CONTRACT_NOT_FOUND                                     = 18n;

// temp                 
[@inline] const error_HIGHEST_VOTED_PROPOSAL_NOT_FOUND                                        = 19n;
[@inline] const error_TIMELOCK_PROPOSAL_NOT_FOUND                                             = 20n;
[@inline] const error_PROPOSAL_NOT_FOUND                                                      = 21n;
[@inline] const error_PROPOSAL_LOCKED                                                         = 22n;
[@inline] const error_PROPOSAL_CANNOT_BE_EXECUTED_NOW                                         = 23n;
[@inline] const error_PROPOSAL_DROPPED                                                        = 24n;
[@inline] const error_PROPOSAL_EXECUTED                                                       = 25n;
[@inline] const error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE                                         = 26n;
[@inline] const error_PROPOSAL_UNSUCCESSFUL                                                   = 27n;
[@inline] const error_PROPOSAL_PAYMENTS_PROCESSED                                             = 28n;
[@inline] const error_PROPOSAL_NOT_LOCKED                                                     = 29n;
[@inline] const error_NO_PROPOSAL_TO_VOTE_FOR                                                 = 30n;
[@inline] const error_NO_PROPOSAL_TO_EXECUTE                                                  = 31n;
[@inline] const error_VOTE_NOT_FOUND                                                          = 32n;
[@inline] const error_VOTE_ALREADY_RECORDED                                                   = 33n;
[@inline] const error_ONLY_PROPOSER_ALLOWED                                                   = 34n;
[@inline] const error_CURRENT_ROUND_NOT_FINISHED                                              = 35n;
[@inline] const error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND                                   = 36n;
[@inline] const error_ONLY_ACCESSIBLE_DURING_VOTING_ROUND                                     = 37n;
[@inline] const error_ONLY_SATELLITE_ALLOWED                                                  = 38n;
[@inline] const error_SNAPSHOT_NOT_TAKEN                                                      = 39n;
[@inline] const error_MORE_SMVK_NEEDED_TO_PROPOSE                                             = 40n;
[@inline] const error_MAX_PROPOSAL_REACHED                                                    = 41n;

[@inline] const error_TEZ_FEE_UNPAID                                                          = 42n;

[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                                          = 43n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND                                     = 44n;
[@inline] const error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_NOT_FOUND                          = 45n;

[@inline] const error_CONFIG_VALUE_TOO_HIGH                                                   = 46n;
[@inline] const error_CONFIG_VALUE_TOO_LOW                                                    = 47n;

[@inline] const error_TRANSFER_ENTRYPOINT_NOT_FOUND                                           = 48n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_NOT_FOUND                              = 49n;
[@inline] const error_START_PROPOSAL_ROUND_ENTRYPOINT_NOT_FOUND                               = 50n;
[@inline] const error_EXECUTE_PROPOSAL_ENTRYPOINT_NOT_FOUND                                   = 51n;
[@inline] const error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_NOT_FOUND                           = 52n;
[@inline] const error_ADD_UPDATE_PAYMENT_DATA_ENTRYPOINT_NOT_FOUND                            = 53n;
[@inline] const error_CALL_GOVERNANCE_LAMBDA_PROXY_ENTRYPOINT_NOT_FOUND                       = 54n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_NOT_FOUND                                  = 55n;

[@inline] const error_WRONG_TOKEN_TYPE_PROVIDED                                               = 56n;

[@inline] const error_VIEW_GET_TOTAL_SUPPLY_NOT_FOUND                                         = 57n;
[@inline] const error_VIEW_GET_STAKED_TOTAL_SUPPLY_NOT_FOUND                                  = 58n;
[@inline] const error_VIEW_GET_GLASS_BROKEN_NOT_FOUND                                         = 59n;
[@inline] const error_GLASS_NOT_BROKEN                                                        = 60n;
[@inline] const error_CALCULATION_ERROR_WHEN_CHANGING_A_VOTE                                  = 61n;
[@inline] const error_VIEW_GET_ACTIVE_SATELLITES_NOT_FOUND                                    = 62n;
[@inline] const error_VIEW_GET_SATELLITE_OPT_NOT_FOUND                                        = 63n;
[@inline] const error_TRANSFER_ENTRYPOINT_NOT_FOUND                                           = 64n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_NOT_FOUND                              = 65n;
[@inline] const error_SET_BAKER_ENTRYPOINT_NOT_FOUND                                          = 66n;

[@inline] const error_FINANCIAL_REQUEST_SNAPSHOT_NOT_FOUND                                    = 67n;
[@inline] const error_FINANCIAL_REQUEST_NOT_FOUND                                             = 68n;
[@inline] const error_FINANCIAL_REQUEST_EXECUTED                                              = 69n;
[@inline] const error_FINANCIAL_REQUEST_EXPIRED                                               = 70n;
[@inline] const error_FINANCIAL_REQUEST_DROPPED                                               = 71n;
[@inline] const error_SATELLITE_NOT_FOUND_IN_FINANCIAL_REQUEST_SNAPSHOT                       = 72n;

// GOVERNANCE PROXY

[@inline] const error_ONLY_SELF_ALLOWED                                                           = 1n;
[@inline] const error_ONLY_ADMIN_OR_SELF_ALLOWED                                                  = 2n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ADDRESS_ALLOWED                            = 3n;
[@inline] const error_ONLY_ADMIN_OR_SELF_OR_GOVERNANCE_ADDRESS_ALLOWED                            = 4n;

[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                               = 6n;
[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                                                  = 7n;
[@inline] const error_COUNCIL_CONTRACT_NOT_FOUND                                                  = 8n;
[@inline] const error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND                                     = 9n;
[@inline] const error_BREAK_GLASS_CONTRACT_NOT_FOUND                                              = 10n;
[@inline] const error_FARM_FACTORY_CONTRACT_NOT_FOUND                                             = 11n;
[@inline] const error_TREASURY_FACTORY_CONTRACT_NOT_FOUND                                         = 12n;

[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                                              = 13n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND                                         = 14n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND                                             = 15n;
[@inline] const error_SET_PRODUCT_LAMBDA_ENTRYPOINT_NOT_FOUND                                     = 16n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND                                        = 17n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND                             = 18n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND                               = 19n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND                       = 20n;

[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND                   = 21n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND                   = 22n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND         = 23n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND                      = 24n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                         = 25n;
[@inline] const error_UPDATE_CONFIG_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND                  = 26n;
[@inline] const error_UPDATE_MIN_MVK_AMOUNT_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND              = 27n;
[@inline] const error_UPDATE_WHITELIST_DEVELOPERS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND     = 28n;
[@inline] const error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                   = 29n;
[@inline] const error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                    = 30n;
[@inline] const error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND                  = 31n;
[@inline] const error_INIT_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                             = 32n;
[@inline] const error_CLOSE_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND                            = 33n;
[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND           = 34n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND            = 35n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND          = 36n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                          = 37n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND             = 38n;
[@inline] const error_UPDATE_INFLATION_RATE_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND             = 39n;
[@inline] const error_TRIGGER_INFLATION_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND                 = 40n;

[@inline] const error_GOVERNANCE_PROPOSAL_RECORD_NOT_FOUND                                        = 41n;
[@inline] const error_GET_PROPOSAL_RECORD_VIEW_NOT_FOUND                                          = 42n;
[@inline] const error_GOVERNANCE_PROPOSAL_ALREADY_EXECUTED                                        = 43n;
[@inline] const error_GOVERNANCE_PROPOSAL_DROPPED                                                 = 44n;
[@inline] const error_GOVERNANCE_PROPOSAL_NO_DATA_TO_EXECUTE                                      = 45n;

[@inline] const error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA                                   = 47n;

// TOKEN SALE

[@inline] const error_ONLY_SELF_ALLOWED                                       = 1n;

[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                          = 3n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND                    = 4n;

[@inline] const error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ                  = 5n;
[@inline] const error_TOKEN_SALE_HAS_NOT_STARTED                              = 6n;
[@inline] const error_WHITELIST_SALE_HAS_NOT_STARTED                          = 7n;
[@inline] const error_USER_IS_NOT_WHITELISTED                                 = 8n;
[@inline] const error_MAX_AMOUNT_PER_WHITELIST_WALLET_EXCEEDED                = 9n;
[@inline] const error_MAX_AMOUNT_PER_WALLET_TOTAL_EXCEEDED                    = 10n;
[@inline] const error_WHITELIST_MAX_AMOUNT_CAP_REACHED                        = 11n;
[@inline] const error_OVERALL_MAX_AMOUNT_CAP_REACHED                          = 12n;

[@inline] const error_TREASURY_CONTRACT_NOT_FOUND                             = 13n;

// TREASURY

[@inline] const error_ONLY_ADMIN_OR_FACTORY_CONTRACT_ALLOWED                                 = 3n;
[@inline] const error_ONLY_WHITELIST_ADDRESSES_ALLOWED                                      = 3n;

[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                      = 4n;

[@inline] const error_TRANSFER_ENTRYPOINT_IS_PAUSED                                          = 5n;
[@inline] const error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IS_PAUSED                             = 6n;
[@inline] const error_MINT_ENTRYPOINT_NOT_FOUND                                              = 7n;
[@inline] const error_ON_STAKE_CHANGE_ENTRYPOINT_NOT_FOUND_IN_DELEGATION_CONTRACT            = 8n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND                         = 9n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND                          = 10n;

// TREASURY FACTORY


[@inline] const error_DELEGATION_CONTRACT_NOT_FOUND                                          = 3n;

[@inline] const error_TREASURY_ALREADY_TRACKED                                               = 3n;
[@inline] const error_TREASURY_NOT_TRACKED                                                   = 3n;

[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IS_PAUSED                                   = 4n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IS_PAUSED                                    = 5n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_NOT_FOUND                                  = 6n;

[@inline] const error_VIEW_GET_GOVERNANCE_PROXY_ADDRESS_NOT_FOUND                            = 7n;

// VESTING

[@inline] const error_ONLY_WHITELISTED_ADDRESSES_ALLOWED                                     = 2n;

[@inline] const error_VESTING_IN_MONTHS_TOO_SHORT                                            = 4n;
[@inline] const error_CLIFF_PERIOD_TOO_LONG                                                  = 5n;
[@inline] const error_VESTEE_ALREADY_EXISTS                                                  = 6n;
[@inline] const error_VESTEE_NOT_FOUND                                                       = 7n;
[@inline] const error_VESTEE_LOCKED                                                          = 8n;
[@inline] const error_NOTHING_TO_CLAIM                                                       = 9n;
[@inline] const error_CANNOT_CLAIM_NOW                                                       = 10n;

[@inline] const error_MINT_ENTRYPOINT_NOT_FOUND                                              = 11n;
[@inline] const error_VESTEE_NOT_FOUND                                                       = 12n;
