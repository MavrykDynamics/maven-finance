from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Error handling tables
###

class DipdupException(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    timestamp                               = fields.DatetimeField(auto_now=True, use_tz=True)
    type                                    = fields.TextField(default="")
    value                                   = fields.TextField(default="")
    trace                                   = fields.TextField(default="")

    class Meta:
        table = 'dipdup_exception'
