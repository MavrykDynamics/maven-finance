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
    token_address                           = fields.CharField(max_length=36)
    token_id                                = fields.SmallIntField(default=0)
    token_standard                          = fields.CharField(max_length=4, null=True)
    metadata                                = fields.JSONField(default=token_metadata_default_value)

    class Meta:
        table = 'token'

class MavrykUser(Model):
    id                                      = fields.BigIntField(pk=True)
    network                                 = fields.CharField(max_length=51, index=True)
    address                                 = fields.CharField(max_length=36)
    mvk_balance                             = fields.FloatField(default=0)
    smvk_balance                            = fields.FloatField(default=0)

    class Meta:
        table = 'mavryk_user'

class MavrykUserCache:
    def __init__(self, size: int = 1000) -> None:
        self._size = size
        self._mavryk_users: OrderedDict[str, MavrykUser] = OrderedDict()

    async def get(self, network: str, address: str) -> MavrykUser:
        if address not in self._mavryk_users:
            # NOTE: Already created on origination
            self._mavryk_users[address], _ = await MavrykUser.get_or_create(network=network, address=address)
            if len(self._mavryk_users) > self._size:
                self._mavryk_users.popitem(last=False)

        return self._mavryk_users[address]

    async def clear(self) -> None:
       self._mavryk_users.clear()

mavryk_user_cache = MavrykUserCache()
