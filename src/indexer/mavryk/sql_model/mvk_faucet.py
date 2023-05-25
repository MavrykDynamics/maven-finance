from dipdup.models import Model, fields

###
# MVK Faucet Tables
###

class MVKFaucet(Model):
    id                                      = fields.BigIntField(pk=True)
    address                                 = fields.CharField(max_length=36)
    network                                 = fields.CharField(max_length=51, index=True)
    mvk_token_address                       = fields.CharField(max_length=36, default="")
    amount_per_user                         = fields.FloatField(default=0.0)

    class Meta:
        table = 'mvk_faucet'

class MVKFaucetRequester(Model):
    id                                      = fields.BigIntField(pk=True)
    mvk_faucet                              = fields.ForeignKeyField('models.MVKFaucet', related_name='requesters', index=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='mvk_faucet_requesters', index=True)
    timestamp                               = fields.DatetimeField(index=True)
    level                                   = fields.FloatField(default=0.0)

    class Meta:
        table = 'mvk_faucet_requester'
