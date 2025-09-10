from maven.models.parents import MavenContract
from dipdup.models import Model, fields
from .enums import MTokenOperationType
from maven.models.parents import LinkedContract, ContractLambda

###
# mToken Tables
###

class MToken(MavenContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='m_tokens', index=True)
    token                                   = fields.ForeignKeyField('models.Token', related_name='m_tokens', index=True)
    loan_token_name                         = fields.CharField(max_length=36, default="", index=True)
    metadata                                = fields.JSONField(default={})
    total_supply                            = fields.FloatField(default=0.0, index=True)
    token_reward_index                      = fields.FloatField(default=0.0)
    is_scaled_token                         = fields.BooleanField(default=False, index=True)

    class Meta:
        table = 'm_token'
        indexes = [
            ("token_id", "total_supply"),
            ("governance_id", "token_id"),
            ("address", "token_id"),
            ("total_supply", "token_reward_index", "is_scaled_token"),
        ]

class MTokenLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.MToken', related_name='lambdas')

    class Meta:
        table = 'm_token_lambda'

class MTokenGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.MToken', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'm_token_general_contract'
        indexes = [
            ("contract_id", "contract_name"),
        ]

class MTokenWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.MToken', related_name='whitelist_contracts')

    class Meta:
        table = 'm_token_whitelist_contract'

class MTokenOperator(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    m_token                                 = fields.ForeignKeyField('models.MToken', related_name='operators', index=True)
    owner                                   = fields.ForeignKeyField('models.MavenUser', related_name='m_token_user_owners', index=True)
    operator                                = fields.ForeignKeyField('models.MavenUser', related_name='m_token_user_operators', index=True)

    class Meta:
        table = 'm_token_operator'
        indexes = [
            ("m_token_id", "owner_id"),
            ("m_token_id", "operator_id", "owner_id"),
        ]

class MTokenAccount(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavenUser', related_name='m_token_accounts', index=True)
    m_token                                 = fields.ForeignKeyField('models.MToken', related_name='accounts', index=True)
    balance                                 = fields.FloatField(default=0.0, index=True)
    reward_index                            = fields.FloatField(default=0.0)
    rewards_earned                          = fields.FloatField(default=0.0, index=True)

    class Meta:
        table = 'm_token_account'
        indexes = [
            ("user_id", "m_token_id"),
            ("m_token_id", "balance"),
            ("user_id", "m_token_id", "balance", "rewards_earned"),
            ("m_token_id", "balance", "rewards_earned"),
        ]

class MTokenAccountHistoryData(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    m_token_account                         = fields.ForeignKeyField('models.MTokenAccount', related_name='history_data', index=True)
    timestamp                               = fields.DatetimeField(index=True)
    level                                   = fields.BigIntField(index=True)
    operation_hash                          = fields.CharField(max_length=51)
    type                                    = fields.IntEnumField(enum_type=MTokenOperationType, index=True)
    balance                                 = fields.FloatField(default=0.0)
    reward_index                            = fields.FloatField(default=0.0)
    rewards_earned                          = fields.FloatField(default=0.0)

    class Meta:
        table = 'm_token_account_history_data'
        indexes = [
            ("m_token_account_id", "timestamp"),
            ("type", "timestamp"),
            ("timestamp", "type", "m_token_account_id"),
        ]
