from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Vesting Tables
###

class Vesting(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='vestings')
    total_vested_amount                     = fields.BigIntField(default=0)

    class Meta:
        table = 'vesting'

class VestingLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Vesting', related_name='lambdas')

    class Meta:
        table = 'vesting_lambda'

class VestingGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Vesting', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'vesting_general_contract'

class VestingWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.Vesting', related_name='whitelist_contracts')

    class Meta:
        table = 'vesting_whitelist_contract'

class VestingVestee(Model):
    id                                      = fields.BigIntField(pk=True)
    vesting                                 = fields.ForeignKeyField('models.Vesting', related_name='vestees')
    vestee                                  = fields.ForeignKeyField('models.MavrykUser', related_name='vesting_vestees', index=True)
    total_allocated_amount                  = fields.FloatField(default=0)
    claim_amount_per_month                  = fields.FloatField(default=0)
    start_timestamp                         = fields.DatetimeField(index=True)
    vesting_months                          = fields.SmallIntField(default=0, index=True)
    cliff_months                            = fields.SmallIntField(default=0, index=True)
    end_cliff_timestamp                     = fields.DatetimeField(index=True)
    end_vesting_timestamp                   = fields.DatetimeField(index=True)
    locked                                  = fields.BooleanField(default=False, index=True)
    total_remainder                         = fields.FloatField(default=0)
    total_claimed                           = fields.FloatField(default=0)
    months_claimed                          = fields.SmallIntField(default=0)
    months_remaining                        = fields.SmallIntField(default=0)
    next_redemption_timestamp               = fields.DatetimeField(index=True)
    last_claimed_timestamp                  = fields.DatetimeField(index=True)

    class Meta:
        table = 'vesting_vestee'