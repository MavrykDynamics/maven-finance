from tortoise import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

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

    class Meta:
        table = 'aggregator_factory'

class AggregatorFactoryLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='lambdas')

    class Meta:
        table = 'aggregator_factory_lambda'

class AggregatorFactoryProductLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='product_lambdas')

    class Meta:
        table = 'aggregator_factory_product_lambda'

class AggregatorFactoryGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.AggregatorFactory', related_name='general_contracts')

    class Meta:
        table = 'aggregator_factory_general_contract'

class AggregatorFactoryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.AggregatorFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'aggregator_factory_whitelist_contract'