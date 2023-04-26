from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, MavrykContract

###
# MVK Token Tables
###

class MVKToken(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='mvk_tokens')
    maximum_supply                          = fields.FloatField(default=0)
    total_supply                            = fields.FloatField(default=0)
    inflation_rate                          = fields.SmallIntField(default=0)
    next_inflation_timestamp                = fields.DatetimeField(null=True, index=True)

    class Meta:
        table = 'mvk_token'

class MVKTokenGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.MVKToken', related_name='general_contracts')

    class Meta:
        table = 'mvk_token_general_contract'

class MVKTokenWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.MVKToken', related_name='whitelist_contracts')

    class Meta:
        table = 'mvk_token_whitelist_contract'

class MVKTokenOperator(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    mvk_token                               = fields.ForeignKeyField('models.MVKToken', related_name='operators')
    owner                                   = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_token_user_owners', index=True)
    operator                                = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_token_user_operators', index=True)

    class Meta:
        table = 'mvk_token_operator'

class MVKTokenTransferHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    timestamp                               = fields.DatetimeField(index=True)
    mvk_token                               = fields.ForeignKeyField('models.MVKToken', related_name='transfer_history_data')
    from_                                   = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_transfer_sender', index=True)
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_transfer_receiver', index=True)
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'mvk_transfer_history_data'

class MVKTokenMintHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    mvk_token                               = fields.ForeignKeyField('models.MVKToken', related_name='mint_history_data')
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='mint_history_data', index=True)
    level                                   = fields.BigIntField(default=0)
    timestamp                               = fields.DatetimeField(index=True)
    minted_amount                           = fields.FloatField(default=0.0)
    mvk_total_supply                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'mvk_mint_history_data'
