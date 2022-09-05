from dipdup.models import Model, fields
from mavryk.sql_model.parents import ContractLambda, MavrykContract

###
# Vault Tables
###

class Vault(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='vaults', null=True)

    class Meta:
        table = 'vault'

class VaultLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Vault', related_name='lambdas')

    class Meta:
        table = 'vault_lambda'

class VaultDepositorRecord(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    vault                                   = fields.ForeignKeyField('models.Vault', related_name='depositor_records', null=True)
    depositor                               = fields.ForeignKeyField('models.MavrykUser', related_name='vault_depositor_records', null=True)

    class Meta:
        table = 'vault_depositor_record'
