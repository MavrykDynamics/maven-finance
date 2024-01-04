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
    token_id                                = fields.SmallIntField(default=0)
    token_standard                          = fields.CharField(max_length=4, null=True)
    metadata                                = fields.JSONField(default=token_metadata_default_value)

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

class MavenUserCache:
    def __init__(self, size: int = 1000) -> None:
        self._size = size
        self._maven_users: OrderedDict[str, MavenUser] = OrderedDict()

    async def get(self, network: str, address: str) -> MavenUser:
        if address not in self._maven_users:
            # NOTE: Already created on origination
            self._maven_users[address], _ = await MavenUser.get_or_create(network=network, address=address)
            if len(self._maven_users) > self._size:
                self._maven_users.popitem(last=False)

        return self._maven_users[address]

    async def clear(self) -> None:
       self._maven_users.clear()

maven_user_cache = MavenUserCache()
