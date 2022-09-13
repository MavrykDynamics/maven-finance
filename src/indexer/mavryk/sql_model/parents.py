from dipdup.models import Model, fields

###
# Parent classes
###

class ContractLambda():
    id                                      = fields.BigIntField(pk=True)
    last_updated_at                         = fields.DatetimeField(null=True, auto_now=True)
    lambda_name                             = fields.CharField(max_length=128, default="")
    lambda_bytes                            = fields.TextField(default="")

class LinkedContract():
    id                                      = fields.BigIntField(pk=True)
    contract_name                           = fields.CharField(max_length=36, default="")
    contract_address                        = fields.CharField(max_length=36, default="")

class MavrykContract():
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36, default="")
    last_updated_at                         = fields.DatetimeField(null=True, auto_now=True)
