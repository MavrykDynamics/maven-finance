from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Farm Factory Tables
###

class FarmFactory(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='farm_factories')
    farm_name_max_length                    = fields.SmallIntField(default=0)
    create_farm_paused                      = fields.BooleanField(default=False)
    create_farm_m_token_paused              = fields.BooleanField(default=False)
    track_farm_paused                       = fields.BooleanField(default=False)
    untrack_farm_paused                     = fields.BooleanField(default=False)

    class Meta:
        table = 'farm_factory'

class FarmFactoryLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.FarmFactory', related_name='lambdas')

    class Meta:
        table = 'farm_factory_lambda'

class FarmFactoryFarmLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='farm_lambdas')

    class Meta:
        table = 'farm_factory_farm_lambda'

class FarmFactoryMFarmLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='m_farm_lambdas')

    class Meta:
        table = 'farm_factory_m_farm_lambda'

class FarmFactoryGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='general_contracts')

    class Meta:
        table = 'farm_factory_general_contract'

class FarmFactoryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.FarmFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'farm_factory_whitelist_contract'