from dipdup.models import Model, fields
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
