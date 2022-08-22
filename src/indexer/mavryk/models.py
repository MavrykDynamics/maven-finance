from tortoise import Model, fields
from enum import IntEnum

###
# Inherited classes
###
class ContractLambda():
    id                                      = fields.BigIntField(pk=True)
    last_updated_at                         = fields.DatetimeField(null=True, auto_now=True)
    lambda_name                             = fields.CharField(max_length=128, default="")
    lambda_bytes                            = fields.TextField(default="")

class LinkedContract():
    id                                      = fields.BigIntField(pk=True)
    contract_name                           = fields.CharField(max_length=36, default="")
    contract_address                        = fields.CharField(max_length=36, default="")

###
# Tezos Ecosystem
###
class DexType(IntEnum):
    ADD_LIQUIDITY     = 0
    REMOVE_LIQUIDITY  = 1
    XTZ_TO_TOKEN      = 2
    TOKEN_TO_XTZ      = 3
    TOKEN_TO_TOKEN    = 4

class LiquidityBaking(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    token_pool                              = fields.BigIntField(default=0)
    xtz_pool                                = fields.BigIntField(default=0)
    lqt_total                               = fields.BigIntField(default=0)
    token_address                           = fields.CharField(max_length=36, default="")
    lqt_address                             = fields.CharField(max_length=36, default="")
    xtz_decimals                            = fields.SmallIntField(default=6)
    token_decimals                          = fields.SmallIntField(default=8)

    class Meta:
        table = 'liquidity_baking'

class LiquidityBakingHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    liquidity_baking                        = fields.ForeignKeyField('models.LiquidityBaking', related_name='history_data')
    timestamp                               = fields.DatetimeField()
    type                                    = fields.IntEnumField(enum_type=DexType)
    token_pool                              = fields.BigIntField(default=0)
    xtz_pool                                = fields.BigIntField(default=0)
    lqt_total                               = fields.BigIntField(default=0)
    xtz_token_price                         = fields.FloatField(default=0.0)
    token_xtz_price                         = fields.FloatField(default=0.0)

    class Meta:
        table = 'liquidity_baking_history_data'

###
# Mavryk Contracts
###
class StakeType(IntEnum):
    STAKE               = 0
    UNSTAKE             = 1
    FARM_CLAIM          = 2
    COMPOUND            = 3
    SATELLITE_REWARD    = 4

class ActionStatus(IntEnum):
    PENDING             = 0
    FLUSHED             = 1
    EXECUTED            = 2

class SatelliteStatus(IntEnum):
    ACTIVE              = 0
    SUSPENDED           = 1
    BANNED              = 2

class GovernanceRoundType(IntEnum):
    PROPOSAL            = 0
    VOTING              = 1
    TIMELOCK            = 2

class GovernanceRecordStatus(IntEnum):
    ACTIVE              = 0
    DROPPED             = 1

class GovernanceVoteType(IntEnum):
    NAY                 = 0
    YAY                 = 1
    PASS                = 2

class TokenType(IntEnum):
    XTZ                 = 0
    FA12                = 1
    FA2                 = 2
    OTHER               = 3

class WhitelistDeveloper(Model):
    id                                      = fields.BigIntField(pk=True)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='whitelist_developers')
    developer                               = fields.ForeignKeyField('models.MavrykUser', related_name='whitelist_developers')

    class Meta:
        table = 'whitelist_developer'

class Token(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    name                                    = fields.CharField(max_length=36, default="")
    token_id                                = fields.SmallIntField(default=0)
    type                                    = fields.IntEnumField(enum_type=TokenType, default=TokenType.OTHER)
    decimals                                = fields.SmallIntField(default=0)

    class Meta:
        table = 'token'

class MVKToken(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='mvk_token')
    maximum_supply                          = fields.FloatField(default=0)
    total_supply                            = fields.FloatField(default=0)
    inflation_rate                          = fields.SmallIntField(default=0)
    next_inflation_timestamp                = fields.DatetimeField(null=True)

    class Meta:
        table = 'mvk_token'

class GovernanceProxy(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_proxies')
    
    class Meta:
        table = 'governance_proxy'

# class USDMToken(Model):
#     address                                 = fields.CharField(pk=True, max_length=36)
#     admin                                   = fields.CharField(max_length=36)

#     class Meta:
#         table = 'usdm_token'

class Doorman(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='doormans')
    min_mvk_amount                          = fields.FloatField(default=0)
    unclaimed_rewards                       = fields.FloatField(default=0)
    accumulated_fees_per_share              = fields.FloatField(default=0)
    stake_paused                            = fields.BooleanField(default=False)
    unstake_paused                          = fields.BooleanField(default=False)
    compound_paused                         = fields.BooleanField(default=False)
    farm_claimed_paused                     = fields.BooleanField(default=False)

    class Meta:
        table = 'doorman'

class Farm(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36, default='')
    governance                              = fields.ForeignKeyField('models.Governance', related_name='farms', null=True)
    farm_factory                            = fields.ForeignKeyField('models.FarmFactory', related_name='farms', null=True)
    lp_token                                = fields.ForeignKeyField('models.Token', related_name='farm_lp_tokens', null=True)
    creation_timestamp                      = fields.DatetimeField(null=True)
    name                                    = fields.TextField(default='')
    force_rewards_from_transfer             = fields.BooleanField(default=False)
    infinite                                = fields.BooleanField(default=False)
    lp_token_balance                        = fields.BigIntField(default=0)
    total_blocks                            = fields.BigIntField(default=0)
    current_reward_per_block                = fields.FloatField(default=0)
    total_rewards                           = fields.FloatField(default=0)
    deposit_paused                          = fields.BooleanField(default=False)
    withdraw_paused                         = fields.BooleanField(default=False)
    claim_paused                            = fields.BooleanField(default=False)
    last_block_update                       = fields.BigIntField(default=0)
    open                                    = fields.BooleanField(default=False)
    init                                    = fields.BooleanField(default=False)
    init_block                              = fields.BigIntField(default=0)
    accumulated_rewards_per_share           = fields.FloatField(default=0)
    unpaid_rewards                          = fields.FloatField(default=0)
    paid_rewards                            = fields.FloatField(default=0)
    min_block_time_snapshot                 = fields.SmallIntField(default=0)

    class Meta:
        table = 'farm'

class FarmFactory(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='farm_factories')
    farm_name_max_length                    = fields.SmallIntField(default=0)
    create_farm_paused                      = fields.BooleanField(default=False)
    track_farm_paused                       = fields.BooleanField(default=False)
    untrack_farm_paused                     = fields.BooleanField(default=False)

    class Meta:
        table = 'farm_factory'

class Delegation(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='delegations')
    minimum_smvk_balance                    = fields.FloatField(default=0)
    delegation_ratio                        = fields.SmallIntField(default=0)
    max_satellites                          = fields.SmallIntField(default=0)
    satellite_name_max_length               = fields.SmallIntField(default=0)
    satellite_description_max_length        = fields.SmallIntField(default=0)
    satellite_image_max_length              = fields.SmallIntField(default=0)
    satellite_website_max_length            = fields.SmallIntField(default=0)
    delegate_to_satellite_paused            = fields.BooleanField(default=False)
    undelegate_from_satellite_paused        = fields.BooleanField(default=False)
    register_as_satellite_paused            = fields.BooleanField(default=False)
    unregister_as_satellite_paused          = fields.BooleanField(default=False)
    update_satellite_record_paused          = fields.BooleanField(default=False)
    distribute_reward_paused                = fields.BooleanField(default=False)

    class Meta:
        table = 'delegation'

class Council(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='councils')
    threshold                               = fields.BigIntField(default=0)
    action_expiry_days                      = fields.BigIntField(default=0)
    action_counter                          = fields.BigIntField(default=0)
    council_member_name_max_length          = fields.SmallIntField(default=0)
    council_member_website_max_length       = fields.SmallIntField(default=0)
    council_member_image_max_length         = fields.SmallIntField(default=0)
    request_purpose_max_length              = fields.SmallIntField(default=0)
    request_token_name_max_length           = fields.SmallIntField(default=0)

    class Meta:
        table = 'council'

class Vesting(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='vestings')
    total_vested_amount                     = fields.BigIntField(default=0)

    class Meta:
        table = 'vesting'

class EmergencyGovernance(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='emergency_governances')
    decimals                                = fields.SmallIntField(default=0)
    min_smvk_required_to_trigger            = fields.FloatField(default=0)
    min_smvk_required_to_vote               = fields.FloatField(default=0)
    proposal_desc_max_length                = fields.SmallIntField(default=0)
    proposal_title_max_length               = fields.SmallIntField(default=0)
    required_fee_mutez                      = fields.BigIntField(default=0)
    smvk_percentage_required                = fields.SmallIntField(default=0)
    vote_expiry_days                        = fields.SmallIntField(default=0)
    current_emergency_record_id             = fields.BigIntField(default=0)
    next_emergency_record_id                = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance'

class BreakGlass(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='break_glasses')
    threshold                               = fields.SmallIntField(default=0)
    action_expiry_days                      = fields.SmallIntField(default=0)
    council_member_name_max_length          = fields.SmallIntField(default=0)
    council_member_website_max_length       = fields.SmallIntField(default=0)
    council_member_image_max_length         = fields.SmallIntField(default=0)
    glass_broken                            = fields.BooleanField(default=False)
    action_counter                          = fields.BigIntField(default=0)

    class Meta:
        table = 'break_glass'

class Governance(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    active                                  = fields.BooleanField(default=False)
    governance_proxy_address                = fields.CharField(max_length=36, default="")
    success_reward                          = fields.FloatField(default=0)
    cycle_voters_reward                     = fields.FloatField(default=0)
    proposal_round_vote_percentage          = fields.SmallIntField(default=0)
    proposal_round_vote_required            = fields.BigIntField(default=0)
    min_quorum_percentage                   = fields.SmallIntField(default=0)
    min_yay_vote_percentage                 = fields.SmallIntField(default=0)
    proposal_submission_fee_mutez           = fields.BigIntField(default=0)
    max_proposal_per_satellite              = fields.SmallIntField(default=0)
    blocks_per_proposal_round               = fields.BigIntField(default=0)
    blocks_per_voting_round                 = fields.BigIntField(default=0)
    blocks_per_timelock_round               = fields.BigIntField(default=0)
    proposal_metadata_title_max_length      = fields.BigIntField(default=0)
    proposal_title_max_length               = fields.BigIntField(default=0)
    proposal_description_max_length         = fields.BigIntField(default=0)
    proposal_invoice_max_length             = fields.BigIntField(default=0)
    proposal_source_code_max_length         = fields.BigIntField(default=0)
    current_round                           = fields.IntEnumField(enum_type=GovernanceRoundType, default=GovernanceRoundType.PROPOSAL)
    current_blocks_per_proposal_round       = fields.BigIntField(default=0)
    current_blocks_per_voting_round         = fields.BigIntField(default=0)
    current_blocks_per_timelock_round       = fields.BigIntField(default=0)
    current_round_start_level               = fields.BigIntField(default=0)
    current_round_end_level                 = fields.BigIntField(default=0)
    current_cycle_end_level                 = fields.BigIntField(default=0)
    current_cycle_total_voters_reward       = fields.FloatField(default=0)
    next_proposal_id                        = fields.BigIntField(default=0)
    cycle_id                                = fields.BigIntField(default=0)
    cycle_highest_voted_proposal_id         = fields.BigIntField(default=0)
    timelock_proposal_id                    = fields.BigIntField(default=0)

    class Meta:
        table = 'governance'

class GovernanceFinancial(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_financials')
    fin_req_approval_percentage             = fields.SmallIntField(default=0)
    fin_req_duration_in_days                = fields.SmallIntField(default=0)
    fin_req_counter                         = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_financial'

class GovernanceSatellite(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36, default='')
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_satellites')
    gov_sat_approval_percentage             = fields.SmallIntField(default=0)
    gov_sat_duration_in_days                = fields.SmallIntField(default=0)
    gov_purpose_max_length                  = fields.SmallIntField(default=0)
    max_actions_per_satellite               = fields.SmallIntField(default=0)
    governance_satellite_counter            = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite'

class Aggregator(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36, default='')
    governance                              = fields.ForeignKeyField('models.Governance', related_name='aggregators', null=True)
    aggregator_factory                      = fields.ForeignKeyField('models.AggregatorFactory', related_name='aggregators', null=True)
    deviation_trigger_oracle                = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_deviation_trigger_oracles', index=True, null=True)
    maintainer                              = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_maintainer', index=True, null=True)
    token_0_symbol                          = fields.CharField(max_length=32, default='')
    token_1_symbol                          = fields.CharField(max_length=32, default='')
    deviation_trigger_round_price           = fields.BigIntField(default=0)
    creation_timestamp                      = fields.DatetimeField(null=True)
    name                                    = fields.TextField(default='')
    decimals                                = fields.SmallIntField(default=0)
    number_blocks_delay                     = fields.BigIntField(default=0)
    deviation_trigger_ban_duration          = fields.BigIntField(default=0)
    request_rate_deviation_deposit_fee      = fields.FloatField(default=0.0)
    per_thousand_deviation_trigger          = fields.BigIntField(default=0)
    percent_oracle_threshold                = fields.SmallIntField(default=0)
    deviation_reward_amount_xtz             = fields.FloatField(default=0)
    deviation_reward_amount_smvk            = fields.FloatField(default=0)
    reward_amount_smvk                      = fields.FloatField(default=0.0)
    reward_amount_xtz                       = fields.BigIntField(default=0)
    request_rate_update_paused              = fields.BooleanField(default=False)
    request_rate_update_deviation_paused    = fields.BooleanField(default=False)
    set_observation_commit_paused           = fields.BooleanField(default=False)
    set_observation_reveal_paused           = fields.BooleanField(default=False)
    withdraw_reward_xtz_paused              = fields.BooleanField(default=False)
    withdraw_reward_smvk_paused             = fields.BooleanField(default=False)
    round                                   = fields.BigIntField(default=0)
    round_start_timestamp                   = fields.DatetimeField(null=True)
    switch_block                            = fields.BigIntField(default=0)
    last_completed_round                    = fields.BigIntField(default=0)
    last_completed_round_price              = fields.BigIntField(default=0)
    last_completed_round_pct_oracle_response= fields.SmallIntField(default=0)
    last_completed_round_price_timestamp    = fields.DatetimeField(null=True)

    class Meta:
        table = 'aggregator'

class AggregatorFactory(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='aggregator_factories')
    create_aggregator_paused                = fields.BooleanField(default=False)
    track_aggregator_paused                 = fields.BooleanField(default=False)
    untrack_aggregator_paused               = fields.BooleanField(default=False)
    distribute_reward_xtz_paused            = fields.BooleanField(default=False)
    distribute_reward_smvk_paused           = fields.BooleanField(default=False)

    class Meta:
        table = 'aggregator_factory'

# class Vault(Model):
#     address                                 = fields.CharField(pk=True, max_length=36)
#     admin                                   = fields.CharField(max_length=36)
#     collateral                              = fields.IntEnumField(enum_type=TokenType, default=TokenType.OTHER)
#     collateral_token_address                = fields.CharField(max_length=36)

#     class Meta:
#         table = 'vault'

# class USDMTokenController(Model):
#     address                                 = fields.CharField(pk=True, max_length=36)
#     admin                                   = fields.CharField(max_length=36)
#     collateral_ratio                        = fields.SmallIntField(default=0)
#     liquidation_ratio                       = fields.SmallIntField(default=0)
#     liquidation_fee                         = fields.FloatField(default=0.0)
#     admin_liquidation_fee                   = fields.FloatField(default=0.0)
#     minimum_loan_fee                        = fields.FloatField(default=0.0)
#     annual_service_loan_fee                 = fields.FloatField(default=0.0)
#     daily_service_loan_fee                  = fields.FloatField(default=0.0)
#     decimals                                = fields.SmallIntField(default=0)
#     vault_counter                           = fields.BigIntField(default=0)

#     class Meta:
#         table = 'usdm_token_controller'

# class CFMM(Model):
#     address                                 = fields.CharField(pk=True, max_length=36)
#     admin                                   = fields.CharField(max_length=36)
#     cash_token_address                      = fields.CharField(max_length=36, default="")
#     cash_token_id                           = fields.SmallIntField(default=0)
#     cash_pool                               = fields.FloatField(default=0.0)
#     lp_token_address                        = fields.CharField(max_length=36, default="")
#     lp_tokens_total                         = fields.FloatField(default=0.0)
#     pending_pool_updates                    = fields.BigIntField(default=0)
#     token_name                              = fields.CharField(max_length=36, default="")
#     token_address                           = fields.CharField(max_length=36, default="")
#     token_id                                = fields.SmallIntField(default=0.0)
#     token_pool                              = fields.FloatField(default=0.0)
#     last_oracle_update                      = fields.BigIntField(default=0)
#     consumer_entrypoint                     = fields.CharField(max_length=36, default="")

#     class Meta:
#         table = 'cfmm'

class MavrykUser(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    mvk_balance                             = fields.FloatField(default=0)
    smvk_balance                            = fields.FloatField(default=0)

    class Meta:
        table = 'mavryk_user'

class Treasury(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36, default="")
    governance                              = fields.ForeignKeyField('models.Governance', related_name='treasuries', null=True)
    treasury_factory                        = fields.ForeignKeyField('models.TreasuryFactory', related_name='treasuries', null=True)
    creation_timestamp                      = fields.DatetimeField(null=True)
    name                                    = fields.TextField(default='')
    transfer_paused                         = fields.BooleanField(default=False)
    mint_mvk_and_transfer_paused            = fields.BooleanField(default=False)
    stake_mvk_paused                        = fields.BooleanField(default=False)
    unstake_mvk_paused                      = fields.BooleanField(default=False)

    class Meta:
        table = 'treasury'

class TreasuryFactory(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='treasury_factories')
    treasury_name_max_length                = fields.SmallIntField(default=0)
    create_treasury_paused                  = fields.BooleanField(default=False)
    track_treasury_paused                   = fields.BooleanField(default=False)
    untrack_treasury_paused                 = fields.BooleanField(default=False)

    class Meta:
        table = 'treasury_factory'

class TokenSale(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='token_sales')
    vesting_period_duration_sec             = fields.BigIntField(default=0)
    whitelist_start_timestamp               = fields.DatetimeField(null=True)
    whitelist_end_timestamp                 = fields.DatetimeField(null=True)
    end_timestamp                           = fields.DatetimeField(null=True)
    end_block_level                         = fields.BigIntField(default=0)
    started                                 = fields.BooleanField(default=False)
    ended                                   = fields.BooleanField(default=False)
    paused                                  = fields.BooleanField(default=False)

    class Meta:
        table = 'token_sale'

###
# Mavryk Contracts lambdas
###
class GovernanceProxyLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceProxy', related_name='lambdas')

    class Meta:
        table = 'governance_proxy_lambda'

class GovernanceProxyProxyLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceProxy', related_name='proxy_lambdas')

    class Meta:
        table = 'governance_proxy_proxy_lambda'

class DoormanLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Doorman', related_name='lambdas')

    class Meta:
        table = 'doorman_lambda'

class FarmLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Farm', related_name='lambdas')

    class Meta:
        table = 'farm_lambda'

class FarmFactoryLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.FarmFactory', related_name='lambdas')

    class Meta:
        table = 'farm_factory_lambda'

class FarmFactoryProductLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='product_lambdas')

    class Meta:
        table = 'farm_factory_product_lambda'

class DelegationLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Delegation', related_name='lambdas')

    class Meta:
        table = 'delegation_lambda'

class CouncilLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Council', related_name='lambdas')

    class Meta:
        table = 'council_lambda'

class VestingLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Vesting', related_name='lambdas')

    class Meta:
        table = 'vesting_lambda'

class EmergencyGovernanceLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.EmergencyGovernance', related_name='lambdas')

    class Meta:
        table = 'emergency_governance_lambda'

class BreakGlassLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.BreakGlass', related_name='lambdas')

    class Meta:
        table = 'break_glass_lambda'

class GovernanceLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Governance', related_name='lambdas')

    class Meta:
        table = 'governance_lambda'

class GovernanceFinancialLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceFinancial', related_name='lambdas')

    class Meta:
        table = 'governance_financial_lambda'

class GovernanceSatelliteLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceSatellite', related_name='lambdas')

    class Meta:
        table = 'governance_satellite_lambda'

class AggregatorLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Aggregator', related_name='lambdas')

    class Meta:
        table = 'aggregator_lambda'

class AggregatorFactoryLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='lambdas')

    class Meta:
        table = 'aggregator_factory_lambda'

class AggregatorFactoryProductLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='product_lambdas')

    class Meta:
        table = 'aggregator_factory_product_lambda'

class TreasuryLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Treasury', related_name='lambdas')

    class Meta:
        table = 'treasury_lambda'

class TreasuryFactoryLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.TreasuryFactory', related_name='lambdas')

    class Meta:
        table = 'treasury_factory_lambda'

class TreasuryFactoryProductLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.TreasuryFactory', related_name='product_lambdas')

    class Meta:
        table = 'treasury_factory_product_lambda'

###
# Mavryk General Contracts
###
class GovernanceProxyGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceProxy', related_name='general_contracts')

    class Meta:
        table = 'governance_proxy_general_contract'

class DoormanGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Doorman', related_name='general_contracts')

    class Meta:
        table = 'doorman_general_contract'

class FarmGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Farm', related_name='general_contracts')

    class Meta:
        table = 'farm_general_contract'

class FarmFactoryGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='general_contracts')

    class Meta:
        table = 'farm_factory_general_contract'

class DelegationGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Delegation', related_name='general_contracts')

    class Meta:
        table = 'delegation_general_contract'

class CouncilGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Council', related_name='general_contracts')

    class Meta:
        table = 'council_general_contract'

class VestingGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Vesting', related_name='general_contracts')

    class Meta:
        table = 'vesting_general_contract'

class EmergencyGovernanceGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.EmergencyGovernance', related_name='general_contracts')

    class Meta:
        table = 'emergency_governance_general_contract'

class BreakGlassGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.BreakGlass', related_name='general_contracts')

    class Meta:
        table = 'break_glass_general_contract'

class GovernanceGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Governance', related_name='general_contracts')

    class Meta:
        table = 'governance_general_contract'

class GovernanceFinancialGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceFinancial', related_name='general_contracts')

    class Meta:
        table = 'governance_financial_general_contract'

class GovernanceSatelliteGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceSatellite', related_name='general_contracts')

    class Meta:
        table = 'governance_satellite_general_contract'

class AggregatorGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Aggregator', related_name='general_contracts')

    class Meta:
        table = 'aggregator_general_contract'

class AggregatorFactoryGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.AggregatorFactory', related_name='general_contracts')

    class Meta:
        table = 'aggregator_factory_general_contract'

class TreasuryGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Treasury', related_name='general_contracts')

    class Meta:
        table = 'treasury_general_contract'

class TreasuryFactoryGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.TreasuryFactory', related_name='general_contracts')

    class Meta:
        table = 'treasury_factory_general_contract'

class MVKTokenGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.MVKToken', related_name='general_contracts')

    class Meta:
        table = 'mvk_token_general_contract'

###
# Mavryk Whitelist Contracts
###
class GovernanceProxyWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceProxy', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_proxy_whitelist_contract'

class DoormanWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Doorman', related_name='whitelist_contracts')

    class Meta:
        table = 'doorman_whitelist_contract'

class FarmWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Farm', related_name='whitelist_contracts')

    class Meta:
        table = 'farm_whitelist_contract'

class FarmFactoryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'farm_factory_whitelist_contract'

class DelegationWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Delegation', related_name='whitelist_contracts')

    class Meta:
        table = 'delegation_whitelist_contract'

class CouncilWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Council', related_name='whitelist_contracts')

    class Meta:
        table = 'council_whitelist_contract'

class VestingWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Vesting', related_name='whitelist_contracts')

    class Meta:
        table = 'vesting_whitelist_contract'

class EmergencyGovernanceWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.EmergencyGovernance', related_name='whitelist_contracts')

    class Meta:
        table = 'emergency_governance_whitelist_contract'

class BreakGlassWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.BreakGlass', related_name='whitelist_contracts')

    class Meta:
        table = 'break_glass_whitelist_contract'

class GovernanceWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Governance', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_whitelist_contract'

class GovernanceFinancialWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceFinancial', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_financial_whitelist_contract'

class GovernanceSatelliteWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceSatellite', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_satellite_whitelist_contract'

class AggregatorWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Aggregator', related_name='whitelist_contracts')

    class Meta:
        table = 'aggregator_whitelist_contract'

class AggregatorFactoryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'aggregator_factory_whitelist_contract'

class TreasuryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Treasury', related_name='whitelist_contracts')

    class Meta:
        table = 'treasury_whitelist_contract'

class TreasuryFactoryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.TreasuryFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'treasury_factory_whitelist_contract'

class MVKTokenWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.MVKToken', related_name='whitelist_contracts')

    class Meta:
        table = 'mvk_token_whitelist_contract'

###
# Mavryk Whitelist Token Contracts
###
class GovernanceProxyWhitelistTokenContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceProxy', related_name='whitelist_token_contracts')

    class Meta:
        table = 'governance_proxy_whitelist_token_contract'

class GovernanceFinancialWhitelistTokenContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceFinancial', related_name='whitelist_token_contracts')

    class Meta:
        table = 'governance_financial_whitelist_token_contract'

class TreasuryWhitelistTokenContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Treasury', related_name='whitelist_token_contracts')

    class Meta:
        table = 'treasury_whitelist_token_contract'

class TreasuryFactoryWhitelistTokenContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.TreasuryFactory', related_name='whitelist_token_contracts')

    class Meta:
        table = 'treasury_factory_whitelist_token_contract'

###
# Mavryk Contracts records
###
class MavrykUserOperator(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    owner                                   = fields.ForeignKeyField('models.MavrykUser', related_name='users_owner')
    operator                                = fields.ForeignKeyField('models.MavrykUser', related_name='user_operators')

    class Meta:
        table = 'mavryk_user_operator'

class DoormanStakeAccount(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='doorman_stake_account', index=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stake_accounts', null=True)
    participation_fees_per_share            = fields.FloatField(default=0)
    smvk_balance                            = fields.FloatField(default=0)

    class Meta:
        table = 'doorman_stake_account'

class FarmAccount(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='farm_accounts', index=True)
    farm                                    = fields.ForeignKeyField('models.Farm', related_name='farm_accounts', index=True)
    deposited_amount                        = fields.BigIntField(default=0)
    participation_rewards_per_share         = fields.FloatField(default=0)
    unclaimed_rewards                       = fields.FloatField(default=0)
    claimed_rewards                         = fields.FloatField(default=0)

    class Meta:
        table = 'farm_account'

class SatelliteRewardsRecord(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='satellite_rewards_records')
    reference                               = fields.ForeignKeyField('models.SatelliteRewardsRecord', related_name='satellite_references', null=True)
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='satellite_rewards_records')
    unpaid                                  = fields.FloatField(default=0)
    paid                                    = fields.FloatField(default=0)
    participation_rewards_per_share         = fields.FloatField(default=0)
    satellite_accumulated_reward_per_share  = fields.FloatField(default=0)

    class Meta:
        table = 'satellite_rewards_record'

class SatelliteRecord(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='satellite_record')
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='satellite_records')
    status                                  = fields.IntEnumField(enum_type=SatelliteStatus, default=SatelliteStatus.ACTIVE)
    fee                                     = fields.SmallIntField(default=0)
    name                                    = fields.TextField(default="")
    description                             = fields.TextField(default="")
    image                                   = fields.TextField(default="")
    website                                 = fields.TextField(default="")
    currently_registered                    = fields.BooleanField(default=True)

    class Meta:
        table = 'satellite_record'

class DelegationRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    satellite_record                        = fields.ForeignKeyField('models.SatelliteRecord', related_name='delegation_records', null=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='delegation_records')
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='delegation_records')

    class Meta:
        table = 'delegation_record'

class CouncilCouncilMember(Model):
    id                                      = fields.BigIntField(pk=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='council_council_member')
    council                                 = fields.ForeignKeyField('models.Council', related_name='council_council_members')
    name                                    = fields.TextField(default="")
    website                                 = fields.TextField(default="")
    image                                   = fields.TextField(default="")

    class Meta:
        table = 'council_council_member'

class CouncilActionRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    council                                 = fields.ForeignKeyField('models.Council', related_name='council_action_records')
    initiator                               = fields.ForeignKeyField('models.MavrykUser', related_name='council_actions_initiator')
    start_datetime                          = fields.DatetimeField(null=True)
    executed_datetime                       = fields.DatetimeField(null=True)
    executed_level                          = fields.BigIntField(default=0)
    expiration_datetime                     = fields.DatetimeField(null=True)
    action_type                             = fields.CharField(max_length=48)
    status                                  = fields.IntEnumField(enum_type=ActionStatus)
    executed                                = fields.BooleanField(default=False)
    signers_count                           = fields.SmallIntField(default=1)

    class Meta:
        table = 'council_action_record'

class CouncilActionRecordSigner(Model):
    id                                      = fields.BigIntField(pk=True)
    council_action                          = fields.ForeignKeyField('models.CouncilActionRecord', related_name='signers')
    signer                                  = fields.ForeignKeyField('models.MavrykUser', related_name='council_actions_signer')

    class Meta:
        table = 'council_action_record_signer'

class CouncilActionRecordParameter(Model):
    id                                      = fields.BigIntField(pk=True)
    council_action                          = fields.ForeignKeyField('models.CouncilActionRecord', related_name='council_action_record_parameters')
    name                                    = fields.TextField(default="")
    value                                   = fields.TextField(default="")

    class Meta:
        table = 'council_action_record_parameter'

class VestingVesteeRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    vesting                                 = fields.ForeignKeyField('models.Vesting', related_name='vesting_vestee_records')
    vestee                                  = fields.ForeignKeyField('models.MavrykUser', related_name='vesting_vestee_record')
    total_allocated_amount                  = fields.FloatField(default=0)
    claim_amount_per_month                  = fields.FloatField(default=0)
    start_timestamp                         = fields.DatetimeField(null=True)
    vesting_months                          = fields.SmallIntField(default=0)
    cliff_months                            = fields.SmallIntField(default=0)
    end_cliff_timestamp                     = fields.DatetimeField(null=True)
    end_vesting_timestamp                   = fields.DatetimeField(null=True)
    locked                                  = fields.BooleanField(default=False)
    total_remainder                         = fields.FloatField(default=0)
    total_claimed                           = fields.FloatField(default=0)
    months_claimed                          = fields.SmallIntField(default=0)
    months_remaining                        = fields.SmallIntField(default=0)
    next_redemption_timestamp               = fields.DatetimeField(null=True)
    last_claimed_timestamp                  = fields.DatetimeField(null=True)

    class Meta:
        table = 'vesting_vestee_record'

class EmergencyGovernanceRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    emergency_governance                    = fields.ForeignKeyField('models.EmergencyGovernance', related_name='emergency_governance_records')
    proposer                                = fields.ForeignKeyField('models.MavrykUser', related_name='emergency_governance_proposer')
    executed                                = fields.BooleanField(default=False)
    dropped                                 = fields.BooleanField(default=False)
    title                                   = fields.TextField(default="")
    description                             = fields.TextField(default="")
    total_smvk_votes                        = fields.FloatField(default=0)
    smvk_percentage_required                = fields.FloatField(default=0)
    smvk_required_for_trigger               = fields.FloatField(default=0)
    start_timestamp                         = fields.DatetimeField(null=True)
    executed_timestamp                      = fields.DatetimeField(null=True)
    expiration_timestamp                    = fields.DatetimeField(null=True)
    start_level                             = fields.BigIntField(default=0)
    executed_level                          = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance_record'

class EmergencyGovernanceVote(Model):
    id                                      = fields.BigIntField(pk=True)
    emergency_governance_record             = fields.ForeignKeyField('models.EmergencyGovernanceRecord', related_name='voters')
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='emergency_governance_votes')
    timestamp                               = fields.DatetimeField(null=True)
    smvk_amount                             = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance_vote'

class BreakGlassCouncilMember(Model):
    id                                      = fields.BigIntField(pk=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='break_glass_council_member')
    break_glass                             = fields.ForeignKeyField('models.BreakGlass', related_name='break_glass_council_members')
    name                                    = fields.TextField(default="")
    website                                 = fields.TextField(default="")
    image                                   = fields.TextField(default="")

    class Meta:
        table = 'break_glass_council_member'

class BreakGlassActionRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    break_glass                             = fields.ForeignKeyField('models.BreakGlass', related_name='break_glass_action_records')
    initiator                               = fields.ForeignKeyField('models.MavrykUser', related_name='break_glass_actions_initiator')
    start_datetime                          = fields.DatetimeField(null=True)
    executed_datetime                       = fields.DatetimeField(null=True)
    executed_level                          = fields.BigIntField(default=0)
    expiration_datetime                     = fields.DatetimeField(null=True)
    action_type                             = fields.CharField(max_length=48)
    status                                  = fields.IntEnumField(enum_type=ActionStatus)
    executed                                = fields.BooleanField(default=False)
    signers_count                           = fields.SmallIntField(default=1)

    class Meta:
        table = 'break_glass_action_record'

class BreakGlassActionRecordSigner(Model):
    id                                      = fields.BigIntField(pk=True)
    break_glass_action_record               = fields.ForeignKeyField('models.BreakGlassActionRecord', related_name='signers')
    signer                                  = fields.ForeignKeyField('models.MavrykUser', related_name='break_glass_actions_signer')

    class Meta:
        table = 'break_glass_action_record_signer'

class BreakGlassActionRecordParameter(Model):
    id                                      = fields.BigIntField(pk=True)
    break_glass_action_record               = fields.ForeignKeyField('models.BreakGlassActionRecord', related_name='break_glass_action_record_parameters')
    name                                    = fields.TextField(default="")
    value                                   = fields.TextField(default="")

    class Meta:
        table = 'break_glass_action_record_parameter'

class GovernanceProposalRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_proposal_records')
    proposer                                = fields.ForeignKeyField('models.MavrykUser', related_name='governance_proposal_records_proposer')
    status                                  = fields.IntEnumField(enum_type=GovernanceRecordStatus)
    execution_counter                       = fields.SmallIntField(default=0)
    title                                   = fields.TextField(default="")
    description                             = fields.TextField(default="")
    invoice                                 = fields.TextField(default="")
    source_code                             = fields.TextField(default="")
    executed                                = fields.BooleanField(default=False)
    locked                                  = fields.BooleanField(default=False)
    payment_processed                       = fields.BooleanField(default=False)
    reward_claim_ready                      = fields.BooleanField(default=False)
    success_reward                          = fields.FloatField(default=0)
    total_voters_reward                     = fields.FloatField(default=0)
    proposal_vote_count                     = fields.BigIntField(default=0)
    proposal_vote_smvk_total                = fields.FloatField(default=0)
    min_proposal_round_vote_pct             = fields.BigIntField(default=0)
    min_proposal_round_vote_req             = fields.BigIntField(default=0)
    yay_vote_count                          = fields.BigIntField(default=0)
    yay_vote_smvk_total                     = fields.FloatField(default=0)
    nay_vote_count                          = fields.BigIntField(default=0)
    nay_vote_smvk_total                     = fields.FloatField(default=0)
    pass_vote_count                         = fields.BigIntField(default=0)
    pass_vote_smvk_total                    = fields.FloatField(default=0)
    min_quorum_percentage                   = fields.BigIntField(default=0)
    min_yay_vote_percentage                 = fields.FloatField(default=0)
    quorum_count                            = fields.BigIntField(default=0)
    quorum_smvk_total                       = fields.FloatField(default=0)
    start_datetime                          = fields.DatetimeField(null=True)
    cycle                                   = fields.BigIntField(default=0)
    current_cycle_start_level               = fields.BigIntField(default=0)
    current_cycle_end_level                 = fields.BigIntField(default=0)
    current_round_proposal                  = fields.BooleanField(default=True)

    class Meta:
        table = 'governance_proposal_record'

class GovernanceProposalRecordData(Model):
    id                                      = fields.BigIntField(pk=True)
    record_internal_id                      = fields.SmallIntField(default=0)
    governance_proposal_record              = fields.ForeignKeyField('models.GovernanceProposalRecord', related_name='proposal_data')
    title                                   = fields.TextField(default="")
    bytes                                   = fields.TextField(default="")

    class Meta:
        table = 'governance_proposal_record_data'

class GovernanceProposalRecordPayment(Model):
    id                                      = fields.BigIntField(pk=True)
    record_internal_id                      = fields.SmallIntField(default=0)
    governance_proposal_record              = fields.ForeignKeyField('models.GovernanceProposalRecord', related_name='proposal_payments')
    token                                   = fields.ForeignKeyField('models.Token', related_name='governance_proposal_records_payments_token', null=True)
    title                                   = fields.TextField(default="")
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='governance_proposal_records_payments', null=True)
    token_amount                            = fields.FloatField(default=0.0)

    class Meta:
        table = 'governance_proposal_record_payment'

class GovernanceProposalRecordVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_proposal_record              = fields.ForeignKeyField('models.GovernanceProposalRecord', related_name='votes', null=True)
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='governance_proposal_records_votes')
    timestamp                               = fields.DatetimeField(null=True)
    round                                   = fields.IntEnumField(enum_type=GovernanceRoundType)
    vote                                    = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)
    voting_power                            = fields.FloatField(default=0.0)
    current_round_vote                      = fields.BooleanField(default=True)

    class Meta:
        table = 'governance_proposal_record_vote'

class GovernanceSatelliteSnapshotRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_satellite_snapshot_records')
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_snapshot_records_votes')
    ready                                   = fields.BooleanField(default=True)
    total_smvk_balance                      = fields.FloatField(default=0.0)
    total_delegated_amount                  = fields.FloatField(default=0.0)
    total_voting_power                      = fields.FloatField(default=0.0)
    cycle                                   = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite_snapshot_record'

class GovernanceFinancialRequestRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_financial                    = fields.ForeignKeyField('models.GovernanceFinancial', related_name='governance_financial_request_records')
    treasury                                = fields.ForeignKeyField('models.Treasury', related_name='governance_financial_request_records')
    requester                               = fields.ForeignKeyField('models.MavrykUser', related_name='governance_financial_requests_requester')
    token                                   = fields.ForeignKeyField('models.Token', related_name='governance_financial_requests_token', null=True)
    request_type                            = fields.CharField(max_length=255)
    status                                  = fields.IntEnumField(enum_type=GovernanceRecordStatus, default=GovernanceRecordStatus.ACTIVE)
    executed                                = fields.BooleanField()
    token_amount                            = fields.FloatField(default=0.0)
    request_purpose                         = fields.TextField(default="")
    key_hash                                = fields.TextField(default="", null=True)
    yay_vote_smvk_total                     = fields.FloatField(default=0.0)
    nay_vote_smvk_total                     = fields.FloatField(default=0.0)
    pass_vote_smvk_total                    = fields.FloatField(default=0.0)
    smvk_percentage_for_approval            = fields.SmallIntField(default=0)
    snapshot_smvk_total_supply              = fields.FloatField(default=0.0)
    smvk_required_for_approval              = fields.FloatField(default=0.0)
    expiration_datetime                     = fields.DatetimeField(null=True)
    requested_datetime                      = fields.DatetimeField(null=True)

    class Meta:
        table = 'governance_financial_request_record'

class GovernanceFinancialRequestRecordVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_financial_request            = fields.ForeignKeyField('models.GovernanceFinancialRequestRecord', related_name='votes')
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='governance_financial_requests_votes')
    satellite_snapshot                      = fields.ForeignKeyField('models.GovernanceSatelliteSnapshotRecord', related_name='governance_financial_requests_votes', null=True)
    timestamp                               = fields.DatetimeField(null=True)
    vote                                    = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)

    class Meta:
        table = 'governance_financial_request_vote'

class GovernanceSatelliteActionRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='governance_satellite_action_records')
    initiator                               = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_action_initiators')
    governance_type                         = fields.CharField(max_length=255)
    status                                  = fields.IntEnumField(enum_type=GovernanceRecordStatus, default=GovernanceRecordStatus.ACTIVE)
    executed                                = fields.BooleanField()
    governance_purpose                      = fields.TextField() #TODO: Should I reuse CharField instead?
    yay_vote_smvk_total                     = fields.FloatField(default=0.0)
    nay_vote_smvk_total                     = fields.FloatField(default=0.0)
    pass_vote_smvk_total                    = fields.FloatField(default=0.0)
    snapshot_smvk_total_supply              = fields.FloatField(default=0.0)
    smvk_percentage_for_approval            = fields.SmallIntField(default=0)
    smvk_required_for_approval              = fields.FloatField(default=0.0)
    expiration_datetime                     = fields.DatetimeField(null=True)
    start_datetime                          = fields.DatetimeField(null=True)

    class Meta:
        table = 'governance_satellite_action_record'

class GovernanceSatelliteActionRecordVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteActionRecord', related_name='votes')
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_actions_votes')
    satellite_snapshot                      = fields.ForeignKeyField('models.GovernanceSatelliteSnapshotRecord', related_name='governance_satellite_actions_votes', null=True)
    timestamp                               = fields.DatetimeField(null=True)
    vote                                    = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)
    class Meta:
        table = 'governance_satellite_action_record_vote'

class GovernanceSatelliteActionRecordParameter(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteActionRecord', related_name='governance_satellite_action_parameters')
    name                                    = fields.TextField(default="")
    value                                   = fields.TextField(default="")

    class Meta:
        table = 'governance_satellite_action_record_parameter'

class GovernanceSatelliteActionRecordTransfer(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_action             = fields.ForeignKeyField('models.GovernanceSatelliteActionRecord', related_name='governance_satellite_action_transfers')
    token                                   = fields.ForeignKeyField('models.Token', related_name='governance_satellite_action_transfer_tokens', null=True)
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_action_record_transfer_receiver')
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite_action_record_transfer'

class GovernanceSatelliteAggregatorRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='governance_satellite_aggregator_records')
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='governance_satellite_aggregator_records')
    creation_timestamp                      = fields.DatetimeField(null=True)
    token_0_symbol                          = fields.CharField(max_length=32, default="")
    token_1_symbol                          = fields.CharField(max_length=32, default="")
    active                                  = fields.BooleanField(default=True)

    class Meta:
        table = 'governance_satellite_aggregator_record'

class GovernanceSatelliteAggregatorRecordOracle(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_aggregator         = fields.ForeignKeyField('models.GovernanceSatelliteAggregatorRecord', related_name='governance_satellite_aggregator_record_oracles')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_aggregator_record_oracles')

    class Meta:
        table = 'governance_satellite_aggregator_record_oracle'

class GovernanceSatelliteSatelliteOracleRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite                    = fields.ForeignKeyField('models.GovernanceSatellite', related_name='governance_satellite_satellite_oracle_records')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_satellite_oracle_records')
    aggregators_subscribed                  = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_satellite_satellite_oracle_record'

class GovernanceSatelliteSatelliteOracleAggregatorPairRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_satellite_satellite_oracle_record= fields.ForeignKeyField('models.GovernanceSatelliteSatelliteOracleRecord', related_name='aggregator_pairs')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='governance_satellite_satellite_oracle_aggregator_pair_records')
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='governance_satellite_satellite_oracle_aggregator_pair_records')
    start_timestamp                         = fields.DatetimeField(null=True)
    token_0_symbol                          = fields.CharField(max_length=32)
    token_1_symbol                          = fields.CharField(max_length=32)

    class Meta:
        table = 'governance_satellite_satellite_oracle_aggregator_pair_record'

class AggregatorOracleRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='oracle_records')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_oracle_records')
    active                                  = fields.BooleanField(default=True)

    class Meta:
        table = 'aggregator_oracle_record'

class AggregatorDeviationTriggerBan(Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='deviation_trigger_bans')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_deviation_trigger_bans')
    timestamp                               = fields.DatetimeField(null=True)

    class Meta:
        table = 'aggregator_deviation_trigger_ban'

class AggregatorObservationCommit(Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='observation_commits')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_observation_commits')
    commit                                  = fields.CharField(max_length=500, default="")

    class Meta:
        table = 'aggregator_observation_commit'

class AggregatorObservationReveal(Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='observation_reveals')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_observation_reveals')
    reveal                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'aggregator_observation_reveal'

class AggregatorOracleRewardSMVK(Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='oracle_rewards_smvk')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_oracle_rewards_smvk')
    smvk                                    = fields.FloatField(default=0)

    class Meta:
        table = 'aggregator_observation_reward_smvk'

class AggregatorOracleRewardXTZ(Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='oracle_rewards_xtz')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_oracle_rewards_xtz')
    xtz                                     = fields.FloatField(default=0)

    class Meta:
        table = 'aggregator_observation_reward_xtz'

# class VaultHandle(Model):
#     id                                      = fields.BigIntField(pk=True)
#     vault                                   = fields.ForeignKeyField('models.Vault', related_name='vault_handle')
#     vault_owner                             = fields.ForeignKeyField('models.MavrykUser', related_name='vault_owners')
#     internal_id                             = fields.BigIntField(default=0)

#     class Meta:
#         table = 'vault_handle'

# class VaultDepositor(Model):
#     id                                      = fields.BigIntField(pk=True)
#     vault                                   = fields.ForeignKeyField('models.Vault', related_name='vault_depositors')
#     depositor                               = fields.ForeignKeyField('models.MavrykUser', related_name='vaults_depositor')
#     whitelisted                             = fields.BooleanField(default=False)

#     class Meta:
#         table = 'vault_depositor'

# class USDMTokenControllerVault(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='vaults')
#     vault                                   = fields.ForeignKeyField('models.Vault', related_name='usdm_token_controller_vaults')
#     collateral_balance                      = fields.FloatField(default=0.0)
#     usdm_outstanding                        = fields.FloatField(default=0.0)
#     last_mint_block_leve                    = fields.BigIntField(default=0)
#     used                                    = fields.BooleanField(default=True)

#     class Meta:
#         table = 'usdm_token_controller_vault'

# class USDMTokenControllerVaultCollateral(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller_vault             = fields.ForeignKeyField('models.USDMTokenControllerVault', related_name='collaterals')
#     name                                    = fields.CharField(max_length=36)
#     balance                                 = fields.FloatField(default=0.0)

#     class Meta:
#         table = 'usdm_token_controller_vault_collateral'

# class USDMTokenControllerTarget(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='targets')
#     name                                    = fields.CharField(max_length=36)
#     target_price                            = fields.FloatField(default=0.0)

#     class Meta:
#         table = 'usdm_token_controller_target'

# class USDMTokenControllerDrift(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='drifts')
#     name                                    = fields.CharField(max_length=36)
#     drift                                   = fields.FloatField(default=0.0)

#     class Meta:
#         table = 'usdm_token_controller_drifts'

# class USDMTokenControllerLastDriftUpdate(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='last_drift_updates')
#     name                                    = fields.CharField(max_length=36)
#     timestamp                               = fields.DatetimeField(null=True)

#     class Meta:
#         table = 'usdm_token_controller_last_drift_update'

# class USDMTokenControllerCollateralToken(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='collateral_tokens')
#     name                                    = fields.CharField(max_length=36)
#     token_name                              = fields.CharField(max_length=36)
#     token_contract_address                  = fields.CharField(max_length=36)
#     token_type                              = fields.IntEnumField(enum_type=TokenType)
#     decimals                                = fields.SmallIntField(default=0)
#     oracle_type                             = fields.CharField(max_length=36)
#     oracle_address                          = fields.CharField(max_length=36)

#     class Meta:
#         table = 'usdm_token_controller_collateral_token'

# class USDMTokenControllerPrice(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='prices')
#     name                                    = fields.CharField(max_length=36)
#     price                                   = fields.FloatField(default=0.0)
    
#     class Meta:
#         table = 'usdm_token_controller_price'

# class USDMTokenControllerCFMM(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='cfmms')
#     cfmm                                    = fields.ForeignKeyField('models.CFMM', related_name='usdm_token_controller_cfmms')
#     name                                    = fields.CharField(max_length=36)
    
#     class Meta:
#         table = 'usdm_token_controller_cfmm'

class TokenSaleBuyOption(Model):
    id                                      = fields.BigIntField(pk=True)
    buy_option_internal_id                  = fields.SmallIntField(default=0)
    token_sale                              = fields.ForeignKeyField('models.TokenSale', related_name='token_sale_buy_options')
    max_amount_per_wallet_total             = fields.FloatField(default=0.0)
    whitelist_max_amount_total              = fields.FloatField(default=0.0)
    max_amount_cap                          = fields.FloatField(default=0.0)
    vesting_periods                         = fields.SmallIntField(default=0)
    token_xtz_price                         = fields.BigIntField(default=0)
    min_mvk_amount                          = fields.FloatField(default=0.0)
    total_bought                            = fields.FloatField(default=0.0)

    class Meta:
        table = 'token_sale_buy_option'

class TokenSaleWhitelistedUser(Model):
    id                                      = fields.BigIntField(pk=True)
    token_sale                              = fields.ForeignKeyField('models.TokenSale', related_name='token_sale_whitelist_accounts')
    whitelisted_user                        = fields.ForeignKeyField('models.MavrykUser', related_name='token_sale_whitelist_accounts')

    class Meta:
        table = 'token_sale_whitelisted_account'

class TokenSaleBuyerRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    token_sale                              = fields.ForeignKeyField('models.TokenSale', related_name='token_sale_buyer_records')
    buyer                                   = fields.ForeignKeyField('models.MavrykUser', related_name='token_sale_buyer_records')

    class Meta:
        table = 'token_sale_buyer_record'

class TokenSaleBuyerRecordOption(Model):
    id                                      = fields.BigIntField(pk=True)
    buy_option                              = fields.ForeignKeyField('models.TokenSaleBuyOption', related_name='buyer_record_options')
    buyer_record                            = fields.ForeignKeyField('models.TokenSaleBuyerRecord', related_name='options')
    token_bought                            = fields.FloatField(default=0.0)
    token_claimed                           = fields.FloatField(default=0.0)
    claim_counter                           = fields.SmallIntField(default=0)
    last_claim_timestamp                    = fields.DatetimeField(null=True)
    last_claim_level                        = fields.BigIntField(default=0)

    class Meta:
        table = 'token_sale_buyer_record_option'

class MVKTransferHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    timestamp                               = fields.DatetimeField()
    mvk_token                               = fields.ForeignKeyField('models.MVKToken', related_name='mvk_transfer_history_data')
    from_                                   = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_transfer_sender')
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_transfer_receiver')
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'mvk_transfer_history_data'

class TreasuryTransferHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    timestamp                               = fields.DatetimeField()
    treasury                                = fields.ForeignKeyField('models.Treasury', related_name='treasury_transfer_history_data')
    token                                   = fields.ForeignKeyField('models.Token', related_name='treasury_transfer_token')
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='treasury_transfer_receiver', null=True)
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'treasury_transfer_history_data'

class StakeHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stake_records')
    from_                                   = fields.ForeignKeyField('models.MavrykUser', related_name='stake_records')
    timestamp                               = fields.DatetimeField()
    type                                    = fields.IntEnumField(enum_type=StakeType)
    mvk_loyalty_index                       = fields.BigIntField(default=0.0)
    desired_amount                          = fields.FloatField(default=0.0)
    final_amount                            = fields.FloatField(default=0.0)

    class Meta:
        table = 'stake_history_data'

class SMVKHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='smvk_history_data')
    timestamp                               = fields.DatetimeField()
    smvk_total_supply                       = fields.FloatField(default=0.0)
    avg_smvk_by_user                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'smvk_history_data'

class MintHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    mvk_token                               = fields.ForeignKeyField('models.MVKToken', related_name='mint_history_data')
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='mint_history_data')
    timestamp                               = fields.DatetimeField()
    minted_amount                           = fields.FloatField(default=0.0)
    mvk_total_supply                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'mint_history_data'
