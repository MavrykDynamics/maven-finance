from dipdup.models import Model, fields

###
# Parent classes
###

class ContractLambda():
    id                                      = fields.BigIntField(pk=True)
    last_updated_at                         = fields.DatetimeField(null=True)
    lambda_name                             = fields.CharField(max_length=128, default="")
    lambda_bytes                            = fields.TextField(default="")

class LinkedContract():
    id                                      = fields.BigIntField(pk=True)
    contract_address                        = fields.CharField(max_length=36, default="")

class MavenContract():
    id                                      = fields.BigIntField(pk=True, index=True)
    address                                 = fields.CharField(max_length=36, index=True)
    network                                 = fields.CharField(max_length=51, index=True)
    admin                                   = fields.CharField(max_length=36, default="", index=True)
    metadata                                = fields.JSONField(null=True)
    last_updated_at                         = fields.DatetimeField(null=True)
