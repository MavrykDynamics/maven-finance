from tortoise import Model, fields
from mavryk.sql_model.parents import LinkedContract

###
# MVK Token Tables
###

class MVKToken(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='mvk_token')
    maximum_supply                          = fields.FloatField(default=0)
    total_supply                            = fields.FloatField(default=0)
    inflation_rate                          = fields.SmallIntField(default=0)
    next_inflation_timestamp                = fields.DatetimeField(null=True)

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

class MavrykUserOperator(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    owner                                   = fields.ForeignKeyField('models.MavrykUser', related_name='users_owner')
    operator                                = fields.ForeignKeyField('models.MavrykUser', related_name='user_operators')

    class Meta:
        table = 'mavryk_user_operator'

class MVKTransferHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    timestamp                               = fields.DatetimeField()
    mvk_token                               = fields.ForeignKeyField('models.MVKToken', related_name='mvk_transfer_history_data')
    from_                                   = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_transfer_sender')
    to_                                     = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_transfer_receiver')
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'mvk_transfer_history_data'

class MintHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    mvk_token                               = fields.ForeignKeyField('models.MVKToken', related_name='mint_history_data')
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='mint_history_data')
    timestamp                               = fields.DatetimeField()
    minted_amount                           = fields.FloatField(default=0.0)
    mvk_total_supply                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'mint_history_data'
