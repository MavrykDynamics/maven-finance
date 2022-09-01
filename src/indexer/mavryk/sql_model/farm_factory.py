from tortoise import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Farm Factory Tables
###

class FarmFactory(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='farm_factories')
    farm_name_max_length                    = fields.SmallIntField(default=0)
    create_farm_paused                      = fields.BooleanField(default=False)
    track_farm_paused                       = fields.BooleanField(default=False)
    untrack_farm_paused                     = fields.BooleanField(default=False)

    class Meta:
        table = 'farm_factory'

class FarmFactoryLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.FarmFactory', related_name='lambdas')

    class Meta:
        table = 'farm_factory_lambda'

class FarmFactoryProductLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='product_lambdas')

    class Meta:
        table = 'farm_factory_product_lambda'

class FarmFactoryGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='general_contracts')

    class Meta:
        table = 'farm_factory_general_contract'

class FarmFactoryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'farm_factory_whitelist_contract'