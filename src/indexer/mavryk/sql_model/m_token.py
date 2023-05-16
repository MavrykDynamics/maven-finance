from mavryk.sql_model.parents import MavrykContract
from dipdup.models import Model, fields
from .enums import MTokenOperationType
from mavryk.sql_model.parents import LinkedContract

###
# mToken Tables
###

class MToken(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='m_tokens', null=True)
    token                                   = fields.ForeignKeyField('models.Token', related_name='m_tokens', index=True, null=True)
    loan_token_name                         = fields.CharField(max_length=36, default="", index=True)
    total_supply                            = fields.FloatField(default=0.0)
    token_reward_index                      = fields.FloatField(default=0.0)
    is_scaled_token                         = fields.BooleanField(default=False)

    class Meta:
        table = 'm_token'

class MTokenWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.MToken', related_name='whitelist_contracts')

    class Meta:
        table = 'm_token_whitelist_contract'

class MTokenOperator(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    m_token                                 = fields.ForeignKeyField('models.MToken', related_name='operators', index=True)
    owner                                   = fields.ForeignKeyField('models.MavrykUser', related_name='m_token_user_owners', index=True)
    operator                                = fields.ForeignKeyField('models.MavrykUser', related_name='m_token_user_operators', index=True)

    class Meta:
        table = 'm_token_operator'

class MTokenAccount(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    m_token                                 = fields.ForeignKeyField('models.MToken', related_name='accounts', index=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='m_token_accounts', index=True)
    balance                                 = fields.FloatField(default=0.0)
    reward_index                            = fields.FloatField(default=0.0)
    rewards_earned                          = fields.FloatField(default=0.0)

    class Meta:
        table = 'm_token_account'

class MTokenAccountHistoryData(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    m_token_account                         = fields.ForeignKeyField('models.MTokenAccount', related_name='history_data', index=True)
    timestamp                               = fields.DatetimeField(index=True)
    level                                   = fields.BigIntField()
    operation_hash                          = fields.CharField(max_length=51)
    type                                    = fields.IntEnumField(enum_type=MTokenOperationType, index=True)
    balance                                 = fields.FloatField(default=0.0)
    reward_index                            = fields.FloatField(default=0.0)
    rewards_earned                          = fields.FloatField(default=0.0)

    class Meta:
        table = 'm_token_account_history_data'
