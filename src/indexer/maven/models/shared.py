from collections import OrderedDict
from dipdup.models import Model, fields

###
# Shared Tables
###

def token_metadata_default_value():
    return {
        "name": None,
        "symbol": None,
        "icon": None,
        "decimals": None,
        "shouldPreferSymbol": None,
        "thumbnailUri": None,
    }

class Token(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    network                                 = fields.CharField(max_length=51, index=True)
    token_address                           = fields.CharField(max_length=36, index=True)
    token_id                                = fields.SmallIntField(default=0, index=True)
    token_standard                          = fields.CharField(max_length=4, null=True, index=True)
    metadata                                = fields.JSONField(default=token_metadata_default_value, null=True)

    class Meta:
        table = 'token'

class MavenUser(Model):
    id                                      = fields.BigIntField(pk=True)
    network                                 = fields.CharField(max_length=51, index=True)
    address                                 = fields.CharField(max_length=36, index=True)
    mvn_balance                             = fields.FloatField(default=0)
    smvn_balance                            = fields.FloatField(default=0)

    class Meta:
        table = 'maven_user'

async def get_user(network: str, address: str):
    user, _ = await MavenUser.get_or_create(network=network, address=address)
    await user.save()
    return user
