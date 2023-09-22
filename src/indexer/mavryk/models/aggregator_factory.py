from dipdup.models import Model, fields
from mavryk.models.parents import LinkedContract, ContractLambda, MavrykContract

###
# Aggregator Factory Tables
###

class AggregatorFactory(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='aggregator_factories')
    create_aggregator_paused                = fields.BooleanField(default=False)
    track_aggregator_paused                 = fields.BooleanField(default=False)
    untrack_aggregator_paused               = fields.BooleanField(default=False)
    distribute_reward_xtz_paused            = fields.BooleanField(default=False)
    distribute_reward_smvk_paused           = fields.BooleanField(default=False)
    aggregator_name_max_length              = fields.SmallIntField(default=0)

    class Meta:
        table = 'aggregator_factory'

class AggregatorFactoryLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='lambdas')

    class Meta:
        table = 'aggregator_factory_lambda'

class AggregatorFactoryAggregatorLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='aggregator_lambdas')

    class Meta:
        table = 'aggregator_factory_aggregator_lambda'

class AggregatorFactoryGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.AggregatorFactory', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'aggregator_factory_general_contract'

class AggregatorFactoryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'aggregator_factory_whitelist_contract'