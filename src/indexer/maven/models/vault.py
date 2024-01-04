from dipdup.models import Model, fields
from .enums import VaultAllowance
from maven.models.parents import ContractLambda, MavenContract

###
# Vault Tables
###

class Vault(MavenContract, Model):
    factory                                 = fields.ForeignKeyField('models.VaultFactory', related_name='vaults')
    baker                                   = fields.ForeignKeyField('models.MavenUser', related_name='delegated_vaults', null=True)
    name                                    = fields.TextField(default='', index=True)
    creation_timestamp                      = fields.DatetimeField()
    allowance                               = fields.IntEnumField(enum_type=VaultAllowance, default=VaultAllowance.ANY, index=True)

    class Meta:
        table = 'vault'

class VaultLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Vault', related_name='lambdas')

    class Meta:
        table = 'vault_lambda'

class VaultDepositor(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    vault                                   = fields.ForeignKeyField('models.Vault', related_name='depositors')
    depositor                               = fields.ForeignKeyField('models.MavenUser', related_name='vault_depositors', index=True)

    class Meta:
        table = 'vault_depositor'
