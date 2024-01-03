from dipdup.models import Model, fields
from maven.models.parents import LinkedContract, MavenContract
from maven.models.enums import MintOrBurnType

###
# MVN Token Tables
###

class MVNToken(MavenContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='mvn_tokens')
    token                                   = fields.ForeignKeyField('models.Token', related_name='mvn_tokens')
    maximum_supply                          = fields.FloatField(default=0)
    total_supply                            = fields.FloatField(default=0)
    inflation_rate                          = fields.SmallIntField(default=0)
    next_inflation_timestamp                = fields.DatetimeField()

    class Meta:
        table = 'mvn_token'

class MVNTokenGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.MVNToken', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'mvn_token_general_contract'

class MVNTokenWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.MVNToken', related_name='whitelist_contracts')

    class Meta:
        table = 'mvn_token_whitelist_contract'

class MVNTokenOperator(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    mvn_token                               = fields.ForeignKeyField('models.MVNToken', related_name='operators')
    owner                                   = fields.ForeignKeyField('models.MavenUser', related_name='mvn_token_user_owners')
    operator                                = fields.ForeignKeyField('models.MavenUser', related_name='mvn_token_user_operators')

    class Meta:
        table = 'mvn_token_operator'

class MVNTokenTransferHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    timestamp                               = fields.DatetimeField()
    mvn_token                               = fields.ForeignKeyField('models.MVNToken', related_name='transfer_history_data')
    from_                                   = fields.ForeignKeyField('models.MavenUser', related_name='mvn_transfer_sender')
    to_                                     = fields.ForeignKeyField('models.MavenUser', related_name='mvn_transfer_receiver')
    amount                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'mvn_transfer_history_data'

class MVNTokenMintOrBurnHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    mvn_token                               = fields.ForeignKeyField('models.MVNToken', related_name='mint_history_data')
    user                                    = fields.ForeignKeyField('models.MavenUser', related_name='mint_history_data')
    level                                   = fields.BigIntField(default=0)
    timestamp                               = fields.DatetimeField()
    type                                    = fields.IntEnumField(enum_type=MintOrBurnType, index=True)
    amount                                  = fields.FloatField(default=0.0)
    mvn_total_supply                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'mvn_mint_or_burn_history_data'
