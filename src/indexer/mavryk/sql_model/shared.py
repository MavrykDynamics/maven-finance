from tortoise import Model, fields
from mavryk.sql_model.enums import TokenType

###
# Shared Tables
###

class MavrykUser(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    mvk_balance                             = fields.FloatField(default=0)
    smvk_balance                            = fields.FloatField(default=0)

    class Meta:
        table = 'mavryk_user'

class Token(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    name                                    = fields.CharField(max_length=36, default="")
    token_id                                = fields.SmallIntField(default=0)
    type                                    = fields.IntEnumField(enum_type=TokenType, default=TokenType.OTHER)
    decimals                                = fields.SmallIntField(default=0)

    class Meta:
        table = 'token'
