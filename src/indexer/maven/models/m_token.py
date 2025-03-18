from maven.models.parents import MavenContract
from dipdup.models import Model, fields
from .enums import MTokenOperationType
from maven.models.parents import LinkedContract

###
# mToken Tables
###

class MToken(MavenContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='m_tokens')
    token                                   = fields.ForeignKeyField('models.Token', related_name='m_tokens', index=True)
    loan_token_name                         = fields.CharField(max_length=36, default="")
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
    m_token                                 = fields.ForeignKeyField('models.MToken', related_name='operators')
    owner                                   = fields.ForeignKeyField('models.MavenUser', related_name='m_token_user_owners')
    operator                                = fields.ForeignKeyField('models.MavenUser', related_name='m_token_user_operators')

    class Meta:
        table = 'm_token_operator'

class MTokenAccount(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    m_token                                 = fields.ForeignKeyField('models.MToken', related_name='accounts')
    user                                    = fields.ForeignKeyField('models.MavenUser', related_name='m_token_accounts')
    balance                                 = fields.FloatField(default=0.0, index=True)
    reward_index                            = fields.FloatField(default=0.0)
    rewards_earned                          = fields.FloatField(default=0.0)

    class Meta:
        table = 'm_token_account'

class MTokenAccountHistoryData(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    m_token_account                         = fields.ForeignKeyField('models.MTokenAccount', related_name='history_data')
    timestamp                               = fields.DatetimeField()
    level                                   = fields.BigIntField()
    operation_hash                          = fields.CharField(max_length=51)
    type                                    = fields.IntEnumField(enum_type=MTokenOperationType)
    balance                                 = fields.FloatField(default=0.0)
    reward_index                            = fields.FloatField(default=0.0)
    rewards_earned                          = fields.FloatField(default=0.0)

    class Meta:
        table = 'm_token_account_history_data'
