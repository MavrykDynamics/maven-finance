from pickle import TRUE
from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Treasury Tables
###

class Treasury(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='treasuries', null=True)
    factory                                 = fields.ForeignKeyField('models.TreasuryFactory', related_name='treasuries', null=True)
    creation_timestamp                      = fields.DatetimeField(null=True)
    name                                    = fields.TextField(default='')
    transfer_paused                         = fields.BooleanField(default=False)
    mint_mvk_and_transfer_paused            = fields.BooleanField(default=False)
    stake_mvk_paused                        = fields.BooleanField(default=False)
    unstake_mvk_paused                      = fields.BooleanField(default=False)

    class Meta:
        table = 'treasury'
        
class TreasuryLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Treasury', related_name='lambdas')

    class Meta:
        table = 'treasury_lambda'

class TreasuryGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Treasury', related_name='general_contracts')

    class Meta:
        table = 'treasury_general_contract'

class TreasuryWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Treasury', related_name='whitelist_contracts')

    class Meta:
        table = 'treasury_whitelist_contract'

class TreasuryWhitelistTokenContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Treasury', related_name='whitelist_token_contracts')

    class Meta:
        table = 'treasury_whitelist_token_contract'

class TreasuryTransferHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    timestamp                               = fields.DatetimeField()
    treasury                                = fields.ForeignKeyField('models.Treasury', related_name='transfer_history_data')
    token                                   = fields.ForeignKeyField('models.Token', related_name='treasury_transfer_token')
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='treasury_transfer_receiver', null=True)
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'treasury_transfer_history_data'