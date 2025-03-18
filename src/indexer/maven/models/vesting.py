from dipdup.models import Model, fields
from maven.models.parents import LinkedContract, ContractLambda, MavenContract

###
# Vesting Tables
###

class Vesting(MavenContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='vestings', index=True)
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
    vesting                                 = fields.ForeignKeyField('models.Vesting', related_name='vestees', index=True)
    vestee                                  = fields.ForeignKeyField('models.MavenUser', related_name='vesting_vestees', index=True)
    total_allocated_amount                  = fields.FloatField(default=0)
    claim_amount_per_month                  = fields.FloatField(default=0)
    start_timestamp                         = fields.DatetimeField()
    vesting_months                          = fields.SmallIntField(default=0)
    cliff_months                            = fields.SmallIntField(default=0)
    end_cliff_timestamp                     = fields.DatetimeField()
    end_vesting_timestamp                   = fields.DatetimeField()
    locked                                  = fields.BooleanField(default=False)
    total_remainder                         = fields.FloatField(default=0, index=True)
    total_claimed                           = fields.FloatField(default=0, index=True)
    months_claimed                          = fields.SmallIntField(default=0)
    months_remaining                        = fields.SmallIntField(default=0)
    next_redemption_timestamp               = fields.DatetimeField()
    last_claimed_timestamp                  = fields.DatetimeField()

    class Meta:
        table = 'vesting_vestee'