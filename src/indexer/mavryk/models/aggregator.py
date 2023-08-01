from dipdup.models import Model, fields
from mavryk.models.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.models.enums import RewardType

###
# Aggregator Tables
###

class Aggregator(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='aggregators')
    factory                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='aggregators', null=True)
    creation_timestamp                      = fields.DatetimeField(index=True)
    name                                    = fields.TextField(default='')
    decimals                                = fields.SmallIntField(default=0)
    alpha_pct_per_thousand                  = fields.SmallIntField(default=0)
    pct_oracle_threshold                    = fields.SmallIntField(default=0)
    heart_beat_seconds                      = fields.BigIntField(default=0)
    reward_amount_smvk                      = fields.FloatField(default=0.0)
    reward_amount_xtz                       = fields.FloatField(default=0.0)
    update_data_paused                      = fields.BooleanField(default=False)
    withdraw_reward_xtz_paused              = fields.BooleanField(default=False)
    withdraw_reward_smvk_paused             = fields.BooleanField(default=False)
    last_completed_data_round               = fields.BigIntField(default=0, index=True)
    last_completed_data_epoch               = fields.BigIntField(default=0, index=True)
    last_completed_data                     = fields.FloatField(default=0.0)
    last_completed_data_pct_oracle_resp     = fields.SmallIntField(default=0)
    last_completed_data_last_updated_at     = fields.DatetimeField(index=True)

    class Meta:
        table = 'aggregator'

class AggregatorOracle(Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='oracles', index=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='aggregator_oracles', index=True)
    public_key                              = fields.CharField(max_length=54, default="")
    peer_id                                 = fields.TextField(default="")
    init_round                              = fields.BigIntField(index=True)
    init_epoch                              = fields.BigIntField(index=True)

    class Meta:
        table = 'aggregator_oracle'

class AggregatorOracleObservation(Model):
    id                                      = fields.BigIntField(pk=True)
    oracle                                  = fields.ForeignKeyField('models.AggregatorOracle', related_name='observations', index=True)
    timestamp                               = fields.DatetimeField(index=True)
    data                                    = fields.FloatField(default=0.0)
    epoch                                   = fields.BigIntField(default=0, index=True)
    round                                   = fields.BigIntField(default=0, index=True)

    class Meta:
        table = 'aggregator_oracle_observation'

class AggregatorOracleReward(Model):
    id                                      = fields.BigIntField(pk=True)
    oracle                                  = fields.ForeignKeyField('models.AggregatorOracle', related_name='rewards', index=True)
    type                                    = fields.IntEnumField(enum_type=RewardType, index=True)
    reward                                  = fields.FloatField(default=0)

    class Meta:
        table = 'aggregator_oracle_reward'

class AggregatorLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Aggregator', related_name='lambdas')

    class Meta:
        table = 'aggregator_lambda'

class AggregatorGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Aggregator', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'aggregator_general_contract'

class AggregatorWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Aggregator', related_name='whitelist_contracts')

    class Meta:
        table = 'aggregator_whitelist_contract'

class AggregatorHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    aggregator                              = fields.ForeignKeyField('models.Aggregator', related_name='history_data', index=True)
    timestamp                               = fields.DatetimeField(index=True)
    round                                   = fields.BigIntField(default=0, index=True)
    epoch                                   = fields.BigIntField(default=0, index=True)
    data                                    = fields.FloatField(default=0.0)
    pct_oracle_resp                         = fields.SmallIntField(default=0)

    class Meta:
        table = 'aggregator_history_data'
