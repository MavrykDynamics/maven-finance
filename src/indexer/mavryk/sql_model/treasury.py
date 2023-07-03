from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Treasury Tables
###

class Treasury(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='treasuries')
    factory                                 = fields.ForeignKeyField('models.TreasuryFactory', related_name='treasuries', null=True)
    baker                                   = fields.ForeignKeyField('models.MavrykUser', related_name='delegated_treasuries', null=True)
    creation_timestamp                      = fields.DatetimeField(auto_now=True, index=True)
    name                                    = fields.TextField(default='')
    transfer_paused                         = fields.BooleanField(default=False)
    mint_mvk_and_transfer_paused            = fields.BooleanField(default=False)
    stake_mvk_paused                        = fields.BooleanField(default=False)
    unstake_mvk_paused                      = fields.BooleanField(default=False)

    class Meta:
        table = 'treasury'
        
class TreasuryLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Treasury', related_name='lambdas')

    class Meta:
        table = 'treasury_lambda'

class TreasuryGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Treasury', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'treasury_general_contract'

class TreasuryWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Treasury', related_name='whitelist_contracts')

    class Meta:
        table = 'treasury_whitelist_contract'

class TreasuryWhitelistTokenContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Treasury', related_name='whitelist_token_contracts')
    token                                   = fields.ForeignKeyField('models.Token', related_name='treasury_whitelist_token_contracts', index=True)

    class Meta:
        table = 'treasury_whitelist_token_contract'

class TreasuryTransferHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    timestamp                               = fields.DatetimeField(index=True)
    treasury                                = fields.ForeignKeyField('models.Treasury', related_name='transfer_history_data', index=True)
    token_address                           = fields.CharField(max_length=36, default="", index=True)
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='treasury_transfer_receiver', index=True)
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'treasury_transfer_history_data'

class TreasuryBalance(Model):
    id                                      = fields.BigIntField(pk=True)
    treasury                                = fields.ForeignKeyField('models.Treasury', related_name='balances', index=True)
    token                                   = fields.ForeignKeyField('models.Token', related_name='treasury_balances', index=True)
    tzkt_token_id                           = fields.BigIntField(default=0)
    balance                                 = fields.FloatField(default=0.0)
    whitelisted                             = fields.BooleanField(default=False)

    class Meta:
        table = 'treasury_balance'
