from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.sql_model.enums import RewardType

###
# Aggregator Tables
###

class Aggregator(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='aggregators', null=True)
    aggregator_factory                      = fields.ForeignKeyField('models.AggregatorFactory', related_name='aggregators', null=True)
    token_0_symbol                          = fields.CharField(default='', max_length=36)
    token_1_symbol                          = fields.CharField(default='', max_length=36)
    name                                    = fields.TextField(default='')
    decimals                                = fields.SmallIntField(default=0)
    alpha_pct_per_thousand                  = fields.SmallIntField(default=0)
    deviation_trigger_ban_duration          = fields.BigIntField(default=0)
    per_thousand_deviation_trigger          = fields.SmallIntField(default=0)
    pct_oracle_threshold                    = fields.SmallIntField(default=0)
    heart_beat_seconds                      = fields.BigIntField(default=0)
    request_rate_deviation_deposit_fee      = fields.FloatField(default=0.0)
    deviation_reward_amount_smvk            = fields.FloatField(default=0.0)
    deviation_reward_amount_xtz             = fields.FloatField(default=0.0)
    reward_amount_smvk                      = fields.FloatField(default=0.0)
    reward_amount_xtz                       = fields.FloatField(default=0.0)
    update_data_paused                      = fields.BooleanField(default=False)
    withdraw_reward_xtz_paused              = fields.BooleanField(default=False)
    withdraw_reward_smvk_paused             = fields.BooleanField(default=False)
    last_completed_price_round              = fields.BigIntField(default=0)
    last_completed_price_epoch              = fields.BigIntField(default=0)
    last_completed_price                    = fields.FloatField(default=0.0)
    last_completed_price_pct_oracle_resp    = fields.SmallIntField(default=0)
    last_completed_price_datetime           = fields.DatetimeField(null=True)

    class Meta:
        table = 'aggregator'

class AggregatorOracle(ContractLambda, Model):
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='oracles')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_oracles')
    public_key                              = fields.CharField(max_length=54, default="")
    peer_id                                 = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'aggregator_oracle'

class AggregatorDeviationTriggerBan(ContractLambda, Model):
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='deviation_trigger_bans')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_deviation_trigger_bans')
    timestamp                               = fields.DatetimeField(null=True)

    class Meta:
        table = 'aggregator_deviation_trigger_ban'

class AggregatorOracleReward(ContractLambda, Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='oracle_rewards')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_oracle_rewards')
    type                                    = fields.IntEnumField(enum_type=RewardType)
    reward                                  = fields.FloatField(default=0)

    class Meta:
        table = 'aggregator_observation_reward'

class AggregatorLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Aggregator', related_name='lambdas')

    class Meta:
        table = 'aggregator_lambda'

class AggregatorGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Aggregator', related_name='general_contracts')

    class Meta:
        table = 'aggregator_general_contract'

class AggregatorWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Aggregator', related_name='whitelist_contracts')

    class Meta:
        table = 'aggregator_whitelist_contract'
