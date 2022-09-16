from dipdup.models import Model, fields
from mavryk.sql_model.parents import ContractLambda, MavrykContract, LinkedContract

###
# Vault Factory Tables
###

class VaultFactory(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='vault_factories', null=True)
    vault_name_max_length                   = fields.SmallIntField(default=0)
    create_vault_paused                     = fields.BooleanField(default=False)

    class Meta:
        table = 'vault_factory'

class VaultFactoryLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.VaultFactory', related_name='lambdas')

    class Meta:
        table = 'vault_factory_lambda'

class VaultFactoryProductLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.VaultFactory', related_name='product_lambdas')

    class Meta:
        table = 'vault_factory_product_lambda'

class VaultFactoryGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.VaultFactory', related_name='general_contracts')

    class Meta:
        table = 'vault_factory_general_contract'

class VaultFactoryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.VaultFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'vault_factory_whitelist_contract'
