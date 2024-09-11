from dipdup.models import Model, fields
from .enums import FaucetRequestType

###
# MVN Faucet Tables
###

class MVNFaucet(Model):
    id                                      = fields.BigIntField(pk=True)
    address                                 = fields.CharField(max_length=36)
    network                                 = fields.CharField(max_length=51)
    mvn_token_address                       = fields.CharField(max_length=36, default="")
    fake_usdt_token_address                 = fields.CharField(max_length=36, default="")
    mvn_amount_per_user                     = fields.FloatField(default=0.0)
    fake_usdt_amount_per_user               = fields.FloatField(default=0.0)

    class Meta:
        table = 'mvn_faucet'

class MVNFaucetRequester(Model):
    id                                      = fields.BigIntField(pk=True)
    mvn_faucet                              = fields.ForeignKeyField('models.MVNFaucet', related_name='requesters')
    request_type                            = fields.IntEnumField(enum_type=FaucetRequestType)
    user                                    = fields.ForeignKeyField('models.MavenUser', related_name='mvn_faucet_requesters')
    timestamp                               = fields.DatetimeField()
    level                                   = fields.FloatField(default=0.0)

    class Meta:
        table = 'mvn_faucet_requester'
