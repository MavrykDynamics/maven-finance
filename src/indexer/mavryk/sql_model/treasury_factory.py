from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Treasury Factory Tables
###

class TreasuryFactory(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='treasury_factories')
    treasury_name_max_length                = fields.SmallIntField(default=0)
    create_treasury_paused                  = fields.BooleanField(default=False)
    track_treasury_paused                   = fields.BooleanField(default=False)
    untrack_treasury_paused                 = fields.BooleanField(default=False)

    class Meta:
        table = 'treasury_factory'

class TreasuryFactoryLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.TreasuryFactory', related_name='lambdas')

    class Meta:
        table = 'treasury_factory_lambda'

class TreasuryFactoryTreasuryLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.TreasuryFactory', related_name='treasury_lambdas')

    class Meta:
        table = 'treasury_factory_treasury_lambda'

class TreasuryFactoryGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.TreasuryFactory', related_name='general_contracts')

    class Meta:
        table = 'treasury_factory_general_contract'

class TreasuryFactoryWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.TreasuryFactory', related_name='whitelist_contracts')

    class Meta:
        table = 'treasury_factory_whitelist_contract'

class TreasuryFactoryWhitelistTokenContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.TreasuryFactory', related_name='whitelist_token_contracts')
    token                                   = fields.ForeignKeyField('models.Token', related_name='treasury_factory_whitelist_token_contracts', index=True, null=True)

    class Meta:
        table = 'treasury_factory_whitelist_token_contract'