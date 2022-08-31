from tortoise import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Aggregator Tables
###

class Aggregator(MavrykContract, Model):
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

class AggregatorLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Aggregator', related_name='lambdas')

    class Meta:
        table = 'aggregator_lambda'

class AggregatorGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Aggregator', related_name='general_contracts')

    class Meta:
        table = 'aggregator_general_contract'

class AggregatorWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Aggregator', related_name='whitelist_contracts')

    class Meta:
        table = 'aggregator_whitelist_contract'

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
