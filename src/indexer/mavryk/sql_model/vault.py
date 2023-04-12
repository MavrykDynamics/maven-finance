from dipdup.models import Model, fields
from .enums import VaultAllowance
from mavryk.sql_model.parents import ContractLambda, MavrykContract

###
# Vault Tables
###

class Vault(MavrykContract, Model):
    factory                                 = fields.ForeignKeyField('models.VaultFactory', related_name='vaults', null=True)
    baker                                   = fields.ForeignKeyField('models.MavrykUser', related_name='delegated_vaults', null=True)
    name                                    = fields.TextField(default='')
    creation_timestamp                      = fields.DatetimeField(null=True, index=True)
    allowance                               = fields.IntEnumField(enum_type=VaultAllowance, default=VaultAllowance.ANY, index=True)

    class Meta:
        table = 'vault'

class VaultLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Vault', related_name='lambdas')

    class Meta:
        table = 'vault_lambda'

class VaultDepositor(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    vault                                   = fields.ForeignKeyField('models.Vault', related_name='depositors', null=True, index=True)
    depositor                               = fields.ForeignKeyField('models.MavrykUser', related_name='vault_depositors', null=True, index=True)

    class Meta:
        table = 'vault_depositor'
