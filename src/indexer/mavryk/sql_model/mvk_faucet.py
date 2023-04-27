from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, MavrykContract

###
# MVK Faucet Tables
###

class MVKFaucet(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
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
