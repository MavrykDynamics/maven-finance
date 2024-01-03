from dipdup.models import Model, fields

###
# MVN Faucet Tables
###

class MVNFaucet(Model):
    id                                      = fields.BigIntField(pk=True)
    address                                 = fields.CharField(max_length=36)
    network                                 = fields.CharField(max_length=51)
    mvn_token_address                       = fields.CharField(max_length=36, default="")
    amount_per_user                         = fields.FloatField(default=0.0)

    class Meta:
        table = 'mvn_faucet'

class MVNFaucetRequester(Model):
    id                                      = fields.BigIntField(pk=True)
    mvn_faucet                              = fields.ForeignKeyField('models.MVNFaucet', related_name='requesters')
    user                                    = fields.ForeignKeyField('models.MavenUser', related_name='mvn_faucet_requesters')
    timestamp                               = fields.DatetimeField()
    level                                   = fields.FloatField(default=0.0)

    class Meta:
        table = 'mvn_faucet_requester'
